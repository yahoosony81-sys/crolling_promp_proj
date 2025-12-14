import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

// PaymentWidget을 동적 임포트하여 초기 번들 크기 감소
const PaymentWidget = dynamic(
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

/**
 * 결제 페이지
 * 
 * Toss Payments 카드 등록창을 표시하고, 빌링키를 발급받아 첫 결제를 실행합니다.
 */
export default async function CheckoutPage() {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/login?redirect=/checkout");
  }

  // 결제 세션 생성
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const clientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;

  if (!clientKey) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">결제 설정 오류</h1>
          <p className="text-muted-foreground">
            결제 설정이 완료되지 않았습니다. 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    );
  }

  const customerKey = userId;
  const successUrl = `${appUrl}/checkout/success`;
  const failUrl = `${appUrl}/checkout/cancel`;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">구독 결제</h1>
        <p className="text-muted-foreground mb-8">
          월 9,900원으로 매주 업데이트되는 트렌드 프롬프트를 이용하세요
        </p>

        <PaymentWidget
          clientKey={clientKey}
          customerKey={customerKey}
          successUrl={successUrl}
          failUrl={failUrl}
        />
      </div>
    </div>
  );
}


