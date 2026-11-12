// Canonical public origin, used for metadata, sitemap and robots.
// Set NEXT_PUBLIC_SITE_URL once a custom domain is attached.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://creao-marketplace.vercel.app").replace(/\/+$/, "");
export const SITE_NAME = "CREAO Marketplace";
