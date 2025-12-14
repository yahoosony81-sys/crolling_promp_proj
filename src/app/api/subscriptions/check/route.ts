/**
 * 구독 상태 확인 API 라우트
 * GET /api/subscriptions/check
 *
 * 현재 사용자의 활성 구독 여부를 확인합니다.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { checkSubscription } from "@/lib/utils/subscription";
import { withErrorHandler, internalError } from "@/lib/utils/api-error";

export const dynamic = "force-dynamic";

/**
 * GET /api/subscriptions/check
 * 구독 상태 확인
 */
async function GETHandler() {
  const { userId } = await requireAuth();

  const hasSubscription = await checkSubscription(userId);

  return NextResponse.json({
    success: true,
    hasSubscription,
  });
}

export const GET = withErrorHandler(GETHandler);

