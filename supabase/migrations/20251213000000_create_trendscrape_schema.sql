-- =========================================================
-- TrendScrape Prompt MVP Schema (Supabase / Postgres)
-- =========================================================
-- 마이그레이션: 20251213000000_create_trendscrape_schema.sql
-- 설명: TrendScrape Prompt MVP의 핵심 데이터베이스 스키마 생성
-- Clerk 호환성: public.users 참조 사용

-- (선택) UUID 생성 확장
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------
-- 1) Prompt Templates
--    - 무료/유료 프롬프트 10선 + 목적별 프롬프트 템플릿 저장
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_free boolean NOT NULL DEFAULT false,

  -- 예: "블로그 글 초안 생성", "숏츠 스크립트 30초", "상품 분석 요약"
  title text NOT NULL,
  description text NULL,

  -- 예: "blog", "shorts", "reels", "product", "real_estate", "stock", "trend"
  category text NOT NULL,

  -- 실제 프롬프트 본문
  content text NOT NULL,

  -- 템플릿에 들어갈 변수 가이드(예: {topic}, {target}, {tone})
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- 예시 입력값(자동 채움용)
  example_inputs jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_free ON public.prompt_templates(is_free);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON public.prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_created_at ON public.prompt_templates(created_at DESC);

-- ---------------------------------------------------------
-- 2) Trend Packs (주간 트렌드 패키지)
--    - /trends, /packs/[id]의 핵심 엔티티
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trend_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 예: "2025-W50" 같은 주차 키 (프론트에서 생성해도 되고, 서버에서 생성해도 됨)
  week_key text NOT NULL,

  -- 예: "product", "real_estate", "stock", "blog", "shorts", "reels"
  category text NOT NULL,

  -- 이번 주 트렌드 주제/키워드
  title text NOT NULL,

  -- 요약(카드/상세에서 노출)
  summary text NOT NULL,

  -- 트렌드 키워드 목록 (예: ["겨울 러닝", "저분자 콜라겐", ...])
  trend_keywords text[] NOT NULL DEFAULT '{}',

  -- 상태: draft / published / archived
  status text NOT NULL DEFAULT 'draft',

  -- 배치 수집/생성 시각
  generated_at timestamptz NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- 주차+카테고리 중복 방지(주 1~2회 배치 운영 시 유용)
  CONSTRAINT uq_trend_packs_week_category UNIQUE (week_key, category)
);

CREATE INDEX IF NOT EXISTS idx_trend_packs_week_key ON public.trend_packs(week_key);
CREATE INDEX IF NOT EXISTS idx_trend_packs_category ON public.trend_packs(category);
CREATE INDEX IF NOT EXISTS idx_trend_packs_status ON public.trend_packs(status);
CREATE INDEX IF NOT EXISTS idx_trend_packs_created_at ON public.trend_packs(created_at DESC);

-- ---------------------------------------------------------
-- 3) Scraped Items (수집 결과)
--    - 원문 전체 저장 X, 요약/메타/링크 중심
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scraped_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  pack_id uuid NOT NULL REFERENCES public.trend_packs(id) ON DELETE CASCADE,

  -- 출처 사이트/도메인 (예: "naver.com", "news.site", "coupang.com")
  source_domain text NOT NULL,

  -- 출처 유형 (예: "news", "blog", "market", "community", "listing")
  source_type text NOT NULL,

  -- 원문 링크
  url text NOT NULL,

  -- 수집된 페이지 제목
  title text NOT NULL,

  -- 핵심 요약(원문 복제 X)
  summary text NOT NULL,

  -- 태그/키워드
  tags text[] NOT NULL DEFAULT '{}',

  -- (선택) 가격/수치 등 구조화 가능한 값들
  extracted_data jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- 수집/가공 시각
  scraped_at timestamptz NOT NULL DEFAULT now(),

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scraped_items_pack_id ON public.scraped_items(pack_id);
CREATE INDEX IF NOT EXISTS idx_scraped_items_source_domain ON public.scraped_items(source_domain);
CREATE INDEX IF NOT EXISTS idx_scraped_items_source_type ON public.scraped_items(source_type);
CREATE INDEX IF NOT EXISTS idx_scraped_items_scraped_at ON public.scraped_items(scraped_at DESC);

