export function formatPrice(cents: number, currency: string = "usd"): string {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

// Component previews are tightly framed 4:3 crops; landing pages keep the tall 3:4 hero shot.
export function previewAspect(kind: string): string {
  return kind === "component" ? "aspect-[4/3]" : "aspect-[3/4]";
}

// Component thumbnails were re-rendered as tight crops under the same filenames, so tag the
// URL to bypass browser/CDN caches of the old images. Bump COMPONENT_THUMB_VERSION on re-render.
const COMPONENT_THUMB_VERSION = 4;
export function thumbnailSrc(item: { thumbnail_url: string; kind: string }): string {
  return item.kind === "component" ? `${item.thumbnail_url}?v=${COMPONENT_THUMB_VERSION}` : item.thumbnail_url;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
