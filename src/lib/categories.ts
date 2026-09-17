import type { Database } from "@/lib/types/database.types";

export type ItemCategory = Database["public"]["Enums"]["item_category"];
export type ItemKind = Database["public"]["Enums"]["item_kind"];

export const CATEGORIES: { key: ItemCategory; label: string; description: string }[] = [
  { key: "saas", label: "SaaS", description: "Software products and tools" },
  { key: "local_service", label: "Local Service", description: "Plumbing, dental, gyms, salons, and other local businesses" },
  { key: "retail", label: "Retail", description: "E-commerce and direct-to-consumer product brands" },
  { key: "real_estate", label: "Real Estate", description: "Agencies, property management, architecture, interior design" },
  { key: "institutions", label: "Institutions", description: "Churches, schools, clinics, nonprofits, coworking spaces" },
  { key: "portfolio_creative", label: "Portfolio & Creative", description: "Designers, photographers, artists, musicians, and other creatives" },
];

export function categoryLabel(key: ItemCategory): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

// The live pack site follows a fixed convention for every `source_type='external_url'`
// item: `{slug}-prompt.txt` sits next to `{slug}-landing.html`. We derive the prompt
// URL from `source_url` at render time instead of duplicating prompt text into the DB.
export function promptUrlFor(sourceUrl: string): string | null {
  if (!sourceUrl.endsWith("-landing.html")) return null;
  return sourceUrl.replace(/-landing\.html$/, "-prompt.txt");
}
