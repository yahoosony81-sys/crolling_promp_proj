"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TransitionProps {
  children: React.ReactNode;
  className?: string;
  show?: boolean;
  duration?: number;
}

/**
 * 재사용 가능한 전환 컴포넌트
 */
export function Transition({
  children,
  className,
  show = true,
  duration = 200,
}: TransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // 다음 프레임에서 애니메이션 시작
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [show]);

  return (
    <div
      className={cn(
        "transition-all duration-200",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * 페이드 인 전환
 */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in-0 duration-200",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * 슬라이드 업 전환
 */
export function SlideUp({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

