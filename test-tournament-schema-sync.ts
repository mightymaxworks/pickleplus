/**
 * Test Tournament Schema Synchronization
 * 
 * This script identifies and fixes all snake_case vs camelCase mismatches
 * between the tournament form data and database schema.
 */

import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function testTournamentSchemaSync() {
  console.log("🔍 Testing tournament schema synchronization...");
  
  // Get all database columns
  const dbColumnsResult = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'tournaments' 
    ORDER BY column_name
  `);
  
  const dbColumns = dbColumnsResult.rows.map(row => row.column_name);
  console.log("\n📊 Database columns:", dbColumns);
  
  // Expected form fields from the CreateTournamentForm
  const formFields = [
    'name',
    'description', 
    'location',
    'venueAddress',
    'numberOfCourts',
    'courtSurface',
    'startDate',
    'endDate',
    'registrationStartDate', 
    'registrationEndDate',
    'maxParticipants',
    'minParticipants',
    'format',
    'category',
    'division',
    'level',
    'minRating',
    'maxRating',
    'entryFee',
    'earlyBirdFee',
    'lateRegistrationFee',
    'prizePool',
    'organizer',
    'contactEmail',
    'contactPhone',
    'status'
  ];
  
  console.log("\n📝 Form fields:", formFields);
  
  // Map camelCase to snake_case
  const fieldMapping = {
    'venueAddress': 'venue_address',
    'numberOfCourts': 'number_of_courts', 
    'courtSurface': 'court_surface',
    'startDate': 'start_date',
    'endDate': 'end_date',
    'registrationStartDate': 'registration_start_date',
    'registrationEndDate': 'registration_end_date',
    'maxParticipants': 'max_participants',
    'minParticipants': 'min_participants',
    'minRating': 'min_rating',
    'maxRating': 'max_rating',
    'entryFee': 'entry_fee',
    'earlyBirdFee': 'early_bird_fee',
    'lateRegistrationFee': 'late_registration_fee',
    'prizePool': 'prize_pool',
    'contactEmail': 'contact_email',
    'contactPhone': 'contact_phone'
  };
  
  // Check for missing columns
  const missingColumns = [];
  
  for (const formField of formFields) {
    const dbField = fieldMapping[formField] || formField;
    if (!dbColumns.includes(dbField)) {
      missingColumns.push({ formField, dbField });
    }
  }
  
  console.log("\n❌ Missing database columns:");
  missingColumns.forEach(({ formField, dbField }) => {
    console.log(`  ${formField} → ${dbField}`);
  });
  
  // Add missing columns
  for (const { formField, dbField } of missingColumns) {
    try {
      let columnDef = 'TEXT';
      
      if (formField.includes('Date')) {
        columnDef = 'TIMESTAMP';
      } else if (['numberOfCourts', 'maxParticipants', 'minParticipants', 'minRating', 'maxRating', 'entryFee', 'earlyBirdFee', 'lateRegistrationFee', 'prizePool'].includes(formField)) {
        columnDef = 'INTEGER';
      }
      
      await db.execute(sql.raw(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS ${dbField} ${columnDef}`));
      console.log(`✅ Added column: ${dbField} (${columnDef})`);
    } catch (error) {
      console.error(`❌ Failed to add column ${dbField}:`, error);
    }
  }
  
  // Test tournament creation with proper field mapping
  console.log("\n🧪 Testing tournament creation...");
  
  const testTournamentData = {
    name: 'Test Tournament Schema Sync',
    description: 'Testing field mapping',
    location: 'Test Location',
    venue_address: '123 Test Street',
    number_of_courts: 4,
    court_surface: 'indoor',
    start_date: new Date('2025-07-01'),
    end_date: new Date('2025-07-02'),
    registration_start_date: new Date('2025-06-01'),
    registration_end_date: new Date('2025-06-30'),
    max_participants: 32,
    min_participants: 8,
    format: 'doubles',
    category: 'doubles',
    division: 'open',
    level: 'club',
    min_rating: 3.0,
    max_rating: 5.0,
    entry_fee: 5000, // $50.00 in cents
    early_bird_fee: 4000, // $40.00 in cents
    late_registration_fee: 1000, // $10.00 in cents
    prize_pool: 20000, // $200.00 in cents
    organizer: 'Test Organizer',
    contact_email: 'test@example.com',
    contact_phone: '555-0123',
    status: 'upcoming'
  };
  
  try {
    const result = await db.execute(sql`
      INSERT INTO tournaments (${sql.raw(Object.keys(testTournamentData).join(', '))})
      VALUES (${sql.raw(Object.values(testTournamentData).map(v => typeof v === 'string' ? `'${v}'` : v).join(', '))})
      RETURNING id, name
    `);
    
    console.log("✅ Test tournament created successfully:", result);
    
    // Clean up test data
    await db.execute(sql`DELETE FROM tournaments WHERE name = 'Test Tournament Schema Sync'`);
    console.log("🧹 Test data cleaned up");
    
  } catch (error) {
    console.error("❌ Tournament creation failed:", error);
  }
  
  console.log("\n✅ Tournament schema synchronization test complete!");
}

// Run the test
testTournamentSchemaSync().catch(console.error);