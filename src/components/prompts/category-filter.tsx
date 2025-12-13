"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: "전체" },
  { value: "blog", label: "블로그" },
  { value: "shorts", label: "숏츠" },
  { value: "reels", label: "릴스" },
  { value: "product", label: "상품" },
  { value: "real_estate", label: "부동산" },
  { value: "stock", label: "주식" },
  { value: "trend", label: "트렌드" },
] as const;

export type CategoryFilterValue = (typeof categories)[number]["value"];

interface CategoryFilterProps {
  selectedCategory: CategoryFilterValue;
  onCategoryChange: (category: CategoryFilterValue) => void;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          className={cn(
            selectedCategory === category.value &&
              "bg-primary text-primary-foreground"
          )}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}

