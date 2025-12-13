# Supabase 설정 가이드

이 문서는 [Supabase 공식 문서](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)를 기반으로 Next.js 프로젝트에 Supabase를 설정하는 방법을 설명합니다.

## 개요

이 프로젝트는 Supabase 공식 문서의 모범 사례를 따르며, Clerk와의 통합도 지원합니다.

## 설정 단계

### 1. Supabase 프로젝트 생성

1. [database.new](https://database.new)에 접속하여 새 Supabase 프로젝트를 생성합니다.
2. 또는 [Supabase 대시보드](https://supabase.com/dashboard)에서 새 프로젝트를 생성합니다.

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

환경 변수는 Supabase 대시보드의 **Project Settings > API**에서 확인할 수 있습니다.

### 3. 예제 테이블 생성

Supabase 대시보드의 **SQL Editor**에서 다음 쿼리를 실행하여 예제 테이블을 생성합니다:

```sql
-- Create the table
create table instruments (
  id bigint primary key generated always as identity,
  name text not null
);

-- Insert some sample data into the table
insert into instruments (name)
values
  ('violin'),
  ('viola'),
  ('cello');

-- Enable RLS
alter table instruments enable row level security;

-- Make the data publicly readable
create policy "public can read instruments"
on public.instruments
for select to anon
using (true);
```

### 4. 예제 페이지 확인

개발 서버를 실행하고 `/instruments` 페이지를 확인하세요:

```bash
pnpm run dev
```

브라우저에서 `http://localhost:3000/instruments`로 이동하면 생성한 데이터를 확인할 수 있습니다.

## 코드 구조

### 서버 사이드 클라이언트

`src/lib/supabase/server.ts`는 Server Components와 Server Actions에서 사용할 수 있는 Supabase 클라이언트를 제공합니다.

**사용 예시:**
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data } = await supabase.from('instruments').select()
  return <div>...</div>
}
```

### 클라이언트 사이드 클라이언트

`src/lib/supabase/client.ts`는 Client Components에서 사용할 수 있는 Supabase 클라이언트를 제공합니다.

**사용 예시:**
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export default function ClientComponent() {
  const supabase = createClient()
  
  const fetchData = async () => {
    const { data } = await supabase.from('instruments').select()
  }
  
  return <div>...</div>
}
```

## Clerk 통합

이 프로젝트는 Clerk와 Supabase를 통합하여 사용할 수 있습니다. Clerk 세션 토큰이 자동으로 Supabase 요청에 포함됩니다.

자세한 내용은 [Clerk-Supabase 통합 가이드](./clerk-supabase-integration.md)를 참조하세요.

## 참고 자료

- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

