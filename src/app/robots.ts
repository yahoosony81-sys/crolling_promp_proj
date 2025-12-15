import { MetadataRoute } from "next";

/**
 * robots.txt 설정
 * 검색 엔진 크롤링 규칙을 정의합니다.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://trendscrape-prompt.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/free",
          "/trends",
          "/pricing",
          "/packs/*",
        ],
        disallow: [
          "/api/*",
          "/account",
          "/profile",
          "/checkout/*",
          "/login",
          "/sign-up",
        ],
      },
      // Google Bot 특별 설정
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/free",
          "/trends",
          "/pricing",
          "/packs/*",
        ],
        disallow: [
          "/api/*",
          "/account",
          "/profile",
          "/checkout/*",
          "/login",
          "/sign-up",
        ],
      },
      // Naver Bot 특별 설정
      {
        userAgent: "Yeti",
        allow: [
          "/",
          "/free",
          "/trends",
          "/pricing",
          "/packs/*",
        ],
        disallow: [
          "/api/*",
          "/account",
          "/profile",
          "/checkout/*",
          "/login",
          "/sign-up",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

