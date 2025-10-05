import XLSX from 'xlsx';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const workbook = XLSX.readFile('attached_assets/9月第四周周赛成绩_1759638519282.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

const SYSTEM_B = { WIN: 3, LOSS: 1 };
const PICKLE_POINTS_MULTIPLIER = 1.5;

const TYPO_MAP = { 'PZGEOT': 'PZGE0T', 'VOR7AU': 'VQR7AU' };
function fixTypo(code) { return TYPO_MAP[code] || code; }

async function updateDoublesMatches() {
  console.log('='.repeat(80));
  console.log('UPDATING DATABASE - DOUBLES MATCHES ONLY');
  console.log('='.repeat(80));
  console.log('');
  
  const doublesMatches = [];
  const playerCodes = new Set();
  
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    let team1Player1 = fixTypo(String(row[0] || '').trim());
    let team1Player2 = fixTypo(String(row[1] || '').trim());
    let team2Player1 = fixTypo(String(row[2] || '').trim());
    let team2Player2 = fixTypo(String(row[3] || '').trim());
    
    if (!team1Player1 && !team2Player1) continue;
    
    const isSingles = (!team1Player2 && !team2Player2) || (team1Player2 === '' && team2Player2 === '');
    if (isSingles) continue;
    
    [team1Player1, team1Player2, team2Player1, team2Player2].forEach(code => {
      if (code) playerCodes.add(code);
    });
    
    doublesMatches.push({
      matchNumber: i - 2,
      team1: [team1Player1, team1Player2],
      team2: [team2Player1, team2Player2],
      team1Score: parseInt(row[4]),
      team2Score: parseInt(row[5]),
      winner: parseInt(row[4]) > parseInt(row[5]) ? 1 : 2
    });
  }
  
  console.log(`📊 Found ${doublesMatches.length} DOUBLES matches`);
  console.log(`🔧 Auto-fixed typos: PZGEOT→PZGE0T, VOR7AU→VQR7AU`);
  console.log('');
  
  const codesArray = Array.from(playerCodes);
  const { rows: players } = await pool.query(
    `SELECT id, username, passport_code, gender, date_of_birth, ranking_points, 
            doubles_ranking_points, pickle_points
     FROM users WHERE passport_code = ANY($1::text[])`,
    [codesArray]
  );
  
  const playerMap = {};
  players.forEach(p => playerMap[p.passport_code] = p);
  
  console.log(`Found ${players.length}/${playerCodes.size} players in database`);
  console.log('');
  console.log('='.repeat(80));
  console.log('PROCESSING MATCHES...');
  console.log('='.repeat(80));
  console.log('');
  
  let matchesProcessed = 0;
  let pointsUpdated = 0;
  
  await pool.query('BEGIN');
  
  try {
    for (const match of doublesMatches) {
      const allPlayers = [...match.team1, ...match.team2]
        .map(code => playerMap[code])
        .filter(p => p);
      
      if (allPlayers.length === 0) {
        console.log(`⏭️  Match #${match.matchNumber}: Skipped (players not found)`);
        continue;
      }
      
      console.log(`Match #${match.matchNumber} (${match.team1Score}-${match.team2Score}):`);
      
      // Process all 4 players
      for (let i = 0; i < match.team1.length; i++) {
        const player = playerMap[match.team1[i]];
        if (!player) continue;
        
        const isWin = match.winner === 1;
        const age = player.date_of_birth ? new Date().getFullYear() - new Date(player.date_of_birth).getFullYear() : null;
        const ageMult = getAgeMultiplier(getAgeGroup(age));
        const genderMult = player.gender === 'female' && player.ranking_points < 1000 ? 1.15 : 1.0;
        const basePoints = isWin ? SYSTEM_B.WIN : SYSTEM_B.LOSS;
        const rankingPoints = Math.round(basePoints * ageMult * genderMult * 100) / 100;
        const picklePoints = Math.round(rankingPoints * PICKLE_POINTS_MULTIPLIER);
        
        await pool.query(
          `UPDATE users 
           SET doubles_ranking_points = COALESCE(doubles_ranking_points, 0) + $1,
               pickle_points = COALESCE(pickle_points, 0) + $2
           WHERE id = $3`,
          [rankingPoints, picklePoints, player.id]
        );
        
        console.log(`  ${isWin ? '🏆' : '❌'} ${player.passport_code}: +${rankingPoints} ranking pts, +${picklePoints} Pickle pts`);
        pointsUpdated++;
      }
      
      for (let i = 0; i < match.team2.length; i++) {
        const player = playerMap[match.team2[i]];
        if (!player) continue;
        
        const isWin = match.winner === 2;
        const age = player.date_of_birth ? new Date().getFullYear() - new Date(player.date_of_birth).getFullYear() : null;
        const ageMult = getAgeMultiplier(getAgeGroup(age));
        const genderMult = player.gender === 'female' && player.ranking_points < 1000 ? 1.15 : 1.0;
        const basePoints = isWin ? SYSTEM_B.WIN : SYSTEM_B.LOSS;
        const rankingPoints = Math.round(basePoints * ageMult * genderMult * 100) / 100;
        const picklePoints = Math.round(rankingPoints * PICKLE_POINTS_MULTIPLIER);
        
        await pool.query(
          `UPDATE users 
           SET doubles_ranking_points = COALESCE(doubles_ranking_points, 0) + $1,
               pickle_points = COALESCE(pickle_points, 0) + $2
           WHERE id = $3`,
          [rankingPoints, picklePoints, player.id]
        );
        
        console.log(`  ${isWin ? '🏆' : '❌'} ${player.passport_code}: +${rankingPoints} ranking pts, +${picklePoints} Pickle pts`);
        pointsUpdated++;
      }
      
      matchesProcessed++;
    }
    
    await pool.query('COMMIT');
    
    console.log('');
    console.log('='.repeat(80));
    console.log('✅ DATABASE UPDATE COMPLETE - DOUBLES ONLY');
    console.log('='.repeat(80));
    console.log(`   Matches Processed: ${matchesProcessed}`);
    console.log(`   Player Updates: ${pointsUpdated}`);
    console.log(`   Points Column: doubles_ranking_points (numeric, 2 decimals)`);
    console.log(`   Pickle Points: Added to pickle_points`);
    console.log(`   Algorithm: System B (3 win / 1 loss) with age & gender multipliers`);
    console.log('='.repeat(80));
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ ERROR:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

function getAgeGroup(age) {
  if (!age) return 'Open';
  if (age >= 70) return '70+';
  if (age >= 60) return '60+';
  if (age >= 50) return '50+';
  if (age >= 35) return '35+';
  return age < 19 ? 'U19' : 'Open';
}

function getAgeMultiplier(ageGroup) {
  const mult = { 'Pro': 1.0, 'Open': 1.0, 'U19': 1.0, '35+': 1.2, '50+': 1.3, '60+': 1.5, '70+': 1.6 };
  return mult[ageGroup] || 1.0;
}

updateDoublesMatches().catch(console.error);
