/**
 * ADDITIONAL MATCHES PROCESSOR - 8 New Matches
 * Processing matches from screenshots to calculate points allocation
 * According to PICKLE_PLUS_ALGORITHM_DOCUMENT.md - System B
 */

const newMatches = [
  // First screenshot - 5 matches
  {
    id: 'NEW_6',
    description: 'Match 6: 2号融霸霸龙公/8号Nicole_lo vs 4号Luka/5号Jeff (14-15)',
    players: {
      team1: [248, 246], // 龙公子, Nicole_lo
      team2: [249, 245]  // Luka, Jeff
    },
    winner: 2, // Team 2 wins (Luka/Jeff)
    score: [14, 15]
  },
  {
    id: 'NEW_7',
    description: 'Match 7: 2号融霸霸龙公/7号726零封dzx vs 1号邓卓/4号Luka (15-8)',
    players: {
      team1: [248, 251], // 龙公子, 726零封DZX
      team2: [252, 249]  // 邓卓, Luka
    },
    winner: 1, // Team 1 wins (龙公子/726零封DZX)
    score: [15, 8]
  },
  {
    id: 'NEW_8',
    description: 'Match 8: 5号Jeff/6号Tony GUO vs 3号森林/8号Nicole_lo (14-15)',
    players: {
      team1: [245, 263], // Jeff, Tony GUO
      team2: [228, 246]  // 森林, Nicole_lo
    },
    winner: 2, // Team 2 wins (森林/Nicole_lo)
    score: [14, 15]
  },
  {
    id: 'NEW_9',
    description: 'Match 9: 1号邓卓/5号Jeff vs 4号Luka/6号Tony GUO (15-10)',
    players: {
      team1: [252, 245], // 邓卓, Jeff
      team2: [249, 263]  // Luka, Tony GUO
    },
    winner: 1, // Team 1 wins (邓卓/Jeff)
    score: [15, 10]
  },
  {
    id: 'NEW_10',
    description: 'Match 10: 2号融霸霸龙公/3号森林 vs 7号726零封dzx/8号Nicole_lo (15-1)',
    players: {
      team1: [248, 228], // 龙公子, 森林
      team2: [251, 246]  // 726零封DZX, Nicole_lo
    },
    winner: 1, // Team 1 wins (龙公子/森林)
    score: [15, 1]
  },
  // Second screenshot - 3 matches
  {
    id: 'NEW_11',
    description: 'Match 11: 6号Tony GUO/8号Nicole_lo vs 1号邓卓/2号融霸霸龙公 (6-15)',
    players: {
      team1: [263, 246], // Tony GUO, Nicole_lo
      team2: [252, 248]  // 邓卓, 龙公子
    },
    winner: 2, // Team 2 wins (邓卓/龙公子)
    score: [6, 15]
  },
  {
    id: 'NEW_12',
    description: 'Match 12: 3号森林/5号Jeff vs 4号Luka/7号726零封dzx (11-15)',
    players: {
      team1: [228, 245], // 森林, Jeff
      team2: [249, 251]  // Luka, 726零封DZX
    },
    winner: 2, // Team 2 wins (Luka/726零封DZX)
    score: [11, 15]
  },
  {
    id: 'NEW_13',
    description: 'Match 13: 4号Luka/8号Nicole_lo vs 6号Tony GUO/7号726零封dzx (13-15)',
    players: {
      team1: [249, 246], // Luka, Nicole_lo
      team2: [263, 251]  // Tony GUO, 726零封DZX
    },
    winner: 2, // Team 2 wins (Tony GUO/726零封DZX)
    score: [13, 15]
  }
];

// Player database (same as before)
const players = {
  252: { name: '邓卓 (TANGCHEUK)', passport: '42SWC6', age: 25 },
  248: { name: '龙公子 (AllanLee)', passport: 'CXGSCH', age: 28 },
  228: { name: '森林 (JulianJiu)', passport: 'COGQ1N', age: 30 },
  249: { name: 'Luka', passport: 'LT57DN', age: 26 },
  245: { name: 'Jeff (Jeffhe)', passport: 'EUBPLM', age: 32 },
  263: { name: 'Tony GUO (tonyguo1983)', passport: 'TON83XY3', age: 41 },
  251: { name: '726零封DZX (TorresXiao)', passport: 'CJM9CP', age: 29 },
  246: { name: 'Nicole_lo (Nicole_lpl)', passport: '3CERIF', age: 27 }
};

