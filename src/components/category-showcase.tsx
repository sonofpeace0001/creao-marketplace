import Link from "next/link";
import Image from "next/image";
import type { Tables } from "@/lib/types/database.types";
import { categoryLabel } from "@/lib/categories";
import { formatPrice, thumbnailSrc } from "@/lib/utils";

// Component previews are already framed; landing pages are tall hero shots anchored to the top.
const objectPosition = (item: { kind: string }) => (item.kind === "component" ? "object-center" : "object-top");

type Item = Tables<"items">;

// A category's "top pick": a featured item if one exists, otherwise the
// earliest-added. Keeps the showcase stable as new items land.
export function topPick(items: Item[]): Item | null {
  return (
    [...items].sort(
      (a, b) => Number(b.featured) - Number(a.featured) || a.created_at.localeCompare(b.created_at)
    )[0] ?? null
  );
}

// Same chip placement as ItemCard: one chip top-left, one top-right.
function PickBadges({ item }: { item: Item }) {
  return (
    <>
      <span className="absolute left-3 top-3 rounded-full bg-gradient-to-br from-accent to-accent-2 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
        Top pick
      </span>
      <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white backdrop-blur">
        {item.is_premium ? "★ Premium" : item.kind}
      </span>
    </>
  );
}

// One tile per category on the showcase view: the top pick's preview, the
// category name and how many items it holds. Empty categories stay visible
// (greyed, not clickable) so the full taxonomy reads as a roadmap.
export function CategoryTile({
  label,
  href,
  count,
  pick,
  aspect,
}: {
  label: string;
  href: string;
  count: number;
  pick: Item | null;
  // Every tile in one grid shares an aspect so rows stay aligned.
  aspect: "aspect-[3/4]" | "aspect-[4/3]";
}) {
  // Mirrors ItemCard: framed preview, serif title, muted subtitle, footer row.
  const body = (
    <>
      <div className={`relative ${aspect} overflow-hidden border-b border-border bg-surface-2`}>
        {pick ? (
          <>
            <Image
              src={thumbnailSrc(pick)}
              alt={`${pick.title} preview`}
              fill
              unoptimized
              className={`object-cover ${objectPosition(pick)} transition-transform duration-500 group-hover:scale-[1.04]`}
            />
            <PickBadges item={pick} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-wide text-muted">
            Coming soon
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-2xl leading-none">{label}</h3>
        <p className="mt-1 truncate text-sm text-muted">{pick ? `Top pick: ${pick.title}` : "Nothing here yet"}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">
            {count} item{count === 1 ? "" : "s"}
          </span>
          {pick && (
            <span className={pick.is_premium ? "font-medium text-accent" : "font-medium"}>
              {pick.is_premium ? "★ Premium" : formatPrice(pick.price_cents, pick.currency)}
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (!pick) {
    return <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-surface opacity-60">{body}</div>;
  }
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:border-hairline"
    >
      {body}
    </Link>
  );
}

// Large hero card shown above a category's items.
export function TopPickCard({ item, label }: { item: Item; label: string }) {
  return (
    <Link
      href={`/items/${item.slug}`}
      className="group mb-8 grid overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-hairline md:grid-cols-5"
    >
      <div
        className={`relative aspect-[4/3] border-b border-border bg-surface-2 md:col-span-3 md:border-b-0 md:border-r ${
          item.kind === "component" ? "" : "md:aspect-auto md:min-h-72"
        }`}
      >
        <Image
          src={thumbnailSrc(item)}
          alt={`${item.title} preview`}
          fill
          unoptimized
          className={`object-cover ${objectPosition(item)} transition-transform duration-500 group-hover:scale-[1.03]`}
        />
        <PickBadges item={item} />
      </div>
      <div className="flex flex-col justify-center p-6 md:col-span-2">
        <p className="text-xs uppercase tracking-wide text-accent">Top pick · {label}</p>
        <h2 className="mt-2 font-serif text-3xl leading-tight">{item.title}</h2>
        <p className="mt-1 text-sm text-muted">
          {categoryLabel(item.category)}
          {item.niche ? ` · ${item.niche}` : ""}
        </p>
        {item.description && <p className="mt-3 line-clamp-3 text-sm text-muted">{item.description}</p>}
        <div className="mt-5 flex items-center gap-4">
          <span className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white">
            View
          </span>
          <span className={item.is_premium ? "text-sm font-medium text-accent" : "text-sm font-medium"}>
            {item.is_premium ? "★ Premium" : formatPrice(item.price_cents, item.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
