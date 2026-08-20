-- Forward migration: create product_likes table to track customer likes per product

create table if not exists public.product_likes (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  created_at timestamptz default now()
);

create unique index if not exists product_likes_product_customer_idx on public.product_likes(product_id, customer_id);

-- Enable RLS and policies
alter table public.product_likes enable row level security;

-- Allow anyone to select likes (to display counts)
create policy "Allow select to everyone on product_likes"
  on public.product_likes
  for select
  to public
  using (true);

-- Allow authenticated users to insert their own like
create policy "Allow authenticated insert on product_likes"
  on public.product_likes
  for insert
  to authenticated
  with check (auth.uid() = customer_id);

-- Allow authenticated users to delete their own like
create policy "Allow authenticated delete on product_likes"
  on public.product_likes
  for delete
  to authenticated
  using (auth.uid() = customer_id);


-- Notify pgrst to reload schema
notify pgrst, 'reload schema';
