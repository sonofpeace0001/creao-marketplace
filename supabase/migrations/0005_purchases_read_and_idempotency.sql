-- buyers can see their own purchase history (writes remain service-role only)
create policy "buyers can read own purchases" on purchases for select using (auth.uid() = buyer_id);

-- prevents a duplicate purchase row if both the webhook and the success-page
-- confirmation path try to record the same Stripe checkout session
alter table purchases add constraint purchases_provider_reference_unique unique (provider, provider_reference);
