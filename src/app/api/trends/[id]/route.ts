import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription } from "@/lib/middleware/auth";
import { withErrorHandler, badRequest, notFound, internalError } from "@/lib/utils/api-error";
import type { TrendPack } from "@/lib/types/trend";

export const dynamic = "force-dynamic";

// UUID 형식 검증 정규식
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 트렌드 패키지 상세 조회 API
 * GET /api/trends/[id]
 *
 * 경로 파라미터:
 * - id: 트렌드 패키지 UUID
 *
 * 인증 및 구독: 필수
 */
async function GETHandler(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 인증 및 구독 체크
  await requireSubscription();

  const { id } = params;

  // UUID 형식 검증
  if (!id || !UUID_REGEX.test(id)) {
    return badRequest("Invalid trend pack ID format");
  }

  // Supabase 클라이언트 생성
  const supabase = await createClient();

  // 패키지 조회 (published 상태만)
  const { data, error } = await supabase
    .from("trend_packs")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error) {
    // 패키지가 존재하지 않거나 published가 아닌 경우
    if (error.code === "PGRST116") {
      return notFound("Trend pack not found");
    }

    console.error("Error fetching trend pack:", error);
    return internalError("Failed to fetch trend pack");
  }

  // 패키지가 없는 경우 (null 체크)
  if (!data) {
    return notFound("Trend pack not found");
  }

  return NextResponse.json({ data: data as TrendPack });
}

export const GET = withErrorHandler(GETHandler);