-- URL 중복(같은 pack 내에서 동일 URL 중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS uq_scraped_items_pack_url
ON public.scraped_items(pack_id, url);

-- ---------------------------------------------------------
-- 4) Pack ↔ Prompt 연결 (패키지에 어떤 프롬프트들이 포함되는지)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pack_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  pack_id uuid NOT NULL REFERENCES public.trend_packs(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES public.prompt_templates(id) ON DELETE CASCADE,

  -- 패키지 내 정렬 순서
  sort_order int NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_pack_prompts UNIQUE (pack_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_pack_prompts_pack_id ON public.pack_prompts(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_prompts_prompt_id ON public.pack_prompts(prompt_id);
CREATE INDEX IF NOT EXISTS idx_pack_prompts_sort_order ON public.pack_prompts(pack_id, sort_order);

-- ---------------------------------------------------------
-- 5) Subscriptions (유료 구독)
--    - MVP에서는 단순 상태 관리 중심
--    - Clerk 호환: public.users 참조 사용
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clerk 호환: public.users 참조 (auth.users 대신)
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- "active", "past_due", "canceled"
  status text NOT NULL DEFAULT 'active',

  -- 월 9,900원 플랜 고정 (확장 대비)
  plan_name text NOT NULL DEFAULT 'monthly_9900',

  price_krw int NOT NULL DEFAULT 9900,

  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),

  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_subscriptions_user UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- ---------------------------------------------------------
-- 6) User Prompt Usage (사용 기록: 전환/유지 지표용)
--    - Clerk 호환: public.users 참조 사용
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prompt_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clerk 호환: public.users 참조 (auth.users 대신)
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_id uuid NOT NULL REFERENCES public.prompt_templates(id) ON DELETE SET NULL,
  pack_id uuid NULL REFERENCES public.trend_packs(id) ON DELETE SET NULL,

  -- "copy", "view", "run"
  action text NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prompt_usages_user_id ON public.prompt_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_usages_created_at ON public.prompt_usages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_usages_action ON public.prompt_usages(action);

-- ---------------------------------------------------------
-- 7) updated_at 자동 갱신 트리거
--    - 기존 handle_updated_at() 함수 재사용
-- ---------------------------------------------------------
-- 기존 handle_updated_at() 함수가 이미 존재하므로 재사용
DROP TRIGGER IF EXISTS trg_prompt_templates_updated_at ON public.prompt_templates;
CREATE TRIGGER trg_prompt_templates_updated_at
BEFORE UPDATE ON public.prompt_templates
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_trend_packs_updated_at ON public.trend_packs;
CREATE TRIGGER trg_trend_packs_updated_at
BEFORE UPDATE ON public.trend_packs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------
-- 8) Row Level Security (RLS) 활성화 및 기본 정책
-- ---------------------------------------------------------

-- Prompt Templates: 무료 프롬프트는 공개, 유료는 인증 필요
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view free prompts"
  ON public.prompt_templates FOR SELECT
  TO anon, authenticated
  USING (is_free = true);

CREATE POLICY "Authenticated users can view all prompts"
  ON public.prompt_templates FOR SELECT
  TO authenticated
  USING (true);

-- Trend Packs: published 상태만 공개 조회 가능
ALTER TABLE public.trend_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published trend packs"
  ON public.trend_packs FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Scraped Items: published trend pack에 속한 항목만 조회 가능
ALTER TABLE public.scraped_items ENABLE ROW LEVEL SECURITY;

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

-- Pack Prompts: published trend pack에 속한 항목만 조회 가능
ALTER TABLE public.pack_prompts ENABLE ROW LEVEL SECURITY;

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

-- Subscriptions: 사용자는 자신의 구독 정보만 조회 가능
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    -- Clerk 사용 시: auth.clerk_user_id()를 사용 (text 반환)
    -- 일반 Supabase Auth 사용 시: auth.uid()를 사용 (uuid 반환)
    -- 두 경우 모두 지원: Clerk ID가 있으면 그것을 uuid로 변환하여 비교, 없으면 auth.uid() 사용
    (
      auth.clerk_user_id() IS NOT NULL AND user_id::text = auth.clerk_user_id()
    ) OR (
      auth.clerk_user_id() IS NULL AND user_id = auth.uid()
    )
  );

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

-- Prompt Usages: 사용자는 자신의 사용 기록만 조회/생성 가능
ALTER TABLE public.prompt_usages ENABLE ROW LEVEL SECURITY;

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

