import { db } from "./server/db";
import { matches, players } from "./shared/schema";
import { nanoid } from "nanoid";

async function createTestMatches() {
  try {
    // Create test matches for validation testing
    for (let i = 0; i < 3; i++) {
      const matchDate = new Date();
      
      // Create match with pending validation status
      const [match] = await db.insert(matches).values({
        matchDate: matchDate.toISOString(),
        playerOneId: 1, // Current user ID
        playerTwoId: 2 + i, // Different opponent IDs
        playerOnePartnerId: null,
        playerTwoPartnerId: null,
        winnerId: 1, // Current user wins
        scorePlayerOne: "11",
        scorePlayerTwo: (3 + i).toString(),
        gameScores: JSON.stringify([{ playerOneScore: 11, playerTwoScore: 3 + i }]),
        formatType: "singles",
        scoringSystem: "traditional",
        pointsToWin: 11,
        division: "35+",
        matchType: "casual",
        eventTier: "local",
        location: `Test Location ${i+1}`,
        tournamentId: null,
        isRated: true,
        isVerified: false,
        validationStatus: "pending",
        validationCompletedAt: null,
        validationRequiredBy: new Date(matchDate.getTime() + 86400000).toISOString(), // 24 hours later
        rankingPointMultiplier: 100,
        dailyMatchCount: 1,
        xpAwarded: 0,
        pointsAwarded: 0,
        notes: `Test match ${i+1} for validation testing`
      }).returning();
      
      console.log(`Created match ${match.id} with pending validation status`);
      
      // Add players to the match
      await db.insert(players).values({
        matchId: match.id,
        userId: 1,
        playerRole: "player_one",
        score: 11,
        isWinner: true,
        performanceRating: null,
        xpAwarded: 0,
        pointsAwarded: 0
      });
      
      await db.insert(players).values({
        matchId: match.id,
        userId: 2 + i,
        playerRole: "player_two",
        score: 3 + i,
        isWinner: false,
        performanceRating: null,
        xpAwarded: 0,
        pointsAwarded: 0
      });
      
      console.log(`Added players to match ${match.id}`);
    }
    
    console.log("Created test matches successfully!");
  } catch (error) {
    console.error("Error creating test matches:", error);
  }
}

createTestMatches();
