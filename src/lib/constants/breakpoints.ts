/**
 * 반응형 디자인 브레이크포인트 상수
 * Tailwind CSS 기본 브레이크포인트와 일치
 */
export const BREAKPOINTS = {
  /** 모바일: 0px ~ 639px */
  sm: 640,
  /** 태블릿: 640px ~ 767px */
  md: 768,
  /** 작은 데스크톱: 768px ~ 1023px */
  lg: 1024,
  /** 데스크톱: 1024px ~ 1279px */
  xl: 1280,
  /** 큰 데스크톱: 1280px ~ 1535px */
  "2xl": 1536,
} as const;

/**
 * 디바이스 타입별 브레이크포인트 범위
 */
export const DEVICE_BREAKPOINTS = {
  /** 모바일: 0px ~ 639px */
  mobile: { min: 0, max: BREAKPOINTS.sm - 1 },
  /** 태블릿: 640px ~ 1023px */
  tablet: { min: BREAKPOINTS.sm, max: BREAKPOINTS.lg - 1 },
  /** 데스크톱: 1024px 이상 */
  desktop: { min: BREAKPOINTS.lg, max: Infinity },
} as const;

/**
 * 브레이크포인트 타입
 */
export type Breakpoint = keyof typeof BREAKPOINTS;
export type DeviceType = keyof typeof DEVICE_BREAKPOINTS;

