-- Allow anonymous storefront visitors to record visits without exposing reads or writes.
create policy "Anyone can record a store visitor"
  on public.store_visitors
  for insert
  to anon
  with check (true);

notify pgrst, 'reload schema';
