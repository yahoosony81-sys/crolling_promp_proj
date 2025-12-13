/**
 * 크롤링 관련 타입 정의
 */

/**
 * 크롤링된 아이템 데이터 구조
 */
export interface ScrapedItemData {
  source_domain: string;
  source_type: "news" | "blog" | "market" | "community" | "listing";
  url: string;
  title: string;
  summary: string;
  tags: string[];
  extracted_data?: Record<string, unknown>;
}

/**
 * 크롤링 설정 타입
 */
export interface CrawlConfig {
  keyword: string;
  category: string;
  limit?: number;
  maxSummaryLength?: number;
  useAISummary?: boolean;
}

/**
 * 트렌드 키워드 타입
 */
export interface TrendKeyword {
  keyword: string;
  score?: number; // 인기도/관련도 점수
  category: string;
}

/**
 * 크롤링 결과 타입
 */
export interface CrawlResult {
  success: boolean;
  items: ScrapedItemData[];
  error?: string;
  processedCount: number;
  skippedCount: number;
}

/**
 * 크롤링 상태 타입
 */
export interface CrawlStatus {
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  totalItemsProcessed: number;
  totalPacksCreated: number;
  isRunning: boolean;
}

