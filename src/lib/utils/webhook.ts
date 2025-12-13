import crypto from "crypto";
import type { TossWebhookEvent, ClerkWebhookEvent } from "@/lib/types/webhook";

/**
 * Toss Payments 웹훅 유틸리티 함수
 */

/**
 * Toss Payments 웹훅 서명 검증
 * 
 * Toss Payments는 웹훅 요청 본문과 시크릿 키를 사용하여 HMAC-SHA256 서명을 생성합니다.
 * 
 * @param payload - 웹훅 요청 본문 (원본 문자열)
 * @param signature - 요청 헤더의 서명 값
 * @param secretKey - Toss Payments 웹훅 시크릿 키
 * @returns 서명 검증 성공 여부
 */
export function verifyTossWebhookSignature(
  payload: string,
  signature: string | null,
  secretKey: string
): boolean {
  if (!signature) {
    return false;
  }

  try {
    // HMAC-SHA256으로 서명 생성
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(payload)
      .digest("hex");

    // 서명 비교 (타이밍 공격 방지를 위해 crypto.timingSafeEqual 사용)
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error("Error verifying Toss webhook signature:", error);
    return false;
  }
}

/**
 * 웹훅 요청에서 서명 추출
 * 
 * Toss Payments는 서명을 헤더에 포함시킵니다.
 * 일반적으로 'x-toss-signature' 또는 'toss-signature' 헤더를 사용합니다.
 * 
 * @param headers - 요청 헤더 객체
 * @returns 서명 값 또는 null
 */
export function extractTossSignature(
  headers: Headers
): string | null {
  // 여러 가능한 헤더 이름 확인
  const signatureHeader =
    headers.get("x-toss-signature") ||
    headers.get("toss-signature") ||
    headers.get("x-signature");

  return signatureHeader;
}

/**
 * 웹훅 이벤트 파싱
 * 
 * @param body - 웹훅 요청 본문 (JSON 문자열 또는 객체)
 * @returns 파싱된 웹훅 이벤트 또는 null
 */
export function parseTossWebhookEvent(
  body: unknown
): TossWebhookEvent | null {
  try {
    // 문자열인 경우 JSON 파싱
    const parsedBody =
      typeof body === "string" ? JSON.parse(body) : body;

    // 기본 구조 검증
    if (
      !parsedBody ||
      typeof parsedBody !== "object" ||
      !parsedBody.eventType ||
      !parsedBody.data
    ) {
      return null;
    }

    return parsedBody as TossWebhookEvent;
  } catch (error) {
    console.error("Error parsing Toss webhook event:", error);
    return null;
  }
}

/**
 * 웹훅 이벤트 로깅 (민감한 정보 제외)
 * 
 * @param event - 웹훅 이벤트
 * @param context - 추가 컨텍스트 정보
 */
export function logWebhookEvent(
  event: TossWebhookEvent,
  context?: Record<string, unknown>
): void {
  const logData = {
    eventType: event.eventType,
    orderId: event.data.orderId,
    customerKey: event.data.customerKey,
    amount: event.data.amount,
    status: event.data.status,
    createdAt: event.createdAt,
    ...context,
  };

  console.log("[Webhook Event]", JSON.stringify(logData, null, 2));
}

/**
 * Clerk 웹훅 유틸리티 함수
 */

/**
 * Clerk 웹훅 서명 검증
 * 
 * Clerk는 svix를 사용하여 웹훅 서명을 생성합니다.
 * 서명 형식: "v1,<timestamp>,<signature>"
 * 
 * @param payload - 웹훅 요청 본문 (원본 문자열)
 * @param signatureHeader - 요청 헤더의 서명 값 (sv1_... 형식)
 * @param secret - Clerk 웹훅 시크릿 키
 * @returns 서명 검증 성공 여부
 */
export function verifyClerkWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) {
    return false;
  }

  try {
    // Clerk 웹훅 서명 형식: "sv1_<signature>"
    // 또는 "v1,<timestamp>,<signature>" 형식
    const parts = signatureHeader.split(",");
    let signature: string;
    let timestamp: string | null = null;

    if (parts.length === 1) {
      // sv1_ 형식
      if (!signatureHeader.startsWith("sv1_")) {
        return false;
      }
      signature = signatureHeader;
    } else if (parts.length === 3) {
      // v1,<timestamp>,<signature> 형식
      const [version, ts, sig] = parts;
      if (version !== "v1") {
        return false;
      }
      timestamp = ts;
      signature = sig;
    } else {
      return false;
    }

    // 타임스탬프 검증 (5분 이내)
    if (timestamp) {
      const timestampNum = parseInt(timestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      const diff = Math.abs(now - timestampNum);
      if (diff > 300) {
        // 5분 초과
        return false;
      }
    }

    // 서명 검증
    // Clerk는 HMAC-SHA256을 사용하며, 타임스탬프와 페이로드를 결합합니다
    const signedPayload = timestamp
      ? `${timestamp}.${payload}`
      : payload;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("base64");

    // sv1_ 접두사 제거
    const actualSignature = signature.replace(/^sv1_/, "");

    // 서명 비교 (타이밍 공격 방지)
    const signatureBuffer = Buffer.from(actualSignature, "base64");
    const expectedBuffer = Buffer.from(expectedSignature, "base64");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error("Error verifying Clerk webhook signature:", error);
    return false;
  }
}

/**
 * Clerk 웹훅 요청에서 서명 추출
 * 
 * Clerk는 서명을 'svix-signature' 헤더에 포함시킵니다.
 * 
 * @param headers - 요청 헤더 객체
 * @returns 서명 값 또는 null
 */
export function extractClerkSignature(headers: Headers): string | null {
  return (
    headers.get("svix-signature") ||
    headers.get("x-svix-signature") ||
    headers.get("clerk-signature")
  );
}

/**
 * Clerk 웹훅 이벤트 파싱
 * 
 * @param body - 웹훅 요청 본문 (JSON 문자열 또는 객체)
 * @returns 파싱된 웹훅 이벤트 또는 null
 */
export function parseClerkWebhookEvent(
  body: unknown
): ClerkWebhookEvent | null {
  try {
    // 문자열인 경우 JSON 파싱
    const parsedBody =
      typeof body === "string" ? JSON.parse(body) : body;

    // 기본 구조 검증
    if (
      !parsedBody ||
      typeof parsedBody !== "object" ||
      !parsedBody.type ||
      !parsedBody.data ||
      parsedBody.object !== "event"
    ) {
      return null;
    }

    return parsedBody as ClerkWebhookEvent;
  } catch (error) {
    console.error("Error parsing Clerk webhook event:", error);
    return null;
  }
}

/**
 * Clerk 웹훅 이벤트 로깅 (민감한 정보 제외)
 * 
 * @param event - 웹훅 이벤트
 * @param context - 추가 컨텍스트 정보
 */
export function logClerkWebhookEvent(
  event: ClerkWebhookEvent,
  context?: Record<string, unknown>
): void {
  const logData = {
    eventType: event.type,
    userId: event.data.id,
    email: event.data.primary_email_address?.email_address || null,
    createdAt: new Date(event.data.created_at * 1000).toISOString(),
    ...context,
  };

  console.log("[Clerk Webhook Event]", JSON.stringify(logData, null, 2));
}

