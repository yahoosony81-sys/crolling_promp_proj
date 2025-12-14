/**
 * 크롤링 실행 API 라우트
 * POST /api/crawl/run
 *
 * 주간 트렌드 키워드를 수집하고, 카테고리별 데이터를 크롤링하여
 * trend_packs와 scraped_items 테이블에 저장합니다.
 *
 * 인증: 내부 API 키 또는 관리자 권한 필요
 * 실제 운영 환경에서는 Vercel Cron을 사용하여 주기적으로 호출
 */

import { NextResponse } from "next/server";
import { crawlByCategory } from "@/lib/utils/crawler";
import { collectTrendKeywords, generateTrendPackSummary } from "@/lib/utils/trend-keywords";
import {
  createCurrentWeekTrendPack,
  linkPromptsToPack,
} from "@/lib/utils/trend-pack";
import { saveScrapedItems } from "@/lib/utils/scraped-items";
import { summarizeHybrid } from "@/lib/utils/ai-summary";
import {
  logCrawlStart,
  logCrawlSuccess,
  logCrawlError,
  logCrawlWarn,
  logItemCrawl,
  logItemSave,
  getCrawlStats,
  classifyError,
  type CrawlStats,
} from "@/lib/utils/crawl-logger";
import { getCrawlerConfig } from "@/lib/config/crawler-config";
import { applyCategorySummaryTemplate } from "@/lib/utils/data-processor";
import type { ScrapedItemData } from "@/lib/types/crawler";

export const dynamic = "force-dynamic";

// 지원하는 카테고리 목록
const VALID_CATEGORIES = [
  "product",
  "real_estate",
  "stock",
  "blog",
  "shorts",
  "reels",
] as const;

type ValidCategory = (typeof VALID_CATEGORIES)[number];

/**
 * POST /api/crawl/run
 * 크롤링 실행
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // 인증 체크 (내부 API 키 또는 관리자 권한)
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.INTERNAL_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // 요청 본문 파싱 (선택적)
    let categories: ValidCategory[] = [...VALID_CATEGORIES];
    let limit = 10; // 카테고리당 크롤링할 아이템 수

    try {
      const body = await request.json().catch(() => ({}));
      if (body.categories && Array.isArray(body.categories)) {
        categories = body.categories.filter((cat: string) =>
          VALID_CATEGORIES.includes(cat as ValidCategory)
        ) as ValidCategory[];
      }
      if (body.limit && typeof body.limit === "number") {
        limit = Math.min(Math.max(body.limit, 1), 50); // 1-50 사이로 제한
      }
    } catch {
      // 본문 파싱 실패 시 기본값 사용
    }

    const results: Record<
      string,
      {
        packId: string | null;
        keywords: number;
        itemsCrawled: number;
        itemsSaved: number;
        itemsSkipped: number;
        promptsLinked: number;
        error?: string;
      }
    > = {};

    // 카테고리별 크롤링 실행
    for (const category of categories) {
      logCrawlStart(category, { limit });
      
      try {
        // 1. 트렌드 키워드 수집
        const keywords = await collectTrendKeywords(category);

        if (keywords.length === 0) {
          logCrawlWarn(category, "키워드 수집 실패: 키워드가 없습니다");
          results[category] = {
            packId: null,
            keywords: 0,
            itemsCrawled: 0,
            itemsSaved: 0,
            itemsSkipped: 0,
            promptsLinked: 0,
            error: "No keywords collected",
          };
          continue;
        }

        // 2. 각 키워드로 크롤링 (카테고리별 크롤러 사용)
        const config = getCrawlerConfig();
        const maxKeywords = config.limits.maxKeywordsPerCategory;
        const allItems: ScrapedItemData[] = [];

        for (const keyword of keywords.slice(0, maxKeywords)) {
          try {
            const items = await crawlByCategory(category, keyword.keyword, limit);
            allItems.push(...items);
            logItemCrawl(category, keyword.keyword, "multiple", items.length, true);
            
            // Rate limiting (키워드 간 딜레이)
            await new Promise((resolve) => setTimeout(resolve, config.rateLimit.delayBetweenKeywords));
          } catch (error) {
            const errorInfo = classifyError(error);
            logItemCrawl(category, keyword.keyword, "multiple", 0, false);
            logCrawlError(category, `키워드 크롤링 실패: ${keyword.keyword}`, error instanceof Error ? error : new Error(String(error)), {
              errorType: errorInfo.type,
              retryable: errorInfo.retryable,
            });
          }
        }

        // 3. 아이템 통합 및 요약 개선
        const scrapedItems = allItems;
        
        // 요약 개선 (필요시 AI 요약 사용 및 카테고리별 템플릿 적용)
        for (const item of scrapedItems) {
          if (item.summary.length < 100) {
            // 요약이 너무 짧으면 개선 시도
            try {
              const improvedSummary = await summarizeHybrid(item.summary, 200);
              item.summary = improvedSummary;
            } catch (error) {
              logCrawlWarn(category, `요약 개선 실패: ${item.url}`, { error: error instanceof Error ? error.message : String(error) });
            }
          }
          
          // 카테고리별 요약 템플릿 적용
          item.summary = applyCategorySummaryTemplate(item, category);
        }

        // 4. 트렌드 패키지 생성
        const summary = generateTrendPackSummary(keywords, scrapedItems.length);
        const packId = await createCurrentWeekTrendPack(category, keywords, summary);
        logCrawlSuccess(category, `트렌드 패키지 생성 완료: ${packId}`);

        // 5. 스크랩 아이템 저장
        const saveResult = await saveScrapedItems(packId, scrapedItems);
        logItemSave(category, saveResult.saved, saveResult.skipped);

        // 6. 프롬프트 연결
        const promptsLinked = await linkPromptsToPack(packId, category);
        logCrawlSuccess(category, `프롬프트 연결 완료: ${promptsLinked}개`);

        const stats = getCrawlStats(category) as CrawlStats;
        results[category] = {
          packId,
          keywords: keywords.length,
          itemsCrawled: scrapedItems.length,
          itemsSaved: saveResult.saved,
          itemsSkipped: saveResult.skipped,
          promptsLinked,
        };
      } catch (error) {
        const errorInfo = classifyError(error);
        logCrawlError(
          category,
          `카테고리 처리 실패: ${errorInfo.message}`,
          error instanceof Error ? error : new Error(String(error)),
          {
            errorType: errorInfo.type,
            retryable: errorInfo.retryable,
          }
        );
        results[category] = {
          packId: null,
          keywords: 0,
          itemsCrawled: 0,
          itemsSaved: 0,
          itemsSkipped: 0,
          promptsLinked: 0,
          error: `${errorInfo.type}: ${errorInfo.message}`,
        };
      }
    }

    const duration = Date.now() - startTime;
    const totalSaved = Object.values(results).reduce((sum, r) => sum + r.itemsSaved, 0);
    const totalSkipped = Object.values(results).reduce((sum, r) => sum + r.itemsSkipped, 0);

    return NextResponse.json({
      success: true,
      message: "크롤링이 완료되었습니다",
      duration: `${duration}ms`,
      results,
      summary: {
        categoriesProcessed: categories.length,
        totalItemsSaved: totalSaved,
        totalItemsSkipped: totalSkipped,
        packsCreated: Object.values(results).filter((r) => r.packId !== null).length,
      },
    });
  } catch (error) {
    console.error("Error in crawl run API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류가 발생했습니다",
      },
      { status: 500 }
    );
  }
}

