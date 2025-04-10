/**
 * PKL-278651-GAME-0005-GOLD-ENH
 * Golden Ticket File Upload Enhancement Migration
 * 
 * This script adds the necessary fields to the database for file uploads functionality.
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';

/**
 * Main migration function
 */
export async function migrateFileUploadFields(): Promise<void> {
  console.log('Starting migration for file upload fields...');

  try {
    // Check if the columns already exist in sponsors table
    const sponsorColumns = await getTableColumns('sponsors');
    if (!sponsorColumns.includes('logo_path')) {
      console.log('Adding logo_path column to sponsors table...');
      await db.execute(sql`ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS logo_path TEXT`);
    }

    // Check if the columns already exist in golden_tickets table
    const ticketColumns = await getTableColumns('golden_tickets');
    if (!ticketColumns.includes('promotional_image_url')) {
      console.log('Adding promotional_image_url column to golden_tickets table...');
      await db.execute(sql`ALTER TABLE golden_tickets ADD COLUMN IF NOT EXISTS promotional_image_url TEXT`);
    }
    
    if (!ticketColumns.includes('promotional_image_path')) {
      console.log('Adding promotional_image_path column to golden_tickets table...');
      await db.execute(sql`ALTER TABLE golden_tickets ADD COLUMN IF NOT EXISTS promotional_image_path TEXT`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Get column names for a table
 */
async function getTableColumns(tableName: string): Promise<string[]> {
  const result = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName}
  `);
  
  return result.rows.map((row: any) => row.column_name);
}

// Run migration if this script is executed directly
if (process.argv[1].includes('golden-ticket-file-upload-migration.ts')) {
  migrateFileUploadFields()
    .then(() => {
      console.log('File upload migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('File upload migration failed:', error);
      process.exit(1);
    });
}