-- enums
create type item_kind as enum ('component', 'page');
create type item_category as enum ('saas', 'local_service', 'retail', 'real_estate', 'institutions', 'portfolio_creative');
create type item_status as enum ('draft', 'published', 'archived');

-- profiles: one per authenticated user (creator)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  github_username text,
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_handle text;
  final_handle text;
  suffix int := 0;
begin
  base_handle := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)), '[^a-z0-9]+', '-', 'g'));
  if base_handle is null or base_handle = '' then
    base_handle := 'user';
  end if;
  final_handle := base_handle;
  while exists (select 1 from public.profiles where handle = final_handle) loop
    suffix := suffix + 1;
    final_handle := base_handle || '-' || suffix;
  end loop;
  insert into public.profiles (id, handle, display_name)
  values (new.id, final_handle, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- categories lookup table
create table categories (
  key item_category primary key,
  label text not null,
  description text
);

insert into categories (key, label, description) values
  ('saas', 'SaaS', 'Software products and tools'),
  ('local_service', 'Local Service', 'Plumbing, dental, gyms, salons, and other local businesses'),
  ('retail', 'Retail', 'E-commerce and direct-to-consumer product brands'),
  ('real_estate', 'Real Estate', 'Agencies, property management, architecture, interior design'),
  ('institutions', 'Institutions', 'Churches, schools, clinics, nonprofits, coworking spaces'),
  ('portfolio_creative', 'Portfolio & Creative', 'Designers, photographers, artists, musicians, and other creatives');

-- items: unified table for components and full pages
create table items (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references profiles(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text,
  kind item_kind not null,
  category item_category not null,
  niche text,
  theme text,
  layout_tag text,
  tags text[],
  price_cents integer not null default 0,
  currency text not null default 'usd',
  source_type text not null check (source_type in ('external_url', 'stored')),
  source_html text,
  preview_url text not null,
  source_url text,
  thumbnail_url text not null,
  prompt_text text,
  status item_status not null default 'published',
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create extension if not exists pg_trgm;
create index idx_items_category on items(category);
create index idx_items_kind on items(kind);
create index idx_items_status on items(status);
create index idx_items_creator_id on items(creator_id);
create index idx_items_title_trgm on items using gin (title gin_trgm_ops);
create index idx_items_niche_trgm on items using gin (niche gin_trgm_ops);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_set_updated_at
  before update on items
  for each row execute procedure public.set_updated_at();

-- purchases: schema only, no payment integration wired in MVP
create table purchases (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'usd',
  provider text,
  provider_reference text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
