import { SkeletonCard } from "@/components/ui/skeleton-variants";

export default function FreePromptsLoading() {
  return (
    <div className="container py-6 sm:py-8 md:py-12">
      <div className="mb-6 text-center sm:mb-8">
        <div className="mb-3 h-8 w-48 animate-pulse rounded-md bg-muted mx-auto sm:mb-4 sm:h-10 sm:w-64" />
      </div>
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

