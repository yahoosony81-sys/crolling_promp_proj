-- RLS 정책 개선: 구독 체크 추가
-- 이 마이그레이션은 유료 콘텐츠 접근 시 구독 상태를 확인하는 RLS 정책을 추가합니다.

-- 구독이 활성 상태인지 확인하는 함수
-- Clerk user_id를 사용하여 활성 구독 여부를 확인합니다.
CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  clerk_id text;
  subscription_count integer;
BEGIN
  -- Clerk 사용자 ID 추출
  clerk_id := auth.clerk_user_id();
  
  -- Clerk ID가 없으면 false 반환
  IF clerk_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- 활성 구독 확인
  -- status가 'active'이고 current_period_end가 미래인 경우만 활성
  SELECT COUNT(*)
  INTO subscription_count
  FROM public.subscriptions
  WHERE user_id::text = clerk_id
    AND status = 'active'
    AND current_period_end > now();
  
  RETURN subscription_count > 0;
END;
$$;

COMMENT ON FUNCTION public.has_active_subscription() IS '현재 사용자가 활성 구독을 가지고 있는지 확인하는 함수';

-- 기존 정책 삭제 및 개선된 정책 생성

-- 1. prompt_templates 테이블 정책 개선
-- 유료 프롬프트는 구독자만 접근 가능하도록 변경
DROP POLICY IF EXISTS "Authenticated users can view all prompts" ON public.prompt_templates;

CREATE POLICY "Subscribed users can view paid prompts"
  ON public.prompt_templates FOR SELECT
  TO authenticated
  USING (
    -- 무료 프롬프트는 모든 인증된 사용자가 조회 가능
    is_free = true
    OR
    -- 유료 프롬프트는 구독자만 조회 가능
    (is_free = false AND public.has_active_subscription())
  );

-- 2. trend_packs 테이블 정책 개선
-- Published 상태이면서 구독자만 접근 가능하도록 변경
DROP POLICY IF EXISTS "Anyone can view published trend packs" ON public.trend_packs;

CREATE POLICY "Subscribed users can view published trend packs"
  ON public.trend_packs FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND public.has_active_subscription()
  );

-- 3. scraped_items 테이블 정책 개선
-- Published 패키지의 아이템이면서 구독자만 접근 가능하도록 변경
DROP POLICY IF EXISTS "Anyone can view scraped items from published packs" ON public.scraped_items;

CREATE POLICY "Subscribed users can view scraped items from published packs"
  ON public.scraped_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trend_packs
      WHERE trend_packs.id = scraped_items.pack_id
        AND trend_packs.status = 'published'
    )
    AND public.has_active_subscription()
  );

-- 4. pack_prompts 테이블 정책 개선
-- Published 패키지의 프롬프트이면서 구독자만 접근 가능하도록 변경
DROP POLICY IF EXISTS "Anyone can view pack prompts from published packs" ON public.pack_prompts;

CREATE POLICY "Subscribed users can view pack prompts from published packs"
  ON public.pack_prompts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trend_packs
      WHERE trend_packs.id = pack_prompts.pack_id
        AND trend_packs.status = 'published'
    )
    AND public.has_active_subscription()
  );

