import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ScrapedItemCard } from "./scraped-item-card";
import type { ScrapedItem } from "@/lib/types/trend";

interface ScrapedItemsSectionProps {
  items: ScrapedItem[];
}

export function ScrapedItemsSection({ items }: ScrapedItemsSectionProps) {
  if (items.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          수집된 데이터
        </h2>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>수집된 데이터가 없습니다</EmptyTitle>
            <EmptyDescription>
              이 패키지에는 아직 수집된 데이터가 없습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    );
  }

  return (
    <section className="mb-8 sm:mb-12">
      <h2 className="mb-4 text-xl font-bold tracking-tight sm:mb-6 sm:text-2xl">
        수집된 데이터
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ScrapedItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

