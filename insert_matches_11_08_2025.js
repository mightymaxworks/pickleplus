/**
 * Database Insertion Script for 11/08/2025 Tournament Matches
 * Inserts 17 matches and updates player points according to algorithm
 */

import { allResults, playerStats, pklToId } from './match_processor_11_08_2025.js';

// Match data for database insertion
const matchesToInsert = [
  // Round 1
  { match: "1-1", team1: [238, 239], team2: [232, 235], score1: 8, score2: 15, winnerId: 232 },
  { match: "1-2", team1: [247, 237], team2: [263, 231], score1: 14, score2: 15, winnerId: 263 },
  
  // Round 2  
  { match: "2-1", team1: [231, 245], team2: [259, 236], score1: 11, score2: 15, winnerId: 259 },
  { match: "2-2", team1: [258, 237], team2: [232, 239], score1: 15, score2: 7, winnerId: 258 },
  
  // Round 3
  { match: "3-1", team1: [247, 236], team2: [263, 235], score1: 8, score2: 15, winnerId: 263 },
  { match: "3-2", team1: [238, 231], team2: [259, 245], score1: 15, score2: 10, winnerId: 238 },
  
  // Round 4
  { match: "4-1", team1: [258, 239], team2: [232, 236], score1: 8, score2: 15, winnerId: 232 },
  { match: "4-2", team1: [259, 263], team2: [247, 235], score1: 15, score2: 12, winnerId: 259 },
  
  // Round 5
  { match: "5-1", team1: [238, 247], team2: [258, 245], score1: 15, score2: 11, winnerId: 238 },
  { match: "5-2", team1: [263, 237], team2: [239, 231], score1: 15, score2: 7, winnerId: 263 },
  
  // Round 6
  { match: "6-1", team1: [236, 235], team2: [259, 232], score1: 9, score2: 15, winnerId: 259 },
  { match: "6-2", team1: [263, 258], team2: [237, 245], score1: 15, score2: 7, winnerId: 263 },
  
  // Round 7
  { match: "7-1", team1: [238, 236], team2: [259, 247], score1: 13, score2: 15, winnerId: 259 },
  { match: "7-2", team1: [237, 235], team2: [232, 258], score1: 11, score2: 15, winnerId: 232 },
  
  // Round 8
  { match: "8-1", team1: [263, 245], team2: [259, 239], score1: 15, score2: 7, winnerId: 263 },
  { match: "8-2", team1: [258, 236], team2: [232, 231], score1: 15, score2: 8, winnerId: 258 },
  
  // Round 9
  { match: "9-1", team1: [238, 237], team2: [245, 235], score1: 15, score2: 14, winnerId: 238 },
  { match: "9-2", team1: [263, 239], team2: [258, 231], score1: 15, score2: 10, winnerId: 263 },
  
  // Round 10
  { match: "10-1", team1: [232, 247], team2: [238, 245], score1: 14, score2: 15, winnerId: 238 },
  { match: "10-2", team1: [259, 231], team2: [237, 239], score1: 15, score2: 12, winnerId: 259 },
  
  // Round 11
  { match: "11-1", team1: [258, 238], team2: [263, 247], score1: 7, score2: 15, winnerId: 263 },
  { match: "11-2", team1: [245, 236], team2: [239, 235], score1: 15, score2: 12, winnerId: 245 },
  
  // Round 12
  { match: "12-1", team1: [232, 237], team2: [238, 235], score1: 8, score2: 15, winnerId: 238 },
  { match: "12-2", team1: [231, 236], team2: [259, 258], score1: 9, score2: 15, winnerId: 259 },
  
  // Round 13
  { match: "13-1", team1: [259, 237], team2: [247, 239], score1: 15, score2: 11, winnerId: 259 },
  { match: "13-2", team1: [263, 238], team2: [231, 235], score1: 15, score2: 14, winnerId: 263 },
  
  // Round 14
  { match: "14-1", team1: [247, 231], team2: [232, 245], score1: 15, score2: 6, winnerId: 247 },
  { match: "14-2", team1: [258, 235], team2: [239, 236], score1: 15, score2: 11, winnerId: 258 },
  
  // Round 15
  { match: "15-1", team1: [263, 236], team2: [259, 238], score1: 15, score2: 13, winnerId: 263 },
  { match: "15-2", team1: [237, 231], team2: [247, 245], score1: 15, score2: 10, winnerId: 237 },
  
  // Round 16
  { match: "16-1", team1: [258, 247], team2: [232, 263], score1: 12, score2: 15, winnerId: 232 },
  { match: "16-2", team1: [259, 235], team2: [239, 245], score1: 15, score2: 12, winnerId: 259 },
  
  // Round 17
  { match: "17-1", team1: [237, 236], team2: [232, 238], score1: 15, score2: 12, winnerId: 237 }
];

console.log("🚀 Starting database insertion for 11/08/2025 matches...");
console.log("📊 Points Summary Before Insertion:");
Object.entries(playerStats).forEach(([playerId, stats]) => {
  const pklName = Object.keys(pklToId).find(key => pklToId[key] == playerId);
  console.log(`${pklName} (ID ${playerId}): +${stats.totalRankingPoints.toFixed(2)} ranking, +${stats.totalPicklePoints.toFixed(2)} pickle`);
});

export { matchesToInsert, playerStats };