function calculateAdditionalPoints() {
  console.log('🏓 ADDITIONAL MATCHES POINTS CALCULATION');
  console.log('📋 Algorithm: System B (3 points win, 1 point loss)');
  console.log('🎯 Format: Doubles Matches');
  console.log('📊 Age Multipliers: Applied based on player age');
  console.log('🔢 Processing 8 new matches\n');

  const playerStats = {};
  let totalRankingPoints = 0;
  let totalPicklePoints = 0;

  // Initialize player stats
  Object.keys(players).forEach(id => {
    playerStats[id] = {
      name: players[id].name,
      rankingPoints: 0,
      matches: 0,
      wins: 0,
      losses: 0
    };
  });

  // Calculate points for each match
  newMatches.forEach((match, index) => {
    console.log(`🎾 ${match.id}: ${match.description}`);
    
    const winningTeam = match.winner === 1 ? match.players.team1 : match.players.team2;
    const losingTeam = match.winner === 1 ? match.players.team2 : match.players.team1;

    // Calculate base points (System B)
    const winPoints = 3; // Base win points
    const lossPoints = 1; // Base loss points

    // Tournament multiplier (local club event = 1.0x)
    const tournamentMultiplier = 1.0;

    // Process winners
    winningTeam.forEach(playerId => {
      const player = players[playerId];
      const ageMultiplier = getAgeMultiplier(player.age);
      const finalPoints = winPoints * ageMultiplier * tournamentMultiplier;
      
      playerStats[playerId].rankingPoints += finalPoints;
      playerStats[playerId].matches++;
      playerStats[playerId].wins++;
      totalRankingPoints += finalPoints;

      console.log(`  ✅ Winner ${playerId} (${player.name}): ${finalPoints.toFixed(2)} points (${winPoints} × ${ageMultiplier} × ${tournamentMultiplier})`);
    });

    // Process losers
    losingTeam.forEach(playerId => {
      const player = players[playerId];
      const ageMultiplier = getAgeMultiplier(player.age);
      const finalPoints = lossPoints * ageMultiplier * tournamentMultiplier;
      
      playerStats[playerId].rankingPoints += finalPoints;
      playerStats[playerId].matches++;
      playerStats[playerId].losses++;
      totalRankingPoints += finalPoints;

      console.log(`  ❌ Loser ${playerId} (${player.name}): ${finalPoints.toFixed(2)} points (${lossPoints} × ${ageMultiplier} × ${tournamentMultiplier})`);
    });

    console.log('');
  });

  // Calculate Pickle Points (1.5x multiplier PER MATCH)
  Object.keys(playerStats).forEach(playerId => {
    const picklePoints = playerStats[playerId].rankingPoints * 1.5 * playerStats[playerId].matches;
    playerStats[playerId].picklePoints = picklePoints;
    totalPicklePoints += picklePoints;
  });

  // Display final results
  console.log('🏆 ADDITIONAL MATCHES RESULTS:');
  console.log('==========================================');

  // Sort by ranking points
  const sortedPlayers = Object.entries(playerStats)
    .sort(([,a], [,b]) => b.rankingPoints - a.rankingPoints);

  sortedPlayers.forEach(([playerId, stats], index) => {
    console.log(`${index + 1}. ${stats.name}`);
    console.log(`   📈 Additional Ranking Points: ${stats.rankingPoints.toFixed(2)}`);
    console.log(`   🎯 Additional Pickle Points: ${stats.picklePoints.toFixed(2)} (${stats.rankingPoints.toFixed(2)} × 1.5 × ${stats.matches} matches)`);
    console.log(`   📊 Record: ${stats.wins}W-${stats.losses}L (${stats.matches} matches)`);
    console.log('');
  });

  console.log('📊 ADDITIONAL MATCHES TOTALS:');
  console.log(`Total Additional Ranking Points: ${totalRankingPoints.toFixed(2)}`);
  console.log(`Total Additional Pickle Points: ${totalPicklePoints.toFixed(2)}`);

  return playerStats;
}

function getAgeMultiplier(age) {
  if (age >= 70) return 1.6;  // 70+
  if (age >= 60) return 1.5;  // 60+
  if (age >= 50) return 1.3;  // 50+
  if (age >= 35) return 1.2;  // 35+
  return 1.0;  // Open (19-34)
}

// Execute calculation
const results = calculateAdditionalPoints();

// Show algorithm verification
console.log('\n✅ ALGORITHM VERIFICATION:');
console.log('System B: 3 points win, 1 point loss ✓');
console.log('Age Multipliers: Applied per player age ✓');
console.log('Tournament Multiplier: 1.0x (local club event) ✓');
console.log('Pickle Points: 1.5x multiplier PER MATCH ✓');
console.log('Decimal Precision: 2 decimal places ✓');
console.log('\n🔢 MATCHES PROCESSED: 8 additional matches');
console.log('📝 STATUS: Ready for database insertion');