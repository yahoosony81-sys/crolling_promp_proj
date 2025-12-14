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

export const dynamic = "force-dynamic";

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];
type PackPrompt = Database["public"]["Tables"]["pack_prompts"]["Row"];

interface PackWithPrompts extends PromptTemplate {
  pack_prompts: PackPrompt;
}

async function getPackById(id: string): Promise<TrendPack | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("trend_packs")
      .select("*")
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
    
    const { data, error } = await supabase
      .from("scraped_items")
      .select("*")
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
    
    const { data, error } = await supabase
      .from("pack_prompts")
      .select(`
        *,
        prompt_templates (*)
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

  if (!pack) {
    return {
      title: "패키지를 찾을 수 없습니다 - TrendScrape Prompt",
    };
  }

  return {
    title: `${pack.title} - TrendScrape Prompt`,
    description: pack.summary,
    openGraph: {
      title: `${pack.title} - TrendScrape Prompt`,
      description: pack.summary,
      type: "website",
      siteName: "TrendScrape Prompt",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pack.title} - TrendScrape Prompt`,
      description: pack.summary,
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
    <div className="container py-8 md:py-12">
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

