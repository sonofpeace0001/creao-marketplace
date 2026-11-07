import { getStripe } from "@/lib/stripe";
import { recordCompletedCheckout } from "@/lib/purchases";
import { recordSubscriptionCheckout, syncSubscription } from "@/lib/subscriptions";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// Source of truth for recording purchases and subscription state — runs with
// no user session, so it uses the service-role client to write past RLS.
// Purchases are idempotent via the unique (provider, provider_reference)
// constraint; subscriptions are upserted by user_id.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${err instanceof Error ? err.message : err}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription") {
        await recordSubscriptionCheckout(session);
      } else {
        await recordCompletedCheckout(session);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
