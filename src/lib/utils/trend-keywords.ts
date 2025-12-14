/**
 * 트렌드 키워드 수집 함수
 */

import * as cheerio from "cheerio";
import type { TrendKeyword } from "@/lib/types/crawler";
import { getCrawlerConfig, type ValidCategory } from "@/lib/config/crawler-config";
import { logKeywordCollection, logCrawlWarn } from "./crawl-logger";

/**
 * 네이버 실시간 검색어 수집
 * @returns 실시간 검색어 배열
 */
export async function fetchNaverRealtimeKeywords(): Promise<TrendKeyword[]> {
  const keywords: TrendKeyword[] = [];

  try {
    const config = getCrawlerConfig();
    const response = await fetch("https://www.naver.com/", {
      headers: {
        "User-Agent": config.userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 네이버 실시간 검색어 추출
    $(".ah_item, .ah_k").each((index, element) => {
      const $el = $(element);
      const keywordText = $el.find(".ah_k, .ah_a").text().trim() || $el.text().trim();

      if (keywordText && keywordText.length > 1 && keywords.length < 20) {
        keywords.push({
          keyword: keywordText,
          score: 20 - index, // 순위 기반 점수
          category: "", // 카테고리는 나중에 매핑
        });
      }
    });
  } catch (error) {
    logCrawlWarn("", `네이버 실시간 검색어 수집 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  return keywords;
}

/**
 * 쿠팡 인기 검색어 수집
 * @returns 인기 검색어 배열
 */
export async function fetchCoupangTrendKeywords(): Promise<TrendKeyword[]> {
  const keywords: TrendKeyword[] = [];

  try {
    const config = getCrawlerConfig();
    const response = await fetch("https://www.coupang.com/", {
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

    // 쿠팡 인기 검색어 추출 (구조에 따라 조정 필요)
    $(".popular-keyword, .trending-keyword, [data-tracking-name='popular-keyword']").each(
      (index, element) => {
        const $el = $(element);
        const keywordText = $el.text().trim();

        if (keywordText && keywordText.length > 1 && keywords.length < 10) {
          keywords.push({
            keyword: keywordText,
            score: 10 - index,
            category: "product",
          });
        }
      }
    );
  } catch (error) {
    logCrawlWarn("product", `쿠팡 인기 검색어 수집 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  return keywords;
}

/**
 * 네이버 쇼핑 트렌드 키워드 수집
 * @returns 트렌드 키워드 배열
 */
export async function fetchNaverShoppingTrendKeywords(): Promise<TrendKeyword[]> {
  const keywords: TrendKeyword[] = [];

  try {
    const config = getCrawlerConfig();
    const response = await fetch("https://shopping.naver.com/", {
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

    // 네이버 쇼핑 트렌드 키워드 추출
    $(".trend_keyword, .popular_keyword, [data-tracking-name='trend-keyword']").each(
      (index, element) => {
        const $el = $(element);
        const keywordText = $el.text().trim();

        if (keywordText && keywordText.length > 1 && keywords.length < 10) {
          keywords.push({
            keyword: keywordText,
            score: 10 - index,
            category: "product",
          });
        }
      }
    );
  } catch (error) {
    logCrawlWarn("product", `네이버 쇼핑 트렌드 키워드 수집 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  return keywords;
}

/**
 * 네이버 부동산 인기 검색어 수집
 * @returns 인기 검색어 배열
 */
export async function fetchNaverRealEstateKeywords(): Promise<TrendKeyword[]> {
  const keywords: TrendKeyword[] = [];

  try {
    const config = getCrawlerConfig();
    const response = await fetch("https://land.naver.com/", {
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

    // 네이버 부동산 인기 검색어 추출
    $(".popular_keyword, .trend_keyword, [data-tracking-name='popular-keyword']").each(
      (index, element) => {
        const $el = $(element);
        const keywordText = $el.text().trim();

        if (keywordText && keywordText.length > 1 && keywords.length < 10) {
          keywords.push({
            keyword: keywordText,
            score: 10 - index,
            category: "real_estate",
          });
        }
      }
    );
  } catch (error) {
    logCrawlWarn("real_estate", `네이버 부동산 인기 검색어 수집 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  return keywords;
}

/**
 * 네이버 증권 인기 검색어 수집
 * @returns 인기 검색어 배열
 */
export async function fetchNaverStockKeywords(): Promise<TrendKeyword[]> {
  const keywords: TrendKeyword[] = [];

  try {
    const config = getCrawlerConfig();
    const response = await fetch("https://finance.naver.com/", {
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

    // 네이버 증권 인기 검색어 추출
    $(".popular_keyword, .trend_keyword, [data-tracking-name='popular-stock']").each(
      (index, element) => {
        const $el = $(element);
        const keywordText = $el.text().trim();

        if (keywordText && keywordText.length > 1 && keywords.length < 10) {
          keywords.push({
            keyword: keywordText,
            score: 10 - index,
            category: "stock",
          });
        }
      }
    );
  } catch (error) {
    logCrawlWarn("stock", `네이버 증권 인기 검색어 수집 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  return keywords;
}

/**
 * 네이버 뉴스 인기 검색어 수집
 * @param category - 카테고리
 * @returns 인기 검색어 배열
 */
async function fetchNaverNewsKeywords(category: ValidCategory): Promise<TrendKeyword[]> {
  const keywords: TrendKeyword[] = [];

  try {
    const categoryMap: Record<string, string> = {
      product: "생활/문화",
      real_estate: "경제",
      stock: "경제",
      blog: "생활/문화",
      shorts: "생활/문화",
      reels: "생활/문화",
    };

    const naverCategory = categoryMap[category] || "전체";
    const config = getCrawlerConfig();

    // 네이버 뉴스 메인 페이지에서 인기 검색어 수집
    const newsUrl = "https://news.naver.com/";
    const response = await fetch(newsUrl, {
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

    // 인기 검색어 추출
    $(".ranking_list li, .list_ranking li, .rank_list li").each((index, element) => {
      const $el = $(element);
      const keywordText = $el.find("a").text().trim() || $el.text().trim();

      if (keywordText && keywordText.length > 1 && keywords.length < 10) {
        keywords.push({
          keyword: keywordText,
          score: 10 - index,
          category: category,
        });
      }
    });
  } catch (error) {
    logCrawlWarn(category, `네이버 뉴스 키워드 수집 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  return keywords;
}

/**
 * 카테고리별 트렌드 키워드 수집 (통합)
 * @param category - 카테고리 (예: "product", "real_estate", "stock", "blog", "shorts", "reels")
 * @returns 트렌드 키워드 배열
 */
export async function collectTrendKeywords(category: ValidCategory): Promise<TrendKeyword[]> {
  const allKeywords: TrendKeyword[] = [];
  const keywordMap = new Map<string, TrendKeyword>();

  try {
    // 1. 네이버 실시간 검색어 수집
    const realtimeKeywords = await fetchNaverRealtimeKeywords();
    realtimeKeywords.forEach((kw) => {
      kw.category = category;
      const key = kw.keyword.toLowerCase();
      if (!keywordMap.has(key) || (keywordMap.get(key)?.score || 0) < kw.score!) {
        keywordMap.set(key, kw);
      }
    });

    // 2. 카테고리별 특화 키워드 수집
    let categoryKeywords: TrendKeyword[] = [];

    switch (category) {
      case "product":
        const coupangKeywords = await fetchCoupangTrendKeywords();
        const shoppingKeywords = await fetchNaverShoppingTrendKeywords();
        categoryKeywords = [...coupangKeywords, ...shoppingKeywords];
        break;
      case "real_estate":
        categoryKeywords = await fetchNaverRealEstateKeywords();
        break;
      case "stock":
        categoryKeywords = await fetchNaverStockKeywords();
        break;
      case "blog":
      case "shorts":
      case "reels":
        // 블로그/콘텐츠 카테고리는 네이버 뉴스에서 수집
        categoryKeywords = await fetchNaverNewsKeywords(category);
        break;
    }

    // 카테고리별 키워드 통합 (점수 가중치 적용)
    categoryKeywords.forEach((kw) => {
      const key = kw.keyword.toLowerCase();
      const existing = keywordMap.get(key);
      if (!existing) {
        keywordMap.set(key, kw);
      } else {
        // 점수 합산 (카테고리 특화 키워드는 가중치 1.5배)
        existing.score = (existing.score || 0) + (kw.score || 0) * 1.5;
      }
    });

    // 3. 네이버 뉴스 인기 검색어 수집 (보조 소스)
    const newsKeywords = await fetchNaverNewsKeywords(category);
    newsKeywords.forEach((kw) => {
      const key = kw.keyword.toLowerCase();
      const existing = keywordMap.get(key);
      if (!existing) {
        keywordMap.set(key, kw);
      } else {
        existing.score = (existing.score || 0) + (kw.score || 0) * 0.5;
      }
    });

    // 4. 키워드 정렬 및 중복 제거
    allKeywords.push(...Array.from(keywordMap.values()));

    // 점수 기준 정렬
    allKeywords.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 최대 개수 제한
    const config = getCrawlerConfig();
    const maxKeywords = config.limits.maxKeywordsPerCategory;
    const topKeywords = allKeywords.slice(0, maxKeywords);

    // 검색어가 부족한 경우 폴백 키워드 추가
    if (topKeywords.length < 5) {
      const fallbackKeywords = getFallbackKeywords(category);
      const existingKeywords = new Set(topKeywords.map((kw) => kw.keyword.toLowerCase()));
      fallbackKeywords.forEach((kw) => {
        if (!existingKeywords.has(kw.keyword.toLowerCase())) {
          topKeywords.push(kw);
        }
      });
    }

    logKeywordCollection(category, "", topKeywords.length, "multiple");

    // 키워드 정제 (불필요한 문자 제거)
    return topKeywords.map((kw) => ({
      ...kw,
      keyword: kw.keyword.replace(/[^\w\s가-힣]/g, "").trim(),
    }));
  } catch (error) {
    logCrawlWarn(category, `키워드 수집 실패: ${error instanceof Error ? error.message : String(error)}`);
    // 에러 발생 시 기본 키워드 반환
    return getFallbackKeywords(category);
  }
}

/**
 * 카테고리별 기본 키워드 반환 (폴백용)
 * @param category - 카테고리
 * @returns 기본 키워드 배열
 */
function getFallbackKeywords(category: string): TrendKeyword[] {
  const fallbackMap: Record<string, string[]> = {
    product: ["신제품", "트렌드", "인기 상품", "베스트", "할인"],
    real_estate: ["부동산", "아파트", "전세", "매매", "부동산 시장"],
    stock: ["주식", "증시", "코스피", "코스닥", "투자"],
    blog: ["블로그", "콘텐츠", "SNS", "인플루언서", "트렌드"],
    shorts: ["숏츠", "영상", "콘텐츠", "바이럴", "트렌드"],
    reels: ["릴스", "인스타그램", "영상", "콘텐츠", "트렌드"],
  };

  const keywords = fallbackMap[category] || ["트렌드", "인기", "최신", "화제", "이슈"];

  return keywords.map((keyword, index) => ({
    keyword,
    score: 5 - index,
    category,
  }));
}

/**
 * 트렌드 패키지 제목 생성
 * @param keywords - 트렌드 키워드 배열
 * @param category - 카테고리
 * @returns 생성된 제목
 */
export function generateTrendPackTitle(keywords: TrendKeyword[], category: string): string {
  if (keywords.length === 0) {
    return getDefaultTitle(category);
  }

  // 상위 2-3개 키워드를 조합하여 제목 생성
  const topKeywords = keywords
    .slice(0, 3)
    .map((kw) => kw.keyword)
    .filter((kw) => kw.length > 1);

  if (topKeywords.length === 0) {
    return getDefaultTitle(category);
  }

  // 키워드 조합
  if (topKeywords.length === 1) {
    return `${topKeywords[0]} 트렌드`;
  } else if (topKeywords.length === 2) {
    return `${topKeywords[0]}, ${topKeywords[1]} 트렌드`;
  } else {
    return `${topKeywords[0]}, ${topKeywords[1]} 등 트렌드`;
  }
}

/**
 * 카테고리별 기본 제목 반환
 * @param category - 카테고리
 * @returns 기본 제목
 */
function getDefaultTitle(category: string): string {
  const titleMap: Record<string, string> = {
    product: "상품 트렌드",
    real_estate: "부동산 트렌드",
    stock: "주식 시장 트렌드",
    blog: "콘텐츠 트렌드",
    shorts: "숏츠 콘텐츠 트렌드",
    reels: "릴스 콘텐츠 트렌드",
  };

  return titleMap[category] || "주간 트렌드";
}

/**
 * 트렌드 패키지 요약 생성
 * @param keywords - 트렌드 키워드 배열
 * @param itemsCount - 수집된 아이템 수
 * @returns 생성된 요약
 */
export function generateTrendPackSummary(
  keywords: TrendKeyword[],
  itemsCount: number
): string {
  if (keywords.length === 0) {
    return `이번 주 주요 트렌드 정보를 ${itemsCount}개의 자료로 정리했습니다.`;
  }

  const topKeywords = keywords.slice(0, 3).map((kw) => kw.keyword);
  const keywordText = topKeywords.join(", ");

  return `${keywordText} 등 이번 주 주요 트렌드를 ${itemsCount}개의 자료로 정리했습니다. 최신 동향과 인사이트를 확인하세요.`;
}
