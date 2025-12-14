# 애니메이션 가이드

이 문서는 TrendScrape Prompt 프로젝트의 애니메이션 사용 가이드입니다.

## 애니메이션 원칙

1. **성능 우선**: CSS transforms와 opacity 사용 (layout 변경 최소화)
2. **접근성 고려**: `prefers-reduced-motion` 미디어 쿼리 지원
3. **일관성 유지**: 프로젝트 전반에 걸쳐 일관된 애니메이션 사용
4. **의미 있는 애니메이션**: 사용자 경험을 향상시키는 애니메이션만 사용

## 기본 애니메이션

### Tailwind CSS 애니메이션 클래스

프로젝트는 Tailwind CSS의 기본 애니메이션 클래스를 사용합니다:

- `animate-spin`: 로딩 스피너
- `animate-pulse`: 스켈레톤 로딩
- `animate-in`: 진입 애니메이션
- `fade-in-0`: 페이드 인
- `slide-in-from-bottom-4`: 하단에서 슬라이드 인

### 전환 효과

일반적인 전환 효과:

```tsx
// 기본 전환
className="transition-all duration-200"

// 색상 전환만
className="transition-colors duration-200"

// transform 전환만
className="transition-transform duration-200"
```

## 컴포넌트별 애니메이션

### 버튼

버튼은 active 상태와 호버 상태에 애니메이션을 적용합니다:

```tsx
<Button className="transition-all duration-200 active:scale-[0.98]">
  클릭
</Button>
```

### 카드

카드는 호버 시 그림자와 transform 효과를 적용합니다:

```tsx
<Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
  {/* 카드 내용 */}
</Card>
```

### 로딩 상태

로딩 상태는 Spinner와 Skeleton 컴포넌트를 사용합니다:

```tsx
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

// 스피너
<Spinner size="lg" />

// 스켈레톤
<Skeleton className="h-4 w-full" />
```

### 페이지 전환

페이지 전환은 `src/app/template.tsx`에서 처리됩니다:

```tsx
// template.tsx는 자동으로 페이지 전환 애니메이션을 적용합니다
// 별도 설정 불필요
```

## 전환 컴포넌트

`src/components/ui/transition.tsx`에서 재사용 가능한 전환 컴포넌트를 제공합니다:

### FadeIn

페이드 인 효과:

```tsx
import { FadeIn } from "@/components/ui/transition";

<FadeIn delay={100}>
  <div>콘텐츠</div>
</FadeIn>
```

### SlideUp

하단에서 슬라이드 업 효과:

```tsx
import { SlideUp } from "@/components/ui/transition";

<SlideUp delay={200}>
  <div>콘텐츠</div>
</SlideUp>
```

## 접근성

### prefers-reduced-motion

애니메이션을 비활성화한 사용자를 위해 `prefers-reduced-motion` 미디어 쿼리를 지원합니다:

```css
/* globals.css에 이미 적용됨 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 키보드 네비게이션

모든 인터랙티브 요소는 키보드 포커스 스타일을 제공합니다:

```tsx
<Button className="focus-visible:ring-2 focus-visible:ring-ring">
  버튼
</Button>
```

## 성능 최적화

### CSS Transforms 사용

layout 변경을 최소화하기 위해 transform을 사용합니다:

```tsx
// ✅ 좋은 예 (GPU 가속)
className="transition-transform hover:translate-y-[-4px]"

// ❌ 나쁜 예 (layout 변경 발생)
className="transition-all hover:top-[-4px]"
```

### will-change 속성

필요한 경우에만 `will-change` 속성을 사용합니다:

```tsx
// 자주 애니메이션되는 요소에만 사용
<div className="will-change-transform">
  {/* 애니메이션 콘텐츠 */}
</div>
```

### 애니메이션 지속 시간

일반적인 애니메이션 지속 시간:

- **빠른 전환**: 150ms ~ 200ms (버튼 클릭, 호버)
- **일반 전환**: 200ms ~ 300ms (카드 호버, 모달)
- **느린 전환**: 300ms ~ 500ms (페이지 전환)

## 사용 예제

### 카드 호버 효과

```tsx
<Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
</Card>
```

### 버튼 클릭 피드백

```tsx
<Button className="transition-all duration-200 active:scale-[0.98]">
  클릭
</Button>
```

### 로딩 오버레이

```tsx
import { LoadingOverlay } from "@/components/ui/loading-overlay";

<LoadingOverlay isLoading={isLoading} message="로딩 중..." />
```

### 스켈레톤 로딩

```tsx
import { SkeletonCard, SkeletonText } from "@/components/ui/skeleton-variants";

// 카드 스켈레톤
<SkeletonCard />

// 텍스트 스켈레톤
<SkeletonText lines={3} />
```

## 애니메이션 체크리스트

새 애니메이션을 추가할 때 다음 사항을 확인하세요:

- [ ] `prefers-reduced-motion`을 지원하는가?
- [ ] CSS transforms를 사용하는가? (layout 변경 최소화)
- [ ] 애니메이션 지속 시간이 적절한가? (200ms ~ 300ms)
- [ ] 키보드 포커스 스타일이 있는가?
- [ ] 성능에 영향을 주지 않는가?

## 금지 사항

다음과 같은 애니메이션은 사용하지 않습니다:

- ❌ 자동 재생되는 무한 애니메이션 (사용자 제어 없이)
- ❌ layout을 변경하는 애니메이션 (width, height, top, left 등)
- ❌ 500ms 이상의 긴 애니메이션
- ❌ 사용자 경험을 해치는 애니메이션

## 참고 자료

- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [CSS Animations Performance](https://web.dev/animations/)

