/**
 * CourtIQ Database Test Script
 * 
 * This script tests the CourtIQ database connectivity and operations
 * to ensure that data can be properly persisted and retrieved.
 * 
 * Run with: npx tsx test-courtiq-database.ts
 */

import { db } from "./server/db";
import { 
  courtiqUserRatings, 
  matchAssessments,
  type InsertCourtiqUserRating,
  type InsertMatchAssessment
} from "./shared/schema/courtiq";
import { eq } from "drizzle-orm";

async function testCourtIQDatabase() {
  try {
    console.log("Testing CourtIQ database connectivity...");
    
    // Test 1: Check if the database connection works
    console.log("\n1. Testing database connection...");
    try {
      const result = await db.execute(sql`SELECT 1 as test`);
      console.log("✅ Database connection successful:", result);
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      return;
    }
    
    // Test 2: Check if courtiq tables exist
    console.log("\n2. Checking CourtIQ tables...");
    try {
      const result = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE 'courtiq%' AND table_schema = 'public'
      `);
      console.log("Found CourtIQ tables:", result.rows);
      if (result.rows.length === 0) {
        console.log("❌ No CourtIQ tables found. Database schema might not be initialized.");
      } else {
        console.log("✅ CourtIQ tables exist");
      }
    } catch (error) {
      console.error("❌ Error checking CourtIQ tables:", error);
    }
    
    // Test 3: Try to get user ratings for userId=1
    console.log("\n3. Fetching CourtIQ user ratings for userId=1...");
    try {
      const ratings = await db
        .select()
        .from(courtiqUserRatings)
        .where(eq(courtiqUserRatings.userId, 1));
      
      if (ratings.length > 0) {
        console.log("✅ Found existing ratings:", ratings[0]);
      } else {
        console.log("ℹ️ No ratings found for userId=1. This is expected if no ratings have been created yet.");
        
        // Insert test ratings for userId=1
        console.log("\n4. Creating test ratings for userId=1...");
        try {
          const insertData: InsertCourtiqUserRating = {
            userId: 1,
            technicalRating: 4,
            tacticalRating: 3,
            physicalRating: 4,
            mentalRating: 3,
            consistencyRating: 4,
            overallRating: 1250,
            confidenceScore: 75,
            assessmentCount: 5,
            version: 1
          };
          
          const newRating = await db
            .insert(courtiqUserRatings)
            .values(insertData)
            .returning();
          
          console.log("✅ Successfully created test ratings:", newRating[0]);
        } catch (error) {
          console.error("❌ Error creating test ratings:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching user ratings:", error);
    }
    
    // Test 4: Check if we can fetch match assessments
    console.log("\n5. Fetching match assessments for userId=1...");
    try {
      const assessments = await db
        .select()
        .from(matchAssessments)
        .where(eq(matchAssessments.targetId, 1));
      
      if (assessments.length > 0) {
        console.log(`✅ Found ${assessments.length} assessments for userId=1`);
      } else {
        console.log("ℹ️ No assessments found for userId=1. This is expected if no assessments have been created.");
        
        // Insert a test assessment for userId=1
        console.log("\n6. Creating test assessment for userId=1...");
        try {
          const insertData: InsertMatchAssessment = {
            matchId: 1,
            assessorId: 1, // self-assessment
            targetId: 1,
            assessmentType: 'self',
            technicalRating: 4,
            tacticalRating: 3,
            physicalRating: 4,
            mentalRating: 3,
            consistencyRating: 4,
            notes: 'Test assessment created by database test script',
            isComplete: true
          };
          
          const newAssessment = await db
            .insert(matchAssessments)
            .values(insertData)
            .returning();
          
          console.log("✅ Successfully created test assessment:", newAssessment[0]);
        } catch (error) {
          console.error("❌ Error creating test assessment:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching match assessments:", error);
    }
    
    console.log("\nCourtIQ database test complete!");
  } catch (error) {
    console.error("Error in test script:", error);
  }
}

// Import sql from drizzle-orm
import { sql } from "drizzle-orm";

// Run the test function
testCourtIQDatabase()
  .then(() => {
    console.log("Test script completed.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Test script failed:", error);
    process.exit(1);
  });