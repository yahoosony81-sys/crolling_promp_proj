"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 페이지 전환 애니메이션을 위한 템플릿 컴포넌트
 * Next.js App Router의 template.tsx는 페이지 전환 시에도 유지되는 컴포넌트입니다.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // 페이지 전환 시작
    setIsTransitioning(true);

    // 짧은 딜레이 후 새 콘텐츠 표시
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      className={cn(
        "min-h-screen transition-opacity duration-200",
        isTransitioning && "opacity-0"
      )}
    >
      {displayChildren}
    </div>
  );
}

