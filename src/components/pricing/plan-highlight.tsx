import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PREMIUM_PLAN } from "@/lib/constants/pricing";
import { LuCheck } from "react-icons/lu";

/**
 * 월 9,900원 플랜 강조 섹션 컴포넌트
 */
export function PlanHighlight() {
  const keyBenefits = [
    "매주 업데이트되는 트렌드 패키지",
    "자동 크롤링·스크래핑 데이터",
    "목적별 맞춤 프롬프트 제공",
    "분석/콘텐츠 제작/판매/투자 전용 프롬프트",
  ];

  return (
    <Card className="border-2 border-primary bg-primary/5">
      <CardHeader className="text-center">
        <Badge className="mb-4" variant="secondary">
          추천 플랜
        </Badge>
        <CardTitle className="mb-2 text-3xl font-bold md:text-4xl">
          {PREMIUM_PLAN.priceLabel}
        </CardTitle>
        <p className="text-muted-foreground">{PREMIUM_PLAN.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {keyBenefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <LuCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm md:text-base">{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

