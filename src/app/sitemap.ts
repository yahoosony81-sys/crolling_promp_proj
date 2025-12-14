import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

/**
 * sitemap.xml 생성
 * 정적 페이지와 동적 페이지를 포함한 사이트맵을 생성합니다.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://trendscrape-prompt.com";

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/free`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trends`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // 동적 페이지: published 상태의 trend_packs 조회
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();
    const { data: packs, error } = await supabase
      .from("trend_packs")
      .select("id, updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    if (!error && packs) {
      dynamicPages = packs.map((pack) => ({
        url: `${baseUrl}/packs/${pack.id}`,
        lastModified: pack.updated_at ? new Date(pack.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Error fetching trend packs for sitemap:", error);
    // 에러 발생 시 빈 배열 반환 (정적 페이지만 포함)
  }

  return [...staticPages, ...dynamicPages];
}

