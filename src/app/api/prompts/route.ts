import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GetPromptsQuerySchema } from "@/lib/schemas/prompts";
import { withErrorHandler, validationError, internalError } from "@/lib/utils/api-error";
import type { Database } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

/**
 * 무료 프롬프트 목록 조회 API
 * GET /api/prompts
 *
 * 쿼리 파라미터:
 * - category (선택): 카테고리 필터링
 * - limit (선택): 페이지당 항목 수 (기본값: 50, 최대: 100)
 * - offset (선택): 페이지네이션 오프셋 (기본값: 0)
 */
async function GETHandler(request: Request) {
  // 쿼리 파라미터 파싱 및 검증
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  
  const validationResult = GetPromptsQuerySchema.safeParse(queryParams);
  if (!validationResult.success) {
    return validationError("Invalid query parameters", validationResult.error.issues);
  }

  const { category, limit, offset } = validationResult.data;

  // Supabase 클라이언트 생성
  const supabase = await createClient();

  // 쿼리 빌더 생성 (필요한 필드만 선택)
  let query = supabase
    .from("prompt_templates")
    .select("id, title, description, category, content, variables, example_inputs, created_at, updated_at", { count: "exact" })
    .eq("is_free", true)
    .order("created_at", { ascending: false });

  // 카테고리 필터링
  if (category) {
    query = query.eq("category", category);
  }

  // 페이지네이션 적용
  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching prompts:", error);
    return internalError("Failed to fetch prompts");
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  // 캐시 헤더 설정 (무료 프롬프트는 1시간 캐시)
  return NextResponse.json(
    {
      data: (data || []) as PromptTemplate[],
      pagination: {
        page: currentPage,
        limit,
        offset,
        total,
        totalPages,
        hasNextPage: offset + limit < total,
        hasPreviousPage: offset > 0,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

export const GET = withErrorHandler(GETHandler);

