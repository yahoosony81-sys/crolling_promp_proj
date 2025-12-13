/**
 * Toss Payments 웹훅 이벤트 타입 정의
 * 
 * Toss Payments 정기결제 웹훅 이벤트 구조를 정의합니다.
 * 참고: https://docs.tosspayments.com/reference/webhook-api
 */

/**
 * Toss Payments 웹훅 이벤트 타입
 */
export type TossWebhookEventType =
  | "billing.approved" // 정기결제 성공
  | "billing.failed" // 정기결제 실패
  | "billing.canceled" // 정기결제 취소
  | "billing.ready"; // 정기결제 준비 완료

/**
 * Toss Payments 웹훅 이벤트 기본 구조
 */
export interface TossWebhookEvent {
  eventType: TossWebhookEventType;
  data: TossWebhookEventData;
  createdAt: string;
}

/**
 * Toss Payments 웹훅 이벤트 데이터
 */
export interface TossWebhookEventData {
  // 정기결제 키
  billingKey: string;
  
  // 고객 키 (Clerk user ID와 매핑)
  customerKey: string;
  
  // 주문 ID
  orderId: string;
  
  // 주문명
  orderName: string;
  
  // 결제 금액
  amount: number;
  
  // 통화 (KRW)
  currency: string;
  
  // 결제 상태
  status: "READY" | "IN_PROGRESS" | "DONE" | "CANCELED" | "PARTIAL_CANCELED" | "ABORTED" | "EXPIRED";
  
  // 결제 일시
  approvedAt?: string;
  
  // 실패 사유 (실패 시)
  failReason?: string;
  
  // 취소 일시 (취소 시)
  canceledAt?: string;
  
  // 추가 메타데이터
  metadata?: Record<string, unknown>;
}

/**
 * 웹훅 처리 결과
 */
export interface WebhookProcessResult {
  success: boolean;
  message: string;
  subscriptionId?: string;
  error?: string;
}

/**
 * Clerk 웹훅 이벤트 타입 정의
 * 
 * Clerk 웹훅 이벤트 구조를 정의합니다.
 * 참고: https://clerk.com/docs/guides/development/webhooks/overview
 */

/**
 * Clerk 웹훅 이벤트 타입
 */
export type ClerkWebhookEventType =
  | "user.created" // 사용자 생성
  | "user.updated" // 사용자 업데이트
  | "user.deleted"; // 사용자 삭제

/**
 * Clerk 웹훅 이벤트 기본 구조
 */
export interface ClerkWebhookEvent {
  data: ClerkWebhookEventData;
  object: "event";
  type: ClerkWebhookEventType;
}

/**
 * Clerk 웹훅 이벤트 데이터
 */
export interface ClerkWebhookEventData {
  id: string; // Clerk user ID
  object: "user";
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  has_image: boolean;
  primary_email_address_id: string | null;
  primary_email_address?: {
    id: string;
    email_address: string;
  } | null;
  primary_phone_number_id: string | null;
  primary_phone_number?: {
    id: string;
    phone_number: string;
  } | null;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  email_addresses: Array<{
    id: string;
    email_address: string;
    verification: {
      status: string;
    };
  }>;
  phone_numbers: Array<{
    id: string;
    phone_number: string;
    verification: {
      status: string;
    };
  }>;
  external_accounts: Array<unknown>;
  saml_accounts: Array<unknown>;
  public_metadata: Record<string, unknown>;
  private_metadata: Record<string, unknown>;
  unsafe_metadata: Record<string, unknown>;
  external_id: string | null;
  last_sign_in_at: number | null;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  verification_attempts_remaining: number | null;
  created_at: number;
  updated_at: number;
  delete: boolean; // user.deleted 이벤트에서만 true
}

