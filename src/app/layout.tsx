import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // 폰트 로딩 최적화
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // 폰트 로딩 최적화
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://trendscrape-prompt.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "TrendScrape Prompt - 매주 업데이트되는 트렌드 프롬프트",
    template: "%s | TrendScrape Prompt",
  },
  description:
    "매주 트렌드를 반영해 새롭게 업데이트되는 실행형 프롬프트를 제공합니다. 자동 크롤링·스크래핑 데이터와 목적별 맞춤 프롬프트로 빠르게 성과를 만들어보세요.",
  keywords: [
    "프롬프트",
    "트렌드",
    "크롤링",
    "스크래핑",
    "AI",
    "콘텐츠 제작",
    "블로그",
    "유튜브 숏츠",
    "인스타 릴스",
    "상품 분석",
    "주식 분석",
    "부동산 분석",
  ],
  authors: [{ name: "TrendScrape Prompt" }],
  creator: "TrendScrape Prompt",
  publisher: "TrendScrape Prompt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: baseUrl,
    siteName: "TrendScrape Prompt",
    title: "TrendScrape Prompt - 매주 업데이트되는 트렌드 프롬프트",
    description:
      "매주 트렌드를 반영해 새롭게 업데이트되는 실행형 프롬프트를 제공합니다. 자동 크롤링·스크래핑 데이터와 목적별 맞춤 프롬프트로 빠르게 성과를 만들어보세요.",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "TrendScrape Prompt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrendScrape Prompt - 매주 업데이트되는 트렌드 프롬프트",
    description:
      "매주 트렌드를 반영해 새롭게 업데이트되는 실행형 프롬프트를 제공합니다.",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // TODO: Google Search Console, Naver Webmaster 등 검증 코드 추가
    // google: "your-google-verification-code",
    // other: {
    //   "naver-site-verification": "your-naver-verification-code",
    // },
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko" suppressHydrationWarning>
        <head>
          {/* 리소스 힌트: 외부 도메인 사전 연결 */}
          <link rel="preconnect" href="https://*.supabase.co" />
          <link rel="dns-prefetch" href="https://*.supabase.co" />
          <link rel="preconnect" href="https://*.clerk.accounts.dev" />
          <link rel="dns-prefetch" href="https://*.clerk.accounts.dev" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
