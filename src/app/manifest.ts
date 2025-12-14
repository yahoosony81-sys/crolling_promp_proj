import { MetadataRoute } from "next";
import { lightColors } from "@/lib/constants/colors";

/**
 * 웹 앱 매니페스트 설정
 * PWA 기능을 위한 매니페스트를 생성합니다.
 */
export default function manifest(): MetadataRoute.Manifest {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://trendscrape-prompt.com";

  return {
    name: "TrendScrape Prompt",
    short_name: "TrendScrape",
    description: "매주 업데이트되는 트렌드 프롬프트 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a1a1a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      // TODO: 다양한 크기의 아이콘 추가 필요 (16x16, 32x32, 192x192, 512x512)
      // {
      //   src: "/icons/icon-192x192.png",
      //   sizes: "192x192",
      //   type: "image/png",
      // },
      // {
      //   src: "/icons/icon-512x512.png",
      //   sizes: "512x512",
      //   type: "image/png",
      // },
    ],
    categories: ["productivity", "business", "education"],
    lang: "ko",
    dir: "ltr",
    scope: "/",
  };
}

