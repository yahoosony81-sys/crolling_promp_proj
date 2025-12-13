-- =========================================================
-- TrendScrape Prompt MVP Schema (Supabase / Postgres)
-- =========================================================

-- (선택) UUID 생성 확장
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1) Prompt Templates
--    - 무료/유료 프롬프트 10선 + 목적별 프롬프트 템플릿 저장
-- ---------------------------------------------------------
create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  is_free boolean not null default false,

  -- 예: "블로그 글 초안 생성", "숏츠 스크립트 30초", "상품 분석 요약"
  title text not null,
  description text null,

  -- 예: "blog", "shorts", "reels", "product", "real_estate", "stock", "trend"
  category text not null,

  -- 실제 프롬프트 본문
  content text not null,

  -- 템플릿에 들어갈 변수 가이드(예: {topic}, {target}, {tone})
  variables jsonb not null default '[]'::jsonb,

  -- 예시 입력값(자동 채움용)
  example_inputs jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prompt_templates_is_free on public.prompt_templates(is_free);
create index if not exists idx_prompt_templates_category on public.prompt_templates(category);
create index if not exists idx_prompt_templates_created_at on public.prompt_templates(created_at desc);

-- ---------------------------------------------------------
-- 2) Trend Packs (주간 트렌드 패키지)
--    - /trends, /packs/[id]의 핵심 엔티티
-- ---------------------------------------------------------
create table if not exists public.trend_packs (
  id uuid primary key default gen_random_uuid(),

  -- 예: "2025-W50" 같은 주차 키 (프론트에서 생성해도 되고, 서버에서 생성해도 됨)
  week_key text not null,

  -- 예: "product", "real_estate", "stock", "blog", "shorts", "reels"
  category text not null,

  -- 이번 주 트렌드 주제/키워드
  title text not null,

  -- 요약(카드/상세에서 노출)
  summary text not null,

  -- 트렌드 키워드 목록 (예: ["겨울 러닝", "저분자 콜라겐", ...])
  trend_keywords text[] not null default '{}',

  -- 상태: draft / published / archived
  status text not null default 'draft',

  -- 배치 수집/생성 시각
  generated_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- 주차+카테고리 중복 방지(주 1~2회 배치 운영 시 유용)
  constraint uq_trend_packs_week_category unique (week_key, category)
);

create index if not exists idx_trend_packs_week_key on public.trend_packs(week_key);
create index if not exists idx_trend_packs_category on public.trend_packs(category);
create index if not exists idx_trend_packs_status on public.trend_packs(status);
create index if not exists idx_trend_packs_created_at on public.trend_packs(created_at desc);

-- ---------------------------------------------------------
-- 3) Scraped Items (수집 결과)
--    - 원문 전체 저장 X, 요약/메타/링크 중심
-- ---------------------------------------------------------
create table if not exists public.scraped_items (
  id uuid primary key default gen_random_uuid(),

  pack_id uuid not null references public.trend_packs(id) on delete cascade,

  -- 출처 사이트/도메인 (예: "naver.com", "news.site", "coupang.com")
  source_domain text not null,

  -- 출처 유형 (예: "news", "blog", "market", "community", "listing")
  source_type text not null,

  -- 원문 링크
  url text not null,

  -- 수집된 페이지 제목
  title text not null,

  -- 핵심 요약(원문 복제 X)
  summary text not null,

  -- 태그/키워드
  tags text[] not null default '{}',

  -- (선택) 가격/수치 등 구조화 가능한 값들
  extracted_data jsonb not null default '{}'::jsonb,

  -- 수집/가공 시각
  scraped_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

create index if not exists idx_scraped_items_pack_id on public.scraped_items(pack_id);
create index if not exists idx_scraped_items_source_domain on public.scraped_items(source_domain);
create index if not exists idx_scraped_items_source_type on public.scraped_items(source_type);
create index if not exists idx_scraped_items_scraped_at on public.scraped_items(scraped_at desc);

-- URL 중복(같은 pack 내에서 동일 URL 중복 방지)
create unique index if not exists uq_scraped_items_pack_url
on public.scraped_items(pack_id, url);

-- ---------------------------------------------------------
-- 4) Pack ↔ Prompt 연결 (패키지에 어떤 프롬프트들이 포함되는지)
-- ---------------------------------------------------------
create table if not exists public.pack_prompts (
  id uuid primary key default gen_random_uuid(),

  pack_id uuid not null references public.trend_packs(id) on delete cascade,
  prompt_id uuid not null references public.prompt_templates(id) on delete cascade,

  -- 패키지 내 정렬 순서
  sort_order int not null default 0,

  created_at timestamptz not null default now(),

  constraint uq_pack_prompts unique (pack_id, prompt_id)
);

create index if not exists idx_pack_prompts_pack_id on public.pack_prompts(pack_id);
create index if not exists idx_pack_prompts_prompt_id on public.pack_prompts(prompt_id);
create index if not exists idx_pack_prompts_sort_order on public.pack_prompts(pack_id, sort_order);

-- ---------------------------------------------------------
-- 5) Subscriptions (유료 구독)
--    - MVP에서는 단순 상태 관리 중심
-- ---------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  -- "active", "past_due", "canceled"
  status text not null default 'active',

  -- 월 9,900원 플랜 고정 (확장 대비)
  plan_name text not null default 'monthly_9900',

  price_krw int not null default 9900,

  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '1 month'),

  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_subscriptions_user unique(user_id)
);

create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_period_end on public.subscriptions(current_period_end);

-- ---------------------------------------------------------
-- 6) (선택) User Prompt Usage (사용 기록: 전환/유지 지표용)
-- ---------------------------------------------------------
create table if not exists public.prompt_usages (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id uuid not null references public.prompt_templates(id) on delete set null,
  pack_id uuid null references public.trend_packs(id) on delete set null,

  -- "copy", "view", "run"
  action text not null,

  created_at timestamptz not null default now()
);

create index if not exists idx_prompt_usages_user_id on public.prompt_usages(user_id);
create index if not exists idx_prompt_usages_created_at on public.prompt_usages(created_at desc);
create index if not exists idx_prompt_usages_action on public.prompt_usages(action);

-- ---------------------------------------------------------
-- 7) updated_at 자동 갱신 트리거 (선택)
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_prompt_templates_updated_at on public.prompt_templates;
create trigger trg_prompt_templates_updated_at
before update on public.prompt_templates
for each row execute function public.set_updated_at();

drop trigger if exists trg_trend_packs_updated_at on public.trend_packs;
create trigger trg_trend_packs_updated_at
before update on public.trend_packs
for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();
