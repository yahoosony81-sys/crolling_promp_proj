-- Clerk와 Supabase 통합을 위한 RLS 정책 설정
-- 이 마이그레이션은 Clerk를 third-party auth provider로 사용할 때 필요한 RLS 정책을 설정합니다.

-- Clerk JWT에서 사용자 ID를 추출하는 헬퍼 함수
-- Clerk의 JWT 토큰에서 'sub' 클레임을 사용하여 사용자 ID를 가져옵니다.
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (auth.jwt()->>'sub')::text;
$$;

-- users 테이블에 대한 Clerk용 RLS 정책 업데이트
-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;

-- Clerk를 사용한 새로운 RLS 정책 생성
-- Clerk의 JWT 토큰에서 추출한 사용자 ID를 사용하여 데이터 접근을 제한합니다.
CREATE POLICY "Clerk users can view own record"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.clerk_user_id() = id::text);

CREATE POLICY "Clerk users can update own record"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.clerk_user_id() = id::text)
  WITH CHECK (auth.clerk_user_id() = id::text);

-- 예시: tasks 테이블이 있다면 이를 위한 RLS 정책도 생성
-- 실제로 tasks 테이블을 사용하는 경우에만 주석을 해제하세요
/*
CREATE TABLE IF NOT EXISTS public.tasks (
  id serial PRIMARY KEY,
  name text NOT NULL,
  user_id text NOT NULL DEFAULT auth.clerk_user_id(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clerk users can view their own tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (auth.clerk_user_id() = user_id);

CREATE POLICY "Clerk users can insert their own tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.clerk_user_id() = user_id);

CREATE POLICY "Clerk users can update their own tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (auth.clerk_user_id() = user_id)
  WITH CHECK (auth.clerk_user_id() = user_id);

CREATE POLICY "Clerk users can delete their own tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (auth.clerk_user_id() = user_id);
*/

COMMENT ON FUNCTION auth.clerk_user_id() IS 'Clerk JWT 토큰에서 사용자 ID를 추출하는 헬퍼 함수';

