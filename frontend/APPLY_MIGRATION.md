# How to Apply Admin Store RLS Policies

## Migration File Location
`supabase/migrations/20260814000000_add_admin_store_update_delete_policies.sql`

## Option 1: Apply via Supabase Dashboard (Recommended)

1. Go to: https://app.supabase.com/project/wqmqvxujaxhpacewmbdj/sql/new
2. Copy and paste the SQL commands below
3. Click "Run"

## Option 2: Apply via Supabase CLI

```bash
npm install -g supabase
supabase link --project-ref wqmqvxujaxhpacewmbdj
supabase db push
```

## SQL Commands to Execute

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can update their own stores" ON public.stores;
DROP POLICY IF EXISTS "authenticated users can update their own stores" ON public.stores;

DROP POLICY IF EXISTS "Users can delete their own stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can delete their own stores" ON public.stores;
DROP POLICY IF EXISTS "authenticated users can delete their own stores" ON public.stores;

-- CREATE UPDATE POLICY
CREATE POLICY "Users can update their own stores OR admin can update any store"
  ON public.stores
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR LOWER(auth.email()) = LOWER('abdikadirmohamed682@gmail.com')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR LOWER(auth.email()) = LOWER('abdikadirmohamed682@gmail.com')
  );

-- CREATE DELETE POLICY
CREATE POLICY "Users can delete their own stores OR admin can delete any store"
  ON public.stores
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR LOWER(auth.email()) = LOWER('abdikadirmohamed682@gmail.com')
  );

-- Reload schema
NOTIFY pgrst, 'reload schema';
```

## Verification

After applying, verify in Supabase Dashboard:
1. Go to: https://app.supabase.com/project/wqmqvxujaxhpacewmbdj/auth/policies
2. Select table: `stores`
3. Verify these policies exist:
   - "Users can update their own stores OR admin can update any store" (UPDATE)
   - "Users can delete their own stores OR admin can delete any store" (DELETE)

## What This Does

✅ Preserves existing normal user permissions (update/delete own stores)
✅ Adds admin email authorization for UPDATE and DELETE operations
✅ Uses LOWER() for case-insensitive email comparison
✅ Does NOT modify SELECT, INSERT, or schema
✅ RLS remains enabled
✅ Anonymous users still cannot access

## Programmatic Application

If you have the SUPABASE_SERVICE_ROLE_KEY, run:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_key npm run apply-migration
```

This requires adding to package.json:
```json
"apply-migration": "node apply-migration.mjs"
```
