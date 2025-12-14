import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/utils/subscription";
import type { CreateCheckoutSessionResponse } from "@/lib/types/payment";

export const dynamic = "force-dynamic";

/**
 * 구독 생성 API 라우트
 * 
 * Toss Payments를 사용한 정기결제 구독을 생성합니다.
 * 
 * 플로우:
 * 1. 사용자 인증 확인
 * 2. 기존 활성 구독 체크
 * 3. Clerk에서 사용자 정보 조회
 * 4. 결제 세션 정보 반환 (customerKey, successUrl, failUrl)
 * 5. 클라이언트에서 카드 등록창 표시
 * 6. 카드 등록 성공 시 successUrl로 리다이렉트 (authKey 포함)
 * 7. 서버에서 authKey로 빌링키 발급
 * 8. 빌링키로 첫 결제 실행
 * 9. 웹훅으로 결제 확인 및 구독 활성화
 */
export async function POST(request: Request) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    // 이미 구독 중인지 확인
    const existingSubscription = await getUserSubscription(userId);
    if (existingSubscription) {
      const isActive =
        existingSubscription.status === "active" &&
        new Date(existingSubscription.current_period_end) > new Date();

      if (isActive) {
        return NextResponse.json(
          { error: "이미 활성 구독이 있습니다" },
          { status: 400 }
        );
      }
    }

    // Clerk에서 사용자 정보 조회
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 환경 변수 확인
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const clientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;
    
    if (!clientKey) {
      console.error("NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY 환경 변수가 설정되지 않았습니다");
      return NextResponse.json(
        { error: "결제 설정이 완료되지 않았습니다" },
        { status: 500 }
      );
    }

    // 결제 세션 정보 생성
    // customerKey는 Clerk user ID를 사용
    const customerKey = userId;
    const successUrl = `${appUrl}/checkout/success`;
    const failUrl = `${appUrl}/checkout/cancel`;

    const response: CreateCheckoutSessionResponse = {
      success: true,
      customerKey,
      successUrl,
      failUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in subscription create API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * 구독 상태 조회 (GET)
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다" },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(userId);
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Error in subscription get API:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

