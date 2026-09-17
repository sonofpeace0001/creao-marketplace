import Link from "next/link";
import Image from "next/image";
import type { Tables } from "@/lib/types/database.types";
import { categoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";

export function ItemCard({ item }: { item: Tables<"items"> }) {
  return (
    <Link
      href={`/items/${item.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:border-hairline"
    >
      <div className="relative aspect-[3/4] overflow-hidden border-b border-border bg-surface-2">
        <Image
          src={item.thumbnail_url}
          alt={`${item.title} preview`}
          fill
          unoptimized
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {item.theme && (
            <span className="rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white backdrop-blur">
              {item.theme}
            </span>
          )}
        </div>
        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white backdrop-blur">
          {item.kind}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-2xl leading-none">{item.title}</h3>
        <p className="mt-1 text-sm text-muted">{categoryLabel(item.category)}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">{item.niche}</span>
          <span className="font-medium">{formatPrice(item.price_cents, item.currency)}</span>
        </div>
      </div>
    </Link>
  );
}
