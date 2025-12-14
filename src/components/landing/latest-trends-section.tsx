import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrendPack } from "@/lib/types/trend";

interface LatestTrendsSectionProps {
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

export function LatestTrendsSection({ trendPacks }: LatestTrendsSectionProps) {
  if (trendPacks.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="container px-4">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
            이번 주 트렌드 예시
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            매주 업데이트되는 최신 트렌드 패키지를 확인해보세요
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {trendPacks.map((pack) => (
            <Card key={pack.id} className="flex flex-col">
              <CardHeader className="pb-3 sm:pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="mb-2 text-lg sm:text-xl">{pack.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        {categoryLabels[pack.category] || pack.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs sm:text-sm">{pack.week_key}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-0">
                <CardDescription className="text-sm leading-relaxed sm:text-base">
                  {pack.summary}
                </CardDescription>
                {pack.trend_keywords && pack.trend_keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                    {pack.trend_keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <Button asChild variant="outline" className="w-full min-h-[44px]">
                  <Link href={`/packs/${pack.id}`}>자세히 보기</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 text-center sm:mt-8">
          <Button asChild size="lg" className="min-h-[44px]">
            <Link href="/trends">더 많은 트렌드 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


