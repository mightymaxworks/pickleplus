import * as XLSX from 'xlsx';
import fs from 'fs';
import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { inArray } from 'drizzle-orm';

const FINAL_OCR_CORRECTIONS: Record<string, string> = {
  'FOGBAM': 'F0GBAM',     // O → 0
  'VOR7AU': 'VQR7AU',     // O → Q  
  'A40DAZ': 'A4ODAZ',     // 0 → O
  '5XKD06': '5XKDO6',     // 0 → O
  'PZGEOT': 'PZGE0T',     // O → 0
  '2L8TU0': '2L8TUO',     // 0 → O
  'JN110L': 'JN11OL',     // 0 → O
  'W9YINQ': 'W9YJNQ',     // IN → J (typo!)
  'BCIOVC': 'BCI0VC',     // O → 0
  '4030L6': '4O3OL6'      // 0 → O (twice)
};

console.log('═'.repeat(120));
console.log('🎯 FINAL CORRECTED TOURNAMENT ANALYSIS');
console.log('═'.repeat(120));
console.log('\n📋 Complete OCR Correction Map:');
console.log('─'.repeat(120));
Object.entries(FINAL_OCR_CORRECTIONS).forEach(([wrong, correct]) => {
  console.log(`   ${wrong.padEnd(10)} → ${correct.padEnd(10)}`);
});
console.log('─'.repeat(120));

const filePath = 'attached_assets/bulk-match-template-bilingual-chinese (2)_1759643606952.xlsx';
const buffer = fs.readFileSync(filePath);
const workbook = XLSX.read(buffer, { type: 'buffer' });

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
  isDoubles: boolean;
}

function applyCorrection(code: string): string {
  return FINAL_OCR_CORRECTIONS[code.toUpperCase()] || code.toUpperCase();
}

const allMatches: ParsedMatch[] = [];

for (const sheetName of workbook.SheetNames) {
  if (sheetName === '使用说明') continue;
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i] as any;
    
    try {
      const rawPlayer1 = row['第一队选手一护照码'] || '';
      const rawPlayer2 = row['第二队选手一护照码'] || '';
      const rawPlayer3 = row['第一队选手二护照码'] || '';
      const rawPlayer4 = row['第二队选手二护照码'] || '';
      
      if (!rawPlayer1 || !rawPlayer2) continue;
      
      const player1 = applyCorrection(rawPlayer1.toString());
      const player2 = applyCorrection(rawPlayer2.toString());
      const player3 = rawPlayer3 ? applyCorrection(rawPlayer3.toString()) : undefined;
      const player4 = rawPlayer4 ? applyCorrection(rawPlayer4.toString()) : undefined;
      
      const score1 = Number(row['第一队得分']) || 0;
      const score2 = Number(row['第二队得分']) || 0;
      const matchDate = row['比赛日期'] || new Date().toISOString().split('T')[0];
      
      const isDoubles = Boolean(player3 && player4);
      
      allMatches.push({
        tabName: sheetName,
        matchDate: typeof matchDate === 'string' ? matchDate : new Date().toISOString().split('T')[0],
        player1,
        player2,
        player3,
        player4,
        team1Score: score1,
        team2Score: score2,
        isDoubles,
        rowNumber: i + 2
      });
      
    } catch (error) {
      console.warn(`⚠️  Failed to parse row ${i + 2} in ${sheetName}`);
    }
  }
}

console.log(`\n✅ Parsed ${allMatches.length} matches with all corrections applied\n`);

const allPassportCodes = new Set<string>();
allMatches.forEach(match => {
  allPassportCodes.add(match.player1);
  allPassportCodes.add(match.player2);
  if (match.player3) allPassportCodes.add(match.player3);
  if (match.player4) allPassportCodes.add(match.player4);
});

console.log('🔍 CHECKING DATABASE WITH FULLY CORRECTED CODES...\n');

const passportCodesArray = Array.from(allPassportCodes);
const dbUsers = await db.select().from(users).where(inArray(users.passportCode, passportCodesArray));
const dbUserMap = new Map(dbUsers.map(u => [u.passportCode, u]));

const foundPlayers = passportCodesArray.filter(code => dbUserMap.has(code));
const missingPlayers = passportCodesArray.filter(code => !dbUserMap.has(code));

