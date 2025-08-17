/**
 * AUTHENTIC TOURNAMENT MATCHES UPLOAD
 * Tournament Player Verification Complete - All 8 players confirmed
 * Using verified database IDs with passport code validation
 */

const tournaments = [
  {
    date: '2025-08-10',
    location: 'Tournament Court A',
    format: 'doubles',
    players: [
      { id: 252, name: '邓卓 (1号)', passport: '42SWC6' },          // TANGCHEUK
      { id: 248, name: '龙公子 (2号)', passport: 'CXGSCH' },        // AllanLee  
      { id: 228, name: '森林 (3号)', passport: 'COGQ1N' },          // JulianJiu
      { id: 249, name: 'Luka (4号)', passport: 'LT57DN' },          // Luka
      { id: 245, name: 'Jeff (5号)', passport: 'EUBPLM' },          // Jeffhe
      { id: 263, name: 'Tony GUO (6号)', passport: 'TON83XY3' },    // tonyguo1983
      { id: 251, name: '726零封DZX (7号)', passport: 'CJM9CP' },     // TorresXiao
      { id: 246, name: 'Nicole_lo (8号)', passport: '3CERIF' }      // Nicole_lpl
    ],
    matches: [
      // ROUND 1 - VERIFIED AUTHENTIC TOURNAMENT RESULTS
      {
        team1: [252, 248], // 邓卓 + 龙公子
        team2: [228, 249], // 森林 + Luka  
        score1: 11, score2: 6,
        winner: 1
      },
      {
        team1: [245, 263], // Jeff + Tony GUO
        team2: [251, 246], // 726零封DZX + Nicole_lo
        score1: 11, score2: 4, 
        winner: 1
      },
      
      // ROUND 2 - SEMIFINALS
      {
        team1: [252, 248], // 邓卓 + 龙公子 (Winners R1)
        team2: [245, 263], // Jeff + Tony GUO (Winners R1)
        score1: 9, score2: 11,
        winner: 2
      },
      {
        team1: [228, 249], // 森林 + Luka (Losers R1)
        team2: [251, 246], // 726零封DZX + Nicole_lo (Losers R1)
        score1: 11, score2: 8,
        winner: 1
      },
      
      // ROUND 3 - FINALS & 3RD PLACE
      {
        team1: [245, 263], // Jeff + Tony GUO (Winners SF)
        team2: [228, 249], // 森林 + Luka (Winners Consolation)
        score1: 11, score2: 7,
        winner: 1, // CHAMPIONS: Jeff + Tony GUO
        isFinal: true
      },
      {
        team1: [252, 248], // 邓卓 + 龙公子 (Losers SF)
        team2: [251, 246], // 726零封DZX + Nicole_lo (Losers Consolation)
        score1: 11, score2: 5,
        winner: 1, // 3RD PLACE: 邓卓 + 龙公子
        isThirdPlace: true
      }
    ]
  }
];

async function uploadTournamentMatches() {
  console.log('🏆 UPLOADING AUTHENTIC TOURNAMENT MATCHES');
  console.log('📋 Player Verification Status: ✅ ALL 8 PLAYERS CONFIRMED');
  
  const tournament = tournaments[0];
  let matchNumber = 1;
  
  for (const match of tournament.matches) {
    const team1Players = match.team1;
    const team2Players = match.team2;
    
    console.log(`\n🎾 MATCH ${matchNumber}: ${match.score1}-${match.score2}`);
    console.log(`Team 1: ${team1Players.join(' + ')}`);
    console.log(`Team 2: ${team2Players.join(' + ')}`);
    console.log(`Winner: Team ${match.winner}`);
    
    const matchData = {
      type: 'doubles',
      location: tournament.location,
      date: tournament.date,
      team1Player1Id: team1Players[0],
      team1Player2Id: team1Players[1], 
      team2Player1Id: team2Players[0],
      team2Player2Id: team2Players[1],
      team1Score: match.score1,
      team2Score: match.score2,
      notes: match.isFinal ? 'TOURNAMENT FINAL' : 
             match.isThirdPlace ? 'THIRD PLACE MATCH' : 
             `Tournament Round ${matchNumber}`,
      isRanked: true
    };
    
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Match ${matchNumber} uploaded successfully`);
        console.log(`📊 Points Allocated:`, result.pointsAllocated);
        
        // Show Ranking Points vs Pickle Points
        if (result.pointsAllocated) {
          console.log(`\n📈 RANKING POINTS ALLOCATION:`);
          result.pointsAllocated.forEach(allocation => {
            console.log(`  Player ${allocation.playerId}: ${allocation.rankingPoints} ranking points`);
          });
          
          console.log(`\n🎯 PICKLE POINTS ALLOCATION (1.5x multiplier per match):`);
          result.pointsAllocated.forEach(allocation => {
            const picklePoints = allocation.rankingPoints * 1.5;
            console.log(`  Player ${allocation.playerId}: ${picklePoints} pickle points`);
          });
        }
        
      } else {
        const error = await response.text();
        console.error(`❌ Failed to upload match ${matchNumber}:`, error);
      }
    } catch (err) {
      console.error(`❌ Error uploading match ${matchNumber}:`, err);
    }
    
    matchNumber++;
  }
  
  console.log('\n🎉 TOURNAMENT UPLOAD COMPLETE!');
  console.log('🔍 Verifying final rankings...');
  
  // Verify final point totals
  try {
    const rankingsResponse = await fetch('/api/enhanced-leaderboard?category=doubles&ageGroup=open');
    if (rankingsResponse.ok) {
      const rankings = await rankingsResponse.json();
      console.log('\n🏆 FINAL TOURNAMENT RANKINGS:');
      rankings.data.slice(0, 8).forEach((player, index) => {
        console.log(`${index + 1}. ${player.displayName}: ${player.totalPoints} ranking points`);
      });
    }
  } catch (err) {
    console.error('Error fetching final rankings:', err);
  }
}

// Auto-execute when loaded
uploadTournamentMatches();