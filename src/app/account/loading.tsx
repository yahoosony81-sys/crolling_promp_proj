import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="container py-6 sm:py-8 md:py-12">
      <div className="mb-6 sm:mb-8">
        <Skeleton className="mb-2 h-8 w-32 sm:h-10 sm:w-40" />
        <Skeleton className="h-6 w-64 sm:h-7 sm:w-80" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

