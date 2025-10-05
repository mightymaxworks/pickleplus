import XLSX from 'xlsx';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const workbook = XLSX.readFile('attached_assets/9月第四周周赛成绩_1759638519282.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

const SYSTEM_B = { WIN: 3, LOSS: 1 };
const PICKLE_POINTS_MULTIPLIER = 1.5;

console.log('='.repeat(80));
console.log('SINGLES MATCH POINTS ALLOCATION ANALYSIS');
console.log('='.repeat(80));
console.log('');

console.log('📋 ALGORITHM RULES FOR SINGLES:');
console.log('   ✓ Base Points: WIN = 3, LOSS = 1 (System B)');
console.log('   ✓ NO difference from doubles - same base points!');
console.log('   ✓ Age multipliers apply the same way');
console.log('   ✓ Gender multipliers apply in cross-gender singles (<1000 pts)');
console.log('   ✓ Points go to: singlesRankingPoints column');
console.log('');

console.log('💰 PICKLE POINTS ALLOCATION:');
console.log('   ✓ Rate: Ranking Points × 1.5 per match');
console.log('   ✓ Win 3 pts → Get 3 ranking + 4.5 ≈ 5 Pickle Points');
console.log('   ✓ Loss 1 pt → Get 1 ranking + 1.5 ≈ 2 Pickle Points');
console.log('   ✓ With multipliers: e.g., 3.6 ranking → 5.4 ≈ 5 Pickle Points');
console.log('');
console.log('='.repeat(80));
console.log('');

// Find singles matches
const singlesMatches = [];
for (let i = 3; i < data.length; i++) {
  const row = data[i];
  const team1Player1 = String(row[0] || '').trim();
  const team1Player2 = String(row[1] || '').trim();
  const team2Player1 = String(row[2] || '').trim();
  const team2Player2 = String(row[3] || '').trim();
  
  if (!team1Player1 && !team2Player1) continue;
  
  const isSingles = (!team1Player2 && !team2Player2) || (team1Player2 === '' && team2Player2 === '');
  
  if (isSingles) {
    singlesMatches.push({
      matchNumber: i - 2,
      player1Code: team1Player1,
      player2Code: team2Player1,
      player1Score: parseInt(row[4]),
      player2Score: parseInt(row[5]),
      winner: parseInt(row[4]) > parseInt(row[5]) ? 'Player 1' : 'Player 2'
    });
  }
}

console.log(`SINGLES MATCHES FOUND: ${singlesMatches.length}`);
console.log('');

// Fetch player data
const allCodes = singlesMatches.flatMap(m => [m.player1Code, m.player2Code]);
const { rows: players } = await pool.query(
  'SELECT id, username, passport_code, gender, date_of_birth, ranking_points FROM users WHERE passport_code = ANY($1::text[])',
  [allCodes]
);

const playerMap = {};
players.forEach(p => playerMap[p.passport_code] = p);

// Analyze first 3 singles matches
console.log('DETAILED SINGLES EXAMPLES (First 3):');
console.log('');

for (const match of singlesMatches.slice(0, 3)) {
  const p1 = playerMap[match.player1Code];
  const p2 = playerMap[match.player2Code];
  
  console.log(`${'─'.repeat(80)}`);
  console.log(`SINGLES MATCH #${match.matchNumber}`);
  console.log(`Score: ${match.player1Score} - ${match.player2Score} | Winner: ${match.winner}`);
  console.log(`${'─'.repeat(80)}`);
  
  if (p1) {
    const isWin = match.winner === 'Player 1';
    const age = p1.date_of_birth ? new Date().getFullYear() - new Date(p1.date_of_birth).getFullYear() : null;
    const ageGroup = getAgeGroup(age);
    const ageMult = getAgeMultiplier(ageGroup);
    const genderMult = p1.gender === 'female' && p1.ranking_points < 1000 ? 1.15 : 1.0;
    const basePoints = isWin ? SYSTEM_B.WIN : SYSTEM_B.LOSS;
    const rankingPoints = Math.round(basePoints * ageMult * genderMult * 100) / 100;
    const picklePoints = Math.round(rankingPoints * PICKLE_POINTS_MULTIPLIER);
    
    console.log(`${match.player1Code} - ${p1.username}`);
    console.log(`  Gender: ${p1.gender || 'unknown'} | Age: ${age || '?'} (${ageGroup})`);
    console.log(`  Result: ${isWin ? '🏆 WIN' : '❌ LOSS'}`);
    console.log(`  📊 Ranking Points: ${basePoints} × ${ageMult} (age) × ${genderMult} (gender) = ${rankingPoints} pts`);
    console.log(`  🎮 Pickle Points: ${rankingPoints} × 1.5 = ${rankingPoints * PICKLE_POINTS_MULTIPLIER} ≈ ${picklePoints} pts`);
    console.log(`  💾 Database: ADD ${rankingPoints} to singlesRankingPoints`);
    console.log(`  💾 Database: ADD ${picklePoints} to picklePoints`);
  } else {
    console.log(`${match.player1Code} - NOT FOUND`);
  }
  
  console.log('');
  
  if (p2) {
    const isWin = match.winner === 'Player 2';
    const age = p2.date_of_birth ? new Date().getFullYear() - new Date(p2.date_of_birth).getFullYear() : null;
    const ageGroup = getAgeGroup(age);
    const ageMult = getAgeMultiplier(ageGroup);
    const genderMult = p2.gender === 'female' && p2.ranking_points < 1000 ? 1.15 : 1.0;
    const basePoints = isWin ? SYSTEM_B.WIN : SYSTEM_B.LOSS;
    const rankingPoints = Math.round(basePoints * ageMult * genderMult * 100) / 100;
    const picklePoints = Math.round(rankingPoints * PICKLE_POINTS_MULTIPLIER);
    
    console.log(`${match.player2Code} - ${p2.username}`);
    console.log(`  Gender: ${p2.gender || 'unknown'} | Age: ${age || '?'} (${ageGroup})`);
    console.log(`  Result: ${isWin ? '🏆 WIN' : '❌ LOSS'}`);
    console.log(`  📊 Ranking Points: ${basePoints} × ${ageMult} (age) × ${genderMult} (gender) = ${rankingPoints} pts`);
    console.log(`  🎮 Pickle Points: ${rankingPoints} × 1.5 = ${rankingPoints * PICKLE_POINTS_MULTIPLIER} ≈ ${picklePoints} pts`);
    console.log(`  💾 Database: ADD ${rankingPoints} to singlesRankingPoints`);
    console.log(`  💾 Database: ADD ${picklePoints} to picklePoints`);
  } else {
    console.log(`${match.player2Code} - NOT FOUND`);
  }
  
  console.log('');
}

console.log('='.repeat(80));
console.log('KEY FINDINGS:');
console.log('='.repeat(80));
console.log('1. Singles uses EXACT SAME base points as doubles (3/1)');
console.log('2. NO bonus for singles vs doubles - they are equal');
console.log('3. Points go to SINGLES RANKING COLUMN (not general ranking)');
console.log('4. Pickle Points = Ranking Points × 1.5 (rounded to whole number)');
console.log('5. Both ranking and Pickle Points are ADDED to existing totals');
console.log('='.repeat(80));

await pool.end();

function getAgeGroup(age) {
  if (!age) return 'Open';
  if (age >= 70) return '70+';
  if (age >= 60) return '60+';
  if (age >= 50) return '50+';
  if (age >= 35) return '35+';
  if (age < 19) return 'U19';
  return 'Open';
}

function getAgeMultiplier(ageGroup) {
  const mult = { 'Pro': 1.0, 'Open': 1.0, 'U19': 1.0, '35+': 1.2, '50+': 1.3, '60+': 1.5, '70+': 1.6 };
  return mult[ageGroup] || 1.0;
}
