import type { Metadata } from "next";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/../database.types";
import { HeroSection } from "@/components/landing/hero-section";
import { DifferentiatorsSection } from "@/components/landing/differentiators-section";
import { LatestTrendsSection } from "@/components/landing/latest-trends-section";
import { FreePromptsSection } from "@/components/landing/free-prompts-section";
import { CTASection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "TrendScrape Prompt - 매주 업데이트되는 트렌드 프롬프트",
  description:
    "매주 트렌드를 반영해 새롭게 업데이트되는 실행형 프롬프트를 제공합니다. 자동 크롤링·스크래핑 데이터와 목적별 맞춤 프롬프트로 빠르게 성과를 만들어보세요.",
};

type TrendPack = Database["public"]["Tables"]["trend_packs"]["Row"];
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
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <DifferentiatorsSection />
        <LatestTrendsSection trendPacks={trendPacks} />
        <FreePromptsSection prompts={freePrompts} />
        <CTASection />
      </main>
    </div>
  );
}
