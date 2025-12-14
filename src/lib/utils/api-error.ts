import { NextResponse } from "next/server";

/**
 * API 에러 처리 유틸리티
 * 
 * 표준화된 에러 응답 형식을 제공합니다.
 */

/**
 * 에러 코드 타입
 */
export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "SUBSCRIPTION_REQUIRED"
  | "INTERNAL_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "CONFLICT"
  | "PAYMENT_REQUIRED";

/**
 * API 에러 응답 인터페이스
 */
export interface ApiErrorResponse {
  error: string;
  code: ApiErrorCode;
  details?: unknown;
  timestamp?: string;
}

/**
 * HTTP 상태 코드와 에러 코드 매핑
 */
const STATUS_CODE_MAP: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  VALIDATION_ERROR: 400,
  SUBSCRIPTION_REQUIRED: 403,
  INTERNAL_ERROR: 500,
  RATE_LIMIT_EXCEEDED: 429,
  CONFLICT: 409,
  PAYMENT_REQUIRED: 402,
};

/**
 * 표준화된 에러 응답 생성
 * 
 * @param code - 에러 코드
 * @param message - 에러 메시지 (선택사항, 기본값 사용)
 * @param details - 추가 상세 정보 (선택사항)
 * @returns NextResponse 객체
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const statusCode = STATUS_CODE_MAP[code] || 500;
  const defaultMessages: Record<ApiErrorCode, string> = {
    UNAUTHORIZED: "인증이 필요합니다",
    FORBIDDEN: "접근 권한이 없습니다",
    NOT_FOUND: "요청한 리소스를 찾을 수 없습니다",
    BAD_REQUEST: "잘못된 요청입니다",
    VALIDATION_ERROR: "입력 데이터 검증에 실패했습니다",
    SUBSCRIPTION_REQUIRED: "구독이 필요합니다",
    INTERNAL_ERROR: "서버 오류가 발생했습니다",
    RATE_LIMIT_EXCEEDED: "요청 한도를 초과했습니다",
    CONFLICT: "리소스 충돌이 발생했습니다",
    PAYMENT_REQUIRED: "결제가 필요합니다",
  };

  const errorMessage = message || defaultMessages[code];

  const response: ApiErrorResponse = {
    error: errorMessage,
    code,
    timestamp: new Date().toISOString(),
  };

  if (details !== undefined) {
    response.details = details;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * 인증 오류 응답
 */
export function unauthorized(message?: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse("UNAUTHORIZED", message);
}

/**
 * 권한 오류 응답
 */
export function forbidden(message?: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse("FORBIDDEN", message);
}

/**
 * 리소스 없음 응답
 */
export function notFound(message?: string): NextResponse<ApiErrorResponse> {
  return createErrorResponse("NOT_FOUND", message);
}

/**
 * 잘못된 요청 응답
 */
export function badRequest(
  message?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse("BAD_REQUEST", message, details);
}

/**
 * 검증 오류 응답
 */
export function validationError(
  message?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse("VALIDATION_ERROR", message, details);
}

/**
 * 구독 필요 응답
 */
export function subscriptionRequired(
  message?: string
): NextResponse<ApiErrorResponse> {
  return createErrorResponse("SUBSCRIPTION_REQUIRED", message);
}

/**
 * 서버 오류 응답
 */
export function internalError(
  message?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  // 프로덕션 환경에서는 상세 정보를 숨김
  if (process.env.NODE_ENV === "production") {
    return createErrorResponse("INTERNAL_ERROR", "서버 오류가 발생했습니다");
  }

  return createErrorResponse("INTERNAL_ERROR", message, details);
}

/**
 * Rate Limit 초과 응답
 */
export function rateLimitExceeded(
  message?: string
): NextResponse<ApiErrorResponse> {
  return createErrorResponse("RATE_LIMIT_EXCEEDED", message);
}

/**
 * 충돌 응답
 */
export function conflict(
  message?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return createErrorResponse("CONFLICT", message, details);
}

/**
 * 결제 필요 응답
 */
export function paymentRequired(
  message?: string
): NextResponse<ApiErrorResponse> {
  return createErrorResponse("PAYMENT_REQUIRED", message);
}

/**
 * 에러 로깅 유틸리티
 * 
 * @param error - 에러 객체
 * @param context - 추가 컨텍스트 정보
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error("[API Error]", {
    message: errorMessage,
    stack: errorStack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 에러 핸들러 래퍼
 * 
 * API 라우트에서 에러를 일관되게 처리하기 위한 래퍼 함수
 * 
 * @param handler - API 핸들러 함수
 * @returns 래핑된 핸들러 함수
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // NextResponse가 throw된 경우 그대로 반환
      if (error instanceof NextResponse) {
        return error;
      }

      // 알 수 없는 에러는 내부 서버 오류로 처리
      logError(error, {
        handler: handler.name,
        args: args.length,
      });

      return internalError(
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : String(error)
          : undefined
      );
    }
  };
}

