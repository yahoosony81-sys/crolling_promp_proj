import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScrapedItem } from "@/lib/types/trend";

const sourceTypeLabels: Record<string, string> = {
  news: "뉴스",
  blog: "블로그",
  market: "마켓",
  community: "커뮤니티",
  listing: "리스트",
};

interface ScrapedItemCardProps {
  item: ScrapedItem;
}

export function ScrapedItemCard({ item }: ScrapedItemCardProps) {
  const sourceTypeLabel = sourceTypeLabels[item.source_type] || item.source_type;

  return (
    <Card 
      className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      role="article"
      aria-labelledby={`item-title-${item.id}`}
    >
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-start justify-between gap-2">
          <CardTitle 
            id={`item-title-${item.id}`}
            className="text-base line-clamp-2 sm:text-lg"
          >
            {item.title}
          </CardTitle>
        </div>
        <div className="mt-2 flex flex-wrap gap-2" role="list" aria-label="출처 정보">
          <Badge variant="secondary" className="w-fit text-xs sm:text-sm" role="listitem">
            {item.source_domain}
          </Badge>
          <Badge variant="outline" className="w-fit text-xs sm:text-sm" role="listitem">
            {sourceTypeLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <CardDescription className="line-clamp-3 mb-4 text-sm leading-relaxed sm:text-base">
          {item.summary}
        </CardDescription>
        {item.tags && item.tags.length > 0 && (
          <div 
            className="mb-4 flex flex-wrap gap-1" 
            role="list" 
            aria-label="태그"
          >
            {item.tags.slice(0, 5).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs" 
                role="listitem"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 5 && (
              <Badge 
                variant="outline" 
                className="text-xs" 
                role="listitem"
                aria-label={`외 ${item.tags.length - 5}개 태그`}
              >
                +{item.tags.length - 5}
              </Badge>
            )}
          </div>
        )}
        <Button 
          asChild 
          variant="outline" 
          className="w-full min-h-[44px]" 
          aria-label={`${item.title} 원문 보기`}
        >
          <Link 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            원문 보기
            <ExternalLink className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

