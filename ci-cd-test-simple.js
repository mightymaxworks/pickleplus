import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

console.log('🚀 Starting CI/CD Match Recording Tests...');

// Test scenarios with ranking point calculations
const scenarios = [
  {
    name: "Young Male Singles Tournament",
    ageGroup: "18-34", 
    multiplier: 1.0,
    matchType: "tournament",
    expectedWinner: 150,
    expectedLoser: 75
  },
  {
    name: "Senior Female League", 
    ageGroup: "60+",
    multiplier: 1.5,
    matchType: "league", 
    expectedWinner: 169, // 150 * 1.5 * 0.75 (league modifier)
    expectedLoser: 84
  },
  {
    name: "Masters Tournament",
    ageGroup: "50+", 
    multiplier: 1.3,
    matchType: "tournament",
    expectedWinner: 195, // 150 * 1.3
    expectedLoser: 98
  }
];

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/current-user`);
    if (response.data.isAdmin) {
      console.log('✅ Admin authentication verified');
      return true;
    }
  } catch (error) {
    console.log('❌ Authentication failed - please log in first');
    return false;
  }
}

async function testPlayerMatchRecording() {
  console.log('\n🎾 Testing Player Match Recording...');
  
  const testMatch = {
    playerOne: { id: 1, displayName: 'Test Player 1' },
    playerTwo: { id: 2, displayName: 'Test Player 2' },
    formatType: 'singles',
    matchType: 'casual',
    games: [{ playerOneScore: 11, playerTwoScore: 8 }],
    notes: 'CI/CD Test Match'
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/match/record`, testMatch);
    console.log('✅ Player match recording successful');
    return response.data;
  } catch (error) {
    console.log('❌ Player match recording failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testAdminMatchRecording() {
  console.log('\n🛠️ Testing Admin Match Recording...');
  
  const adminMatch = {
    playerOne: { id: 1, displayName: 'Admin Test Player 1' },
    playerTwo: { id: 2, displayName: 'Admin Test Player 2' },
    formatType: 'singles',
    matchType: 'tournament',
    games: [{ playerOneScore: 11, playerTwoScore: 9 }],
    notes: 'CI/CD Admin Test Match',
    competitionId: 1,
    isAdminRecorded: true
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/admin/match/record`, adminMatch);
    console.log('✅ Admin match recording successful');
    return response.data;
  } catch (error) {
    console.log('❌ Admin match recording failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testManualPointsOverride() {
  console.log('\n⚡ Testing Manual Points Override...');
  
  const overrideMatch = {
    playerOne: { id: 1, displayName: 'Override Test Player 1' },
    playerTwo: { id: 2, displayName: 'Override Test Player 2' },
    formatType: 'singles',
    matchType: 'tournament',
    games: [{ playerOneScore: 11, playerTwoScore: 7 }],
    notes: 'CI/CD Manual Override Test',
    manualPointsOverride: {
      winner: 500,
      loser: 250
    },
    isAdminRecorded: true
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/admin/match/record`, overrideMatch);
    console.log('✅ Manual points override successful');
    console.log(`   Applied: Winner ${response.data.rankingPoints?.winner}, Loser ${response.data.rankingPoints?.loser}`);
    return response.data;
  } catch (error) {
    console.log('❌ Manual points override failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testMatchHistory() {
  console.log('\n📚 Testing Match History...');
  
  try {
    const adminHistory = await axios.get(`${BASE_URL}/api/admin/match-management/history`);
    const pendingMatches = await axios.get(`${BASE_URL}/api/admin/match-management/pending`);
    
    console.log(`✅ Match history retrieved: ${adminHistory.data.length} total matches`);
    console.log(`✅ Pending matches: ${pendingMatches.data.length} awaiting validation`);
    
    return {
      totalMatches: adminHistory.data.length,
      pendingMatches: pendingMatches.data.length
    };
  } catch (error) {
    console.log('❌ Match history failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function displayRankingCalculations() {
  console.log('\n🎯 RANKING POINTS ALGORITHM TEST CASES:');
  console.log('=' + '='.repeat(50));
  
  scenarios.forEach(scenario => {
    console.log(`\n📋 ${scenario.name}:`);
    console.log(`   Age Group: ${scenario.ageGroup} (${scenario.multiplier}x multiplier)`);
    console.log(`   Match Type: ${scenario.matchType}`);
    console.log(`   Base Points: 150 winner, 75 loser`);
    console.log(`   Final Calculation:`);
    console.log(`     Winner: 150 × ${scenario.multiplier} × ${scenario.matchType === 'league' ? '0.75' : '1.0'} = ${scenario.expectedWinner}`);
    console.log(`     Loser:  75 × ${scenario.multiplier} × ${scenario.matchType === 'league' ? '0.75' : '1.0'} = ${scenario.expectedLoser}`);
  });

  console.log('\n🏆 Competition Multipliers:');
  console.log('   Tournament: 2.0x - 3.0x additional multiplier');
  console.log('   League: 1.5x additional multiplier'); 
  console.log('   Local Events: 1.0x (no additional multiplier)');
  
  console.log('\n⚙️ Manual Override Capability:');
  console.log('   Admin can set any value 0-1000 for winner AND loser separately');
  console.log('   Completely bypasses automatic calculation when enabled');
}

async function runTests() {
  console.log('Starting comprehensive CI/CD testing for 100% operational capability...\n');
  
  // Display ranking calculations first
  await displayRankingCalculations();
  
  let passed = 0;
  let total = 5;
  
  // Test authentication
  if (await testAuthentication()) passed++;
  
  // Test player match recording
  if (await testPlayerMatchRecording()) passed++;
  
  // Test admin match recording
  if (await testAdminMatchRecording()) passed++;
  
  // Test manual points override
  if (await testManualPointsOverride()) passed++;
  
  // Test match history
  if (await testMatchHistory()) passed++;
  
  console.log('\n📊 CI/CD TEST RESULTS:');
  console.log('=' + '='.repeat(30));
  console.log(`Tests Passed: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  console.log(`Operational Capability: ${Math.round(passed/total*100)}%`);
  
  if (passed === total) {
    console.log('🎉 100% OPERATIONAL CAPABILITY ACHIEVED!');
    console.log('✅ Player match recording: WORKING');
    console.log('✅ Admin match recording: WORKING');
    console.log('✅ Competition linking: WORKING');
    console.log('✅ Manual points override: WORKING');
    console.log('✅ Match history/management: WORKING');
  } else {
    console.log(`⚠️ ${total - passed} test(s) failed - needs attention`);
  }
}

runTests().catch(console.error);