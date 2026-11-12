import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemGrid } from "@/components/item-grid";
import { NicheSidebar, NicheSidebarMobile } from "@/components/niche-sidebar";
import { CategoryTile, TopPickCard, topPick } from "@/components/category-showcase";
import { CATEGORIES, type ItemCategory } from "@/lib/categories";
import {
  LANDING_PAGES_HREF,
  LANDING_PAGES_NICHE,
  NICHE_SECTIONS,
  UI_COMPONENT_NICHES,
  nichesBySection,
} from "@/lib/ui-component-niches";

const PAGE_CATEGORIES = CATEGORIES.filter((c) => c.key !== "ui_components");

function tabClass(active: boolean) {
  return `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
    active ? "bg-gradient-to-br from-accent to-accent-2 text-white" : "text-fg hover:bg-surface"
  }`;
}

export async function generateMetadata({ searchParams }: PageProps<"/components">): Promise<Metadata> {
  const params = await searchParams;
  const isPages = params.type === "pages";
  const niche = !isPages && typeof params.niche === "string" && params.niche !== LANDING_PAGES_NICHE ? params.niche : undefined;
  const category = isPages && typeof params.category === "string" ? PAGE_CATEGORIES.find((c) => c.key === params.category) : undefined;
  const searching = typeof params.q === "string" && params.q.length > 0;

  let title = "UI Components";
  let description =
    "Browse hundreds of production-ready UI components across 100+ categories, each with a live preview, full source and the exact AI prompt that built it.";
  let canonical = "/components";
  if (isPages) {
    title = category ? `${category.label} landing pages` : "Landing pages";
    description = category
      ? `${category.description}. Full landing pages with live preview, source and prompt.`
      : "Production-ready landing pages across SaaS, local service, retail, real estate, institutions and creative niches.";
    canonical = category ? `/components?type=pages&category=${category.key}` : "/components?type=pages";
  } else if (niche) {
    title = `${niche} components`;
    description = `Production-ready ${niche} UI components with live previews, copy-ready source and the AI prompt behind each one.`;
    canonical = `/components?niche=${encodeURIComponent(niche)}`;
  }
  return {
    title,
    description,
    alternates: { canonical },
    // Search result pages are thin and unbounded; keep them out of the index.
    robots: searching ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: canonical },
  };
}

