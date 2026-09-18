import { createClient } from "@/lib/supabase/server";
import { ItemGrid } from "@/components/item-grid";
import { NicheSidebar, NicheSidebarMobile } from "@/components/niche-sidebar";
import { UI_COMPONENT_NICHES } from "@/lib/ui-component-niches";

export default async function ComponentsPage({ searchParams }: PageProps<"/components">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const niche = typeof params.niche === "string" ? params.niche : undefined;

  const supabase = await createClient();

  const { data: nicheRows } = await supabase
    .from("items")
    .select("niche")
    .eq("status", "published")
    .eq("kind", "component");
  const counts: Record<string, number> = {};
  for (const row of nicheRows ?? []) {
    if (row.niche) counts[row.niche] = (counts[row.niche] ?? 0) + 1;
  }
  const totalCount = nicheRows?.length ?? 0;
  const liveCategoryCount = Object.keys(counts).length;

  let query = supabase
    .from("items")
    .select("*")
    .eq("status", "published")
    .eq("kind", "component")
    .order("created_at", { ascending: false });
  if (niche) query = query.eq("niche", niche);
  if (q) query = query.or(`title.ilike.%${q}%,niche.ilike.%${q}%`);

  const { data: items } = await query;
  const baseParams = { q: q || undefined };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 border-b border-border pb-8">
        <span className="inline-block rounded-full border border-border bg-accent/10 px-3.5 py-1.5 text-xs uppercase tracking-wide text-accent">
          {UI_COMPONENT_NICHES.length} categories
        </span>
        <h1 className="mt-5 font-serif text-4xl sm:text-5xl">UI Components</h1>
        <p className="mt-3 max-w-2xl text-muted">
          The full component taxonomy, organized by category. {liveCategoryCount} are filled so
          far ({totalCount} components); the rest are open for the next batch.
        </p>
        <form action="/components" method="GET" className="mt-6 max-w-md">
          {niche && <input type="hidden" name="niche" value={niche} />}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search components or categories…"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-fg outline-none focus:border-accent/50"
          />
        </form>
      </div>

      <NicheSidebarMobile activeNiche={niche} counts={counts} totalCount={totalCount} baseParams={baseParams} />

      <div className="flex gap-8">
        <NicheSidebar activeNiche={niche} counts={counts} totalCount={totalCount} baseParams={baseParams} />
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted">
            {items?.length ?? 0} item{items?.length === 1 ? "" : "s"}
            {niche ? ` in ${niche}` : ""}
          </p>
          <ItemGrid items={items ?? []} />
        </div>
      </div>
    </div>
  );
}
