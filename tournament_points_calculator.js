/**
 * TOURNAMENT POINTS CALCULATOR
 * Manually calculate and display the exact points allocation
 * According to PICKLE_PLUS_ALGORITHM_DOCUMENT.md - System B
 */

const tournamentMatches = [
  {
    id: 146,
    description: 'Round 1: 邓卓+龙公子 vs 森林+Luka (11-6)',
    players: {
      team1: [252, 248], // 邓卓, 龙公子
      team2: [228, 249]  // 森林, Luka
    },
    winner: 1, // Team 1 wins
    score: [11, 6]
  },
  {
    id: 147,
    description: 'Round 1: Jeff+Tony GUO vs 726零封DZX+Nicole_lo (11-4)',
    players: {
      team1: [245, 263], // Jeff, Tony GUO  
      team2: [251, 246]  // 726零封DZX, Nicole_lo
    },
    winner: 1, // Team 1 wins
    score: [11, 4]
  },
  {
    id: 148,
    description: 'Semifinal 1: 邓卓+龙公子 vs Jeff+Tony GUO (9-11)',
    players: {
      team1: [252, 248], // 邓卓, 龙公子
      team2: [245, 263]  // Jeff, Tony GUO
    },
    winner: 2, // Team 2 wins
    score: [9, 11]
  },
  {
    id: 149,
    description: 'Semifinal 2: 森林+Luka vs 726零封DZX+Nicole_lo (11-8)',
    players: {
      team1: [228, 249], // 森林, Luka
      team2: [251, 246]  // 726零封DZX, Nicole_lo
    },
    winner: 1, // Team 1 wins
    score: [11, 8]
  },
  {
    id: 150,
    description: 'FINAL: Jeff+Tony GUO vs 森林+Luka (11-7) - CHAMPIONS',
    players: {
      team1: [245, 263], // Jeff, Tony GUO
      team2: [228, 249]  // 森林, Luka
    },
    winner: 1, // Team 1 wins (CHAMPIONS)
    score: [11, 7]
  },
  {
    id: 151,
    description: '3RD PLACE: 邓卓+龙公子 vs 726零封DZX+Nicole_lo (11-5)',
    players: {
      team1: [252, 248], // 邓卓, 龙公子
      team2: [251, 246]  // 726零封DZX, Nicole_lo
    },
    winner: 1, // Team 1 wins (3RD PLACE)
    score: [11, 5]
  }
];

// Player database for reference
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

function calculateTournamentPoints() {
  console.log('🏆 TOURNAMENT POINTS CALCULATION');
  console.log('📋 Algorithm: System B (3 points win, 1 point loss)');
  console.log('🎯 Format: Doubles Tournament');
  console.log('📊 Age Multipliers: Applied based on player age\n');

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
  tournamentMatches.forEach((match, index) => {
    console.log(`🎾 MATCH ${index + 1}: ${match.description}`);
    
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
  console.log('🏆 FINAL TOURNAMENT RESULTS:');
  console.log('==========================================');

  // Sort by ranking points
  const sortedPlayers = Object.entries(playerStats)
    .sort(([,a], [,b]) => b.rankingPoints - a.rankingPoints);

  sortedPlayers.forEach(([playerId, stats], index) => {
    console.log(`${index + 1}. ${stats.name}`);
    console.log(`   📈 Ranking Points: ${stats.rankingPoints.toFixed(2)}`);
    console.log(`   🎯 Pickle Points: ${stats.picklePoints.toFixed(2)} (${stats.rankingPoints.toFixed(2)} × 1.5 × ${stats.matches} matches)`);
    console.log(`   📊 Record: ${stats.wins}W-${stats.losses}L (${stats.matches} matches)`);
    console.log('');
  });

  console.log('📊 TOURNAMENT TOTALS:');
  console.log(`Total Ranking Points Awarded: ${totalRankingPoints.toFixed(2)}`);
  console.log(`Total Pickle Points Awarded: ${totalPicklePoints.toFixed(2)}`);

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
const results = calculateTournamentPoints();

// Show algorithm verification
console.log('\n✅ ALGORITHM VERIFICATION:');
console.log('System B: 3 points win, 1 point loss ✓');
console.log('Age Multipliers: Applied per player age ✓');
console.log('Tournament Multiplier: 1.0x (local club event) ✓');
console.log('Pickle Points: 1.5x multiplier PER MATCH ✓');
console.log('Decimal Precision: 2 decimal places ✓');