/**
 * PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
 * Script to create test events in the database
 * Run with: npx tsx scripts/create-test-events.ts
 */

import { db } from "../server/db";
import { events } from "../shared/schema/events";

async function createTestEvents() {
  try {
    console.log("[Script] Creating test events...");

    // Create a test event
    const event = await db.insert(events).values({
      name: 'Pickle+ Demo Tournament',
      description: 'A demo tournament for testing the Event Check-in System',
      location: 'Main Pickleball Courts',
      startDateTime: new Date(Date.now() + 86400000), // Tomorrow
      endDateTime: new Date(Date.now() + 172800000), // Day after tomorrow
      maxAttendees: 32,
      organizerId: 1, // Assuming user ID 1 exists
      isPrivate: false,
      requiresCheckIn: true,
      checkInCode: 'DEMO23',
      eventType: 'tournament',
      status: 'upcoming'
    }).returning();
    
    console.log('[Script] Test event created:', event);
    
    // Create another test event
    const event2 = await db.insert(events).values({
      name: 'Pickle+ Skills Workshop',
      description: 'Learn advanced pickleball techniques',
      location: 'Training Center',
      startDateTime: new Date(Date.now() + 259200000), // 3 days from now
      endDateTime: new Date(Date.now() + 266400000), // 3 days + 2 hours from now
      maxAttendees: 20,
      organizerId: 1, // Assuming user ID 1 exists
      isPrivate: false,
      requiresCheckIn: true,
      checkInCode: 'SKILL42',
      eventType: 'workshop',
      status: 'upcoming'
    }).returning();
    
    console.log('[Script] Second test event created:', event2);
    
    // Create a past event
    const pastEvent = await db.insert(events).values({
      name: 'Pickle+ Past Tournament',
      description: 'A past tournament for testing',
      location: 'Community Center',
      startDateTime: new Date(Date.now() - 172800000), // 2 days ago
      endDateTime: new Date(Date.now() - 86400000), // Yesterday
      maxAttendees: 24,
      organizerId: 1, // Assuming user ID 1 exists
      isPrivate: false,
      requiresCheckIn: true,
      checkInCode: 'PAST12',
      eventType: 'tournament',
      status: 'completed'
    }).returning();
    
    console.log('[Script] Past event created:', pastEvent);
    
    console.log('[Script] All test events created successfully!');
  } catch (error) {
    console.error('[Script] Error creating test events:', error);
  }
}

createTestEvents()
  .then(() => {
    console.log('[Script] Script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('[Script] Error running script:', error);
    process.exit(1);
  });