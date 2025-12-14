"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import type { TrendPack } from "@/lib/types/trend";

interface TrendsContentProps {
  weekPacks: TrendPack[];
  allPacks: TrendPack[];
}

const PAGE_SIZE = 12;

export function TrendsContent({ weekPacks, allPacks }: TrendsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL에서 초기 상태 읽기
  const categoryParam = searchParams.get("category") as CategoryFilterTrendsValue | null;
  const pageParam = searchParams.get("page");
  
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilterTrendsValue>(categoryParam || "all");
  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam, 10) : 1
  );

  // URL 쿼리 파라미터 업데이트
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", selectedCategory);
    }
    
    if (currentPage === 1) {
      params.delete("page");
    } else {
      params.set("page", currentPage.toString());
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/trends${newUrl}`, { scroll: false });
  }, [selectedCategory, currentPage, router, searchParams]);

  // 카테고리 필터링
  const filteredPacks = useMemo(() => {
    if (selectedCategory === "all") {
      return allPacks;
    }
    return allPacks.filter((pack) => pack.category === selectedCategory);
  }, [allPacks, selectedCategory]);

  // 페이지네이션 계산 (메모이제이션)
  const { totalPages, paginatedPacks } = useMemo(() => {
    const total = Math.ceil(filteredPacks.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginated = filteredPacks.slice(startIndex, endIndex);
    return { totalPages: total, paginatedPacks: paginated };
  }, [filteredPacks, currentPage]);

  // 페이지 번호 생성 (메모이제이션)
  const pageNumbers = useMemo(() => {
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
  }, [totalPages, currentPage]);

  // 카테고리 변경 시 첫 페이지로 리셋
  const handleCategoryChange = (category: CategoryFilterTrendsValue) => {
    setSelectedCategory(category);
    setCurrentPage(1);
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
        <nav className="mt-8" aria-label="페이지 네비게이션">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  aria-label="이전 페이지"
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {pageNumbers.map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis aria-label="더 많은 페이지" />
                  ) : (
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                      aria-label={`${page}페이지로 이동`}
                      aria-current={currentPage === page ? "page" : undefined}
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
                  aria-label="다음 페이지"
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="sr-only">
            현재 {currentPage}페이지, 총 {totalPages}페이지 중
          </p>
        </nav>
      )}
    </>
  );
}

