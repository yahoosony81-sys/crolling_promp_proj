import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { checkSubscription } from "@/lib/utils/subscription";
import type { Database } from "@/../database.types";

export const dynamic = "force-dynamic";

type TrendPack = Database["public"]["Tables"]["trend_packs"]["Row"];

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
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 구독 체크
    const hasSubscription = await checkSubscription(userId);
    if (!hasSubscription) {
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // UUID 형식 검증
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid trend pack ID format" },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: "Trend pack not found" },
          { status: 404 }
        );
      }

      console.error("Error fetching trend pack:", error);
      return NextResponse.json(
        { error: "Failed to fetch trend pack" },
        { status: 500 }
      );
    }

    // 패키지가 없는 경우 (null 체크)
    if (!data) {
      return NextResponse.json(
        { error: "Trend pack not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: data as TrendPack });
  } catch (error) {
    console.error("Error in trend pack detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

