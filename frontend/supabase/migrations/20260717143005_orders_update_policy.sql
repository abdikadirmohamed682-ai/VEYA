-- Enable RLS on orders table
-- Note: orders table likely already has RLS enabled, but this ensures it
alter table public.orders enable row level security;

-- Drop any existing UPDATE policy on orders to avoid conflicts
drop policy if exists "Store owners can update their own orders" on public.orders;

-- Allow the store owner to UPDATE orders that belong to their store.
-- The store owner is identified by matching the authenticated user's ID
-- against the user_id column in the stores table, then matching the
-- store's id against the order's store_id column.
create policy "Store owners can update their own orders"
  on public.orders
  for update
  using (
    exists (
      select 1
      from public.stores
      where stores.id = orders.store_id
        and stores.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.stores
      where stores.id = orders.store_id
        and stores.user_id = auth.uid()
    )
  );

-- Also ensure store owners can SELECT their own orders
drop policy if exists "Store owners can view their own orders" on public.orders;

create policy "Store owners can view their own orders"
  on public.orders
  for select
  using (
    exists (
      select 1
      from public.stores
      where stores.id = orders.store_id
        and stores.user_id = auth.uid()
    )
  );

