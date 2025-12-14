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

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://trendscrape-prompt.com";

export const metadata: Metadata = {
  title: "주간 트렌드 패키지 - TrendScrape Prompt",
  description:
    "매주 업데이트되는 트렌드 패키지를 확인하세요. 상품, 부동산, 주식, 블로그, 숏츠, 릴스 등 다양한 카테고리의 트렌드를 제공합니다.",
  alternates: {
    canonical: `${baseUrl}/trends`,
  },
  openGraph: {
    title: "주간 트렌드 패키지 - TrendScrape Prompt",
    description:
      "매주 업데이트되는 트렌드 패키지를 확인하세요. 상품, 부동산, 주식, 블로그, 숏츠, 릴스 등 다양한 카테고리의 트렌드를 제공합니다.",
    url: `${baseUrl}/trends`,
    type: "website",
    siteName: "TrendScrape Prompt",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "주간 트렌드 패키지 - TrendScrape Prompt",
      },
    ],
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "주간 트렌드 패키지 - TrendScrape Prompt",
    description:
      "매주 업데이트되는 트렌드 패키지를 확인하세요. 상품, 부동산, 주식, 블로그, 숏츠, 릴스 등 다양한 카테고리의 트렌드를 제공합니다.",
    images: [`${baseUrl}/og-image.png`],
  },
};

async function getLatestWeekPacks() {
  try {
    const currentWeekKey = getCurrentWeekKey();
    const supabase = await createClient();
    
    // 필요한 필드만 선택하여 데이터 전송량 감소, week_key 인덱스 활용
    const { data, error } = await supabase
      .from("trend_packs")
      .select("id, week_key, category, title, summary, trend_keywords, status, generated_at, created_at, updated_at")
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
    
    // 필요한 필드만 선택하여 데이터 전송량 감소
    const { data, error } = await supabase
      .from("trend_packs")
      .select("id, week_key, category, title, summary, trend_keywords, status, generated_at, created_at, updated_at")
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

