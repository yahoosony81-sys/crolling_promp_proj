import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { TrendPack } from "@/lib/types/trend";
import type { Database } from "@/lib/types/database";
import { HeroSection } from "@/components/landing/hero-section";
import { DifferentiatorsSection } from "@/components/landing/differentiators-section";
import { LatestTrendsSection } from "@/components/landing/latest-trends-section";
import { FreePromptsSection } from "@/components/landing/free-prompts-section";
import { CTASection } from "@/components/layout/cta-section";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://trendscrape-prompt.com";

export const metadata: Metadata = {
  title: "TrendScrape Prompt - 매주 업데이트되는 트렌드 프롬프트",
  description:
    "매주 트렌드를 반영해 새롭게 업데이트되는 실행형 프롬프트를 제공합니다. 자동 크롤링·스크래핑 데이터와 목적별 맞춤 프롬프트로 빠르게 성과를 만들어보세요.",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "TrendScrape Prompt - 매주 업데이트되는 트렌드 프롬프트",
    description:
      "매주 트렌드를 반영해 새롭게 업데이트되는 실행형 프롬프트를 제공합니다. 자동 크롤링·스크래핑 데이터와 목적별 맞춤 프롬프트로 빠르게 성과를 만들어보세요.",
    url: baseUrl,
    siteName: "TrendScrape Prompt",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TrendScrape Prompt - 매주 업데이트되는 트렌드 프롬프트",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrendScrape Prompt - 매주 업데이트되는 트렌드 프롬프트",
    description:
      "매주 트렌드를 반영해 새롭게 업데이트되는 실행형 프롬프트를 제공합니다.",
    images: [`${baseUrl}/og-image.png`],
  },
};

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

async function getLatestTrendPacks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trend_packs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(2);

  if (error) {
    console.error("Error fetching trend packs:", error);
    return [];
  }

  return (data || []) as TrendPack[];
}

async function getFreePrompts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("is_free", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("Error fetching free prompts:", error);
    return [];
  }

  return (data || []) as PromptTemplate[];
}

export default async function Home() {
  const [trendPacks, freePrompts] = await Promise.all([
    getLatestTrendPacks(),
    getFreePrompts(),
  ]);

  return (
    <>
      <HeroSection />
      <DifferentiatorsSection />
      <LatestTrendsSection trendPacks={trendPacks} />
      <FreePromptsSection prompts={freePrompts} />
      <CTASection />
    </>
  );
}
