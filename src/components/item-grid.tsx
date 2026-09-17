import type { Tables } from "@/lib/types/database.types";
import { ItemCard } from "@/components/item-card";

export function ItemGrid({ items }: { items: Tables<"items">[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-16 text-center text-muted">
        No items match those filters yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
