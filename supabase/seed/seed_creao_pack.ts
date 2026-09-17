// One-time seeding script: scrapes the 100 cards out of the CREAO landing page
// pack's index.html and upserts them into the `items` table as `kind='page'`,
// `source_type='external_url'` rows pointing back at the live pack site.
// No HTML or prompt text is duplicated into Supabase — the app resolves
// `{slug}-prompt.txt` on the live pack site at render time instead.
//
// Usage: SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_URL=... npx tsx supabase/seed/seed_creao_pack.ts [path-to-pack-repo]

import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import { readFileSync } from "fs";
import { join } from "path";

const LIVE_BASE = "https://creao-landing-page-pack.vercel.app";
const SYSTEM_CREATOR_EMAIL = "creao-system@creao.internal";

const RETAIL = new Set(["birch-furniture","fleet-sneakers","circuit-electronics","loom-apparel","petal-beauty","aurum-jewelry","haven-decor","orbit-gadget","crate-subscription"]);
const LOCAL_SERVICE = new Set(["harbor-plumbing","willow-dental","ember-bistro","vigor-gym","parlor-salon","solace-spa","torque-auto","merit-law","aperture-photo","pristine-cleaning","grove-landscaping","gather-events"]);
const REAL_ESTATE = new Set(["haus-realty","keystone-property","nestled-rentals","meridian-commercial","structo-architecture","form-interior"]);
const INSTITUTIONS = new Set(["anchor-church","beacon-school","ascend-university","concord-clinic","clover-vet","sprout-daycare","kindred-nonprofit","nook-coworking"]);
const PORTFOLIO = new Set(["fold-designer","shutter-photo","atelier-agency","easel-artist","solo-consultant","splice-video","verse-musician","chapter-author","podium-speaker","sketch-illustrator","muse-talent"]);

type Category = "saas" | "local_service" | "retail" | "real_estate" | "institutions" | "portfolio_creative";

function categoryFor(slug: string): Category {
  if (RETAIL.has(slug)) return "retail";
  if (LOCAL_SERVICE.has(slug)) return "local_service";
  if (REAL_ESTATE.has(slug)) return "real_estate";
  if (INSTITUTIONS.has(slug)) return "institutions";
  if (PORTFOLIO.has(slug)) return "portfolio_creative";
  return "saas";
}

async function main() {
  const packDir = process.argv[2] ?? String.raw`C:\Users\USER\Downloads\CREAO LANDING PAGE + AFFILIATE\creao-landing-page-pack`;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ensure the system "creao" creator profile exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", "creao")
    .maybeSingle();

  let creatorId = existing?.id as string | undefined;
  if (!creatorId) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: SYSTEM_CREATOR_EMAIL,
      email_confirm: true,
      user_metadata: { user_name: "creao", full_name: "CREAO" },
    });
    if (error) throw error;
    creatorId = created.user.id;
    await supabase
      .from("profiles")
      .update({
        handle: "creao",
        display_name: "CREAO",
        bio: "The official CREAO landing page pack — 100 production-ready pages, free to browse and copy.",
      })
      .eq("id", creatorId);
  }

  const html = readFileSync(join(packDir, "index.html"), "utf-8");
  const $ = cheerio.load(html);

  const rows = $("article.card")
    .map((_, el) => {
      const card = $(el);
      const slug = card.find("a.btn-view").attr("href")!.replace("-landing.html", "");
      const title = card.find("h3").first().text().trim();
      const thumb = card.find("img.thumb-img").attr("src")!;
      return {
        creator_id: creatorId,
        slug,
        title,
        kind: "page" as const,
        category: categoryFor(slug),
        niche: card.attr("data-niche") ?? null,
        theme: card.attr("data-theme") ?? null,
        layout_tag: card.find(".layout-tag").first().text().trim() || null,
        source_type: "external_url" as const,
        preview_url: `${LIVE_BASE}/${slug}-landing.html`,
        source_url: `${LIVE_BASE}/${slug}-landing.html`,
        thumbnail_url: `${LIVE_BASE}/${thumb}`,
        status: "published" as const,
      };
    })
    .get();

  if (rows.length !== 100) {
    throw new Error(`expected 100 cards, parsed ${rows.length}`);
  }

  const { error: upsertError } = await supabase
    .from("items")
    .upsert(rows, { onConflict: "slug" });
  if (upsertError) throw upsertError;

  console.log(`seeded ${rows.length} items`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