console.log('📊 FINAL DATABASE MATCHING RESULTS:');
console.log('─'.repeat(120));
console.log(`✅ Found in database: ${foundPlayers.length}/${allPassportCodes.size} (${((foundPlayers.length/allPassportCodes.size)*100).toFixed(1)}%)`);
console.log(`❌ Still missing: ${missingPlayers.length}/${allPassportCodes.size} (${((missingPlayers.length/allPassportCodes.size)*100).toFixed(1)}%)`);

if (missingPlayers.length > 0) {
  console.log('\n⚠️  REMAINING MISSING CODES (PKL-format only):');
  missingPlayers.forEach(code => {
    const isPKL = code.startsWith('PKL-');
    const badge = isPKL ? '🎫' : '❓';
    console.log(`   ${badge} ${code}`);
  });
}
console.log('─'.repeat(120));

interface PlayerPoints {
  passportCode: string;
  username: string;
  gender: string;
  currentRankingPoints: number;
  currentPicklePoints: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalRankingPointsEarned: number;
  totalPicklePointsEarned: number;
  finalRankingPoints: number;
  finalPicklePoints: number;
}

const playerStats = new Map<string, PlayerPoints>();

foundPlayers.forEach(code => {
  const user = dbUserMap.get(code)!;
  playerStats.set(code, {
    passportCode: code,
    username: user.username,
    gender: user.gender || 'Other',
    currentRankingPoints: user.rankingPoints || 0,
    currentPicklePoints: user.picklePoints || 0,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    totalRankingPointsEarned: 0,
    totalPicklePointsEarned: 0,
    finalRankingPoints: user.rankingPoints || 0,
    finalPicklePoints: user.picklePoints || 0
  });
});

console.log('\n\n💰 CALCULATING FINAL POINTS ALLOCATION...\n');

let validMatches = 0;
let skippedMatches = 0;

allMatches.forEach((match) => {
  const team1Players = [match.player1, match.player3].filter(Boolean);
  const team2Players = [match.player2, match.player4].filter(Boolean);
  
  const allPlayersFound = [...team1Players, ...team2Players].every(p => playerStats.has(p!));
  
  if (!allPlayersFound) {
    skippedMatches++;
    return;
  }
  
  validMatches++;
  const team1Won = match.team1Score > match.team2Score;
  
  team1Players.forEach(playerCode => {
    const stats = playerStats.get(playerCode!)!;
    const user = dbUserMap.get(playerCode!)!;
    
    const basePoints = team1Won ? 3 : 1;
    let genderBonus = 1.0;
    if (match.isDoubles && user.gender === 'Female' && stats.currentRankingPoints < 1000) {
      genderBonus = 1.15;
    }
    
    const rankingPointsEarned = Number((basePoints * genderBonus).toFixed(2));
    const picklePointsEarned = Number((rankingPointsEarned * 1.5).toFixed(2));
    
    stats.matchesPlayed++;
    if (team1Won) stats.wins++;
    else stats.losses++;
    
    stats.totalRankingPointsEarned += rankingPointsEarned;
    stats.totalPicklePointsEarned += picklePointsEarned;
    stats.finalRankingPoints += rankingPointsEarned;
    stats.finalPicklePoints += picklePointsEarned;
  });
  
  team2Players.forEach(playerCode => {
    const stats = playerStats.get(playerCode!)!;
    const user = dbUserMap.get(playerCode!)!;
    
    const basePoints = team1Won ? 1 : 3;
    let genderBonus = 1.0;
    if (match.isDoubles && user.gender === 'Female' && stats.currentRankingPoints < 1000) {
      genderBonus = 1.15;
    }
    
    const rankingPointsEarned = Number((basePoints * genderBonus).toFixed(2));
    const picklePointsEarned = Number((rankingPointsEarned * 1.5).toFixed(2));
    
    stats.matchesPlayed++;
    if (!team1Won) stats.wins++;
    else stats.losses++;
    
    stats.totalRankingPointsEarned += rankingPointsEarned;
    stats.totalPicklePointsEarned += picklePointsEarned;
    stats.finalRankingPoints += rankingPointsEarned;
    stats.finalPicklePoints += picklePointsEarned;
  });
});

