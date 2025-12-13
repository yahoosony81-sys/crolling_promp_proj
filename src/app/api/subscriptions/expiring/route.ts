import { NextResponse } from "next/server";
import { getExpiringSubscriptions } from "@/lib/utils/subscription";

export const dynamic = "force-dynamic";

/**
 * 만료 예정 구독 조회 API 라우트
 * GET /api/subscriptions/expiring?days=7
 * 
 * 만료 예정인 구독 목록을 조회합니다.
 * 
 * 쿼리 파라미터:
 * - days: 만료 예정일까지의 일수 (기본값: 7일)
 * 
 * 인증: 내부 API 키 또는 관리자 권한 필요
 */
export async function GET(request: Request) {
  try {
    // 인증 체크 (내부 API 키 또는 관리자 권한)
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.INTERNAL_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 쿼리 파라미터에서 days 추출
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 7;

    // 유효성 검사
    if (isNaN(days) || days < 1 || days > 30) {
      return NextResponse.json(
        { error: "days 파라미터는 1~30 사이의 숫자여야 합니다" },
        { status: 400 }
      );
    }

    // 만료 예정 구독 조회
    const expiringSubscriptions = await getExpiringSubscriptions(days);

    return NextResponse.json({
      success: true,
      days,
      count: expiringSubscriptions.length,
      subscriptions: expiringSubscriptions,
    });
  } catch (error) {
    console.error("Error in subscription expiring API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

