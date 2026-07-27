-- Add customer_id to orders so every order is permanently linked to the
-- authenticated customer who created it.
alter table public.orders
  add column if not exists customer_id uuid references public.customers(id) on delete set null;


