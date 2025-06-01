/**
 * Create Multi-Event Tournament Using Single Table Approach
 * Uses only the tournaments table with isParent/isSubEvent fields
 */

import { db } from './server/db';
import { tournaments } from './shared/schema';
import { eq } from 'drizzle-orm';

async function createSingleTableMultiEvent() {
  console.log('🏆 Creating Single-Table Multi-Event Tournament');
  console.log('==============================================\n');
  
  try {
    // Step 1: Create parent tournament in tournaments table
    console.log('📝 Step 1: Creating Parent Tournament');
    const [parentTournament] = await db.insert(tournaments).values({
      name: "2025 Provincial Championship Series",
      description: "Multi-division provincial championship featuring comprehensive competition across all skill levels",
      location: "Provincial Sports Complex, Toronto",
      startDate: new Date('2025-09-20'),
      endDate: new Date('2025-09-22'),
      registrationStartDate: new Date('2025-07-01'),
      registrationEndDate: new Date('2025-09-01'),
      format: 'Multi-Event Tournament',
      category: 'Multi-Division',
      division: 'All',
      level: 'provincial',
      organizer: 'Pickleball Ontario',
      contactEmail: 'admin@pickleballontario.ca',
      contactPhone: '416-555-0123',
      status: 'upcoming',
      isParent: true,        // Mark as parent tournament
      isSubEvent: false,     // Parent is not a sub-event
      isTestData: false
    }).returning();
    
    console.log(`✓ Parent tournament created with ID: ${parentTournament.id}`);
    console.log(`✓ Name: ${parentTournament.name}`);
    
    // Step 2: Create child tournaments with proper parent reference
    console.log('\n📝 Step 2: Creating Child Tournaments');
    const childTournaments = [
      {
        name: "2025 Provincial Championship Series - Men's Open",
        description: "Men's Open Division - Elite Level Competition",
        category: "Singles",
        division: "Men's Open",
        maxParticipants: 32,
        entryFee: 125
      },
      {
        name: "2025 Provincial Championship Series - Women's Open", 
        description: "Women's Open Division - Elite Level Competition",
        category: "Singles", 
        division: "Women's Open",
        maxParticipants: 32,
        entryFee: 125
      },
      {
        name: "2025 Provincial Championship Series - Mixed Doubles 4.5+",
        description: "Mixed Doubles 4.5+ Division", 
        category: "Mixed Doubles",
        division: "4.5+",
        maxParticipants: 24,
        entryFee: 100
      },
      {
        name: "2025 Provincial Championship Series - Mixed Doubles 4.0",
        description: "Mixed Doubles 4.0 Division",
        category: "Mixed Doubles", 
        division: "4.0",
        maxParticipants: 24,
        entryFee: 100
      },
      {
        name: "2025 Provincial Championship Series - Seniors 50+",
        description: "Seniors 50+ Division",
        category: "Doubles", 
        division: "Seniors 50+",
        maxParticipants: 20,
        entryFee: 85
      }
    ];
    
    const createdChildren = [];
    
    for (const child of childTournaments) {
      const [tournament] = await db.insert(tournaments).values({
        name: child.name,
        description: child.description,
        startDate: parentTournament.startDate,
        endDate: parentTournament.endDate,
        registrationStartDate: parentTournament.registrationStartDate,
        registrationEndDate: parentTournament.registrationEndDate,
        location: parentTournament.location,
        format: 'Double Elimination',
        category: child.category,
        division: child.division,
        level: 'provincial',
        maxParticipants: child.maxParticipants,
        entryFee: child.entryFee,
        status: 'upcoming',
        organizer: parentTournament.organizer,
        contactEmail: parentTournament.contactEmail,
        contactPhone: parentTournament.contactPhone,
        parentTournamentId: parentTournament.id,  // Link to parent
        isParent: false,       // Child is not a parent
        isSubEvent: true,      // Mark as sub-event
        isTestData: false
      }).returning();
      
      createdChildren.push(tournament);
      console.log(`✓ Child tournament created: ${tournament.name} (ID: ${tournament.id})`);
    }
    
    console.log('\n🎉 Single-Table Multi-Event Tournament Created Successfully!');
    console.log('=========================================================');
    console.log(`✅ Parent Tournament ID: ${parentTournament.id}`);
    console.log(`✅ Child Tournaments Created: ${createdChildren.length}`);
    console.log(`✅ Total Participants: ${createdChildren.reduce((sum, t) => sum + (t.maxParticipants || 0), 0)}`);
    console.log('\n🔗 Hierarchical Structure:');
    console.log(`   📁 ${parentTournament.name}`);
    createdChildren.forEach(child => {
      console.log(`   ├── 🏆 ${child.name}`);
    });
    
    console.log('\n📊 Verification:');
    console.log(`   Parent Tournament (ID ${parentTournament.id}):`);
    console.log(`   - isParent: ${parentTournament.isParent}`);
    console.log(`   - isSubEvent: ${parentTournament.isSubEvent}`);
    console.log(`   - parentTournamentId: ${parentTournament.parentTournamentId}`);
    
  } catch (error) {
    console.error('❌ Error creating single-table multi-event tournament:', error);
    throw error;
  }
}

// Run the creation
createSingleTableMultiEvent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create single-table multi-event tournament:', error);
    process.exit(1);
  });