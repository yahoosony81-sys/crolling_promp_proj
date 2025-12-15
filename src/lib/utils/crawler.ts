/**
 * 크롤링 유틸리티 함수
 */

import * as cheerio from "cheerio";
import type { ScrapedItemData, CrawlConfig } from "@/lib/types/crawler";
import { getCrawlerConfig, getSourcesForCategory, type ValidCategory } from "@/lib/config/crawler-config";
import { canRetryError, classifyError, logCrawlWarn, logCrawlError } from "./crawl-logger";

/**
 * 재시도 로직 (Exponential Backoff)
 * @param fn - 실행할 함수
 * @param maxRetries - 최대 재시도 횟수
 * @param delay - 초기 딜레이 (ms)
 * @returns 함수 실행 결과
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 재시도 불가능한 에러면 즉시 throw
      if (!canRetryError(error)) {
        throw error;
      }

      // 마지막 시도면 에러 throw
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: delay * 2^attempt
      const backoffDelay = delay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
}

/**
 * 타임아웃이 있는 fetch 요청
 * @param url - 요청 URL
 * @param options - fetch 옵션
 * @param timeout - 타임아웃 (ms)
 * @returns Response 객체
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * 네이버 뉴스 검색 결과 크롤링
 * @param keyword - 검색 키워드
 * @param category - 카테고리 (예: "정치", "경제", "사회", "생활/문화", "IT/과학", "세계")
 * @param limit - 가져올 결과 수 (기본값: 10)
 * @returns 크롤링된 뉴스 아이템 배열
 */
