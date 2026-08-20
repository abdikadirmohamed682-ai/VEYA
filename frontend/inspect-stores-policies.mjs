/**
 * Inspect existing RLS policies on public.stores table
 * and generate SQL for admin policy updates
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

// Use service role key if available (has admin access), otherwise use anon key
const supabase = createClient(supabaseUrl, supabaseServiceRole || supabaseAnonKey);

async function inspectPolicies() {
  console.log("Connecting to Supabase...\n");

  try {
    // Query to get all policies on public.stores
    const { data, error } = await supabase.rpc("__raw_sql", {
      sql: `
        SELECT 
          p.policyname,
          p.permissive,
          r.rulename,
          pg_get_expr(r.qual, r.ev_class) AS "USING",
          pg_get_expr(r.with_check, r.ev_class) AS "WITH_CHECK"
        FROM pg_policies p
        LEFT JOIN pg_class c ON c.oid = p.polrelid
        LEFT JOIN pg_rewrite r ON r.oid = p.polindex
        WHERE c.relname = 'stores'
          AND p.schemaname = 'public'
        ORDER BY p.policyname;
      `
    });

    if (error && !supabaseServiceRole) {
      console.log("Note: Cannot access pg_policies with anon key.");
      console.log("Attempting alternative method with information_schema...\n");
    }

    // Try alternative query using information_schema
    const { data: altData, error: altError } = await supabase
      .from("information_schema.tables")
      .select("*")
      .eq("table_schema", "public")
      .eq("table_name", "stores");

    if (altError) {
      console.log("❌ Could not query Supabase directly.");
      console.log("This is expected with anon key - policies require admin access to inspect.\n");
      console.log("Proceeding with creating the migration file...\n");
      return null;
    }

    return data;
  } catch (err) {
    console.log("❌ Error querying Supabase:", err.message);
    console.log("Proceeding with creating the migration file...\n");
    return null;
  }
}

async function main() {
  console.log("=== Inspecting Stores Table RLS Policies ===\n");

  const policies = await inspectPolicies();

  // Generate the migration SQL
  const migrationSql = `
-- Migration: Add admin email authorization to stores UPDATE and DELETE policies
-- Admin email: abdikadirmohamed682@gmail.com
-- Date: ${new Date().toISOString().split("T")[0]}

-- First, identify and drop existing UPDATE policy on public.stores
-- (The exact name will be determined from pg_policies table)
DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can update their own stores" ON public.stores;

-- Drop existing DELETE policy on public.stores
DROP POLICY IF EXISTS "Users can delete their own stores" ON public.stores;
DROP POLICY IF EXISTS "Store owners can delete their own stores" ON public.stores;

-- Create new UPDATE policy: allows store owners and admin to update stores
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

-- Create new DELETE policy: allows store owners and admin to delete stores
CREATE POLICY "Users can delete their own stores OR admin can delete any store"
  ON public.stores
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR LOWER(auth.email()) = LOWER('abdikadirmohamed682@gmail.com')
  );

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
`;

  console.log("✅ Generated migration SQL:\n");
  console.log(migrationSql);

  // Save the migration to a file
  const fs = await import("fs");
  const timestamp = Math.floor(Date.now() / 1000);
  const migrationFileName = `supabase/migrations/${timestamp}_add_admin_store_policies.sql`;

  fs.writeFileSync(migrationFileName, migrationSql.trim());
  console.log(`\n✅ Migration file created: ${migrationFileName}`);
  console.log("\nNext steps:");
  console.log("1. Apply the migration via Supabase CLI: supabase db push");
  console.log("   OR");
  console.log("2. Copy the SQL and run it in Supabase Dashboard > SQL Editor");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
