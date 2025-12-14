import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSubscription, optionalAuth } from "@/lib/middleware/auth";
import { withErrorHandler, badRequest, notFound, unauthorized, internalError } from "@/lib/utils/api-error";
import type { Database } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

// UUID 형식 검증 정규식
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 프롬프트 상세 조회 API
 * GET /api/prompts/[id]
 *
 * 경로 파라미터:
 * - id: 프롬프트 UUID
 *
 * 인증:
 * - 무료 프롬프트: 인증 없이 조회 가능
 * - 유료 프롬프트: 인증 및 구독 필요
 */
async function GETHandler(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // UUID 형식 검증
  if (!id || !UUID_REGEX.test(id)) {
    return badRequest("Invalid prompt ID format");
  }

  // Supabase 클라이언트 생성
  const supabase = await createClient();

  // 프롬프트 조회
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    // 프롬프트가 존재하지 않는 경우
    if (error.code === "PGRST116") {
      return notFound("Prompt not found");
    }

    console.error("Error fetching prompt:", error);
    return internalError("Failed to fetch prompt");
  }

  // 프롬프트가 없는 경우 (null 체크)
  if (!data) {
    return notFound("Prompt not found");
  }

  const prompt = data as PromptTemplate;

  // 무료 프롬프트는 공개 조회 가능
  if (prompt.is_free) {
    return NextResponse.json({ data: prompt });
  }

  // 유료 프롬프트는 인증 및 구독 필요
  await requireSubscription();

  // 유료 프롬프트 반환
  return NextResponse.json({ data: prompt });
}

export const GET = withErrorHandler(GETHandler);

