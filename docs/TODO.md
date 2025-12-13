[ ] `.cursor/` 디렉토리
  - [ ] `rules/` 커서룰
  - [ ] `mcp.json` MCP 서버 설정
  - [ ] `dir.md` 프로젝트 디렉토리 구조
- [ ] `.github/` 디렉토리
- [ ] `.husky/` 디렉토리
- [ ] `app/` 디렉토리
  - [ ] `favicon.ico` 파일
  - [ ] `not-found.tsx` 파일
  - [ ] `robots.ts` 파일
  - [ ] `sitemap.ts` 파일
  - [ ] `manifest.ts` 파일
- [ ] `supabase/` 디렉토리
- [ ] `public/` 디렉토리
  - [ ] `icons/` 디렉토리
  - [ ] `logo.png` 파일
  - [ ] `og-image.png` 파일
- [ ] `tsconfig.json` 파일
- [ ] `.cursorignore` 파일
- [ ] `.gitignore` 파일
- [ ] `.prettierignore` 파일
- [ ] `.prettierrc` 파일
- [ ] `tsconfig.json` 파일
- [ ] `eslint.config.mjs` 파일
- [ ] `AGENTS.md` 파일

# TrendScrape Prompt MVP TODO List

## 데이터베이스 설정
- [x] `supabase/migrations/db.sql` 마이그레이션 적용
  - [x] `supabase/migrations/20251213000000_create_trendscrape_schema.sql` 마이그레이션 파일 생성
  - [x] Clerk 호환성 수정 (subscriptions, prompt_usages 테이블의 user_id를 public.users 참조로 변경)
  - [x] 함수 통합 (handle_updated_at() 함수 재사용)
  - [x] 모든 테이블 생성 (prompt_templates, trend_packs, scraped_items, pack_prompts, subscriptions, prompt_usages)
  - [x] 인덱스 및 제약조건 설정
  - [x] updated_at 자동 갱신 트리거 설정
- [x] RLS (Row Level Security) 정책 설정 (기본)
  - [x] `prompt_templates` 테이블 RLS (무료 프롬프트 공개, 유료는 인증 필요)
  - [x] `trend_packs` 테이블 RLS (published 상태만 공개)
  - [x] `scraped_items` 테이블 RLS (published pack의 항목만 조회 가능)
  - [x] `pack_prompts` 테이블 RLS (published pack의 항목만 조회 가능)
  - [x] `subscriptions` 테이블 RLS (사용자 자신의 구독 정보만 조회/수정 가능)
  - [x] `prompt_usages` 테이블 RLS (사용자 자신의 사용 기록만 조회/생성 가능)
  ---
  - [ ] RLS 정책 상세 검토 및 테스트 (별도 TODO)
- [x] 초기 데이터 시딩
  - [x] `supabase/seed.sql` 시딩 파일 생성
  - [x] 무료 프롬프트 템플릿 12개 추가
    - [x] 블로그 글 작성 프롬프트 3개 (blog)
    - [x] 유튜브 숏츠 스크립트 2개 (shorts)
    - [x] 인스타그램 릴스 스크립트 1개 (reels)
    - [x] 상품 분석 프롬프트 2개 (product)
    - [x] 트렌드 요약 프롬프트 2개 (trend)
    - [x] 주식 분석 프롬프트 1개 (stock)
    - [x] 부동산 분석 프롬프트 1개 (real_estate)
  - [x] 샘플 트렌드 패키지 데이터 추가
    - [x] 겨울 패션 트렌드 패키지 (product 카테고리, published 상태)
    - [x] AI 콘텐츠 제작 트렌드 패키지 (blog 카테고리, published 상태)
  - [x] Scraped Items 데이터 추가
    - [x] 겨울 패션 패키지에 연결된 스크랩 아이템 4개
    - [x] AI 콘텐츠 패키지에 연결된 스크랩 아이템 3개
  - [x] Pack-Prompt 연결 데이터 생성
    - [x] 각 트렌드 패키지에 적절한 프롬프트 연결

