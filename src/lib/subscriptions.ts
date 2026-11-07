import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const PREMIUM_PRICE_CENTS = 1000;
export const PREMIUM_CURRENCY = "usd";

// Shared by the Stripe webhook (source of truth) and the /premium success
// redirect (instant confirmation if the webhook hasn't landed yet). Keyed on
// user_id, so calling it twice for the same subscription is harmless.
export async function syncSubscription(sub: Stripe.Subscription, userIdHint?: string): Promise<boolean> {
  const userId = sub.metadata?.user_id ?? userIdHint;
  if (!userId) return false;

  // Stripe v22 reports the billing period on the subscription items.
  const periodEnd = sub.items.data[0]?.current_period_end;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  return !error;
}

// Used by the checkout.session.completed webhook and the success redirect.
export async function recordSubscriptionCheckout(session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.mode !== "subscription" || !session.subscription) return false;
  const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
  const sub = await getStripe().subscriptions.retrieve(subId);
  return syncSubscription(sub, session.metadata?.user_id);
}
