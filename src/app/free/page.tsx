import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/../database.types";
import { FreePromptsContent } from "./free-prompts-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "무료 프롬프트 10선 - TrendScrape Prompt",
  description:
    "지금 바로 사용할 수 있는 무료 프롬프트 템플릿을 확인해보세요. 블로그, 숏츠, 릴스, 상품 분석 등 다양한 카테고리의 프롬프트를 제공합니다.",
};

type PromptTemplate = Database["public"]["Tables"]["prompt_templates"]["Row"];

async function getAllFreePrompts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("*")
    .eq("is_free", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching free prompts:", error);
    return [];
  }

  return (data || []) as PromptTemplate[];
}

export default async function FreePromptsPage() {
  const prompts = await getAllFreePrompts();

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          무료 프롬프트 10선
        </h1>
      </div>
      <FreePromptsContent prompts={prompts} />
    </div>
  );
}
