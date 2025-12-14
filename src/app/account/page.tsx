import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserSubscription } from "@/lib/utils/subscription";
import { SubscriptionStatus } from "@/components/account/subscription-status";
import { PaymentInfo } from "@/components/account/payment-info";
import { UsageHistory } from "@/components/account/usage-history";
import { CancelSubscription } from "@/components/account/cancel-subscription";
import { PaymentHistory } from "@/components/account/payment-history";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "내 계정 - TrendScrape Prompt",
  description: "구독 상태, 결제 정보, 이용 기록을 확인하세요",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const { userId } = await auth();

  // 인증 체크
  if (!userId) {
    redirect("/login?redirect=/account");
  }

  // 구독 정보 조회
  const subscription = await getUserSubscription(userId);

  return (
    <div className="container py-6 sm:py-8 md:py-12">
      {/* 헤더 섹션 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          내 계정
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          구독 상태와 이용 기록을 확인하세요
        </p>
      </div>

      {/* 구독 상태 및 결제 정보 섹션 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2">
        <SubscriptionStatus subscription={subscription} />
        <PaymentInfo subscription={subscription} />
      </div>

      {/* 구독 취소 섹션 */}
      {subscription && (
        <div className="mb-6 sm:mb-8">
          <CancelSubscription subscription={subscription} />
        </div>
      )}

      {/* 이용 기록 섹션 */}
      <div className="mb-6 sm:mb-8">
        <UsageHistory />
      </div>

      {/* 결제 내역 섹션 */}
      <div className="mb-6 sm:mb-8">
        <PaymentHistory />
      </div>
    </div>
  );
}

