import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { recordSubscriptionCheckout } from "@/lib/subscriptions";
import { ItemGrid } from "@/components/item-grid";
import { SubscribeButton } from "@/components/subscribe-button";

const PERKS = [
  "Every premium landing page — live, with full HTML source",
  "The exact CREAO prompt behind each page, ready to remix",
  "New premium pages added as the library grows",
  "Cancel anytime from the billing portal",
];

export default async function PremiumPage({ searchParams }: PageProps<"/premium">) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const readSubscription = async () => {
    if (!user) return null;
    const { data } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    return data;
  };

  let sub = await readSubscription();

  // Instant post-checkout confirmation: the webhook may not have landed yet,
  // so verify the session directly with Stripe and record it ourselves.
  if (user && sessionId && !(sub && ["active", "trialing"].includes(sub.status))) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.metadata?.user_id === user.id && session.status === "complete") {
        await recordSubscriptionCheckout(session);
        sub = await readSubscription();
      }
    } catch {}
  }

  const isSubscriber =
    !!sub &&
    ["active", "trialing"].includes(sub.status) &&
    (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("status", "published")
    .eq("is_premium", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <section className="mx-auto max-w-2xl text-center">
        <span className="inline-block rounded-full border border-border bg-accent/10 px-3.5 py-1.5 text-xs uppercase tracking-wide text-accent">
          ★ Premium
        </span>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05]">
          Every premium page.<br />
          <span className="text-gradient">One simple plan.</span>
        </h1>
        <p className="mt-5 text-lg text-muted">
          $10/month unlocks the full library of premium landing pages — source code and prompts included.
        </p>

        <ul className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm">
          {PERKS.map((perk) => (
            <li key={perk} className="flex gap-2">
              <span className="text-accent">✓</span>
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-3">
          {isSubscriber ? (
            <>
              <p className="rounded-full border border-border bg-accent/10 px-4 py-1.5 text-sm text-accent">
                You&apos;re Premium — everything below is unlocked
              </p>
              <SubscribeButton mode="manage" />
            </>
          ) : (
            <SubscribeButton />
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-6 font-serif text-3xl">Premium library</h2>
        <ItemGrid items={items ?? []} />
      </section>
    </div>
  );
}
