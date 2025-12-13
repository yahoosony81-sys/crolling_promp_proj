"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { LuLoader2, LuCheckCircle2, LuXCircle } from "react-icons/lu";
import { toast } from "sonner";

declare global {
  interface Window {
    TossPayments?: {
      (clientKey: string): {
        requestBillingAuth: (
          method: string,
          params: {
            customerKey: string;
            successUrl: string;
            failUrl: string;
          }
        ) => Promise<void>;
      };
    };
  }
}

interface PaymentWidgetProps {
  clientKey: string;
  customerKey: string;
  successUrl: string;
  failUrl: string;
}

/**
 * Toss Payments 결제 위젯 컴포넌트
 * 
 * 카드 등록창을 표시하고, 빌링키 발급 및 첫 결제를 처리합니다.
 */
export function PaymentWidget({
  clientKey,
  customerKey,
  successUrl,
  failUrl,
}: PaymentWidgetProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Toss Payments SDK 로드 확인
  useEffect(() => {
    if (window.TossPayments) {
      setIsSdkLoaded(true);
    }
  }, []);

  // 카드 등록창 열기
  const handleRequestBillingAuth = async () => {
    if (!window.TossPayments) {
      setError("결제 SDK가 로드되지 않았습니다. 페이지를 새로고침해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tossPayments = window.TossPayments(clientKey);

      await tossPayments.requestBillingAuth("카드", {
        customerKey,
        successUrl,
        failUrl,
      });
    } catch (err) {
      console.error("Error requesting billing auth:", err);
      setError("카드 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsLoading(false);
      toast.error("카드 등록 실패", {
        description: "카드 등록 중 오류가 발생했습니다.",
      });
    }
  };

  return (
    <>
      {/* Toss Payments SDK 로드 */}
      <Script
        src="https://js.tosspayments.com/v1/payment"
        onLoad={() => {
          setIsSdkLoaded(true);
        }}
        onError={() => {
          setError("결제 SDK를 로드할 수 없습니다. 인터넷 연결을 확인해주세요.");
        }}
      />

      <div ref={widgetRef} className="space-y-4">
        {/* 결제 정보 요약 */}
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">구독 정보</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">플랜</span>
              <span className="font-medium">프리미엄 플랜</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">금액</span>
              <span className="font-medium">월 9,900원</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">첫 결제 금액</span>
              <span className="font-bold text-lg">9,900원</span>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="border border-destructive rounded-lg p-4 bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <LuXCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            카드 등록 후 첫 결제가 자동으로 진행됩니다. 이후 매월 자동으로 결제됩니다.
          </p>
        </div>

        {/* 카드 등록 버튼 */}
        <Button
          onClick={handleRequestBillingAuth}
          disabled={!isSdkLoaded || isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            "카드 등록 및 결제하기"
          )}
        </Button>

        {!isSdkLoaded && (
          <p className="text-xs text-center text-muted-foreground">
            결제 시스템을 불러오는 중...
          </p>
        )}
      </div>
    </>
  );
}

