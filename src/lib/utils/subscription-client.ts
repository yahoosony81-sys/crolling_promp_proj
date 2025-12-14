import type { Subscription } from "@/lib/types/subscription";

/**
 * 클라이언트 컴포넌트에서 사용 가능한 구독 관련 유틸리티 함수
 * 
 * 서버 전용 함수와 달리 Supabase 클라이언트를 사용하지 않으므로
 * 클라이언트 컴포넌트에서 안전하게 사용할 수 있습니다.
 */

/**
 * 구독이 활성 상태인지 확인 (클라이언트용)
 * @param subscription - 구독 객체
 * @returns 활성 상태 여부
 */
export function isSubscriptionActive(
  subscription: Subscription | null
): boolean {
  if (!subscription) {
    return false;
  }

  // status가 'active'이고 만료일이 미래인 경우만 활성
  const isActiveStatus = subscription.status === "active";
  const isNotExpired =
    new Date(subscription.current_period_end) > new Date();

  return isActiveStatus && isNotExpired;
}

