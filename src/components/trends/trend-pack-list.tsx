"use client";

import { useMemo } from "react";
import { TrendPackCard } from "./trend-pack-card";
import type { CategoryFilterTrendsValue } from "./category-filter-trends";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { Database } from "@/../database.types";

type TrendPack = Database["public"]["Tables"]["trend_packs"]["Row"];

interface TrendPackListProps {
  packs: TrendPack[];
  selectedCategory: CategoryFilterTrendsValue;
}

export function TrendPackList({
  packs,
  selectedCategory,
}: TrendPackListProps) {
  const filteredPacks = useMemo(() => {
    if (selectedCategory === "all") {
      return packs;
    }
    return packs.filter((pack) => pack.category === selectedCategory);
  }, [packs, selectedCategory]);

  return (
    <div>
      {filteredPacks.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>트렌드 패키지가 없습니다</EmptyTitle>
            <EmptyDescription>
              선택한 카테고리에 해당하는 트렌드 패키지가 없습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPacks.map((pack) => (
            <TrendPackCard key={pack.id} pack={pack} />
          ))}
        </div>
      )}
    </div>
  );
}

