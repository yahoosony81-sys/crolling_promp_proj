import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/lib/types/subscription";

export const dynamic = "force-dynamic";

/**
 * 결제 내역 조회 API
 * GET /api/subscriptions/payment-history
 *
 * 쿼리 파라미터:
 * - limit (선택): 페이지당 항목 수 (기본값: 20, 최대: 100)
 * - offset (선택): 페이지네이션 오프셋 (기본값: 0)
 *
 * 인증: 필수
 *
 * 참고: 현재는 subscriptions 테이블의 정보를 기반으로 결제 내역을 제공합니다.
 * 실제 결제 프로바이더 연동 후에는 별도의 결제 내역 테이블이 필요할 수 있습니다.
 */
export async function GET(request: Request) {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    // limit 검증 및 파싱
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100)
      : 20;

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

    // 구독 정보 조회 (사용자의 모든 구독 기록)
    // 현재는 사용자당 하나의 구독만 있지만, 향후 확장을 고려하여 구조를 준비
    const { data, error, count } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching payment history:", error);
      return NextResponse.json(
        { error: "결제 내역을 불러오는데 실패했습니다" },
        { status: 500 }
      );
    }

    // 구독 정보를 결제 내역 형식으로 변환
    const paymentHistory = (data || []).map((subscription) => ({
      id: subscription.id,
      amount: subscription.price_krw,
      plan_name: subscription.plan_name,
      status: subscription.status,
      payment_date: subscription.created_at,
      period_start: subscription.current_period_start,
      period_end: subscription.current_period_end,
      canceled_at: subscription.canceled_at,
      cancel_at_period_end: subscription.cancel_at_period_end,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return NextResponse.json({
      data: paymentHistory,
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
    console.error("Error in payment history API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

