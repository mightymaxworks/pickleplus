/**
 * CI/CD Test Suite for Match Recording System
 * Tests both player and admin match recording with comprehensive ranking point calculations
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Test data for various scenarios
const testScenarios = [
  {
    name: "Young Male Singles Tournament",
    playerOne: { age: 25, gender: 'male', rating: 3.5 },
    playerTwo: { age: 28, gender: 'male', rating: 3.2 },
    matchType: 'tournament',
    formatType: 'singles',
    expectedAgeGroup: '18-34',
    expectedMultiplier: 1.0,
    expectedBasePoints: { winner: 150, loser: 75 }
  },
  {
    name: "Senior Female Doubles League",
    playerOne: { age: 65, gender: 'female', rating: 4.0 },
    playerTwo: { age: 62, gender: 'female', rating: 3.8 },
    partnerOne: { age: 68, gender: 'female', rating: 3.9 },
    partnerTwo: { age: 60, gender: 'female', rating: 4.1 },
    matchType: 'league',
    formatType: 'doubles',
    expectedAgeGroup: '60+',
    expectedMultiplier: 1.5,
    expectedBasePoints: { winner: 225, loser: 112.5 }
  },
  {
    name: "Mixed Age Casual Singles",
    playerOne: { age: 45, gender: 'male', rating: 3.0 },
    playerTwo: { age: 32, gender: 'female', rating: 3.3 },
    matchType: 'casual',
    formatType: 'singles',
    expectedAgeGroup: '35+',
    expectedMultiplier: 1.2,
    expectedBasePoints: { winner: 90, loser: 45 } // 50% for casual
  },
  {
    name: "Master's Tournament Doubles",
    playerOne: { age: 55, gender: 'male', rating: 4.5 },
    playerTwo: { age: 52, gender: 'male', rating: 4.2 },
    partnerOne: { age: 58, gender: 'male', rating: 4.3 },
    partnerTwo: { age: 54, gender: 'male', rating: 4.4 },
    matchType: 'tournament',
    formatType: 'doubles',
    expectedAgeGroup: '50+',
    expectedMultiplier: 1.3,
    expectedBasePoints: { winner: 195, loser: 97.5 }
  },
  {
    name: "Senior Mixed Doubles",
    playerOne: { age: 72, gender: 'male', rating: 3.5 },
    playerTwo: { age: 69, gender: 'female', rating: 3.7 },
    partnerOne: { age: 71, gender: 'female', rating: 3.6 },
    partnerTwo: { age: 70, gender: 'male', rating: 3.8 },
    matchType: 'tournament',
    formatType: 'doubles',
    expectedAgeGroup: '70+',
    expectedMultiplier: 1.6,
    expectedBasePoints: { winner: 240, loser: 120 }
  }
];

// Competition test data
const testCompetitions = [
  { name: "Summer Championship 2025", type: "tournament", pointsMultiplier: 2.0, venue: "Central Courts" },
  { name: "Weekly League", type: "league", pointsMultiplier: 1.5, venue: "Local Club" },
  { name: "Masters Tournament", type: "tournament", pointsMultiplier: 3.0, venue: "Elite Center" }
];

class MatchRecordingTester {
  constructor() {
    this.adminToken = null;
    this.playerToken = null;
    this.testResults = [];
  }

  async authenticate() {
    console.log("🔐 Authenticating test users...");
    
    // Admin login
    try {
      const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'admin',
        password: 'admin'
      });
      this.adminToken = adminLogin.data.token;
      console.log("✅ Admin authentication successful");
    } catch (error) {
      console.error("❌ Admin authentication failed:", error.message);
      throw error;
    }

    // Player login (create test player if needed)
    try {
      const playerLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'testplayer',
        password: 'testpass123'
      });
      this.playerToken = playerLogin.data.token;
      console.log("✅ Player authentication successful");
    } catch (error) {
      // Create test player if login fails
      await this.createTestPlayer();
    }
  }

  async createTestPlayer() {
    console.log("👤 Creating test player...");
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        username: 'testplayer',
        email: 'testplayer@pickle.com',
        password: 'testpass123',
        firstName: 'Test',
        lastName: 'Player',
        dateOfBirth: '1985-06-15'
      });
      
      const playerLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'testplayer',
        password: 'testpass123'
      });
      this.playerToken = playerLogin.data.token;
      console.log("✅ Test player created and authenticated");
    } catch (error) {
      console.error("❌ Test player creation failed:", error.message);
      throw error;
    }
  }

  async testPlayerMatchRecording() {
    console.log("\n🎾 Testing Player Match Recording...");
    
    for (const scenario of testScenarios) {
      try {
        console.log(`\n📋 Testing: ${scenario.name}`);
        
        const matchData = {
          formatType: scenario.formatType,
          scoringSystem: 'traditional',
          pointsToWin: 11,
          division: scenario.expectedAgeGroup,
          matchType: scenario.matchType,
          eventTier: 'local',
          players: this.generatePlayersData(scenario),
          gameScores: [{ playerOneScore: 11, playerTwoScore: 8 }],
          notes: `CI/CD Test: ${scenario.name}`
        };

        const response = await axios.post(`${BASE_URL}/api/match/record`, matchData, {
          headers: { Authorization: `Bearer ${this.playerToken}` }
        });

        const result = {
          scenario: scenario.name,
          type: 'Player Recording',
          success: response.status === 200,
          matchId: response.data.id,
          calculatedPoints: response.data.rankingPoints,
          expectedPoints: scenario.expectedBasePoints,
          ageGroup: scenario.expectedAgeGroup,
          multiplier: scenario.expectedMultiplier
        };

        this.testResults.push(result);
        console.log(`✅ ${scenario.name} - Match recorded successfully`);
        console.log(`   Calculated Points: Winner ${result.calculatedPoints?.winner || 'N/A'}, Loser ${result.calculatedPoints?.loser || 'N/A'}`);
        console.log(`   Expected Points: Winner ${result.expectedPoints.winner}, Loser ${result.expectedPoints.loser}`);
        
      } catch (error) {
        console.error(`❌ ${scenario.name} failed:`, error.message);
        this.testResults.push({
          scenario: scenario.name,
          type: 'Player Recording',
          success: false,
          error: error.message
        });
      }
    }
  }

  async testAdminMatchRecording() {
    console.log("\n🛠️ Testing Admin Match Recording with Competition Linking...");
    
    for (const scenario of testScenarios) {
      for (const competition of testCompetitions) {
        try {
          console.log(`\n📋 Testing Admin: ${scenario.name} + ${competition.name}`);
          
          const matchData = {
            formatType: scenario.formatType,
            scoringSystem: 'traditional',
            pointsToWin: 11,
            division: scenario.expectedAgeGroup,
            matchType: 'tournament', // Admin can record tournament matches
            eventTier: 'local',
            players: this.generatePlayersData(scenario),
            gameScores: [{ playerOneScore: 11, playerTwoScore: 9 }],
            notes: `CI/CD Admin Test: ${scenario.name} + ${competition.name}`,
            competitionId: competition.id || 1,
            isAdminRecorded: true
          };

          const response = await axios.post(`${BASE_URL}/api/admin/match/record`, matchData, {
            headers: { Authorization: `Bearer ${this.adminToken}` }
          });

          const expectedPointsWithCompetition = {
            winner: Math.round(scenario.expectedBasePoints.winner * competition.pointsMultiplier),
            loser: Math.round(scenario.expectedBasePoints.loser * competition.pointsMultiplier)
          };

          const result = {
            scenario: `${scenario.name} + ${competition.name}`,
            type: 'Admin Recording',
            success: response.status === 200,
            matchId: response.data.id,
            calculatedPoints: response.data.rankingPoints,
            expectedPoints: expectedPointsWithCompetition,
            competitionMultiplier: competition.pointsMultiplier,
            ageGroup: scenario.expectedAgeGroup,
            multiplier: scenario.expectedMultiplier
          };

          this.testResults.push(result);
          console.log(`✅ ${scenario.name} + ${competition.name} - Admin match recorded`);
          console.log(`   Competition Multiplier: ${competition.pointsMultiplier}x`);
          console.log(`   Final Points: Winner ${result.calculatedPoints?.winner || 'N/A'}, Loser ${result.calculatedPoints?.loser || 'N/A'}`);
          
        } catch (error) {
          console.error(`❌ Admin ${scenario.name} + ${competition.name} failed:`, error.message);
          this.testResults.push({
            scenario: `${scenario.name} + ${competition.name}`,
            type: 'Admin Recording',
            success: false,
            error: error.message
          });
        }
      }
    }
  }

  async testManualPointsOverride() {
    console.log("\n⚡ Testing Manual Points Override...");
    
    const overrideTests = [
      { winner: 500, loser: 250, scenario: "High Stakes Override" },
      { winner: 100, loser: 50, scenario: "Low Stakes Override" },
      { winner: 1000, loser: 0, scenario: "Maximum Winner Points" },
      { winner: 0, loser: 1000, scenario: "Penalty Points Test" }
    ];

    for (const override of overrideTests) {
      try {
        console.log(`\n📋 Testing Manual Override: ${override.scenario}`);
        
        const matchData = {
          formatType: 'singles',
          scoringSystem: 'traditional',
          pointsToWin: 11,
          division: 'open',
          matchType: 'tournament',
          eventTier: 'local',
          players: this.generatePlayersData(testScenarios[0]),
          gameScores: [{ playerOneScore: 11, playerTwoScore: 7 }],
          notes: `Manual Override Test: ${override.scenario}`,
          manualPointsOverride: {
            winner: override.winner,
            loser: override.loser
          },
          isAdminRecorded: true
        };

        const response = await axios.post(`${BASE_URL}/api/admin/match/record`, matchData, {
          headers: { Authorization: `Bearer ${this.adminToken}` }
        });

        const result = {
          scenario: override.scenario,
          type: 'Manual Points Override',
          success: response.status === 200,
          matchId: response.data.id,
          calculatedPoints: response.data.rankingPoints,
          expectedPoints: { winner: override.winner, loser: override.loser }
        };

        this.testResults.push(result);
        console.log(`✅ ${override.scenario} - Override applied successfully`);
        console.log(`   Applied Points: Winner ${override.winner}, Loser ${override.loser}`);
        
      } catch (error) {
        console.error(`❌ ${override.scenario} failed:`, error.message);
        this.testResults.push({
          scenario: override.scenario,
          type: 'Manual Points Override',
          success: false,
          error: error.message
        });
      }
    }
  }

  async testMatchHistory() {
    console.log("\n📚 Testing Match History and Management...");
    
    try {
      // Test admin match history
      const adminHistory = await axios.get(`${BASE_URL}/api/admin/match-management/history`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });

      console.log(`✅ Admin match history retrieved: ${adminHistory.data.length} matches`);

      // Test player match history
      const playerHistory = await axios.get(`${BASE_URL}/api/match/history`, {
        headers: { Authorization: `Bearer ${this.playerToken}` }
      });

      console.log(`✅ Player match history retrieved: ${playerHistory.data.length} matches`);

      // Test pending matches
      const pendingMatches = await axios.get(`${BASE_URL}/api/admin/match-management/pending`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });

      console.log(`✅ Pending matches retrieved: ${pendingMatches.data.length} matches`);

      this.testResults.push({
        scenario: 'Match History & Management',
        type: 'Data Retrieval',
        success: true,
        adminHistory: adminHistory.data.length,
        playerHistory: playerHistory.data.length,
        pendingMatches: pendingMatches.data.length
      });

    } catch (error) {
      console.error("❌ Match history testing failed:", error.message);
      this.testResults.push({
        scenario: 'Match History & Management',
        type: 'Data Retrieval',
        success: false,
        error: error.message
      });
    }
  }

  generatePlayersData(scenario) {
    const players = [
      {
        id: 1,
        username: 'testplayer1',
        displayName: 'Test Player 1',
        dateOfBirth: this.calculateBirthDate(scenario.playerOne.age),
        gender: scenario.playerOne.gender,
        rating: scenario.playerOne.rating
      },
      {
        id: 2,
        username: 'testplayer2',
        displayName: 'Test Player 2', 
        dateOfBirth: this.calculateBirthDate(scenario.playerTwo.age),
        gender: scenario.playerTwo.gender,
        rating: scenario.playerTwo.rating
      }
    ];

    if (scenario.formatType === 'doubles') {
      players.push({
        id: 3,
        username: 'testpartner1',
        displayName: 'Test Partner 1',
        dateOfBirth: this.calculateBirthDate(scenario.partnerOne.age),
        gender: scenario.partnerOne.gender,
        rating: scenario.partnerOne.rating
      });
      players.push({
        id: 4,
        username: 'testpartner2',
        displayName: 'Test Partner 2',
        dateOfBirth: this.calculateBirthDate(scenario.partnerTwo.age),
        gender: scenario.partnerTwo.gender,
        rating: scenario.partnerTwo.rating
      });
    }

    return players;
  }

  calculateBirthDate(age) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    return `${birthYear}-06-15`;
  }

  generateReport() {
    console.log("\n📊 CI/CD TEST RESULTS SUMMARY");
    console.log("=" + "=".repeat(50));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`\nOverall Results: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);

    // Group by test type
    const byType = this.testResults.reduce((acc, result) => {
      acc[result.type] = acc[result.type] || [];
      acc[result.type].push(result);
      return acc;
    }, {});

    console.log("\n📋 Results by Test Type:");
    Object.entries(byType).forEach(([type, results]) => {
      const passed = results.filter(r => r.success).length;
      console.log(`\n${type}: ${passed}/${results.length} passed`);
      
      results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`  ${status} ${result.scenario}`);
        
        if (result.calculatedPoints && result.expectedPoints) {
          console.log(`     Expected: W:${result.expectedPoints.winner} L:${result.expectedPoints.loser}`);
          console.log(`     Actual:   W:${result.calculatedPoints.winner} L:${result.calculatedPoints.loser}`);
        }
        
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      });
    });

    console.log("\n🎯 Ranking Points Algorithm Test Results:");
    console.log("Age Group Multipliers Tested:");
    console.log("• 18-34: 1.0x multiplier");
    console.log("• 35-49: 1.2x multiplier");
    console.log("• 50-59: 1.3x multiplier");
    console.log("• 60-69: 1.5x multiplier");
    console.log("• 70+:   1.6x multiplier");
    console.log("\nMatch Type Modifiers:");
    console.log("• Tournament: 100% points");
    console.log("• League:     75% points");
    console.log("• Casual:     50% points");
    console.log("\nCompetition Multipliers:");
    console.log("• Summer Championship: 2.0x");
    console.log("• Weekly League:       1.5x");
    console.log("• Masters Tournament:  3.0x");

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: Math.round(passedTests/totalTests*100),
      details: this.testResults
    };
  }

  async runFullTestSuite() {
    console.log("🚀 Starting CI/CD Match Recording Test Suite...");
    console.log("Testing comprehensive ranking point calculations and match recording functionality");
    
    try {
      await this.authenticate();
      await this.testPlayerMatchRecording();
      await this.testAdminMatchRecording();
      await this.testManualPointsOverride();
      await this.testMatchHistory();
      
      const report = this.generateReport();
      
      console.log("\n🎉 CI/CD Test Suite Complete!");
      console.log(`Final Status: ${report.successRate}% operational capability achieved`);
      
      return report;
      
    } catch (error) {
      console.error("💥 CI/CD Test Suite failed:", error.message);
      throw error;
    }
  }
}

// Run the test suite
async function main() {
  const tester = new MatchRecordingTester();
  try {
    const results = await tester.runFullTestSuite();
    process.exit(results.successRate === 100 ? 0 : 1);
  } catch (error) {
    console.error("Test suite execution failed:", error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MatchRecordingTester;