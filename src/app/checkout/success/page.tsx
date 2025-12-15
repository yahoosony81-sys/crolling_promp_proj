import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { CheckoutSuccessContent } from "@/components/checkout/checkout-success-content";

export const dynamic = "force-dynamic";

/**
 * 결제 성공 페이지
 * 
 * 카드 등록 성공 후 리다이렉트되는 페이지입니다.
 * authKey와 customerKey를 사용하여 빌링키를 발급하고 첫 결제를 실행합니다.
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ authKey?: string; customerKey?: string }>;
}) {
  // 인증 확인
  const { userId } = await auth();
  if (!userId) {
    redirect("/login?redirect=/checkout/success");
  }

  const params = await searchParams;
  const { authKey, customerKey } = params;

  // 필수 파라미터 확인
  if (!authKey || !customerKey) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">결제 정보 오류</h1>
          <p className="text-muted-foreground mb-4">
            결제 정보를 확인할 수 없습니다.
          </p>
          <a
            href="/pricing"
            className="text-primary hover:underline"
          >
            구독 페이지로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  // customerKey가 현재 사용자와 일치하는지 확인
  if (customerKey !== userId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">권한 오류</h1>
          <p className="text-muted-foreground mb-4">
            결제 정보에 접근할 권한이 없습니다.
          </p>
          <a
            href="/pricing"
            className="text-primary hover:underline"
          >
            구독 페이지로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<div>처리 중...</div>}>
          <CheckoutSuccessContent authKey={authKey} customerKey={customerKey} />
        </Suspense>
      </div>
    </div>
  );
}



