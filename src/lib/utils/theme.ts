/**
 * 테마 관련 유틸리티 함수
 */

import type { ColorKey, ResolvedTheme } from '@/lib/types/theme';
import { colorPalettes } from '@/lib/constants/colors';

/**
 * 현재 테마에 따른 색상 값 반환
 * 
 * @param colorKey - 색상 키
 * @param theme - 테마 모드 (기본값: 'light')
 * @returns 색상 값 (oklch 형식)
 */
export function getThemeColor(
  colorKey: ColorKey,
  theme: ResolvedTheme = 'light'
): string {
  const palette = colorPalettes[theme];
  return palette[colorKey] || '';
}

/**
 * 다크 모드 여부 확인
 * 
 * @param theme - 테마 모드 ('light' | 'dark' | 'system')
 * @param systemTheme - 시스템 테마 (system 모드일 때 사용)
 * @returns 다크 모드 여부
 */
export function isDarkMode(
  theme: 'light' | 'dark' | 'system' | undefined,
  systemTheme: 'light' | 'dark' | undefined
): boolean {
  if (!theme) return false;
  
  if (theme === 'system') {
    return systemTheme === 'dark';
  }
  
  return theme === 'dark';
}

/**
 * 해결된 테마 반환 (system 모드인 경우 시스템 테마 반환)
 * 
 * @param theme - 테마 모드
 * @param systemTheme - 시스템 테마
 * @returns 해결된 테마 ('light' | 'dark')
 */
export function getResolvedTheme(
  theme: 'light' | 'dark' | 'system' | undefined,
  systemTheme: 'light' | 'dark' | undefined
): ResolvedTheme {
  if (!theme || theme === 'system') {
    return systemTheme || 'light';
  }
  
  return theme;
}

/**
 * 테마 설정 정보 반환
 * 
 * @param theme - 현재 테마 모드
 * @param systemTheme - 시스템 테마
 * @returns 테마 설정 정보
 */
export function getThemeConfig(
  theme: 'light' | 'dark' | 'system' | undefined,
  systemTheme: 'light' | 'dark' | undefined
) {
  const resolvedTheme = getResolvedTheme(theme, systemTheme);
  const isDark = isDarkMode(theme, systemTheme);
  
  return {
    mode: theme || 'system',
    resolvedTheme,
    systemTheme: systemTheme || 'light',
    isDark,
    isLight: !isDark,
  };
}

/**
 * CSS 변수 이름 반환
 * 
 * @param colorKey - 색상 키
 * @returns CSS 변수 이름 (예: '--primary')
 */
export function getCSSVariableName(colorKey: ColorKey): string {
  const variableMap: Record<ColorKey, string> = {
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
  };
  
  return variableMap[colorKey] || '';
}

