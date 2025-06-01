/**
 * Create Proper Multi-Event Tournament with Correct Database Structure
 * Uses the parent_tournaments table for parent and tournaments table for children
 */

import { db } from './server/db';
import { tournaments, parentTournaments } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createProperMultiEvent() {
  console.log('🏆 Creating Proper Multi-Event Tournament Structure');
  console.log('==================================================\n');
  
  try {
    // Step 1: Create parent tournament in parent_tournaments table
    console.log('📝 Step 1: Creating Parent Tournament in parent_tournaments table');
    const [parentTournament] = await db.insert(parentTournaments).values({
      name: "2025 National Championship Series",
      description: "Multi-division national championship featuring men's, women's, and mixed divisions with comprehensive competition structure",
      location: "National Tennis Center, Vancouver",
      startDate: new Date('2025-08-15'),
      endDate: new Date('2025-08-17'),
      registrationStartDate: new Date('2025-06-01'),
      registrationEndDate: new Date('2025-08-01'),
      organizer: 'Pickleball Canada',
      status: 'upcoming',
      isTestData: false
    }).returning();
    
    console.log(`✓ Parent tournament created with ID: ${parentTournament.id}`);
    console.log(`✓ Name: ${parentTournament.name}`);
    
    // Step 2: Create child tournaments in tournaments table with proper parent reference
    console.log('\n📝 Step 2: Creating Child Tournaments');
    const childTournaments = [
      {
        name: "2025 National Championship Series - Men's Open",
        description: "Men's Open Division of the National Championship Series",
        category: "Open",
        division: "Men's",
        maxParticipants: 64,
        entryFee: 150
      },
      {
        name: "2025 National Championship Series - Women's Open", 
        description: "Women's Open Division of the National Championship Series",
        category: "Open", 
        division: "Women's",
        maxParticipants: 64,
        entryFee: 150
      },
      {
        name: "2025 National Championship Series - Mixed 4.5+",
        description: "Mixed 4.5+ Division of the National Championship Series", 
        category: "4.5+",
        division: "Mixed",
        maxParticipants: 48,
        entryFee: 120
      },
      {
        name: "2025 National Championship Series - Mixed 4.0",
        description: "Mixed 4.0 Division of the National Championship Series",
        category: "4.0", 
        division: "Mixed",
        maxParticipants: 48,
        entryFee: 120
      }
    ];
    
    const createdChildren = [];
    
    for (const child of childTournaments) {
      const [tournament] = await db.insert(tournaments).values({
        name: child.name,
        description: child.description,
        startDate: parentTournament.startDate,
        endDate: parentTournament.endDate,
        location: parentTournament.location,
        format: 'Double Elimination',
        category: child.category,
        division: child.division,
        level: 'national',
        maxParticipants: child.maxParticipants,
        registrationFee: child.entryFee,
        isPublic: true,
        allowWaitlist: true,
        requireApproval: false,
        emailNotifications: true,
        status: 'upcoming',
        isTestData: false,
        parentTournamentId: parentTournament.id, // This should now work!
        organizer: parentTournament.organizer,
        contactEmail: 'admin@pickleballcanada.ca'
      }).returning();
      
      createdChildren.push(tournament);
      console.log(`✓ Child tournament created: ${tournament.name} (ID: ${tournament.id})`);
    }
    
    console.log('\n🎉 Multi-Event Tournament Created Successfully!');
    console.log('=============================================');
    console.log(`✅ Parent Tournament ID: ${parentTournament.id}`);
    console.log(`✅ Child Tournaments Created: ${createdChildren.length}`);
    console.log(`✅ Total Participants: ${createdChildren.reduce((sum, t) => sum + (t.maxParticipants || 0), 0)}`);
    console.log('\n🔗 Hierarchical Structure:');
    console.log(`   📁 ${parentTournament.name}`);
    createdChildren.forEach(child => {
      console.log(`   ├── 🏆 ${child.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating multi-event tournament:', error);
    throw error;
  }
}

// Run the creation
createProperMultiEvent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create multi-event tournament:', error);
    process.exit(1);
  });