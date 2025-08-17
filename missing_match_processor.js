/**
 * MISSING MATCH PROCESSOR - Match 14
 * Adding the 9th match that was missed from the second screenshot
 */

console.log('🔍 PROCESSING MISSING MATCH - Match 14');
console.log('=====================================');

// Based on careful re-examination of the second screenshot
// There should be a 4th match (第14场) that I initially missed

const missingMatch = {
  id: 'NEW_14',
  description: 'Match 14: 1号邓卓/3号森林 vs 2号融霸霸龙公/5号Jeff (15-12)',
  players: {
    team1: [252, 228], // 邓卓, 森林
    team2: [248, 245]  // 龙公子, Jeff
  },
  winner: 1, // Team 1 wins (邓卓/森林)
  score: [15, 12]
};

// Player database
const players = {
  252: { name: '邓卓 (TANGCHEUK)', passport: '42SWC6', age: 25 },
  248: { name: '龙公子 (AllanLee)', passport: 'CXGSCH', age: 28 },
  228: { name: '森林 (JulianJiu)', passport: 'COGQ1N', age: 30 },
  245: { name: 'Jeff (Jeffhe)', passport: 'EUBPLM', age: 32 }
};

function calculateMissingMatchPoints() {
  console.log(`🎾 ${missingMatch.id}: ${missingMatch.description}`);
  
  const winningTeam = missingMatch.winner === 1 ? missingMatch.players.team1 : missingMatch.players.team2;
  const losingTeam = missingMatch.winner === 1 ? missingMatch.players.team2 : missingMatch.players.team1;

  // Calculate base points (System B)
  const winPoints = 3; // Base win points
  const lossPoints = 1; // Base loss points
  const tournamentMultiplier = 1.0; // Local club event

  const results = {
    winners: [],
    losers: [],
    totalRankingPoints: 0,
    totalPicklePoints: 0
  };

  // Process winners
  winningTeam.forEach(playerId => {
    const player = players[playerId];
    const ageMultiplier = getAgeMultiplier(player.age || 30); // Default age if not specified
    const finalPoints = winPoints * ageMultiplier * tournamentMultiplier;
    const picklePoints = finalPoints * 1.5; // 1.5x multiplier per match
    
    results.winners.push({
      playerId,
      name: player.name,
      rankingPoints: finalPoints,
      picklePoints: picklePoints
    });
    
    results.totalRankingPoints += finalPoints;
    results.totalPicklePoints += picklePoints;

    console.log(`  ✅ Winner ${playerId} (${player.name}): ${finalPoints.toFixed(2)} ranking points | ${picklePoints.toFixed(2)} Pickle Points`);
  });

  // Process losers
  losingTeam.forEach(playerId => {
    const player = players[playerId];
    const ageMultiplier = getAgeMultiplier(player.age || 30); // Default age if not specified
    const finalPoints = lossPoints * ageMultiplier * tournamentMultiplier;
    const picklePoints = finalPoints * 1.5; // 1.5x multiplier per match
    
    results.losers.push({
      playerId,
      name: player.name,
      rankingPoints: finalPoints,
      picklePoints: picklePoints
    });
    
    results.totalRankingPoints += finalPoints;
    results.totalPicklePoints += picklePoints;

    console.log(`  ❌ Loser ${playerId} (${player.name}): ${finalPoints.toFixed(2)} ranking points | ${picklePoints.toFixed(2)} Pickle Points`);
  });

  console.log('\n📊 MISSING MATCH TOTALS:');
  console.log(`Total Ranking Points: ${results.totalRankingPoints.toFixed(2)}`);
  console.log(`Total Pickle Points: ${results.totalPicklePoints.toFixed(2)}`);
  
  return results;
}

function getAgeMultiplier(age) {
  if (age >= 70) return 1.6;  // 70+
  if (age >= 60) return 1.5;  // 60+
  if (age >= 50) return 1.3;  // 50+
  if (age >= 35) return 1.2;  // 35+
  return 1.0;  // Open (19-34)
}

// Execute calculation
const results = calculateMissingMatchPoints();

console.log('\n✅ MATCH COUNT CORRECTION:');
console.log('Previously processed: 8 matches');
console.log('Missing match found: 1 match');
console.log('New total: 9 matches ✓');
console.log('\n🔢 STATUS: Ready to insert missing match into database');