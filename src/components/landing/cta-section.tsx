import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <Card className="mx-auto max-w-3xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="mb-4 text-3xl font-bold md:text-4xl">
              지금 바로 시작하세요
            </CardTitle>
            <CardDescription className="text-lg">
              매주 업데이트되는 트렌드 프롬프트로 빠르게 성과를 만들어보세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 rounded-lg bg-muted/50 p-6">
              <div className="text-center">
                <div className="text-4xl font-bold">월 9,900원</div>
                <div className="text-muted-foreground">
                  매주 새로운 트렌드 패키지와 프롬프트 제공
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/pricing">지금 구독하기</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/free">무료로 먼저 체험하기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

