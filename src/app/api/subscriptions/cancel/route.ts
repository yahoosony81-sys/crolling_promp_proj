import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/middleware/auth";
import { getUserSubscription } from "@/lib/utils/subscription";
import { withErrorHandler, notFound, badRequest, internalError } from "@/lib/utils/api-error";

export const dynamic = "force-dynamic";

/**
 * 구독 취소 API 라우트
 * PATCH 메서드로 구독 취소 처리
 */
async function PATCHHandler(request: Request) {
  // 인증 확인
  const { userId } = await requireAuth();

  // 구독 정보 조회
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return notFound("구독 정보를 찾을 수 없습니다");
  }

  // 이미 취소 예정인 경우
  if (subscription.cancel_at_period_end) {
    return badRequest("이미 취소 예정 상태입니다");
  }

  // 이미 취소된 경우
  if (subscription.status === "canceled") {
    return badRequest("이미 취소된 구독입니다");
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
    return internalError("구독 취소에 실패했습니다");
  }

  return NextResponse.json({
    success: true,
    message: "구독이 취소 예정되었습니다",
    current_period_end: subscription.current_period_end,
  });
}

export const PATCH = withErrorHandler(PATCHHandler);

