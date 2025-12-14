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

/**
 * Toss Payments 빌링키 발급 요청 타입
 */
export interface TossBillingKeyRequest {
  authKey: string;
  customerKey: string;
}

/**
 * Toss Payments 빌링키 발급 응답 타입
 */
export interface TossBillingKeyResponse {
  billingKey: string;
  customerKey: string;
  method: string;
  card: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    cardType: string;
    ownerType: string;
  };
}

/**
 * Toss Payments 자동결제 승인 요청 타입
 */
export interface TossBillingPaymentRequest {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
}

/**
 * Toss Payments 자동결제 승인 응답 타입
 */
export interface TossBillingPaymentResponse {
  mId: string;
  version: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  currency: string;
  method: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  status: string;
  requestedAt: string;
  approvedAt: string;
  card: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    receiptUrl: string;
  };
}

/**
 * 결제 세션 생성 응답 타입
 */
export interface CreateCheckoutSessionResponse {
  success: boolean;
  customerKey: string;
  successUrl: string;
  failUrl: string;
}

