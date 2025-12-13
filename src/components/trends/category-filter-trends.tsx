"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: "전체" },
  { value: "product", label: "상품" },
  { value: "real_estate", label: "부동산" },
  { value: "stock", label: "주식" },
  { value: "blog", label: "블로그" },
  { value: "shorts", label: "숏츠" },
  { value: "reels", label: "릴스" },
] as const;

export type CategoryFilterTrendsValue =
  (typeof categories)[number]["value"];

interface CategoryFilterTrendsProps {
  selectedCategory: CategoryFilterTrendsValue;
  onCategoryChange: (category: CategoryFilterTrendsValue) => void;
}

export function CategoryFilterTrends({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterTrendsProps) {
  return (
    <div
      className="mb-8 overflow-x-auto pb-2"
      role="group"
      aria-label="트렌드 카테고리 필터"
    >
      <div className="flex min-w-max gap-2 sm:flex-wrap">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          aria-pressed={selectedCategory === category.value}
          aria-label={`${category.label} 카테고리 ${selectedCategory === category.value ? "선택됨" : "선택"}`}
          className={cn(
            selectedCategory === category.value &&
              "bg-primary text-primary-foreground"
          )}
        >
          {category.label}
        </Button>
      ))}
      </div>
    </div>
  );
}

