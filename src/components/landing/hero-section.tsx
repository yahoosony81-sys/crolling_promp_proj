import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:gap-6 sm:py-20 md:py-32">
      <div className="flex max-w-4xl flex-col gap-4 sm:gap-6">
        <h1 className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
          매주 업데이트되는 트렌드 프롬프트
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl lg:text-2xl">
          기존 프롬프트 서비스는 &quot;한 번 만들어 놓은 프롬프트&quot;를 반복 제공하지만,
          <br className="hidden sm:block" />
          TrendScrape Prompt는{" "}
          <span className="font-semibold text-foreground">
            매주 트렌드를 반영해 새롭게 업데이트되는 프롬프트
          </span>
          를 제공합니다.
          <br className="hidden sm:block" />
          프롬프트를 &apos;지식&apos;이 아니라{" "}
          <span className="font-semibold text-foreground">
            &apos;시의성 있는 실행 도구&apos;
          </span>
          로 재정의합니다.
        </p>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <Button asChild size="lg" className="w-full min-h-[44px] sm:w-auto">
            <Link href="/free">무료 프롬프트 체험하기</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full min-h-[44px] sm:w-auto">
            <Link href="/pricing">구독하기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


