/**
 * 스크랩 아이템 저장 유틸리티 함수
 */

import { createClient } from "@/lib/supabase/server";
import type { ScrapedItemData } from "@/lib/types/crawler";
import { checkDuplicateUrl, validateScrapedData } from "./crawler";

/**
 * 스크랩 아이템 일괄 저장
 * @param packId - 패키지 ID
 * @param items - 저장할 스크랩 아이템 배열
 * @returns 저장 결과 (저장된 수, 스킵된 수)
 */
export async function saveScrapedItems(
  packId: string,
  items: ScrapedItemData[]
): Promise<{ saved: number; skipped: number }> {
  const supabase = await createClient();

  // 기존 URL 조회 (중복 체크용)
  const { data: existingItems } = await supabase
    .from("scraped_items")
    .select("url")
    .eq("pack_id", packId);

  const existingUrls = new Set(existingItems?.map((item) => `${packId}:${item.url}`) || []);

  // 유효한 아이템만 필터링
  const validItems: ScrapedItemData[] = [];
  let skippedCount = 0;

  for (const item of items) {
    // 데이터 검증
    if (!validateScrapedData(item)) {
      skippedCount++;
      continue;
    }

    // 중복 URL 체크
    if (checkDuplicateUrl(item.url, packId, existingUrls)) {
      skippedCount++;
      continue;
    }

    validItems.push(item);
    existingUrls.add(`${packId}:${item.url}`);
  }

  if (validItems.length === 0) {
    return { saved: 0, skipped: skippedCount };
  }

  // 데이터베이스에 저장할 형식으로 변환
  const insertData = validItems.map((item) => ({
    pack_id: packId,
    source_domain: item.source_domain,
    source_type: item.source_type,
    url: item.url,
    title: item.title,
    summary: item.summary,
    tags: item.tags || [],
    extracted_data: item.extracted_data || {},
    scraped_at: new Date().toISOString(),
  }));

  // 일괄 삽입
  const { error } = await supabase.from("scraped_items").insert(insertData);

  if (error) {
    // 부분 실패 시 개별 삽입 시도
    let savedCount = 0;
    for (const data of insertData) {
      const { error: singleError } = await supabase.from("scraped_items").insert(data);
      if (!singleError) {
        savedCount++;
      } else {
        console.error(`Failed to insert item ${data.url}:`, singleError);
      }
    }
    return { saved: savedCount, skipped: skippedCount + (insertData.length - savedCount) };
  }

  return { saved: validItems.length, skipped: skippedCount };
}

/**
 * 패키지의 스크랩 아이템 수 조회
 * @param packId - 패키지 ID
 * @returns 아이템 수
 */
export async function getScrapedItemsCount(packId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("scraped_items")
    .select("*", { count: "exact", head: true })
    .eq("pack_id", packId);

  if (error) {
    throw new Error(`Failed to get scraped items count: ${error.message}`);
  }

  return count || 0;
}

/**
 * 패키지의 스크랩 아이템 삭제
 * @param packId - 패키지 ID
 * @returns 삭제된 수
 */
export async function deleteScrapedItems(packId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scraped_items")
    .delete()
    .eq("pack_id", packId)
    .select("id");

  if (error) {
    throw new Error(`Failed to delete scraped items: ${error.message}`);
  }

  return data?.length || 0;
}

