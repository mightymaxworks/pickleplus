/**
 * Gender Bonus Recalculation for 11/08/2025 Tournament
 * Applies 1.15x multiplier for female players under 1000 points in cross-gender matches
 */

// Female players in tournament (all under 1000 points, eligible for bonus)
const femalePlayerIds = [168, 236, 234]; // 雪雪, Gloria, 罗蒜头

// Male players in tournament  
const malePlayerIds = [263, 233, 237, 235, 228, 229, 238, 232, 231];

// All matches from 11/08/2025 tournament
const matches_11_08_2025 = [
  // Round 1
  { match: "1-1", team1: [238, 229], team2: [235, 232], score: "8:15", winner: "team2" },
  { match: "1-2", team1: [231, 228], team2: [263, 168], score: "14:15", winner: "team2" },
  
  // Round 2  
  { match: "2-1", team1: [168, 234], team2: [237, 236], score: "11:15", winner: "team2" },
  { match: "2-2", team1: [233, 228], team2: [235, 229], score: "15:7", winner: "team1" },
  
  // Round 3
  { match: "3-1", team1: [231, 236], team2: [263, 232], score: "8:15", winner: "team2" },
  { match: "3-2", team1: [238, 168], team2: [237, 234], score: "15:10", winner: "team1" },
  
  // Round 4
  { match: "4-1", team1: [233, 229], team2: [235, 236], score: "8:15", winner: "team2" },
  { match: "4-2", team1: [237, 263], team2: [231, 232], score: "15:12", winner: "team1" },
  
  // Round 5
  { match: "5-1", team1: [238, 231], team2: [233, 234], score: "15:11", winner: "team1" },
  { match: "5-2", team1: [263, 228], team2: [229, 168], score: "15:7", winner: "team1" },
  
  // Round 6
  { match: "6-1", team1: [236, 232], team2: [237, 235], score: "9:15", winner: "team2" },
  { match: "6-2", team1: [263, 233], team2: [228, 234], score: "15:7", winner: "team1" },
  
  // Round 7
  { match: "7-1", team1: [238, 236], team2: [237, 231], score: "13:15", winner: "team2" },
  { match: "7-2", team1: [228, 232], team2: [235, 233], score: "11:15", winner: "team2" },
  
  // Round 8
  { match: "8-1", team1: [263, 234], team2: [237, 229], score: "15:7", winner: "team1" },
  { match: "8-2", team1: [233, 236], team2: [235, 168], score: "15:8", winner: "team1" },
  
  // Round 9
  { match: "9-1", team1: [238, 228], team2: [234, 232], score: "15:14", winner: "team1" },
  { match: "9-2", team1: [263, 229], team2: [233, 168], score: "15:10", winner: "team1" },
  
  // Round 10
  { match: "10-1", team1: [235, 231], team2: [238, 234], score: "14:15", winner: "team2" },
  { match: "10-2", team1: [237, 168], team2: [228, 229], score: "15:12", winner: "team1" },
  
  // Round 11
  { match: "11-1", team1: [233, 238], team2: [263, 231], score: "7:15", winner: "team2" },
  { match: "11-2", team1: [234, 236], team2: [229, 232], score: "15:12", winner: "team1" },
  
  // Round 12
  { match: "12-1", team1: [235, 228], team2: [238, 232], score: "8:15", winner: "team2" },
  { match: "12-2", team1: [168, 236], team2: [237, 233], score: "9:15", winner: "team2" },
  
  // Round 13
  { match: "13-1", team1: [237, 228], team2: [231, 229], score: "15:11", winner: "team1" },
  { match: "13-2", team1: [263, 238], team2: [168, 232], score: "15:14", winner: "team1" },
  
  // Round 14
  { match: "14-1", team1: [231, 168], team2: [235, 234], score: "15:6", winner: "team1" },
  { match: "14-2", team1: [233, 232], team2: [229, 236], score: "15:11", winner: "team1" },
  
  // Round 15
  { match: "15-1", team1: [263, 236], team2: [237, 238], score: "15:13", winner: "team1" },
  { match: "15-2", team1: [228, 168], team2: [231, 234], score: "15:10", winner: "team1" },
  
  // Round 16
  { match: "16-1", team1: [233, 231], team2: [235, 263], score: "12:15", winner: "team2" },
  { match: "16-2", team1: [237, 232], team2: [229, 234], score: "15:12", winner: "team1" },
  
  // Round 17
  { match: "17-1", team1: [228, 236], team2: [235, 238], score: "15:12", winner: "team1" }
];

function isAllMaleTeam(team) {
  return team.every(playerId => malePlayerIds.includes(playerId));
}

function isAllFemaleTeam(team) {
  return team.every(playerId => femalePlayerIds.includes(playerId));
}

function isCrossGenderMatch(team1, team2) {
  const team1AllMale = isAllMaleTeam(team1);
  const team1AllFemale = isAllFemaleTeam(team1);
  const team2AllMale = isAllMaleTeam(team2);
  const team2AllFemale = isAllFemaleTeam(team2);
  
  // Cross-gender if one team is all male and other has females, or mixed teams
  return !(team1AllMale && team2AllMale) && !(team1AllFemale && team2AllFemale);
}

