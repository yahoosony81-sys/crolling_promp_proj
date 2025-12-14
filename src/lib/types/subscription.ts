import type { Database } from "./database";

/**
 * 구독 관련 타입 정의
 */

/**
 * 구독 테이블 Row 타입
 */
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

/**
 * 구독 Insert 타입
 */
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];

/**
 * 구독 Update 타입
 */
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];

/**
 * 구독 상태 타입
 */
export type SubscriptionStatus = "active" | "past_due" | "canceled";

/**
 * 구독 플랜 이름 타입
 */
export type SubscriptionPlanName = "monthly_9900";

/**
 * 구독 플랜 정보 인터페이스
 */
export interface SubscriptionPlan {
  name: SubscriptionPlanName;
  displayName: string;
  priceKrw: number;
  priceLabel: string;
  interval: "month" | "year";
  intervalCount: number;
}

/**
 * 구독 플랜 상수
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanName, SubscriptionPlan> = {
  monthly_9900: {
    name: "monthly_9900",
    displayName: "월간 구독",
    priceKrw: 9900,
    priceLabel: "월 9,900원",
    interval: "month",
    intervalCount: 1,
  },
} as const;

/**
 * 구독 상태 라벨 타입
 */
export type SubscriptionStatusLabel =
  | "구독 없음"
  | "활성"
  | "취소 예정"
  | "취소됨"
  | "결제 대기 중"
  | "만료됨";

/**
 * 구독 상태 배지 variant 타입
 */
export type SubscriptionStatusVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

/**
 * 구독 기간 정보 인터페이스
 */
export interface SubscriptionPeriod {
  start: Date;
  end: Date;
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // 7일 이내 만료
}

/**
 * 구독 통계 정보 인터페이스
 */
export interface SubscriptionStats {
  total: number;
  active: number;
  pastDue: number;
  canceled: number;
  expiringSoon: number; // 7일 이내 만료 예정
}

