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
import type { TrendPack } from "@/lib/types/trend";

interface TrendPackCardProps {
  pack: TrendPack;
}

const categoryLabels: Record<string, string> = {
  product: "상품",
  real_estate: "부동산",
  stock: "주식",
  blog: "블로그",
  shorts: "숏츠",
  reels: "릴스",
};

export function TrendPackCard({ pack }: TrendPackCardProps) {
  const categoryLabel = categoryLabels[pack.category] || pack.category;
  
  return (
    <Card 
      className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      role="article"
      aria-labelledby={`pack-title-${pack.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle 
            id={`pack-title-${pack.id}`}
            className="text-lg line-clamp-2"
          >
            {pack.title}
          </CardTitle>
        </div>
        <div className="mt-2 flex flex-wrap gap-2" role="list" aria-label="카테고리 및 주차 정보">
          <Badge variant="secondary" className="w-fit" role="listitem">
            {categoryLabel}
          </Badge>
          <Badge variant="outline" className="w-fit" role="listitem">
            {pack.week_key}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription className="line-clamp-3 mb-4">
          {pack.summary}
        </CardDescription>
        {pack.trend_keywords && pack.trend_keywords.length > 0 && (
          <div 
            className="mb-4 flex flex-wrap gap-1" 
            role="list" 
            aria-label="트렌드 키워드"
          >
            {pack.trend_keywords.slice(0, 4).map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs" role="listitem">
                {keyword}
              </Badge>
            ))}
            {pack.trend_keywords.length > 4 && (
              <Badge variant="outline" className="text-xs" role="listitem" aria-label={`외 ${pack.trend_keywords.length - 4}개 키워드`}>
                +{pack.trend_keywords.length - 4}
              </Badge>
            )}
          </div>
        )}
        <Button asChild variant="outline" className="w-full" aria-label={`${pack.title} 패키지 자세히 보기`}>
          <Link href={`/packs/${pack.id}`}>자세히 보기</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

