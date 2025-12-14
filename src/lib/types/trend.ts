import type { Database } from "./database";

/**
 * 트렌드 관련 타입 정의
 */

/**
 * 트렌드 패키지 Row 타입
 */
export type TrendPack = Database["public"]["Tables"]["trend_packs"]["Row"];

/**
 * 트렌드 패키지 Insert 타입
 */
export type TrendPackInsert = Database["public"]["Tables"]["trend_packs"]["Insert"];

/**
 * 트렌드 패키지 Update 타입
 */
export type TrendPackUpdate = Database["public"]["Tables"]["trend_packs"]["Update"];

/**
 * 스크랩된 아이템 Row 타입
 */
export type ScrapedItem = Database["public"]["Tables"]["scraped_items"]["Row"];

/**
 * 스크랩된 아이템 Insert 타입
 */
export type ScrapedItemInsert = Database["public"]["Tables"]["scraped_items"]["Insert"];

/**
 * 스크랩된 아이템 Update 타입
 */
export type ScrapedItemUpdate = Database["public"]["Tables"]["scraped_items"]["Update"];

/**
 * 트렌드 카테고리 타입
 */
export type TrendCategory =
  | "product"
  | "real_estate"
  | "stock"
  | "blog"
  | "shorts"
  | "reels";

/**
 * 트렌드 패키지 상태 타입
 */
export type TrendPackStatus = "draft" | "published" | "archived";

/**
 * Week Key 타입 (예: "2025-W50")
 */
export type WeekKey = string;

/**
 * 트렌드 카테고리 정보 인터페이스
 */
export interface TrendCategoryInfo {
  value: TrendCategory;
  label: string;
  description?: string;
}

/**
 * 트렌드 카테고리 상수
 */
export const TREND_CATEGORIES: TrendCategoryInfo[] = [
  {
    value: "product",
    label: "상품",
    description: "상품 트렌드 분석",
  },
  {
    value: "real_estate",
    label: "부동산",
    description: "부동산 시장 트렌드",
  },
  {
    value: "stock",
    label: "주식",
    description: "주식 시장 트렌드",
  },
  {
    value: "blog",
    label: "블로그",
    description: "블로그 콘텐츠 트렌드",
  },
  {
    value: "shorts",
    label: "숏츠",
    description: "유튜브 숏츠 트렌드",
  },
  {
    value: "reels",
    label: "릴스",
    description: "인스타그램 릴스 트렌드",
  },
] as const;

/**
 * 트렌드 패키지 요약 정보 인터페이스
 */
export interface TrendPackSummary {
  id: string;
  title: string;
  category: TrendCategory;
  summary: string;
  weekKey: WeekKey;
  keywordCount: number;
  status: TrendPackStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 트렌드 패키지 상세 정보 인터페이스
 */
export interface TrendPackDetail extends TrendPack {
  scrapedItemsCount?: number;
  promptsCount?: number;
}

/**
 * 트렌드 키워드 통계 인터페이스
 */
export interface TrendKeywordStats {
  keyword: string;
  frequency: number;
  category: TrendCategory;
  relatedPacks: number;
}

/**
 * 주차별 트렌드 통계 인터페이스
 */
export interface WeekTrendStats {
  weekKey: WeekKey;
  totalPacks: number;
  packsByCategory: Record<TrendCategory, number>;
  totalKeywords: number;
  topKeywords: string[];
}

/**
 * 트렌드 패키지 필터 옵션 인터페이스
 */
export interface TrendPackFilter {
  category?: TrendCategory | "all";
  status?: TrendPackStatus;
  weekKey?: WeekKey;
  searchQuery?: string;
}

/**
 * 트렌드 패키지 정렬 옵션 타입
 */
export type TrendPackSortOption =
  | "created_at_desc"
  | "created_at_asc"
  | "week_key_desc"
  | "week_key_asc"
  | "title_asc"
  | "title_desc";