export async function fetchNaverNews(
  keyword: string,
  category: string = "",
  limit: number = 10
): Promise<ScrapedItemData[]> {
  const items: ScrapedItemData[] = [];
  const config = getCrawlerConfig();
  
  try {
    return await retryWithBackoff(async () => {
      // 네이버 뉴스 검색 URL 구성
      const searchUrl = new URL("https://search.naver.com/search.naver");
      searchUrl.searchParams.set("where", "news");
      searchUrl.searchParams.set("query", keyword);
      if (category) {
        searchUrl.searchParams.set("sm", "JFR");
      }
      searchUrl.searchParams.set("start", "1");
      searchUrl.searchParams.set("display", limit.toString());

      // User-Agent 설정 (크롤링 정책 준수)
      const response = await fetchWithTimeout(
        searchUrl.toString(),
        {
          headers: {
            "User-Agent": config.userAgent,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          },
        },
        config.rateLimit.timeout
      );

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        const errorInfo = classifyError(error);
        if (!errorInfo.retryable) {
          throw error;
        }
        throw error;
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const fetchedItems: ScrapedItemData[] = [];

      // 네이버 뉴스 검색 결과 파싱
      $(".news_wrap").each((index, element) => {
        if (fetchedItems.length >= limit) return false;

        const $el = $(element);
        const titleEl = $el.find(".news_tit");
        const title = titleEl.text().trim();
        const url = titleEl.attr("href") || "";
        const summaryEl = $el.find(".news_dsc");
        const summary = summaryEl.text().trim();
        const sourceEl = $el.find(".press");
        const sourceDomain = extractDomain(url) || sourceEl.text().trim() || "naver.com";

        if (title && url && summary) {
          fetchedItems.push({
            source_domain: sourceDomain,
            source_type: "news",
            url: url,
            title: title,
            summary: summary.substring(0, 500), // 요약 길이 제한
            tags: extractTags(title, summary),
            extracted_data: {
              source: sourceEl.text().trim(),
              date: $el.find(".info").text().trim(),
            },
          });
        }
      });

      // 각 뉴스 기사 상세 정보 크롤링 (선택적)
      for (const item of fetchedItems.slice(0, Math.min(5, fetchedItems.length))) {
        try {
          const articleData = await parseNewsArticle(item.url);
          if (articleData) {
            item.summary = articleData.summary || item.summary;
            item.tags = [...new Set([...item.tags, ...articleData.tags])];
          }
        } catch (error) {
          logCrawlWarn("", `Failed to parse article ${item.url}: ${error instanceof Error ? error.message : String(error)}`);
          // 상세 파싱 실패해도 기본 정보는 유지
        }
      }

      return fetchedItems;
    }, config.rateLimit.maxRetries, config.rateLimit.retryDelay);
  } catch (error) {
    const errorInfo = classifyError(error);
    logCrawlError("", `Error fetching Naver news: ${errorInfo.message}`, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * 뉴스 기사 HTML 파싱
 * @param url - 뉴스 기사 URL
 * @returns 파싱된 기사 데이터 (제목, 본문, 요약)
 */
export async function parseNewsArticle(
  url: string
): Promise<{ summary: string; tags: string[] } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 네이버 뉴스 기사 본문 추출
    let content = "";
    const contentSelectors = [
      "#articleBodyContents",
      ".article_body",
      ".article-body",
      "#articleBody",
      ".news_end_body",
    ];

    for (const selector of contentSelectors) {
      const contentEl = $(selector);
      if (contentEl.length > 0) {
        content = contentEl.text().trim();
        break;
      }
    }

    if (!content) {
      return null;
    }

    // 불필요한 텍스트 제거 (광고, 스크립트 등)
    content = content
      .replace(/\/\/.*/g, "") // 주석 제거
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // 스크립트 제거
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // 스타일 제거
      .replace(/\s+/g, " ") // 연속 공백 제거
      .trim();

    const summary = extractSummary(content, 300);
    const tags = extractTags("", content);

    return { summary, tags };
  } catch (error) {
    console.error(`Error parsing article ${url}:`, error);
    return null;
  }
}

/**
 * 간단한 텍스트 요약 추출
 * @param content - 원본 텍스트
 * @param maxLength - 최대 길이 (기본값: 200)
 * @returns 요약된 텍스트
 */
export function extractSummary(content: string, maxLength: number = 200): string {
  if (!content) return "";

  // 첫 문단 추출
  const firstParagraph = content.split(/\n\n|\.\s+/)[0]?.trim() || content;

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  // 최대 길이까지 자르고 마지막 문장 완성
  let summary = firstParagraph.substring(0, maxLength);
  const lastPeriod = summary.lastIndexOf(".");
  const lastSpace = summary.lastIndexOf(" ");

  if (lastPeriod > maxLength * 0.7) {
    summary = summary.substring(0, lastPeriod + 1);
  } else if (lastSpace > maxLength * 0.7) {
    summary = summary.substring(0, lastSpace) + "...";
  } else {
    summary = summary.substring(0, maxLength) + "...";
  }

  return summary;
}

/**
 * 텍스트에서 태그/키워드 추출
 * @param title - 제목
 * @param content - 본문
 * @returns 추출된 태그 배열
 */
export function extractTags(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const tags: string[] = [];

  // 일반적인 키워드 패턴 추출 (한글 단어 2-4자)
  const keywordPattern = /[가-힣]{2,4}/g;
  const matches = text.match(keywordPattern) || [];

  // 빈도수 계산
  const frequency: Record<string, number> = {};
  matches.forEach((word) => {
    // 불필요한 단어 필터링
    const stopWords = [
      "것이",
      "것을",
      "것을",
      "것으로",
      "것이다",
      "것입니다",
      "그리고",
      "그런데",
      "그러나",
      "이것",
      "저것",
      "그것",
      "이런",
      "저런",
      "그런",
      "이번",
      "저번",
      "그때",
      "오늘",
      "어제",
      "내일",
      "지금",
      "여기",
      "저기",
      "거기",
    ];

    if (!stopWords.includes(word) && word.length >= 2) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  // 빈도수 상위 5개 추출
  const sortedTags = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return sortedTags;
}

/**
 * URL에서 도메인 추출
 * @param url - URL 문자열
 * @returns 도메인 (예: "naver.com")
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * 크롤링된 데이터 검증
 * @param item - 검증할 아이템
 * @returns 검증 결과 (true: 유효, false: 무효)
 */
export function validateScrapedData(item: ScrapedItemData): boolean {
  // 필수 필드 검증
  if (!item.title || item.title.trim().length < 5) {
    return false;
  }

  if (!item.url || !isValidUrl(item.url)) {
    return false;
  }

  if (!item.summary || item.summary.trim().length < 10) {
    return false;
  }

  if (!item.source_domain || item.source_domain.trim().length === 0) {
    return false;
  }

  // 텍스트 길이 검증 (너무 짧거나 긴 경우 필터링)
  if (item.title.length > 200) {
    return false;
  }

  if (item.summary.length > 1000) {
    return false;
  }

  return true;
}

/**
 * URL 형식 검증
 * @param url - 검증할 URL
 * @returns 유효한 URL인지 여부
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * 중복 URL 체크 (같은 pack_id 내에서)
 * @param url - 체크할 URL
 * @param packId - 패키지 ID
 * @param existingUrls - 기존 URL 목록 (캐시용)
 * @returns 중복 여부 (true: 중복, false: 중복 아님)
 */
export function checkDuplicateUrl(
  url: string,
  packId: string,
  existingUrls: Set<string>
): boolean {
  return existingUrls.has(`${packId}:${url}`);
}

/**
 * 쿠팡 상품 검색 결과 크롤링
 * @param keyword - 검색 키워드
 * @param limit - 가져올 결과 수 (기본값: 10)
 * @returns 크롤링된 상품 아이템 배열
 */
export async function fetchCoupangProducts(
  keyword: string,
  limit: number = 10
): Promise<ScrapedItemData[]> {
  const items: ScrapedItemData[] = [];

  try {
    const config = getCrawlerConfig();
    const searchUrl = new URL("https://www.coupang.com/np/search");
    searchUrl.searchParams.set("q", keyword);
    searchUrl.searchParams.set("page", "1");
    searchUrl.searchParams.set("listSize", limit.toString());

    const response = await fetch(searchUrl.toString(), {
      headers: {
        "User-Agent": config.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 쿠팡 상품 검색 결과 파싱
    $(".search-product, .baby-product, [data-product-id]").each((index, element) => {
      if (items.length >= limit) return false;

      const $el = $(element);
      const titleEl = $el.find(".name, .product-name");
      const title = titleEl.text().trim();
      const urlEl = $el.find("a").first();
      const url = urlEl.attr("href") || "";
      const priceEl = $el.find(".price-value, .price");
      const price = priceEl.text().trim();
      const ratingEl = $el.find(".rating, .star-rating");
      const rating = ratingEl.text().trim();

      if (title && url) {
        const fullUrl = url.startsWith("http") ? url : `https://www.coupang.com${url}`;
        items.push({
          source_domain: "coupang.com",
          source_type: "market",
          url: fullUrl,
          title: title,
          summary: `${title} - ${price ? `가격: ${price}` : ""} ${rating ? `평점: ${rating}` : ""}`.trim(),
          tags: extractTags(title, ""),
          extracted_data: {
            price,
            rating,
            source: "coupang",
          },
        });
      }
    });
  } catch (error) {
    console.error("Error fetching Coupang products:", error);
    throw error;
  }

  return items;
}

/**
 * 네이버 쇼핑 검색 결과 크롤링
 * @param keyword - 검색 키워드
 * @param limit - 가져올 결과 수 (기본값: 10)
 * @returns 크롤링된 상품 아이템 배열
 */
export async function fetchNaverShopping(
  keyword: string,
  limit: number = 10
): Promise<ScrapedItemData[]> {
  const items: ScrapedItemData[] = [];

  try {
    const config = getCrawlerConfig();
    const searchUrl = new URL("https://shopping.naver.com/search/all");
    searchUrl.searchParams.set("query", keyword);
    searchUrl.searchParams.set("pagingIndex", "1");
    searchUrl.searchParams.set("pagingSize", limit.toString());

    const response = await fetch(searchUrl.toString(), {
      headers: {
        "User-Agent": config.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 네이버 쇼핑 검색 결과 파싱
    $(".product_item, .productList_item, [data-product-id]").each((index, element) => {
      if (items.length >= limit) return false;

      const $el = $(element);
      const titleEl = $el.find(".product_title, .productName");
      const title = titleEl.text().trim();
      const urlEl = $el.find("a").first();
      const url = urlEl.attr("href") || "";
      const priceEl = $el.find(".price, .product_price");
      const price = priceEl.text().trim();

      if (title && url) {
        const fullUrl = url.startsWith("http") ? url : `https://shopping.naver.com${url}`;
        items.push({
          source_domain: "shopping.naver.com",
          source_type: "market",
          url: fullUrl,
          title: title,
          summary: `${title} - ${price ? `가격: ${price}` : ""}`.trim(),
          tags: extractTags(title, ""),
          extracted_data: {
            price,
            source: "naver_shopping",
          },
        });
      }
    });
  } catch (error) {
    console.error("Error fetching Naver shopping:", error);
    throw error;
  }

  return items;
}

/**
 * 네이버 부동산 매물 크롤링
 * @param keyword - 검색 키워드
 * @param limit - 가져올 결과 수 (기본값: 10)
 * @returns 크롤링된 부동산 아이템 배열
 */
export async function fetchNaverRealEstate(
  keyword: string,
  limit: number = 10
): Promise<ScrapedItemData[]> {
  const items: ScrapedItemData[] = [];

  try {
    const config = getCrawlerConfig();
    const searchUrl = new URL("https://land.naver.com/article/searchList.naver");
    searchUrl.searchParams.set("query", keyword);
    searchUrl.searchParams.set("page", "1");

    const response = await fetch(searchUrl.toString(), {
      headers: {
        "User-Agent": config.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 네이버 부동산 매물 파싱
    $(".item_list, .article_item, [data-article-id]").each((index, element) => {
      if (items.length >= limit) return false;

      const $el = $(element);
      const titleEl = $el.find(".item_title, .article_title");
      const title = titleEl.text().trim();
      const urlEl = $el.find("a").first();
      const url = urlEl.attr("href") || "";
      const priceEl = $el.find(".price, .item_price");
      const price = priceEl.text().trim();
      const locationEl = $el.find(".location, .item_location");
      const location = locationEl.text().trim();

      if (title && url) {
        const fullUrl = url.startsWith("http") ? url : `https://land.naver.com${url}`;
        items.push({
          source_domain: "land.naver.com",
          source_type: "listing",
          url: fullUrl,
          title: title,
          summary: `${title} - ${location ? `위치: ${location}` : ""} ${price ? `가격: ${price}` : ""}`.trim(),
          tags: extractTags(title, location),
          extracted_data: {
            price,
            location,
            source: "naver_real_estate",
          },
        });
      }
    });
  } catch (error) {
    console.error("Error fetching Naver real estate:", error);
    throw error;
  }

  return items;
}

/**
 * 네이버 증권 뉴스/정보 크롤링
 * @param keyword - 검색 키워드
 * @param limit - 가져올 결과 수 (기본값: 10)
 * @returns 크롤링된 증권 아이템 배열
 */
export async function fetchNaverStock(
  keyword: string,
  limit: number = 10
): Promise<ScrapedItemData[]> {
  const items: ScrapedItemData[] = [];

  try {
    const config = getCrawlerConfig();
    const searchUrl = new URL("https://finance.naver.com/news/news_search.naver");
    searchUrl.searchParams.set("query", keyword);
    searchUrl.searchParams.set("page", "1");

    const response = await fetch(searchUrl.toString(), {
      headers: {
        "User-Agent": config.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 네이버 증권 뉴스 파싱
    $(".article, .news_item, [data-article-id]").each((index, element) => {
      if (items.length >= limit) return false;

      const $el = $(element);
      const titleEl = $el.find(".article_title, .title");
      const title = titleEl.text().trim();
      const urlEl = $el.find("a").first();
      const url = urlEl.attr("href") || "";
      const summaryEl = $el.find(".article_summary, .summary");
      const summary = summaryEl.text().trim();

      if (title && url) {
        const fullUrl = url.startsWith("http") ? url : `https://finance.naver.com${url}`;
        items.push({
          source_domain: "finance.naver.com",
          source_type: "news",
          url: fullUrl,
          title: title,
          summary: summary || title,
          tags: extractTags(title, summary),
          extracted_data: {
            source: "naver_stock",
          },
        });
      }
    });
  } catch (error) {
    console.error("Error fetching Naver stock:", error);
    throw error;
  }

  return items;
}

/**
 * 네이버 블로그 포스트 크롤링
 * @param keyword - 검색 키워드
 * @param limit - 가져올 결과 수 (기본값: 10)
 * @returns 크롤링된 블로그 아이템 배열
 */
export async function fetchNaverBlog(
  keyword: string,
  limit: number = 10
): Promise<ScrapedItemData[]> {
  const items: ScrapedItemData[] = [];

  try {
    const config = getCrawlerConfig();
    const searchUrl = new URL("https://search.naver.com/search.naver");
    searchUrl.searchParams.set("where", "post");
    searchUrl.searchParams.set("query", keyword);
    searchUrl.searchParams.set("start", "1");
    searchUrl.searchParams.set("display", limit.toString());

    const response = await fetch(searchUrl.toString(), {
      headers: {
        "User-Agent": config.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 네이버 블로그 검색 결과 파싱
    $(".sh_blog_top, .api_subject_bx, .sh_blog_title").each((index, element) => {
      if (items.length >= limit) return false;

      const $el = $(element);
      const titleEl = $el.find("a");
      const title = titleEl.text().trim();
      const url = titleEl.attr("href") || "";
      const summaryEl = $el.find(".sh_blog_passage, .api_txt_lines");
      const summary = summaryEl.text().trim();

      if (title && url) {
        items.push({
          source_domain: extractDomain(url) || "blog.naver.com",
          source_type: "blog",
          url: url,
          title: title,
          summary: summary || title,
          tags: extractTags(title, summary),
          extracted_data: {
            source: "naver_blog",
          },
        });
      }
    });
  } catch (error) {
    console.error("Error fetching Naver blog:", error);
    throw error;
  }

  return items;
}

/**
 * 카테고리에 따라 적절한 크롤러 함수 자동 선택 및 실행
 * @param category - 카테고리
 * @param keyword - 검색 키워드
 * @param limit - 가져올 결과 수
 * @returns 크롤링된 아이템 배열
 */
export async function crawlByCategory(
  category: string,
  keyword: string,
  limit: number = 10
): Promise<ScrapedItemData[]> {
  const config = getCrawlerConfig();
  const sources = getSourcesForCategory(category as ValidCategory);
  const allItems: ScrapedItemData[] = [];
  const urlSet = new Set<string>();

  // 각 소스에서 크롤링
  for (const source of sources) {
    try {
      let items: ScrapedItemData[] = [];

      switch (source) {
        case "naver_news":
          items = await fetchNaverNews(keyword, "", limit);
          break;
        case "naver_shopping":
          items = await fetchNaverShopping(keyword, limit);
          break;
        case "coupang":
          items = await fetchCoupangProducts(keyword, limit);
          break;
        case "naver_real_estate":
          items = await fetchNaverRealEstate(keyword, limit);
          break;
        case "naver_stock":
          items = await fetchNaverStock(keyword, limit);
          break;
        case "naver_blog":
          items = await fetchNaverBlog(keyword, limit);
          break;
        default:
          items = await fetchNaverNews(keyword, "", limit);
      }

      // 중복 제거 및 통합
      items.forEach((item) => {
        if (!urlSet.has(item.url)) {
          urlSet.add(item.url);
          allItems.push(item);
        }
      });

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, config.rateLimit.delayBetweenRequests));
    } catch (error) {
      console.warn(`Failed to crawl from ${source}:`, error);
      // 한 소스 실패해도 다른 소스 계속 시도
    }
  }

  return allItems.slice(0, limit);
}

