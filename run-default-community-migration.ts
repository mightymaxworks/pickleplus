/**
 * PKL-278651-COMM-0020-DEFGRP
 * Default Community Migration
 * 
 * This script creates the "Pickle+ Giveaway Group" community and adds it as a default community
 * that all users will automatically join on registration.
 * 
 * Run with: npx tsx run-default-community-migration.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./shared/schema";
import { communities, communityMembers } from "./shared/schema/community";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

/**
 * Main function to run the migration
 */
async function main() {
  console.log("[PKL-278651-COMM-0020-DEFGRP] Starting default community migration...");
  
  // Initialize DB connection
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  const pgConnection = postgres(dbUrl);
  const db = drizzle(pgConnection);
  
  try {
    // Check if default community already exists
    const existingDefaults = await db.select().from(communities).where(eq(communities.isDefault, true));
    
    if (existingDefaults.length > 0) {
      console.log(`[PKL-278651-COMM-0020-DEFGRP] ${existingDefaults.length} default communities already exist`);
      console.log("[PKL-278651-COMM-0020-DEFGRP] Default communities:", existingDefaults.map(c => c.name).join(", "));
    } else {
      // Get admin user to set as creator
      const adminUsers = await db.select().from(users).where(eq(users.isAdmin, true));
      
      if (adminUsers.length === 0) {
        throw new Error("No admin users found in the database");
      }
      
      const creatorId = adminUsers[0].id;
      
      // Create the default Pickle+ Giveaway Group
      console.log("[PKL-278651-COMM-0020-DEFGRP] Creating Pickle+ Giveaway Group...");
      
      const [giveawayGroup] = await db.insert(communities).values({
        name: "Pickle+ Giveaway Group",
        description: "Official Pickle+ community for exclusive giveaways, promotions, and special announcements. All members are automatically enrolled to receive benefits and opportunities.",
        isPrivate: false,
        requiresApproval: false,
        isDefault: true,
        tags: "official,giveaways,promotions,announcements",
        createdByUserId: creatorId,
        themeColor: "#4CAF50", // Green color for the giveaway group
        guidelines: "Welcome to the official Pickle+ Giveaway Group! This is a special community where we share exclusive giveaways, promotions, and important announcements with all Pickle+ members.\n\n- All members are automatically added to this group\n- Watch for special giveaways and promotions\n- Official announcements will be shared here first\n- Engage with the community to increase your chances of winning"
      }).returning();
      
      console.log(`[PKL-278651-COMM-0020-DEFGRP] Created default community: ${giveawayGroup.name} (ID: ${giveawayGroup.id})`);
      
      // Add all existing users to the default community
      const allUsers = await db.select().from(users);
      console.log(`[PKL-278651-COMM-0020-DEFGRP] Adding ${allUsers.length} existing users to default community...`);
      
      const membershipValues = allUsers.map(user => ({
        userId: user.id,
        communityId: giveawayGroup.id,
        role: "member",
      }));
      
      if (membershipValues.length > 0) {
        await db.insert(communityMembers).values(membershipValues);
        
        // Update the member count
        await db.update(communities)
          .set({ memberCount: allUsers.length })
          .where(eq(communities.id, giveawayGroup.id));
          
        console.log(`[PKL-278651-COMM-0020-DEFGRP] Added ${allUsers.length} users to the default community`);
      }
    }
    
    console.log("[PKL-278651-COMM-0020-DEFGRP] Default community migration completed successfully");
    
  } catch (error) {
    console.error("[PKL-278651-COMM-0020-DEFGRP] Migration failed:", error);
    throw error;
  } finally {
    await pgConnection.end();
  }
}

// Run the migration
main()
  .then(() => {
    console.log("[PKL-278651-COMM-0020-DEFGRP] Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[PKL-278651-COMM-0020-DEFGRP] Migration script failed:", error);
    process.exit(1);
  });