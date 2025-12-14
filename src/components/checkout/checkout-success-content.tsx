"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuCheckCircle2, LuLoader2, LuXCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface CheckoutSuccessContentProps {
  authKey: string;
  customerKey: string;
}

/**
 * 결제 성공 콘텐츠 컴포넌트
 * 
 * 빌링키 발급 및 첫 결제를 처리합니다.
 */
export function CheckoutSuccessContent({
  authKey,
  customerKey,
}: CheckoutSuccessContentProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function processBilling() {
      try {
        // 빌링키 발급 및 첫 결제 실행
        const response = await fetch("/api/subscriptions/billing-key", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authKey,
            customerKey,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "결제 처리 중 오류가 발생했습니다");
        }

        setStatus("success");
        toast.success("구독이 완료되었습니다!", {
          description: "프리미엄 플랜의 모든 기능을 이용하실 수 있습니다.",
        });

        // 3초 후 계정 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/account?success=true");
        }, 3000);
      } catch (error) {
        console.error("Error processing billing:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "결제 처리 중 오류가 발생했습니다"
        );
        toast.error("결제 처리 실패", {
          description: error instanceof Error ? error.message : "다시 시도해주세요.",
        });
      }
    }

    processBilling();
  }, [authKey, customerKey, router]);

  if (status === "loading") {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LuLoader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl">결제 처리 중...</CardTitle>
          <CardDescription>
            카드 등록이 완료되었습니다. 첫 결제를 진행하고 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">
            잠시만 기다려주세요.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LuXCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">결제 처리 실패</CardTitle>
          <CardDescription>
            {errorMessage || "결제 처리 중 오류가 발생했습니다"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            문제가 지속되면 고객센터로 문의해주세요.
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/pricing")}
              className="flex-1"
            >
              구독 페이지로 돌아가기
            </Button>
            <Button
              onClick={() => router.push("/checkout")}
              className="flex-1"
            >
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <LuCheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <CardTitle className="text-2xl">구독이 완료되었습니다!</CardTitle>
        <CardDescription>
          프리미엄 플랜의 모든 기능을 이용하실 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          계정 페이지로 이동합니다...
        </div>
        <Button
          onClick={() => router.push("/account")}
          className="w-full"
          size="lg"
        >
          계정 페이지로 이동
        </Button>
      </CardContent>
    </Card>
  );
}


