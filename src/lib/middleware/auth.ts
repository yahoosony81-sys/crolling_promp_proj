import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkSubscription } from "@/lib/utils/subscription";

/**
 * 인증 미들웨어 유틸리티
 * 
 * API 라우트에서 인증 및 권한을 확인하기 위한 미들웨어 함수들을 제공합니다.
 */

/**
 * 인증이 필요한 API용 미들웨어
 * 
 * @returns 인증된 사용자의 ID
 * @throws NextResponse (401 Unauthorized) - 인증되지 않은 경우
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();

  if (!userId) {
    // NextResponse를 throw하면 withErrorHandler에서 catch하여 반환
    const errorResponse = NextResponse.json(
      { error: "인증이 필요합니다", code: "UNAUTHORIZED" },
      { status: 401 }
    );
    throw errorResponse;
  }

  return { userId };
}

/**
 * 구독이 필요한 API용 미들웨어
 * 
 * 인증과 구독 상태를 모두 확인합니다.
 * 
 * @returns 인증된 사용자의 ID
 * @throws NextResponse (401 Unauthorized) - 인증되지 않은 경우
 * @throws NextResponse (403 Forbidden) - 구독이 없는 경우
 */
export async function requireSubscription(): Promise<{ userId: string }> {
  // 먼저 인증 확인
  const { userId } = await requireAuth();

  // 구독 상태 확인
  const hasSubscription = await checkSubscription(userId);

  if (!hasSubscription) {
    // NextResponse를 throw하면 withErrorHandler에서 catch하여 반환
    const errorResponse = NextResponse.json(
      {
        error: "구독이 필요합니다",
        code: "SUBSCRIPTION_REQUIRED",
      },
      { status: 403 }
    );
    throw errorResponse;
  }

  return { userId };
}

/**
 * 내부 API 키가 필요한 API용 미들웨어
 * 
 * Vercel Cron Job이나 내부 시스템에서 호출하는 API용입니다.
 * 
 * @param request - 요청 객체
 * @throws NextResponse (401 Unauthorized) - 인증되지 않은 경우
 */
export function requireInternalApiKey(request: Request): void {
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!apiKey) {
    // 환경 변수가 설정되지 않은 경우 개발 환경에서는 통과
    if (process.env.NODE_ENV === "development") {
      return;
    }
    const errorResponse = NextResponse.json(
      { error: "내부 API 키가 설정되지 않았습니다", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
    throw errorResponse;
  }

  if (authHeader !== `Bearer ${apiKey}`) {
    const errorResponse = NextResponse.json(
      { error: "인증이 필요합니다", code: "UNAUTHORIZED" },
      { status: 401 }
    );
    throw errorResponse;
  }
}

/**
 * 선택적 인증 API용 미들웨어
 * 
 * 인증이 있으면 사용자 ID를 반환하고, 없으면 null을 반환합니다.
 * 
 * @returns 사용자 ID 또는 null
 */
export async function optionalAuth(): Promise<{ userId: string | null }> {
  const { userId } = await auth();
  return { userId: userId || null };
}

/**
 * 관리자 권한이 필요한 API용 미들웨어
 * 
 * 현재는 구현되지 않았으며, 향후 관리자 기능 추가 시 구현 예정입니다.
 * 
 * @returns 인증된 사용자의 ID
 * @throws NextResponse (403 Forbidden) - 관리자 권한이 없는 경우
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await requireAuth();

  // TODO: 관리자 권한 확인 로직 구현
  // 현재는 모든 인증된 사용자를 허용
  // const isAdmin = await checkAdminRole(userId);
  // if (!isAdmin) {
  //   throw NextResponse.json(
  //     { error: "관리자 권한이 필요합니다", code: "FORBIDDEN" },
  //     { status: 403 }
  //   );
  // }

  return { userId };
}

