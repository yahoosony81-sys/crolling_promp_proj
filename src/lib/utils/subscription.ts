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