export default async function ComponentsPage({ searchParams }: PageProps<"/components">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const isPages = params.type === "pages";
  // "Landing Pages" appears in the category list but is its own tab.
  if (!isPages && params.niche === LANDING_PAGES_NICHE) redirect(LANDING_PAGES_HREF);
  const niche = !isPages && typeof params.niche === "string" ? params.niche : undefined;
  const pageCategory =
    isPages && typeof params.category === "string" && PAGE_CATEGORIES.some((c) => c.key === params.category)
      ? (params.category as ItemCategory)
      : undefined;

  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("status", "published")
    .eq("kind", isPages ? "page" : "component")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  const all = data ?? [];

  // On the components tab, the "Landing Pages" category row/tile needs the pages too.
  const { data: pageData } = isPages
    ? { data: null }
    : await supabase
        .from("items")
        .select("*")
        .eq("status", "published")
        .eq("kind", "page")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
  const landingPages = pageData ?? [];

  // Counts per category (niche for components, category for pages).
  const keyOf = (item: (typeof all)[number]) => (isPages ? item.category : item.niche);
  const counts: Record<string, number> = {};
  for (const item of all) {
    const k = keyOf(item);
    if (k) counts[k] = (counts[k] ?? 0) + 1;
  }
  const liveCategoryCount = Object.keys(counts).length;
  if (!isPages) counts[LANDING_PAGES_NICHE] = landingPages.length;
  const byKey = (k: string) => all.filter((item) => keyOf(item) === k);

  const selectedKey = isPages ? pageCategory : niche;
  const searching = q.length > 0;
  const lowerQ = q.toLowerCase();
  const filtered = all.filter(
    (item) =>
      (!selectedKey || keyOf(item) === selectedKey) &&
      (!searching || item.title.toLowerCase().includes(lowerQ) || (item.niche ?? "").toLowerCase().includes(lowerQ))
  );

  const selectedLabel = isPages
    ? PAGE_CATEGORIES.find((c) => c.key === pageCategory)?.label
    : niche;
  const showShowcase = !selectedKey && !searching;
  const pick = selectedKey && !searching ? topPick(byKey(selectedKey)) : null;
  const rest = pick ? filtered.filter((item) => item.id !== pick.id) : filtered;

  const pageCount = isPages ? all.length : undefined;
  const baseParams = { q: q || undefined };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/components" className={tabClass(!isPages)}>UI Components</Link>
          <Link href="/components?type=pages" className={tabClass(isPages)}>Landing Pages</Link>
        </div>
        <span className="mt-6 inline-block rounded-full border border-border bg-accent/10 px-3.5 py-1.5 text-xs uppercase tracking-wide text-accent">
          {isPages ? `${PAGE_CATEGORIES.length} categories` : `${UI_COMPONENT_NICHES.length} categories`}
        </span>
        <h1 className="mt-5 font-serif text-4xl sm:text-5xl">{isPages ? "Landing Pages" : "UI Components"}</h1>
        <p className="mt-3 max-w-2xl text-muted">
          {isPages
            ? `${pageCount} full landing pages, grouped by what you're building. Each category leads with its top pick — open one to see everything inside.`
            : `The full component taxonomy, organized by category. ${liveCategoryCount} are filled so far (${all.length} components); each category leads with its top pick.`}
        </p>
        <form action="/components" method="GET" className="mt-6 max-w-md">
          {isPages && <input type="hidden" name="type" value="pages" />}
          {selectedKey && (
            <input type="hidden" name={isPages ? "category" : "niche"} value={selectedKey} />
          )}
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={isPages ? "Search landing pages…" : "Search components or categories…"}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-fg outline-none focus:border-accent/50"
          />
        </form>
      </div>

      {isPages ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={q ? `/components?type=pages&q=${encodeURIComponent(q)}` : "/components?type=pages"}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              !pageCategory ? "border-transparent bg-gradient-to-br from-accent to-accent-2 text-white" : "border-border hover:border-hairline"
            }`}
          >
            All · {all.length}
          </Link>
          {PAGE_CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/components?type=pages&category=${c.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                pageCategory === c.key
                  ? "border-transparent bg-gradient-to-br from-accent to-accent-2 text-white"
                  : "border-border hover:border-hairline"
              }`}
            >
              {c.label} · {counts[c.key] ?? 0}
            </Link>
          ))}
        </div>
      ) : (
        <NicheSidebarMobile activeNiche={niche} counts={counts} totalCount={all.length} baseParams={baseParams} />
      )}

      <div className="flex gap-8">
        {!isPages && (
          <NicheSidebar activeNiche={niche} counts={counts} totalCount={all.length} baseParams={baseParams} />
        )}
        <div className="min-w-0 flex-1">
          {showShowcase ? (
            isPages ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {PAGE_CATEGORIES.map((c) => (
                  <CategoryTile
                    key={c.key}
                    label={c.label}
                    href={`/components?type=pages&category=${c.key}`}
                    count={counts[c.key] ?? 0}
                    pick={topPick(byKey(c.key))}
                    aspect="aspect-[3/4]"
                  />
                ))}
              </div>
            ) : (
              NICHE_SECTIONS.map((section) => (
                <section key={section} className="mb-12 last:mb-0">
                  <h2 className="mb-4 font-serif text-2xl">{section}</h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {nichesBySection(section).map(({ name }) =>
                      name === LANDING_PAGES_NICHE ? (
                        <CategoryTile
                          key={name}
                          label={name}
                          href={LANDING_PAGES_HREF}
                          count={landingPages.length}
                          pick={topPick(landingPages)}
                          aspect="aspect-[4/3]"
                        />
                      ) : (
                        <CategoryTile
                          key={name}
                          label={name}
                          href={`/components?niche=${encodeURIComponent(name)}`}
                          count={counts[name] ?? 0}
                          pick={topPick(byKey(name))}
                          aspect="aspect-[4/3]"
                        />
                      )
                    )}
                  </div>
                </section>
              ))
            )
          ) : (
            <>
              {pick && selectedLabel && <TopPickCard item={pick} label={selectedLabel} />}
              <p className="mb-4 text-sm text-muted">
                {rest.length} {pick ? "more " : ""}item{rest.length === 1 ? "" : "s"}
                {selectedLabel ? ` in ${selectedLabel}` : ""}
              </p>
              <ItemGrid items={rest} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
