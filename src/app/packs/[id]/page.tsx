import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { checkSubscription } from "@/lib/utils/subscription";
import { SubscriptionGate } from "@/components/trends/subscription-gate";
import { PackDetailContent } from "./pack-detail-content";
import { PackDetailSkeleton } from "./loading";
import type { TrendPack, ScrapedItem } from "@/lib/types/trend";
import type { Database } from "@/lib/types/database";

// 패키지 상세 페이지는 30분 캐시 (트렌드 데이터는 주 1-2회 업데이트)
export const revalidate = 1800;

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];
type PackPrompt = Database["public"]["Tables"]["pack_prompts"]["Row"];

interface PackWithPrompts extends PromptTemplate {
  pack_prompts: PackPrompt;
}

async function getPackById(id: string): Promise<TrendPack | null> {
  try {
    const supabase = await createClient();
    
    // 필요한 필드만 선택하여 데이터 전송량 감소
    const { data, error } = await supabase
      .from("trend_packs")
      .select("id, week_key, category, title, summary, trend_keywords, status, generated_at, created_at, updated_at")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      console.error("Error fetching pack:", error);
      throw new Error(`패키지를 불러오는데 실패했습니다: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in getPackById:", error);
    throw error;
  }
}

async function getScrapedItems(packId: string): Promise<ScrapedItem[]> {
  try {
    const supabase = await createClient();
    
    // 필요한 필드만 선택하여 데이터 전송량 감소, pack_id 인덱스 활용
    const { data, error } = await supabase
      .from("scraped_items")
      .select("id, pack_id, source_domain, source_type, url, title, summary, tags, extracted_data, scraped_at, created_at")
      .eq("pack_id", packId)
      .order("scraped_at", { ascending: false });

    if (error) {
      console.error("Error fetching scraped items:", error);
      throw new Error(`수집 데이터를 불러오는데 실패했습니다: ${error.message}`);
    }

    return (data || []) as ScrapedItem[];
  } catch (error) {
    console.error("Error in getScrapedItems:", error);
    throw error;
  }
}

async function getPackPrompts(packId: string): Promise<PackWithPrompts[]> {
  try {
    const supabase = await createClient();
    
    // 조인 쿼리로 N+1 문제 방지, 필요한 필드만 선택
    const { data, error } = await supabase
      .from("pack_prompts")
      .select(`
        id,
        pack_id,
        prompt_id,
        sort_order,
        created_at,
        prompt_templates (
          id,
          is_free,
          title,
          description,
          category,
          content,
          variables,
          example_inputs,
          created_at,
          updated_at
        )
      `)
      .eq("pack_id", packId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching pack prompts:", error);
      throw new Error(`프롬프트를 불러오는데 실패했습니다: ${error.message}`);
    }

    // 데이터 구조 변환
    const prompts = (data || []).map((item: any) => ({
      ...item.prompt_templates,
      pack_prompts: {
        id: item.id,
        pack_id: item.pack_id,
        prompt_id: item.prompt_id,
        sort_order: item.sort_order,
        created_at: item.created_at,
      },
    })) as PackWithPrompts[];

    return prompts;
  } catch (error) {
    console.error("Error in getPackPrompts:", error);
    throw error;
  }
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pack = await getPackById(id);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://trendscrape-prompt.com";

  if (!pack) {
    return {
      title: "패키지를 찾을 수 없습니다 - TrendScrape Prompt",
    };
  }

  // 카테고리별 한글 라벨
  const categoryLabels: Record<string, string> = {
    product: "상품",
    real_estate: "부동산",
    stock: "주식",
    blog: "블로그",
    shorts: "숏츠",
    reels: "릴스",
  };

  const categoryLabel = categoryLabels[pack.category] || pack.category;
  const enhancedDescription = `${pack.summary} ${categoryLabel} 카테고리의 트렌드 데이터와 맞춤 프롬프트를 확인하세요.`;

  return {
    title: `${pack.title} - TrendScrape Prompt`,
    description: enhancedDescription,
    alternates: {
      canonical: `${baseUrl}/packs/${id}`,
    },
    openGraph: {
      title: `${pack.title} - TrendScrape Prompt`,
      description: enhancedDescription,
      url: `${baseUrl}/packs/${id}`,
      type: "website",
      siteName: "TrendScrape Prompt",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${pack.title} - TrendScrape Prompt`,
        },
      ],
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pack.title} - TrendScrape Prompt`,
      description: enhancedDescription,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export default async function PackDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();

  // 인증 체크
  if (!userId) {
    redirect(`/login?redirect=/packs/${id}`);
  }

  // 구독 체크
  const hasSubscription = await checkSubscription(userId);

  // 데이터 페칭
  const [pack, scrapedItems, prompts] = await Promise.all([
    getPackById(id),
    getScrapedItems(id),
    getPackPrompts(id),
  ]);

  // 404 처리
  if (!pack) {
    notFound();
  }

  return (
    <div className="container py-6 sm:py-8 md:py-12">
      {!hasSubscription ? (
        <SubscriptionGate />
      ) : (
        <Suspense fallback={<PackDetailSkeleton />}>
          <PackDetailContent
            pack={pack}
            scrapedItems={scrapedItems}
            prompts={prompts}
          />
        </Suspense>
      )}
    </div>
  );
}

