/**
 * Toss Payments 서버 사이드 클라이언트 유틸리티
 * 
 * Toss Payments REST API를 호출하기 위한 헬퍼 함수들입니다.
 * 서버 사이드에서만 사용해야 합니다.
 */

const TOSS_PAYMENTS_API_BASE_URL = "https://api.tosspayments.com";

/**
 * Toss Payments API 인증 헤더 생성
 * 
 * 시크릿 키를 base64로 인코딩하여 Basic 인증 헤더를 생성합니다.
 * 
 * @param secretKey - Toss Payments 시크릿 키
 * @returns Basic 인증 헤더 값
 */
function createAuthHeader(secretKey: string): string {
  // 시크릿 키 뒤에 ':'를 추가하고 base64 인코딩
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Toss Payments API 요청
 * 
 * @param endpoint - API 엔드포인트 (예: '/v1/billing/authorizations/issue')
 * @param options - fetch 옵션
 * @returns API 응답
 */
async function tossApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("TOSS_PAYMENTS_SECRET_KEY 환경 변수가 설정되지 않았습니다");
  }

  const url = `${TOSS_PAYMENTS_API_BASE_URL}${endpoint}`;
  const authHeader = createAuthHeader(secretKey);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Toss Payments API 오류: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
    );
  }

  return response.json();
}

/**
 * 빌링키 발급 요청
 * 
 * 카드 등록 후 받은 authKey와 customerKey를 사용하여 빌링키를 발급합니다.
 * 
 * @param authKey - 카드 등록 시 받은 인증 키
 * @param customerKey - 고객 식별 키 (Clerk user ID)
 * @returns 빌링키 정보
 */
export async function issueBillingKey(
  authKey: string,
  customerKey: string
): Promise<{
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
}> {
  return tossApiRequest("/v1/billing/authorizations/issue", {
    method: "POST",
    body: JSON.stringify({
      authKey,
      customerKey,
    }),
  });
}

/**
 * 빌링키로 자동결제 승인 요청
 * 
 * 발급받은 빌링키를 사용하여 자동결제를 실행합니다.
 * 
 * @param billingKey - 빌링키
 * @param customerKey - 고객 식별 키 (Clerk user ID)
 * @param amount - 결제 금액 (원)
 * @param orderId - 주문 ID
 * @param orderName - 주문명
 * @param customerEmail - 고객 이메일
 * @param customerName - 고객 이름
 * @returns 결제 승인 결과
 */
export async function approveBillingPayment(params: {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
}): Promise<{
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
}> {
  const { billingKey, ...body } = params;
  
  return tossApiRequest(`/v1/billing/${billingKey}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

