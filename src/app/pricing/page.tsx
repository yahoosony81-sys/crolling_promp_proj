import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing/pricing-table";
import { PlanHighlight } from "@/components/pricing/plan-highlight";
import { SubscribeCTA } from "@/components/pricing/subscribe-cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "구독 안내 - TrendScrape Prompt",
  description:
    "월 9,900원으로 매주 업데이트되는 트렌드 프롬프트와 크롤링 데이터를 이용하세요. 무료 플랜과 프리미엄 플랜의 차이를 확인하고 지금 바로 구독하세요.",
  openGraph: {
    title: "구독 안내 - TrendScrape Prompt",
    description:
      "월 9,900원으로 매주 업데이트되는 트렌드 프롬프트와 크롤링 데이터를 이용하세요.",
    type: "website",
    siteName: "TrendScrape Prompt",
  },
  twitter: {
    card: "summary_large_image",
    title: "구독 안내 - TrendScrape Prompt",
    description:
      "월 9,900원으로 매주 업데이트되는 트렌드 프롬프트와 크롤링 데이터를 이용하세요.",
  },
};

export default function PricingPage() {
  return (
    <div className="container py-8 md:py-12">
      {/* 헤더 섹션 */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          구독 안내
        </h1>
        <p className="text-lg text-muted-foreground">
          무료 플랜과 프리미엄 플랜의 차이를 확인하고
          <br className="hidden sm:inline" />
          지금 바로 구독하세요
        </p>
      </div>

      {/* 플랜 강조 섹션 */}
      <div className="mb-12">
        <PlanHighlight />
      </div>

      {/* 기능 비교 테이블 */}
      <div className="mb-12">
        <PricingTable />
      </div>

      {/* 구독 CTA 섹션 */}
      <div className="mb-8">
        <SubscribeCTA />
      </div>

      {/* 추가 안내 */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          궁금한 점이 있으신가요?{" "}
          <a
            href="mailto:support@trendscrape.com"
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            문의하기
          </a>
        </p>
      </div>
    </div>
  );
}

