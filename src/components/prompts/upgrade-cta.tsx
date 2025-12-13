import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UpgradeCTA() {
  return (
    <Card className="mb-12 border-2">
      <CardHeader className="text-center">
        <CardTitle className="mb-2 text-2xl font-bold">
          더 많은 프롬프트를 보려면 구독하세요
        </CardTitle>
        <CardDescription className="text-base">
          매주 업데이트되는 트렌드 패키지와 프리미엄 프롬프트를 이용하세요
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
        </div>
      </CardContent>
    </Card>
  );
}

