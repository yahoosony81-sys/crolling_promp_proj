/**
 * 크롤링 로깅 시스템
 */

export type CrawlLogLevel = "info" | "warn" | "error" | "success";

export interface CrawlLogEntry {
  timestamp: string;
  level: CrawlLogLevel;
  category?: string;
  keyword?: string;
  source?: string;
  message: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

export interface CrawlStats {
  category: string;
  startTime: number;
  endTime?: number;
  keywordsCollected: number;
  itemsCrawled: number;
  itemsSaved: number;
  itemsSkipped: number;
  errors: number;
  warnings: number;
}

/**
 * 크롤링 통계 저장소 (메모리 기반)
 */
const crawlStats: Map<string, CrawlStats> = new Map();

/**
 * 크롤링 로그 저장소 (메모리 기반, 최근 100개만 유지)
 */
const crawlLogs: CrawlLogEntry[] = [];
const MAX_LOGS = 100;

/**
 * 구조화된 로그 생성
 */
function createLogEntry(
  level: CrawlLogLevel,
  message: string,
  options?: {
    category?: string;
    keyword?: string;
    source?: string;
    metadata?: Record<string, unknown>;
    error?: Error;
  }
): CrawlLogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    category: options?.category,
    keyword: options?.keyword,
    source: options?.source,
    message,
    metadata: options?.metadata,
    error: options?.error,
  };
}

/**
 * 로그 저장
 */
function saveLog(entry: CrawlLogEntry): void {
  crawlLogs.push(entry);
  if (crawlLogs.length > MAX_LOGS) {
    crawlLogs.shift();
  }

  // 콘솔 출력
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const categoryPrefix = entry.category ? `[${entry.category}]` : "";
  const keywordPrefix = entry.keyword ? `[${entry.keyword}]` : "";
  const sourcePrefix = entry.source ? `[${entry.source}]` : "";

  const logMessage = `${prefix} ${categoryPrefix} ${keywordPrefix} ${sourcePrefix} ${entry.message}`;

  switch (entry.level) {
    case "error":
      console.error(logMessage, entry.error || entry.metadata || "");
      break;
    case "warn":
      console.warn(logMessage, entry.metadata || "");
      break;
    case "success":
      console.log(`✅ ${logMessage}`, entry.metadata || "");
      break;
    default:
      console.log(logMessage, entry.metadata || "");
  }
}

/**
 * 크롤링 시작 로그
 */
export function logCrawlStart(category: string, metadata?: Record<string, unknown>): void {
  const stats: CrawlStats = {
    category,
    startTime: Date.now(),
    keywordsCollected: 0,
    itemsCrawled: 0,
    itemsSaved: 0,
    itemsSkipped: 0,
    errors: 0,
    warnings: 0,
  };
  crawlStats.set(category, stats);

  saveLog(
    createLogEntry("info", `크롤링 시작: ${category}`, {
      category,
      metadata,
    })
  );
}

/**
 * 크롤링 성공 로그
 */
export function logCrawlSuccess(
  category: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  const stats = crawlStats.get(category);
  if (stats) {
    stats.endTime = Date.now();
  }

  saveLog(
    createLogEntry("success", message, {
      category,
      metadata,
    })
  );
}

/**
 * 크롤링 에러 로그
 */
export function logCrawlError(
  category: string,
  message: string,
  error?: Error,
  metadata?: Record<string, unknown>
): void {
  const stats = crawlStats.get(category);
  if (stats) {
    stats.errors++;
  }

  saveLog(
    createLogEntry("error", message, {
      category,
      error,
      metadata,
    })
  );
}

/**
 * 크롤링 경고 로그
 */
export function logCrawlWarn(
  category: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  const stats = crawlStats.get(category);
  if (stats) {
    stats.warnings++;
  }

  saveLog(
    createLogEntry("warn", message, {
      category,
      metadata,
    })
  );
}

/**
 * 일반 정보 로그
 */
export function logCrawlInfo(
  category: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  saveLog(
    createLogEntry("info", message, {
      category,
      metadata,
    })
  );
}

