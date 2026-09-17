import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { itemId } = await request.json();
  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "You must be logged in to buy an item" }, { status: 401 });
  }

  const { data: item } = await supabase
    .from("items")
    .select("id, slug, title, price_cents, currency, creator_id, status")
    .eq("id", itemId)
    .eq("status", "published")
    .maybeSingle();

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  if (item.price_cents <= 0) {
    return NextResponse.json({ error: "This item is free" }, { status: 400 });
  }
  if (item.creator_id === userData.user.id) {
    return NextResponse.json({ error: "You already own this item" }, { status: 400 });
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
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: item.currency,
          unit_amount: item.price_cents,
          product_data: { name: item.title },
        },
        quantity: 1,
      },
    ],
    metadata: { item_id: item.id, buyer_id: userData.user.id },
    success_url: `${origin}/items/${item.slug}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/items/${item.slug}`,
    customer_email: userData.user.email,
  });

  return NextResponse.json({ url: session.url });
}
