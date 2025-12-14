import { Badge } from "@/components/ui/badge";
import type { TrendPack } from "@/lib/types/trend";

const categoryLabels: Record<string, string> = {
  product: "상품",
  real_estate: "부동산",
  stock: "주식",
  blog: "블로그",
  shorts: "숏츠",
  reels: "릴스",
};

interface TrendDescriptionSectionProps {
  pack: TrendPack;
}

export function TrendDescriptionSection({ pack }: TrendDescriptionSectionProps) {
  const categoryLabel = categoryLabels[pack.category] || pack.category;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          {pack.title}
        </h1>
        <div className="mb-4 flex flex-wrap gap-2" role="list" aria-label="카테고리 및 주차 정보">
          <Badge variant="secondary" className="w-fit" role="listitem">
            {categoryLabel}
          </Badge>
          <Badge variant="outline" className="w-fit" role="listitem">
            {pack.week_key}
          </Badge>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-lg leading-relaxed text-muted-foreground">
          {pack.summary}
        </p>
      </div>

      {pack.trend_keywords && pack.trend_keywords.length > 0 && (
        <div 
          className="flex flex-wrap gap-2" 
          role="list" 
          aria-label="트렌드 키워드"
        >
          {pack.trend_keywords.map((keyword, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-sm" 
              role="listitem"
            >
              {keyword}
            </Badge>
          ))}
        </div>
      )}
    </section>
  );
}

