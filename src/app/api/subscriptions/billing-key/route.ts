import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { issueBillingKey, approveBillingPayment } from "@/lib/toss-payments/client";
import { getUserSubscription } from "@/lib/utils/subscription";
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

/**
 * 빌링키 발급 및 첫 결제 실행 API
 * 
 * 카드 등록 후 받은 authKey를 사용하여 빌링키를 발급하고,
 * 첫 결제를 실행합니다.
 * 
 * @param authKey - 카드 등록 시 받은 인증 키 (쿼리 파라미터)
 * @param customerKey - 고객 식별 키 (Clerk user ID, 쿼리 파라미터)
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

    // 요청 본문 파싱
    const body = await request.json();
    const { authKey, customerKey } = body;

    if (!authKey || !customerKey) {
      return NextResponse.json(
        { error: "authKey와 customerKey가 필요합니다" },
        { status: 400 }
      );
    }

    // customerKey가 현재 사용자와 일치하는지 확인
    if (customerKey !== userId) {
      return NextResponse.json(
        { error: "권한이 없습니다" },
        { status: 403 }
      );
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

    // 빌링키 발급
    const billingKeyData = await issueBillingKey(authKey, customerKey);
    const billingKey = billingKeyData.billingKey;

    // 첫 결제 실행 (월 9,900원)
    const orderId = `subscription-${userId}-${Date.now()}`;
    const orderName = "TrendScrape Prompt 프리미엄 플랜";
    const amount = 9900;
    
    const customerEmail = user.emailAddresses[0]?.emailAddress;
    const customerName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username || "고객";

    const paymentResult = await approveBillingPayment({
      billingKey,
      customerKey,
      amount,
      orderId,
      orderName,
      customerEmail,
      customerName,
    });

    // 결제 성공 응답 반환
    return NextResponse.json({
      success: true,
      billingKey,
      payment: {
        paymentKey: paymentResult.paymentKey,
        orderId: paymentResult.orderId,
        status: paymentResult.status,
        amount: paymentResult.totalAmount,
        approvedAt: paymentResult.approvedAt,
      },
    });
  } catch (error) {
    console.error("Error in billing key API:", error);
    
    // Toss Payments API 오류 처리
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}


