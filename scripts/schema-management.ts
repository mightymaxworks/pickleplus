/**
 * PKL-278651-SCHEMA-0003-MANAGE - Schema Management Script
 * 
 * This script provides a command-line interface to schema validation,
 * backups, and restoration to ensure schema integrity.
 * 
 * @framework Framework5.3
 * @module schema-management
 * @version 1.0.0
 * @dependencies backup-schema, validate-schema
 * @provides schema-management-cli
 * @last-modified 2025-04-25
 * @modified-by DevTeam
 */

import { validateSchemaFiles } from './validate-schema';
import { backupAllSchemaFiles, backupSchemaFile, restoreSchemaFromBackup } from './backup-schema';

/**
 * Shows the usage instructions for the schema management script
 */
function showUsage() {
  console.log(`
Schema Management CLI
====================

Usage: npx tsx scripts/schema-management.ts [command] [options]

Commands:
  validate           Validate all schema files
  backup             Backup all schema files
  backup-file [path] Backup a specific schema file
  restore [backup] [target]  Restore a schema file from backup
  help               Show this help message

Examples:
  npx tsx scripts/schema-management.ts validate
  npx tsx scripts/schema-management.ts backup
  npx tsx scripts/schema-management.ts backup-file shared/schema/courtiq.ts
  npx tsx scripts/schema-management.ts restore backups/schema/courtiq.ts.2025-04-25.bak shared/schema/courtiq.ts
  `);
}

/**
 * Runs the schema management script with the given command line arguments
 * @param args Command line arguments
 */
function run(args: string[]) {
  const command = args[0] || 'help';
  
  console.log('📋 Schema Management CLI');
  
  switch (command) {
    case 'validate':
      console.log('🔍 Validating schema files...');
      validateSchemaFiles();
      break;
      
    case 'backup':
      console.log('💾 Backing up all schema files...');
      backupAllSchemaFiles();
      break;
      
    case 'backup-file':
      const filePath = args[1];
      if (!filePath) {
        console.error('❌ Missing file path argument');
        showUsage();
        process.exit(1);
      }
      
      console.log(`💾 Backing up schema file: ${filePath}`);
      backupSchemaFile(filePath);
      break;
      
    case 'restore':
      const backupPath = args[1];
      const targetPath = args[2];
      
      if (!backupPath || !targetPath) {
        console.error('❌ Missing backup path or target path argument');
        showUsage();
        process.exit(1);
      }
      
      console.log(`♻️  Restoring from backup ${backupPath} to ${targetPath}`);
      restoreSchemaFromBackup(backupPath, targetPath);
      break;
      
    case 'help':
    default:
      showUsage();
      break;
  }
}

// When executed directly, run the CLI
if (require.main === module) {
  run(process.argv.slice(2));
}