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
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{pack.title}</CardTitle>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary" className="w-fit">
            {categoryLabels[pack.category] || pack.category}
          </Badge>
          <Badge variant="outline" className="w-fit">
            {pack.week_key}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription className="line-clamp-3 mb-4">
          {pack.summary}
        </CardDescription>
        {pack.trend_keywords && pack.trend_keywords.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {pack.trend_keywords.slice(0, 4).map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {pack.trend_keywords.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{pack.trend_keywords.length - 4}
              </Badge>
            )}
          </div>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href={`/packs/${pack.id}`}>자세히 보기</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