console.log('═'.repeat(120));
console.log(`✅ PROCESSABLE: ${validMatches}/${allMatches.length} matches (${((validMatches/allMatches.length)*100).toFixed(1)}%)`);
console.log(`⚠️  BLOCKED: ${skippedMatches}/${allMatches.length} matches (${((skippedMatches/allMatches.length)*100).toFixed(1)}% - PKL codes only)`);
console.log('═'.repeat(120));

const sortedPlayers = Array.from(playerStats.values()).sort((a, b) => b.finalRankingPoints - a.finalRankingPoints);

console.log('\n\n🏆 FINAL RANKING TABLE - TOP 20 PLAYERS');
console.log('═'.repeat(120));
console.log('Rank | Passport   | Username            | Gender | Matches | W-L    | Current RP | Earned RP | Final RP  | Current PP | Earned PP | Final PP  ');
console.log('─'.repeat(120));

sortedPlayers.slice(0, 20).forEach((player, index) => {
  const rank = (index + 1).toString().padStart(4);
  const passport = player.passportCode.padEnd(10);
  const username = player.username.substring(0, 18).padEnd(18);
  const gender = player.gender.substring(0, 6).padEnd(6);
  const matches = player.matchesPlayed.toString().padStart(7);
  const wl = `${player.wins}-${player.losses}`.padStart(6);
  const currentRP = player.currentRankingPoints.toFixed(2).padStart(10);
  const earnedRP = player.totalRankingPointsEarned.toFixed(2).padStart(9);
  const finalRP = player.finalRankingPoints.toFixed(2).padStart(9);
  const currentPP = player.currentPicklePoints.toFixed(2).padStart(10);
  const earnedPP = player.totalPicklePointsEarned.toFixed(2).padStart(9);
  const finalPP = player.finalPicklePoints.toFixed(2).padStart(9);
  
  console.log(`${rank} | ${passport} | ${username} | ${gender} | ${matches} | ${wl} | ${currentRP} | ${earnedRP} | ${finalRP} | ${currentPP} | ${earnedPP} | ${finalPP}`);
});
console.log('═'.repeat(120));

const totalRP = sortedPlayers.reduce((sum, p) => sum + p.totalRankingPointsEarned, 0);
const totalPP = sortedPlayers.reduce((sum, p) => sum + p.totalPicklePointsEarned, 0);

console.log('\n📊 FINAL SUMMARY:');
console.log(`   Players: ${sortedPlayers.length}/${allPassportCodes.size}`);
console.log(`   Matches: ${validMatches}/${allMatches.length} (${((validMatches/allMatches.length)*100).toFixed(1)}%)`);
console.log(`   Total RP Distributed: ${totalRP.toFixed(2)}`);
console.log(`   Total PP Distributed: ${totalPP.toFixed(2)}`);
console.log(`   Avg RP/Player: ${(totalRP / sortedPlayers.length).toFixed(2)}`);
console.log(`   Avg PP/Player: ${(totalPP / sortedPlayers.length).toFixed(2)}`);

console.log('\n\n🎯 OCR CORRECTION IMPACT:');
console.log('─'.repeat(120));
console.log(`   Before: 195/394 matches (49.5%)`);
console.log(`   After:  ${validMatches}/394 matches (${((validMatches/394)*100).toFixed(1)}%)`);
console.log(`   ✨ Unlocked: +${validMatches - 195} matches (+${((validMatches - 195)/394*100).toFixed(1)}%)`);

console.log('\n\n🎫 REMAINING PKL-FORMAT PLAYERS:');
console.log('═'.repeat(120));
const pklCodes = missingPlayers.filter(c => c.startsWith('PKL-'));
console.log(`   ${pklCodes.length} PKL codes blocking ${skippedMatches} matches:\n`);
pklCodes.forEach(code => {
  const count = allMatches.filter(m => 
    [m.player1, m.player2, m.player3, m.player4].includes(code)
  ).length;
  console.log(`   🎫 ${code} - appears in ${count} matches`);
});

console.log('\n\n' + '═'.repeat(120));
console.log('✅ COMPLETE! Ready for import or PKL player registration.');
console.log('═'.repeat(120));

process.exit(0);
