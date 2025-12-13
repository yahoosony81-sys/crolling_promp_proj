import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/../database.types";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

/**
 * 구독 관련 유틸리티 함수
 */

/**
 * 구독이 활성 상태인지 확인
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

/**
 * 사용자의 활성 구독 여부 확인
 * @param userId - 사용자 ID (Clerk user ID)
 * @returns 활성 구독 여부
 */
export async function checkSubscription(
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("Error checking subscription:", error);
    return false;
  }

  return isSubscriptionActive(data);
}

/**
 * 사용자의 구독 정보 조회
 * @param userId - 사용자 ID (Clerk user ID)
 * @returns 구독 정보 또는 null
 */
export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data;
}

/**
 * 구독 상태를 한글 라벨로 변환
 * @param subscription - 구독 객체
 * @returns 한글 상태 라벨
 */
export function getSubscriptionStatusLabel(
  subscription: Subscription | null
): string {
  if (!subscription) {
    return "구독 없음";
  }

  const isActive = isSubscriptionActive(subscription);

  if (subscription.cancel_at_period_end) {
    return "취소 예정";
  }

  if (isActive) {
    return "활성";
  }

  if (subscription.status === "canceled") {
    return "취소됨";
  }

  if (subscription.status === "past_due") {
    return "결제 대기 중";
  }

  return "만료됨";
}

/**
 * 구독 상태에 따른 배지 variant 반환
 * @param subscription - 구독 객체
 * @returns Badge variant
 */
export function getSubscriptionStatusVariant(
  subscription: Subscription | null
): "default" | "secondary" | "destructive" | "outline" {
  if (!subscription) {
    return "outline";
  }

  const isActive = isSubscriptionActive(subscription);

  if (subscription.cancel_at_period_end) {
    return "secondary";
  }

  if (isActive) {
    return "default";
  }

  return "outline";
}

