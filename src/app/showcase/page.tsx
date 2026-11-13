import { createClient } from "@/lib/supabase/server";
import { ItemGrid } from "@/components/item-grid";

export default async function ShowcasePage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("status", "published")
    .eq("kind", "page")
    .order("featured", { ascending: false })
    .order("title", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-serif text-4xl">The CREAO Landing Page Pack</h1>
        <p className="mt-3 text-muted">
          155 production-ready landing pages across SaaS, local service, retail, real estate,
          institutions, and portfolio &amp; creative niches. 10 are free to copy and deploy; the
          rest are unlocked with Premium ($10/month). Built entirely with{" "}
          <a href="https://agent.creao.ai/@Sonofpeace" target="_blank" rel="noopener" className="text-accent hover:underline">
            CREAO
          </a>
          . The original 100 are also hosted at{" "}
          <a
            href="https://creao-landing-page-pack.vercel.app"
            target="_blank"
            rel="noopener"
            className="text-accent hover:underline"
          >
            creao-landing-page-pack.vercel.app
          </a>
          .
        </p>
      </div>
      <ItemGrid items={items ?? []} />
    </div>
  );
}
