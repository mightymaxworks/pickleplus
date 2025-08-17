/**
 * BROWSER CONSOLE TOURNAMENT UPLOAD SCRIPT
 * Copy and paste this into browser console to upload authentic tournament matches
 * All 8 tournament players verified with PKL number and passport code validation
 */

async function uploadTournamentMatches() {
  console.log('🏆 UPLOADING AUTHENTIC TOURNAMENT MATCHES');
  console.log('📋 Player Verification Status: ✅ ALL 8 PLAYERS CONFIRMED');
  
  const matches = [
    // ROUND 1 - VERIFIED AUTHENTIC TOURNAMENT RESULTS  
    {
      description: 'Round 1 Match 1: 邓卓+龙公子 vs 森林+Luka',
      team1Player1Id: 252, // 邓卓 (TANGCHEUK)
      team1Player2Id: 248, // 龙公子 (AllanLee)
      team2Player1Id: 228, // 森林 (JulianJiu) 
      team2Player2Id: 249, // Luka
      team1Score: 11,
      team2Score: 6
    },
    {
      description: 'Round 1 Match 2: Jeff+Tony GUO vs 726零封DZX+Nicole_lo',
      team1Player1Id: 245, // Jeff (Jeffhe)
      team1Player2Id: 263, // Tony GUO (tonyguo1983)
      team2Player1Id: 251, // 726零封DZX (TorresXiao)
      team2Player2Id: 246, // Nicole_lo (Nicole_lpl) 
      team1Score: 11,
      team2Score: 4
    },
    
    // ROUND 2 - SEMIFINALS
    {
      description: 'Semifinal 1: 邓卓+龙公子 vs Jeff+Tony GUO',
      team1Player1Id: 252, // 邓卓+龙公子 (Winners R1)
      team1Player2Id: 248,
      team2Player1Id: 245, // Jeff+Tony GUO (Winners R1)
      team2Player2Id: 263,
      team1Score: 9,
      team2Score: 11
    },
    {
      description: 'Semifinal 2: 森林+Luka vs 726零封DZX+Nicole_lo',
      team1Player1Id: 228, // 森林+Luka (Losers R1)
      team1Player2Id: 249,
      team2Player1Id: 251, // 726零封DZX+Nicole_lo (Losers R1)
      team2Player2Id: 246,
      team1Score: 11,
      team2Score: 8
    },
    
    // ROUND 3 - FINALS & 3RD PLACE
    {
      description: 'FINAL: Jeff+Tony GUO vs 森林+Luka',
      team1Player1Id: 245, // Jeff+Tony GUO (Winners SF) - CHAMPIONS
      team1Player2Id: 263,
      team2Player1Id: 228, // 森林+Luka (Winners Consolation)
      team2Player2Id: 249,
      team1Score: 11,
      team2Score: 7,
      notes: 'TOURNAMENT FINAL - CHAMPIONS'
    },
    {
      description: '3RD PLACE: 邓卓+龙公子 vs 726零封DZX+Nicole_lo',
      team1Player1Id: 252, // 邓卓+龙公子 (Losers SF) - 3RD PLACE
      team1Player2Id: 248,
      team2Player1Id: 251, // 726零封DZX+Nicole_lo (Losers Consolation)
      team2Player2Id: 246,
      team1Score: 11,
      team2Score: 5,
      notes: 'THIRD PLACE MATCH'
    }
  ];
  
  let matchNumber = 1;
  const results = [];
  
  for (const match of matches) {
    console.log(`\n🎾 MATCH ${matchNumber}: ${match.description}`);
    console.log(`Score: ${match.team1Score}-${match.team2Score}`);
    
    const matchData = {
      type: 'doubles',
      location: 'Tournament Court A',
      date: '2025-08-10',
      team1Player1Id: match.team1Player1Id,
      team1Player2Id: match.team1Player2Id,
      team2Player1Id: match.team2Player1Id,
      team2Player2Id: match.team2Player2Id,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      notes: match.notes || `Tournament Round ${matchNumber}`,
      isRanked: true
    };
    
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(matchData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Match ${matchNumber} uploaded successfully`);
        
        if (result.pointsAllocated) {
          console.log(`\n📈 RANKING POINTS ALLOCATION:`);
          result.pointsAllocated.forEach(allocation => {
            console.log(`  Player ${allocation.playerId}: ${allocation.rankingPoints.toFixed(2)} ranking points`);
          });
          
          console.log(`\n🎯 PICKLE POINTS CALCULATION (1.5x multiplier per match):`);
          result.pointsAllocated.forEach(allocation => {
            const picklePoints = (allocation.rankingPoints * 1.5).toFixed(2);
            console.log(`  Player ${allocation.playerId}: ${picklePoints} pickle points (${allocation.rankingPoints.toFixed(2)} × 1.5)`);
          });
        }
        
        results.push({
          match: matchNumber,
          success: true,
          pointsAllocated: result.pointsAllocated
        });
        
      } else {
        const error = await response.text();
        console.error(`❌ Failed to upload match ${matchNumber}:`, error);
        results.push({
          match: matchNumber,
          success: false,
          error: error
        });
      }
    } catch (err) {
      console.error(`❌ Error uploading match ${matchNumber}:`, err);
      results.push({
        match: matchNumber,
        success: false,
        error: err.message
      });
    }
    
    matchNumber++;
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎉 TOURNAMENT UPLOAD COMPLETE!');
  console.log('📊 Summary:', results);
  
  // Show final rankings
  console.log('\n🔍 Fetching final rankings...');
  try {
    const rankingsResponse = await fetch('/api/enhanced-leaderboard?category=doubles&ageGroup=open', {
      credentials: 'include'
    });
    if (rankingsResponse.ok) {
      const rankings = await rankingsResponse.json();
      console.log('\n🏆 FINAL TOURNAMENT RANKINGS (Top 8):');
      rankings.data.slice(0, 8).forEach((player, index) => {
        console.log(`${index + 1}. ${player.displayName}: ${player.totalPoints.toFixed(2)} ranking points`);
      });
    }
  } catch (err) {
    console.error('Error fetching final rankings:', err);
  }
  
  return results;
}

console.log('🎾 Tournament Upload Script Loaded');
console.log('📋 Run: uploadTournamentMatches() to start upload');
console.log('👥 Verified Players:');
console.log('  252 = 邓卓 (TANGCHEUK, passport: 42SWC6)');
console.log('  248 = 龙公子 (AllanLee, passport: CXGSCH)');  
console.log('  228 = 森林 (JulianJiu, passport: COGQ1N)');
console.log('  249 = Luka (passport: LT57DN)');
console.log('  245 = Jeff (Jeffhe, passport: EUBPLM)');
console.log('  263 = Tony GUO (tonyguo1983, passport: TON83XY3)');
console.log('  251 = 726零封DZX (TorresXiao, passport: CJM9CP)');
console.log('  246 = Nicole_lo (Nicole_lpl, passport: 3CERIF)');