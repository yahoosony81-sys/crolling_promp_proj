"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface TrendsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function TrendsError({ error, reset }: TrendsErrorProps) {
  useEffect(() => {
    // 에러 로깅 (실제 환경에서는 에러 추적 서비스로 전송)
    console.error("Trends page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-2xl border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            트렌드 패키지를 불러올 수 없습니다
          </CardTitle>
          <CardDescription className="text-base">
            데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={reset} size="lg" className="w-full sm:w-auto">
              다시 시도
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              페이지 새로고침
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

