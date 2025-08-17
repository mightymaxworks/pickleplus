/**
 * Match Processor for 11/08/2025 Tournament Results
 * Processes 17 matches and calculates points according to PICKLE_PLUS_ALGORITHM_DOCUMENT.md
 * Overrides any existing matches on this date
 */

const matches_11_08_2025 = [
  // Round 1
  { match: "1-1", team1: ["5号Mark", "8号Allenshen"], team2: ["2号杨浩嘉", "12号ricky"], score: "8:15", winner: "team2" },
  { match: "1-2", team1: ["6号Kai", "7号蕉"], team2: ["3号Tony GUO", "9号Ceiye"], score: "14:15", winner: "team2" },
  
  // Round 2
  { match: "2-1", team1: ["9号Ceiye", "10号罗蒜头兄🧡"], team2: ["1号雪", "11号Gloria"], score: "11:15", winner: "team2" },
  { match: "2-2", team1: ["4号宇..", "7号蕉"], team2: ["2号杨浩嘉", "8号Allenshen"], score: "15:7", winner: "team1" },
  
  // Round 3
  { match: "3-1", team1: ["6号Kai", "11号Gloria"], team2: ["3号Tony GUO", "12号ricky"], score: "8:15", winner: "team2" },
  { match: "3-2", team1: ["5号Mark", "9号Ceiye"], team2: ["1号雪", "10号罗蒜头兄🧡"], score: "15:10", winner: "team1" },
  
  // Round 4
  { match: "4-1", team1: ["4号宇..", "8号Allenshen"], team2: ["2号杨浩嘉", "11号Gloria"], score: "8:15", winner: "team2" },
  { match: "4-2", team1: ["1号雪", "3号Tony GUO"], team2: ["6号Kai", "12号ricky"], score: "15:12", winner: "team1" },
  
  // Round 5
  { match: "5-1", team1: ["5号Mark", "6号Kai"], team2: ["4号宇..", "10号罗蒜头兄🧡"], score: "15:11", winner: "team1" },
  { match: "5-2", team1: ["3号Tony GUO", "7号蕉"], team2: ["8号Allenshen", "9号Ceiye"], score: "15:7", winner: "team1" },
  
  // Round 6
  { match: "6-1", team1: ["11号Gloria", "12号ricky"], team2: ["1号雪", "2号杨浩嘉"], score: "9:15", winner: "team2" },
  { match: "6-2", team1: ["3号Tony GUO", "4号宇.."], team2: ["7号蕉", "10号罗蒜头兄🧡"], score: "15:7", winner: "team1" },
  
  // Round 7
  { match: "7-1", team1: ["5号Mark", "11号Gloria"], team2: ["1号雪", "6号Kai"], score: "13:15", winner: "team2" },
  { match: "7-2", team1: ["7号蕉", "12号ricky"], team2: ["2号杨浩嘉", "4号宇.."], score: "11:15", winner: "team2" },
  
  // Round 8
  { match: "8-1", team1: ["3号Tony GUO", "10号罗蒜头兄🧡"], team2: ["1号雪", "8号Allenshen"], score: "15:7", winner: "team1" },
  { match: "8-2", team1: ["4号宇..", "11号Gloria"], team2: ["2号杨浩嘉", "9号Ceiye"], score: "15:8", winner: "team1" },
  
  // Round 9
  { match: "9-1", team1: ["5号Mark", "7号蕉"], team2: ["10号罗蒜头兄🧡", "12号ricky"], score: "15:14", winner: "team1" },
  { match: "9-2", team1: ["3号Tony GUO", "8号Allenshen"], team2: ["4号宇..", "9号Ceiye"], score: "15:10", winner: "team1" },
  
  // Round 10
  { match: "10-1", team1: ["2号杨浩嘉", "6号Kai"], team2: ["5号Mark", "10号罗蒜头兄🧡"], score: "14:15", winner: "team2" },
  { match: "10-2", team1: ["1号雪", "9号Ceiye"], team2: ["7号蕉", "8号Allenshen"], score: "15:12", winner: "team1" },
  
  // Round 11
  { match: "11-1", team1: ["4号宇..", "5号Mark"], team2: ["3号Tony GUO", "6号Kai"], score: "7:15", winner: "team2" },
  { match: "11-2", team1: ["10号罗蒜头兄🧡", "11号Gloria"], team2: ["8号Allenshen", "12号ricky"], score: "15:12", winner: "team1" },
  
  // Round 12
  { match: "12-1", team1: ["2号杨浩嘉", "7号蕉"], team2: ["5号Mark", "12号ricky"], score: "8:15", winner: "team2" },
  { match: "12-2", team1: ["9号Ceiye", "11号Gloria"], team2: ["1号雪", "4号宇.."], score: "9:15", winner: "team2" },
  
  // Round 13
  { match: "13-1", team1: ["1号雪", "7号蕉"], team2: ["6号Kai", "8号Allenshen"], score: "15:11", winner: "team1" },
  { match: "13-2", team1: ["3号Tony GUO", "5号Mark"], team2: ["9号Ceiye", "12号ricky"], score: "15:14", winner: "team1" },
  
  // Round 14
  { match: "14-1", team1: ["6号Kai", "9号Ceiye"], team2: ["2号杨浩嘉", "10号罗蒜头兄🧡"], score: "15:6", winner: "team1" },
  { match: "14-2", team1: ["4号宇..", "12号ricky"], team2: ["8号Allenshen", "11号Gloria"], score: "15:11", winner: "team1" },
  
  // Round 15
  { match: "15-1", team1: ["3号Tony GUO", "11号Gloria"], team2: ["1号雪", "5号Mark"], score: "15:13", winner: "team1" },
  { match: "15-2", team1: ["7号蕉", "9号Ceiye"], team2: ["6号Kai", "10号罗蒜头兄🧡"], score: "15:10", winner: "team1" },
  
  // Round 16
  { match: "16-1", team1: ["4号宇..", "6号Kai"], team2: ["2号杨浩嘉", "3号Tony GUO"], score: "12:15", winner: "team2" },
  { match: "16-2", team1: ["1号雪", "12号ricky"], team2: ["8号Allenshen", "10号罗蒜头兄🧡"], score: "15:12", winner: "team1" },
  
  // Round 17
  { match: "17-1", team1: ["7号蕉", "11号Gloria"], team2: ["2号杨浩嘉", "5号Mark"], score: "15:12", winner: "team1" }
];

