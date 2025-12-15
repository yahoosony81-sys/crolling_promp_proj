"use client";

import nextDynamic from "next/dynamic";

// PaymentWidget을 동적 임포트하여 초기 번들 크기 감소
const PaymentWidget = nextDynamic(
  () => import("@/components/checkout/payment-widget").then((mod) => ({ default: mod.PaymentWidget })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground">결제 시스템을 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);

interface CheckoutContentProps {
  clientKey: string;
  customerKey: string;
  successUrl: string;
  failUrl: string;
}

export function CheckoutContent({
  clientKey,
  customerKey,
  successUrl,
  failUrl,
}: CheckoutContentProps) {
  return (
    <PaymentWidget
      clientKey={clientKey}
      customerKey={customerKey}
      successUrl={successUrl}
      failUrl={failUrl}
    />
  );
}

