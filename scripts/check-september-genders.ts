import * as XLSX from 'xlsx';
import fs from 'fs';
import { db } from '../server/db.js';
import { users } from '../shared/schema.js';

const COMPLETE_CORRECTIONS: Record<string, string> = {
  'FOGBAM': 'F0GBAM', 'VOR7AU': 'VQR7AU', 'A40DAZ': 'A4ODAZ',
  '5XKD06': '5XKDO6', 'PZGEOT': 'PZGE0T', '2L8TU0': '2L8TUO',
  'JN110L': 'JN11OL', 'W9YINQ': 'W9YJNQ', 'BCIOVC': 'BCI0VC',
  '4030L6': '4O3OL6', 'PKL-000238': 'OUNSK4', 'PKL-000249': 'LT57DN',
  'PKL-000239': 'SEPT6FLOAT'
};

function applyCorrection(code: string): string {
  return COMPLETE_CORRECTIONS[code.toUpperCase()] || code.toUpperCase();
}

const filePath = 'attached_assets/bulk-match-template-bilingual-chinese (2)_1759643606952.xlsx';
const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

const uniquePlayers = new Set<string>();

for (const sheetName of workbook.SheetNames) {
  if (sheetName === '使用说明') continue;
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  for (const row of jsonData) {
    const data = row as any;
    const rawP1 = data['第一队选手一护照码'] || '';
    const rawP2 = data['第二队选手一护照码'] || '';
    const rawP3 = data['第一队选手二护照码'] || '';
    const rawP4 = data['第二队选手二护照码'] || '';
    
    if (rawP1) uniquePlayers.add(applyCorrection(rawP1.toString()));
    if (rawP2) uniquePlayers.add(applyCorrection(rawP2.toString()));
    if (rawP3) uniquePlayers.add(applyCorrection(rawP3.toString()));
    if (rawP4) uniquePlayers.add(applyCorrection(rawP4.toString()));
  }
}

const allUsers = await db.select().from(users);
const userMap = new Map(allUsers.map(u => [u.passportCode, u]));

console.log('═'.repeat(100));
console.log('SEPTEMBER 2025 PLAYERS - GENDER VERIFICATION');
console.log('═'.repeat(100));
console.log('');
console.log('Players who participated in September matches:');
console.log('');
console.log('ID    | Passport   | Username                  | Current Gender | Status');
console.log('─'.repeat(100));

const playersList = [];

for (const passportCode of Array.from(uniquePlayers).sort()) {
  const user = userMap.get(passportCode);
  if (user) {
    const gender = user.gender || 'null';
    const needsUpdate = !gender || gender === 'null' || gender === 'Other' || gender === 'Unknown';
    const status = needsUpdate ? '⚠️  NEEDS UPDATE' : '✅ Has gender';
    
    playersList.push({
      id: user.id,
      passport: passportCode,
      username: user.username,
      gender: gender,
      needsUpdate: needsUpdate
    });
  }
}

playersList.forEach(p => {
  const id = p.id.toString().padEnd(5);
  const passport = p.passport.padEnd(10);
  const username = p.username.substring(0, 24).padEnd(24);
  const gender = p.gender.padEnd(14);
  const status = p.needsUpdate ? '⚠️  NEEDS UPDATE' : '✅ Has gender';
  console.log(`${id} | ${passport} | ${username} | ${gender} | ${status}`);
});

console.log('─'.repeat(100));

const needsUpdate = playersList.filter(p => p.needsUpdate);
const hasGender = playersList.filter(p => !p.needsUpdate);

console.log('');
console.log(`Total players: ${playersList.length}`);
console.log(`✅ Already have gender: ${hasGender.length}`);
console.log(`⚠️  Need gender update: ${needsUpdate.length}`);
console.log('');

if (hasGender.length > 0) {
  console.log('═'.repeat(100));
  console.log('PLAYERS WITH GENDER ALREADY SET:');
  console.log('─'.repeat(100));
  hasGender.forEach(p => {
    console.log(`${p.id.toString().padEnd(5)} | ${p.passport.padEnd(10)} | ${p.username.padEnd(25)} | ${p.gender}`);
  });
  console.log('');
}

if (needsUpdate.length > 0) {
  console.log('═'.repeat(100));
  console.log('PLAYERS NEEDING GENDER ASSIGNMENT:');
  console.log('─'.repeat(100));
  console.log('Please provide the correct gender for each player below:');
  console.log('');
  needsUpdate.forEach(p => {
    console.log(`${p.id.toString().padEnd(5)} | ${p.passport.padEnd(10)} | ${p.username}`);
  });
  console.log('');
  console.log('Gender options: Male, Female');
}

console.log('═'.repeat(100));

process.exit(0);
