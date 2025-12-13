import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { checkSubscription } from "@/lib/utils/subscription";
import type { Database } from "@/../database.types";

export const dynamic = "force-dynamic";

type ScrapedItem = Database["public"]["Tables"]["scraped_items"]["Row"];

// UUID 형식 검증 정규식
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

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

    // 패키지 존재 및 published 상태 확인
    const { data: pack, error: packError } = await supabase
      .from("trend_packs")
      .select("id, status")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (packError) {
      console.error("Error checking pack:", packError);
      return NextResponse.json(
        { error: "Failed to verify pack" },
        { status: 500 }
      );
    }

    if (!pack) {
      return NextResponse.json(
        { error: "Trend pack not found or not published" },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: "Failed to fetch scraped items" },
        { status: 500 }
      );
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
  } catch (error) {
    console.error("Error in scraped items API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

