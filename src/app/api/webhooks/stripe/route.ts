import { getStripe } from "@/lib/stripe";
import { recordCompletedCheckout } from "@/lib/purchases";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

// Source of truth for recording a completed purchase — runs with no user
// session, so it uses the service-role client to write past RLS. Idempotent
// via the unique (provider, provider_reference) constraint on `purchases`.
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await recordCompletedCheckout(session);
  }

  return NextResponse.json({ received: true });
}
