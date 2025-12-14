import Link from "next/link";
import { LuMail } from "react-icons/lu";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* 서비스 소개 */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold">서비스</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="block min-h-[32px] flex items-center transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1 -ml-1"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/free"
                  className="block min-h-[32px] flex items-center transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1 -ml-1"
                >
                  무료 프롬프트
                </Link>
              </li>
              <li>
                <Link
                  href="/trends"
                  className="block min-h-[32px] flex items-center transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1 -ml-1"
                >
                  트렌드 패키지
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="block min-h-[32px] flex items-center transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1 -ml-1"
                >
                  구독 안내
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 정보 */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold">법적 정보</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/terms"
                  className="block min-h-[32px] flex items-center transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1 -ml-1"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="block min-h-[32px] flex items-center transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1 -ml-1"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold">연락처</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:support@trendscrape.com"
                  className="flex items-center gap-2 min-h-[32px] transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-1 -ml-1"
                >
                  <LuMail className="h-4 w-4" />
                  support@trendscrape.com
                </a>
              </li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold">TrendScrape Prompt</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              매주 업데이트되는 트렌드 프롬프트로 빠르게 성과를 만들어보세요.
            </p>
          </div>
        </div>

        {/* 저작권 정보 */}
        <div className="mt-8 md:mt-12 border-t pt-6 md:pt-8 text-center text-xs md:text-sm text-muted-foreground">
          <p>© {currentYear} TrendScrape Prompt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

