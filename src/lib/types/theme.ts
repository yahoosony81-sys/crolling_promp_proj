/**
 * 테마 관련 타입 정의
 */

/**
 * 테마 모드 타입
 * - light: 라이트 모드
 * - dark: 다크 모드
 * - system: 시스템 설정 따르기
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 실제 적용되는 테마 타입 (system 제외)
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * 색상 키 타입
 */
export type ColorKey =
  | 'background'
  | 'foreground'
  | 'card'
  | 'cardForeground'
  | 'popover'
  | 'popoverForeground'
  | 'primary'
  | 'primaryForeground'
  | 'secondary'
  | 'secondaryForeground'
  | 'muted'
  | 'mutedForeground'
  | 'accent'
  | 'accentForeground'
  | 'destructive'
  | 'destructiveForeground'
  | 'border'
  | 'input'
  | 'ring'
  | 'chart1'
  | 'chart2'
  | 'chart3'
  | 'chart4'
  | 'chart5'
  | 'sidebar'
  | 'sidebarForeground'
  | 'sidebarPrimary'
  | 'sidebarPrimaryForeground'
  | 'sidebarAccent'
  | 'sidebarAccentForeground'
  | 'sidebarBorder'
  | 'sidebarRing';

/**
 * 색상 팔레트 인터페이스
 */
export interface ColorPalette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

/**
 * 테마 설정 인터페이스
 */
export interface ThemeConfig {
  /**
   * 현재 테마 모드
   */
  mode: ThemeMode;
  
  /**
   * 실제 적용된 테마 (system인 경우 resolved)
   */
  resolvedTheme: ResolvedTheme;
  
  /**
   * 시스템 다크 모드 감지 여부
   */
  systemTheme: ResolvedTheme;
  
  /**
   * 테마 전환 함수
   */
  setTheme: (theme: ThemeMode) => void;
}

/**
 * 테마 컨텍스트 타입
 */
export interface ThemeContextValue {
  theme: ThemeMode | undefined;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: ResolvedTheme | undefined;
  systemTheme: ResolvedTheme | undefined;
}

