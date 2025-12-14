import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { getCurrentWeekKey, getWeekKeyFromDate } from "@/lib/utils/trend";
import type { TrendPack } from "@/lib/types/trend";

interface WeekSummarySectionProps {
  trendPacks: TrendPack[];
}

const categoryLabels: Record<string, string> = {
  product: "상품",
  real_estate: "부동산",
  stock: "주식",
  blog: "블로그",
  shorts: "숏츠",
  reels: "릴스",
};

export function WeekSummarySection({
  trendPacks,
}: WeekSummarySectionProps) {
  const currentWeekKey = getCurrentWeekKey();
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekKey = getWeekKeyFromDate(nextWeekDate);

  if (trendPacks.length === 0) {
    return (
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            이번 주 트렌드
          </h2>
          <p className="text-muted-foreground">
            {currentWeekKey} 주차의 주요 트렌드를 확인해보세요
          </p>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>이번 주 트렌드가 아직 준비되지 않았습니다</EmptyTitle>
            <EmptyDescription>
              {nextWeekKey} 주차에 새로운 트렌드 패키지가 업데이트될 예정입니다.
              <br />
              다른 카테고리의 트렌드 패키지를 확인해보세요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    );
  }

  const weekKey = trendPacks[0]?.week_key || currentWeekKey;

  return (
    <section className="mb-12" aria-labelledby="week-summary-heading">
      <div className="mb-6">
        <h2 id="week-summary-heading" className="mb-2 text-2xl font-bold tracking-tight">
          이번 주 트렌드
        </h2>
        <p className="text-muted-foreground">
          {weekKey} 주차의 주요 트렌드를 확인해보세요
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="list">
        {trendPacks.map((pack) => (
          <Card
            key={pack.id}
            className="flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            role="listitem"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-2">
                  {pack.title}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="mt-2 w-fit" aria-label={`카테고리: ${categoryLabels[pack.category] || pack.category}`}>
                {categoryLabels[pack.category] || pack.category}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="line-clamp-2 mb-3 text-sm">
                {pack.summary}
              </CardDescription>
              {pack.trend_keywords && pack.trend_keywords.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1" role="list" aria-label="트렌드 키워드">
                  {pack.trend_keywords.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs" role="listitem">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
              <Button asChild variant="outline" size="sm" className="w-full" aria-label={`${pack.title} 패키지 보기`}>
                <Link href={`/packs/${pack.id}`}>보기</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

