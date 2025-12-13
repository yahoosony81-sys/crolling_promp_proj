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
import type { Database } from "@/../database.types";

type TrendPack = Database["public"]["Tables"]["trend_packs"]["Row"];

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
  if (trendPacks.length === 0) {
    return null;
  }

  const weekKey = trendPacks[0]?.week_key || "";

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          이번 주 트렌드
        </h2>
        <p className="text-muted-foreground">
          {weekKey} 주차의 주요 트렌드를 확인해보세요
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trendPacks.map((pack) => (
          <Card
            key={pack.id}
            className="flex flex-col transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-2">
                  {pack.title}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="mt-2 w-fit">
                {categoryLabels[pack.category] || pack.category}
              </Badge>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="line-clamp-2 mb-3 text-sm">
                {pack.summary}
              </CardDescription>
              {pack.trend_keywords && pack.trend_keywords.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {pack.trend_keywords.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/packs/${pack.id}`}>보기</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

