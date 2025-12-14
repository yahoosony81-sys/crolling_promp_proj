/**
 * 데이터 가공 로직
 */

import * as cheerio from "cheerio";
import type { ScrapedItemData } from "@/lib/types/crawler";

/**
 * 상품 데이터 추출
 * @param html - HTML 문자열
 * @returns 추출된 상품 데이터
 */
export function extractProductData(html: string): Record<string, unknown> {
  const $ = cheerio.load(html);
  const data: Record<string, unknown> = {};

  // 상품명
  const productName = $(".product-name, .name, [data-product-name]").first().text().trim();
  if (productName) data.productName = productName;

  // 가격
  const priceText = $(".price, .price-value, [data-price]").first().text().trim();
  const priceMatch = priceText.match(/[\d,]+/);
  if (priceMatch) {
    data.price = parseInt(priceMatch[0].replace(/,/g, ""), 10);
    data.priceText = priceText;
  }

  // 리뷰 수
  const reviewText = $(".review-count, .review, [data-review-count]").first().text().trim();
  const reviewMatch = reviewText.match(/[\d,]+/);
  if (reviewMatch) {
    data.reviewCount = parseInt(reviewMatch[0].replace(/,/g, ""), 10);
  }

  // 평점
  const ratingText = $(".rating, .star-rating, [data-rating]").first().text().trim();
  const ratingMatch = ratingText.match(/[\d.]+/);
  if (ratingMatch) {
    data.rating = parseFloat(ratingMatch[0]);
  }

  // 이미지 URL
  const imageUrl = $(".product-image img, .thumbnail img").first().attr("src") || "";
  if (imageUrl) data.imageUrl = imageUrl;

  return data;
}

/**
 * 부동산 데이터 추출
 * @param html - HTML 문자열
 * @returns 추출된 부동산 데이터
 */
export function extractRealEstateData(html: string): Record<string, unknown> {
  const $ = cheerio.load(html);
  const data: Record<string, unknown> = {};

  // 매물 유형
  const type = $(".property-type, .item-type, [data-property-type]").first().text().trim();
  if (type) data.type = type;

  // 가격
  const priceText = $(".price, .item-price, [data-price]").first().text().trim();
  if (priceText) {
    data.priceText = priceText;
    const priceMatch = priceText.match(/[\d,]+/);
    if (priceMatch) {
      data.price = parseInt(priceMatch[0].replace(/,/g, ""), 10);
    }
  }

  // 위치
  const location = $(".location, .item-location, [data-location]").first().text().trim();
  if (location) data.location = location;

  // 면적
  const areaText = $(".area, .size, [data-area]").first().text().trim();
  const areaMatch = areaText.match(/[\d.]+/);
  if (areaMatch) {
    data.area = parseFloat(areaMatch[0]);
    data.areaText = areaText;
  }

  // 층수
  const floorText = $(".floor, [data-floor]").first().text().trim();
  const floorMatch = floorText.match(/[\d]+/);
  if (floorMatch) {
    data.floor = parseInt(floorMatch[0], 10);
  }

  return data;
}

/**
 * 주식 데이터 추출
 * @param html - HTML 문자열
 * @returns 추출된 주식 데이터
 */
export function extractStockData(html: string): Record<string, unknown> {
  const $ = cheerio.load(html);
  const data: Record<string, unknown> = {};

  // 주가
  const priceText = $(".stock-price, .price, [data-price]").first().text().trim();
  const priceMatch = priceText.match(/[\d,]+/);
  if (priceMatch) {
    data.price = parseInt(priceMatch[0].replace(/,/g, ""), 10);
    data.priceText = priceText;
  }

  // 등락률
  const changeText = $(".change-rate, .change, [data-change-rate]").first().text().trim();
  const changeMatch = changeText.match(/[+-]?[\d.]+/);
  if (changeMatch) {
    data.changeRate = parseFloat(changeMatch[0]);
    data.changeText = changeText;
  }

  // 거래량
  const volumeText = $(".volume, [data-volume]").first().text().trim();
  const volumeMatch = volumeText.match(/[\d,]+/);
  if (volumeMatch) {
    data.volume = parseInt(volumeMatch[0].replace(/,/g, ""), 10);
  }

  // 시가총액
  const marketCapText = $(".market-cap, [data-market-cap]").first().text().trim();
  if (marketCapText) data.marketCapText = marketCapText;

  return data;
}

/**
 * 블로그 데이터 추출
 * @param html - HTML 문자열
 * @returns 추출된 블로그 데이터
 */
