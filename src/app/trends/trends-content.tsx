"use client";

import { useState, useMemo } from "react";
import { WeekSummarySection } from "@/components/trends/week-summary-section";
import { CategoryFilterTrends, type CategoryFilterTrendsValue } from "@/components/trends/category-filter-trends";
import { TrendPackList } from "@/components/trends/trend-pack-list";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Database } from "@/../database.types";

type TrendPack = Database["public"]["Tables"]["trend_packs"]["Row"];

interface TrendsContentProps {
  weekPacks: TrendPack[];
  allPacks: TrendPack[];
}

const PAGE_SIZE = 12;

export function TrendsContent({ weekPacks, allPacks }: TrendsContentProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilterTrendsValue>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // 카테고리 필터링
  const filteredPacks = useMemo(() => {
    if (selectedCategory === "all") {
      return allPacks;
    }
    return allPacks.filter((pack) => pack.category === selectedCategory);
  }, [allPacks, selectedCategory]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredPacks.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedPacks = filteredPacks.slice(startIndex, endIndex);

  // 카테고리 변경 시 첫 페이지로 리셋
  const handleCategoryChange = (category: CategoryFilterTrendsValue) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // 페이지 번호 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 기준으로 페이지 번호 생성
      if (currentPage <= 3) {
        // 앞부분
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 뒷부분
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 중간
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <WeekSummarySection trendPacks={weekPacks} />
      <CategoryFilterTrends
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      <TrendPackList packs={paginatedPacks} selectedCategory={selectedCategory} />
      
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}