## 페이지 구현
- [ ] `/` 랜딩 페이지
  - [ ] 히어로 섹션 ("매주 업데이트되는 트렌드 프롬프트")
  - [ ] 차별화 포인트 섹션
  - [ ] 무료 체험 CTA 버튼
  - [ ] 최신 트렌드 예시 표시 (1~2개)
  - [ ] 무료 프롬프트 샘플 미리보기
- [ ] `/free` 무료 프롬프트 10선 페이지
  - [ ] 프롬프트 리스트 컴포넌트
  - [ ] 카테고리 필터 기능
  - [ ] 프롬프트 복사 버튼
  - [ ] 프롬프트 상세 모달/페이지
  - [ ] 유료 전환 CTA 배치
  - [ ] 사용 기록 추적 (prompt_usages)
- [ ] `/trends` 주간 트렌드 패키지 목록 페이지 (유료)
  - [ ] 이번 주 트렌드 요약 섹션
  - [ ] 카테고리 필터 (product, real_estate, stock, blog, shorts, reels)
  - [ ] 패키지 카드 리스트 컴포넌트
  - [ ] 구독 체크 및 접근 제어
  - [ ] 페이지네이션
- [ ] `/packs/[id]` 패키지 상세 페이지
  - [ ] 트렌드 설명 섹션
  - [ ] 수집 데이터 요약 표시 (scraped_items)
  - [ ] 목적 선택 UI (분석/콘텐츠 제작/판매/투자)
  - [ ] 프롬프트 리스트 (pack_prompts 연결)
  - [ ] 프롬프트 복사 기능
  - [ ] 구독 체크 및 접근 제어
- [ ] `/pricing` 구독 안내 페이지
  - [ ] 무료 vs 유료 기능 비교 테이블
  - [ ] 월 9,900원 플랜 강조
  - [ ] 구독 CTA 버튼
  - [ ] 결제 연동 (Stripe/Toss Payments 등)
- [ ] `/account` 내 계정 페이지
  - [ ] 구독 상태 표시
  - [ ] 결제 정보 표시
  - [ ] 이용 기록 (prompt_usages)
  - [ ] 구독 취소 기능
  - [ ] 결제 내역

## API 라우트
- [ ] `/api/prompts` 프롬프트 관련 API
  - [ ] GET: 무료 프롬프트 목록 조회
  - [ ] GET: 프롬프트 상세 조회
  - [ ] POST: 프롬프트 사용 기록 (prompt_usages)
- [ ] `/api/trends` 트렌드 패키지 관련 API
  - [ ] GET: 트렌드 패키지 목록 조회
  - [ ] GET: 트렌드 패키지 상세 조회
  - [ ] GET: 스크랩된 아이템 목록 조회
- [ ] `/api/subscriptions` 구독 관련 API
  - [ ] GET: 구독 상태 조회
  - [ ] POST: 구독 생성
  - [ ] PATCH: 구독 취소
  - [ ] GET: 결제 내역 조회
- [ ] `/api/webhooks` 웹훅 처리
  - [ ] 결제 웹훅 처리
  - [ ] 구독 갱신 웹훅 처리

## 컴포넌트
- [ ] 공통 컴포넌트
  - [ ] `PromptCard` 프롬프트 카드 컴포넌트
  - [ ] `TrendPackCard` 트렌드 패키지 카드 컴포넌트
  - [ ] `ScrapedItemCard` 스크랩 아이템 카드 컴포넌트
  - [ ] `CopyButton` 복사 버튼 컴포넌트
  - [ ] `CategoryFilter` 카테고리 필터 컴포넌트
  - [ ] `SubscriptionGate` 구독 체크 게이트 컴포넌트
  - [ ] `PricingTable` 가격 비교 테이블 컴포넌트
- [ ] 레이아웃 컴포넌트
  - [ ] `Header` 헤더 컴포넌트 (네비게이션)
  - [ ] `Footer` 푸터 컴포넌트
  - [ ] `CTA` CTA 섹션 컴포넌트

## 인증 및 구독 기능
- [ ] Clerk 인증 통합
  - [ ] 로그인/회원가입 페이지
  - [ ] 사용자 프로필 관리
