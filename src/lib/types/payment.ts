/**
 * 결제 관련 타입 정의
 * 
 * TODO: 결제 프로바이더 연동 시 사용할 인터페이스
 */

/**
 * 결제 프로바이더 타입
 */
export type PaymentProvider = "stripe" | "toss" | "none";

/**
 * 구독 생성 요청 타입
 */
export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId?: string;
  customerId?: string;
}

/**
 * 구독 생성 응답 타입
 */
export interface CreateSubscriptionResponse {
  subscriptionId: string;
  checkoutUrl?: string;
  sessionId?: string;
  status: "pending" | "active" | "failed";
}

/**
 * 결제 웹훅 이벤트 타입
 */
export interface PaymentWebhookEvent {
  type: string;
  data: {
    subscriptionId?: string;
    customerId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    [key: string]: unknown;
  };
}

/**
 * Stripe 결제 세션 타입 (예시)
 */
export interface StripeCheckoutSession {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired";
  amount_total: number;
  currency: string;
}

/**
 * Toss Payments 결제 세션 타입 (예시)
 */
export interface TossPaymentSession {
  id: string;
  url: string;
  status: "READY" | "IN_PROGRESS" | "DONE" | "CANCELED" | "PARTIAL_CANCELED" | "ABORTED" | "EXPIRED";
  amount: number;
  currency: string;
}

