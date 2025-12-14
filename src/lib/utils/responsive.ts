import { cn } from "@/lib/utils";
import { BREAKPOINTS } from "@/lib/constants/breakpoints";

/**
 * 반응형 그리드 컬럼 클래스를 생성하는 함수
 * @param cols 모바일, 태블릿, 데스크톱 컬럼 수
 * @returns Tailwind 그리드 클래스 문자열
 */
export function getGridCols(
  cols: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  }
): string {
  const { mobile = 1, tablet = 2, desktop = 3 } = cols;
  
  return cn(
    `grid-cols-${mobile}`,
    `md:grid-cols-${tablet}`,
    `lg:grid-cols-${desktop}`
  );
}

/**
 * 반응형 컨테이너 최대 너비 클래스를 반환하는 함수
 * @param size 컨테이너 크기 ('sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full')
 * @returns Tailwind 컨테이너 클래스 문자열
 */
export function getContainerMaxWidth(
  size: "sm" | "md" | "lg" | "xl" | "2xl" | "full" = "xl"
): string {
  const maxWidthMap = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  return maxWidthMap[size];
}

/**
 * 반응형 패딩 클래스를 생성하는 함수
 * @param padding 모바일, 태블릿, 데스크톱 패딩 값
 * @returns Tailwind 패딩 클래스 문자열
 */
export function getResponsivePadding(padding: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const { mobile = "p-4", tablet = "md:p-6", desktop = "lg:p-8" } = padding;
  
  return cn(mobile, tablet, desktop);
}

/**
 * 반응형 마진 클래스를 생성하는 함수
 * @param margin 모바일, 태블릿, 데스크톱 마진 값
 * @returns Tailwind 마진 클래스 문자열
 */
export function getResponsiveMargin(margin: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const { mobile = "m-4", tablet = "md:m-6", desktop = "lg:m-8" } = margin;
  
  return cn(mobile, tablet, desktop);
}

/**
 * 반응형 텍스트 크기 클래스를 생성하는 함수
 * @param sizes 모바일, 태블릿, 데스크톱 텍스트 크기
 * @returns Tailwind 텍스트 크기 클래스 문자열
 */
export function getResponsiveTextSize(sizes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const { mobile = "text-base", tablet = "md:text-lg", desktop = "lg:text-xl" } = sizes;
  
  return cn(mobile, tablet, desktop);
}

/**
 * 반응형 간격 클래스를 생성하는 함수
 * @param gap 모바일, 태블릿, 데스크톱 간격 값
 * @returns Tailwind 간격 클래스 문자열
 */
export function getResponsiveGap(gap: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  const { mobile = "gap-4", tablet = "md:gap-6", desktop = "lg:gap-8" } = gap;
  
  return cn(mobile, tablet, desktop);
}

