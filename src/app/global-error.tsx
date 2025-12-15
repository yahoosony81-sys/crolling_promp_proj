"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

/**
 * 전역 에러 바운더리
 * 
 * 애플리케이션 전체에서 발생하는 처리되지 않은 에러를 캐치합니다.
 * root layout을 대체하므로 <html>과 <body> 태그를 포함해야 합니다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (실제 환경에서는 에러 추적 서비스로 전송)
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-2xl border-destructive/50">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertCircle className="size-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="mb-2 text-2xl font-bold">
                예기치 않은 오류가 발생했습니다
              </CardTitle>
              <CardDescription className="text-base">
                애플리케이션에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="mb-2 text-sm font-semibold">에러 상세 정보:</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {error.message || "알 수 없는 오류"}
                  </p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      에러 ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={reset} size="lg" className="w-full sm:w-auto">
                  <RefreshCw className="mr-2 size-4" />
                  다시 시도
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/">
                    <Home className="mr-2 size-4" />
                    홈으로
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}