// PKL to ID mapping corrected based on database verification
const pklToId = {
  "1号雪": 267,         // PKL-000267 (corrected: username xue1990)
  "2号杨浩嘉": 232,     // PKL-000232 (username Ricky)
  "3号Tony GUO": 263,   // PKL-000263 (username tonyguo1983)
  "4号宇..": 258,       // PKL-000258 (蕉)
  "5号Mark": 238,       // PKL-000238 (tao Mark)
  "6号Kai": 247,        // PKL-000247 (Joe zhong)
  "7号蕉": 258,         // PKL-000258 (蕉) - SAME AS 4号
  "8号Allenshen": 229,  // PKL-000229 (玉丰 沈, username Allenshen)
  "9号Ceiye": 237,      // PKL-000237 (宇锋 蔡, username ceiye)
  "10号罗蒜头兄🧡": 234, // PKL-000234 (罗 蒜头, username locpet)
  "11号Gloria": 236,    // PKL-000236 (Qi Wang, Gloria1989)
  "12号ricky": 264      // PKL-000264 (username ricky1998, different from 杨浩嘉)
};

// System B Algorithm: 3 points for win, 1 point for loss (as per PICKLE_PLUS_ALGORITHM_DOCUMENT.md)
const BASE_WIN_POINTS = 3;
const BASE_LOSS_POINTS = 1;
const PICKLE_POINTS_MULTIPLIER = 1.5; // Per-match multiplier

function parseScore(scoreStr) {
  const [score1, score2] = scoreStr.split(':').map(s => parseInt(s.trim()));
  return { score1, score2 };
}

function calculatePoints(isWin) {
  const rankingPoints = isWin ? BASE_WIN_POINTS : BASE_LOSS_POINTS;
  const picklePoints = rankingPoints * PICKLE_POINTS_MULTIPLIER;
  return { rankingPoints, picklePoints };
}

function processMatch(match) {
  const { score1, score2 } = parseScore(match.score);
  const team1Players = match.team1.map(pkl => pklToId[pkl]);
  const team2Players = match.team2.map(pkl => pklToId[pkl]);
  
  const team1Won = match.winner === "team1";
  const team2Won = match.winner === "team2";
  
  const results = [];
  
  // Process Team 1 players
  team1Players.forEach(playerId => {
    const partnerID = team1Players.find(id => id !== playerId);
    const points = calculatePoints(team1Won);
    
    results.push({
      playerId,
      partnerID,
      opponentIds: team2Players,
      isWin: team1Won,
      scoreFor: score1,
      scoreAgainst: score2,
      rankingPoints: points.rankingPoints,
      picklePoints: points.picklePoints,
      match: match.match
    });
  });
  
  // Process Team 2 players
  team2Players.forEach(playerId => {
    const partnerID = team2Players.find(id => id !== playerId);
    const points = calculatePoints(team2Won);
    
    results.push({
      playerId,
      partnerID,
      opponentIds: team1Players,
      isWin: team2Won,
      scoreFor: score2,
      scoreAgainst: score1,
      rankingPoints: points.rankingPoints,
      picklePoints: points.picklePoints,
      match: match.match
    });
  });
  
  return results;
}

// Process all matches
console.log("🎾 Processing 17 matches from 11/08/2025...");
console.log("📊 Algorithm: System B (3 win/1 loss), Pickle Points 1.5x per match");
console.log("=====================================");

const allResults = matches_11_08_2025.flatMap(processMatch);

// Group by player for summary
const playerStats = {};
allResults.forEach(result => {
  if (!playerStats[result.playerId]) {
    playerStats[result.playerId] = {
      matches: 0,
      wins: 0,
      losses: 0,
      totalRankingPoints: 0,
      totalPicklePoints: 0
    };
  }
  
  const stats = playerStats[result.playerId];
  stats.matches++;
  if (result.isWin) stats.wins++;
  else stats.losses++;
  stats.totalRankingPoints += result.rankingPoints;
  stats.totalPicklePoints += result.picklePoints;
});

// Display summary
Object.entries(playerStats).forEach(([playerId, stats]) => {
  const pklName = Object.keys(pklToId).find(key => pklToId[key] == playerId);
  console.log(`${pklName} (ID ${playerId}): ${stats.matches} matches, ${stats.wins}W-${stats.losses}L`);
  console.log(`  Ranking Points: ${stats.totalRankingPoints.toFixed(2)}`);
  console.log(`  Pickle Points: ${stats.totalPicklePoints.toFixed(2)}`);
  console.log(`  Win Rate: ${(stats.wins/stats.matches*100).toFixed(1)}%`);
  console.log("");
});

console.log(`📈 Total Results: ${allResults.length} player-match records`);
console.log(`🎯 Ready for database insertion with points verification`);

export { matches_11_08_2025, allResults, playerStats, pklToId };