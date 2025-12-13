/**
 * 트렌드 패키지 생성 유틸리티 함수
 */

import { createAdminClient } from "@/lib/supabase/server-admin";
import { getCurrentWeekKey } from "./trend";
import type { TrendKeyword } from "@/lib/types/crawler";

/**
 * 트렌드 패키지 생성
 * @param weekKey - 주차 키 (예: "2025-W50")
 * @param category - 카테고리 (예: "product", "real_estate", "stock", "blog", "shorts", "reels")
 * @param keywords - 트렌드 키워드 배열
 * @param summary - 패키지 요약
 * @returns 생성된 패키지 ID
 */
export async function createTrendPack(
  weekKey: string,
  category: string,
  keywords: TrendKeyword[],
  summary: string
): Promise<string> {
  const supabase = createAdminClient();

  // 기존 패키지 확인 (같은 주차, 같은 카테고리)
  const { data: existingPack } = await supabase
    .from("trend_packs")
    .select("id")
    .eq("week_key", weekKey)
    .eq("category", category)
    .single();

  if (existingPack) {
    // 기존 패키지 업데이트
    const { data, error } = await supabase
      .from("trend_packs")
      .update({
        title: generateTitleFromKeywords(keywords, category),
        summary: summary,
        trend_keywords: keywords.map((kw) => kw.keyword),
        status: "published",
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingPack.id)
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to update trend pack: ${error.message}`);
    }

    return data.id;
  }

  // 새 패키지 생성
  const { data, error } = await supabase
    .from("trend_packs")
    .insert({
      week_key: weekKey,
      category: category,
      title: generateTitleFromKeywords(keywords, category),
      summary: summary,
      trend_keywords: keywords.map((kw) => kw.keyword),
      status: "published",
      generated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create trend pack: ${error.message}`);
  }

  return data.id;
}

/**
 * 키워드로부터 제목 생성
 * @param keywords - 트렌드 키워드 배열
 * @param category - 카테고리
 * @returns 생성된 제목
 */
function generateTitleFromKeywords(keywords: TrendKeyword[], category: string): string {
  if (keywords.length === 0) {
    return getDefaultTitle(category);
  }

  const topKeywords = keywords
    .slice(0, 3)
    .map((kw) => kw.keyword)
    .filter((kw) => kw.length > 1);

  if (topKeywords.length === 0) {
    return getDefaultTitle(category);
  }

  if (topKeywords.length === 1) {
    return `${topKeywords[0]} 트렌드`;
  } else if (topKeywords.length === 2) {
    return `${topKeywords[0]}, ${topKeywords[1]} 트렌드`;
  } else {
    return `${topKeywords[0]}, ${topKeywords[1]} 등 트렌드`;
  }
}

/**
 * 카테고리별 기본 제목 반환
 * @param category - 카테고리
 * @returns 기본 제목
 */
function getDefaultTitle(category: string): string {
  const titleMap: Record<string, string> = {
    product: "상품 트렌드",
    real_estate: "부동산 트렌드",
    stock: "주식 시장 트렌드",
    blog: "콘텐츠 트렌드",
    shorts: "숏츠 콘텐츠 트렌드",
    reels: "릴스 콘텐츠 트렌드",
  };

  return titleMap[category] || "주간 트렌드";
}

/**
 * 카테고리에 맞는 프롬프트를 패키지에 연결
 * @param packId - 패키지 ID
 * @param category - 카테고리
 * @returns 연결된 프롬프트 수
 */
export async function linkPromptsToPack(
  packId: string,
  category: string
): Promise<number> {
  const supabase = createAdminClient();

  // 카테고리에 맞는 프롬프트 조회 (유료 프롬프트만)
  const { data: prompts, error: promptsError } = await supabase
    .from("prompt_templates")
    .select("id")
    .eq("category", category)
    .eq("is_free", false);

  if (promptsError) {
    throw new Error(`Failed to fetch prompts: ${promptsError.message}`);
  }

  if (!prompts || prompts.length === 0) {
    return 0;
  }

  // 기존 연결 확인
  const { data: existingLinks } = await supabase
    .from("pack_prompts")
    .select("prompt_id")
    .eq("pack_id", packId);

  const existingPromptIds = new Set(existingLinks?.map((link) => link.prompt_id) || []);

  // 새로 연결할 프롬프트 필터링
  const promptsToLink = prompts.filter((prompt) => !existingPromptIds.has(prompt.id));

  if (promptsToLink.length === 0) {
    return existingPromptIds.size;
  }

  // pack_prompts에 연결
  const insertData = promptsToLink.map((prompt, index) => ({
    pack_id: packId,
    prompt_id: prompt.id,
    sort_order: index,
  }));

  const { error: linkError } = await supabase.from("pack_prompts").insert(insertData);

  if (linkError) {
    throw new Error(`Failed to link prompts: ${linkError.message}`);
  }

  return existingPromptIds.size + promptsToLink.length;
}

/**
 * 현재 주차의 트렌드 패키지 생성 (헬퍼 함수)
 * @param category - 카테고리
 * @param keywords - 트렌드 키워드 배열
 * @param summary - 패키지 요약
 * @returns 생성된 패키지 ID
 */
export async function createCurrentWeekTrendPack(
  category: string,
  keywords: TrendKeyword[],
  summary: string
): Promise<string> {
  const weekKey = getCurrentWeekKey();
  return createTrendPack(weekKey, category, keywords, summary);
}

