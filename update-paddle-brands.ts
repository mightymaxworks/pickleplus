/**
 * Update Paddle Brand Dropdowns Script
 * Replaces all hardcoded paddle brand options with centralized list featuring SHOT3 prominently
 */

import * as fs from 'fs';
import * as path from 'path';

const filesToUpdate = [
  'client/src/components/profile/modern/ProfileDetailsTab.tsx',
  'client/src/components/profile/streamlined/tabs/ProfileEquipmentTab.tsx',
  'client/src/pages/ProfileEdit.tsx'
];

const oldBrandOptionsPattern = /const brandOptions = \[\s*[\s\S]*?\];/g;
const newBrandOptions = 'const brandOptions = PADDLE_BRAND_OPTIONS;';

const paddleBrandImport = `import { PADDLE_BRAND_OPTIONS } from '@/constants/paddleBrands';`;

function updateFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not present
  if (!content.includes('PADDLE_BRAND_OPTIONS')) {
    const importIndex = content.indexOf('import');
    if (importIndex !== -1) {
      const firstImportEnd = content.indexOf('\n', importIndex);
      content = content.slice(0, firstImportEnd + 1) + paddleBrandImport + '\n' + content.slice(firstImportEnd + 1);
    }
  }
  
  // Replace hardcoded brand options
  content = content.replace(oldBrandOptionsPattern, newBrandOptions);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

function main() {
  console.log('Updating paddle brand dropdowns to use centralized list with SHOT3 prominently featured...');
  
  filesToUpdate.forEach(updateFile);
  
  console.log('All paddle brand dropdowns updated successfully!');
}

if (require.main === module) {
  main();
}