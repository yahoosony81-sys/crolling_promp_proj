import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { renewSubscription, getUserSubscription } from "@/lib/utils/subscription";

export const dynamic = "force-dynamic";

/**
 * 구독 갱신 API 라우트
 * POST /api/subscriptions/renew
 * 
 * 사용자의 구독을 1개월 연장합니다.
 * 
 * TODO: 실제 결제 프로바이더 연동 필요
 * - Toss Payments 정기결제 호출
 * - 결제 성공 후 구독 갱신
 */
export async function POST() {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 구독 정보 조회
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return NextResponse.json(
        { error: "구독 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 이미 취소된 구독은 갱신 불가
    if (subscription.status === "canceled") {
      return NextResponse.json(
        { error: "취소된 구독은 갱신할 수 없습니다" },
        { status: 400 }
      );
    }

    // TODO: 실제 결제 프로바이더 연동
    // 1. Toss Payments 정기결제 호출
    // 2. 결제 성공 확인
    // 3. 결제 성공 후 renewSubscription() 호출

    // 임시: 결제 연동 전까지는 구조만 준비
    // 실제로는 결제 성공 후에만 갱신 처리
    const renewedSubscription = await renewSubscription(userId);

    if (!renewedSubscription) {
      return NextResponse.json(
        { error: "구독 갱신에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "구독이 갱신되었습니다",
      subscription: renewedSubscription,
      note: "실제 결제 연동 후 결제 성공 시에만 갱신됩니다",
    });
  } catch (error) {
    console.error("Error in subscription renew API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}


