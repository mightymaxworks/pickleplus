import * as XLSX from 'xlsx';
import fs from 'fs';
import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { eq, inArray } from 'drizzle-orm';

const filePath = 'attached_assets/bulk-match-template-bilingual-chinese (2)_1759643606952.xlsx';

console.log('═'.repeat(120));
console.log('🏓 PICKLE+ TOURNAMENT ANALYSIS - COMPREHENSIVE REPORT');
console.log('═'.repeat(120));
console.log('\n📁 Reading Excel file:', filePath);
console.log('📏 File size:', (fs.statSync(filePath).size / 1024).toFixed(2), 'KB\n');

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

const allMatches: ParsedMatch[] = [];

for (const sheetName of workbook.SheetNames) {
  if (sheetName === '使用说明') continue;
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i] as any;
    
    try {
      const player1 = row['第一队选手一护照码'] || '';
      const player2 = row['第二队选手一护照码'] || '';
      const player3 = row['第一队选手二护照码'] || '';
      const player4 = row['第二队选手二护照码'] || '';
      
      const score1 = Number(row['第一队得分']) || 0;
      const score2 = Number(row['第二队得分']) || 0;
      
      const matchDate = row['比赛日期'] || new Date().toISOString().split('T')[0];
      
      if (!player1 || !player2) continue;
      
      const isDoubles = Boolean(player3 && player4);
      
      allMatches.push({
        tabName: sheetName,
        matchDate: typeof matchDate === 'string' ? matchDate : new Date().toISOString().split('T')[0],
        player1: player1.toString().toUpperCase(),
        player2: player2.toString().toUpperCase(),
        player3: player3 ? player3.toString().toUpperCase() : undefined,
        player4: player4 ? player4.toString().toUpperCase() : undefined,
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

console.log(`✅ PARSED ${allMatches.length} MATCHES FROM ${workbook.SheetNames.length - 1} TOURNAMENTS\n`);

const allPassportCodes = new Set<string>();
allMatches.forEach(match => {
  allPassportCodes.add(match.player1);
  allPassportCodes.add(match.player2);
  if (match.player3) allPassportCodes.add(match.player3);
  if (match.player4) allPassportCodes.add(match.player4);
});

console.log(`👥 UNIQUE PLAYERS: ${allPassportCodes.size}\n`);

console.log('🔍 CHECKING DATABASE FOR PLAYER MATCHES...\n');

const passportCodesArray = Array.from(allPassportCodes);
const dbUsers = await db.select().from(users).where(inArray(users.passportCode, passportCodesArray));

const dbUserMap = new Map(dbUsers.map(u => [u.passportCode, u]));

const foundPlayers = passportCodesArray.filter(code => dbUserMap.has(code));
const missingPlayers = passportCodesArray.filter(code => !dbUserMap.has(code));

console.log('📊 DATABASE MATCHING RESULTS:');
console.log('─'.repeat(120));
console.log(`✅ Found in database: ${foundPlayers.length}/${allPassportCodes.size}`);
console.log(`❌ Missing from database: ${missingPlayers.length}/${allPassportCodes.size}`);

if (missingPlayers.length > 0) {
  console.log('\n⚠️  MISSING PASSPORT CODES:');
  missingPlayers.forEach(code => console.log(`   - ${code}`));
}

console.log('\n' + '─'.repeat(120));

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
  matchDetails: Array<{
    matchNumber: number;
    opponent: string;
    result: 'WIN' | 'LOSS';
    basePoints: number;
    genderBonus: number;
    rankingPointsEarned: number;
    picklePointsEarned: number;
  }>;
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
    finalPicklePoints: user.picklePoints || 0,
    matchDetails: []
  });
});

console.log('\n\n💰 CALCULATING POINTS ALLOCATION (System B: 3 win / 1 loss)...\n');
console.log('═'.repeat(120));

let validMatches = 0;
let skippedMatches = 0;

