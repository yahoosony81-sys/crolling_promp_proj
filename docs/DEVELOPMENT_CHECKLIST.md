# 개발 환경 정상 작동 확인 체크리스트

이 문서는 프로젝트의 모든 주요 기능이 정상적으로 작동하는지 확인하기 위한 체크리스트입니다.

## 📋 기본 설정 확인

### 환경 변수
- [ ] `.env.local` 파일이 존재하는지 확인
- [ ] Vercel 환경 변수가 모두 설정되어 있는지 확인
- [ ] 다음 환경 변수들이 설정되어 있는지 확인:
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - [ ] `CLERK_SECRET_KEY`
  - [ ] `CLERK_WEBHOOK_SECRET`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` 또는 `NEXT_PUBLIC_SITE_URL`
  - [ ] `NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY`
  - [ ] `TOSS_PAYMENTS_SECRET_KEY`
  - [ ] `TOSS_PAYMENTS_WEBHOOK_SECRET`

### 개발 서버
- [ ] `pnpm run dev` 실행 시 에러 없이 시작되는지 확인
- [ ] 브라우저 콘솔에 에러가 없는지 확인 (F12 → Console)
- [ ] Network 탭에서 실패한 요청이 없는지 확인 (F12 → Network)

---

## 🔐 Clerk 인증 기능

### 기본 설정
- [ ] `src/app/layout.tsx`에 `ClerkProvider`가 올바르게 설정되어 있는지 확인
- [ ] `publishableKey` 속성이 설정되어 있는지 확인
- [ ] 한국어 로컬라이제이션(`koKR`)이 적용되어 있는지 확인
- [ ] `next.config.ts`의 CSP에 `https://*.clerk.accounts.dev`가 `script-src`에 포함되어 있는지 확인

### 로그인/회원가입
- [ ] `/login` 페이지 접근 시 Clerk 로그인 폼이 표시되는지 확인
- [ ] `/sign-up` 페이지 접근 시 Clerk 회원가입 폼이 표시되는지 확인
- [ ] 로그인 성공 시 리다이렉트가 정상 작동하는지 확인
- [ ] 회원가입 성공 시 리다이렉트가 정상 작동하는지 확인
- [ ] 이미 로그인한 사용자가 `/login` 또는 `/sign-up` 접근 시 홈으로 리다이렉트되는지 확인

### 인증 상태 확인
- [ ] 헤더에 로그인/로그아웃 버튼이 표시되는지 확인
- [ ] 로그인 후 사용자 아바타/프로필 드롭다운이 표시되는지 확인
- [ ] 로그아웃 기능이 정상 작동하는지 확인

### 보호된 라우트
- [ ] 미로그인 상태에서 `/profile` 접근 시 `/login`으로 리다이렉트되는지 확인
- [ ] 미로그인 상태에서 `/trends` 접근 시 `/login`으로 리다이렉트되는지 확인
- [ ] 미로그인 상태에서 `/packs` 접근 시 `/login`으로 리다이렉트되는지 확인
- [ ] 미로그인 상태에서 `/account` 접근 시 `/login`으로 리다이렉트되는지 확인
- [ ] 리다이렉트 후 원래 페이지로 돌아가는지 확인 (`redirect` 쿼리 파라미터)

### 프로필 관리
- [ ] `/profile` 페이지 접근 시 Clerk UserProfile 컴포넌트가 표시되는지 확인
- [ ] 프로필 정보 수정이 가능한지 확인
- [ ] 프로필 이미지 업로드가 가능한지 확인

---

## 🗄️ Supabase 통합

### 데이터베이스 연결
- [ ] Supabase 클라이언트가 정상적으로 생성되는지 확인
- [ ] 서버 사이드 Supabase 클라이언트가 작동하는지 확인
- [ ] 클라이언트 사이드 Supabase 클라이언트가 작동하는지 확인

### Clerk-Supabase 동기화
- [ ] Clerk 웹훅이 정상적으로 작동하는지 확인 (`/api/webhooks/clerk`)
- [ ] 회원가입 시 Supabase에 사용자가 생성되는지 확인
- [ ] 프로필 업데이트 시 Supabase 사용자 정보가 업데이트되는지 확인

---

## 💳 결제 및 구독 기능

