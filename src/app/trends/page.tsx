import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/header";
import { createClient } from "@/lib/supabase/server";
import { checkSubscription } from "@/lib/utils/subscription";
import { getCurrentWeekKey } from "@/lib/utils/trend";
import { SubscriptionGate } from "@/components/trends/subscription-gate";
import { TrendsContent } from "./trends-content";
import type { Database } from "@/../database.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "주간 트렌드 패키지 - TrendScrape Prompt",
  description:
    "매주 업데이트되는 트렌드 패키지를 확인하세요. 상품, 부동산, 주식, 블로그, 숏츠, 릴스 등 다양한 카테고리의 트렌드를 제공합니다.",
};

type TrendPack = Database["public"]["Tables"]["trend_packs"]["Row"];

async function getLatestWeekPacks() {
  const currentWeekKey = getCurrentWeekKey();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("trend_packs")
    .select("*")
    .eq("week_key", currentWeekKey)
    .eq("status", "published")
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching latest week packs:", error);
    return [];
  }

  return (data || []) as TrendPack[];
}

async function getAllTrendPacks() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("trend_packs")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching trend packs:", error);
    return [];
  }

  return (data || []) as TrendPack[];
}

export default async function TrendsPage() {
  const { userId } = await auth();

  // 인증 체크
  if (!userId) {
    redirect("/login?redirect=/trends");
  }

  // 구독 체크
  const hasSubscription = await checkSubscription(userId);

  // 데이터 페칭
  const [weekPacks, allPacks] = await Promise.all([
    getLatestWeekPacks(),
    getAllTrendPacks(),
  ]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            주간 트렌드 패키지
          </h1>
          <p className="text-lg text-muted-foreground">
            매주 업데이트되는 트렌드 패키지를 확인해보세요
          </p>
        </div>
        
        {!hasSubscription ? (
          <SubscriptionGate />
        ) : (
          <TrendsContent weekPacks={weekPacks} allPacks={allPacks} />
        )}
      </main>
    </div>
  );
}

