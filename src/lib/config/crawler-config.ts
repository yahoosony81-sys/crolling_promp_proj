/**
 * 크롤링 설정 및 환경 변수 관리
 */

export type ValidCategory = "product" | "real_estate" | "stock" | "blog" | "shorts" | "reels";

/**
 * 크롤링 소스 타입
 */
export type CrawlSource = "naver_news" | "naver_shopping" | "coupang" | "naver_real_estate" | "naver_stock" | "naver_blog" | "naver_realtime";

/**
 * 크롤링 설정 인터페이스
 */
export interface CrawlerConfig {
  // Rate limiting 설정
  rateLimit: {
    delayBetweenRequests: number; // 요청 간 딜레이 (ms)
    delayBetweenKeywords: number; // 키워드 간 딜레이 (ms)
    maxRetries: number; // 최대 재시도 횟수
    retryDelay: number; // 재시도 딜레이 (ms)
    timeout: number; // 요청 타임아웃 (ms)
  };

  // 크롤링 제한 설정
  limits: {
    maxItemsPerKeyword: number; // 키워드당 최대 아이템 수
    maxKeywordsPerCategory: number; // 카테고리당 최대 키워드 수
    maxItemsPerCategory: number; // 카테고리당 최대 아이템 수
  };

  // 카테고리별 크롤링 소스 우선순위
  categorySources: Record<ValidCategory, CrawlSource[]>;

  // 크롤링 활성화 여부
  enabled: boolean;

  // User-Agent 설정
  userAgent: string;
}

/**
 * 기본 크롤링 설정
 */
const defaultConfig: CrawlerConfig = {
  rateLimit: {
    delayBetweenRequests: Number(process.env.CRAWLER_DELAY_BETWEEN_REQUESTS) || 1000,
    delayBetweenKeywords: Number(process.env.CRAWLER_DELAY_BETWEEN_KEYWORDS) || 2000,
    maxRetries: Number(process.env.CRAWLER_MAX_RETRIES) || 3,
    retryDelay: Number(process.env.CRAWLER_RETRY_DELAY) || 2000,
    timeout: Number(process.env.CRAWLER_TIMEOUT) || 30000,
  },
  limits: {
    maxItemsPerKeyword: Number(process.env.CRAWLER_MAX_ITEMS_PER_KEYWORD) || 10,
    maxKeywordsPerCategory: Number(process.env.CRAWLER_MAX_KEYWORDS_PER_CATEGORY) || 3,
    maxItemsPerCategory: Number(process.env.CRAWLER_MAX_ITEMS_PER_CATEGORY) || 30,
  },
  categorySources: {
    product: (process.env.CRAWLER_PRODUCT_SOURCES?.split(",") as CrawlSource[]) || [
      "naver_shopping",
      "coupang",
      "naver_news",
    ],
    real_estate: (process.env.CRAWLER_REAL_ESTATE_SOURCES?.split(",") as CrawlSource[]) || [
      "naver_real_estate",
      "naver_news",
    ],
    stock: (process.env.CRAWLER_STOCK_SOURCES?.split(",") as CrawlSource[]) || [
      "naver_stock",
      "naver_news",
    ],
    blog: (process.env.CRAWLER_BLOG_SOURCES?.split(",") as CrawlSource[]) || [
      "naver_blog",
      "naver_news",
    ],
    shorts: (process.env.CRAWLER_SHORTS_SOURCES?.split(",") as CrawlSource[]) || [
      "naver_blog",
      "naver_news",
    ],
    reels: (process.env.CRAWLER_REELS_SOURCES?.split(",") as CrawlSource[]) || [
      "naver_blog",
      "naver_news",
    ],
  },
  enabled: process.env.CRAWLER_ENABLED !== "false",
  userAgent:
    process.env.CRAWLER_USER_AGENT ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

/**
 * 크롤링 설정 싱글톤 인스턴스
 */
let configInstance: CrawlerConfig | null = null;

/**
 * 크롤링 설정 가져오기
 * @returns 크롤링 설정 객체
 */
export function getCrawlerConfig(): CrawlerConfig {
  if (!configInstance) {
    configInstance = { ...defaultConfig };
  }
  return configInstance;
}

/**
 * 크롤링 설정 업데이트
 * @param updates - 업데이트할 설정 부분
 */
export function updateCrawlerConfig(updates: Partial<CrawlerConfig>): void {
  if (!configInstance) {
    configInstance = { ...defaultConfig };
  }
  configInstance = { ...configInstance, ...updates };
}

/**
 * 카테고리에 맞는 크롤링 소스 목록 가져오기
 * @param category - 카테고리
 * @returns 크롤링 소스 배열
 */
export function getSourcesForCategory(category: ValidCategory): CrawlSource[] {
  const config = getCrawlerConfig();
  return config.categorySources[category] || ["naver_news"];
}

/**
 * 크롤링이 활성화되어 있는지 확인
 * @returns 활성화 여부
 */
export function isCrawlerEnabled(): boolean {
  const config = getCrawlerConfig();
  return config.enabled;
}

