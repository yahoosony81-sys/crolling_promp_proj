import { NextResponse } from "next/server";
import { expireSubscriptions } from "@/lib/utils/subscription";

export const dynamic = "force-dynamic";

/**
 * 만료된 구독 처리 배치 작업 API 라우트
 * POST /api/subscriptions/expire
 * 
 * 만료된 구독을 일괄 처리합니다.
 * 
 * 인증: 내부 API 키 또는 관리자 권한 필요
 * 실제 운영 환경에서는 Cron Job이나 Vercel Cron을 사용하여 주기적으로 호출
 */
export async function POST(request: Request) {
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

    // 만료된 구독 처리
    const expiredSubscriptions = await expireSubscriptions();

    return NextResponse.json({
      success: true,
      message: `${expiredSubscriptions.length}개의 구독이 처리되었습니다`,
      count: expiredSubscriptions.length,
      subscriptions: expiredSubscriptions,
    });
  } catch (error) {
    console.error("Error in subscription expire API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

