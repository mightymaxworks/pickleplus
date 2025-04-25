/**
 * PKL-278651-SCHEMA-0002-BACKUP - Schema Backup Utility
 * 
 * This script creates timestamped backups of schema files before they are modified
 * to prevent data loss and enable quick recovery if needed.
 * 
 * @framework Framework5.3
 * @module schema-backup
 * @version 1.0.0
 * @dependencies fs, path
 * @provides schema-backup
 * @last-modified 2025-04-25
 * @modified-by DevTeam
 */

import fs from 'fs';
import path from 'path';

/**
 * Creates a timestamped backup of a schema file
 * @param filePath Path to the file to backup
 * @returns Path to the backup file or null if backup failed
 */
export function backupSchemaFile(filePath: string): string | null {
  try {
    // Create a timestamp for unique backup naming
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups/schema');
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Extract filename from path
    const fileName = path.basename(filePath);
    const backupPath = path.join(backupDir, `${fileName}.${timestamp}.bak`);
    
    // Check if source file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return null;
    }
    
    // Create the backup
    fs.copyFileSync(filePath, backupPath);
    console.log(`✅ Created backup: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return null;
  }
}

/**
 * Restores a schema file from a backup
 * @param backupPath Path to the backup file
 * @param targetPath Path where the file should be restored
 * @returns boolean indicating success or failure
 */
export function restoreSchemaFromBackup(backupPath: string, targetPath: string): boolean {
  try {
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup file not found: ${backupPath}`);
      return false;
    }
    
    fs.copyFileSync(backupPath, targetPath);
    console.log(`✅ Restored file from backup: ${targetPath}`);
    return true;
  } catch (error) {
    console.error('❌ Restore failed:', error);
    return false;
  }
}

/**
 * Backs up all schema files in the shared/schema directory
 * @returns Array of backup file paths or empty array if backup failed
 */
export function backupAllSchemaFiles(): string[] {
  try {
    const schemaDir = path.join(process.cwd(), 'shared/schema');
    if (!fs.existsSync(schemaDir)) {
      console.error(`❌ Schema directory not found: ${schemaDir}`);
      return [];
    }
    
    const schemaFiles = fs.readdirSync(schemaDir).filter(file => file.endsWith('.ts'));
    const backupPaths: string[] = [];
    
    schemaFiles.forEach(file => {
      const filePath = path.join(schemaDir, file);
      const backupPath = backupSchemaFile(filePath);
      if (backupPath) {
        backupPaths.push(backupPath);
      }
    });
    
    console.log(`✅ Backed up ${backupPaths.length} schema files`);
    return backupPaths;
  } catch (error) {
    console.error('❌ Backup of all schema files failed:', error);
    return [];
  }
}

// When executed directly, backup all schema files
if (require.main === module) {
  console.log('Running schema backup...');
  
  // If filename is provided as argument, backup only that file
  if (process.argv.length > 2) {
    const filePath = process.argv[2];
    console.log(`Backing up specific file: ${filePath}`);
    backupSchemaFile(filePath);
  } else {
    // Otherwise backup all schema files
    console.log('Backing up all schema files...');
    backupAllSchemaFiles();
  }
}