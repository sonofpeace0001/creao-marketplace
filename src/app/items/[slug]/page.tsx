import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, promptUrlFor } from "@/lib/categories";
import { formatPrice } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { recordCompletedCheckout } from "@/lib/purchases";
import { LivePreviewFrame } from "@/components/live-preview-frame";
import { CodeViewer } from "@/components/code-viewer";
import { PromptPanel } from "@/components/prompt-panel";
import { PaywallCard } from "@/components/paywall-card";

export default async function ItemDetailPage({ params, searchParams }: PageProps<"/items/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;

  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!item) notFound();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const isFree = item.price_cents === 0;
  const isOwner = user?.id === item.creator_id;
  let hasPurchased = false;

  if (!isFree && !isOwner && user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("item_id", item.id)
      .eq("buyer_id", user.id)
      .eq("status", "completed")
      .maybeSingle();
    hasPurchased = !!purchase;

    // Fallback for the instant post-checkout redirect: the webhook may not
    // have landed yet, so verify the session directly with Stripe and
    // record it ourselves (idempotent — safe if the webhook also fires).
    if (!hasPurchased && sessionId) {
      try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (
          session.metadata?.item_id === item.id &&
          session.metadata?.buyer_id === user.id &&
          session.payment_status === "paid"
        ) {
          hasPurchased = await recordCompletedCheckout(session);
        }
      } catch {}
    }
  }

  const hasAccess = isFree || isOwner || hasPurchased;

  let sourceHtml: string | null = null;
  let promptText: string | null = null;

  if (hasAccess) {
    sourceHtml = item.source_html;
    if (!sourceHtml && item.source_url) {
      try {
        const res = await fetch(item.source_url);
        if (res.ok) sourceHtml = await res.text();
      } catch {}
    }

    const promptUrl = item.source_url ? promptUrlFor(item.source_url) : null;
    if (promptUrl) {
      try {
        const res = await fetch(promptUrl);
        if (res.ok) promptText = await res.text();
      } catch {}
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{categoryLabel(item.category)} · {item.niche}</p>
          <h1 className="mt-1 font-serif text-4xl">{item.title}</h1>
          {item.description && <p className="mt-2 max-w-2xl text-muted">{item.description}</p>}
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl">{formatPrice(item.price_cents, item.currency)}</p>
          <a
            href={item.preview_url}
            target="_blank"
            rel="noopener"
            className="mt-2 inline-block rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Open full page ↗
          </a>
        </div>
      </div>

      <LivePreviewFrame url={item.preview_url} title={item.title} />

      {promptText && (
        <div className="mt-6">
          <PromptPanel promptText={promptText} />
        </div>
      )}

      <div className="mt-6">
        {hasAccess ? (
          sourceHtml && <CodeViewer code={sourceHtml} />
        ) : (
          <PaywallCard itemId={item.id} priceCents={item.price_cents} currency={item.currency} />
        )}
      </div>
    </div>
  );
}
