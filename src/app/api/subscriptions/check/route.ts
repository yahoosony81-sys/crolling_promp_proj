/**
 * 구독 상태 확인 API 라우트
 * GET /api/subscriptions/check
 *
 * 현재 사용자의 활성 구독 여부를 확인합니다.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/lib/utils/subscription";

export const dynamic = "force-dynamic";

/**
 * GET /api/subscriptions/check
 * 구독 상태 확인
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const hasSubscription = await checkSubscription(userId);

    return NextResponse.json({
      success: true,
      hasSubscription,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "서버 오류가 발생했습니다",
      },
      { status: 500 }
    );
  }
}

