import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

console.log('🔍 DATABASE PLAYER VERIFICATION');
console.log('================================\n');

// Read the analysis data
const analysisData = JSON.parse(fs.readFileSync('tournament-analysis-data.json', 'utf8'));

// Clean passport codes (remove Chinese header text)
const cleanPassportCodes = analysisData.allPassportCodes.filter(code => 
    !code.includes('选手') && 
    !code.includes('护照码') && 
    code.length <= 10 // Reasonable passport code length
);

console.log(`📋 CLEANED PASSPORT CODES (${cleanPassportCodes.length}):`);
cleanPassportCodes.forEach((code, index) => {
    console.log(`${index + 1}. ${code}`);
});

async function analyzePlayersInDatabase() {
    try {
        // Get all players from database
        const allPlayersResult = await pool.query(`
            SELECT 
                id, 
                passport_code, 
                username, 
                email, 
                gender,
                ranking_points,
                age_group,
                created_at
            FROM users 
            WHERE passport_code IS NOT NULL
            ORDER BY passport_code
        `);
        
        const allPlayers = allPlayersResult.rows;
        console.log(`\n🗄️ DATABASE STATS:`);
        console.log(`Total players in database: ${allPlayers.length}`);
        
        // Find exact matches
        const exactMatches = [];
        const unrecognizedCodes = [];
        
        cleanPassportCodes.forEach(code => {
            const match = allPlayers.find(player => 
                player.passport_code && player.passport_code.toUpperCase() === code.toUpperCase()
            );
            
            if (match) {
                exactMatches.push({
                    tournamentCode: code,
                    dbPlayer: match,
                    stats: analysisData.playerStats[code]
                });
            } else {
                unrecognizedCodes.push(code);
            }
        });
        
        console.log(`\n✅ EXACT MATCHES FOUND (${exactMatches.length}):`);
        console.log('================================================');
        exactMatches.forEach((match, index) => {
            const stats = match.stats;
            const genderBonus = match.dbPlayer.gender === 'female' && match.dbPlayer.ranking_points < 1000 ? '1.15x' : '1.0x';
            console.log(`${index + 1}. ${match.tournamentCode}`);
            console.log(`   Database: ${match.dbPlayer.username} (${match.dbPlayer.email})`);
            console.log(`   Gender: ${match.dbPlayer.gender}, Current Points: ${match.dbPlayer.ranking_points}`);
            console.log(`   Tournament: ${stats.totalPoints} base points, ${stats.matchesPlayed} matches`);
            console.log(`   Gender Bonus: ${genderBonus}`);
            console.log(`   Age Group: ${match.dbPlayer.age_group || 'Open'}`);
            console.log('');
        });
        
        console.log(`\n❓ UNRECOGNIZED CODES (${unrecognizedCodes.length}):`);
        console.log('==============================================');
        
        // Find potential similar codes for unrecognized ones
        for (const code of unrecognizedCodes) {
            console.log(`\n🔍 ${code}:`);
            console.log(`   Tournament Stats: ${analysisData.playerStats[code].totalPoints} pts, ${analysisData.playerStats[code].matchesPlayed} matches`);
            
            // Find similar passport codes using string similarity
            const potentialMatches = allPlayers
                .map(player => {
                    if (!player.passport_code) return null;
                    
                    const dbCode = player.passport_code.toUpperCase();
                    let similarity = 0;
                    
                    // Simple similarity: count matching characters at same positions
                    const minLength = Math.min(code.length, dbCode.length);
                    for (let i = 0; i < minLength; i++) {
                        if (code[i] === dbCode[i]) similarity++;
                    }
                    
                    // Add points for length similarity
                    if (Math.abs(code.length - dbCode.length) <= 1) similarity += 0.5;
                    
                    // Add points for character overlap regardless of position
                    const codeChars = new Set(code.split(''));
                    const dbChars = new Set(dbCode.split(''));
                    const commonChars = [...codeChars].filter(char => dbChars.has(char));
                    similarity += commonChars.length * 0.3;
                    
                    return {
                        player: player,
                        similarity: similarity,
                        dbCode: dbCode
                    };
                })
                .filter(match => match && match.similarity > 2) // Threshold for similarity
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 3); // Top 3 potential matches
            
            if (potentialMatches.length > 0) {
                console.log('   Potential matches:');
                potentialMatches.forEach((match, idx) => {
                    console.log(`     ${idx + 1}. ${match.dbCode} (${match.player.username}, similarity: ${match.similarity.toFixed(1)})`);
                    console.log(`        ${match.player.gender}, ${match.player.ranking_points} pts, ${match.player.email}`);
                });
            } else {
                console.log('   No similar codes found - likely new player');
            }
        }
        
        // Gender and bonus analysis
        console.log(`\n👥 GENDER & BONUS ANALYSIS:`);
        console.log('============================');
        
        let femalePlayersUnder1000 = 0;
        let totalFemaleMatches = 0;
        let totalBonusPoints = 0;
        
        exactMatches.forEach(match => {
            if (match.dbPlayer.gender === 'female' && match.dbPlayer.ranking_points < 1000) {
                femalePlayersUnder1000++;
                const bonusPoints = match.stats.totalPoints * 0.15; // 15% bonus
                totalBonusPoints += bonusPoints;
                totalFemaleMatches += match.stats.matchesPlayed;
                
                console.log(`🎀 ${match.tournamentCode} (${match.dbPlayer.username}): ${match.stats.totalPoints} → ${Math.floor(match.stats.totalPoints * 1.15)} pts (+15% female bonus)`);
            }
        });
        
        console.log(`\nFemale players eligible for 1.15x bonus: ${femalePlayersUnder1000}`);
        console.log(`Total bonus points to be awarded: ${Math.floor(totalBonusPoints)}`);
        console.log(`Total matches with gender bonus: ${totalFemaleMatches}`);
        
        // Age group analysis
        console.log(`\n🎯 AGE GROUP ANALYSIS:`);
        console.log('======================');
        
        const ageGroups = {};
        exactMatches.forEach(match => {
            const ageGroup = match.dbPlayer.age_group || 'Open';
            if (!ageGroups[ageGroup]) {
                ageGroups[ageGroup] = {
                    count: 0,
                    totalMatches: 0,
                    totalPoints: 0
                };
            }
            ageGroups[ageGroup].count++;
            ageGroups[ageGroup].totalMatches += match.stats.matchesPlayed;
            ageGroups[ageGroup].totalPoints += match.stats.totalPoints;
        });
        
        Object.entries(ageGroups).forEach(([group, data]) => {
            console.log(`${group}: ${data.count} players, ${data.totalMatches} matches, ${data.totalPoints} base points`);
        });
        
        return {
            exactMatches,
            unrecognizedCodes,
            cleanPassportCodes,
            bonusAnalysis: {
                femalePlayersUnder1000,
                totalBonusPoints: Math.floor(totalBonusPoints)
            }
        };
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
        return null;
    }
}

// Run the analysis
analyzePlayersInDatabase().then(result => {
    if (result) {
        console.log(`\n📋 SUMMARY FOR DATABASE UPDATE:`);
        console.log('================================');
        console.log(`Players to update: ${result.exactMatches.length}`);
        console.log(`New players to investigate: ${result.unrecognizedCodes.length}`);
        console.log(`Total bonus points: ${result.bonusAnalysis.totalBonusPoints}`);
        console.log(`Female players with bonus: ${result.bonusAnalysis.femalePlayersUnder1000}`);
        
        console.log(`\n⚠️ BEFORE DATABASE UPDATE:`);
        console.log(`Please review the unrecognized codes above and confirm:`);
        console.log(`1. Which similar matches are correct player identifications`);
        console.log(`2. Which codes represent entirely new players`);
        console.log(`3. Verify gender bonuses are correctly calculated`);
        console.log(`4. Confirm age group multipliers (if any)`);
    }
}).catch(console.error);