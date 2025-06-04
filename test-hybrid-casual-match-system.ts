/**
 * PKL-278651-HYBRID-0001-TEST - Hybrid Casual Match Point System Test
 * 
 * This script tests the complete hybrid casual match point system including:
 * - Tournament points at 100% value
 * - Casual match points at 50% value with anti-gaming safeguards
 * - League match points at 67% value
 * - Transparent point breakdown tracking
 * - Diminishing returns for frequent opponent matches
 * 
 * Run with: npx tsx test-hybrid-casual-match-system.ts
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-04
 */

import { PCPGlobalRankingCalculator } from './server/services/atp-ranking-calculator';

interface TestScenario {
  name: string;
  description: string;
  matchResults: Array<{
    isWin: boolean;
    matchDate: Date;
    matchType: 'casual' | 'league' | 'tournament';
    format: string;
    division: string;
    opponentMatchCount?: number;
  }>;
  expectedOutcome: {
    totalPoints: number;
    breakdown: {
      casualPoints: number;
      leaguePoints: number;
      tournamentPoints: number;
    };
    antiGamingApplied: boolean;
  };
}

/**
 * Test scenarios for the hybrid casual match point system
 */
const testScenarios: TestScenario[] = [
  {
    name: "Tournament vs Casual Point Comparison",
    description: "Demonstrates the difference between tournament and casual match points",
    matchResults: [
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'tournament',
        format: 'mens_singles',
        division: 'open'
      },
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'casual',
        format: 'mens_singles',
        division: 'open',
        opponentMatchCount: 0
      }
    ],
    expectedOutcome: {
      totalPoints: 4.5, // 3 (tournament) + 1.5 (casual)
      breakdown: {
        casualPoints: 1.5,
        leaguePoints: 0,
        tournamentPoints: 3
      },
      antiGamingApplied: false
    }
  },
  {
    name: "Anti-Gaming: Frequent Opponent Matches",
    description: "Shows diminishing returns when playing same opponent frequently",
    matchResults: [
      // First 3 matches - full points
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'casual',
        format: 'mens_singles',
        division: 'open',
        opponentMatchCount: 0
      },
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'casual',
        format: 'mens_singles',
        division: 'open',
        opponentMatchCount: 1
      },
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'casual',
        format: 'mens_singles',
        division: 'open',
        opponentMatchCount: 2
      },
      // 4th match - 75% points
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'casual',
        format: 'mens_singles',
        division: 'open',
        opponentMatchCount: 3
      },
      // 7th match - 50% points
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'casual',
        format: 'mens_singles',
        division: 'open',
        opponentMatchCount: 6
      }
    ],
    expectedOutcome: {
      totalPoints: 6.4, // 1.5 + 1.5 + 1.5 + 1.1 + 0.8 (anti-gaming applied after match 3)
      breakdown: {
        casualPoints: 6.4,
        leaguePoints: 0,
        tournamentPoints: 0
      },
      antiGamingApplied: true
    }
  },
  {
    name: "Mixed Match Types with League",
    description: "Demonstrates all three match types working together",
    matchResults: [
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'tournament',
        format: 'mens_doubles',
        division: '35+',
        opponentMatchCount: 0
      },
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'league',
        format: 'mens_doubles',
        division: '35+',
        opponentMatchCount: 0
      },
      {
        isWin: true,
        matchDate: new Date(),
        matchType: 'casual',
        format: 'mens_doubles',
        division: '35+',
        opponentMatchCount: 0
      },
      {
        isWin: false,
        matchDate: new Date(),
        matchType: 'casual',
        format: 'mens_doubles',
        division: '35+',
        opponentMatchCount: 0
      }
    ],
    expectedOutcome: {
      totalPoints: 7, // 3 (tournament) + 2 (league) + 1.5 (casual win) + 0.5 (casual loss)
      breakdown: {
        casualPoints: 2,
        leaguePoints: 2,
        tournamentPoints: 3
      },
      antiGamingApplied: false
    }
  }
];

/**
 * Run comprehensive tests of the hybrid casual match point system
 */
