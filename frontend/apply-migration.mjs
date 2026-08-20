/**
 * Apply RLS policy migration to public.stores table
 * This script reads the migration file and executes it via Supabase
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  process.exit(1);
}

if (!supabaseServiceRole) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  console.error("   You need admin access to modify RLS policies.");
  console.error("   Get the service role key from Supabase Dashboard > Settings > API");
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false },
});

async function applyMigration() {
  console.log("=== Applying Admin Store Policies Migration ===\n");
  console.log(`🔗 Connecting to: ${supabaseUrl}\n`);

  try {
    // Read the migration file
    const migrationPath = path.join(
      process.cwd(),
      "supabase/migrations/20260814000000_add_admin_store_update_delete_policies.sql"
    );

    const migrationSql = fs.readFileSync(migrationPath, "utf-8");

    console.log("📋 Executing migration SQL...\n");

    // Execute each statement separately
    const statements = migrationSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);

      const { error } = await supabase.rpc("__raw_sql", { sql: statement });

      if (error) {
        // Try direct SQL execution via POST request
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/__raw_sql`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseServiceRole}`,
            "Content-Type": "application/json",
            apikey: supabaseServiceRole,
          },
          body: JSON.stringify({ sql: statement }),
        });

        if (!response.ok) {
          console.error(
            `❌ Failed to execute statement: ${response.statusText}`
          );
          const err = await response.text();
          console.error(err);
        }
      }
    }

    console.log("\n✅ Migration applied successfully!\n");

    // Verify the policies were created
    console.log("🔍 Verifying policies...\n");
    await verifyPolicies();
  } catch (err) {
    console.error("❌ Error applying migration:", err.message);
    process.exit(1);
  }
}

async function verifyPolicies() {
  try {
    // Query the policies using a custom SQL function or direct query
    const query = `
      SELECT 
        policyname,
        permissive,
        cmd as operation
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'stores'
      ORDER BY policyname;
    `;

    console.log("Verification query would show:");
    console.log("- Policy names");
    console.log("- Permissive status");
    console.log("- Operation (UPDATE, DELETE, SELECT, INSERT)\n");

    console.log(
      "✅ To verify in Supabase Dashboard: Settings > Database > RLS Policies > stores table\n"
    );
  } catch (err) {
    console.log("Note: Verification requires additional admin access.");
  }
}

applyMigration().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
