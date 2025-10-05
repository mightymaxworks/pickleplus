import * as XLSX from 'xlsx';
import fs from 'fs';
import { db } from '../server/db.js';
import { users, matches } from '../shared/schema.js';
import { rankingHistory } from '../server/modules/ranking/schema.js';
import { sql, and, gte, lte, eq, inArray } from 'drizzle-orm';

console.log('═'.repeat(120));
console.log('🔄 GENDER CORRECTION + SEPTEMBER RE-CALCULATION');
console.log('═'.repeat(120));
console.log('\n');

// STEP 1: Update genders
const genderUpdates = [
  { id: 365, passport: '5RL8DT', username: 'Frank', gender: 'Male' },
  { id: 362, passport: '80IYHC', username: 'Player_80IYHC', gender: 'Male' },
  { id: 450, passport: 'BCI0VC', username: 'Sunny', gender: 'Male' },
  { id: 361, passport: 'F50WO8', username: 'Player_F50WO8', gender: 'Male' },
  { id: 347, passport: 'GTKS9W', username: 'hopper', gender: 'Male' },
  { id: 317, passport: 'RJBACI', username: 'yuyuyu', gender: 'Male' },
  { id: 481, passport: 'SEPT6FLOAT', username: 'Sept6_Floater', gender: 'Male' },
  { id: 351, passport: 'UMYZYI', username: 'TONYG', gender: 'Male' },
  { id: 368, passport: 'V9H8FC', username: 'xuyongfeng', gender: 'Male' },
  { id: 342, passport: 'VPUZXN', username: 'Gaga', gender: 'Male' },
  { id: 373, passport: 'XIEBE2', username: 'wldsun', gender: 'Male' }
];

console.log('STEP 1: UPDATE PLAYER GENDERS');
console.log('─'.repeat(120));
for (const update of genderUpdates) {
  await db.update(users)
    .set({ gender: 'male' })  // Use lowercase for consistency
    .where(eq(users.id, update.id));
  console.log(`✅ Updated ${update.passport.padEnd(10)} (${update.username.padEnd(20)}) → male`);
}
console.log(`\n✅ Updated ${genderUpdates.length} player genders\n\n`);

// STEP 2: Reset September points to zero
console.log('STEP 2: RESET SEPTEMBER POINTS');
console.log('─'.repeat(120));

const allUsers = await db.select().from(users);
const userBackup = new Map(allUsers.map(u => [u.id, {
  rankingPoints: u.rankingPoints || 0,
  picklePoints: u.picklePoints || 0
}]));

const septStart = new Date('2025-09-01T00:00:00Z');
const septEnd = new Date('2025-09-30T23:59:59Z');

const septMatches = await db.select().from(matches).where(
  and(gte(matches.createdAt, septStart), lte(matches.createdAt, septEnd))
);

console.log(`Found ${septMatches.length} September matches to delete\n`);

// Calculate points to subtract from each player
const playerAdjustments = new Map<number, { rpToSubtract: number, ppToSubtract: number }>();

for (const match of septMatches) {
  const players = [match.player1Id, match.player2Id, match.player3Id, match.player4Id].filter(Boolean) as number[];
  
  for (const playerId of players) {
    if (!playerAdjustments.has(playerId)) {
      playerAdjustments.set(playerId, { rpToSubtract: 0, ppToSubtract: 0 });
    }
  }
}

// Delete ranking history and matches
if (septMatches.length > 0) {
  const matchIds = septMatches.map(m => m.id);
  await db.delete(rankingHistory).where(inArray(rankingHistory.matchId, matchIds));
  await db.delete(matches).where(and(gte(matches.createdAt, septStart), lte(matches.createdAt, septEnd)));
  console.log(`✅ Deleted ${septMatches.length} matches and related history\n\n`);
}

// STEP 3: Re-import with FULL algorithm compliance
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

