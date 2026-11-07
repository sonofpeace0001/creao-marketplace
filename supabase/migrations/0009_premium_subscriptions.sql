-- Premium tier: a flat monthly subscription unlocks every `is_premium` item.
-- `featured` lets the home page and /premium surface hand-picked items.

alter table items add column is_premium boolean not null default false;
alter table items add column featured boolean not null default false;

create table subscriptions (
  user_id uuid primary key references profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

-- writes are service-role only (Stripe webhook / success-redirect fallback)
create policy "users can read own subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- Free content is now "price 0 and not premium"; premium content is also
-- readable by anyone with an active (or trialing) subscription.
drop policy "content readable by creator, buyers, or anyone if free" on item_content;

create policy "content readable by creator, buyers, subscribers, or anyone if free" on item_content
  for select using (
    exists (
      select 1 from items i
      where i.id = item_content.item_id
        and (
          i.creator_id = auth.uid()
          or (i.status = 'published' and i.price_cents = 0 and not i.is_premium)
          or exists (
            select 1 from purchases p
            where p.item_id = i.id
              and p.buyer_id = auth.uid()
              and p.status = 'completed'
          )
          or (
            i.status = 'published'
            and i.is_premium
            and exists (
              select 1 from subscriptions s
              where s.user_id = auth.uid()
                and s.status in ('active', 'trialing')
                and (s.current_period_end is null or s.current_period_end > now())
            )
          )
        )
    )
  );
