/**
 * Comprehensive Technical Skills Schema Update
 * Adds proper breakdown of all technical skills with accurate categorization
 */

import postgres from 'postgres';

async function updateComprehensiveTechnicalSkillsSchema() {
  console.log('Starting comprehensive technical skills schema update...');

  try {
    const sql = postgres(process.env.DATABASE_URL!);

    // Drop and recreate with comprehensive technical breakdown
    await sql`
      ALTER TABLE pcp_skill_assessments 
      DROP COLUMN IF EXISTS overhead_defense
    `;

    await sql`
      ALTER TABLE pcp_skill_assessments 
      ADD COLUMN IF NOT EXISTS forehand_smash DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS backhand_smash DECIMAL(3,1) DEFAULT 2.0,
      
      ADD COLUMN IF NOT EXISTS forehand_return_cross_court DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS forehand_return_down_line DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS backhand_return_cross_court DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS backhand_return_down_line DECIMAL(3,1) DEFAULT 2.0,
      
      ADD COLUMN IF NOT EXISTS forehand_easy_drop_shot DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS forehand_topspin_drop_shot DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS forehand_slice_drop_shot DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS backhand_easy_drop_shot DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS backhand_topspin_drop_shot DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS backhand_slice_drop_shot DECIMAL(3,1) DEFAULT 2.0,
      
      ADD COLUMN IF NOT EXISTS forehand_lob DECIMAL(3,1) DEFAULT 2.0,
      ADD COLUMN IF NOT EXISTS backhand_lob DECIMAL(3,1) DEFAULT 2.0
    `;

    console.log('✅ Database schema updated with comprehensive technical skills');

    // Update existing records to have default values for new fields
    await sql`
      UPDATE pcp_skill_assessments 
      SET 
        forehand_smash = COALESCE(forehand_smash, 2.0),
        backhand_smash = COALESCE(backhand_smash, 2.0),
        forehand_return_cross_court = COALESCE(forehand_return_cross_court, 2.0),
        forehand_return_down_line = COALESCE(forehand_return_down_line, 2.0),
        backhand_return_cross_court = COALESCE(backhand_return_cross_court, 2.0),
        backhand_return_down_line = COALESCE(backhand_return_down_line, 2.0),
        forehand_easy_drop_shot = COALESCE(forehand_easy_drop_shot, 2.0),
        forehand_topspin_drop_shot = COALESCE(forehand_topspin_drop_shot, 2.0),
        forehand_slice_drop_shot = COALESCE(forehand_slice_drop_shot, 2.0),
        backhand_easy_drop_shot = COALESCE(backhand_easy_drop_shot, 2.0),
        backhand_topspin_drop_shot = COALESCE(backhand_topspin_drop_shot, 2.0),
        backhand_slice_drop_shot = COALESCE(backhand_slice_drop_shot, 2.0),
        forehand_lob = COALESCE(forehand_lob, 2.0),
        backhand_lob = COALESCE(backhand_lob, 2.0)
    `;

    console.log('✅ Updated existing assessment records with new fields');

    await sql.end();

  } catch (error) {
    console.error('❌ Error updating comprehensive technical skills schema:', error);
    throw error;
  }
}

updateComprehensiveTechnicalSkillsSchema()
  .then(() => {
    console.log('Comprehensive technical skills schema update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to update comprehensive technical skills schema:', error);
    process.exit(1);
  });

export { updateComprehensiveTechnicalSkillsSchema };