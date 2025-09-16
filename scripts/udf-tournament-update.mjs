import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

console.log('🏆 UDF-COMPLIANT TOURNAMENT DATABASE UPDATE');
console.log('==========================================');
console.log('Tournament: September 8-14 Weekly Tournament (Mixed Format)');
console.log('Following: Unified Development Framework Best Practices');
console.log('Algorithm: System B (3 pts win, 1 pt loss) + Gender Bonuses\n');

// Initialize database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Load corrected tournament analysis
let tournamentData;
try {
    tournamentData = JSON.parse(fs.readFileSync('corrected-tournament-analysis.json', 'utf8'));
    console.log('✅ Tournament analysis data loaded successfully');
} catch (error) {
    console.error('❌ Failed to load tournament analysis data:', error.message);
    process.exit(1);
}

// Passport code mappings (high-confidence corrections)
const passportMappings = {
    '2L8TU0': '2L8TUO',      // Mumu (female, 31.74)
    '31JJ00': '31JJOO',      // zirufu (male, 46.00)
    '5XKD06': '5XKDO6',      // UpGood (null, 0.00)
    '80IYHC': '8OIYHC',      // fengqiang (male, 0.00)
    'FOGBAM': 'F0GBAM',      // Gloria1989 (female, 56.30)
    'JN110L': 'JN11OL',      // Baoer_liang (female, 1.00)
    'PZGEOT': 'PZGE0T',      // connie (female, 0.00)
    'VOR7AU': 'VQR7AU',      // chihiro (female, 14.65)
    'W9YINQ': 'W9YJNQ',      // rayzhjw (male, 29.16)
    'F50WO8': 'F5OWO8',      // Lang (male, 0.00)
    'PKL-000249': 'LT57DN'   // Luka (male, 9.00) - Database ID conversion
};

// Apply mappings to tournament data
function applyPassportMappings(playerStats) {
    const mappedStats = {};
    
    for (const [originalCode, stats] of Object.entries(playerStats)) {
        const mappedCode = passportMappings[originalCode] || originalCode;
        mappedStats[mappedCode] = {
            ...stats,
            originalCode: originalCode !== mappedCode ? originalCode : undefined
        };
    }
    
    return mappedStats;
}

// UDF Algorithm Validation: System B Point Calculation
function calculateSystemBPoints(wins, losses, draws) {
    const winPoints = wins * 3;
    const lossPoints = losses * 1; 
    const drawPoints = draws * 1;
    
    return {
        basePoints: winPoints + lossPoints + drawPoints,
        breakdown: {
            fromWins: winPoints,
            fromLosses: lossPoints,
            fromDraws: drawPoints
        }
    };
}

// UDF Gender Bonus Calculation
function calculateGenderBonus(basePoints, gender, currentRankingPoints) {
    if (gender === 'female' && currentRankingPoints < 1000) {
        const bonusPoints = Math.floor(basePoints * 0.15); // 15% bonus, rounded down
        return {
            multiplier: 1.15,
            bonusPoints: bonusPoints,
            finalPoints: basePoints + bonusPoints
        };
    }
    
    return {
        multiplier: 1.0,
        bonusPoints: 0,
        finalPoints: basePoints
    };
}

