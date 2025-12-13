/**
 * 가격 정책 및 기능 비교 데이터
 */

export interface PricingFeature {
  id: string;
  name: string;
  description?: string;
}

export interface PricingPlan {
  id: "free" | "premium";
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: PricingFeature[];
  featuresMap: Record<string, boolean>;
}

/**
 * 기능 목록 정의
 */
export const PRICING_FEATURES: PricingFeature[] = [
  {
    id: "free_prompts",
    name: "무료 프롬프트 템플릿 10선",
    description: "블로그, 숏츠, 릴스, 상품 분석 등 기본 프롬프트",
  },
  {
    id: "trend_curation",
    name: "주간 트렌드 큐레이션",
    description: "매주 업데이트되는 분야별 트렌드 주제",
  },
  {
    id: "scraped_data",
    name: "배치 기반 크롤링·스크래핑 데이터",
    description: "주 1~2회 자동 수집 및 요약된 트렌드 데이터",
  },
  {
    id: "trend_packages",
    name: "주간 트렌드 패키지",
    description: "이번 주 트렌드 + 요약 데이터 + 프롬프트 묶음",
  },
  {
    id: "purpose_prompts",
    name: "목적별 프롬프트 제공",
    description: "분석 / 콘텐츠 제작 / 판매 / 투자 목적별 맞춤 프롬프트",
  },
  {
    id: "weekly_updates",
    name: "매주 업데이트",
    description: "매주 새로운 트렌드와 프롬프트 자동 업데이트",
  },
];

/**
 * 무료 플랜
 */
export const FREE_PLAN: PricingPlan = {
  id: "free",
  name: "무료",
  price: 0,
  priceLabel: "무료",
  description: "기본 프롬프트 템플릿을 무료로 이용하세요",
  features: PRICING_FEATURES.filter((f) => f.id === "free_prompts"),
  featuresMap: {
    free_prompts: true,
    trend_curation: false,
    scraped_data: false,
    trend_packages: false,
    purpose_prompts: false,
    weekly_updates: false,
  },
};

/**
 * 유료 플랜 (프리미엄)
 */
export const PREMIUM_PLAN: PricingPlan = {
  id: "premium",
  name: "프리미엄",
  price: 9900,
  priceLabel: "월 9,900원",
  description: "매주 업데이트되는 트렌드 프롬프트와 크롤링 데이터를 이용하세요",
  features: PRICING_FEATURES,
  featuresMap: {
    free_prompts: true,
    trend_curation: true,
    scraped_data: true,
    trend_packages: true,
    purpose_prompts: true,
    weekly_updates: true,
  },
};

/**
 * 모든 플랜 목록
 */
export const PRICING_PLANS: PricingPlan[] = [FREE_PLAN, PREMIUM_PLAN];

/**
 * 기본 플랜 (프리미엄)
 */
export const DEFAULT_PLAN = PREMIUM_PLAN;

