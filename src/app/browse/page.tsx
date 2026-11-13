import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemGrid } from "@/components/item-grid";
import { BrowseControls } from "@/components/browse-controls";
import type { ItemCategory, ItemKind } from "@/lib/categories";
import { UI_COMPONENT_NICHES } from "@/lib/ui-component-niches";

const PAGE_SIZE = 48;

export default async function BrowsePage({ searchParams }: PageProps<"/browse">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kind = typeof params.kind === "string" ? (params.kind as ItemKind) : undefined;
  const category = typeof params.category === "string" ? (params.category as ItemCategory) : undefined;
  const theme = typeof params.theme === "string" ? params.theme : undefined;
  const price = typeof params.price === "string" ? params.price : undefined;
  const pageNum = Math.max(1, Math.floor(Number(typeof params.page === "string" ? params.page : "1")) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("items")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (kind) query = query.eq("kind", kind);
  if (category) query = query.eq("category", category);
  if (theme) query = query.eq("theme", theme);
  if (price === "free") query = query.eq("price_cents", 0).eq("is_premium", false);
  if (price === "paid") query = query.or("price_cents.gt.0,is_premium.eq.true");
  if (q) query = query.or(`title.ilike.%${q}%,niche.ilike.%${q}%`);

  const { data: items, count } = await query.range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1);
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // A stale or hand-typed page number past the end goes back to the first page.
  if (pageNum > totalPages) {
    const back = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && k !== "page") back.set(k, v);
    redirect(back.size ? `/browse?${back.toString()}` : "/browse");
  }

  const pageHref = (n: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (typeof v === "string" && k !== "page") qs.set(k, v);
    if (n > 1) qs.set("page", String(n));
    return qs.size ? `/browse?${qs.toString()}` : "/browse";
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl">Browse</h1>
        <p className="mt-2 text-muted">{total} items{totalPages > 1 ? ` · page ${pageNum} of ${totalPages}` : ""}</p>
      </div>
      <Suspense>
        <BrowseControls />
      </Suspense>
      <p className="mt-4 text-sm text-muted">
        Looking for UI components?{" "}
        <Link href="/components" className="text-accent hover:underline">
          Browse all {UI_COMPONENT_NICHES.length} categories in the Components hub →
        </Link>
      </p>
      <div className="mt-8">
        <ItemGrid items={items ?? []} />
      </div>
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4 text-sm">
          {pageNum > 1 ? (
            <Link href={pageHref(pageNum - 1)} rel="prev" className="rounded-lg border border-border px-4 py-2.5 text-fg transition-colors hover:border-hairline">
              ← Previous
            </Link>
          ) : (
            <span aria-hidden className="rounded-lg border border-transparent px-4 py-2.5 opacity-0">← Previous</span>
          )}
          <span className="text-muted">
            Page {pageNum} of {totalPages}
          </span>
          {pageNum < totalPages ? (
            <Link href={pageHref(pageNum + 1)} rel="next" className="rounded-lg border border-border px-4 py-2.5 text-fg transition-colors hover:border-hairline">
              Next →
            </Link>
          ) : (
            <span aria-hidden className="rounded-lg border border-transparent px-4 py-2.5 opacity-0">Next →</span>
          )}
        </nav>
      )}
    </div>
  );
}
