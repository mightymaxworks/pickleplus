/**
 * Update Technical Skills Schema for Enhanced Groundstrokes and Net Play Assessment
 * 
 * This script adds detailed breakdown fields for:
 * - Groundstrokes: Forehand/Backhand Top Spin and Slice
 * - Net Play: 12 specific dink and volley techniques
 * 
 * Run with: npx tsx update-technical-skills-schema.ts
 */

import { db } from './server/db';

async function updateTechnicalSkillsSchema() {
  console.log('🔄 Starting technical skills schema update...');

  try {
    // Add new groundstroke breakdown columns
    await db.execute(`
      ALTER TABLE pcp_skill_assessments 
      ADD COLUMN IF NOT EXISTS forehand_topspin DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS forehand_slice DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS backhand_topspin DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS backhand_slice DECIMAL(3,2)
    `);
    console.log('✅ Added groundstroke breakdown columns');

    // Add new net play breakdown columns
    await db.execute(`
      ALTER TABLE pcp_skill_assessments 
      ADD COLUMN IF NOT EXISTS forehand_dead_dink DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS forehand_topspin_dink DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS forehand_slice_dink DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS backhand_dead_dink DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS backhand_topspin_dink DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS backhand_slice_dink DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS forehand_block_volley DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS forehand_drive_volley DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS forehand_dink_volley DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS backhand_block_volley DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS backhand_drive_volley DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS backhand_dink_volley DECIMAL(3,2)
    `);
    console.log('✅ Added net play breakdown columns');

    // Verify the new columns exist
    const tableInfo = await db.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pcp_skill_assessments' 
      AND column_name IN (
        'forehand_topspin', 'forehand_slice', 'backhand_topspin', 'backhand_slice',
        'forehand_dead_dink', 'forehand_topspin_dink', 'forehand_slice_dink',
        'backhand_dead_dink', 'backhand_topspin_dink', 'backhand_slice_dink',
        'forehand_block_volley', 'forehand_drive_volley', 'forehand_dink_volley',
        'backhand_block_volley', 'backhand_drive_volley', 'backhand_dink_volley'
      )
      ORDER BY column_name
    `);

    console.log('📊 New technical skill columns added:');
    console.table(tableInfo.rows);

    console.log('🎯 Technical skills schema update completed successfully!');
    console.log('📝 Added 16 new skill assessment fields:');
    console.log('   - 4 Groundstroke variations');
    console.log('   - 12 Net play techniques');

  } catch (error) {
    console.error('❌ Error updating technical skills schema:', error);
    throw error;
  }
}

// Execute the schema update
updateTechnicalSkillsSchema()
  .then(() => {
    console.log('✅ Schema update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  });