allMatches.forEach((match, index) => {
  const team1Players = [match.player1, match.player3].filter(Boolean);
  const team2Players = [match.player2, match.player4].filter(Boolean);
  
  const allPlayersFound = [...team1Players, ...team2Players].every(p => playerStats.has(p!));
  
  if (!allPlayersFound) {
    skippedMatches++;
    return;
  }
  
  validMatches++;
  const matchNumber = validMatches;
  
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
    
    const opponentNames = team2Players.map(p => {
      const oppUser = dbUserMap.get(p!);
      return oppUser ? oppUser.username : p;
    }).join(' & ');
    
    stats.matchDetails.push({
      matchNumber,
      opponent: opponentNames,
      result: team1Won ? 'WIN' : 'LOSS',
      basePoints,
      genderBonus,
      rankingPointsEarned,
      picklePointsEarned
    });
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
    
    const opponentNames = team1Players.map(p => {
      const oppUser = dbUserMap.get(p!);
      return oppUser ? oppUser.username : p;
    }).join(' & ');
    
    stats.matchDetails.push({
      matchNumber,
      opponent: opponentNames,
      result: team1Won ? 'LOSS' : 'WIN',
      basePoints,
      genderBonus,
      rankingPointsEarned,
      picklePointsEarned
    });
  });
});

console.log(`✅ Processed: ${validMatches} matches`);
console.log(`⚠️  Skipped: ${skippedMatches} matches (missing players)\n`);
console.log('═'.repeat(120));

const sortedPlayers = Array.from(playerStats.values()).sort((a, b) => b.finalRankingPoints - a.finalRankingPoints);

console.log('\n\n🏆 FINAL RANKING TABLE (Sorted by Ranking Points)');
console.log('═'.repeat(120));
console.log('Rank | Passport   | Username            | Gender | Matches | W-L    | Current RP | Earned RP | Final RP  | Current PP | Earned PP | Final PP  ');
console.log('─'.repeat(120));

sortedPlayers.forEach((player, index) => {
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

const totalRankingPointsDistributed = sortedPlayers.reduce((sum, p) => sum + p.totalRankingPointsEarned, 0);
const totalPicklePointsDistributed = sortedPlayers.reduce((sum, p) => sum + p.totalPicklePointsEarned, 0);

console.log('\n📊 SUMMARY STATISTICS:');
console.log(`   Total Matches Processed: ${validMatches}`);
console.log(`   Total Players: ${sortedPlayers.length}`);
console.log(`   Total Ranking Points Distributed: ${totalRankingPointsDistributed.toFixed(2)}`);
console.log(`   Total Pickle Points Distributed: ${totalPicklePointsDistributed.toFixed(2)}`);
console.log(`   Average Ranking Points per Player: ${(totalRankingPointsDistributed / sortedPlayers.length).toFixed(2)}`);
console.log(`   Average Pickle Points per Player: ${(totalPicklePointsDistributed / sortedPlayers.length).toFixed(2)}`);

console.log('\n\n📋 TOP 10 PLAYERS - DETAILED BREAKDOWN:');
console.log('═'.repeat(120));

sortedPlayers.slice(0, 10).forEach((player, index) => {
  console.log(`\n#${index + 1} ${player.username} (${player.passportCode}) - ${player.gender}`);
  console.log(`   Current: ${player.currentRankingPoints.toFixed(2)} RP | ${player.currentPicklePoints.toFixed(2)} PP`);
  console.log(`   Earned:  ${player.totalRankingPointsEarned.toFixed(2)} RP | ${player.totalPicklePointsEarned.toFixed(2)} PP`);
  console.log(`   Final:   ${player.finalRankingPoints.toFixed(2)} RP | ${player.finalPicklePoints.toFixed(2)} PP`);
  console.log(`   Record:  ${player.wins}-${player.losses} (${((player.wins / player.matchesPlayed) * 100).toFixed(1)}% win rate)`);
  console.log(`\n   Recent Matches:`);
  player.matchDetails.slice(0, 5).forEach(m => {
    const bonusText = m.genderBonus > 1 ? ` (${m.genderBonus}x gender bonus)` : '';
    console.log(`      Match #${m.matchNumber}: ${m.result} vs ${m.opponent} → +${m.rankingPointsEarned} RP, +${m.picklePointsEarned} PP${bonusText}`);
  });
  if (player.matchDetails.length > 5) {
    console.log(`      ... and ${player.matchDetails.length - 5} more matches`);
  }
});

console.log('\n\n' + '═'.repeat(120));
console.log('✨ ANALYSIS COMPLETE! Ready for import.');
console.log('═'.repeat(120));

process.exit(0);
