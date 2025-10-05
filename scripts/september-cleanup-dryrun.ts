import { db } from '../server/db.js';
import { matches, users } from '../shared/schema.js';
import { sql, and, gte, lte } from 'drizzle-orm';

console.log('═'.repeat(120));
console.log('🔍 SEPTEMBER 2025 CLEANUP - DRY RUN ANALYSIS');
console.log('═'.repeat(120));
console.log('\n⚠️  THIS IS A DRY RUN - NO CHANGES WILL BE MADE\n');

const septStart = new Date('2025-09-01T00:00:00Z');
const septEnd = new Date('2025-09-30T23:59:59Z');

console.log(`📅 Date Range: ${septStart.toISOString().split('T')[0]} to ${septEnd.toISOString().split('T')[0]}`);

console.log('\n\n🔍 STEP 1: FINDING SEPTEMBER MATCHES IN DATABASE...\n');

const septemberMatches = await db.select().from(matches).where(
  and(
    gte(matches.createdAt, septStart),
    lte(matches.createdAt, septEnd)
  )
);

console.log(`✅ Found ${septemberMatches.length} matches in September 2025`);

if (septemberMatches.length === 0) {
  console.log('\n✨ No September matches found in database. Nothing to clean up!');
  process.exit(0);
}

console.log('\n─'.repeat(120));
console.log('MATCH BREAKDOWN:');
console.log('─'.repeat(120));

const byDate = new Map<string, number>();
septemberMatches.forEach(m => {
  const date = m.createdAt.toISOString().split('T')[0];
  byDate.set(date, (byDate.get(date) || 0) + 1);
});

Array.from(byDate.entries()).sort().forEach(([date, count]) => {
  console.log(`  ${date}: ${count} matches`);
});

console.log('\n\n🔍 STEP 2: ANALYZING POINT CHANGES FROM SEPTEMBER MATCHES...\n');

interface PlayerImpact {
  userId: number;
  passportCode: string;
  username: string;
  currentRP: number;
  currentPP: number;
  septemberMatchCount: number;
  estimatedRPToRollback: number;
  estimatedPPToRollback: number;
}

const playerImpacts = new Map<number, PlayerImpact>();

for (const match of septemberMatches) {
  const players = [
    match.player1Id,
    match.player2Id,
    match.player3Id,
    match.player4Id
  ].filter(Boolean) as number[];
  
  for (const playerId of players) {
    if (!playerImpacts.has(playerId)) {
      const user = await db.select().from(users).where(sql`${users.id} = ${playerId}`).limit(1);
      if (user.length > 0) {
        playerImpacts.set(playerId, {
          userId: playerId,
          passportCode: user[0].passportCode || '',
          username: user[0].username,
          currentRP: user[0].rankingPoints || 0,
          currentPP: user[0].picklePoints || 0,
          septemberMatchCount: 0,
          estimatedRPToRollback: 0,
          estimatedPPToRollback: 0
        });
      }
    }
    
    const impact = playerImpacts.get(playerId);
    if (impact) {
      impact.septemberMatchCount++;
      
      const isWinner = (match.player1Id === playerId || match.player3Id === playerId) 
        ? match.team1Score > match.team2Score
        : match.team2Score > match.team1Score;
      
      const basePoints = isWinner ? 3 : 1;
      impact.estimatedRPToRollback += basePoints;
      impact.estimatedPPToRollback += basePoints * 1.5;
    }
  }
}

const sortedImpacts = Array.from(playerImpacts.values())
  .sort((a, b) => b.estimatedRPToRollback - a.estimatedRPToRollback);

console.log(`✅ Analyzed ${sortedImpacts.length} players affected by September matches\n`);

console.log('─'.repeat(120));
console.log('TOP 20 PLAYERS - ESTIMATED ROLLBACK AMOUNTS:');
console.log('─'.repeat(120));
console.log('Rank | User ID | Passport   | Username            | Sept Matches | Current RP | Est. Rollback RP | Current PP | Est. Rollback PP');
console.log('─'.repeat(120));

sortedImpacts.slice(0, 20).forEach((impact, idx) => {
  const rank = (idx + 1).toString().padStart(4);
  const userId = impact.userId.toString().padStart(7);
  const passport = impact.passportCode.padEnd(10);
  const username = impact.username.substring(0, 18).padEnd(18);
  const matchCount = impact.septemberMatchCount.toString().padStart(12);
  const currentRP = impact.currentRP.toFixed(2).padStart(10);
  const rollbackRP = impact.estimatedRPToRollback.toFixed(2).padStart(16);
  const currentPP = impact.currentPP.toFixed(2).padStart(10);
  const rollbackPP = impact.estimatedPPToRollback.toFixed(2).padStart(16);
  
  console.log(`${rank} | ${userId} | ${passport} | ${username} | ${matchCount} | ${currentRP} | ${rollbackRP} | ${currentPP} | ${rollbackPP}`);
});

