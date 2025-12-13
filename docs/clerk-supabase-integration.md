# Clerk와 Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 통합하는 방법을 설명합니다. [Clerk 공식 문서](https://clerk.com/docs/guides/development/integrations/databases/supabase)와 [Supabase 공식 문서](https://supabase.com/docs/guides/auth/third-party/clerk)를 기반으로 작성되었습니다.

## 개요

Clerk와 Supabase를 통합하면:
- Clerk의 강력한 인증 기능과 사용자 관리 기능 활용
- Supabase의 데이터베이스, Storage, Realtime 기능 활용
- Row Level Security (RLS)를 통한 데이터 보안 강화

## 사전 요구사항

1. Clerk 계정 및 애플리케이션 설정 완료
2. Supabase 프로젝트 생성 완료
3. Next.js 프로젝트에 Clerk와 Supabase SDK 설치 완료

## 설정 단계

### 1. Clerk 대시보드에서 Supabase 통합 활성화

1. [Clerk 대시보드](https://dashboard.clerk.com)에 로그인
2. **Integrations** > **Supabase**로 이동
3. **Connect with Supabase** 클릭
4. Supabase 프로젝트 정보 입력 후 **Activate Supabase integration** 클릭
5. 생성된 **Clerk domain** 복사 (예: `your-app.clerk.accounts.dev`)

### 2. Supabase 대시보드에서 Clerk를 Third-Party Auth Provider로 추가

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 후 **Authentication** > **Third-Party Auth**로 이동
3. **Add provider** 클릭
4. **Clerk** 선택
5. Clerk 대시보드에서 복사한 **Clerk domain** 입력
6. 저장

> **참고**: 2025년 4월 1일부터 Clerk JWT 템플릿 방식은 deprecated되었습니다. 이제 Native Third-Party Auth 통합을 사용해야 합니다.

### 3. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수가 설정되어 있는지 확인하세요:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. 데이터베이스 마이그레이션 실행

Clerk용 RLS 정책을 설정하기 위해 마이그레이션을 실행하세요:

```bash
# Supabase CLI를 사용하는 경우
supabase db push

# 또는 Supabase 대시보드의 SQL Editor에서 직접 실행
# supabase/migrations/20251212000000_clerk_rls_policies.sql 파일의 내용을 실행
```

## 코드 구조

### 클라이언트 사이드 Supabase 클라이언트

`src/lib/supabase/client.ts` 파일은 Clerk 세션 토큰을 자동으로 포함하는 Supabase 클라이언트를 생성합니다.

**사용 예시:**
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  
  // Clerk 토큰이 자동으로 포함된 요청
  const { data } = await supabase.from('tasks').select()
  
  return <div>...</div>
}
```

### 서버 사이드 Supabase 클라이언트

`src/lib/supabase/server.ts` 파일은 서버 컴포넌트나 Server Actions에서 사용할 수 있는 Supabase 클라이언트를 생성합니다.

**사용 예시:**
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  // Clerk 토큰이 자동으로 포함된 요청
  const { data } = await supabase.from('tasks').select()
  
  return <div>...</div>
}
```

### Middleware

`src/middleware.ts` 파일은 Clerk를 사용하여 라우트 보호를 처리합니다.

- 보호된 라우트: `/dashboard`, `/profile`, `/settings`
- 인증된 사용자가 접근하면 안 되는 라우트: `/login`

## Row Level Security (RLS) 정책

Clerk와 Supabase 통합 시 RLS 정책은 Clerk의 JWT 토큰에서 `sub` 클레임을 사용하여 사용자 ID를 추출합니다.

### 헬퍼 함수

마이그레이션 파일에 포함된 `auth.clerk_user_id()` 함수는 Clerk JWT에서 사용자 ID를 추출합니다:

```sql
SELECT auth.clerk_user_id(); -- Clerk 사용자 ID 반환
```

### RLS 정책 예시

```sql
-- 사용자가 자신의 데이터만 조회 가능
CREATE POLICY "Clerk users can view own record"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.clerk_user_id() = id::text);

-- 사용자가 자신의 데이터만 업데이트 가능
CREATE POLICY "Clerk users can update own record"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.clerk_user_id() = id::text)
  WITH CHECK (auth.clerk_user_id() = id::text);
```

## 사용자 데이터 동기화

Clerk에서 생성된 사용자 정보를 Supabase 데이터베이스와 동기화하려면 Clerk의 Webhook을 사용할 수 있습니다. 자세한 내용은 [Clerk Webhook 문서](https://clerk.com/docs/guides/development/webhooks/overview)를 참조하세요.

## 문제 해결

### Clerk 토큰이 Supabase 요청에 포함되지 않는 경우

1. `createClient()` 함수가 올바르게 호출되는지 확인
2. Clerk 세션이 활성화되어 있는지 확인 (`useSession()` 또는 `auth()` 사용)
3. 브라우저 개발자 도구의 Network 탭에서 Authorization 헤더 확인

### RLS 정책이 작동하지 않는 경우

1. 테이블에 RLS가 활성화되어 있는지 확인:
   ```sql
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
   ```

2. Clerk JWT에 `role: 'authenticated'` 클레임이 포함되어 있는지 확인
3. `auth.clerk_user_id()` 함수가 올바르게 작동하는지 테스트:
   ```sql
   SELECT auth.clerk_user_id();
   ```

## 참고 자료

- [Clerk Supabase 통합 문서](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase Third-Party Auth 문서](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Clerk Next.js SDK 문서](https://clerk.com/docs/references/nextjs/overview)
- [Supabase JavaScript Client 문서](https://supabase.com/docs/reference/javascript/introduction)

