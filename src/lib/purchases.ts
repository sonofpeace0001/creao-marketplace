import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

// Shared by the Stripe webhook (source of truth) and the item detail page's
// success-redirect fallback (instant confirmation if the webhook hasn't
// landed yet). Idempotent via the unique (provider, provider_reference)
// constraint on `purchases` — safe to call twice for the same session.
export async function recordCompletedCheckout(session: Stripe.Checkout.Session): Promise<boolean> {
  const itemId = session.metadata?.item_id;
  const buyerId = session.metadata?.buyer_id;
  if (!itemId || !buyerId || session.payment_status !== "paid") return false;

  const admin = createAdminClient();
  const { error } = await admin.from("purchases").upsert(
    {
      item_id: itemId,
      buyer_id: buyerId,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      provider: "stripe",
      provider_reference: session.id,
      status: "completed",
    },
    { onConflict: "provider,provider_reference" }
  );
  return !error;
}