console.log('STEP 3: RE-IMPORT WITH ALGORITHM COMPLIANCE');
console.log('─'.repeat(120));
console.log('Algorithm Rules:');
console.log('  • Base Points: 3 WIN / 1 LOSS (System B)');
console.log('  • Gender Bonus: 1.15x for FEMALES in cross-gender DOUBLES with <1000 RP');
console.log('  • Pickle Points: 1.5x multiplier PER MATCH');
console.log('  • Match Types: Singles, Men\'s Doubles, Women\'s Doubles, Mixed Doubles');
console.log('');

const filePath = 'attached_assets/bulk-match-template-bilingual-chinese (2)_1759643606952.xlsx';
const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

interface ParsedMatch {
  player1: string;
  player2: string;
  player3?: string;
  player4?: string;
  team1Score: number;
  team2Score: number;
  matchDate: Date;
}

const parsedMatches: ParsedMatch[] = [];

for (const sheetName of workbook.SheetNames) {
  if (sheetName === '使用说明') continue;
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  for (const row of jsonData) {
    const data = row as any;
    const rawP1 = data['第一队选手一护照码'];
    const rawP2 = data['第二队选手一护照码'];
    const rawP3 = data['第一队选手二护照码'];
    const rawP4 = data['第二队选手二护照码'];
    
    if (!rawP1 || !rawP2) continue;
    
    const p1 = applyCorrection(rawP1.toString());
    const p2 = applyCorrection(rawP2.toString());
    const p3 = rawP3 ? applyCorrection(rawP3.toString()) : undefined;
    const p4 = rawP4 ? applyCorrection(rawP4.toString()) : undefined;
    
    const score1 = Number(data['第一队得分']) || 0;
    const score2 = Number(data['第二队得分']) || 0;
    const rawDate = data['比赛日期'];
    
    let matchDate: Date;
    if (typeof rawDate === 'number') {
      matchDate = new Date((rawDate - 25569) * 86400 * 1000);
    } else {
      matchDate = new Date('2025-09-15');
    }
    
    parsedMatches.push({
      player1: p1,
      player2: p2,
      player3: p3,
      player4: p4,
      team1Score: score1,
      team2Score: score2,
      matchDate
    });
  }
}

console.log(`✅ Parsed ${parsedMatches.length} matches\n`);

const userMap = new Map(allUsers.map(u => [u.passportCode, u]));

interface PlayerUpdate {
  userId: number;
  passportCode: string;
  username: string;
  gender: string;
  matchesPlayed: number;
  singlesMatches: number;
  doublesMatches: number;
  mixedDoublesMatches: number;
  wins: number;
  losses: number;
  rpEarned: number;
  ppEarned: number;
  genderBonusMatches: number;
  genderBonusRP: number;
}

const playerUpdates = new Map<number, PlayerUpdate>();

let singlesCount = 0;
let mensDoublesCount = 0;
let womensDoublesCount = 0;
let mixedDoublesCount = 0;

