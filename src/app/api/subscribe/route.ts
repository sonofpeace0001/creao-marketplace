import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { PREMIUM_CURRENCY, PREMIUM_PRICE_CENTS } from "@/lib/subscriptions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return NextResponse.json({ error: "Log in or sign up to subscribe" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("status, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing && ["active", "trialing"].includes(existing.status)) {
    return NextResponse.json({ error: "You already have an active Premium subscription" }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "Payments aren't configured yet — STRIPE_SECRET_KEY is missing." },
      { status: 503 }
    );
  }

  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: PREMIUM_CURRENCY,
          unit_amount: PREMIUM_PRICE_CENTS,
          recurring: { interval: "month" },
          product_data: { name: "CREAO Premium — every premium landing page" },
        },
        quantity: 1,
      },
    ],
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
    ...(existing?.stripe_customer_id
      ? { customer: existing.stripe_customer_id }
      : { customer_email: user.email }),
    success_url: `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/premium`,
  });

  return NextResponse.json({ url: session.url });
}
