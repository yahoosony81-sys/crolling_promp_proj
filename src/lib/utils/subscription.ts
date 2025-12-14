import { createClient } from "@/lib/supabase/server";
import type {
  Subscription,
  SubscriptionInsert,
  SubscriptionStatus,
  SubscriptionPlanName,
} from "@/lib/types/subscription";

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

  const subscriptionData: SubscriptionInsert = {
    user_id: userId,
    status: "active",
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

/**
 * 만료된 구독을 처리하는 함수
 * 
 * current_period_end가 지난 구독을 찾아서 상태를 업데이트합니다.
 * - cancel_at_period_end가 true인 경우: status를 "canceled"로 변경
 * - 그 외의 경우: status를 "past_due"로 변경 (결제 실패로 간주)
 * 
 * @returns 업데이트된 구독 목록
 */
export async function expireSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 만료된 구독 조회 (current_period_end가 지난 구독)
  const { data: expiredSubscriptions, error: fetchError } = await supabase
    .from("subscriptions")
    .select("*")
    .lt("current_period_end", now)
    .in("status", ["active", "past_due"]);

  if (fetchError) {
    console.error("Error fetching expired subscriptions:", fetchError);
    return [];
  }

  if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
    return [];
  }

  const updatedSubscriptions: Subscription[] = [];

  // 각 구독을 상태에 따라 업데이트
  for (const subscription of expiredSubscriptions) {
    let newStatus: SubscriptionStatus;

    if (subscription.cancel_at_period_end) {
      // 취소 예정이었던 경우 완전히 취소 처리
      newStatus = "canceled";
    } else {
      // 그 외의 경우 결제 대기 상태로 변경
      newStatus = "past_due";
    }

    const { data: updated, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: newStatus,
        canceled_at: newStatus === "canceled" ? now : subscription.canceled_at,
      })
      .eq("id", subscription.id)
      .select()
      .single();

    if (updateError) {
      console.error(
        `Error updating subscription ${subscription.id}:`,
        updateError
      );
      continue;
    }

    if (updated) {
      updatedSubscriptions.push(updated);
    }
  }

  return updatedSubscriptions;
}

/**
 * 만료 예정 구독 조회
 * 
 * @param days - 만료 예정일까지의 일수 (기본값: 7일)
 * @returns 만료 예정 구독 목록
 */
export async function getExpiringSubscriptions(
  days: number = 7
): Promise<Subscription[]> {
  const supabase = await createClient();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "active")
    .gte("current_period_end", now.toISOString())
    .lte("current_period_end", futureDate.toISOString())
    .order("current_period_end", { ascending: true });

  if (error) {
    console.error("Error fetching expiring subscriptions:", error);
    return [];
  }

  return data || [];
}

/**
 * 구독 갱신 함수
 * 
 * 사용자의 구독을 1개월 연장합니다.
 * - current_period_start를 이전 current_period_end로 설정
 * - current_period_end를 1개월 연장
 * - status를 "active"로 유지
 * - cancel_at_period_end가 true인 경우 false로 변경 (갱신 시 취소 예정 해제)
 * 
 * @param userId - 사용자 ID (Clerk user ID)
 * @returns 갱신된 구독 정보 또는 null
 */
export async function renewSubscription(
  userId: string
): Promise<Subscription | null> {
  const supabase = await createClient();

  const existingSubscription = await getUserSubscription(userId);
  if (!existingSubscription) {
    console.warn("Subscription not found for renewal:", userId);
    return null;
  }

  // 현재 기간 종료일을 기준으로 새 기간 설정
  const periodStart = new Date(existingSubscription.current_period_end);
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false, // 갱신 시 취소 예정 해제
      canceled_at: null, // 취소 일시 초기화
    })
    .eq("id", existingSubscription.id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error renewing subscription:", error);
    return null;
  }

  return data;
}

/**
 * 구독 상태 업데이트 함수
 * 
 * @param subscriptionId - 구독 ID
 * @param status - 새 상태 (SubscriptionStatus)
 * @param additionalData - 추가 업데이트할 데이터 (선택사항)
 * @returns 업데이트된 구독 정보 또는 null
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
  additionalData?: Partial<Subscription>
): Promise<Subscription | null> {
  const supabase = await createClient();

  const updateData: Partial<Subscription> = {
    status,
    ...additionalData,
  };

  const { data, error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating subscription status:", error);
    return null;
  }

  return data;
}

