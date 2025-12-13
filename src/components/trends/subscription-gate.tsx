import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SubscriptionGate() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-2xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="mb-2 text-2xl font-bold">
            구독이 필요합니다
          </CardTitle>
          <CardDescription className="text-base">
            주간 트렌드 패키지를 보려면 구독이 필요합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4">
            <div className="text-3xl font-bold">월 9,900원</div>
            <div className="text-sm text-muted-foreground">
              매주 새로운 트렌드 패키지와 프롬프트 제공
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/pricing">지금 구독하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/free">무료 프롬프트 보기</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