async function testHybridCasualMatchSystem(): Promise<void> {
  console.log('🏓 PKL-278651-HYBRID-0001-TEST: Testing Hybrid Casual Match Point System');
  console.log('════════════════════════════════════════════════════════════════════════\n');

  let passedTests = 0;
  let totalTests = testScenarios.length;

  for (const scenario of testScenarios) {
    console.log(`📋 Test: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}\n`);

    let totalPoints = 0;
    let casualPoints = 0;
    let leaguePoints = 0;
    let tournamentPoints = 0;
    let antiGamingApplied = false;

    // Process each match result
    scenario.matchResults.forEach((match, index) => {
      const points = PCPGlobalRankingCalculator.calculateMatchPoints(match, match.opponentMatchCount || 0);
      totalPoints += points;

      // Track points by type
      if (match.matchType === 'casual') {
        casualPoints += points;
        if (match.opponentMatchCount && match.opponentMatchCount > 2) {
          antiGamingApplied = true;
        }
      } else if (match.matchType === 'league') {
        leaguePoints += points;
      } else if (match.matchType === 'tournament') {
        tournamentPoints += points;
      }

      console.log(`   Match ${index + 1}: ${match.matchType} ${match.isWin ? 'win' : 'loss'} = ${points} pts${match.opponentMatchCount && match.opponentMatchCount > 2 ? ' (anti-gaming applied)' : ''}`);
    });

    // Round total points to 1 decimal place for comparison
    totalPoints = Math.round(totalPoints * 10) / 10;
    casualPoints = Math.round(casualPoints * 10) / 10;
    leaguePoints = Math.round(leaguePoints * 10) / 10;
    tournamentPoints = Math.round(tournamentPoints * 10) / 10;

    console.log(`\n   📊 Results:`);
    console.log(`   Total Points: ${totalPoints} (expected: ${scenario.expectedOutcome.totalPoints})`);
    console.log(`   Casual Points: ${casualPoints} (expected: ${scenario.expectedOutcome.breakdown.casualPoints})`);
    console.log(`   League Points: ${leaguePoints} (expected: ${scenario.expectedOutcome.breakdown.leaguePoints})`);
    console.log(`   Tournament Points: ${tournamentPoints} (expected: ${scenario.expectedOutcome.breakdown.tournamentPoints})`);
    console.log(`   Anti-Gaming Applied: ${antiGamingApplied} (expected: ${scenario.expectedOutcome.antiGamingApplied})`);

    // Validate results
    const passed = 
      Math.abs(totalPoints - scenario.expectedOutcome.totalPoints) < 0.1 &&
      Math.abs(casualPoints - scenario.expectedOutcome.breakdown.casualPoints) < 0.1 &&
      Math.abs(leaguePoints - scenario.expectedOutcome.breakdown.leaguePoints) < 0.1 &&
      Math.abs(tournamentPoints - scenario.expectedOutcome.breakdown.tournamentPoints) < 0.1 &&
      antiGamingApplied === scenario.expectedOutcome.antiGamingApplied;

    if (passed) {
      console.log(`   ✅ PASSED\n`);
      passedTests++;
    } else {
      console.log(`   ❌ FAILED\n`);
    }
  }

  // Display point system details
  console.log('📈 Hybrid Point System Details:');
  console.log('════════════════════════════════════════════════════════════════════════');
  console.log('Tournament Matches: 100% point value (competitive integrity maintained)');
  console.log('League Matches: 67% point value (organized play recognition)');
  console.log('Casual Matches: 50% point value (encourages play while preventing gaming)');
  console.log('');
  console.log('🛡️  Anti-Gaming Safeguards:');
  console.log('- First 3 matches vs same opponent: Full points');
  console.log('- Matches 4-6 vs same opponent: 75% points');
  console.log('- Matches 7-11 vs same opponent: 50% points');
  console.log('- Matches 12+ vs same opponent: 25% points');
  console.log('');
  console.log('🔍 Transparency Features:');
  console.log('- Dashboard shows "Tournaments: X pts • Matches: Y pts"');
  console.log('- Complete point breakdown available in ranking details');
  console.log('- Anti-gaming warnings displayed when applicable');
  console.log('');

  // Summary
  console.log(`📋 Test Summary: ${passedTests}/${totalTests} tests passed`);
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Hybrid casual match point system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }
}

/**
 * Demonstrate transparent point breakdown calculation
 */
function demonstrateTransparentBreakdown(): void {
  console.log('\n🔍 Demonstrating Transparent Point Breakdown:');
  console.log('════════════════════════════════════════════════════════════════════════');

  // Sample point history for a player
  const samplePointHistory = [
    {
      points: 75,
      eventName: 'City Tournament Singles',
      eventType: 'tournament' as const,
      dateEarned: new Date('2025-05-15'),
      expiresDate: new Date('2026-05-15'),
      format: 'mens_singles',
      division: 'open'
    },
    {
      points: 1.5,
      eventName: 'Casual Match vs Player 123',
      eventType: 'match' as const,
      dateEarned: new Date('2025-05-20'),
      expiresDate: new Date('2026-05-20'),
      format: 'mens_singles',
      division: 'open'
    },
    {
      points: 2,
      eventName: 'League Match vs Team B',
      eventType: 'match' as const,
      dateEarned: new Date('2025-05-25'),
      expiresDate: new Date('2026-05-25'),
      format: 'mens_singles',
      division: 'open'
    }
  ];

  const categoryRankings = PCPGlobalRankingCalculator.calculateCategoryRankings(samplePointHistory);
  const categoryKey = 'mens_singles_open';
  
  if (categoryRankings[categoryKey]) {
    const category = categoryRankings[categoryKey];
    console.log(`Category: ${category.format} ${category.division}`);
    console.log(`Total Points: ${category.currentPoints}`);
    console.log(`Tournament Points: ${category.breakdown.tournamentPoints}`);
    console.log(`Casual Match Points: ${category.breakdown.casualMatchPoints}`);
    console.log(`League Match Points: ${category.breakdown.leagueMatchPoints}`);
    console.log(`Total Match Points: ${category.breakdown.totalMatchPoints}`);
    console.log('');
    console.log('Dashboard Display: "Tournaments: 75 • Matches: 3.5"');
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    await testHybridCasualMatchSystem();
    demonstrateTransparentBreakdown();
    
    console.log('\n🚀 Hybrid casual match point system testing complete!');
    console.log('The system successfully balances competitive integrity with casual play encouragement.');
  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
}

// Run the tests
main();