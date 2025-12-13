import { NextResponse } from "next/server";
import {
  verifyClerkWebhookSignature,
  extractClerkSignature,
  parseClerkWebhookEvent,
  logClerkWebhookEvent,
} from "@/lib/utils/webhook";
import {
  syncClerkUserToSupabase,
  updateClerkUserInSupabase,
  deleteClerkUserFromSupabase,
} from "@/lib/utils/clerk-sync";
import type {
  ClerkWebhookEventType,
  ClerkWebhookEvent,
} from "@/lib/types/webhook";

export const dynamic = "force-dynamic";

/**
 * Clerk 웹훅 처리 API 라우트
 * 
 * Clerk로부터 전송되는 웹훅 이벤트를 처리합니다.
 * 
 * 지원 이벤트:
 * - user.created: 사용자 생성 → Supabase에 사용자 동기화
 * - user.updated: 사용자 업데이트 → Supabase 사용자 정보 업데이트
 * - user.deleted: 사용자 삭제 → Supabase에서 사용자 삭제
 * 
 * 보안:
 * - 모든 요청은 서명 검증을 거쳐야 합니다.
 * - 서명 검증 실패 시 401 Unauthorized 반환
 * 
 * 참고:
 * - Clerk 대시보드에서 웹훅 URL을 설정해야 합니다.
 * - 환경 변수 CLERK_WEBHOOK_SECRET을 설정해야 합니다.
 */
export async function POST(request: Request) {
  try {
    // 환경 변수 확인
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "웹훅 시크릿 키가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    // 요청 본문 읽기 (서명 검증을 위해 원본 문자열 필요)
    const body = await request.text();

    // 서명 추출 및 검증
    const signature = extractClerkSignature(request.headers);
    if (!signature) {
      console.warn("Missing Clerk webhook signature");
      return NextResponse.json(
        { error: "서명이 없습니다" },
        { status: 401 }
      );
    }

    const isValid = verifyClerkWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.warn("Invalid Clerk webhook signature");
      return NextResponse.json(
        { error: "서명 검증 실패" },
        { status: 401 }
      );
    }

    // 웹훅 이벤트 파싱
    const event = parseClerkWebhookEvent(body);
    if (!event) {
      console.warn("Failed to parse Clerk webhook event");
      return NextResponse.json(
        { error: "웹훅 이벤트 파싱 실패" },
        { status: 400 }
      );
    }

    // 웹훅 이벤트 로깅 (민감한 정보 제외)
    logClerkWebhookEvent(event, {
      endpoint: "/api/webhooks/clerk",
    });

    // 이벤트 타입별 처리
    const result = await handleClerkWebhookEvent(event);

    if (!result.success) {
      console.error("Clerk webhook event handling failed:", result.error);
      return NextResponse.json(
        { error: result.error || "웹훅 처리 실패" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      userId: result.userId,
    });
  } catch (error) {
    console.error("Error processing Clerk webhook:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * Clerk 웹훅 이벤트 타입별 처리
 * 
 * @param event - 웹훅 이벤트
 * @returns 처리 결과
 */
async function handleClerkWebhookEvent(
  event: ClerkWebhookEvent
): Promise<{
  success: boolean;
  message: string;
  userId?: string;
  error?: string;
}> {
  const { type, data } = event;
  const clerkUserId = data.id;

  switch (type as ClerkWebhookEventType) {
    case "user.created": {
      // 사용자 생성 → Supabase에 동기화
      const userId = await syncClerkUserToSupabase(data);

      if (!userId) {
        return {
          success: false,
          message: "사용자 동기화 실패",
          error: "Failed to sync user to Supabase",
        };
      }

      return {
        success: true,
        message: "사용자가 Supabase에 동기화되었습니다",
        userId,
      };
    }

    case "user.updated": {
      // 사용자 업데이트 → Supabase 사용자 정보 업데이트
      const success = await updateClerkUserInSupabase(data);

      if (!success) {
        return {
          success: false,
          message: "사용자 정보 업데이트 실패",
          error: "Failed to update user in Supabase",
        };
      }

      return {
        success: true,
        message: "사용자 정보가 업데이트되었습니다",
        userId: clerkUserId,
      };
    }

    case "user.deleted": {
      // 사용자 삭제 → Supabase에서 삭제
      const success = await deleteClerkUserFromSupabase(clerkUserId);

      if (!success) {
        return {
          success: false,
          message: "사용자 삭제 실패",
          error: "Failed to delete user from Supabase",
        };
      }

      return {
        success: true,
        message: "사용자가 삭제되었습니다",
        userId: clerkUserId,
      };
    }

    default: {
      // 지원하지 않는 이벤트 타입
      return {
        success: false,
        message: `지원하지 않는 이벤트 타입: ${type}`,
        error: `Unsupported event type: ${type}`,
      };
    }
  }
}