console.log('─'.repeat(120));

const totalRPRollback = sortedImpacts.reduce((sum, p) => sum + p.estimatedRPToRollback, 0);
const totalPPRollback = sortedImpacts.reduce((sum, p) => sum + p.estimatedPPToRollback, 0);

console.log(`\n📊 TOTAL ESTIMATED ROLLBACK:`);
console.log(`   Ranking Points: ${totalRPRollback.toFixed(2)} RP`);
console.log(`   Pickle Points: ${totalPPRollback.toFixed(2)} PP`);

console.log('\n\n🔍 STEP 3: PREVIEW OF WHAT WILL HAPPEN...\n');

console.log('═'.repeat(120));
console.log('CLEANUP PLAN:');
console.log('═'.repeat(120));

console.log(`\n1️⃣  DELETE ${septemberMatches.length} matches from database (Sept 1-30, 2025)`);
console.log(`\n2️⃣  SUBTRACT estimated points from ${sortedImpacts.length} players:`);
console.log(`     Total RP to subtract: ${totalRPRollback.toFixed(2)}`);
console.log(`     Total PP to subtract: ${totalPPRollback.toFixed(2)}`);

console.log(`\n3️⃣  IMPORT 383 new corrected matches from Excel:`);
console.log(`     New RP to add: 2,716.00 (from analysis)`);
console.log(`     New PP to add: 4,074.00 (from analysis)`);

console.log(`\n4️⃣  NET CHANGE:`);
const netRP = 2716.00 - totalRPRollback;
const netPP = 4074.00 - totalPPRollback;
console.log(`     Net RP change: ${netRP > 0 ? '+' : ''}${netRP.toFixed(2)}`);
console.log(`     Net PP change: ${netPP > 0 ? '+' : ''}${netPP.toFixed(2)}`);

console.log('\n\n⚠️  IMPORTANT NOTES:');
console.log('─'.repeat(120));
console.log(`   • Rollback estimates are APPROXIMATE (actual may differ due to bonuses)`);
console.log(`   • Some players may have NEGATIVE points after rollback (will be set to 0)`);
console.log(`   • 11 matches involving PKL-000239 will NOT be imported (skipped)`);
console.log(`   • This operation affects ${sortedImpacts.length} players`);
console.log(`   • All September tournament history will be replaced with corrected data`);

console.log('\n\n📋 AFFECTED PLAYERS - FULL LIST:');
console.log('═'.repeat(120));

sortedImpacts.forEach((impact) => {
  const afterRP = Math.max(0, impact.currentRP - impact.estimatedRPToRollback);
  const afterPP = Math.max(0, impact.currentPP - impact.estimatedPPToRollback);
  
  console.log(`\n${impact.passportCode} - ${impact.username} (User ID: ${impact.userId})`);
  console.log(`  Matches in September: ${impact.septemberMatchCount}`);
  console.log(`  Current:  ${impact.currentRP.toFixed(2)} RP | ${impact.currentPP.toFixed(2)} PP`);
  console.log(`  Rollback: -${impact.estimatedRPToRollback.toFixed(2)} RP | -${impact.estimatedPPToRollback.toFixed(2)} PP`);
  console.log(`  After:    ${afterRP.toFixed(2)} RP | ${afterPP.toFixed(2)} PP`);
  
  if (afterRP === 0 || afterPP === 0) {
    console.log(`  ⚠️  WARNING: Points will be zeroed out after rollback`);
  }
});

console.log('\n\n' + '═'.repeat(120));
console.log('✅ DRY RUN ANALYSIS COMPLETE!');
console.log('═'.repeat(120));
console.log('\n📋 SUMMARY:');
console.log(`   • ${septemberMatches.length} matches will be DELETED`);
console.log(`   • ${sortedImpacts.length} players will have points ROLLED BACK`);
console.log(`   • 383 new matches will be IMPORTED with corrected calculations`);
console.log(`   • Net effect: ${netRP > 0 ? '+' : ''}${netRP.toFixed(2)} RP, ${netPP > 0 ? '+' : ''}${netPP.toFixed(2)} PP across all players`);

console.log('\n⚠️  NO CHANGES WERE MADE - This was a dry run only');
console.log('\n✅ Review this analysis and approve before proceeding with actual changes.');
console.log('═'.repeat(120));

process.exit(0);