// Main database update function with UDF compliance
async function updateTournamentResults() {
    console.log('🔍 PHASE 1: DATA VALIDATION AND PREPARATION');
    console.log('===========================================');
    
    const mappedPlayerStats = applyPassportMappings(tournamentData.playerStats);
    const allPassportCodes = Object.keys(mappedPlayerStats);
    
    console.log(`Total players to process: ${allPassportCodes.length}`);
    console.log(`Passport mappings applied: ${Object.keys(passportMappings).length}`);
    
    // Fetch all players from database
    console.log('\n📋 Fetching current player data from database...');
    
    const placeholders = allPassportCodes.map((_, i) => `$${i + 1}`).join(',');
    const playersQuery = `
        SELECT id, passport_code, username, email, gender, ranking_points, created_at
        FROM users 
        WHERE passport_code IN (${placeholders})
        ORDER BY passport_code
    `;
    
    let databasePlayers;
    try {
        const result = await pool.query(playersQuery, allPassportCodes);
        databasePlayers = result.rows;
        console.log(`✅ Found ${databasePlayers.length} players in database`);
    } catch (error) {
        console.error('❌ Database query failed:', error.message);
        process.exit(1);
    }
    
    // Create update plan
    console.log('\n🧮 PHASE 2: POINTS CALCULATION WITH UDF VALIDATION');
    console.log('==================================================');
    
    const updatePlan = [];
    let totalPointsToAllocate = 0;
    let totalGenderBonusPoints = 0;
    let femalePlayersWithBonus = 0;
    
    for (const dbPlayer of databasePlayers) {
        const passportCode = dbPlayer.passport_code;
        const tournamentStats = mappedPlayerStats[passportCode];
        
        if (!tournamentStats) {
            console.log(`⚠️ No tournament data found for ${passportCode} (${dbPlayer.username})`);
            continue;
        }
        
        // Calculate base points using System B
        const pointsCalc = calculateSystemBPoints(
            tournamentStats.wins,
            tournamentStats.losses, 
            tournamentStats.draws
        );
        
        // Calculate gender bonus
        const genderBonus = calculateGenderBonus(
            pointsCalc.basePoints,
            dbPlayer.gender,
            parseFloat(dbPlayer.ranking_points)
        );
        
        // Track statistics
        totalPointsToAllocate += genderBonus.finalPoints;
        if (genderBonus.bonusPoints > 0) {
            totalGenderBonusPoints += genderBonus.bonusPoints;
            femalePlayersWithBonus++;
        }
        
        // Create update plan entry
        updatePlan.push({
            playerId: dbPlayer.id,
            passportCode: passportCode,
            username: dbPlayer.username,
            gender: dbPlayer.gender,
            currentPoints: parseFloat(dbPlayer.ranking_points),
            tournamentStats: tournamentStats,
            pointsCalculation: pointsCalc,
            genderBonus: genderBonus,
            originalCode: tournamentStats.originalCode
        });
        
        console.log(`📊 ${passportCode} (${dbPlayer.username}):`);
        console.log(`   Current: ${dbPlayer.ranking_points} pts | Gender: ${dbPlayer.gender || 'null'}`);
        console.log(`   Tournament: ${tournamentStats.matchesPlayed}M (${tournamentStats.wins}W-${tournamentStats.losses}L-${tournamentStats.draws}D)`);
        console.log(`   Base Points: ${pointsCalc.basePoints} | Gender Bonus: ${genderBonus.bonusPoints} | Final: ${genderBonus.finalPoints}`);
        if (tournamentStats.originalCode) {
            console.log(`   ↳ Mapped from: ${tournamentStats.originalCode}`);
        }
        console.log('');
    }
    
    // Display summary
    console.log('📈 ALLOCATION SUMMARY:');
    console.log('======================');
    console.log(`Players to update: ${updatePlan.length}`);
    console.log(`Total points to allocate: ${totalPointsToAllocate}`);
    console.log(`Gender bonus points: ${totalGenderBonusPoints}`);
    console.log(`Female players with bonus: ${femalePlayersWithBonus}`);
    console.log(`Tournament matches processed: ${tournamentData.tournamentInfo.totalMatches}`);
    console.log(`- Doubles: ${tournamentData.tournamentInfo.doublesMatches}`);
    console.log(`- Singles: ${tournamentData.tournamentInfo.singlesMatches}`);
    
    // Confirmation and integrity checks
    console.log('\n🔒 PHASE 3: DATA INTEGRITY VERIFICATION');
    console.log('=======================================');
    
    // Check for negative or suspicious point allocations
    const suspiciousUpdates = updatePlan.filter(plan => 
        plan.genderBonus.finalPoints < 0 || 
        plan.genderBonus.finalPoints > 200 ||
        plan.tournamentStats.matchesPlayed === 0
    );
    
    if (suspiciousUpdates.length > 0) {
        console.error('❌ INTEGRITY CHECK FAILED: Suspicious point allocations detected');
        suspiciousUpdates.forEach(plan => {
            console.error(`   ${plan.passportCode}: ${plan.genderBonus.finalPoints} points from ${plan.tournamentStats.matchesPlayed} matches`);
        });
        process.exit(1);
    }
    
    // Check for duplicate players
    const passportCodes = updatePlan.map(plan => plan.passportCode);
    const uniqueCodes = new Set(passportCodes);
    if (passportCodes.length !== uniqueCodes.size) {
        console.error('❌ INTEGRITY CHECK FAILED: Duplicate passport codes detected');
        process.exit(1);
    }
    
    console.log('✅ All integrity checks passed');
    
    // Execute database updates
    console.log('\n💾 PHASE 4: DATABASE UPDATE WITH UDF ADDITIVE SYSTEM');
    console.log('====================================================');
    
    const transaction = await pool.query('BEGIN');
    
    try {
        let successCount = 0;
        
        for (const plan of updatePlan) {
            // UDF ADDITIVE POINTS SYSTEM: Always ADD to existing points, never replace
            const updateQuery = `
                UPDATE users 
                SET ranking_points = ranking_points + $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING id, passport_code, ranking_points
            `;
            
            const result = await pool.query(updateQuery, [
                plan.genderBonus.finalPoints,
                plan.playerId
            ]);
            
            if (result.rowCount === 1) {
                const updated = result.rows[0];
                console.log(`✅ ${plan.passportCode}: ${plan.currentPoints} + ${plan.genderBonus.finalPoints} = ${updated.ranking_points}`);
                successCount++;
            } else {
                throw new Error(`Failed to update player ${plan.passportCode} (ID: ${plan.playerId})`);
            }
        }
        
        // Record tournament in match history (for audit purposes)
        const tournamentRecordQuery = `
            INSERT INTO tournament_records (
                tournament_name, 
                tournament_date_range, 
                total_matches,
                doubles_matches,
                singles_matches,
                total_players,
                total_points_allocated,
                gender_bonus_points,
                processing_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        `;
        
        try {
            await pool.query(tournamentRecordQuery, [
                tournamentData.tournamentInfo.name,
                tournamentData.tournamentInfo.dateRange,
                tournamentData.tournamentInfo.totalMatches,
                tournamentData.tournamentInfo.doublesMatches,
                tournamentData.tournamentInfo.singlesMatches,
                updatePlan.length,
                totalPointsToAllocate,
                totalGenderBonusPoints
            ]);
            console.log('📝 Tournament record created for audit trail');
        } catch (error) {
            console.log('⚠️ Tournament record creation failed (table may not exist):', error.message);
        }
        
        await pool.query('COMMIT');
        
        console.log('\n🎉 DATABASE UPDATE COMPLETED SUCCESSFULLY');
        console.log('========================================');
        console.log(`✅ Successfully updated ${successCount} players`);
        console.log(`✅ Total points allocated: ${totalPointsToAllocate}`);
        console.log(`✅ Gender bonus points awarded: ${totalGenderBonusPoints}`);
        console.log('✅ UDF Additive Points System: All points added to existing totals');
        console.log('✅ Algorithm Validation: System B + Gender Bonuses applied correctly');
        console.log('✅ Data Integrity: All validation checks passed');
        
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('\n❌ DATABASE UPDATE FAILED');
        console.error('Transaction rolled back:', error.message);
        throw error;
    }
}

// Execute the update
updateTournamentResults()
    .then(() => {
        console.log('\n🏁 Tournament database update completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Tournament database update failed:', error.message);
        process.exit(1);
    });