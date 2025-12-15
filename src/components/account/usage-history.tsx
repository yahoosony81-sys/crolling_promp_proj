"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatDateTime } from "@/lib/utils/date";
import { LuLoader, LuFileText } from "react-icons/lu";

interface UsageItem {
  id: string;
  action: string;
  created_at: string;
  prompt_id: string;
  pack_id: string | null;
  prompt_templates: {
    id: string;
    title: string;
    category: string;
  } | null;
  trend_packs: {
    id: string;
    title: string;
    category: string;
  } | null;
}

interface UsageHistoryResponse {
  data: UsageItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const actionLabels: Record<string, string> = {
  copy: "복사",
  view: "조회",
  run: "실행",
};

const categoryLabels: Record<string, string> = {
  blog: "블로그",
  shorts: "숏츠",
  reels: "릴스",
  product: "상품",
  real_estate: "부동산",
  stock: "주식",
  trend: "트렌드",
};

/**
 * 이용 기록 리스트 컴포넌트
 */
export function UsageHistory() {
  const [data, setData] = useState<UsageHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchUsageHistory() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/account/usage?page=${page}&limit=20`);
        if (!response.ok) {
          throw new Error("이용 기록을 불러오는데 실패했습니다");
        }

        const result: UsageHistoryResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    }

    fetchUsageHistory();
  }, [page]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>이용 기록</CardTitle>
          <CardDescription>프롬프트 사용 내역을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <LuLoader className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>이용 기록</CardTitle>
          <CardDescription>프롬프트 사용 내역을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>이용 기록</CardTitle>
          <CardDescription>프롬프트 사용 내역을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LuFileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 이용 기록이 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              프롬프트를 사용하면 여기에 기록됩니다
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = data.pagination.totalPages;
    const currentPage = data.pagination.page;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
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
    <Card>
      <CardHeader>
        <CardTitle>이용 기록</CardTitle>
        <CardDescription>
          총 {data.pagination.total}건의 이용 기록이 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 데스크톱 테이블 */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>프롬프트</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>액션</TableHead>
                <TableHead>패키지</TableHead>
                <TableHead>사용 일시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.prompt_templates?.title || "삭제된 프롬프트"}
                  </TableCell>
                  <TableCell>
                    {item.prompt_templates?.category && (
                      <Badge variant="outline">
                        {categoryLabels[item.prompt_templates.category] ||
                          item.prompt_templates.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {actionLabels[item.action] || item.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.trend_packs ? (
                      <Link
                        href={`/packs/${item.trend_packs.id}`}
                        className="text-primary hover:underline"
                      >
                        {item.trend_packs.title}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(item.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 모바일 카드 형태 */}
        <div className="space-y-4 md:hidden">
          {data.data.map((item) => (
            <Card key={item.id} className="border">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">
                      {item.prompt_templates?.title || "삭제된 프롬프트"}
                    </div>
                    {item.prompt_templates?.category && (
                      <Badge variant="outline" className="mt-1">
                        {categoryLabels[item.prompt_templates.category] ||
                          item.prompt_templates.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      {actionLabels[item.action] || item.action}
                    </Badge>
                    {item.trend_packs && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <Link
                          href={`/packs/${item.trend_packs.id}`}
                          className="text-primary hover:underline"
                        >
                          {item.trend_packs.title}
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDateTime(item.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 페이지네이션 */}
        {data.pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                {data.pagination.hasPreviousPage && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                  </PaginationItem>
                )}
                {generatePageNumbers().map((pageNum, index) => {
                  if (pageNum === "ellipsis") {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <span className="px-2">...</span>
                      </PaginationItem>
                    );
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === page}
                        onClick={() => setPage(pageNum as number)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {data.pagination.hasNextPage && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                      }
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

