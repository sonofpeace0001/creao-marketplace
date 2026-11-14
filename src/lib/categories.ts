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
  { key: "agency_studio", label: "Agency & Studio", description: "Digital, brand, PR, video and design studios and the agencies behind them" },
  { key: "events_venues", label: "Events & Venues", description: "Conferences, festivals, weddings, hotels, retreats and unique venues" },
  { key: "entertainment_media", label: "Entertainment & Media", description: "Film, music, podcasts, publishing, streaming, theatre and games" },
  { key: "education", label: "Education & Courses", description: "Online academies, schools, tutoring, test prep and learning apps" },
  { key: "health_wellness", label: "Health & Wellness", description: "Telehealth, clinics, mental health, fitness, sleep and aesthetics" },
  { key: "ui_components", label: "UI Components", description: "Reusable buttons, cards, navs, forms, and other interface pieces — not tied to a business niche" },
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
