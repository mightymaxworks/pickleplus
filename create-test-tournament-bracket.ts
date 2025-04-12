/**
 * PKL-278651-TOURN-0003.1-API-TEST-DATA
 * Create Test Tournament and Bracket
 * 
 * This script creates a test tournament and bracket for API testing.
 * Run with: npx tsx create-test-tournament-bracket.ts
 */

import { db } from "./server/db";
import { tournaments } from "./shared/schema";
import { 
  tournamentBrackets, 
  tournamentRounds, 
  tournamentBracketMatches, 
  tournamentTeams
} from "./shared/schema/tournament-brackets";

/**
 * Main function to create test data
 */
async function createTestTournamentData() {
  console.log("=== PKL-278651-TOURN-0003.1-API-TEST-DATA ===");
  console.log("Creating test tournament and bracket data\n");

  try {
    // Step 1: Create a test tournament
    console.log("Step 1: Creating test tournament...");
    const tournamentData = {
      name: "API Test Tournament",
      description: "Tournament created for testing the match result API",
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      registrationStartDate: new Date(),
      registrationEndDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      location: "Test Location",
      format: "singles",
      level: "intermediate",
      status: "registration_open",
    };
    
    const [tournament] = await db.insert(tournaments).values(tournamentData).returning();
    console.log(`Tournament created with ID ${tournament.id}`);
    
    // Step 2: Create test teams
    console.log("\nStep 2: Creating test teams...");
    
    // For test teams we'll use the same user IDs for each team (1 and 2)
    // In a real tournament, these would be actual user IDs
    const userId1 = 1; // Assuming user ID 1 exists in the database
    const userId2 = 2; // Assuming user ID 2 exists in the database
    
    const teamData = [
      { 
        tournamentId: tournament.id,
        playerOneId: userId1, 
        playerTwoId: userId2,
        teamName: "Test Team Alpha",
        status: "active"
      },
      { 
        tournamentId: tournament.id,
        playerOneId: userId1, 
        playerTwoId: userId2,
        teamName: "Test Team Beta",
        status: "active"
      },
      { 
        tournamentId: tournament.id,
        playerOneId: userId1, 
        playerTwoId: userId2,
        teamName: "Test Team Gamma",
        status: "active"
      },
      { 
        tournamentId: tournament.id,
        playerOneId: userId1, 
        playerTwoId: userId2,
        teamName: "Test Team Delta",
        status: "active"
      },
      { 
        tournamentId: tournament.id,
        playerOneId: userId1, 
        playerTwoId: userId2,
        teamName: "Test Team Epsilon",
        status: "active"
      },
      { 
        tournamentId: tournament.id,
        playerOneId: userId1, 
        playerTwoId: userId2,
        teamName: "Test Team Zeta",
        status: "active"
      },
      { 
        tournamentId: tournament.id,
        playerOneId: userId1, 
        playerTwoId: userId2,
        teamName: "Test Team Eta",
        status: "active"
      },
      { 
        tournamentId: tournament.id,
        playerOneId: userId1, 
        playerTwoId: userId2,
        teamName: "Test Team Theta",
        status: "active"
      }
    ];
    
    const teamsCreated = [];
    for (const team of teamData) {
      const [createdTeam] = await db.insert(tournamentTeams).values(team).returning();
      teamsCreated.push(createdTeam);
      console.log(`Team created: ${createdTeam.teamName} (ID: ${createdTeam.id})`);
    }
    
    // Step 3: Create a test bracket
    console.log("\nStep 3: Creating test bracket...");
    const bracketData = {
      tournamentId: tournament.id,
      name: "API Test Bracket",
      bracketType: "single_elimination",
      status: "active",
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      teamsCount: teamsCreated.length,
      roundsCount: Math.ceil(Math.log2(teamsCreated.length)),
    };
    
    const [bracket] = await db.insert(tournamentBrackets).values(bracketData).returning();
    console.log(`Bracket created with ID ${bracket.id}`);
    
    // Step 4: Create rounds for the bracket
    console.log("\nStep 4: Creating rounds for the bracket...");
    const roundsCount = Math.ceil(Math.log2(teamsCreated.length));
    const rounds = [];
    
    for (let i = 1; i <= roundsCount; i++) {
      const roundName = i === roundsCount ? "Final" : 
                       i === roundsCount - 1 ? "Semi-Final" : 
                       i === roundsCount - 2 ? "Quarter-Final" : 
                       `Round ${i}`;
      
      const roundData = {
        bracketId: bracket.id,
        roundNumber: i,
        name: roundName,
        status: i === 1 ? "active" : "pending",
      };
      
      const [round] = await db.insert(tournamentRounds).values(roundData).returning();
      rounds.push(round);
      console.log(`Round created: ${round.name} (ID: ${round.id})`);
    }
    
    // Step 5: Create matches for the first round
    console.log("\nStep 5: Creating matches for the first round...");
    const firstRound = rounds[0];
    const matchesInFirstRound = teamsCreated.length / 2;
    
    for (let i = 0; i < matchesInFirstRound; i++) {
      const matchData = {
        bracketId: bracket.id,
        roundId: firstRound.id,
        matchNumber: i + 1,
        team1Id: teamsCreated[i * 2].id,
        team2Id: teamsCreated[i * 2 + 1].id,
        status: "pending",
      };
      
      const [match] = await db.insert(tournamentBracketMatches).values(matchData).returning();
      console.log(`Match created: ${teamsCreated[i * 2].teamName} vs ${teamsCreated[i * 2 + 1].teamName} (ID: ${match.id})`);
    }
    
    // Create empty matches for subsequent rounds
    console.log("\nStep 6: Creating placeholder matches for subsequent rounds...");
    for (let i = 1; i < rounds.length; i++) {
      const round = rounds[i];
      const matchesInRound = Math.pow(2, rounds.length - i - 1);
      
      for (let j = 0; j < matchesInRound; j++) {
        const matchData = {
          bracketId: bracket.id,
          roundId: round.id,
          matchNumber: j + 1,
          status: "pending"
        };
        
        const [match] = await db.insert(tournamentBracketMatches).values(matchData).returning();
        console.log(`Placeholder match created for ${round.name} (ID: ${match.id})`);
      }
    }
    
    console.log("\nTest data creation completed successfully! ✅");
    console.log(`\nUse this Tournament ID for testing: ${tournament.id}`);
    console.log(`Use this Bracket ID for testing: ${bracket.id}`);
    console.log(`\nThe first round matches are ready for recording results.`);
    
  } catch (error) {
    console.error("Error creating test data:", error);
    console.log("\nTest data creation failed. ❌");
  }
}

// Run the data creation script
createTestTournamentData().catch(console.error);