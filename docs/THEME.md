# 테마 시스템 사용 가이드

TrendScrape Prompt 서비스의 테마 시스템은 `next-themes`를 기반으로 구축되었으며, 라이트 모드와 다크 모드를 지원합니다.

## 목차

- [테마 시스템 개요](#테마-시스템-개요)
- [색상 팔레트](#색상-팔레트)
- [테마 사용 방법](#테마-사용-방법)
- [컴포넌트에서 테마 사용](#컴포넌트에서-테마-사용)
- [커스텀 색상 추가](#커스텀-색상-추가)

## 테마 시스템 개요

### 아키텍처

테마 시스템은 다음과 같은 구조로 구성되어 있습니다:

```
src/
├── lib/
│   ├── constants/
│   │   └── colors.ts          # 색상 팔레트 상수 정의
│   ├── types/
│   │   └── theme.ts           # 테마 관련 타입 정의
│   └── utils/
│       └── theme.ts            # 테마 유틸리티 함수
├── components/
│   ├── providers/
│   │   └── theme-provider.tsx # ThemeProvider 컴포넌트
│   └── theme-switcher.tsx     # 테마 전환 UI 컴포넌트
└── app/
    ├── layout.tsx              # ThemeProvider 설정
    └── globals.css             # CSS 변수 정의
```

### 테마 모드

- **light**: 라이트 모드 (밝은 배경)
- **dark**: 다크 모드 (어두운 배경)
- **system**: 시스템 설정 따르기 (사용자의 OS 설정)

## 색상 팔레트

### 색상 공간

모든 색상은 **oklch** 색상 공간을 사용합니다. 이는 다음과 같은 장점이 있습니다:

- 더 넓은 색 영역 지원
- 일관된 인지적 밝기
- 색맹 사용자에게도 접근 가능한 색상

### 주요 색상

#### Primary 색상

메인 브랜드 색상으로, 버튼, 링크 등 주요 인터랙션 요소에 사용됩니다.

- **라이트 모드**: `oklch(0.35 0.03 250)` - 약간의 블루 톤이 있는 진한 회색
- **다크 모드**: `oklch(0.922 0 0)` - 거의 흰색

#### Secondary 색상

보조 색상으로, Secondary 버튼 등에 사용됩니다.

- **라이트 모드**: `oklch(0.97 0 0)` - 매우 밝은 회색
- **다크 모드**: `oklch(0.269 0 0)` - 어두운 회색

#### Muted 색상

비활성 상태나 보조 텍스트에 사용됩니다.

- **라이트 모드**: `oklch(0.97 0 0)` - 매우 밝은 회색
- **다크 모드**: `oklch(0.269 0 0)` - 어두운 회색

#### Accent 색상

강조가 필요한 요소에 사용됩니다.

- **라이트 모드**: `oklch(0.97 0 0)` - 매우 밝은 회색
- **다크 모드**: `oklch(0.269 0 0)` - 어두운 회색

#### Destructive 색상

경고나 삭제 액션에 사용됩니다.

- **라이트 모드**: `oklch(0.577 0.245 27.325)` - 빨간색
- **다크 모드**: `oklch(0.704 0.191 22.216)` - 밝은 빨간색

### 전체 색상 목록

모든 색상은 `src/lib/constants/colors.ts`에 정의되어 있습니다:

- `background` / `foreground`: 기본 배경 및 텍스트
- `card` / `cardForeground`: 카드 배경 및 텍스트
- `popover` / `popoverForeground`: 팝오버 배경 및 텍스트
- `primary` / `primaryForeground`: Primary 색상
- `secondary` / `secondaryForeground`: Secondary 색상
- `muted` / `mutedForeground`: Muted 색상
- `accent` / `accentForeground`: Accent 색상
- `destructive` / `destructiveForeground`: Destructive 색상
- `border`: 테두리 색상
- `input`: 입력 필드 배경 색상
- `ring`: 포커스 링 색상
- `chart1` ~ `chart5`: 차트 색상

## 테마 사용 방법

### ThemeProvider 설정

`src/app/layout.tsx`에서 ThemeProvider가 설정되어 있습니다:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

- `attribute="class"`: HTML 요소에 `class` 속성으로 테마 적용
- `defaultTheme="system"`: 기본값은 시스템 설정 따르기
- `enableSystem`: 시스템 테마 감지 활성화
- `disableTransitionOnChange`: 테마 전환 시 트랜지션 비활성화 (깜빡임 방지)

### 테마 전환 UI

`ThemeSwitcher` 컴포넌트를 사용하여 사용자가 테마를 전환할 수 있습니다:

```tsx
import { ThemeSwitcher } from '@/components/theme-switcher';

<ThemeSwitcher />
```

이 컴포넌트는 헤더에 이미 포함되어 있습니다.

### 프로그래밍 방식으로 테마 전환

클라이언트 컴포넌트에서 `useTheme` 훅을 사용합니다:

```tsx
'use client';

import { useTheme } from 'next-themes';

export function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      다크 모드로 전환
    </button>
  );
}
```

## 컴포넌트에서 테마 사용

### Tailwind 시맨틱 색상 클래스 사용

가장 권장되는 방법은 Tailwind의 시맨틱 색상 클래스를 사용하는 것입니다:

```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    버튼
  </button>
</div>
```

이 방법을 사용하면 CSS 변수를 통해 자동으로 다크 모드가 적용됩니다.

### 직접 CSS 변수 사용

필요한 경우 CSS 변수를 직접 사용할 수 있습니다:

```tsx
<div style={{ backgroundColor: 'var(--background)' }}>
  내용
</div>
```

### 다크 모드 전용 스타일

특정 요소에 다크 모드 전용 스타일을 적용하려면 `dark:` 접두사를 사용합니다:

```tsx
<div className="bg-white dark:bg-gray-900">
  내용
</div>
```

하지만 가능한 한 시맨틱 색상 클래스를 사용하는 것이 좋습니다:

```tsx
<div className="bg-card dark:bg-card">
  내용
</div>
```

### 테마 유틸리티 함수 사용

`src/lib/utils/theme.ts`에서 제공하는 유틸리티 함수를 사용할 수 있습니다:

```tsx
import { getThemeColor, isDarkMode, getThemeConfig } from '@/lib/utils/theme';
import { useTheme } from 'next-themes';

export function MyComponent() {
  const { theme, systemTheme } = useTheme();
  
  // 현재 테마에 따른 색상 값 가져오기
  const primaryColor = getThemeColor('primary', getResolvedTheme(theme, systemTheme));
  
  // 다크 모드 여부 확인
  const dark = isDarkMode(theme, systemTheme);
  
  // 테마 설정 정보 가져오기
  const config = getThemeConfig(theme, systemTheme);
  
  return <div>...</div>;
}
```

## 커스텀 색상 추가

### 1. 색상 팔레트에 추가

`src/lib/constants/colors.ts`에 새로운 색상을 추가합니다:

```typescript
export const lightColors = {
  // ... 기존 색상들
  customColor: 'oklch(0.5 0.1 200)', // 커스텀 색상
} as const;

export const darkColors = {
  // ... 기존 색상들
  customColor: 'oklch(0.7 0.1 200)', // 다크 모드용 커스텀 색상
} as const;
```

### 2. 타입 정의 업데이트

`src/lib/types/theme.ts`의 `ColorKey` 타입에 추가합니다:

```typescript
export type ColorKey =
  | 'background'
  | 'foreground'
  // ... 기존 키들
  | 'customColor'; // 새 키 추가
```

### 3. CSS 변수 추가

`src/app/globals.css`에 CSS 변수를 추가합니다:

```css
:root {
  /* ... 기존 변수들 */
  --custom-color: oklch(0.5 0.1 200);
}

.dark {
  /* ... 기존 변수들 */
  --custom-color: oklch(0.7 0.1 200);
}
```

### 4. Tailwind 설정 (선택사항)

`tailwind.config.ts`에 색상을 추가하여 Tailwind 클래스로 사용할 수 있습니다:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        custom: 'var(--custom-color)',
      },
    },
  },
};
```

## 접근성 고려사항

### 색상 대비율

모든 색상은 WCAG 2.1 AA 기준을 만족하도록 설계되었습니다:

- 일반 텍스트: 최소 4.5:1 대비율
- 큰 텍스트: 최소 3:1 대비율
- 인터랙티브 요소: 최소 3:1 대비율

### 다크 모드 지원

모든 컴포넌트는 다크 모드를 지원하며, 사용자의 시스템 설정을 자동으로 감지합니다.

## 문제 해결

### 테마가 적용되지 않는 경우

1. `ThemeProvider`가 `layout.tsx`에 올바르게 설정되어 있는지 확인
2. HTML 요소에 `suppressHydrationWarning` 속성이 있는지 확인
3. 브라우저 콘솔에서 에러가 있는지 확인

### SSR 하이드레이션 경고

`ThemeSwitcher` 컴포넌트는 `mounted` 상태를 사용하여 SSR 하이드레이션 이슈를 방지합니다. 클라이언트 컴포넌트에서 테마를 사용할 때도 유사한 패턴을 사용하는 것이 좋습니다.

### 색상이 예상과 다른 경우

1. CSS 변수가 올바르게 정의되어 있는지 확인
2. Tailwind 클래스가 올바르게 사용되고 있는지 확인
3. 브라우저 개발자 도구에서 CSS 변수 값을 확인

## 참고 자료

- [next-themes 문서](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS 다크 모드](https://tailwindcss.com/docs/dark-mode)
- [oklch 색상 공간](https://oklch.com/)
- [WCAG 접근성 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)

