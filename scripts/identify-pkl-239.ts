import * as XLSX from 'xlsx';
import fs from 'fs';
import { db } from '../server/db.js';
import { users } from '../shared/schema.js';

const COMPLETE_CORRECTIONS: Record<string, string> = {
  'FOGBAM': 'F0GBAM', 'VOR7AU': 'VQR7AU', 'A40DAZ': 'A4ODAZ',
  '5XKD06': '5XKDO6', 'PZGEOT': 'PZGE0T', '2L8TU0': '2L8TUO',
  'JN110L': 'JN11OL', 'W9YINQ': 'W9YJNQ', 'BCIOVC': 'BCI0VC',
  '4030L6': '4O3OL6', 'PKL-000238': 'OUNSK4', 'PKL-000249': 'LT57DN'
};

function applyCorrection(code: string): string {
  return COMPLETE_CORRECTIONS[code.toUpperCase()] || code.toUpperCase();
}

const filePath = 'attached_assets/bulk-match-template-bilingual-chinese (2)_1759643606952.xlsx';
const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

console.log('═'.repeat(120));
console.log('🔍 INVESTIGATING PKL-000239 - WHO IS THIS PLAYER?');
console.log('═'.repeat(120));

interface Match {
  tab: string;
  row: number;
  team1Players: string[];
  team2Players: string[];
  score1: number;
  score2: number;
}

const pkl239Matches: Match[] = [];

for (const sheetName of workbook.SheetNames) {
  if (sheetName === '使用说明') continue;
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i] as any;
    
    const rawP1 = row['第一队选手一护照码'] || '';
    const rawP2 = row['第二队选手一护照码'] || '';
    const rawP3 = row['第一队选手二护照码'] || '';
    const rawP4 = row['第二队选手二护照码'] || '';
    
    if (!rawP1 || !rawP2) continue;
    
    const p1 = applyCorrection(rawP1.toString());
    const p2 = applyCorrection(rawP2.toString());
    const p3 = rawP3 ? applyCorrection(rawP3.toString()) : '';
    const p4 = rawP4 ? applyCorrection(rawP4.toString()) : '';
    
    const allPlayers = [p1, p2, p3, p4].filter(Boolean);
    
    if (allPlayers.includes('PKL-000239')) {
      pkl239Matches.push({
        tab: sheetName,
        row: i + 2,
        team1Players: [p1, p3].filter(Boolean),
        team2Players: [p2, p4].filter(Boolean),
        score1: Number(row['第一队得分']) || 0,
        score2: Number(row['第二队得分']) || 0
      });
    }
  }
}

console.log(`\n📊 Found ${pkl239Matches.length} matches involving PKL-000239\n`);

const allUsers = await db.select().from(users);
const userMap = new Map(allUsers.map(u => [u.passportCode, u]));

console.log('─'.repeat(120));
console.log('MATCH DETAILS:');
console.log('─'.repeat(120));

const teammates = new Map<string, number>();
const opponents = new Map<string, number>();

