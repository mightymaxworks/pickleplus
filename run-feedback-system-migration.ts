/**
 * PKL-278651-SAGE-0010-FEEDBACK - Enhanced Feedback System Migration Runner
 * 
 * This script runs the migration for creating the enhanced feedback system tables
 * Run with: npx tsx run-feedback-system-migration.ts
 */

import { db } from "./server/db";
import * as migration from "./server/migrations/20250425_enhanced_feedback_system";

async function main() {
  console.log("Starting Enhanced Feedback System migration...");
  
  try {
    await migration.up();
    console.log("✅ Enhanced Feedback System migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();