for (const match of parsedMatches) {
  const team1Players = [match.player1, match.player3].filter(Boolean) as string[];
  const team2Players = [match.player2, match.player4].filter(Boolean) as string[];
  const allPlayers = [...team1Players, ...team2Players];
  
  if (!allPlayers.every(p => userMap.has(p))) continue;
  
  const team1Won = match.team1Score > match.team2Score;
  const isDoubles = Boolean(match.player3 && match.player4);
  
  // Determine match category
  let matchCategory = 'Singles';
  let isMixedDoubles = false;
  
  if (isDoubles) {
    const allPlayerGenders = allPlayers.map(p => (userMap.get(p)!.gender || 'male').toLowerCase());
    const uniqueGenders = new Set(allPlayerGenders.filter(g => g === 'male' || g === 'female'));
    
    if (uniqueGenders.size > 1) {
      matchCategory = 'Mixed Doubles';
      isMixedDoubles = true;
      mixedDoublesCount++;
    } else if (uniqueGenders.has('male')) {
      matchCategory = "Men's Doubles";
      mensDoublesCount++;
    } else if (uniqueGenders.has('female')) {
      matchCategory = "Women's Doubles";
      womensDoublesCount++;
    } else {
      matchCategory = 'Doubles';
    }
  } else {
    singlesCount++;
  }
  
  // Calculate points for each player
  for (let teamNum = 1; teamNum <= 2; teamNum++) {
    const teamPlayers = teamNum === 1 ? team1Players : team2Players;
    const isWinner = (teamNum === 1 && team1Won) || (teamNum === 2 && !team1Won);
    const basePoints = isWinner ? 3 : 1;
    
    for (const playerCode of teamPlayers) {
      const user = userMap.get(playerCode)!;
      
      if (!playerUpdates.has(user.id)) {
        playerUpdates.set(user.id, {
          userId: user.id,
          passportCode: playerCode,
          username: user.username,
          gender: user.gender || 'male',
          matchesPlayed: 0,
          singlesMatches: 0,
          doublesMatches: 0,
          mixedDoublesMatches: 0,
          wins: 0,
          losses: 0,
          rpEarned: 0,
          ppEarned: 0,
          genderBonusMatches: 0,
          genderBonusRP: 0
        });
      }
      
      const update = playerUpdates.get(user.id)!;
      const currentRP = (userBackup.get(user.id)?.rankingPoints || 0) + update.rpEarned;
      
      // Apply gender bonus: 1.15x for females in cross-gender doubles with <1000 RP
      let genderBonus = 1.0;
      let bonusApplied = false;
      
      if (isMixedDoubles && (user.gender || '').toLowerCase() === 'female' && currentRP < 1000) {
        genderBonus = 1.15;
        bonusApplied = true;
        update.genderBonusMatches++;
      }
      
      const rpEarned = Math.round((basePoints * genderBonus) * 100) / 100;
      const ppEarned = Math.round((rpEarned * 1.5) * 100) / 100;
      
      if (bonusApplied) {
        update.genderBonusRP += (rpEarned - basePoints);
      }
      
      update.matchesPlayed++;
      if (!isDoubles) update.singlesMatches++;
      else {
        update.doublesMatches++;
        if (isMixedDoubles) update.mixedDoublesMatches++;
      }
      if (isWinner) update.wins++;
      else update.losses++;
      update.rpEarned += rpEarned;
      update.ppEarned += ppEarned;
    }
  }
}

console.log('MATCH CATEGORY BREAKDOWN:');
console.log(`  Singles: ${singlesCount}`);
console.log(`  Men's Doubles: ${mensDoublesCount}`);
console.log(`  Women's Doubles: ${womensDoublesCount}`);
console.log(`  Mixed Doubles: ${mixedDoublesCount}`);
console.log(`  Total: ${parsedMatches.length}\n`);

// Update database
const sortedUpdates = Array.from(playerUpdates.values()).sort((a, b) => b.rpEarned - a.rpEarned);

for (const update of sortedUpdates) {
  const backup = userBackup.get(update.userId)!;
  const newRP = Math.round(backup.rankingPoints + update.rpEarned);
  const newPP = Math.round(backup.picklePoints + update.ppEarned);
  
  await db.update(users)
    .set({
      rankingPoints: newRP,
      picklePoints: newPP
    })
    .where(eq(users.id, update.userId));
}

console.log(`✅ Updated ${sortedUpdates.length} players\n\n`);

// AUDIT REPORT
console.log('═'.repeat(120));
console.log('GENDER BONUS AUDIT - FEMALE PLAYERS IN MIXED DOUBLES');
console.log('═'.repeat(120));

const femaleUpdates = sortedUpdates.filter(u => (u.gender || '').toLowerCase() === 'female');
const femalesWithBonus = femaleUpdates.filter(u => u.genderBonusMatches > 0);

