# Clerk 로그인/회원가입 문제 분석 및 해결 방법

## 🔍 문제 분석

### 현재 발생 중인 문제
- **에러 메시지**: "Sign up unsuccessful due to failed security validations"
- **증상**: 로그인 및 회원가입이 실패함
- **원인**: Clerk의 보안 검증(CAPTCHA 등)이 실패하고 있음

---

## 📋 Clerk 공식 문서 기준 설정 확인

[Clerk 공식 문서](https://clerk.com/docs)를 기준으로 현재 설정을 분석한 결과:

### ✅ 올바르게 설정된 항목

1. **ClerkProvider 설정** (`src/app/layout.tsx`)
   - ✅ `publishableKey` 속성 설정됨
   - ✅ 한국어 로컬라이제이션 적용됨
   - ✅ `dynamic = 'force-dynamic'` 설정됨

2. **CSP 기본 설정** (`next.config.ts`)
   - ✅ `script-src`에 Clerk 도메인 포함됨
   - ✅ `connect-src`에 Clerk 도메인 포함됨
   - ✅ `frame-src`에 Clerk 도메인 포함됨
   - ✅ `form-action`에 Clerk 도메인 포함됨

3. **미들웨어 설정** (`src/middleware.ts`)
   - ✅ `clerkMiddleware` 올바르게 설정됨
   - ✅ 보호된 라우트 설정됨

---

## ❌ 발견된 문제점

### 1. CSP 설정 불완전 (가장 가능성 높음)

**문제**: CAPTCHA 및 보안 검증을 위한 추가 CSP 지시어가 누락됨

**현재 CSP 설정**:
```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.tosspayments.com https://*.clerk.accounts.dev"
```

**문제점**:
- CAPTCHA 제공자 도메인이 명시되지 않음
- `worker-src` 지시어가 없음 (Clerk의 웹 워커 사용 시 필요)
- `child-src` 지시어가 없음

### 2. ClerkProvider 추가 설정 누락

**문제**: Clerk 공식 문서에서 권장하는 추가 설정이 없음

**누락된 설정**:
- `domain` 속성 (프로덕션 환경에서 필요)
- `appearance` 전역 설정
- `allowedRedirectOrigins` 설정

### 3. 브라우저 호환성 문제 가능성

**문제**: 일부 브라우저에서 CAPTCHA가 제대로 로드되지 않을 수 있음

---

## 🔧 해결 방법

### 해결 방법 1: CSP 설정 완전히 수정 (우선 적용)

`next.config.ts` 파일의 CSP 설정을 다음과 같이 수정:

```typescript
{
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.tosspayments.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://*.clerk.accounts.dev",
    "connect-src 'self' https://api.tosspayments.com https://*.supabase.co https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "frame-src 'self' https://js.tosspayments.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "worker-src 'self' blob: https://*.clerk.accounts.dev",
    "child-src 'self' blob: https://*.clerk.accounts.dev",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.clerk.accounts.dev",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; "),
},
```

**주요 변경사항**:
1. ✅ `https://challenges.cloudflare.com` 추가 (Turnstile CAPTCHA)
2. ✅ `worker-src` 추가 (Clerk 웹 워커 지원)
3. ✅ `child-src` 추가 (iframe 및 워커 지원)
4. ✅ `style-src`에 Clerk 도메인 추가
5. ✅ `img-src`에 `blob:` 추가 (동적 이미지)

### 해결 방법 2: ClerkProvider 설정 보완

`src/app/layout.tsx` 파일 수정:

```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const domain = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  
  return (
    <ClerkProvider 
      localization={koKR}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      {...(domain ? { 
        domain: new URL(domain).hostname 
      } : {})}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#000000',
        },
      }}
    >
      {/* ... */}
    </ClerkProvider>
  );
}
```

### 해결 방법 3: Clerk 대시보드 설정 확인

[Clerk 대시보드](https://dashboard.clerk.com)에서 확인:

1. **Settings → Security**
   - ✅ CAPTCHA 설정 확인
   - ✅ Allowed origins에 `http://localhost:3000` 및 프로덕션 URL 추가

2. **Settings → Paths**
   - ✅ Sign-in path: `/login`
   - ✅ Sign-up path: `/sign-up`
   - ✅ After sign-in URL: `/`
   - ✅ After sign-up URL: `/`

3. **Settings → Domains**
   - ✅ 개발 환경: `localhost:3000`
   - ✅ 프로덕션 환경: 실제 도메인

---

## 🧪 테스트 및 확인 방법

### 1. 브라우저 콘솔 확인

개발자 도구(F12) → Console 탭에서 확인:

```javascript
// 다음 에러가 있는지 확인:
- CSP violation errors
- CAPTCHA loading errors
- Network errors
```

### 2. Network 탭 확인

개발자 도구 → Network 탭에서 확인:

- ✅ `clerk.browser.js` 로드 성공 여부
- ✅ CAPTCHA 관련 요청 성공 여부
- ✅ 실패한 요청의 상태 코드 확인

### 3. CSP 위반 확인

브라우저 콘솔에서 CSP 위반 메시지 확인:

```
Refused to load ... because it violates the following Content Security Policy directive
```

### 4. 다른 브라우저에서 테스트

- Chrome
- Firefox
- Safari
- Edge

### 5. 시크릿 모드에서 테스트

브라우저 확장 프로그램이 CAPTCHA를 차단할 수 있으므로 시크릿 모드에서 테스트

---

## 📝 단계별 해결 체크리스트

### 즉시 적용 가능한 해결책

- [ ] **1단계**: `next.config.ts`의 CSP 설정 수정 (해결 방법 1)
- [ ] **2단계**: 개발 서버 재시작 (`pnpm run dev`)
- [ ] **3단계**: 브라우저 캐시 삭제 및 하드 리프레시
- [ ] **4단계**: 회원가입/로그인 다시 시도

### 추가 확인 사항

- [ ] **5단계**: Clerk 대시보드 설정 확인
- [ ] **6단계**: 브라우저 콘솔에서 에러 확인
- [ ] **7단계**: Network 탭에서 실패한 요청 확인
- [ ] **8단계**: 다른 브라우저에서 테스트

### 문제가 계속되면

- [ ] **9단계**: `layout.tsx`에 ClerkProvider 추가 설정 적용 (해결 방법 2)
- [ ] **10단계**: Clerk 지원팀에 문의 (에러 메시지와 함께)

---

## 🔗 참고 자료

- [Clerk 공식 문서](https://clerk.com/docs)
- [Clerk Next.js 통합 가이드](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk CSP 설정 가이드](https://clerk.com/docs/guides/development/content-security-policy)
- [Clerk 보안 검증 문제 해결](https://clerk.com/docs/guides/development/errors/frontend-api)

---

## 💡 예상 원인 우선순위

1. **높음**: CSP 설정 불완전 (CAPTCHA 도메인 누락)
2. **중간**: Clerk 대시보드 설정 문제
3. **낮음**: 브라우저 확장 프로그램 간섭
4. **낮음**: 네트워크 문제

---

**마지막 업데이트**: 2025-01-XX
**분석 기준**: Clerk 공식 문서 v6.36.2


