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

const SYSTEM_B = { WIN: 3, LOSS: 1 };

async function analyzeMatches() {
  console.log('='.repeat(80));
  console.log('PICKLE+ MATCH ANALYSIS REPORT');
  console.log('='.repeat(80));
  console.log('');
  
  const matches = [];
  const playerCodes = new Set();
  const codeOccurrences = {};
  
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    const team1Player1 = String(row[0] || '').trim();
    const team1Player2 = String(row[1] || '').trim();
    const team2Player1 = String(row[2] || '').trim();
    const team2Player2 = String(row[3] || '').trim();
    const team1Score = parseInt(row[4]);
    const team2Score = parseInt(row[5]);
    const dateValue = row[6];
    
    if (!team1Player1 && !team2Player1) continue;
    
    const isSingles = (!team1Player2 && !team2Player2) || (team1Player2 === '' && team2Player2 === '');
    
    [team1Player1, team1Player2, team2Player1, team2Player2].forEach(code => {
      if (code) {
        playerCodes.add(code);
        codeOccurrences[code] = (codeOccurrences[code] || 0) + 1;
      }
    });
    
    matches.push({
      matchNumber: i - 2,
      type: isSingles ? 'SINGLES' : 'DOUBLES',
      team1: { player1: team1Player1, player2: team1Player2 },
      team2: { player1: team2Player1, player2: team2Player2 },
      team1Score,
      team2Score,
      winner: team1Score > team2Score ? 'Team 1' : 'Team 2',
      dateValue
    });
  }
  
  console.log(`📊 MATCH SUMMARY`);
  console.log(`Total Matches Parsed: ${matches.length}`);
  console.log(`Singles Matches: ${matches.filter(m => m.type === 'SINGLES').length}`);
  console.log(`Doubles Matches: ${matches.filter(m => m.type === 'DOUBLES').length}`);
  console.log(`Total Unique Passport Codes: ${playerCodes.size}`);
  console.log('');
  
  console.log('🔍 FETCHING PLAYER DATA FROM DATABASE...');
  const codesArray = Array.from(playerCodes);
  const playerQuery = `
    SELECT id, username, passport_code, gender, date_of_birth, ranking_points
    FROM users
    WHERE passport_code = ANY($1::text[])
  `;
  
  const { rows: players } = await pool.query(playerQuery, [codesArray]);
  const playerMap = {};
  players.forEach(p => {
    playerMap[p.passport_code] = p;
  });
  
  console.log(`Found ${players.length}/${playerCodes.size} players in database`);
  console.log('');
  
  console.log('🔧 PASSPORT CODE ANALYSIS:');
  const notFoundCodes = codesArray.filter(code => !playerMap[code]);
  if (notFoundCodes.length > 0) {
    console.log(`⚠️  ${notFoundCodes.length} passport codes NOT FOUND:`);
    for (const code of notFoundCodes) {
      console.log(`   - ${code} (appears ${codeOccurrences[code]} times)`);
      
      const allDBCodes = await pool.query('SELECT passport_code FROM users WHERE passport_code IS NOT NULL');
      const similarCodes = allDBCodes.rows
        .map(r => r.passport_code)
        .filter(dbCode => {
          const distance = levenshteinDistance(code.toUpperCase(), dbCode.toUpperCase());
          return distance <= 2 && distance > 0;
        });
      
      if (similarCodes.length > 0) {
        console.log(`     💡 Possible typo? Similar codes:`);
        for (const similar of similarCodes.slice(0, 3)) {
          const playerInfo = await pool.query('SELECT username FROM users WHERE passport_code = $1', [similar]);
          console.log(`        → ${similar} (${playerInfo.rows[0]?.username || 'unknown'})`);
        }
      }
    }
    console.log('');
  } else {
    console.log('✅ All passport codes found in database!');
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log('DETAILED MATCH ANALYSIS (First 5 Matches)');
  console.log('='.repeat(80));
  console.log('');
  
  for (const match of matches.slice(0, 5)) {
    console.log(`${'─'.repeat(80)}`);
    console.log(`MATCH #${match.matchNumber} - ${match.type}`);
    console.log(`Score: Team 1 (${match.team1Score}) vs Team 2 (${match.team2Score}) - Winner: ${match.winner}`);
    console.log(`${'─'.repeat(80)}`);
    
    console.log('TEAM 1:');
    const team1Players = [match.team1.player1, match.team1.player2].filter(c => c);
    for (const code of team1Players) {
      const player = playerMap[code];
      if (!player) {
        console.log(`  ❌ ${code} - NOT FOUND`);
        continue;
      }
      
      const isWin = match.winner === 'Team 1';
      const age = player.date_of_birth ? new Date().getFullYear() - new Date(player.date_of_birth).getFullYear() : null;
      const ageGroup = getAgeGroup(age);
      const ageMultiplier = getAgeMultiplier(ageGroup);
      const genderMultiplier = player.gender === 'female' && player.ranking_points < 1000 ? 1.15 : 1.0;
      const basePoints = isWin ? SYSTEM_B.WIN : SYSTEM_B.LOSS;
      
      const rankingPoints = Math.round(basePoints * ageMultiplier * genderMultiplier * 100) / 100;
      
      console.log(`  ✓ ${code} - ${player.username}`);
      console.log(`    Gender: ${player.gender || 'unknown'} | Age: ${age || '?'} (${ageGroup}) | Current: ${player.ranking_points || 0} pts`);
      console.log(`    Result: ${isWin ? '🏆 WIN' : '❌ LOSS'}`);
      console.log(`    Calc: ${basePoints} × ${ageMultiplier} (age) × ${genderMultiplier} (gender) = ${rankingPoints} pts`);
      console.log(`    New Total: ${player.ranking_points || 0} + ${rankingPoints} = ${(player.ranking_points || 0) + rankingPoints} pts`);
    }
    
    console.log('');
    console.log('TEAM 2:');
    const team2Players = [match.team2.player1, match.team2.player2].filter(c => c);
    for (const code of team2Players) {
      const player = playerMap[code];
      if (!player) {
        console.log(`  ❌ ${code} - NOT FOUND`);
        continue;
      }
      
      const isWin = match.winner === 'Team 2';
      const age = player.date_of_birth ? new Date().getFullYear() - new Date(player.date_of_birth).getFullYear() : null;
      const ageGroup = getAgeGroup(age);
      const ageMultiplier = getAgeMultiplier(ageGroup);
      const genderMultiplier = player.gender === 'female' && player.ranking_points < 1000 ? 1.15 : 1.0;
      const basePoints = isWin ? SYSTEM_B.WIN : SYSTEM_B.LOSS;
      
      const rankingPoints = Math.round(basePoints * ageMultiplier * genderMultiplier * 100) / 100;
      
      console.log(`  ✓ ${code} - ${player.username}`);
      console.log(`    Gender: ${player.gender || 'unknown'} | Age: ${age || '?'} (${ageGroup}) | Current: ${player.ranking_points || 0} pts`);
      console.log(`    Result: ${isWin ? '🏆 WIN' : '❌ LOSS'}`);
      console.log(`    Calc: ${basePoints} × ${ageMultiplier} (age) × ${genderMultiplier} (gender) = ${rankingPoints} pts`);
      console.log(`    New Total: ${player.ranking_points || 0} + ${rankingPoints} = ${(player.ranking_points || 0) + rankingPoints} pts`);
    }
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log(`✅ ANALYSIS COMPLETE - NO DATABASE CHANGES MADE`);
  console.log(`   Total: ${matches.length} matches | Singles: ${matches.filter(m => m.type === 'SINGLES').length} | Doubles: ${matches.filter(m => m.type === 'DOUBLES').length}`);
  console.log('='.repeat(80));
  
  await pool.end();
}

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
  const multipliers = { 'Pro': 1.0, 'Open': 1.0, 'U19': 1.0, '35+': 1.2, '50+': 1.3, '60+': 1.5, '70+': 1.6 };
  return multipliers[ageGroup] || 1.0;
}

analyzeMatches().catch(console.error);