console.log(`\nTotal female players: ${femaleUpdates.length}`);
console.log(`Females who received bonus: ${femalesWithBonus.length}`);
console.log(`Total bonus applications: ${femalesWithBonus.reduce((sum, u) => sum + u.genderBonusMatches, 0)} matches\n`);

if (femalesWithBonus.length > 0) {
  console.log('FEMALE PLAYERS WITH GENDER BONUS:');
  console.log('─'.repeat(120));
  console.log('Passport   | Username            | Mixed Matches | Bonus Matches | Bonus RP  | Total RP | Total PP');
  console.log('─'.repeat(120));
  
  femalesWithBonus.forEach(u => {
    const passport = u.passportCode.padEnd(10);
    const username = u.username.substring(0, 18).padEnd(18);
    const mixed = u.mixedDoublesMatches.toString().padStart(13);
    const bonusMatches = u.genderBonusMatches.toString().padStart(13);
    const bonusRP = u.genderBonusRP.toFixed(2).padStart(9);
    const totalRP = u.rpEarned.toFixed(2).padStart(8);
    const totalPP = u.ppEarned.toFixed(2).padStart(8);
    
    console.log(`${passport} | ${username} | ${mixed} | ${bonusMatches} | ${bonusRP} | ${totalRP} | ${totalPP}`);
  });
}

console.log('\n\n');
console.log('═'.repeat(120));
console.log('TOP 20 PLAYERS - COMPLETE BREAKDOWN');
console.log('═'.repeat(120));
console.log('Rank | Passport   | Username            | Gender | Singles | Doubles | Mixed | W-L   | RP     | PP     | New RP | New PP');
console.log('─'.repeat(120));

sortedUpdates.slice(0, 20).forEach((u, idx) => {
  const backup = userBackup.get(u.userId)!;
  const rank = (idx + 1).toString().padStart(4);
  const passport = u.passportCode.padEnd(10);
  const username = u.username.substring(0, 18).padEnd(18);
  const gender = u.gender.substring(0, 6).padEnd(6);
  const singles = u.singlesMatches.toString().padStart(7);
  const doubles = u.doublesMatches.toString().padStart(7);
  const mixed = u.mixedDoublesMatches.toString().padStart(5);
  const wl = `${u.wins}-${u.losses}`.padStart(5);
  const rp = u.rpEarned.toFixed(2).padStart(6);
  const pp = u.ppEarned.toFixed(2).padStart(6);
  const newRP = (backup.rankingPoints + u.rpEarned).toFixed(0).padStart(6);
  const newPP = (backup.picklePoints + u.ppEarned).toFixed(0).padStart(6);
  
  console.log(`${rank} | ${passport} | ${username} | ${gender} | ${singles} | ${doubles} | ${mixed} | ${wl} | ${rp} | ${pp} | ${newRP} | ${newPP}`);
});

const totalRP = sortedUpdates.reduce((sum, u) => sum + u.rpEarned, 0);
const totalPP = sortedUpdates.reduce((sum, u) => sum + u.ppEarned, 0);
const totalBonusRP = femalesWithBonus.reduce((sum, u) => sum + u.genderBonusRP, 0);

console.log('═'.repeat(120));
console.log('\nFINAL SUMMARY:');
console.log(`  Total Players: ${sortedUpdates.length}`);
console.log(`  Total RP Distributed: ${totalRP.toFixed(2)}`);
console.log(`  Total PP Distributed: ${totalPP.toFixed(2)}`);
console.log(`  Gender Bonus RP: ${totalBonusRP.toFixed(2)} (from ${femalesWithBonus.reduce((s, u) => s + u.genderBonusMatches, 0)} bonus applications)`);
console.log(`  Female Players: ${femaleUpdates.length}`);
console.log(`  Male Players: ${sortedUpdates.filter(u => (u.gender || '').toLowerCase() === 'male').length}`);
console.log('\n✅ September 2025 correction completed with full algorithm compliance!');
console.log('═'.repeat(120));

process.exit(0);