function calculateGenderBonusPoints(playerId, basePoints, team1, team2) {
  if (!femalePlayerIds.includes(playerId)) {
    return basePoints; // Male players get base points
  }
  
  // Female player - check if cross-gender match
  if (isCrossGenderMatch(team1, team2)) {
    return Math.round((basePoints * 1.15) * 100) / 100; // 1.15x bonus with 2 decimal precision
  }
  
  return basePoints; // Same-gender match, no bonus
}

// Calculate points with gender bonuses
const playerStats = {};
const allResults = [];

matches_11_08_2025.forEach(match => {
  const { team1, team2, score, winner } = match;
  const [score1, score2] = score.split(':').map(Number);
  
  // Determine winning and losing teams
  const winningTeam = winner === "team1" ? team1 : team2;
  const losingTeam = winner === "team1" ? team2 : team1;
  
  // Process winning team (3 points each + potential gender bonus)
  winningTeam.forEach(playerId => {
    const basePoints = 3;
    const finalRankingPoints = calculateGenderBonusPoints(playerId, basePoints, team1, team2);
    const picklePoints = finalRankingPoints * 1.5; // 1.5x Pickle Points per match
    
    if (!playerStats[playerId]) {
      playerStats[playerId] = { wins: 0, losses: 0, matches: 0, totalRankingPoints: 0, totalPicklePoints: 0 };
    }
    
    playerStats[playerId].wins++;
    playerStats[playerId].matches++;
    playerStats[playerId].totalRankingPoints += finalRankingPoints;
    playerStats[playerId].totalPicklePoints += picklePoints;
    
    allResults.push({
      playerId,
      matchId: match.match,
      result: 'win',
      basePoints,
      genderBonus: finalRankingPoints > basePoints ? 1.15 : 1.0,
      finalRankingPoints,
      picklePoints
    });
  });
  
  // Process losing team (1 point each + potential gender bonus)
  losingTeam.forEach(playerId => {
    const basePoints = 1;
    const finalRankingPoints = calculateGenderBonusPoints(playerId, basePoints, team1, team2);
    const picklePoints = finalRankingPoints * 1.5; // 1.5x Pickle Points per match
    
    if (!playerStats[playerId]) {
      playerStats[playerId] = { wins: 0, losses: 0, matches: 0, totalRankingPoints: 0, totalPicklePoints: 0 };
    }
    
    playerStats[playerId].losses++;
    playerStats[playerId].matches++;
    playerStats[playerId].totalRankingPoints += finalRankingPoints;
    playerStats[playerId].totalPicklePoints += picklePoints;
    
    allResults.push({
      playerId,
      matchId: match.match,
      result: 'loss',
      basePoints,
      genderBonus: finalRankingPoints > basePoints ? 1.15 : 1.0,
      finalRankingPoints,
      picklePoints
    });
  });
});

// Player name mapping
const playerNames = {
  168: "1号雪 (Female)",
  228: "7号蕉",
  229: "8号Allenshen", 
  231: "6号Kai",
  232: "12号ricky",
  233: "4号宇..",
  234: "10号罗蒜头兄🧡 (Female)",
  235: "2号杨浩嘉",
  236: "11号Gloria (Female)",
  237: "9号Ceiye",
  238: "5号Mark",
  263: "3号Tony GUO"
};

console.log("🎾 Gender Bonus Recalculation for 11/08/2025...");
console.log("📊 Algorithm: System B + 1.15x Gender Bonus for Cross-Gender Matches");
console.log("=====================================");

// Display results sorted by ranking points
Object.entries(playerStats)
  .sort(([,a], [,b]) => b.totalRankingPoints - a.totalRankingPoints)
  .forEach(([playerId, stats]) => {
    const name = playerNames[playerId];
    const isFemale = femalePlayerIds.includes(parseInt(playerId));
    const bonusMatches = allResults.filter(r => r.playerId == playerId && r.genderBonus > 1.0).length;
    
    console.log(`${name}: ${stats.matches} matches, ${stats.wins}W-${stats.losses}L`);
    console.log(`  Ranking Points: ${stats.totalRankingPoints.toFixed(2)} ${bonusMatches > 0 ? `(+${bonusMatches} bonus matches)` : ''}`);
    console.log(`  Pickle Points: ${stats.totalPicklePoints.toFixed(2)}`);
    console.log(`  Win Rate: ${(stats.wins/stats.matches*100).toFixed(1)}%`);
    console.log("");
  });

console.log("🎯 Gender Bonus Summary:");
console.log("Female players with bonuses:");
femalePlayerIds.forEach(playerId => {
  const bonusMatches = allResults.filter(r => r.playerId == playerId && r.genderBonus > 1.0);
  if (bonusMatches.length > 0) {
    console.log(`  ${playerNames[playerId]}: ${bonusMatches.length} matches with 1.15x bonus`);
  }
});

export { allResults, playerStats, femalePlayerIds };