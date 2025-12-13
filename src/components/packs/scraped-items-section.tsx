import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ScrapedItemCard } from "./scraped-item-card";
import type { Database } from "@/../database.types";

type ScrapedItem = Database["public"]["Tables"]["scraped_items"]["Row"];

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
    <section className="mb-12">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">
        수집된 데이터
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ScrapedItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

