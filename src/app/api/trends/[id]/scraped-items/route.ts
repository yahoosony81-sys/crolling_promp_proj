import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/middleware/auth";
import { GetTrendParamsSchema, GetScrapedItemsQuerySchema } from "@/lib/schemas/trends";
import { withErrorHandler, validationError, notFound, internalError } from "@/lib/utils/api-error";
import type { ScrapedItem } from "@/lib/types/trend";

export const dynamic = "force-dynamic";

/**
 * 스크랩된 아이템 목록 조회 API
 * GET /api/trends/[id]/scraped-items
 *
 * 경로 파라미터:
 * - id: 트렌드 패키지 UUID (pack_id)
 *
 * 쿼리 파라미터:
 * - limit (선택): 페이지당 항목 수 (기본값: 50, 최대: 100)
 * - offset (선택): 페이지네이션 오프셋 (기본값: 0)
 *
 * 인증 및 구독: 필수
 */
async function GETHandler(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 인증 및 구독 체크
  await requireSubscription();

  // 경로 파라미터 검증
  const paramsValidation = GetTrendParamsSchema.safeParse(params);
  if (!paramsValidation.success) {
    return validationError("Invalid path parameters", paramsValidation.error.errors);
  }

  const { id } = paramsValidation.data;

  // 쿼리 파라미터 파싱 및 검증
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  
  const queryValidation = GetScrapedItemsQuerySchema.safeParse(queryParams);
  if (!queryValidation.success) {
    return validationError("Invalid query parameters", queryValidation.error.errors);
  }

  const { limit, offset } = queryValidation.data;

  // Supabase 클라이언트 생성
  const supabase = await createClient();

  // 패키지 존재 및 published 상태 확인
  const { data: pack, error: packError } = await supabase
    .from("trend_packs")
    .select("id, status")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (packError) {
    console.error("Error checking pack:", packError);
    return internalError("Failed to verify pack");
  }

  if (!pack) {
    return notFound("Trend pack not found or not published");
  }

  // 스크랩 아이템 조회
  const { data, error, count } = await supabase
    .from("scraped_items")
    .select("*", { count: "exact" })
    .eq("pack_id", id)
    .order("scraped_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching scraped items:", error);
    return internalError("Failed to fetch scraped items");
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return NextResponse.json({
    data: (data || []) as ScrapedItem[],
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

