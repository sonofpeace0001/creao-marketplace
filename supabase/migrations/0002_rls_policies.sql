alter table profiles enable row level security;
alter table items enable row level security;
alter table categories enable row level security;
alter table purchases enable row level security;

-- profiles
create policy "profiles are publicly readable" on profiles for select using (true);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);

-- categories
create policy "categories are publicly readable" on categories for select using (true);

-- items
create policy "published items are publicly readable" on items for select using (status = 'published');
create policy "creators can read own items regardless of status" on items for select using (auth.uid() = creator_id);
create policy "creators can insert own items" on items for insert with check (auth.uid() = creator_id);
create policy "creators can update own items" on items for update using (auth.uid() = creator_id);
create policy "creators can delete own items" on items for delete using (auth.uid() = creator_id);

-- purchases: deliberately no client-facing policies in MVP (service-role only)
