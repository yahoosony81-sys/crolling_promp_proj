import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TrendPackCardSkeleton() {
  return (
    <Card className="flex flex-col">
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
        <Skeleton className="mb-4 h-4 w-4/6" />
        <div className="mb-4 flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-18" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function TrendPackListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <TrendPackCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function WeekSummarySkeleton() {
  return (
    <section className="mb-12">
      <div className="mb-6">
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader className="pb-3">
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="mt-2 h-5 w-16" />
            </CardHeader>
            <CardContent className="flex-1">
              <Skeleton className="mb-3 h-4 w-full" />
              <Skeleton className="mb-3 h-4 w-5/6" />
              <div className="mb-3 flex flex-wrap gap-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-18" />
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

