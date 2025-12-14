import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { checkSubscription } from "@/lib/utils/subscription";
import { getCurrentWeekKey } from "@/lib/utils/trend";
import { SubscriptionGate } from "@/components/trends/subscription-gate";
import { TrendsContent } from "./trends-content";
import { WeekSummarySkeleton, TrendPackListSkeleton } from "@/components/trends/trend-pack-skeleton";
import type { TrendPack } from "@/lib/types/trend";

// 트렌드 데이터는 주 1-2회 업데이트되므로 1시간 캐시
export const revalidate = 3600;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "주간 트렌드 패키지 - TrendScrape Prompt",
  description:
    "매주 업데이트되는 트렌드 패키지를 확인하세요. 상품, 부동산, 주식, 블로그, 숏츠, 릴스 등 다양한 카테고리의 트렌드를 제공합니다.",
  openGraph: {
    title: "주간 트렌드 패키지 - TrendScrape Prompt",
    description:
      "매주 업데이트되는 트렌드 패키지를 확인하세요. 상품, 부동산, 주식, 블로그, 숏츠, 릴스 등 다양한 카테고리의 트렌드를 제공합니다.",
    type: "website",
    siteName: "TrendScrape Prompt",
  },
  twitter: {
    card: "summary_large_image",
    title: "주간 트렌드 패키지 - TrendScrape Prompt",
    description:
      "매주 업데이트되는 트렌드 패키지를 확인하세요. 상품, 부동산, 주식, 블로그, 숏츠, 릴스 등 다양한 카테고리의 트렌드를 제공합니다.",
  },
};

async function getLatestWeekPacks() {
  try {
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
      throw new Error(`이번 주 트렌드 패키지를 불러오는데 실패했습니다: ${error.message}`);
    }

    return (data || []) as TrendPack[];
  } catch (error) {
    console.error("Error in getLatestWeekPacks:", error);
    // 에러를 다시 던져서 error.tsx에서 처리하도록 함
    throw error;
  }
}

async function getAllTrendPacks() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("trend_packs")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trend packs:", error);
      throw new Error(`트렌드 패키지 목록을 불러오는데 실패했습니다: ${error.message}`);
    }

    return (data || []) as TrendPack[];
  } catch (error) {
    console.error("Error in getAllTrendPacks:", error);
    // 에러를 다시 던져서 error.tsx에서 처리하도록 함
    throw error;
  }
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
    <div className="container py-6 sm:py-8 md:py-12">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
          주간 트렌드 패키지
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          매주 업데이트되는 트렌드 패키지를 확인해보세요
        </p>
      </div>
      
      {!hasSubscription ? (
        <SubscriptionGate />
      ) : (
        <Suspense
          fallback={
            <>
              <WeekSummarySkeleton />
              <TrendPackListSkeleton count={12} />
            </>
          }
        >
          <TrendsContent weekPacks={weekPacks} allPacks={allPacks} />
        </Suspense>
      )}
    </div>
  );
}

