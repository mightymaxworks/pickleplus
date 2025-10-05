import XLSX from 'xlsx';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const workbook = XLSX.readFile('attached_assets/9月第四周周赛成绩_1759638519282.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[str2.length][str1.length];
}

async function findMissingPlayers() {
  console.log('='.repeat(80));
  console.log('MISSING PLAYER PASSPORT CODE ANALYSIS');
  console.log('='.repeat(80));
  console.log('');
  
  // Collect all passport codes from Excel
  const excelCodes = new Set();
  const codeOccurrences = {};
  
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    const codes = [
      String(row[0] || '').trim(),
      String(row[1] || '').trim(),
      String(row[2] || '').trim(),
      String(row[3] || '').trim()
    ].filter(c => c && c.length > 0);
    
    codes.forEach(code => {
      excelCodes.add(code);
      codeOccurrences[code] = (codeOccurrences[code] || 0) + 1;
    });
  }
  
  console.log(`📋 Found ${excelCodes.size} unique passport codes in Excel file`);
  console.log('');
  
  // Get all passport codes from database
  const { rows: dbPlayers } = await pool.query(
    'SELECT passport_code, username, gender, date_of_birth FROM users WHERE passport_code IS NOT NULL ORDER BY passport_code'
  );
  
  const dbCodesMap = {};
  dbPlayers.forEach(p => {
    dbCodesMap[p.passport_code] = p;
  });
  
  console.log(`💾 Found ${dbPlayers.length} players with passport codes in database`);
  console.log('');
  
  // Find missing codes
  const missingCodes = Array.from(excelCodes).filter(code => !dbCodesMap[code]);
  
  console.log('='.repeat(80));
  console.log(`❌ MISSING PASSPORT CODES: ${missingCodes.length}`);
  console.log('='.repeat(80));
  console.log('');
  
  if (missingCodes.length === 0) {
    console.log('✅ All passport codes found in database!');
    await pool.end();
    return;
  }
  
  // Analyze each missing code
  for (const missingCode of missingCodes) {
    console.log(`${'─'.repeat(80)}`);
    console.log(`MISSING: ${missingCode}`);
    console.log(`Appears in Excel: ${codeOccurrences[missingCode]} time(s)`);
    console.log('');
    
    // Find similar codes in database
    const similarities = [];
    
    for (const dbCode of Object.keys(dbCodesMap)) {
      const distance = levenshteinDistance(
        missingCode.toUpperCase(), 
        dbCode.toUpperCase()
      );
      
      // Only show codes with distance <= 3
      if (distance > 0 && distance <= 3) {
        similarities.push({
          code: dbCode,
          distance: distance,
          player: dbCodesMap[dbCode]
        });
      }
    }
    
    // Sort by distance (closest first)
    similarities.sort((a, b) => a.distance - b.distance);
    
    if (similarities.length > 0) {
      console.log('💡 POSSIBLE MATCHES (by similarity):');
      console.log('');
      
      for (const match of similarities.slice(0, 5)) {
        const age = match.player.date_of_birth 
          ? new Date().getFullYear() - new Date(match.player.date_of_birth).getFullYear() 
          : '?';
        
        console.log(`   ${match.distance === 1 ? '🔥' : match.distance === 2 ? '⚡' : '✨'} ${match.code} (distance: ${match.distance})`);
        console.log(`      Player: ${match.player.username}`);
        console.log(`      Gender: ${match.player.gender || 'unknown'} | Age: ${age}`);
        
        // Show character differences
        if (match.distance <= 2) {
          const diff = findDifferences(missingCode.toUpperCase(), match.code.toUpperCase());
          console.log(`      Difference: ${diff}`);
        }
        console.log('');
      }
    } else {
      console.log('❌ No similar passport codes found in database');
      console.log('   This appears to be a completely new/unregistered player');
      console.log('');
    }
  }
  
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total codes in Excel: ${excelCodes.size}`);
  console.log(`Found in database: ${excelCodes.size - missingCodes.length}`);
  console.log(`Missing from database: ${missingCodes.length}`);
  console.log('');
  console.log('Legend: 🔥 = 1 char difference | ⚡ = 2 chars | ✨ = 3 chars');
  console.log('='.repeat(80));
  
  await pool.end();
}

function findDifferences(str1, str2) {
  if (str1.length !== str2.length) {
    return `Length differs (${str1.length} vs ${str2.length})`;
  }
  
  const diffs = [];
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      diffs.push(`position ${i}: '${str1[i]}' → '${str2[i]}'`);
    }
  }
  
  return diffs.length > 0 ? diffs.join(', ') : 'Same length, multiple edits needed';
}

findMissingPlayers().catch(console.error);
