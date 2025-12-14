import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

// 유효한 카테고리 값
const VALID_CATEGORIES = [
  "blog",
  "shorts",
  "reels",
  "product",
  "real_estate",
  "stock",
  "trend",
] as const;

type ValidCategory = (typeof VALID_CATEGORIES)[number];

/**
 * 무료 프롬프트 목록 조회 API
 * GET /api/prompts
 *
 * 쿼리 파라미터:
 * - category (선택): 카테고리 필터링
 * - limit (선택): 페이지당 항목 수 (기본값: 50, 최대: 100)
 * - offset (선택): 페이지네이션 오프셋 (기본값: 0)
 */
export async function GET(request: Request) {
  try {
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    // 카테고리 검증
    if (category && !VALID_CATEGORIES.includes(category as ValidCategory)) {
      return NextResponse.json(
        {
          error: "Invalid category",
          validCategories: VALID_CATEGORIES,
        },
        { status: 400 }
      );
    }

    // limit 검증 및 파싱
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100)
      : 50;

    if (limitParam && (isNaN(parseInt(limitParam, 10)) || parseInt(limitParam, 10) < 1)) {
      return NextResponse.json(
        { error: "limit must be a positive number" },
        { status: 400 }
      );
    }

    // offset 검증 및 파싱
    const offset = offsetParam
      ? Math.max(parseInt(offsetParam, 10), 0)
      : 0;

    if (offsetParam && (isNaN(parseInt(offsetParam, 10)) || parseInt(offsetParam, 10) < 0)) {
      return NextResponse.json(
        { error: "offset must be a non-negative number" },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 쿼리 빌더 생성
    let query = supabase
      .from("prompt_templates")
      .select("*", { count: "exact" })
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
      return NextResponse.json(
        { error: "Failed to fetch prompts" },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error in prompts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

