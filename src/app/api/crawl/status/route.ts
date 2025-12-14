/**
 * 크롤링 상태 조회 API 라우트
 * GET /api/crawl/status
 *
 * 최근 크롤링 실행 시간, 성공/실패 여부, 처리된 아이템 수 등을 조회합니다.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import type { CrawlStatus } from "@/lib/types/crawler";
import { getCrawlStats, getCrawlLogs } from "@/lib/utils/crawl-logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/crawl/status
 * 크롤링 상태 조회
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    // 최근 생성된 트렌드 패키지 조회 (크롤링 실행 시간 추정)
    const { data: recentPacks, error: packsError } = await supabase
      .from("trend_packs")
      .select("id, generated_at, created_at, status")
      .order("generated_at", { ascending: false })
      .limit(10);

    if (packsError) {
      throw new Error(`Failed to fetch trend packs: ${packsError.message}`);
    }

    // 최근 생성된 스크랩 아이템 수 조회
    const { count: totalItems, error: itemsError } = await supabase
      .from("scraped_items")
      .select("*", { count: "exact", head: true });

    if (itemsError) {
      throw new Error(`Failed to fetch scraped items count: ${itemsError.message}`);
    }

    // 최근 실행 시간 계산
    const lastRunAt =
      recentPacks && recentPacks.length > 0
        ? recentPacks[0].generated_at || recentPacks[0].created_at
        : null;

    // 마지막 성공 시간 계산
    const lastSuccessAt =
      recentPacks && recentPacks.length > 0
        ? recentPacks.find((pack) => pack.status === "published")?.generated_at ||
          recentPacks.find((pack) => pack.status === "published")?.created_at ||
          null
        : null;

    // 총 패키지 수
    const { count: totalPacks, error: packsCountError } = await supabase
      .from("trend_packs")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    if (packsCountError) {
      throw new Error(`Failed to fetch trend packs count: ${packsCountError.message}`);
    }

    // 카테고리별 통계
    const { data: categoryStatsData, error: categoryError } = await supabase
      .from("trend_packs")
      .select("category")
      .eq("status", "published");

    if (categoryError) {
      throw new Error(`Failed to fetch category stats: ${categoryError.message}`);
    }

    const categoryCounts: Record<string, number> = {};
    categoryStatsData?.forEach((pack) => {
      categoryCounts[pack.category] = (categoryCounts[pack.category] || 0) + 1;
    });

    // 크롤링 로그에서 최근 에러 조회
    const recentLogs = getCrawlLogs(50);
    const recentErrors = recentLogs.filter((log) => log.level === "error");
    const lastError = recentErrors.length > 0 ? recentErrors[0].message : null;

    // 크롤링 통계 조회
    const crawlStatsMap = getCrawlStats() as Map<string, CrawlStats>;
    const crawlCategoryStats: Record<string, {
      lastRunAt: number | null;
      keywordsCollected: number;
      itemsCrawled: number;
      itemsSaved: number;
      itemsSkipped: number;
      errors: number;
      warnings: number;
      successRate: number;
    }> = {};

    crawlStatsMap.forEach((stats, category) => {
      const total = stats.itemsCrawled + stats.errors;
      const successRate = total > 0 ? (stats.itemsCrawled / total) * 100 : 0;
      crawlCategoryStats[category] = {
        lastRunAt: stats.endTime || stats.startTime,
        keywordsCollected: stats.keywordsCollected,
        itemsCrawled: stats.itemsCrawled,
        itemsSaved: stats.itemsSaved,
        itemsSkipped: stats.itemsSkipped,
        errors: stats.errors,
        warnings: stats.warnings,
        successRate: Math.round(successRate * 100) / 100,
      };
    });

    const status: CrawlStatus = {
      lastRunAt,
      lastSuccessAt,
      lastError,
      totalItemsProcessed: totalItems || 0,
      totalPacksCreated: totalPacks || 0,
      isRunning: false, // 실행 중인지 확인하는 로직이 있다면 여기에 추가
    };

    return NextResponse.json({
      success: true,
      status,
      statistics: {
        totalPacks: totalPacks || 0,
        totalItems: totalItems || 0,
        categoryCounts,
        categoryStats: crawlCategoryStats,
        recentPacks: recentPacks?.slice(0, 5).map((pack) => ({
          id: pack.id,
          generatedAt: pack.generated_at || pack.created_at,
          status: pack.status,
        })),
        recentLogs: recentLogs.slice(-10).map((log) => ({
          timestamp: log.timestamp,
          level: log.level,
          category: log.category,
          message: log.message,
        })),
      },
    });
  } catch (error) {
    console.error("Error in crawl status API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류가 발생했습니다",
      },
      { status: 500 }
    );
  }
}