### Toss Payments 설정
- [ ] Toss Payments 클라이언트 키가 설정되어 있는지 확인
- [ ] Toss Payments 시크릿 키가 설정되어 있는지 확인
- [ ] Toss Payments 웹훅 시크릿이 설정되어 있는지 확인

### 구독 생성
- [ ] `/pricing` 페이지가 정상적으로 표시되는지 확인
- [ ] 구독 플랜 선택이 가능한지 확인
- [ ] `/checkout` 페이지 접근 시 결제 정보가 표시되는지 확인
- [ ] 구독 생성 API (`/api/subscriptions/create`)가 정상 작동하는지 확인

### 구독 관리
- [ ] 구독 상태 조회 API (`/api/subscriptions/check`)가 정상 작동하는지 확인
- [ ] 구독 취소 API (`/api/subscriptions/cancel`)가 정상 작동하는지 확인
- [ ] 결제 내역 조회 API (`/api/subscriptions/payment-history`)가 정상 작동하는지 확인

### 웹훅 처리
- [ ] Toss Payments 웹훅 엔드포인트 (`/api/webhooks/toss`)가 정상 작동하는지 확인
- [ ] 웹훅 서명 검증이 정상 작동하는지 확인
- [ ] `billing.approved` 이벤트 처리 시 구독이 활성화되는지 확인
- [ ] `billing.failed` 이벤트 처리 시 구독 상태가 `past_due`로 변경되는지 확인
- [ ] `billing.canceled` 이벤트 처리 시 구독 상태가 `canceled`로 변경되는지 확인

---

## 📊 트렌드 및 프롬프트 기능

### 트렌드 페이지
- [ ] `/trends` 페이지가 정상적으로 표시되는지 확인
- [ ] 트렌드 목록이 로드되는지 확인
- [ ] 트렌드 상세 페이지 (`/trends/[id]`)가 정상 작동하는지 확인
- [ ] 스크래핑된 아이템이 표시되는지 확인

### 프롬프트 팩
- [ ] `/packs` 페이지가 정상적으로 표시되는지 확인
- [ ] 프롬프트 팩 목록이 로드되는지 확인
- [ ] 프롬프트 팩 상세 페이지 (`/packs/[id]`)가 정상 작동하는지 확인
- [ ] 프롬프트 복사 기능이 작동하는지 확인

### 무료 프롬프트
- [ ] `/free` 페이지가 정상적으로 표시되는지 확인
- [ ] 무료 프롬프트 목록이 로드되는지 확인

---

## 🔧 API 엔드포인트

### 크롤링 API
- [ ] `/api/crawl/run` 크롤링 실행 API가 정상 작동하는지 확인
- [ ] `/api/crawl/status` 크롤링 상태 조회 API가 정상 작동하는지 확인

### 프롬프트 API
- [ ] `/api/prompts` 프롬프트 목록 API가 정상 작동하는지 확인
- [ ] `/api/prompts/[id]` 프롬프트 상세 API가 정상 작동하는지 확인
- [ ] `/api/prompts/usage` 프롬프트 사용량 API가 정상 작동하는지 확인

### 트렌드 API
- [ ] `/api/trends` 트렌드 목록 API가 정상 작동하는지 확인
- [ ] `/api/trends/[id]` 트렌드 상세 API가 정상 작동하는지 확인
- [ ] `/api/trends/[id]/scraped-items` 스크래핑된 아이템 API가 정상 작동하는지 확인

### 계정 API
- [ ] `/api/account/usage` 사용량 조회 API가 정상 작동하는지 확인

---

## 🛡️ 보안 설정

### Content Security Policy (CSP)
- [ ] `next.config.ts`의 CSP 설정이 올바른지 확인
- [ ] Clerk 도메인이 `script-src`에 포함되어 있는지 확인
- [ ] Toss Payments 도메인이 `script-src`에 포함되어 있는지 확인
- [ ] Supabase 도메인이 `connect-src`에 포함되어 있는지 확인
- [ ] Clerk 도메인이 `frame-src`에 포함되어 있는지 확인

### 보안 헤더
- [ ] `X-Content-Type-Options: nosniff` 헤더가 설정되어 있는지 확인
- [ ] `X-Frame-Options: SAMEORIGIN` 헤더가 설정되어 있는지 확인
- [ ] `Strict-Transport-Security` 헤더가 설정되어 있는지 확인

