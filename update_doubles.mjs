import XLSX from 'xlsx';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const workbook = XLSX.readFile('attached_assets/9月第四周周赛成绩_1759638519282.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

const SYSTEM_B = { WIN: 3, LOSS: 1 };
const PICKLE_POINTS_MULTIPLIER = 1.5;

// Typo corrections
const TYPO_MAP = {
  'PZGEOT': 'PZGE0T',
  'VOR7AU': 'VQR7AU'
};

function fixTypo(code) {
  return TYPO_MAP[code] || code;
}

async function updateDoublesMatches() {
  console.log('='.repeat(80));
  console.log('UPDATING DATABASE - DOUBLES MATCHES ONLY');
  console.log('='.repeat(80));
  console.log('');
  
  const doublesMatches = [];
  const playerCodes = new Set();
  
  // Parse doubles matches only
  for (let i = 3; i < data.length; i++) {
    const row = data[i];
    let team1Player1 = String(row[0] || '').trim();
    let team1Player2 = String(row[1] || '').trim();
    let team2Player1 = String(row[2] || '').trim();
    let team2Player2 = String(row[3] || '').trim();
    const team1Score = parseInt(row[4]);
    const team2Score = parseInt(row[5]);
    
    if (!team1Player1 && !team2Player1) continue;
    
    // Skip singles matches
    const isSingles = (!team1Player2 && !team2Player2) || (team1Player2 === '' && team2Player2 === '');
    if (isSingles) continue;
    
    // Fix typos
    team1Player1 = fixTypo(team1Player1);
    team1Player2 = fixTypo(team1Player2);
    team2Player1 = fixTypo(team2Player1);
    team2Player2 = fixTypo(team2Player2);
    
    [team1Player1, team1Player2, team2Player1, team2Player2].forEach(code => {
      if (code) playerCodes.add(code);
    });
    
    doublesMatches.push({
      matchNumber: i - 2,
      team1: [team1Player1, team1Player2],
      team2: [team2Player1, team2Player2],
      team1Score,
      team2Score,
      winner: team1Score > team2Score ? 1 : 2
    });
  }
  
  console.log(`📊 Found ${doublesMatches.length} DOUBLES matches to process`);
  console.log(`🔧 Fixed ${Object.keys(TYPO_MAP).length} passport code typos`);
  console.log('');
  
  // Fetch all player data
  const codesArray = Array.from(playerCodes);
  const { rows: players } = await pool.query(
    `SELECT id, username, passport_code, gender, date_of_birth, ranking_points, 
            mens_doubles_ranking_points, womens_doubles_ranking_points, 
            mixed_doubles_men_ranking_points, mixed_doubles_women_ranking_points,
            pickle_points
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
      const team1Players = match.team1.map(code => playerMap[code]).filter(p => p);
      const team2Players = match.team2.map(code => playerMap[code]).filter(p => p);
      
      if (team1Players.length === 0 || team2Players.length === 0) {
        console.log(`⏭️  Match #${match.matchNumber}: Skipped (players not found)`);
        continue;
      }
      
      // Determine team gender composition
      const team1Genders = team1Players.map(p => p.gender);
      const team2Genders = team2Players.map(p => p.gender);
      
      const team1Mixed = team1Genders.includes('male') && team1Genders.includes('female');
      const team2Mixed = team2Genders.includes('male') && team2Genders.includes('female');
      
      console.log(`Match #${match.matchNumber}:`);
      
      // Update Team 1
      for (const player of team1Players) {
        const isWin = match.winner === 1;
        const age = player.date_of_birth ? new Date().getFullYear() - new Date(player.date_of_birth).getFullYear() : null;
        const ageGroup = getAgeGroup(age);
        const ageMult = getAgeMultiplier(ageGroup);
        const genderMult = player.gender === 'female' && player.ranking_points < 1000 ? 1.15 : 1.0;
        const basePoints = isWin ? SYSTEM_B.WIN : SYSTEM_B.LOSS;
        const rankingPoints = Math.round(basePoints * ageMult * genderMult * 100) / 100;
        const picklePoints = Math.round(rankingPoints * PICKLE_POINTS_MULTIPLIER);
        
        // Determine which ranking column to update
        let rankingColumn;
        if (team1Mixed && team2Mixed) {
          // Mixed vs Mixed
          rankingColumn = player.gender === 'male' ? 'mixed_doubles_men_ranking_points' : 'mixed_doubles_women_ranking_points';
        } else if (team1Mixed) {
          // Mixed team
          rankingColumn = player.gender === 'male' ? 'mixed_doubles_men_ranking_points' : 'mixed_doubles_women_ranking_points';
        } else if (team1Genders.every(g => g === 'male')) {
          // Men's doubles
          rankingColumn = 'mens_doubles_ranking_points';
        } else if (team1Genders.every(g => g === 'female')) {
          // Women's doubles
          rankingColumn = 'womens_doubles_ranking_points';
        } else {
          rankingColumn = 'doubles_ranking_points'; // Fallback
        }
        
        await pool.query(
          `UPDATE users 
           SET ${rankingColumn} = COALESCE(${rankingColumn}, 0) + $1,
               pickle_points = COALESCE(pickle_points, 0) + $2
           WHERE id = $3`,
          [rankingPoints, picklePoints, player.id]
        );
        
        console.log(`  ✓ ${player.passport_code} (${player.username}): +${rankingPoints} pts → ${rankingColumn}, +${picklePoints} Pickle Pts`);
        pointsUpdated++;
      }
      
      // Update Team 2
      for (const player of team2Players) {
        const isWin = match.winner === 2;
        const age = player.date_of_birth ? new Date().getFullYear() - new Date(player.date_of_birth).getFullYear() : null;
        const ageGroup = getAgeGroup(age);
        const ageMult = getAgeMultiplier(ageGroup);
        const genderMult = player.gender === 'female' && player.ranking_points < 1000 ? 1.15 : 1.0;
        const basePoints = isWin ? SYSTEM_B.WIN : SYSTEM_B.LOSS;
        const rankingPoints = Math.round(basePoints * ageMult * genderMult * 100) / 100;
        const picklePoints = Math.round(rankingPoints * PICKLE_POINTS_MULTIPLIER);
        
        let rankingColumn;
        if (team1Mixed && team2Mixed) {
          rankingColumn = player.gender === 'male' ? 'mixed_doubles_men_ranking_points' : 'mixed_doubles_women_ranking_points';
        } else if (team2Mixed) {
          rankingColumn = player.gender === 'male' ? 'mixed_doubles_men_ranking_points' : 'mixed_doubles_women_ranking_points';
        } else if (team2Genders.every(g => g === 'male')) {
          rankingColumn = 'mens_doubles_ranking_points';
        } else if (team2Genders.every(g => g === 'female')) {
          rankingColumn = 'womens_doubles_ranking_points';
        } else {
          rankingColumn = 'doubles_ranking_points';
        }
        
        await pool.query(
          `UPDATE users 
           SET ${rankingColumn} = COALESCE(${rankingColumn}, 0) + $1,
               pickle_points = COALESCE(pickle_points, 0) + $2
           WHERE id = $3`,
          [rankingPoints, picklePoints, player.id]
        );
        
        console.log(`  ✓ ${player.passport_code} (${player.username}): +${rankingPoints} pts → ${rankingColumn}, +${picklePoints} Pickle Pts`);
        pointsUpdated++;
      }
      
      matchesProcessed++;
    }
    
    await pool.query('COMMIT');
    
    console.log('');
    console.log('='.repeat(80));
    console.log('✅ DATABASE UPDATE COMPLETE');
    console.log('='.repeat(80));
    console.log(`   Matches Processed: ${matchesProcessed}`);
    console.log(`   Player Records Updated: ${pointsUpdated}`);
    console.log(`   Typos Fixed: PZGEOT → PZGE0T, VOR7AU → VQR7AU`);
    console.log(`   Ranking Points: ADDED to appropriate doubles columns`);
    console.log(`   Pickle Points: ADDED to pickle_points column`);
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
  if (age < 19) return 'U19';
  return 'Open';
}

function getAgeMultiplier(ageGroup) {
  const mult = { 'Pro': 1.0, 'Open': 1.0, 'U19': 1.0, '35+': 1.2, '50+': 1.3, '60+': 1.5, '70+': 1.6 };
  return mult[ageGroup] || 1.0;
}

updateDoublesMatches().catch(console.error);