- [ ] 구독 상태 관리
  - [ ] 구독 체크 유틸리티 함수
  - [ ] 구독 만료 체크 로직
  - [ ] 구독 갱신 로직
- [ ] 결제 연동
  - [ ] 결제 프로바이더 선택 및 설정 (Stripe/Toss Payments)
  - [ ] 결제 페이지 구현
  - [ ] 결제 성공/실패 처리

## 크롤링/스크래핑 기능 (백엔드)
- [ ] 크롤링 스크립트 개발
  - [ ] 주간 트렌드 키워드 수집
  - [ ] 카테고리별 데이터 수집
  - [ ] 데이터 요약 및 가공
- [ ] 배치 작업 설정
  - [ ] 주 1~2회 자동 실행 스케줄러
  - [ ] 트렌드 패키지 자동 생성
  - [ ] 스크랩 아이템 자동 저장
- [ ] 데이터 품질 관리
  - [ ] 중복 URL 체크
  - [ ] 데이터 검증 로직
  - [ ] 에러 핸들링

## 유틸리티 및 헬퍼 함수
- [ ] `lib/utils/prompt.ts` 프롬프트 관련 유틸
  - [ ] 프롬프트 변수 치환 함수
  - [ ] 프롬프트 포맷팅 함수
- [ ] `lib/utils/subscription.ts` 구독 관련 유틸
  - [ ] 구독 상태 체크 함수
  - [ ] 구독 만료일 계산 함수
- [ ] `lib/utils/trend.ts` 트렌드 관련 유틸
  - [ ] 주차 키 생성 함수 (week_key)
  - [ ] 트렌드 키워드 추출 함수

## 타입 정의
- [ ] `types/database.ts` 데이터베이스 타입 생성
  - [ ] Supabase 타입 자동 생성 스크립트 실행
- [ ] `types/prompt.ts` 프롬프트 관련 타입
- [ ] `types/trend.ts` 트렌드 관련 타입
- [ ] `types/subscription.ts` 구독 관련 타입

## 스타일링 및 UI/UX
- [ ] 테마 설정
  - [ ] 다크 모드 지원
  - [ ] 색상 팔레트 정의
- [ ] 반응형 디자인
  - [ ] 모바일 최적화
  - [ ] 태블릿 레이아웃
- [ ] 애니메이션 및 인터랙션
  - [ ] 로딩 상태 표시
  - [ ] 프롬프트 복사 피드백
  - [ ] 페이지 전환 애니메이션

## SEO 및 메타데이터
- [ ] `app/robots.ts` robots.txt 설정
- [ ] `app/sitemap.ts` 사이트맵 생성
- [ ] `app/manifest.ts` 웹 앱 매니페스트
- [ ] 각 페이지별 메타데이터 설정
  - [ ] Open Graph 이미지
  - [ ] Twitter Card 설정

## 테스트
- [ ] 단위 테스트
  - [ ] 유틸리티 함수 테스트
  - [ ] 컴포넌트 테스트
- [ ] 통합 테스트
  - [ ] API 라우트 테스트
  - [ ] 데이터베이스 쿼리 테스트
- [ ] E2E 테스트
  - [ ] 주요 사용자 플로우 테스트

## 문서화
- [ ] `README.md` 프로젝트 개요 및 설정 가이드
- [ ] `docs/API.md` API 문서
- [ ] `docs/DEPLOYMENT.md` 배포 가이드
- [ ] `docs/CONTRIBUTING.md` 기여 가이드

## 배포 및 인프라
- [ ] 환경 변수 설정
  - [ ] `.env.example` 파일 생성
  - [ ] 프로덕션 환경 변수 설정
- [ ] 배포 설정
  - [ ] Vercel/Netlify 배포 설정
  - [ ] CI/CD 파이프라인 설정
- [ ] 모니터링 및 로깅
  - [ ] 에러 추적 설정
  - [ ] 성능 모니터링 설정

## 보안
- [ ] RLS 정책 검토 및 테스트
- [ ] API 라우트 인증 미들웨어
- [ ] 입력 데이터 검증
- [ ] XSS/CSRF 방지

## 성능 최적화
- [ ] 데이터베이스 쿼리 최적화
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] 캐싱 전략 구현