/**
 * 키워드 수집 로그
 */
export function logKeywordCollection(
  category: string,
  keyword: string,
  count: number,
  source?: string
): void {
  const stats = crawlStats.get(category);
  if (stats) {
    stats.keywordsCollected = count;
  }

  saveLog(
    createLogEntry("info", `키워드 수집: ${count}개`, {
      category,
      keyword,
      source,
      metadata: { count },
    })
  );
}

/**
 * 아이템 크롤링 로그
 */
export function logItemCrawl(
  category: string,
  keyword: string,
  source: string,
  count: number,
  success: boolean
): void {
  const stats = crawlStats.get(category);
  if (stats) {
    if (success) {
      stats.itemsCrawled += count;
    } else {
      stats.errors++;
    }
  }

  saveLog(
    createLogEntry(success ? "success" : "error", `아이템 크롤링: ${count}개`, {
      category,
      keyword,
      source,
      metadata: { count, success },
    })
  );
}

/**
 * 아이템 저장 로그
 */
export function logItemSave(
  category: string,
  saved: number,
  skipped: number
): void {
  const stats = crawlStats.get(category);
  if (stats) {
    stats.itemsSaved += saved;
    stats.itemsSkipped += skipped;
  }

  saveLog(
    createLogEntry("success", `아이템 저장: ${saved}개 저장, ${skipped}개 스킵`, {
      category,
      metadata: { saved, skipped },
    })
  );
}

/**
 * 크롤링 통계 가져오기
 */
export function getCrawlStats(category?: string): CrawlStats | Map<string, CrawlStats> {
  if (category) {
    return crawlStats.get(category) || {
      category,
      startTime: Date.now(),
      keywordsCollected: 0,
      itemsCrawled: 0,
      itemsSaved: 0,
      itemsSkipped: 0,
      errors: 0,
      warnings: 0,
    };
  }
  return new Map(crawlStats);
}

/**
 * 크롤링 로그 가져오기
 */
export function getCrawlLogs(limit?: number): CrawlLogEntry[] {
  if (limit) {
    return crawlLogs.slice(-limit);
  }
  return [...crawlLogs];
}

/**
 * 크롤링 통계 초기화
 */
export function resetCrawlStats(category?: string): void {
  if (category) {
    crawlStats.delete(category);
  } else {
    crawlStats.clear();
  }
}

/**
 * 에러 분류 및 재시도 가능 여부 판단
 */
export function canRetryError(error: Error | unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorMessage = error.message.toLowerCase();

  // 네트워크 에러는 재시도 가능
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("econnreset") ||
    errorMessage.includes("enotfound")
  ) {
    return true;
  }

  // 5xx 서버 에러는 재시도 가능
  if (errorMessage.includes("500") || errorMessage.includes("502") || errorMessage.includes("503")) {
    return true;
  }

  // 4xx 클라이언트 에러는 재시도 불가
  if (errorMessage.includes("400") || errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("404")) {
    return false;
  }

  // 기타 에러는 재시도 가능
  return true;
}

/**
 * 에러 타입 분류
 */
export function classifyError(error: Error | unknown): {
  type: "network" | "parse" | "auth" | "rate_limit" | "unknown";
  retryable: boolean;
  message: string;
} {
  if (!(error instanceof Error)) {
    return {
      type: "unknown",
      retryable: false,
      message: String(error),
    };
  }

  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes("network") || errorMessage.includes("timeout") || errorMessage.includes("econnreset")) {
    return {
      type: "network",
      retryable: true,
      message: error.message,
    };
  }

  if (errorMessage.includes("parse") || errorMessage.includes("cheerio") || errorMessage.includes("html")) {
    return {
      type: "parse",
      retryable: false,
      message: error.message,
    };
  }

  if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("unauthorized")) {
    return {
      type: "auth",
      retryable: false,
      message: error.message,
    };
  }

  if (errorMessage.includes("429") || errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
    return {
      type: "rate_limit",
      retryable: true,
      message: error.message,
    };
  }

  return {
    type: "unknown",
    retryable: canRetryError(error),
    message: error.message,
  };
}

