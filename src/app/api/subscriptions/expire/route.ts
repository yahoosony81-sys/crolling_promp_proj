import { NextResponse } from "next/server";
import { requireInternalApiKey } from "@/lib/middleware/auth";
import { expireSubscriptions } from "@/lib/utils/subscription";
import { withErrorHandler, internalError } from "@/lib/utils/api-error";

export const dynamic = "force-dynamic";

/**
 * 만료된 구독 처리 배치 작업 API 라우트
 * POST /api/subscriptions/expire
 * 
 * 만료된 구독을 일괄 처리합니다.
 * 
 * 인증: 내부 API 키 또는 관리자 권한 필요
 * 실제 운영 환경에서는 Cron Job이나 Vercel Cron을 사용하여 주기적으로 호출
 */
async function POSTHandler(request: Request) {
  // 내부 API 키 확인
  requireInternalApiKey(request);

  // 만료된 구독 처리
  const expiredSubscriptions = await expireSubscriptions();

  return NextResponse.json({
    success: true,
    message: `${expiredSubscriptions.length}개의 구독이 처리되었습니다`,
    count: expiredSubscriptions.length,
    subscriptions: expiredSubscriptions,
  });
}

export const POST = withErrorHandler(POSTHandler);


