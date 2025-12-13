import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PackDetailSkeleton() {
  return (
    <div className="space-y-12">
      {/* 트렌드 설명 섹션 스켈레톤 */}
      <section>
        <Skeleton className="mb-4 h-10 w-3/4" />
        <Skeleton className="mb-4 h-6 w-full" />
        <Skeleton className="mb-4 h-6 w-5/6" />
        <div className="mb-4 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-18" />
          <Skeleton className="h-6 w-14" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </section>

      {/* 수집 데이터 섹션 스켈레톤 */}
      <section>
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <Skeleton className="mb-2 h-6 w-3/4" />
                <div className="mt-2 flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="mb-4 h-4 w-full" />
                <Skeleton className="mb-4 h-4 w-5/6" />
                <div className="mb-4 flex flex-wrap gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 목적 선택 UI 스켈레톤 */}
      <section>
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 flex-shrink-0" />
          ))}
        </div>
      </section>

      {/* 프롬프트 리스트 스켈레톤 */}
      <section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mt-2 h-5 w-16" />
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="mb-4 h-4 w-full" />
                <Skeleton className="mb-4 h-4 w-5/6" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

