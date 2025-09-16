import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

console.log('🔍 CORRECTED TOURNAMENT ANALYSIS: 9.8-9.14 Weekly Tournament Results');
console.log('================================================================\n');

// Read the Excel file
const filePath = path.join(process.cwd(), 'attached_assets', '9.8-9.14周赛分数_1758011644415.xlsx');
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets['第二周比赛登记'];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Extract match data (skip first 2 rows - title and headers)
const allRows = jsonData.slice(2).filter(row => row.length >= 5 && row[0] != null);

console.log(`📊 RAW DATA ANALYSIS`);
console.log(`Total rows found: ${allRows.length}`);

// Analyze match types
const doublesMatches = [];
const singlesMatches = [];

allRows.forEach((row, index) => {
    // Check if row has 4 player codes (doubles) or 2 player codes (singles)
    if (row[1] && row[2] && row[3] && typeof row[1] === 'string' && typeof row[2] === 'string' && typeof row[3] === 'string') {
        // Doubles match: Team1Player1, Team1Player2, Team2Player1, Team2Player2, Score1, Score2, Date
        doublesMatches.push({
            matchId: `D${index + 1}`,
            format: 'doubles',
            team1: {
                player1: row[0]?.toString().trim().toUpperCase(),
                player2: row[1]?.toString().trim().toUpperCase(),
                score: row[4]
            },
            team2: {
                player1: row[2]?.toString().trim().toUpperCase(),
                player2: row[3]?.toString().trim().toUpperCase(),
                score: row[5]
            },
            date: row[6],
            rawRow: row
        });
    } else if (row[0] && row[1] && !row[3]) {
        // Singles match: Player1, Player2, Score1, Score2, Date (columns 3&4 are scores, column 5 is date)
        singlesMatches.push({
            matchId: `S${index + 1}`,
            format: 'singles',
            player1: row[0]?.toString().trim().toUpperCase(),
            player2: row[1]?.toString().trim().toUpperCase(),
            score1: row[2],
            score2: row[3],
            date: row[4],
            rawRow: row
        });
    }
});

console.log(`\n📊 MATCH FORMAT BREAKDOWN:`);
console.log(`Doubles Matches: ${doublesMatches.length}`);
console.log(`Singles Matches: ${singlesMatches.length}`);
console.log(`Total Matches: ${doublesMatches.length + singlesMatches.length}`);

// Extract all passport codes with corrected mappings
const allPassportCodes = new Set();
const codeMapping = {
    'PKL-000249': 'LT57DN' // Convert database ID reference to actual passport code
};

// Process doubles matches
const processedDoublesMatches = doublesMatches.map(match => {
    const team1Player1 = codeMapping[match.team1.player1] || match.team1.player1;
    const team1Player2 = codeMapping[match.team1.player2] || match.team1.player2;
    const team2Player1 = codeMapping[match.team2.player1] || match.team2.player1;
    const team2Player2 = codeMapping[match.team2.player2] || match.team2.player2;
    
    [team1Player1, team1Player2, team2Player1, team2Player2].forEach(code => {
        if (code && typeof code === 'string') {
            allPassportCodes.add(code);
        }
    });
    
    const team1Won = match.team1.score > match.team2.score;
    const isDraw = match.team1.score === match.team2.score;
    
    return {
        ...match,
        team1: {
            ...match.team1,
            player1: team1Player1,
            player2: team1Player2,
            won: team1Won,
            points: isDraw ? 1 : (team1Won ? 3 : 1)
        },
        team2: {
            ...match.team2,
            player1: team2Player1,
            player2: team2Player2,
            won: !team1Won && !isDraw,
            points: isDraw ? 1 : (!team1Won ? 3 : 1)
        },
        isDraw: isDraw
    };
});

// Process singles matches
const processedSinglesMatches = singlesMatches.map(match => {
    const player1 = codeMapping[match.player1] || match.player1;
    const player2 = codeMapping[match.player2] || match.player2;
    
    [player1, player2].forEach(code => {
        if (code && typeof code === 'string') {
            allPassportCodes.add(code);
        }
    });
    
    const player1Won = match.score1 > match.score2;
    const isDraw = match.score1 === match.score2;
    
    return {
        ...match,
        player1: player1,
        player2: player2,
        player1Won: player1Won,
        player2Won: !player1Won && !isDraw,
        player1Points: isDraw ? 1 : (player1Won ? 3 : 1),
        player2Points: isDraw ? 1 : (!player1Won ? 3 : 1),
        isDraw: isDraw
    };
});

// Calculate player statistics
const playerStats = {};

// Process doubles matches
processedDoublesMatches.forEach(match => {
    const team1Players = [match.team1.player1, match.team1.player2].filter(p => p);
    const team2Players = [match.team2.player1, match.team2.player2].filter(p => p);
    
    [...team1Players, ...team2Players].forEach(player => {
        if (!playerStats[player]) {
            playerStats[player] = {
                matchesPlayed: 0,
                doublesMatches: 0,
                singlesMatches: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                totalPoints: 0,
                totalScoreFor: 0,
                totalScoreAgainst: 0
            };
        }
        
        playerStats[player].matchesPlayed++;
        playerStats[player].doublesMatches++;
        
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
        
        if (wasOnTeam1) {
            playerStats[player].totalScoreFor += match.team1.score;
            playerStats[player].totalScoreAgainst += match.team2.score;
        } else {
            playerStats[player].totalScoreFor += match.team2.score;
            playerStats[player].totalScoreAgainst += match.team1.score;
        }
    });
});

