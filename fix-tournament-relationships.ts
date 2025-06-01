/**
 * Fix Tournament Parent-Child Relationships
 * Updates the database to properly set parent-child relationships for multi-event tournaments
 */

import { db } from './server/db';
import { tournaments } from './shared/schema';
import { eq } from 'drizzle-orm';

async function fixParentChildRelationships() {
  console.log('🔧 Fixing parent-child relationships...');
  
  try {
    // Update child tournaments to point to parent tournament ID 54
    const updates = [
      { id: 55, parentId: 54, name: "Men's Open" },
      { id: 56, parentId: 54, name: "Women's Open" },  
      { id: 57, parentId: 54, name: "Mixed 4.0+" },
      { id: 58, parentId: 54, name: "Mixed 3.5" }
    ];
    
    for (const update of updates) {
      await db.update(tournaments)
        .set({ parentTournamentId: update.parentId })
        .where(eq(tournaments.id, update.id));
      console.log(`✓ Updated tournament ${update.id} (${update.name}) to have parent ${update.parentId}`);
    }
    
    // Set parent tournament as multi-event
    await db.update(tournaments)
      .set({ isMultiEvent: true })
      .where(eq(tournaments.id, 54));
    console.log('✓ Set tournament 54 as multi-event parent');
    
    console.log('\n🎉 Relationships fixed successfully!');
    console.log('The hierarchical view should now properly display the parent-child structure.');
    
  } catch (error) {
    console.error('❌ Error fixing relationships:', error);
    throw error;
  }
}

// Run the fix
fixParentChildRelationships()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to fix relationships:', error);
    process.exit(1);
  });