export function extractBlogData(html: string): Record<string, unknown> {
  const $ = cheerio.load(html);
  const data: Record<string, unknown> = {};

  // 조회수
  const viewText = $(".view-count, .views, [data-views]").first().text().trim();
  const viewMatch = viewText.match(/[\d,]+/);
  if (viewMatch) {
    data.viewCount = parseInt(viewMatch[0].replace(/,/g, ""), 10);
  }

  // 좋아요 수
  const likeText = $(".like-count, .likes, [data-likes]").first().text().trim();
  const likeMatch = likeText.match(/[\d,]+/);
  if (likeMatch) {
    data.likeCount = parseInt(likeMatch[0].replace(/,/g, ""), 10);
  }

  // 댓글 수
  const commentText = $(".comment-count, .comments, [data-comments]").first().text().trim();
  const commentMatch = commentText.match(/[\d,]+/);
  if (commentMatch) {
    data.commentCount = parseInt(commentMatch[0].replace(/,/g, ""), 10);
  }

  // 작성일
  const dateText = $(".date, .published-date, [data-date]").first().text().trim();
  if (dateText) data.date = dateText;

  return data;
}

/**
 * 구조화된 데이터 추출 (카테고리별 자동 선택)
 * @param html - HTML 문자열
 * @param category - 카테고리
 * @returns 추출된 구조화된 데이터
 */
export function extractStructuredData(
  html: string,
  category: string
): Record<string, unknown> {
  switch (category) {
    case "product":
      return extractProductData(html);
    case "real_estate":
      return extractRealEstateData(html);
    case "stock":
      return extractStockData(html);
    case "blog":
    case "shorts":
    case "reels":
      return extractBlogData(html);
    default:
      return {};
  }
}

/**
 * 데이터 품질 점수 계산
 * @param item - 스크랩된 아이템
 * @returns 품질 점수 (0-100)
 */
export function calculateQualityScore(item: ScrapedItemData): number {
  let score = 0;

  // 제목 길이 (5-200자: 20점)
  if (item.title && item.title.length >= 5 && item.title.length <= 200) {
    score += 20;
  } else if (item.title && item.title.length > 0) {
    score += 10;
  }

  // 요약 품질 (10-1000자: 30점)
  if (item.summary && item.summary.length >= 10 && item.summary.length <= 1000) {
    score += 30;
  } else if (item.summary && item.summary.length > 0) {
    score += 15;
  }

  // URL 유효성 (20점)
  if (item.url && item.url.startsWith("http")) {
    score += 20;
  }

  // 도메인 존재 (10점)
  if (item.source_domain && item.source_domain.length > 0) {
    score += 10;
  }

  // 태그 존재 (10점)
  if (item.tags && item.tags.length > 0) {
    score += 10;
  }

  // 구조화된 데이터 존재 (10점)
  if (item.extracted_data && Object.keys(item.extracted_data).length > 0) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * 카테고리별 요약 템플릿 적용
 * @param item - 스크랩된 아이템
 * @param category - 카테고리
 * @returns 개선된 요약
 */
export function applyCategorySummaryTemplate(
  item: ScrapedItemData,
  category: string
): string {
  const extracted = item.extracted_data || {};

  switch (category) {
    case "product": {
      const price = extracted.priceText || extracted.price;
      const rating = extracted.rating;
      const reviewCount = extracted.reviewCount;
      const parts = [item.title];
      if (price) parts.push(`가격: ${price}`);
      if (rating) parts.push(`평점: ${rating}`);
      if (reviewCount) parts.push(`리뷰: ${reviewCount}개`);
      return parts.join(" | ");
    }
    case "real_estate": {
      const price = extracted.priceText || extracted.price;
      const location = extracted.location;
      const area = extracted.areaText || extracted.area;
      const parts = [item.title];
      if (location) parts.push(`위치: ${location}`);
      if (price) parts.push(`가격: ${price}`);
      if (area) parts.push(`면적: ${area}`);
      return parts.join(" | ");
    }
    case "stock": {
      const price = extracted.priceText || extracted.price;
      const changeRate = extracted.changeRate;
      const parts = [item.title];
      if (price) parts.push(`주가: ${price}`);
      if (changeRate !== undefined) {
        const sign = changeRate >= 0 ? "+" : "";
        parts.push(`등락률: ${sign}${changeRate}%`);
      }
      return parts.join(" | ");
    }
    case "blog":
    case "shorts":
    case "reels": {
      const viewCount = extracted.viewCount;
      const likeCount = extracted.likeCount;
      const parts = [item.title];
      if (viewCount) parts.push(`조회수: ${viewCount.toLocaleString()}`);
      if (likeCount) parts.push(`좋아요: ${likeCount.toLocaleString()}`);
      return parts.join(" | ");
    }
    default:
      return item.summary || item.title;
  }
}

