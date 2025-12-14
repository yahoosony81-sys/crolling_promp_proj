import { Skeleton } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <div className="container py-6 sm:py-8 md:py-12">
      <div className="mb-8 text-center sm:mb-12">
        <Skeleton className="mb-3 h-8 w-48 mx-auto sm:mb-4 sm:h-10 sm:w-64" />
        <Skeleton className="h-6 w-64 mx-auto sm:h-7 sm:w-80" />
      </div>
      <div className="mb-8 sm:mb-12">
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="mb-8 sm:mb-12">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

