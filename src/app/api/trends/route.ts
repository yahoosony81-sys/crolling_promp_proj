import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/middleware/auth";
import { withErrorHandler, badRequest, internalError } from "@/lib/utils/api-error";
import type { TrendPack } from "@/lib/types/trend";

export const dynamic = "force-dynamic";

// 유효한 카테고리 값 (trends용)
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
 * 트렌드 패키지 목록 조회 API
 * GET /api/trends
 *
 * 쿼리 파라미터:
 * - category (선택): 카테고리 필터링
 * - week_key (선택): 특정 주차 필터링 (예: "2025-W50")
 * - limit (선택): 페이지당 항목 수 (기본값: 50, 최대: 100)
 * - offset (선택): 페이지네이션 오프셋 (기본값: 0)
 *
 * 인증 및 구독: 필수
 */
async function GETHandler(request: Request) {
  // 인증 및 구독 체크
  await requireSubscription();

  // 쿼리 파라미터 파싱
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const weekKey = searchParams.get("week_key");
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  // 카테고리 검증
  if (category && !VALID_CATEGORIES.includes(category as ValidCategory)) {
    return badRequest("Invalid category", {
      validCategories: VALID_CATEGORIES,
    });
  }

  // limit 검증 및 파싱
  const limit = limitParam
    ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100)
    : 50;

  if (limitParam && (isNaN(parseInt(limitParam, 10)) || parseInt(limitParam, 10) < 1)) {
    return badRequest("limit must be a positive number");
  }

  // offset 검증 및 파싱
  const offset = offsetParam
    ? Math.max(parseInt(offsetParam, 10), 0)
    : 0;

  if (offsetParam && (isNaN(parseInt(offsetParam, 10)) || parseInt(offsetParam, 10) < 0)) {
    return badRequest("offset must be a non-negative number");
  }

  // Supabase 클라이언트 생성
  const supabase = await createClient();

  // 쿼리 빌더 생성
  let query = supabase
    .from("trend_packs")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // 카테고리 필터링
  if (category) {
    query = query.eq("category", category);
  }

  // 주차 필터링
  if (weekKey) {
    query = query.eq("week_key", weekKey);
  }

  // 페이지네이션 적용
  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching trend packs:", error);
    return internalError("Failed to fetch trend packs");
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return NextResponse.json({
    data: (data || []) as TrendPack[],
    pagination: {
      page: currentPage,
      limit,
      offset,
      total,
      totalPages,
      hasNextPage: offset + limit < total,
      hasPreviousPage: offset > 0,
    },
  });
}

export const GET = withErrorHandler(GETHandler);

