import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ItemGrid } from "@/components/item-grid";
import { BrowseControls } from "@/components/browse-controls";
import type { ItemCategory, ItemKind } from "@/lib/categories";

export default async function BrowsePage({ searchParams }: PageProps<"/browse">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kind = typeof params.kind === "string" ? (params.kind as ItemKind) : undefined;
  const category = typeof params.category === "string" ? (params.category as ItemCategory) : undefined;
  const theme = typeof params.theme === "string" ? params.theme : undefined;
  const price = typeof params.price === "string" ? params.price : undefined;

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
  if (q) query = query.or(`title.ilike.%${q}%,niche.ilike.%${q}%`);

  const { data: items } = await query;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl">Browse</h1>
        <p className="mt-2 text-muted">{items?.length ?? 0} items</p>
      </div>
      <Suspense>
        <BrowseControls />
      </Suspense>
      <p className="mt-4 text-sm text-muted">
        Looking for UI components?{" "}
        <Link href="/components" className="text-accent hover:underline">
          Browse all 92 categories in the Components hub →
        </Link>
      </p>
      <div className="mt-8">
        <ItemGrid items={items ?? []} />
      </div>
    </div>
  );
}
