# 에러 해결 가이드

이 문서는 프로젝트에서 발견된 에러 원인과 해결 방법을 문서화합니다.

## 목차

1. [Clerk 인증 관련 문제](#clerk-인증-관련-문제)
2. [Next.js App Router 설정 문제](#nextjs-app-router-설정-문제)
3. [Supabase SSR 설정](#supabase-ssr-설정)
4. [Vercel 배포 설정](#vercel-배포-설정)

---

## Clerk 인증 관련 문제

### 문제점

1. **CSP(Content Security Policy) 설정 불완전**
   - Clerk의 CAPTCHA 도메인은 포함되어 있었으나, Clerk 문서에서 권장하는 추가 설정 누락
   - Clerk 미들웨어의 CSP 자동 관리 기능 미사용

2. **ClerkProvider 설정 누락**
   - 프로덕션 환경을 위한 `domain` 속성 미설정
   - 전역 `appearance` 설정 미구현

### 해결 방법

#### 1. Clerk 미들웨어 CSP 자동 관리 활성화

`src/middleware.ts` 파일을 수정하여 Clerk 미들웨어의 CSP 자동 관리 기능을 활성화했습니다:

```typescript
export default clerkMiddleware(
  async (auth, request: NextRequest) => {
    // ... 기존 로직
  },
  {
    contentSecurityPolicy: {
      strict: false, // next.config.ts의 CSP와 병합
      directives: {
        // 추가로 필요한 CSP 지시어가 있으면 여기에 추가
      },
    },
  }
);
```

**효과**: Clerk 미들웨어가 자동으로 필요한 CSP 지시어를 추가하여 CAPTCHA 및 보안 검증이 정상 작동합니다.

#### 2. ClerkProvider 설정 보완

`src/app/layout.tsx` 파일을 수정하여 프로덕션 환경 설정을 추가했습니다:

```typescript
const domain = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
const clerkDomain = domain ? new URL(domain).hostname : undefined;

<ClerkProvider 
  localization={koKR}
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  {...(clerkDomain ? { domain: clerkDomain } : {})}
  appearance={{
    baseTheme: undefined, // 시스템 테마 사용
    variables: {
      colorPrimary: 'hsl(var(--primary))',
    },
  }}
>
```

**효과**: 프로덕션 환경에서 Clerk가 올바르게 작동하며, 앱의 테마와 일관된 UI를 제공합니다.

#### 3. CSP 설정 개선

`next.config.ts`의 CSP 설정에 Clerk 이미지 도메인을 추가했습니다:

```typescript
"img-src 'self' data: https: blob: https://img.clerk.com",
```

**효과**: Clerk 프로필 이미지 등이 정상적으로 로드됩니다.

---

## Next.js App Router 설정 문제

### 문제점

1. **커스텀 404 페이지 누락**
   - 기본 Next.js 404 페이지 사용
   - 사용자 규칙에 따라 커스텀 404 페이지 필요

2. **전역 에러 바운더리 누락**
   - 애플리케이션 전체의 처리되지 않은 에러를 캐치할 수 없음

3. **dynamic 설정 과다 사용**
   - 모든 Clerk 관련 페이지와 API 라우트에 `force-dynamic` 적용
   - 일부는 불필요할 수 있음

### 해결 방법

#### 1. 커스텀 404 페이지 생성

`src/app/not-found.tsx` 파일을 생성했습니다:

- 한국어 메시지 제공
- 네비게이션 링크 포함 (홈, 무료 프롬프트, 트렌드 패키지)
- 이전 페이지로 돌아가기 기능

**효과**: 사용자에게 더 나은 404 경험을 제공합니다.

#### 2. 전역 에러 바운더리 생성

`src/app/global-error.tsx` 파일을 생성했습니다:

- 애플리케이션 전체의 처리되지 않은 에러 캐치
- 개발 환경에서 에러 상세 정보 표시
- 에러 복구 기능 제공

**주의**: `global-error.tsx`는 root layout을 대체하므로 `<html>`과 `<body>` 태그를 포함해야 합니다.

**효과**: 예기치 않은 에러 발생 시 사용자에게 친절한 에러 메시지를 제공합니다.

#### 3. dynamic 설정 검토

대부분의 `dynamic = 'force-dynamic'` 설정은 적절합니다:

- **유지 필요**: Clerk를 사용하는 페이지 (`/login`, `/sign-up`, `/account`, `/pricing` 등)
- **유지 필요**: 동적 데이터를 다루는 API 라우트
- **제거 가능**: 정적 페이지나 캐싱 가능한 페이지 (현재는 없음)

**효과**: 적절한 캐싱 전략으로 성능이 최적화됩니다.

---

## Supabase SSR 설정

### 현재 상태

프로젝트는 Supabase 공식 문서의 최신 권장사항을 올바르게 따르고 있습니다:

1. **서버 사이드 클라이언트** (`src/lib/supabase/server.ts`)
   - `@supabase/ssr`의 `createServerClient` 사용 ✅
   - 쿠키 기반 세션 관리 ✅
   - Clerk 세션 토큰 자동 포함 ✅

2. **클라이언트 사이드 클라이언트** (`src/lib/supabase/client.ts`)
   - `@supabase/ssr`의 `createBrowserClient` 사용 ✅
   - Clerk 세션 토큰 자동 포함 ✅

3. **인증 방식**
   - Clerk를 인증으로 사용
   - Supabase는 데이터베이스로만 사용
   - Supabase Auth는 사용하지 않음

### 검증 결과

✅ **올바르게 설정됨**: Supabase SSR 설정은 최신 권장사항을 따르고 있습니다.

**참고**: 이 프로젝트는 Clerk를 인증으로 사용하므로, Supabase Auth 세션 갱신이 필요하지 않습니다. 미들웨어에서 Supabase 세션 갱신 로직을 추가할 필요가 없습니다.

---

## Vercel 배포 설정

### 환경 변수 체크리스트

다음 환경 변수들이 Vercel에 설정되어 있는지 확인하세요:

#### Clerk 관련
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET` (웹훅 사용 시)

#### Supabase 관련
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### 애플리케이션 설정
- `NEXT_PUBLIC_APP_URL` 또는 `NEXT_PUBLIC_SITE_URL` (프로덕션 URL)

#### Toss Payments 관련 (결제 사용 시)
- `NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY`
- `TOSS_PAYMENTS_SECRET_KEY`
- `TOSS_PAYMENTS_WEBHOOK_SECRET`

#### 내부 API (크롤링 사용 시)
- `INTERNAL_API_KEY`

### Vercel Cron Job 설정

`vercel.json` 파일에 크롤링 스케줄이 설정되어 있습니다:

```json
{
  "crons": [
    {
      "path": "/api/crawl/run",
      "schedule": "0 2 * * 1"
    }
  ]
}
```

**설정 확인 사항**:
1. Vercel 대시보드에서 Cron Job이 활성화되어 있는지 확인
2. `INTERNAL_API_KEY` 환경 변수가 설정되어 있는지 확인
3. Cron Job이 올바르게 실행되는지 로그 확인

---

## 테스트 체크리스트

### Clerk 인증 테스트

- [ ] `/login` 페이지 접근 시 Clerk 로그인 폼 표시
- [ ] `/sign-up` 페이지 접근 시 Clerk 회원가입 폼 표시
- [ ] 로그인 성공 시 리다이렉트 정상 작동
- [ ] 회원가입 성공 시 리다이렉트 정상 작동
- [ ] CAPTCHA 정상 작동 (보안 검증 통과)
- [ ] 이미 로그인한 사용자가 `/login` 또는 `/sign-up` 접근 시 홈으로 리다이렉트

### 404 페이지 테스트

- [ ] 존재하지 않는 URL 접근 시 커스텀 404 페이지 표시
- [ ] 404 페이지의 네비게이션 링크 정상 작동
- [ ] "이전 페이지" 버튼 정상 작동

### 에러 처리 테스트

- [ ] API 에러 발생 시 적절한 에러 메시지 표시
- [ ] 전역 에러 바운더리가 예기치 않은 에러를 캐치하는지 확인
- [ ] 개발 환경에서 에러 상세 정보가 표시되는지 확인

### Supabase 연결 테스트

- [ ] 서버 사이드에서 Supabase 데이터 조회 정상 작동
- [ ] 클라이언트 사이드에서 Supabase 데이터 조회 정상 작동
- [ ] Clerk 세션 토큰이 Supabase 요청에 포함되는지 확인

---

## 추가 참고 자료

- [Clerk 공식 문서](https://clerk.com/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Vercel 공식 문서](https://vercel.com/docs)

---

**마지막 업데이트**: 2025-01-XX
**문서 버전**: 1.0.0

