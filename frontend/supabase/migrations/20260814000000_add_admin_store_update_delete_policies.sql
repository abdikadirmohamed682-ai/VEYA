-- Migration: Admin RLS Policies for Stores Table
-- Purpose: Allow admin (abdikadirmohamed682@gmail.com) to update and delete any store
--          while preserving existing normal user permissions
-- Created: 2026-08-14

-- Drop existing UPDATE and DELETE policies on public.stores
-- These statements use DROP IF EXISTS to safely handle various policy names
DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can update their own stores" ON public.stores;
DROP POLICY IF EXISTS "authenticated users can update their own stores" ON public.stores;

DROP POLICY IF EXISTS "Users can delete their own stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can delete their own stores" ON public.stores;
DROP POLICY IF EXISTS "authenticated users can delete their own stores" ON public.stores;

-- CREATE UPDATE POLICY
-- Allows:
-- 1. Users to update their own stores (auth.uid() = user_id)
-- 2. Admin user with specific email to update any store
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
-- Allows:
-- 1. Users to delete their own stores (auth.uid() = user_id)
-- 2. Admin user with specific email to delete any store
CREATE POLICY "Users can delete their own stores OR admin can delete any store"
  ON public.stores
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR LOWER(auth.email()) = LOWER('abdikadirmohamed682@gmail.com')
  );

-- Notify PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';
