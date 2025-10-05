import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'attached_assets/bulk-match-template-bilingual-chinese (2)_1759643606952.xlsx';
const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

console.log('Checking first few tabs for column headers:\n');

for (const sheetName of workbook.SheetNames.slice(0, 3)) {
  console.log(`\n📄 Tab: ${sheetName}`);
  console.log('─'.repeat(80));
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  if (jsonData.length > 0) {
    const firstRow = jsonData[0] as any;
    console.log('Column headers:');
    Object.keys(firstRow).forEach(key => {
      console.log(`  - "${key}": ${firstRow[key]}`);
    });
    
    console.log('\nFirst 3 rows of data:');
    jsonData.slice(0, 3).forEach((row: any, i) => {
      console.log(`\nRow ${i + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    });
  }
}
