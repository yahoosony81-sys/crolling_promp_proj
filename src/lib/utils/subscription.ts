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

/**
 * 웹훅에서 사용할 구독 생성 또는 업데이트 함수
 * 
 * Toss Payments 웹훅에서 정기결제 성공 시 호출됩니다.
 * 
 * @param userId - 사용자 ID (Clerk user ID, customerKey)
 * @param billingKey - Toss Payments 정기결제 키
 * @param orderId - 주문 ID
 * @param amount - 결제 금액
 * @param approvedAt - 결제 승인 일시
 * @returns 생성/업데이트된 구독 정보
 */
export async function createOrUpdateSubscriptionFromWebhook(
  userId: string,
  billingKey: string,
  orderId: string,
  amount: number,
  approvedAt?: string
): Promise<Subscription | null> {
  const supabase = await createClient();

  // 기존 구독 확인
  const existingSubscription = await getUserSubscription(userId);

  const now = approvedAt ? new Date(approvedAt) : new Date();
  const periodStart = existingSubscription
    ? new Date(existingSubscription.current_period_end)
    : now;
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subscriptionData = {
    user_id: userId,
    status: "active" as const,
    plan_name: "monthly_9900",
    price_krw: amount,
    current_period_start: periodStart.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    canceled_at: null,
  };

  if (existingSubscription) {
    // 기존 구독 업데이트
    const { data, error } = await supabase
      .from("subscriptions")
      .update(subscriptionData)
      .eq("id", existingSubscription.id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating subscription from webhook:", error);
      return null;
    }

    return data;
  } else {
    // 새 구독 생성
    const { data, error } = await supabase
      .from("subscriptions")
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      console.error("Error creating subscription from webhook:", error);
      return null;
    }

    return data;
  }
}

/**
 * 웹훅에서 사용할 구독 실패 처리 함수
 * 
 * Toss Payments 웹훅에서 정기결제 실패 시 호출됩니다.
 * 
 * @param userId - 사용자 ID (Clerk user ID, customerKey)
 * @returns 업데이트된 구독 정보 또는 null
 */
export async function markSubscriptionAsPastDue(
  userId: string
): Promise<Subscription | null> {
  const supabase = await createClient();

  const existingSubscription = await getUserSubscription(userId);
  if (!existingSubscription) {
    console.warn("Subscription not found for past_due update:", userId);
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
    })
    .eq("id", existingSubscription.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error marking subscription as past_due:", error);
    return null;
  }

  return data;
}

/**
 * 웹훅에서 사용할 구독 취소 처리 함수
 * 
 * Toss Payments 웹훅에서 정기결제 취소 시 호출됩니다.
 * 
 * @param userId - 사용자 ID (Clerk user ID, customerKey)
 * @param canceledAt - 취소 일시
 * @returns 업데이트된 구독 정보 또는 null
 */
export async function cancelSubscriptionFromWebhook(
  userId: string,
  canceledAt?: string
): Promise<Subscription | null> {
  const supabase = await createClient();

  const existingSubscription = await getUserSubscription(userId);
  if (!existingSubscription) {
    console.warn("Subscription not found for cancellation:", userId);
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: canceledAt || new Date().toISOString(),
      cancel_at_period_end: false,
    })
    .eq("id", existingSubscription.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error canceling subscription from webhook:", error);
    return null;
  }

  return data;
}

