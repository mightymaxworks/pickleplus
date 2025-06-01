/**
 * Fix Parent Tournament Constraint
 * Remove the foreign key constraint and update parent references to use tournaments table
 */

import { db } from './server/db';
import { tournaments } from './shared/schema';
import { eq } from 'drizzle-orm';

async function fixParentConstraint() {
  console.log('🔧 Fixing Parent Tournament Constraint');
  console.log('====================================\n');
  
  try {
    // Step 1: Drop the foreign key constraint using raw SQL
    console.log('📝 Step 1: Dropping foreign key constraint');
    await db.execute(`ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_parent_tournament_id_fkey;`);
    console.log('✓ Foreign key constraint dropped');
    
    // Step 2: Update existing child tournaments to point to tournament table instead
    console.log('\n📝 Step 2: Converting existing parent references');
    
    // Find the parent tournament from parent_tournaments table
    const parentResult = await db.execute(`SELECT id, name FROM parent_tournaments WHERE id = 1;`);
    if (parentResult.rows.length > 0) {
      const parentData = parentResult.rows[0] as any;
      console.log(`Found parent tournament: ${parentData.name} (ID: ${parentData.id})`);
      
      // Create equivalent parent tournament in tournaments table
      const [newParent] = await db.insert(tournaments).values({
        name: parentData.name,
        description: 'Multi-event tournament parent',
        location: 'National Tennis Center, Vancouver',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-17'),
        registrationStartDate: new Date('2025-06-01'),
        registrationEndDate: new Date('2025-08-01'),
        format: 'Multi-Event Tournament',
        category: 'Multi-Division',
        division: 'All',
        level: 'national',
        organizer: 'Pickleball Canada',
        contactEmail: 'admin@pickleballcanada.ca',
        status: 'upcoming',
        isParent: true,
        isSubEvent: false,
        isTestData: false
      }).returning();
      
      console.log(`✓ Created new parent tournament in tournaments table: ID ${newParent.id}`);
      
      // Update child tournaments to point to new parent
      await db.update(tournaments)
        .set({ parentTournamentId: newParent.id })
        .where(eq(tournaments.parentTournamentId, 1));
      
      console.log(`✓ Updated child tournaments to point to new parent ID ${newParent.id}`);
    }
    
    console.log('\n🎉 Constraint Fix Complete!');
    console.log('Now you can create multi-event tournaments using only the tournaments table.');
    
  } catch (error) {
    console.error('❌ Error fixing constraint:', error);
    throw error;
  }
}

// Run the fix
fixParentConstraint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to fix constraint:', error);
    process.exit(1);
  });