// Process singles matches
processedSinglesMatches.forEach(match => {
    [match.player1, match.player2].forEach(player => {
        if (!playerStats[player]) {
            playerStats[player] = {
                matchesPlayed: 0,
                doublesMatches: 0,
                singlesMatches: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                totalPoints: 0,
                totalScoreFor: 0,
                totalScoreAgainst: 0
            };
        }
        
        playerStats[player].matchesPlayed++;
        playerStats[player].singlesMatches++;
        
        if (match.isDraw) {
            playerStats[player].draws++;
            playerStats[player].totalPoints += 1;
        } else if ((player === match.player1 && match.player1Won) || (player === match.player2 && match.player2Won)) {
            playerStats[player].wins++;
            playerStats[player].totalPoints += 3;
        } else {
            playerStats[player].losses++;
            playerStats[player].totalPoints += 1;
        }
        
        if (player === match.player1) {
            playerStats[player].totalScoreFor += match.score1;
            playerStats[player].totalScoreAgainst += match.score2;
        } else {
            playerStats[player].totalScoreFor += match.score2;
            playerStats[player].totalScoreAgainst += match.score1;
        }
    });
});

// Clean passport codes (remove header text and apply mappings)
const cleanPassportCodes = Array.from(allPassportCodes).filter(code => 
    !code.includes('选手') && 
    !code.includes('护照码') && 
    code.length <= 10
).sort();

console.log(`\n👥 ALL PASSPORT CODES FOUND (${cleanPassportCodes.length}):`);
console.log('================================');
cleanPassportCodes.forEach((code, index) => {
    console.log(`${index + 1}. ${code}`);
});

// Top players by total points
const topPlayers = Object.entries(playerStats)
    .sort(([,a], [,b]) => b.totalPoints - a.totalPoints)
    .slice(0, 20);

console.log(`\n🏆 TOP 20 PLAYERS BY POINTS:`);
console.log('================================');
topPlayers.forEach(([player, stats], index) => {
    const winRate = (stats.wins / stats.matchesPlayed * 100).toFixed(1);
    const avgScoreDiff = ((stats.totalScoreFor - stats.totalScoreAgainst) / stats.matchesPlayed).toFixed(1);
    console.log(`${index + 1}. ${player}: ${stats.totalPoints} pts (${stats.matchesPlayed}M: ${stats.doublesMatches}D+${stats.singlesMatches}S, ${stats.wins}W-${stats.losses}L-${stats.draws}D, ${winRate}% WR, Avg +${avgScoreDiff})`);
});

// Match results analysis
console.log(`\n⚡ MATCH RESULTS BREAKDOWN:`);
console.log('================================');

let doublesTeam1Wins = 0, doublesTeam2Wins = 0, doublesDraws = 0;
let singlesPlayer1Wins = 0, singlesPlayer2Wins = 0, singlesDraws = 0;

processedDoublesMatches.forEach(match => {
    if (match.isDraw) doublesDraws++;
    else if (match.team1.won) doublesTeam1Wins++;
    else doublesTeam2Wins++;
});

processedSinglesMatches.forEach(match => {
    if (match.isDraw) singlesDraws++;
    else if (match.player1Won) singlesPlayer1Wins++;
    else singlesPlayer2Wins++;
});

console.log(`\nDOUBLES (${processedDoublesMatches.length} matches):`);
console.log(`Team 1 Wins: ${doublesTeam1Wins} (${(doublesTeam1Wins/processedDoublesMatches.length*100).toFixed(1)}%)`);
console.log(`Team 2 Wins: ${doublesTeam2Wins} (${(doublesTeam2Wins/processedDoublesMatches.length*100).toFixed(1)}%)`);
console.log(`Draws: ${doublesDraws} (${(doublesDraws/processedDoublesMatches.length*100).toFixed(1)}%)`);

console.log(`\nSINGLES (${processedSinglesMatches.length} matches):`);
console.log(`Player 1 Wins: ${singlesPlayer1Wins} (${(singlesPlayer1Wins/processedSinglesMatches.length*100).toFixed(1)}%)`);
console.log(`Player 2 Wins: ${singlesPlayer2Wins} (${(singlesPlayer2Wins/processedSinglesMatches.length*100).toFixed(1)}%)`);
console.log(`Draws: ${singlesDraws} (${(singlesDraws/processedSinglesMatches.length*100).toFixed(1)}%)`);

// Export corrected data
const correctedAnalysisData = {
    tournamentInfo: {
        name: '9.8-9.14 Weekly Tournament (Mixed Format)',
        totalMatches: processedDoublesMatches.length + processedSinglesMatches.length,
        doublesMatches: processedDoublesMatches.length,
        singlesMatches: processedSinglesMatches.length,
        uniquePlayers: cleanPassportCodes.length,
        dateRange: 'September 8-14, 2024'
    },
    allPassportCodes: cleanPassportCodes,
    playerStats: playerStats,
    doublesMatches: processedDoublesMatches,
    singlesMatches: processedSinglesMatches,
    codeMapping: codeMapping
};

fs.writeFileSync('corrected-tournament-analysis.json', JSON.stringify(correctedAnalysisData, null, 2));
console.log(`\n💾 Corrected analysis data exported to: corrected-tournament-analysis.json`);

console.log(`\n🔍 SUMMARY FOR DATABASE PROCESSING:`);
console.log('===================================');
console.log(`Total Matches: ${correctedAnalysisData.tournamentInfo.totalMatches}`);
console.log(`- Doubles: ${correctedAnalysisData.tournamentInfo.doublesMatches}`);
console.log(`- Singles: ${correctedAnalysisData.tournamentInfo.singlesMatches}`);
console.log(`Unique Players: ${correctedAnalysisData.tournamentInfo.uniquePlayers}`);
console.log(`Code Mappings Applied: ${Object.keys(codeMapping).length}`);
console.log('Ready for database player verification...');