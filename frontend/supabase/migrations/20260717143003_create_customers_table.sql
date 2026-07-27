-- Create customers table for customer authentication
create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.customers enable row level security;

-- Customers can read their own row
create policy "Customers can read own row"
  on public.customers
  for select
  using (auth.uid() = id);

-- Customers can insert their own row
create policy "Customers can insert own row"
  on public.customers
  for insert
  with check (auth.uid() = id);

-- Customers can update their own row
create policy "Customers can update own row"
  on public.customers
  for update
  using (auth.uid() = id);

