/**
 * Initialization script for CourtIQ™ Mastery Paths database tables and data
 * Sprint: PKL-278651-MAST-0003-DB
 * 
 * This script is used to:
 * 1. Create the database tables for Mastery Paths
 * 2. Initialize the tables with the required data
 */

import { migrateMasteryPathsTables } from "./migrateMasteryPaths";
import { MasteryPathsService } from "./modules/mastery/masteryPathsService";

/**
 * Main initialization function
 */
async function initMasteryPathsDatabase() {
  try {
    console.log("===== Initializing Mastery Paths Database =====");
    
    // Step 1: Create the database tables
    console.log("Step 1: Creating database tables...");
    await migrateMasteryPathsTables();
    
    // Step 2: Initialize the tier data
    console.log("\nStep 2: Initializing tier data...");
    const service = new MasteryPathsService();
    await service.initialize();
    
    console.log("\n✅ Mastery Paths database initialization completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing Mastery Paths database:", error);
    process.exit(1);
  }
}

// Run the initialization
initMasteryPathsDatabase();