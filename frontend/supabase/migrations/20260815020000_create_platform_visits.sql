-- Track every load of the main VEYA homepage.
create table if not exists public.platform_visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table public.platform_visits enable row level security;

create policy "Anyone can record a platform visit"
  on public.platform_visits
  for insert
  to anon
  with check (true);

create policy "Admin can view platform visits"
  on public.platform_visits
  for select
  to authenticated
  using (lower(auth.email()) = lower('abdikadirmohamed682@gmail.com'));

notify pgrst, 'reload schema';
