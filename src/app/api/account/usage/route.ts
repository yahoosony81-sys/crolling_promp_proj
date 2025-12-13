import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * 이용 기록 조회 API 라우트
 * GET 메서드로 이용 기록 조회 (페이지네이션 지원)
 */
export async function GET(request: Request) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 이용 기록 조회 (prompt_templates, trend_packs 조인)
    const { data, error, count } = await supabase
      .from("prompt_usages")
      .select(
        `
        *,
        prompt_templates:prompt_id (
          id,
          title,
          category
        ),
        trend_packs:pack_id (
          id,
          title,
          category
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching usage history:", error);
      return NextResponse.json(
        { error: "이용 기록을 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in usage API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

