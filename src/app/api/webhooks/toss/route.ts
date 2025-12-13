import { NextResponse } from "next/server";
import {
  verifyTossWebhookSignature,
  extractTossSignature,
  parseTossWebhookEvent,
  logWebhookEvent,
} from "@/lib/utils/webhook";
import {
  createOrUpdateSubscriptionFromWebhook,
  markSubscriptionAsPastDue,
  cancelSubscriptionFromWebhook,
} from "@/lib/utils/subscription";
import type {
  TossWebhookEventType,
  TossWebhookEvent,
  WebhookProcessResult,
} from "@/lib/types/webhook";

export const dynamic = "force-dynamic";

/**
 * Toss Payments 웹훅 처리 API 라우트
 * 
 * Toss Payments로부터 전송되는 웹훅 이벤트를 처리합니다.
 * 
 * 지원 이벤트:
 * - billing.approved: 정기결제 성공 → 구독 생성/활성화
 * - billing.failed: 정기결제 실패 → 구독 상태를 past_due로 변경
 * - billing.canceled: 정기결제 취소 → 구독 상태를 canceled로 변경
 * 
 * 보안:
 * - 모든 요청은 서명 검증을 거쳐야 합니다.
 * - 서명 검증 실패 시 401 Unauthorized 반환
 */
export async function POST(request: Request) {
  try {
    // 환경 변수 확인
    const webhookSecret = process.env.TOSS_PAYMENTS_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("TOSS_PAYMENTS_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "웹훅 시크릿 키가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    // 요청 본문 읽기 (서명 검증을 위해 원본 문자열 필요)
    const body = await request.text();

    // 서명 추출 및 검증
    const signature = extractTossSignature(request.headers);
    if (!signature) {
      console.warn("Missing webhook signature");
      return NextResponse.json(
        { error: "서명이 없습니다" },
        { status: 401 }
      );
    }

    const isValid = verifyTossWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.warn("Invalid webhook signature");
      return NextResponse.json(
        { error: "서명 검증 실패" },
        { status: 401 }
      );
    }

    // 웹훅 이벤트 파싱
    const event = parseTossWebhookEvent(body);
    if (!event) {
      console.warn("Failed to parse webhook event");
      return NextResponse.json(
        { error: "웹훅 이벤트 파싱 실패" },
        { status: 400 }
      );
    }

    // 웹훅 이벤트 로깅 (민감한 정보 제외)
    logWebhookEvent(event, {
      endpoint: "/api/webhooks/toss",
    });

    // 이벤트 타입별 처리
    const result = await handleWebhookEvent(event);

    if (!result.success) {
      console.error("Webhook event handling failed:", result.error);
      return NextResponse.json(
        { error: result.error || "웹훅 처리 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      subscriptionId: result.subscriptionId,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 웹훅 이벤트 타입별 처리
 * 
 * @param event - 웹훅 이벤트
 * @returns 처리 결과
 */
async function handleWebhookEvent(
  event: TossWebhookEvent
): Promise<WebhookProcessResult> {
  const { eventType, data } = event;
  const { customerKey, billingKey, orderId, amount, approvedAt, canceledAt } =
    data;

  // customerKey는 Clerk user ID와 동일
  const userId = customerKey;

  switch (eventType as TossWebhookEventType) {
    case "billing.approved": {
      // 정기결제 성공 → 구독 생성 또는 활성화
      const subscription = await createOrUpdateSubscriptionFromWebhook(
        userId,
        billingKey,
        orderId,
        amount,
        approvedAt
      );

      if (!subscription) {
        return {
          success: false,
          message: "구독 생성/업데이트 실패",
          error: "Failed to create or update subscription",
        };
      }

      return {
        success: true,
        message: "구독이 활성화되었습니다",
        subscriptionId: subscription.id,
      };
    }

    case "billing.failed": {
      // 정기결제 실패 → 구독 상태를 past_due로 변경
      const subscription = await markSubscriptionAsPastDue(userId);

      if (!subscription) {
        return {
          success: false,
          message: "구독 상태 업데이트 실패",
          error: "Failed to update subscription status",
        };
      }

      return {
        success: true,
        message: "구독 상태가 결제 대기 중으로 변경되었습니다",
        subscriptionId: subscription.id,
      };
    }

    case "billing.canceled": {
      // 정기결제 취소 → 구독 상태를 canceled로 변경
      const subscription = await cancelSubscriptionFromWebhook(
        userId,
        canceledAt
      );

      if (!subscription) {
        return {
          success: false,
          message: "구독 취소 실패",
          error: "Failed to cancel subscription",
        };
      }

      return {
        success: true,
        message: "구독이 취소되었습니다",
        subscriptionId: subscription.id,
      };
    }

    case "billing.ready": {
      // 정기결제 준비 완료 → 특별한 처리가 필요하지 않음
      return {
        success: true,
        message: "정기결제 준비 완료",
      };
    }

    default: {
      // 지원하지 않는 이벤트 타입
      return {
        success: false,
        message: `지원하지 않는 이벤트 타입: ${eventType}`,
        error: `Unsupported event type: ${eventType}`,
      };
    }
  }
}

