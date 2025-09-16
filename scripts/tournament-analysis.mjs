import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Database connection simulation - we'll need to connect to the actual database
console.log('🔍 TOURNAMENT ANALYSIS: 9.8-9.14 Weekly Tournament Results');
console.log('================================================================\n');

// Read the Excel file
const filePath = path.join(process.cwd(), 'attached_assets', '9.8-9.14周赛分数_1758011644415.xlsx');
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets['第二周比赛登记'];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Extract match data (skip first 2 rows - title and headers)
const matches = jsonData.slice(2).filter(row => row.length >= 7 && row[0] != null);

console.log(`📊 MATCH SUMMARY`);
console.log(`Total Matches Found: ${matches.length}`);

// Extract all passport codes and analyze
const allPassportCodes = new Set();
const matchDetails = [];

matches.forEach((match, index) => {
    const [team1Player1, team1Player2, team2Player1, team2Player2, team1Score, team2Score, matchDate] = match;
    
    // Add all passport codes to set
    [team1Player1, team1Player2, team2Player1, team2Player2].forEach(code => {
        if (code && typeof code === 'string') {
            allPassportCodes.add(code.trim().toUpperCase());
        }
    });
    
    // Convert Excel date to readable format
    let formattedDate = 'Unknown';
    if (typeof matchDate === 'number') {
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (matchDate - 2) * 24 * 60 * 60 * 1000);
        formattedDate = date.toISOString().split('T')[0];
    }
    
    // Determine winner and points allocation
    const team1Won = team1Score > team2Score;
    const isDraw = team1Score === team2Score;
    
    matchDetails.push({
        matchId: index + 1,
        team1: {
            player1: team1Player1?.trim().toUpperCase(),
            player2: team1Player2?.trim().toUpperCase(),
            score: team1Score,
            won: team1Won,
            points: isDraw ? 1 : (team1Won ? 3 : 1) // System B: 3 points win, 1 point loss
        },
        team2: {
            player1: team2Player1?.trim().toUpperCase(),
            player2: team2Player2?.trim().toUpperCase(), 
            score: team2Score,
            won: !team1Won && !isDraw,
            points: isDraw ? 1 : (!team1Won ? 3 : 1)
        },
        date: formattedDate,
        isDraw: isDraw
    });
});

console.log(`Unique Players Found: ${allPassportCodes.size}`);
console.log(`Match Date Range: September 8-14, 2024`);

// Analyze passport codes
console.log(`\n👥 ALL PASSPORT CODES FOUND:`);
console.log('================================');
const sortedCodes = Array.from(allPassportCodes).sort();
sortedCodes.forEach((code, index) => {
    console.log(`${index + 1}. ${code}`);
});

// Player statistics
console.log(`\n📈 PLAYER MATCH STATISTICS:`);
console.log('================================');
const playerStats = {};

matchDetails.forEach(match => {
    const team1Players = [match.team1.player1, match.team1.player2].filter(p => p);
    const team2Players = [match.team2.player1, match.team2.player2].filter(p => p);
    
    [...team1Players, ...team2Players].forEach(player => {
        if (!playerStats[player]) {
            playerStats[player] = {
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                totalPoints: 0,
                totalScoreFor: 0,
                totalScoreAgainst: 0
            };
        }
        
        playerStats[player].matchesPlayed++;
        
        // Determine if this player was on winning team
        const wasOnTeam1 = team1Players.includes(player);
        const wasOnTeam2 = team2Players.includes(player);
        
        if (match.isDraw) {
            playerStats[player].draws++;
            playerStats[player].totalPoints += 1;
        } else if ((wasOnTeam1 && match.team1.won) || (wasOnTeam2 && match.team2.won)) {
            playerStats[player].wins++;
            playerStats[player].totalPoints += 3;
        } else {
            playerStats[player].losses++;
            playerStats[player].totalPoints += 1;
        }
        
        // Add scores
        if (wasOnTeam1) {
            playerStats[player].totalScoreFor += match.team1.score;
            playerStats[player].totalScoreAgainst += match.team2.score;
        } else {
            playerStats[player].totalScoreFor += match.team2.score;
            playerStats[player].totalScoreAgainst += match.team1.score;
        }
    });
});

// Sort players by total points
const topPlayers = Object.entries(playerStats)
    .sort(([,a], [,b]) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

console.log('\n🏆 TOP 20 PLAYERS BY POINTS:');
topPlayers.forEach(([player, stats], index) => {
    const winRate = (stats.wins / stats.matchesPlayed * 100).toFixed(1);
    const avgScoreDiff = ((stats.totalScoreFor - stats.totalScoreAgainst) / stats.matchesPlayed).toFixed(1);
    console.log(`${index + 1}. ${player}: ${stats.totalPoints} pts (${stats.matchesPlayed}M, ${stats.wins}W-${stats.losses}L-${stats.draws}D, ${winRate}% WR, Avg +${avgScoreDiff})`);
});

// Match format analysis
console.log(`\n⚡ MATCH RESULTS BREAKDOWN:`);
console.log('================================');
let team1Wins = 0;
let team2Wins = 0; 
let draws = 0;

matchDetails.forEach(match => {
    if (match.isDraw) {
        draws++;
    } else if (match.team1.won) {
        team1Wins++;
    } else {
        team2Wins++;
    }
});

console.log(`Team 1 Wins: ${team1Wins} (${(team1Wins/matches.length*100).toFixed(1)}%)`);
console.log(`Team 2 Wins: ${team2Wins} (${(team2Wins/matches.length*100).toFixed(1)}%)`);
console.log(`Draws: ${draws} (${(draws/matches.length*100).toFixed(1)}%)`);

// Score distribution analysis
console.log(`\n📊 SCORE ANALYSIS:`);
console.log('================================');
const scoreDistribution = {};
matchDetails.forEach(match => {
    const scoreKey = `${Math.max(match.team1.score, match.team2.score)}-${Math.min(match.team1.score, match.team2.score)}`;
    scoreDistribution[scoreKey] = (scoreDistribution[scoreKey] || 0) + 1;
});

const topScores = Object.entries(scoreDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

console.log('Most common final scores:');
topScores.forEach(([score, count]) => {
    console.log(`${score}: ${count} matches (${(count/matches.length*100).toFixed(1)}%)`);
});

// Export data for database comparison
const analysisData = {
    tournamentInfo: {
        name: '9.8-9.14 Weekly Tournament',
        totalMatches: matches.length,
        uniquePlayers: allPassportCodes.size,
        dateRange: 'September 8-14, 2024'
    },
    allPassportCodes: sortedCodes,
    playerStats: playerStats,
    matchDetails: matchDetails
};

// Write analysis to file for database processing
fs.writeFileSync('tournament-analysis-data.json', JSON.stringify(analysisData, null, 2));
console.log(`\n💾 Analysis data exported to: tournament-analysis-data.json`);

console.log(`\n🔍 NEXT STEPS:`);
console.log('1. Check database for existing players with these passport codes');
console.log('2. Find potential matches for unrecognized codes');
console.log('3. Analyze gender and category bonuses');
console.log('4. Calculate final point allocations with multipliers');
console.log('5. Show summary before database updates');