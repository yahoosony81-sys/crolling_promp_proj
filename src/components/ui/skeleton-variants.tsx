import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/**
 * 텍스트 스켈레톤 컴포넌트
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && "w-3/4" // 마지막 줄은 짧게
          )}
        />
      ))}
    </div>
  );
}

/**
 * 카드 스켈레톤 컴포넌트
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <Skeleton className="mb-4 h-6 w-3/4" />
      <SkeletonText lines={3} />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * 리스트 스켈레톤 컴포넌트
 */
export function SkeletonList({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

