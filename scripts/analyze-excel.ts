import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const filePath = 'attached_assets/bulk-match-template-bilingual-chinese (2)_1759643606952.xlsx';

console.log('📁 Reading Excel file:', filePath);
console.log('📏 File size:', (fs.statSync(filePath).size / 1024).toFixed(2), 'KB\n');

const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

console.log(`📋 Found ${workbook.SheetNames.length} tabs:`, workbook.SheetNames.join(', '), '\n');

interface ParsedMatch {
  tabName: string;
  rowNumber: number;
  player1: string;
  player2: string;
  player3?: string;
  player4?: string;
  team1Score: number;
  team2Score: number;
  matchDate: string;
  location: string;
  notes: string;
  isDoubles: boolean;
}

const allMatches: ParsedMatch[] = [];

for (const sheetName of workbook.SheetNames) {
  console.log(`📄 Processing tab: ${sheetName}`);
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`   📊 Found ${jsonData.length} rows`);
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i] as any;
    
    try {
      const player1 = row['Player 1'] || row['P1'] || row['Player1'] || row['第一队选手一护照码'] || row['选手一护照码'] || '';
      const player2 = row['Player 2'] || row['P2'] || row['Player2'] || row['第二队选手一护照码'] || row['选手二护照码'] || '';
      const player3 = row['Player 3'] || row['P3'] || row['Player3'] || row['第一队选手二护照码'] || '';
      const player4 = row['Player 4'] || row['P4'] || row['Player4'] || row['第二队选手二护照码'] || '';
      
      const score1 = row['Score 1'] || row['Team 1 Score'] || row['T1'] || row['第一队得分'] || 0;
      const score2 = row['Score 2'] || row['Team 2 Score'] || row['T2'] || row['第二队得分'] || 0;
      
      const matchDate = row['Date'] || row['Match Date'] || row['比赛日期'] || new Date().toISOString().split('T')[0];
      const location = row['Location'] || row['Court'] || row['场地'] || '';
      const notes = row['Notes'] || row['Comments'] || row['备注'] || '';
      
      if (!player1 || !player2) {
        continue;
      }
      
      const isDoubles = Boolean(player3 && player4);
      
      const parsedMatch: ParsedMatch = {
        tabName: sheetName,
        matchDate: typeof matchDate === 'string' ? matchDate : new Date().toISOString().split('T')[0],
        player1: player1.toString().toUpperCase(),
        player2: player2.toString().toUpperCase(),
        player3: player3 ? player3.toString().toUpperCase() : undefined,
        player4: player4 ? player4.toString().toUpperCase() : undefined,
        team1Score: Number(score1) || 0,
        team2Score: Number(score2) || 0,
        location: location.toString(),
        notes: notes.toString(),
        isDoubles,
        rowNumber: i + 2
      };
      
      allMatches.push(parsedMatch);
      
    } catch (error) {
      console.warn(`   ⚠️  Failed to parse row ${i + 2}:`, error);
    }
  }
  console.log('');
}

console.log(`\n✅ TOTAL PARSED MATCHES: ${allMatches.length}\n`);

const tabSummary = workbook.SheetNames.map(tabName => {
  const tabMatches = allMatches.filter(m => m.tabName === tabName);
  return {
    tabName,
    matchCount: tabMatches.length,
    singlesCount: tabMatches.filter(m => !m.isDoubles).length,
    doublesCount: tabMatches.filter(m => m.isDoubles).length
  };
});

console.log('📊 TAB BREAKDOWN:');
console.log('─'.repeat(80));
tabSummary.forEach(tab => {
  console.log(`${tab.tabName.padEnd(40)} | Total: ${tab.matchCount.toString().padStart(3)} | Singles: ${tab.singlesCount.toString().padStart(3)} | Doubles: ${tab.doublesCount.toString().padStart(3)}`);
});
console.log('─'.repeat(80));

const allPassportCodes = new Set<string>();
allMatches.forEach(match => {
  allPassportCodes.add(match.player1);
  allPassportCodes.add(match.player2);
  if (match.player3) allPassportCodes.add(match.player3);
  if (match.player4) allPassportCodes.add(match.player4);
});

console.log(`\n👥 UNIQUE PASSPORT CODES: ${allPassportCodes.size}`);
console.log('Players:', Array.from(allPassportCodes).sort().join(', '));

console.log('\n\n📋 DETAILED MATCH LIST:');
console.log('='.repeat(120));

allMatches.forEach((match, i) => {
  const winner = match.team1Score > match.team2Score ? 'Team 1' : 'Team 2';
  console.log(`\nMatch #${i + 1} [${match.tabName}] - Row ${match.rowNumber} - ${match.isDoubles ? 'DOUBLES' : 'SINGLES'}`);
  console.log(`  Team 1: ${match.player1}${match.player3 ? ' & ' + match.player3 : ''} - Score: ${match.team1Score}`);
  console.log(`  Team 2: ${match.player2}${match.player4 ? ' & ' + match.player4 : ''} - Score: ${match.team2Score}`);
  console.log(`  Winner: ${winner} | Date: ${match.matchDate} | Location: ${match.location}`);
  if (match.notes) console.log(`  Notes: ${match.notes}`);
});

console.log('\n\n' + '='.repeat(120));
console.log(`\n🎯 SUMMARY:`);
console.log(`  Total Tabs: ${workbook.SheetNames.length}`);
console.log(`  Total Matches: ${allMatches.length}`);
console.log(`  Singles Matches: ${allMatches.filter(m => !m.isDoubles).length}`);
console.log(`  Doubles Matches: ${allMatches.filter(m => m.isDoubles).length}`);
console.log(`  Unique Players: ${allPassportCodes.size}`);
console.log(`\n✨ Analysis Complete!`);