pkl239Matches.forEach((match, idx) => {
  console.log(`\nMatch #${idx + 1} [${match.tab}] Row ${match.row}`);
  
  const pkl239OnTeam1 = match.team1Players.includes('PKL-000239');
  
  if (pkl239OnTeam1) {
    console.log(`  Team 1 (PKL-000239's team): ${match.team1Players.join(' & ')}`);
    console.log(`  Team 2 (Opponents): ${match.team2Players.join(' & ')}`);
    console.log(`  Score: ${match.score1} - ${match.score2} | Result: ${match.score1 > match.score2 ? 'WIN' : 'LOSS'}`);
    
    match.team1Players.forEach(p => {
      if (p !== 'PKL-000239') {
        teammates.set(p, (teammates.get(p) || 0) + 1);
      }
    });
    
    match.team2Players.forEach(p => {
      opponents.set(p, (opponents.get(p) || 0) + 1);
    });
  } else {
    console.log(`  Team 1 (Opponents): ${match.team1Players.join(' & ')}`);
    console.log(`  Team 2 (PKL-000239's team): ${match.team2Players.join(' & ')}`);
    console.log(`  Score: ${match.score1} - ${match.score2} | Result: ${match.score2 > match.score1 ? 'WIN' : 'LOSS'}`);
    
    match.team2Players.forEach(p => {
      if (p !== 'PKL-000239') {
        teammates.set(p, (teammates.get(p) || 0) + 1);
      }
    });
    
    match.team1Players.forEach(p => {
      opponents.set(p, (opponents.get(p) || 0) + 1);
    });
  }
  
  match.team1Players.forEach(p => {
    if (p !== 'PKL-000239') {
      const user = userMap.get(p);
      if (user) {
        console.log(`    - ${p} = ${user.username} (${user.gender || 'unknown'})`);
      }
    }
  });
  
  match.team2Players.forEach(p => {
    if (p !== 'PKL-000239') {
      const user = userMap.get(p);
      if (user) {
        console.log(`    - ${p} = ${user.username} (${user.gender || 'unknown'})`);
      }
    }
  });
});

console.log('\n\n' + '─'.repeat(120));
console.log('TEAMMATE ANALYSIS:');
console.log('─'.repeat(120));
console.log('Players who partnered WITH PKL-000239:\n');

const sortedTeammates = Array.from(teammates.entries())
  .sort((a, b) => b[1] - a[1]);

sortedTeammates.forEach(([code, count]) => {
  const user = userMap.get(code);
  if (user) {
    console.log(`  ${count}x matches with ${code.padEnd(10)} - ${user.username.padEnd(20)} (${user.gender || 'unknown'})`);
  } else {
    console.log(`  ${count}x matches with ${code.padEnd(10)} - NOT IN DATABASE`);
  }
});

console.log('\n\n' + '─'.repeat(120));
console.log('OPPONENT ANALYSIS:');
console.log('─'.repeat(120));
console.log('Players who played AGAINST PKL-000239:\n');

const sortedOpponents = Array.from(opponents.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

sortedOpponents.forEach(([code, count]) => {
  const user = userMap.get(code);
  if (user) {
    console.log(`  ${count}x matches vs ${code.padEnd(10)} - ${user.username.padEnd(20)} (${user.gender || 'unknown'})`);
  } else {
    console.log(`  ${count}x matches vs ${code.padEnd(10)} - NOT IN DATABASE`);
  }
});

console.log('\n\n' + '═'.repeat(120));
console.log('💡 RECOMMENDATIONS FOR PKL-000239:');
console.log('═'.repeat(120));

if (sortedTeammates.length > 0) {
  const topTeammate = sortedTeammates[0];
  const topUser = userMap.get(topTeammate[0]);
  
  console.log(`\n🎯 Most frequent doubles partner: ${topTeammate[0]} (${topUser?.username || 'unknown'})`);
  console.log(`   Played together ${topTeammate[1]} times out of ${pkl239Matches.length} total matches`);
  console.log(`\n💡 Suggestion: Contact ${topUser?.username} to ask who their frequent partner was in September`);
}

console.log('\n\n📋 Other possibilities:');
console.log('   1. Check User IDs around 239 (we found gap between 238→240)');
console.log('   2. Search for players with similar skill level to frequent partners');
console.log('   3. Contact tournament organizer with match dates/opponents');

const deletedUsers = await db.select().from(users).where(
  db.or(
    db.eq(users.id, 239),
    db.like(users.username, '%239%'),
    db.like(users.email, '%239%')
  )
);

if (deletedUsers.length > 0) {
  console.log('\n\n🔍 FOUND POTENTIAL MATCHES IN DATABASE:');
  deletedUsers.forEach(u => {
    console.log(`   ID ${u.id}: ${u.passportCode} - ${u.username} (${u.email})`);
  });
}

console.log('\n\n' + '═'.repeat(120));
console.log('✅ Investigation complete!');
console.log('═'.repeat(120));

process.exit(0);
