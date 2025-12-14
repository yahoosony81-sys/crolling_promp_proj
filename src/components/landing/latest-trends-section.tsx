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
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            이번 주 트렌드 예시
          </h2>
          <p className="text-lg text-muted-foreground">
            매주 업데이트되는 최신 트렌드 패키지를 확인해보세요
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {trendPacks.map((pack) => (
            <Card key={pack.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="mb-2 text-xl">{pack.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {categoryLabels[pack.category] || pack.category}
                      </Badge>
                      <Badge variant="outline">{pack.week_key}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-base">
                  {pack.summary}
                </CardDescription>
                {pack.trend_keywords && pack.trend_keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pack.trend_keywords.slice(0, 3).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <div className="px-6 pb-6">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/packs/${pack.id}`}>자세히 보기</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link href="/trends">더 많은 트렌드 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


