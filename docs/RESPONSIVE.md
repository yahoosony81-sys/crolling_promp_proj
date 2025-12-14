# 반응형 디자인 가이드

이 문서는 TrendScrape Prompt 프로젝트의 반응형 디자인 시스템 사용 가이드입니다.

## 브레이크포인트

프로젝트는 Tailwind CSS의 기본 브레이크포인트를 사용합니다:

- **모바일**: 0px ~ 639px (`sm` 미만)
- **태블릿**: 640px ~ 1023px (`sm` ~ `lg` 미만)
- **데스크톱**: 1024px 이상 (`lg` 이상)

### 브레이크포인트 상수

`src/lib/constants/breakpoints.ts`에서 브레이크포인트 상수를 정의합니다:

```typescript
import { BREAKPOINTS, DEVICE_BREAKPOINTS } from "@/lib/constants/breakpoints";

// 특정 브레이크포인트 값 사용
const tabletBreakpoint = BREAKPOINTS.md; // 768px

// 디바이스 타입별 범위
const mobileRange = DEVICE_BREAKPOINTS.mobile; // { min: 0, max: 639 }
```

## 훅 사용

### useIsMobile

모바일 디바이스 여부를 확인하는 훅:

```typescript
import { useIsMobile } from "@/hooks/use-breakpoint";

function MyComponent() {
  const isMobile = useIsMobile();
  
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

### useIsTablet

태블릿 디바이스 여부를 확인하는 훅:

```typescript
import { useIsTablet } from "@/hooks/use-breakpoint";

function MyComponent() {
  const isTablet = useIsTablet();
  
  return isTablet ? <TabletView /> : <OtherView />;
}
```

### useDeviceType

현재 디바이스 타입을 반환하는 훅:

```typescript
import { useDeviceType } from "@/hooks/use-breakpoint";

function MyComponent() {
  const deviceType = useDeviceType(); // "mobile" | "tablet" | "desktop" | undefined
  
  return <div>현재 디바이스: {deviceType}</div>;
}
```

## 반응형 유틸리티 함수

`src/lib/utils/responsive.ts`에서 반응형 유틸리티 함수를 제공합니다:

### getGridCols

반응형 그리드 컬럼 클래스를 생성:

```typescript
import { getGridCols } from "@/lib/utils/responsive";

// 모바일 1열, 태블릿 2열, 데스크톱 3열
const gridClasses = getGridCols({
  mobile: 1,
  tablet: 2,
  desktop: 3,
});
```

### getResponsivePadding

반응형 패딩 클래스를 생성:

```typescript
import { getResponsivePadding } from "@/lib/utils/responsive";

const paddingClasses = getResponsivePadding({
  mobile: "p-4",
  tablet: "md:p-6",
  desktop: "lg:p-8",
});
```

## 컴포넌트 작성 가이드

### 그리드 레이아웃

반응형 그리드를 사용할 때는 다음과 같은 패턴을 따릅니다:

```tsx
// ✅ 좋은 예
<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} />)}
</div>

// ❌ 나쁜 예 (모바일 최적화 없음)
<div className="grid grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### 타이포그래피

반응형 텍스트 크기 사용:

```tsx
// ✅ 좋은 예
<h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
  제목
</h1>

<p className="text-base text-muted-foreground sm:text-lg">
  설명 텍스트
</p>
```

### 패딩 및 마진

반응형 간격 사용:

```tsx
// ✅ 좋은 예
<section className="py-12 sm:py-16 md:py-24">
  <div className="container px-4 md:px-8">
    {/* 콘텐츠 */}
  </div>
</section>
```

### 터치 영역

모바일에서 최소 터치 영역 44x44px 보장:

```tsx
// ✅ 좋은 예
<Button className="min-h-[44px] min-w-[44px]">
  클릭
</Button>

<Link className="block min-h-[44px] flex items-center">
  링크
</Link>
```

## 모바일 최적화 체크리스트

새 컴포넌트를 만들 때 다음 사항을 확인하세요:

- [ ] 모바일에서 그리드가 1열로 표시되는가?
- [ ] 텍스트 크기가 모바일에서 읽기 쉬운가?
- [ ] 버튼과 링크의 최소 터치 영역이 44x44px인가?
- [ ] 패딩과 마진이 모바일에서 적절한가?
- [ ] 가로 스크롤이 발생하지 않는가?
- [ ] 이미지가 모바일에서 적절한 크기로 표시되는가?

## 태블릿 최적화

태블릿 레이아웃은 다음과 같이 최적화합니다:

- 그리드: 모바일 1열, 태블릿 2열, 데스크톱 3열
- 네비게이션: 태블릿에서 데스크톱 네비게이션 표시 (햄버거 메뉴 숨김)
- 타이포그래피: 모바일과 데스크톱 사이의 중간 크기

## 예제

### 카드 리스트 컴포넌트

```tsx
export function CardList({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map(item => (
        <Card key={item.id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm sm:text-base">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 반응형 섹션

```tsx
export function ResponsiveSection() {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container px-4 md:px-8">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
            섹션 제목
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            섹션 설명
          </p>
        </div>
        {/* 콘텐츠 */}
      </div>
    </section>
  );
}
```

## 참고 자료

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Design Principles](https://web.dev/responsive-web-design-basics/)

