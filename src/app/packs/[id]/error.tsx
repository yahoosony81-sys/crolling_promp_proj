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
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Pack detail error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-2xl border-2">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertCircle className="size-12 text-destructive" />
          </div>
          <CardTitle className="mb-2 text-2xl font-bold">
            패키지를 불러오는데 실패했습니다
          </CardTitle>
          <CardDescription className="text-base">
            {error.message || "알 수 없는 오류가 발생했습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button onClick={reset} size="lg" className="w-full sm:w-auto">
              다시 시도
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/trends">패키지 목록으로</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/">홈으로</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

