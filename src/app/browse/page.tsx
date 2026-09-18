import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ItemGrid } from "@/components/item-grid";
import { BrowseControls } from "@/components/browse-controls";
import { NicheSidebar } from "@/components/niche-sidebar";
import type { ItemCategory, ItemKind } from "@/lib/categories";

export default async function BrowsePage({ searchParams }: PageProps<"/browse">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kind = typeof params.kind === "string" ? (params.kind as ItemKind) : undefined;
  const category = typeof params.category === "string" ? (params.category as ItemCategory) : undefined;
  const theme = typeof params.theme === "string" ? params.theme : undefined;
  const price = typeof params.price === "string" ? params.price : undefined;
  const niche = typeof params.niche === "string" ? params.niche : undefined;
  const isComponents = kind === "component";

  const supabase = await createClient();
  let query = supabase
    .from("items")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (kind) query = query.eq("kind", kind);
  if (category) query = query.eq("category", category);
  if (theme) query = query.eq("theme", theme);
  if (price === "free") query = query.eq("price_cents", 0);
  if (price === "paid") query = query.gt("price_cents", 0);
  if (isComponents && niche) query = query.eq("niche", niche);
  if (q) query = query.or(`title.ilike.%${q}%,niche.ilike.%${q}%`);

  const { data: items } = await query;

  let sidebar: React.ReactNode = null;
  if (isComponents) {
    const { data: nicheRows } = await supabase
      .from("items")
      .select("niche")
      .eq("status", "published")
      .eq("kind", "component");
    const counts: Record<string, number> = {};
    for (const row of nicheRows ?? []) {
      if (row.niche) counts[row.niche] = (counts[row.niche] ?? 0) + 1;
    }
    sidebar = (
      <NicheSidebar
        activeNiche={niche}
        counts={counts}
        totalCount={nicheRows?.length ?? 0}
        baseParams={{ q: q || undefined, theme, price }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl">Browse</h1>
        <p className="mt-2 text-muted">{items?.length ?? 0} items</p>
      </div>
      <Suspense>
        <BrowseControls />
      </Suspense>
      <div className="mt-8 flex gap-8">
        {sidebar}
        <div className="min-w-0 flex-1">
          <ItemGrid items={items ?? []} />
        </div>
      </div>
    </div>
  );
}
