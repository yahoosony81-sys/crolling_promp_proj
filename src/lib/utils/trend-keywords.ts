/**
 * 트렌드 키워드 수집 함수
 */

import * as cheerio from "cheerio";
import type { TrendKeyword } from "@/lib/types/crawler";

/**
 * 카테고리별 트렌드 키워드 수집
 * @param category - 카테고리 (예: "product", "real_estate", "stock", "blog", "shorts", "reels")
 * @returns 트렌드 키워드 배열
 */
export async function collectTrendKeywords(category: string): Promise<TrendKeyword[]> {
  const keywords: TrendKeyword[] = [];

  try {
    // 카테고리별 네이버 뉴스 인기 검색어 크롤링
    const categoryMap: Record<string, string> = {
      product: "생활/문화",
      real_estate: "경제",
      stock: "경제",
      blog: "생활/문화",
      shorts: "생활/문화",
      reels: "생활/문화",
    };

    const naverCategory = categoryMap[category] || "전체";

    // 네이버 뉴스 메인 페이지에서 인기 검색어 수집
    const newsUrl = "https://news.naver.com/";
    const response = await fetch(newsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 인기 검색어 추출 (네이버 뉴스 메인 페이지 구조에 따라 조정 필요)
    $(".ranking_list li, .list_ranking li, .rank_list li").each((index, element) => {
      const $el = $(element);
      const keywordText = $el.find("a").text().trim() || $el.text().trim();

      if (keywordText && keywordText.length > 1 && keywords.length < 10) {
        keywords.push({
          keyword: keywordText,
          score: 10 - index, // 순위 기반 점수
          category: category,
        });
      }
    });

    // 검색어가 부족한 경우 카테고리별 검색어 생성
    if (keywords.length < 5) {
      const fallbackKeywords = getFallbackKeywords(category);
      keywords.push(...fallbackKeywords.slice(0, 5 - keywords.length));
    }

    // 키워드 정제 (불필요한 문자 제거)
    return keywords.map((kw) => ({
      ...kw,
      keyword: kw.keyword.replace(/[^\w\s가-힣]/g, "").trim(),
    }));
  } catch (error) {
    console.error("Error collecting trend keywords:", error);
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

