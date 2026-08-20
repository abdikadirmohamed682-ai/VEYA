-- Track unique browser visitors per storefront.
create table if not exists public.store_visitors (
  store_id uuid not null references public.stores(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  primary key (store_id, visitor_id)
);

alter table public.store_visitors enable row level security;

create policy "Anyone can record a store visitor"
  on public.store_visitors
  for insert
  to anon, authenticated
  with check (true);

create policy "Store owners can view their visitors"
  on public.store_visitors
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.stores
      where stores.id = store_visitors.store_id
        and stores.user_id = auth.uid()
    )
  );

notify pgrst, 'reload schema';
