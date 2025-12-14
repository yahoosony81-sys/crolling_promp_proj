# 보안 가이드

이 문서는 TrendScrape Prompt 서비스의 보안 정책 및 구현 가이드를 설명합니다.

## 목차

1. [Row Level Security (RLS) 정책](#row-level-security-rls-정책)
2. [인증 및 권한 관리](#인증-및-권한-관리)
3. [입력 데이터 검증](#입력-데이터-검증)
4. [XSS/CSRF 방지](#xsscsrf-방지)
5. [보안 모범 사례](#보안-모범-사례)

---

## Row Level Security (RLS) 정책

### 개요

Supabase의 Row Level Security (RLS)를 사용하여 데이터베이스 레벨에서 데이터 접근을 제어합니다. 이는 애플리케이션 레벨의 보안을 보완하는 중요한 보안 계층입니다.

### Clerk와 Supabase 통합

본 서비스는 Clerk를 인증 제공자로 사용하며, Supabase RLS 정책에서 Clerk의 JWT 토큰을 사용하여 사용자 인증을 확인합니다.

#### Clerk 사용자 ID 추출 함수

```sql
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (auth.jwt()->>'sub')::text;
$$;
```

이 함수는 Clerk JWT 토큰의 `sub` 클레임에서 사용자 ID를 추출합니다.

### 테이블별 RLS 정책

#### 1. `prompt_templates` 테이블

**정책 목적**: 프롬프트 템플릿의 접근 권한을 제어합니다.

**정책 설명**:
- **무료 프롬프트 공개 조회**: `is_free = true`인 프롬프트는 인증 없이 조회 가능
- **인증된 사용자 전체 조회**: 인증된 사용자는 모든 프롬프트 조회 가능 (유료 포함)

**현재 정책**:
```sql
-- 무료 프롬프트는 누구나 조회 가능
CREATE POLICY "Anyone can view free prompts"
  ON public.prompt_templates FOR SELECT
  TO anon, authenticated
  USING (is_free = true);

-- 인증된 사용자는 모든 프롬프트 조회 가능
CREATE POLICY "Authenticated users can view all prompts"
  ON public.prompt_templates FOR SELECT
  TO authenticated
  USING (true);
```

**보안 고려사항**:
- 유료 프롬프트는 인증만으로 접근 가능 (구독 체크는 애플리케이션 레벨에서 수행)
- 향후 개선: 구독 상태를 RLS 정책에 통합하여 구독자만 유료 프롬프트 접근 가능하도록 강화

#### 2. `trend_packs` 테이블

**정책 목적**: 트렌드 패키지의 접근 권한을 제어합니다.

**정책 설명**:
- **Published 상태만 공개**: `status = 'published'`인 패키지만 조회 가능
- **Draft/Archived 상태**: 비공개 상태의 패키지는 조회 불가

**현재 정책**:
```sql
CREATE POLICY "Anyone can view published trend packs"
  ON public.trend_packs FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
```

**보안 고려사항**:
- 현재는 published 상태만 확인하며, 구독 체크는 애플리케이션 레벨에서 수행
- 향후 개선: 구독자만 접근 가능하도록 정책 강화 필요

#### 3. `scraped_items` 테이블

**정책 목적**: 스크랩된 아이템의 접근 권한을 제어합니다.

**정책 설명**:
- **Published 패키지의 아이템만 조회**: 속한 패키지가 `published` 상태인 경우만 조회 가능
- **중첩된 정책**: `trend_packs` 테이블의 상태를 확인하여 접근 제어

**현재 정책**:
```sql
CREATE POLICY "Anyone can view scraped items from published packs"
  ON public.scraped_items FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trend_packs
      WHERE trend_packs.id = scraped_items.pack_id
      AND trend_packs.status = 'published'
    )
  );
```

**보안 고려사항**:
- 패키지 상태 변경 시 자동으로 아이템 접근 권한이 변경됨
- 향후 개선: 구독자만 접근 가능하도록 정책 강화 필요

#### 4. `pack_prompts` 테이블

**정책 목적**: 패키지-프롬프트 연결 정보의 접근 권한을 제어합니다.

**정책 설명**:
- **Published 패키지의 연결만 조회**: 속한 패키지가 `published` 상태인 경우만 조회 가능

**현재 정책**:
```sql
CREATE POLICY "Anyone can view pack prompts from published packs"
  ON public.pack_prompts FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trend_packs
      WHERE trend_packs.id = pack_prompts.pack_id
      AND trend_packs.status = 'published'
    )
  );
```

**보안 고려사항**:
- 패키지 상태에 따라 자동으로 접근 권한이 변경됨
- 향후 개선: 구독자만 접근 가능하도록 정책 강화 필요

#### 5. `subscriptions` 테이블

**정책 목적**: 구독 정보의 접근 권한을 제어합니다.

**정책 설명**:
- **자신의 구독만 조회**: 사용자는 자신의 구독 정보만 조회 가능
- **자신의 구독만 생성/수정**: 사용자는 자신의 구독만 생성 및 수정 가능

**현재 정책**:
```sql
-- 조회 정책
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    (
      auth.clerk_user_id() IS NOT NULL AND user_id::text = auth.clerk_user_id()
    ) OR (
      auth.clerk_user_id() IS NULL AND user_id = auth.uid()
    )
  );

-- 생성 정책
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      auth.clerk_user_id() IS NOT NULL AND user_id::text = auth.clerk_user_id()
    ) OR (
      auth.clerk_user_id() IS NULL AND user_id = auth.uid()
    )
  );

-- 수정 정책
CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (
    (
      auth.clerk_user_id() IS NOT NULL AND user_id::text = auth.clerk_user_id()
    ) OR (
      auth.clerk_user_id() IS NULL AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    (
      auth.clerk_user_id() IS NOT NULL AND user_id::text = auth.clerk_user_id()
    ) OR (
      auth.clerk_user_id() IS NULL AND user_id = auth.uid()
    )
  );
```

**보안 고려사항**:
- Clerk와 일반 Supabase Auth 모두 지원
- 사용자는 다른 사용자의 구독 정보에 접근할 수 없음
- 삭제 정책은 없음 (소프트 삭제 또는 관리자만 삭제 가능)

#### 6. `prompt_usages` 테이블

**정책 목적**: 프롬프트 사용 기록의 접근 권한을 제어합니다.

**정책 설명**:
- **자신의 사용 기록만 조회**: 사용자는 자신의 사용 기록만 조회 가능
- **자신의 사용 기록만 생성**: 사용자는 자신의 사용 기록만 생성 가능

**현재 정책**:
```sql
-- 조회 정책
CREATE POLICY "Users can view own prompt usages"
  ON public.prompt_usages FOR SELECT
  TO authenticated
  USING (
    (
      auth.clerk_user_id() IS NOT NULL AND user_id::text = auth.clerk_user_id()
    ) OR (
      auth.clerk_user_id() IS NULL AND user_id = auth.uid()
    )
  );

-- 생성 정책
CREATE POLICY "Users can insert own prompt usages"
  ON public.prompt_usages FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      auth.clerk_user_id() IS NOT NULL AND user_id::text = auth.clerk_user_id()
    ) OR (
      auth.clerk_user_id() IS NULL AND user_id = auth.uid()
    )
  );
```

**보안 고려사항**:
- 사용 기록은 생성 후 수정/삭제 불가 (읽기 전용)
- 사용자는 자신의 사용 통계만 확인 가능

### RLS 정책 테스트

RLS 정책의 정확성을 확인하기 위해 테스트 스크립트를 실행할 수 있습니다:

```bash
pnpm run test:rls
```

테스트 시나리오:
1. 비인증 사용자 접근 테스트
2. 인증된 사용자 접근 테스트
3. 구독자/비구독자 접근 테스트
4. 다른 사용자 데이터 접근 방지 테스트

---

## 인증 및 권한 관리

### Clerk 인증 통합

본 서비스는 Clerk를 인증 제공자로 사용합니다. Clerk는 JWT 토큰을 발급하며, 이 토큰은 Supabase RLS 정책에서 사용됩니다.

#### 인증 플로우

1. 사용자가 Clerk를 통해 로그인
2. Clerk가 JWT 토큰 발급
3. 애플리케이션이 JWT 토큰을 Supabase 요청에 포함
4. Supabase가 JWT 토큰을 검증하고 RLS 정책 적용

#### API 라우트 인증 미들웨어

API 라우트에서 인증을 확인하기 위해 미들웨어를 사용합니다:

```typescript
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(request: Request) {
  const { userId } = await requireAuth();
  // 인증된 사용자만 접근 가능
}
```

#### 구독 체크

유료 콘텐츠 접근 시 구독 상태를 확인합니다:

```typescript
import { requireSubscription } from '@/lib/middleware/auth';

export async function GET(request: Request) {
  const { userId } = await requireSubscription();
  // 구독자만 접근 가능
}
```

---

## 입력 데이터 검증

### 검증 원칙

1. **모든 사용자 입력 검증**: 클라이언트와 서버 양쪽에서 검증
2. **타입 안정성**: TypeScript와 Zod 스키마를 사용한 타입 검증
3. **길이 제한**: 문자열 길이 제한으로 DoS 공격 방지
4. **형식 검증**: UUID, 이메일, URL 등 형식 검증

### 검증 유틸리티

```typescript
import { validateUUID, validateCategory, sanitizeInput } from '@/lib/utils/validation';

// UUID 검증
const isValid = validateUUID(id);

// 카테고리 검증
const isValidCategory = validateCategory(category);

// 입력 sanitization
const sanitized = sanitizeInput(userInput);
```

### 스키마 검증

Zod를 사용하여 API 요청/응답 스키마를 정의합니다:

```typescript
import { z } from 'zod';
import { promptSchema } from '@/lib/schemas/prompts';

const result = promptSchema.safeParse(requestBody);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
```

---

## XSS/CSRF 방지

### XSS (Cross-Site Scripting) 방지

1. **React의 기본 XSS 방지**: React는 기본적으로 XSS를 방지합니다
2. **HTML 이스케이프**: 사용자 입력을 HTML로 렌더링할 때 이스케이프
3. **Sanitization**: 사용자 입력을 sanitize하여 악성 스크립트 제거

```typescript
import { escapeHtml, sanitizeHtml } from '@/lib/utils/sanitize';

// HTML 이스케이프
const safe = escapeHtml(userInput);

// HTML sanitization
const sanitized = sanitizeHtml(userInput);
```

### CSRF (Cross-Site Request Forgery) 방지

1. **SameSite 쿠키**: 쿠키에 SameSite 속성 설정
2. **CORS 정책**: 적절한 CORS 정책 설정
3. **CSRF 토큰**: 필요 시 CSRF 토큰 사용

### 보안 헤더

Next.js 설정에서 보안 헤더를 설정합니다:

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

---

## 보안 모범 사례

### 1. 최소 권한 원칙

- 사용자에게 필요한 최소한의 권한만 부여
- 관리자 권한은 최소한의 사용자에게만 부여

### 2. 민감 정보 보호

- 비밀번호, API 키 등 민감 정보는 환경 변수로 관리
- 로그에 민감 정보 출력 금지
- 데이터베이스에 평문 저장 금지

### 3. 정기적인 보안 검토

- RLS 정책 정기 검토
- 의존성 취약점 스캔
- 보안 업데이트 적용

### 4. 에러 처리

- 상세한 에러 메시지를 사용자에게 노출하지 않음
- 에러 로그는 서버에서만 기록
- 일반적인 에러 메시지 반환

### 5. Rate Limiting

- API 요청 빈도 제한
- 무차별 대입 공격 방지
- DDoS 공격 완화

### 6. 웹훅 보안

- 웹훅 서명 검증 필수
- 타임스탬프 검증 (replay 공격 방지)
- HTTPS 사용 필수

---

## 보안 체크리스트

### 개발 단계

- [ ] 모든 API 라우트에 인증 미들웨어 적용
- [ ] 모든 사용자 입력 검증
- [ ] RLS 정책 테스트 완료
- [ ] XSS/CSRF 방지 구현
- [ ] 보안 헤더 설정

### 배포 전

- [ ] 환경 변수 설정 확인
- [ ] 프로덕션 데이터베이스 RLS 정책 확인
- [ ] 웹훅 서명 검증 테스트
- [ ] 보안 헤더 확인
- [ ] CORS 정책 확인

### 운영 중

- [ ] 정기적인 보안 업데이트
- [ ] 로그 모니터링
- [ ] 이상 징후 감지 및 대응
- [ ] 보안 취약점 스캔

---

## 참고 자료

- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk 보안 가이드](https://clerk.com/docs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js 보안 가이드](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