### 미들웨어
- [ ] `src/middleware.ts`가 정상 작동하는지 확인
- [ ] 보호된 라우트가 올바르게 보호되는지 확인
- [ ] CORS 설정이 올바른지 확인

---

## 🎨 UI/UX 확인

### 레이아웃
- [ ] 헤더가 모든 페이지에서 표시되는지 확인
- [ ] 푸터가 모든 페이지에서 표시되는지 확인
- [ ] 반응형 디자인이 모바일/태블릿/데스크톱에서 정상 작동하는지 확인

### 테마
- [ ] 다크 모드/라이트 모드 전환이 작동하는지 확인
- [ ] 테마 설정이 유지되는지 확인 (새로고침 후에도)

### 로딩 상태
- [ ] 로딩 스피너가 적절한 곳에 표시되는지 확인
- [ ] 에러 메시지가 사용자 친화적으로 표시되는지 확인

---

## 🧪 빌드 및 배포

### 빌드 테스트
- [ ] `pnpm run build` 실행 시 에러 없이 빌드되는지 확인
- [ ] 빌드 후 `pnpm run start`로 프로덕션 모드 실행 시 정상 작동하는지 확인
- [ ] 빌드된 파일에 문제가 없는지 확인

### 타입 체크
- [ ] TypeScript 타입 에러가 없는지 확인 (`pnpm run lint`)
- [ ] 모든 타입이 올바르게 정의되어 있는지 확인

### 환경별 설정
- [ ] 개발 환경에서 정상 작동하는지 확인
- [ ] 프로덕션 환경(Vercel)에서 정상 작동하는지 확인
- [ ] 환경 변수가 올바르게 로드되는지 확인

---

## 📝 로그 및 디버깅

### 콘솔 로그
- [ ] 개발 환경에서 디버깅 로그가 출력되는지 확인
- [ ] 프로덕션 환경에서 불필요한 로그가 출력되지 않는지 확인

### 에러 처리
- [ ] 에러 발생 시 적절한 에러 페이지가 표시되는지 확인
- [ ] API 에러가 적절히 처리되는지 확인
- [ ] 사용자에게 친화적인 에러 메시지가 표시되는지 확인

---

## ✅ 최종 확인

### 통합 테스트
- [ ] 전체 사용자 플로우 테스트:
  1. [ ] 회원가입 → 로그인 → 프로필 확인 → 구독 생성 → 프롬프트 사용
  2. [ ] 로그인 → 트렌드 확인 → 프롬프트 팩 확인 → 구독 취소
  3. [ ] 로그아웃 → 보호된 페이지 접근 → 리다이렉트 확인

### 성능 확인
- [ ] 페이지 로딩 속도가 적절한지 확인
- [ ] 이미지 최적화가 작동하는지 확인
- [ ] 번들 크기가 적절한지 확인

### 브라우저 호환성
- [ ] Chrome에서 정상 작동하는지 확인
- [ ] Firefox에서 정상 작동하는지 확인
- [ ] Safari에서 정상 작동하는지 확인
- [ ] Edge에서 정상 작동하는지 확인

---

## 🔍 문제 발생 시 확인 사항

### Clerk 관련 문제
- [ ] 브라우저 콘솔에 Clerk 에러가 없는지 확인
- [ ] Network 탭에서 `clerk.browser.js` 요청이 성공하는지 확인
- [ ] CSP 위반 에러가 없는지 확인
- [ ] 환경 변수가 올바르게 설정되어 있는지 확인

### Supabase 관련 문제
- [ ] Supabase 연결이 정상인지 확인
- [ ] RLS 정책이 올바르게 설정되어 있는지 확인
- [ ] 서비스 롤 키가 올바르게 설정되어 있는지 확인

### 결제 관련 문제
- [ ] Toss Payments 키가 올바르게 설정되어 있는지 확인
- [ ] 웹훅 엔드포인트가 접근 가능한지 확인
- [ ] 웹훅 서명 검증이 정상 작동하는지 확인

---

## 📚 참고 문서

- [Clerk 설정 가이드](./clerk-supabase-integration.md)
- [웹훅 설정 가이드](./WEBHOOK_SETUP.md)
- [Supabase 설정 가이드](./supabase-setup-guide.md)

---

**마지막 업데이트**: 2025-01-XX
**체크리스트 버전**: 1.0

