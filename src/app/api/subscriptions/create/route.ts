import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/utils/subscription";

export const dynamic = "force-dynamic";

/**
 * 구독 생성 API 라우트
 * 
 * TODO: 결제 프로바이더 연동 필요
 * - Stripe: https://stripe.com/docs/payments/checkout
 * - Toss Payments: https://docs.tosspayments.com/
 * 
 * 현재는 구조만 준비되어 있으며, 실제 결제 연동은 나중에 구현 예정입니다.
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

    // TODO: 결제 프로바이더 연동
    // 1. 결제 세션 생성 (Stripe Checkout 또는 Toss Payments)
    // 2. 결제 성공 후 구독 생성
    // 3. 웹훅으로 결제 확인 및 구독 활성화

    // 임시 응답 (실제 결제 연동 전까지)
    return NextResponse.json(
      {
        message: "결제 연동 준비 중입니다",
        note: "곧 결제 기능이 추가될 예정입니다",
      },
      { status: 501 } // Not Implemented
    );

    /* 실제 구현 예시 (주석 처리)
    
    // Stripe 예시
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'krw',
          product_data: {
            name: 'TrendScrape Prompt 프리미엄 플랜',
          },
          unit_amount: 9900,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      client_reference_id: userId,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
    */

    /* Toss Payments 예시 (주석 처리)
    
    const tossPayments = require('@tosspayments/payment-sdk');
    const client = new tossPayments.Client(
      process.env.TOSS_PAYMENTS_SECRET_KEY
    );
    
    const billingKey = await client.billing.createBillingKey({
      customerKey: userId,
      authKey: 'card', // 또는 'virtual', 'account'
    });
    
    const subscription = await client.billing.createSubscription({
      billingKey: billingKey.billingKey,
      customerKey: userId,
      amount: 9900,
      orderId: `subscription-${Date.now()}`,
      orderName: 'TrendScrape Prompt 프리미엄 플랜',
      customerEmail: user.email,
      customerName: user.name,
    });
    
    return NextResponse.json({ subscriptionId: subscription.id });
    */
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

