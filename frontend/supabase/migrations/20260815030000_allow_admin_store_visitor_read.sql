-- Allow the existing admin account to read store visitor records for admin statistics.
create policy "Admin can view all store visitors"
  on public.store_visitors
  for select
  to authenticated
  using (lower(auth.email()) = lower('abdikadirmohamed682@gmail.com'));

notify pgrst, 'reload schema';
