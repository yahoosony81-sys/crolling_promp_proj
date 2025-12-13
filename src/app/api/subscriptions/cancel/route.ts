import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/utils/subscription";

export const dynamic = "force-dynamic";

/**
 * 구독 취소 API 라우트
 * PATCH 메서드로 구독 취소 처리
 */
export async function PATCH(request: Request) {
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

    // 이미 취소 예정인 경우
    if (subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: "이미 취소 예정 상태입니다" },
        { status: 400 }
      );
    }

    // 이미 취소된 경우
    if (subscription.status === "canceled") {
      return NextResponse.json(
        { error: "이미 취소된 구독입니다" },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 구독 취소 처리 (cancel_at_period_end를 true로 설정)
    const { error } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      })
      .eq("id", subscription.id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error canceling subscription:", error);
      return NextResponse.json(
        { error: "구독 취소에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "구독이 취소 예정되었습니다",
      current_period_end: subscription.current_period_end,
    });
  } catch (error) {
    console.error("Error in cancel subscription API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

