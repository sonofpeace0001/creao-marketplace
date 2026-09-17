import Stripe from "stripe";

// Server-only. Throws a clear error at call time (not at import time) if the
// key isn't configured yet, so pages can render normally until it is.
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}
