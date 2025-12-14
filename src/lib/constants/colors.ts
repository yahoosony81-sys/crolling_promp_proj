/**
 * 색상 팔레트 상수 정의
 * 
 * TrendScrape Prompt 서비스의 일관된 색상 시스템을 정의합니다.
 * oklch 색상 공간을 사용하여 더 넓은 색 영역과 일관된 인지적 밝기를 제공합니다.
 */

/**
 * 라이트 모드 색상 팔레트
 */
export const lightColors = {
  // 기본 배경 및 텍스트
  background: 'oklch(1 0 0)', // 순수 흰색
  foreground: 'oklch(0.145 0 0)', // 거의 검은색
  
  // 카드 및 팝오버
  card: 'oklch(1 0 0)', // 흰색
  cardForeground: 'oklch(0.145 0 0)', // 거의 검은색
  popover: 'oklch(1 0 0)', // 흰색
  popoverForeground: 'oklch(0.145 0 0)', // 거의 검은색
  
  // Primary 색상 (메인 브랜드 색상)
  // 중립적이면서도 약간의 색조를 가진 색상으로 개선
  primary: 'oklch(0.35 0.03 250)', // 약간의 블루 톤이 있는 진한 회색
  primaryForeground: 'oklch(0.985 0 0)', // 거의 흰색
  
  // Secondary 색상
  secondary: 'oklch(0.97 0 0)', // 매우 밝은 회색
  secondaryForeground: 'oklch(0.35 0.03 250)', // primary와 동일
  
  // Muted 색상 (비활성/보조 텍스트)
  muted: 'oklch(0.97 0 0)', // 매우 밝은 회색
  mutedForeground: 'oklch(0.556 0 0)', // 중간 회색
  
  // Accent 색상 (강조)
  accent: 'oklch(0.97 0 0)', // 매우 밝은 회색
  accentForeground: 'oklch(0.35 0.03 250)', // primary와 동일
  
  // Destructive 색상 (경고/삭제)
  destructive: 'oklch(0.577 0.245 27.325)', // 빨간색
  destructiveForeground: 'oklch(0.985 0 0)', // 거의 흰색
  
  // 테두리 및 입력 필드
  border: 'oklch(0.922 0 0)', // 밝은 회색
  input: 'oklch(0.922 0 0)', // 밝은 회색
  ring: 'oklch(0.708 0 0)', // 중간 회색
  
  // 차트 색상
  chart1: 'oklch(0.646 0.222 41.116)', // 주황색
  chart2: 'oklch(0.6 0.118 184.704)', // 청록색
  chart3: 'oklch(0.398 0.07 227.392)', // 파란색
  chart4: 'oklch(0.828 0.189 84.429)', // 노란색
  chart5: 'oklch(0.769 0.188 70.08)', // 연두색
  
  // 사이드바 색상
  sidebar: 'hsl(0 0% 98%)',
  sidebarForeground: 'hsl(240 5.3% 26.1%)',
  sidebarPrimary: 'hsl(240 5.9% 10%)',
  sidebarPrimaryForeground: 'hsl(0 0% 98%)',
  sidebarAccent: 'hsl(240 4.8% 95.9%)',
  sidebarAccentForeground: 'hsl(240 5.9% 10%)',
  sidebarBorder: 'hsl(220 13% 91%)',
  sidebarRing: 'hsl(217.2 91.2% 59.8%)',
} as const;

/**
 * 다크 모드 색상 팔레트
 */
export const darkColors = {
  // 기본 배경 및 텍스트
  background: 'oklch(0.145 0 0)', // 거의 검은색
  foreground: 'oklch(0.985 0 0)', // 거의 흰색
  
  // 카드 및 팝오버
  card: 'oklch(0.205 0 0)', // 어두운 회색
  cardForeground: 'oklch(0.985 0 0)', // 거의 흰색
  popover: 'oklch(0.205 0 0)', // 어두운 회색
  popoverForeground: 'oklch(0.985 0 0)', // 거의 흰색
  
  // Primary 색상 (다크 모드에서는 밝은 색상)
  primary: 'oklch(0.922 0 0)', // 거의 흰색
  primaryForeground: 'oklch(0.35 0.03 250)', // 라이트 모드 primary와 동일
  
  // Secondary 색상
  secondary: 'oklch(0.269 0 0)', // 어두운 회색
  secondaryForeground: 'oklch(0.985 0 0)', // 거의 흰색
  
  // Muted 색상
  muted: 'oklch(0.269 0 0)', // 어두운 회색
  mutedForeground: 'oklch(0.708 0 0)', // 중간 밝기 회색
  
  // Accent 색상
  accent: 'oklch(0.269 0 0)', // 어두운 회색
  accentForeground: 'oklch(0.985 0 0)', // 거의 흰색
  
  // Destructive 색상
  destructive: 'oklch(0.704 0.191 22.216)', // 밝은 빨간색
  destructiveForeground: 'oklch(0.985 0 0)', // 거의 흰색
  
  // 테두리 및 입력 필드
  border: 'oklch(1 0 0 / 10%)', // 반투명 흰색
  input: 'oklch(1 0 0 / 15%)', // 반투명 흰색
  ring: 'oklch(0.556 0 0)', // 중간 회색
  
  // 차트 색상
  chart1: 'oklch(0.488 0.243 264.376)', // 보라색
  chart2: 'oklch(0.696 0.17 162.48)', // 청록색
  chart3: 'oklch(0.769 0.188 70.08)', // 연두색
  chart4: 'oklch(0.627 0.265 303.9)', // 분홍색
  chart5: 'oklch(0.645 0.246 16.439)', // 주황색
  
  // 사이드바 색상
  sidebar: 'hsl(240 5.9% 10%)',
  sidebarForeground: 'hsl(240 4.8% 95.9%)',
  sidebarPrimary: 'hsl(224.3 76.3% 48%)',
  sidebarPrimaryForeground: 'hsl(0 0% 100%)',
  sidebarAccent: 'hsl(240 3.7% 15.9%)',
  sidebarAccentForeground: 'hsl(240 4.8% 95.9%)',
  sidebarBorder: 'hsl(240 3.7% 15.9%)',
  sidebarRing: 'hsl(217.2 91.2% 59.8%)',
} as const;

/**
 * 색상 팔레트 타입
 */
export type ColorPalette = typeof lightColors;

/**
 * 테마 모드별 색상 맵
 */
export const colorPalettes = {
  light: lightColors,
  dark: darkColors,
} as const;

/**
 * CSS 변수 이름 매핑
 */
export const cssVariableMap = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
  sidebar: '--sidebar',
  sidebarForeground: '--sidebar-foreground',
  sidebarPrimary: '--sidebar-primary',
  sidebarPrimaryForeground: '--sidebar-primary-foreground',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarBorder: '--sidebar-border',
  sidebarRing: '--sidebar-ring',
} as const;

