-- pin search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- move pg_trgm out of the public schema
create schema if not exists extensions;
alter extension pg_trgm set schema extensions;

-- handle_new_user is only meant to run via the auth.users trigger, not be called directly over the API
revoke execute on function public.handle_new_user() from public;
