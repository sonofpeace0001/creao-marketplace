import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ItemGrid } from "@/components/item-grid";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: featured } = await supabase
    .from("items")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <span className="inline-block rounded-full border border-border bg-accent/10 px-3.5 py-1.5 text-xs uppercase tracking-wide text-accent">
          Full pages, not just components
        </span>
        <h1 className="mt-7 font-serif text-6xl leading-[1.02]">
          Ship the whole page.<br />
          <span className="text-gradient">Not a button component.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-lg text-muted">
          A marketplace of production-ready landing pages and components — live preview, full
          source, and the exact AI prompt that built each one.
        </p>
        <div className="mt-9 flex justify-center gap-4">
          <Link
            href="/browse"
            className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            Browse the marketplace
          </Link>
          <Link
            href="/showcase"
            className="rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:border-hairline"
          >
            See the CREAO pack
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl">Recently added</h2>
          <Link href="/browse" className="text-sm text-accent hover:underline">View all →</Link>
        </div>
        <ItemGrid items={featured ?? []} />
      </section>
    </div>
  );
}
