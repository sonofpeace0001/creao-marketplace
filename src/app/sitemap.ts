import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";
import { SITE_URL } from "@/lib/site";
import { CATEGORIES } from "@/lib/categories";

export const revalidate = 3600;

// Public, anon-key read of published rows only (RLS already limits what anon can see).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("items")
    .select("slug, kind, category, niche, updated_at")
    .eq("status", "published")
    .order("created_at", { ascending: true });
  const items = data ?? [];

  const latest = items.reduce((max, i) => (i.updated_at > max ? i.updated_at : max), "1970-01-01T00:00:00Z");

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/components`, lastModified: latest, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/components?type=pages`, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/showcase`, lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/premium`, lastModified: latest, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/browse`, lastModified: latest, changeFrequency: "daily", priority: 0.5 },
  ];

  // One landing page per component category and per landing-page category.
  const niches = [...new Set(items.filter((i) => i.kind === "component" && i.niche).map((i) => i.niche as string))].sort();
  const nichePages: MetadataRoute.Sitemap = niches.map((n) => ({
    url: `${SITE_URL}/components?niche=${encodeURIComponent(n)}`,
    lastModified: latest,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const pageCats = new Set(items.filter((i) => i.kind === "page").map((i) => i.category));
  const pageCategoryPages: MetadataRoute.Sitemap = CATEGORIES.filter((c) => pageCats.has(c.key)).map((c) => ({
    // "&amp;" because the sitemap serializer does not XML-escape URLs.
    url: `${SITE_URL}/components?type=pages&amp;category=${c.key}`,
    lastModified: latest,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const itemPages: MetadataRoute.Sitemap = items.map((i) => ({
    url: `${SITE_URL}/items/${i.slug}`,
    lastModified: i.updated_at,
    changeFrequency: "monthly",
    priority: i.kind === "page" ? 0.7 : 0.6,
  }));

  return [...staticPages, ...nichePages, ...pageCategoryPages, ...itemPages];
}
