-- Allow anonymous users to insert into order_items (needed by the buy API)
-- The orders table insert succeeds, but order_items insert fails with:
-- "new row violates row-level security policy for table order_items"
-- This policy fixes that by allowing anon INSERTs.

CREATE POLICY "Allow anon insert on order_items"
  ON public.order_items
  FOR INSERT
  TO anon
  WITH CHECK (true);
