/**
 * PKL-278651-SCHEMA-0001-VALID - Schema Validation Script
 * 
 * This script validates that critical schema files contain essential patterns
 * to prevent accidental deletion or overwriting of database definitions.
 * 
 * @framework Framework5.3
 * @module schema-validation
 * @version 1.0.0
 * @dependencies fs, path
 * @provides schema-validation
 * @last-modified 2025-04-25
 * @modified-by DevTeam
 */

import fs from 'fs';
import path from 'path';

// Define critical patterns that must be present in schema files
const CRITICAL_PATTERNS = {
  // CourtIQ schema critical patterns
  'schema/courtiq.ts': [
    'pgTable', 
    'courtiqUserRatings', 
    'DimensionCode',
    'export const courtiqUserRatings',
    'export const courtiqRatingImpacts'
  ],
  
  // Matches schema critical patterns
  'schema/matches.ts': [
    'pgTable', 
    'matches', 
    'matchParticipants',
    'export const matches'
  ],
  
  // Users schema critical patterns
  'schema/users.ts': [
    'pgTable',
    'users',
    'export const users'
  ],
  
  // Add other critical schema files here
};

/**
 * Validates that all critical schema files contain required patterns
 * @returns boolean - Whether all validations passed
 */
function validateSchemaFiles(): boolean {
  console.log('🔍 Starting schema validation...');
  let hasErrors = false;
  
  // Check for each critical file
  Object.entries(CRITICAL_PATTERNS).forEach(([filePath, requiredPatterns]) => {
    const fullPath = path.join(process.cwd(), 'shared', filePath);
    console.log(`Checking: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Critical schema file missing: ${filePath}`);
      hasErrors = true;
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check each required pattern
    requiredPatterns.forEach(pattern => {
      if (!content.includes(pattern)) {
        console.error(`❌ Critical pattern missing: "${pattern}" in ${filePath}`);
        hasErrors = true;
      } else {
        console.log(`✅ Found pattern: "${pattern}" in ${filePath}`);
      }
    });
  });
  
  // Check for proper file headers
  const schemaDir = path.join(process.cwd(), 'shared/schema');
  if (fs.existsSync(schemaDir)) {
    const schemaFiles = fs.readdirSync(schemaDir).filter(file => file.endsWith('.ts'));
    
    schemaFiles.forEach(file => {
      const filePath = path.join(schemaDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verify file has a proper Framework header
      if (!content.includes('@framework Framework5.3')) {
        console.error(`❌ Missing framework header in ${file}`);
        hasErrors = true;
      }
      
      // Verify file has critical-component tag if it's a critical file
      if (Object.keys(CRITICAL_PATTERNS).some(criticalPath => criticalPath.endsWith(file))) {
        if (!content.includes('@critical-component true')) {
          console.error(`❌ Missing critical-component tag in ${file}`);
          hasErrors = true;
        }
      }
    });
  }
  
  if (hasErrors) {
    console.error('❌ Schema validation failed');
    return false;
  } else {
    console.log('✅ All schema validations passed');
    return true;
  }
}

// Run validation when script is executed directly
if (require.main === module) {
  const passed = validateSchemaFiles();
  if (!passed) {
    process.exit(1);
  }
}

export { validateSchemaFiles };