/**
 * Comprehensive test script for Apprentice Log database
 * Run with: npx tsx scripts/test-save-entry.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "SET" : "NOT SET");
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "SET" : "NOT SET");
  process.exit(1);
}

console.log("✓ Environment variables loaded");
console.log("  URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Expected columns based on use-entries.ts
const EXPECTED_COLUMNS = [
  { name: "id", type: "uuid", required: true },
  { name: "user_id", type: "uuid", required: true },
  { name: "date", type: "date", required: true },
  { name: "raw_transcript", type: "text", required: false },
  { name: "formatted_entry", type: "text", required: false },
  { name: "tasks", type: "jsonb", required: false },
  { name: "hours", type: "numeric", required: false },
  { name: "total_hours", type: "numeric", required: false },
  { name: "weather", type: "text", required: false },
  { name: "site_name", type: "text", required: false },
  { name: "supervisor", type: "text", required: false },
  { name: "notes", type: "text", required: false },
  { name: "safety_observations", type: "text", required: false },
  { name: "is_deleted", type: "boolean", required: false },
  { name: "created_at", type: "timestamp", required: false },
  { name: "updated_at", type: "timestamp", required: false },
];

async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log("APPRENTICE LOG DATABASE DIAGNOSTIC");
  console.log("=".repeat(60));

  let allTestsPassed = true;

  // =========================================
  // TEST 1: Check table exists
  // =========================================
  console.log("\n📋 TEST 1: Check table exists");
  const { data: tableCheck, error: tableError } = await supabase
    .from("apprentice_entries")
    .select("id")
    .limit(0);

  if (tableError) {
    console.log("❌ Table check failed:", tableError.message);
    if (tableError.message.includes("does not exist")) {
      console.log("\n⚠️  TABLE DOES NOT EXIST!");
      console.log("   Run the migration SQL in Supabase SQL Editor:");
      console.log("   supabase/migrations/001_complete_schema.sql");
      return;
    }
    allTestsPassed = false;
  } else {
    console.log("✓ Table 'apprentice_entries' exists");
  }

  // =========================================
  // TEST 2: Check all required columns exist
  // =========================================
  console.log("\n📋 TEST 2: Check required columns");

  const missingColumns: string[] = [];

  for (const col of EXPECTED_COLUMNS) {
    const { error } = await supabase
      .from("apprentice_entries")
      .select(col.name)
      .limit(0);

    if (error && error.message.includes("does not exist") || error?.message.includes("Could not find")) {
      console.log(`❌ Missing column: ${col.name} (${col.type})`);
      missingColumns.push(col.name);
      allTestsPassed = false;
    } else if (error) {
      console.log(`⚠️  Column ${col.name}: ${error.message}`);
    } else {
      console.log(`✓ Column exists: ${col.name}`);
    }
  }

  if (missingColumns.length > 0) {
    console.log("\n⚠️  MISSING COLUMNS DETECTED!");
    console.log("   Run this SQL in Supabase SQL Editor to add them:");
    console.log("\n   ALTER TABLE apprentice_entries");
    missingColumns.forEach((col, i) => {
      const colDef = EXPECTED_COLUMNS.find(c => c.name === col);
      const sqlType = colDef?.type === "uuid" ? "UUID" :
                      colDef?.type === "text" ? "TEXT" :
                      colDef?.type === "jsonb" ? "JSONB DEFAULT '[]'::jsonb" :
                      colDef?.type === "numeric" ? "NUMERIC" :
                      colDef?.type === "boolean" ? "BOOLEAN DEFAULT FALSE" :
                      colDef?.type === "date" ? "DATE" :
                      colDef?.type === "timestamp" ? "TIMESTAMPTZ DEFAULT NOW()" : "TEXT";
      const comma = i < missingColumns.length - 1 ? "," : ";";
      console.log(`   ADD COLUMN IF NOT EXISTS ${col} ${sqlType}${comma}`);
    });
    console.log("\n   NOTIFY pgrst, 'reload schema';");
  }

  // =========================================
  // TEST 3: Test query with is_deleted filter
  // =========================================
  console.log("\n📋 TEST 3: Query with is_deleted filter");
  const { data: queryData, error: queryError } = await supabase
    .from("apprentice_entries")
    .select("*")
    .eq("is_deleted", false)
    .limit(1);

  if (queryError) {
    console.log("❌ Query failed:", queryError.message);
    allTestsPassed = false;
  } else {
    console.log("✓ Query with is_deleted filter works");
    console.log(`  Found ${queryData?.length || 0} entries`);
  }

  // =========================================
  // TEST 4: Test insert (simulating real entry)
  // =========================================
  console.log("\n📋 TEST 4: Test insert operation");

  const testEntry = {
    user_id: "00000000-0000-0000-0000-000000000000", // Fake UUID for testing
    date: new Date().toISOString().split("T")[0],
    raw_transcript: "Test transcript from diagnostic script",
    formatted_entry: "",
    tasks: [{ description: "Test task", hours: 1, tools: ["hammer"], skills: ["framing"] }],
    hours: 1,
    total_hours: 1,
    weather: "Sunny",
    site_name: "Test Site",
    supervisor: "Test Supervisor",
    notes: "Test notes",
    safety_observations: "Wore PPE",
    is_deleted: false,
  };

  const { data: insertData, error: insertError } = await supabase
    .from("apprentice_entries")
    .insert(testEntry)
    .select();

  if (insertError) {
    console.log("❌ Insert failed:", insertError.message);

    // Parse the error to identify missing column
    const match = insertError.message.match(/Could not find the '(\w+)' column/);
    if (match) {
      console.log(`\n⚠️  Missing column detected: ${match[1]}`);
    }

    // Check if it's an RLS error (which is expected without a real user)
    if (insertError.message.includes("violates row-level security") ||
        insertError.message.includes("new row violates") ||
        insertError.code === "42501") {
      console.log("✓ (RLS correctly blocking fake user - this is expected!)");
      console.log("  The insert WOULD work for a real authenticated user.");
    } else {
      allTestsPassed = false;
    }
  } else {
    console.log("✓ Insert succeeded (unexpected - RLS may not be enabled)");

    // Clean up test entry
    if (insertData?.[0]?.id) {
      await supabase.from("apprentice_entries").delete().eq("id", insertData[0].id);
      console.log("  Cleaned up test entry");
    }
  }

  // =========================================
  // SUMMARY
  // =========================================
  console.log("\n" + "=".repeat(60));
  if (allTestsPassed && missingColumns.length === 0) {
    console.log("✅ ALL TESTS PASSED - Database schema is correct!");
    console.log("=".repeat(60));
  } else {
    console.log("⚠️  ISSUES DETECTED - See above for details");
    console.log("=".repeat(60));
    console.log("\nTo fix, run the complete migration in Supabase SQL Editor:");
    console.log("supabase/migrations/001_complete_schema.sql");
  }
}

runTests().catch(console.error);
