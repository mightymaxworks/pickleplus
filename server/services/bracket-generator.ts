/**
 * PKL-278651-TOURN-0001-BRCKT
 * Tournament Bracket Generator Service
 * 
 * This service provides algorithms for generating tournament brackets.
 */

import { db } from "../db";
import { eq, and, or, inArray as drizzleInArray, SQL, PgColumn } from "drizzle-orm";
import { 
  tournamentTeams, 
  tournamentBrackets, 
  tournamentRounds, 
  tournamentBracketMatches,
  type TournamentTeam,
  type InsertTournamentBracket,
  type InsertTournamentRound,
  type InsertTournamentBracketMatch
} from "../../shared/schema/tournament-brackets";
import { tournaments } from "../../shared/schema";

/**
 * Supported bracket types
 */
export type BracketType = 'single_elimination' | 'double_elimination' | 'round_robin';

/**
 * Power of 2 bracket sizes (2, 4, 8, 16, 32, 64, 128)
 */
const VALID_BRACKET_SIZES = [2, 4, 8, 16, 32, 64, 128];

/**
 * Interface representing a Match in the bracket
 */
interface BracketMatch {
  matchNumber: number;
  roundNumber: number;
  team1Id?: number | null;
  team2Id?: number | null;
  nextMatchId?: number | null;
  consolationMatchId?: number | null; // For double elimination
}

/**
 * Creates a complete single elimination bracket for a tournament
 * 
 * @param tournamentId - ID of the tournament
 * @param teamsArray - Array of team IDs to include in the bracket
 * @param seedingOrder - Optional array specifying the seeding order (1-indexed)
 * @returns ID of the created bracket
 */
export async function createSingleEliminationBracket(
  tournamentId: number,
  teamsArray: TournamentTeam[],
  seedingOrder?: number[]
): Promise<number> {
  try {
    // Validate tournament exists
    const tournamentExists = await db.query.tournaments.findFirst({
      where: eq(tournaments.id, tournamentId)
    });
    
    if (!tournamentExists) {
      throw new Error(`Tournament with ID ${tournamentId} not found`);
    }
    
    // Get number of teams and validate
    const teamsCount = teamsArray.length;
    
    if (teamsCount < 2) {
      throw new Error("At least 2 teams are required to create a bracket");
    }
    
    // Calculate the smallest valid bracket size that can fit all teams
    const bracketSize = getSmallestValidBracketSize(teamsCount);
    
    // Calculate number of rounds needed for this bracket
    const roundsCount = Math.log2(bracketSize);
    
    // Create the bracket record
    const bracketData: InsertTournamentBracket = {
      tournamentId,
      name: "Single Elimination Bracket",
      bracketType: "single_elimination",
      teamsCount: teamsCount,
      roundsCount: roundsCount,
      status: "created",
      seedingMethod: seedingOrder ? "manual" : "rating_based"
    };
    
    // Insert the bracket
    const [bracket] = await db.insert(tournamentBrackets).values(bracketData).returning();
    const bracketId = bracket.id;
    
    // Create rounds
    await createRounds(bracketId, roundsCount);
    
    // Get the rounds (including IDs)
    const rounds = await db.query.tournamentRounds.findMany({
      where: eq(tournamentRounds.bracketId, bracketId),
      orderBy: (rounds) => rounds.roundNumber
    });
    
    // Generate the bracket structure (empty matches)
    const matches = generateSingleEliminationMatches(bracketSize, rounds);
    
    // Insert all matches
    const insertedMatches = await insertMatches(matches);
    
    // Update next match references
    await updateNextMatchReferences(insertedMatches);
    
    // Place teams in the bracket according to seeding
    await seedTeamsInBracket(bracketId, teamsArray, bracketSize, seedingOrder);
    
    return bracketId;
  } catch (error) {
    console.error("Error creating single elimination bracket:", error);
    throw error;
  }
}

/**
 * Creates the rounds for a bracket
 */
async function createRounds(
  bracketId: number, 
  roundsCount: number
): Promise<void> {
  const roundsData: InsertTournamentRound[] = [];
  
  for (let i = 1; i <= roundsCount; i++) {
    // Calculate matches in this round
    const matchesInRound = Math.pow(2, roundsCount - i);
    
    // Generate round name
    let roundName = `Round ${i}`;
    if (i === roundsCount) {
      roundName = "Final";
    } else if (i === roundsCount - 1) {
      roundName = "Semi-Finals";
    } else if (i === roundsCount - 2) {
      roundName = "Quarter-Finals";
    }
    
    roundsData.push({
      bracketId,
      roundNumber: i,
      roundName,
      matchesCount: matchesInRound,
      status: "pending"
    });
  }
  
  // Insert all rounds
  await db.insert(tournamentRounds).values(roundsData);
}

/**
 * Generates the structure for a single elimination tournament
 */
function generateSingleEliminationMatches(
  bracketSize: number,
  rounds: typeof tournamentRounds.$inferSelect[]
): InsertTournamentBracketMatch[] {
  const bracketId = rounds[0].bracketId;
  const matches: InsertTournamentBracketMatch[] = [];
  
  let currentMatchNumber = 1;
  
  // For each round
  for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
    const round = rounds[roundIndex];
    const matchesInRound = Math.pow(2, rounds.length - roundIndex - 1);
    
    // For each match in this round
    for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
      matches.push({
        bracketId,
        roundId: round.id,
        matchNumber: currentMatchNumber++,
        team1Id: null, // Will be filled during seeding
        team2Id: null, // Will be filled during seeding
        status: "scheduled"
      });
    }
  }
  
  return matches;
}

/**
 * Insert all matches into the database
 */
async function insertMatches(
  matches: InsertTournamentBracketMatch[]
): Promise<typeof tournamentBracketMatches.$inferSelect[]> {
  return await db.insert(tournamentBracketMatches).values(matches).returning();
}

/**
 * Update the next match references for each match
 */
async function updateNextMatchReferences(
  matches: typeof tournamentBracketMatches.$inferSelect[]
): Promise<void> {
  const totalMatches = matches.length;
  const updates = [];
  
  // For all matches except the final, set the next match ID
  for (let i = 0; i < totalMatches - 1; i++) {
    const currentMatch = matches[i];
    
    // Calculate which match this one feeds into
    // For the first round with N matches, matches 1 and 2 feed into match N+1,
    // matches 3 and 4 feed into match N+2, etc.
    const nextMatchIndex = Math.floor(i / 2) + Math.floor(totalMatches / 2);
    
    if (nextMatchIndex < totalMatches) {
      const nextMatchId = matches[nextMatchIndex].id;
      
      updates.push(
        db.update(tournamentBracketMatches)
          .set({ nextMatchId })
          .where(eq(tournamentBracketMatches.id, currentMatch.id))
      );
    }
  }
  
  // Execute all updates
  await Promise.all(updates);
}

/**
 * Place teams in the bracket according to seeding
 */
async function seedTeamsInBracket(
  bracketId: number,
  teams: TournamentTeam[],
  bracketSize: number,
  seedingOrder?: number[]
): Promise<void> {
  // Get the first-round matches
  const firstRoundMatches = await db.query.tournamentBracketMatches.findMany({
    where: and(
      eq(tournamentBracketMatches.bracketId, bracketId),
      eq(tournamentBracketMatches.matchNumber, 1)
    ),
    orderBy: (matches) => matches.matchNumber
  });
  
  const totalFirstRoundMatches = bracketSize / 2;
  
  // If we have fewer teams than the bracket size, we'll need to give some teams a bye
  const updates = [];
  
  // Apply standard seeding pattern
  const seedPositions = generateSeedPositions(bracketSize);
  
  // Sort teams according to seedingOrder if provided, otherwise use team's seedNumber
  let sortedTeams = [...teams];
  
  if (seedingOrder) {
    // Use provided custom seeding order
    const teamMap = new Map(teams.map(team => [team.id, team]));
    sortedTeams = seedingOrder
      .map(teamId => teamMap.get(teamId))
      .filter(team => team !== undefined) as TournamentTeam[];
  } else {
    // Sort by team's seedNumber (if available)
    sortedTeams.sort((a, b) => {
      const seedA = a.seedNumber || Number.MAX_SAFE_INTEGER;
      const seedB = b.seedNumber || Number.MAX_SAFE_INTEGER;
      return seedA - seedB;
    });
  }
  
  // Calculate which teams go into which spots
  for (let i = 0; i < totalFirstRoundMatches; i++) {
    const match = firstRoundMatches[i];
    if (!match) continue;
    
    // For each match (i), we need to get the seeded position
    const team1Index = seedPositions[i * 2];
    const team2Index = seedPositions[i * 2 + 1];
    
    // Get the teams for these positions (if they exist)
    const team1 = team1Index < sortedTeams.length ? sortedTeams[team1Index] : null;
    const team2 = team2Index < sortedTeams.length ? sortedTeams[team2Index] : null;
    
    // Update the match with team IDs
    updates.push(
      db.update(tournamentBracketMatches)
        .set({ 
          team1Id: team1?.id || null,
          team2Id: team2?.id || null
        })
        .where(eq(tournamentBracketMatches.id, match.id))
    );
  }
  
  // Execute all updates
  await Promise.all(updates);
}

/**
 * Generate standard tournament seeding positions for a bracket of given size
 * For example, for a bracket of size 8, returns [0, 7, 3, 4, 2, 5, 1, 6]
 */
function generateSeedPositions(bracketSize: number): number[] {
  const positions: number[] = [];
  
  // Recursive function to generate seeding
  function generatePositionsRecursive(start: number, end: number) {
    if (start === end) {
      positions.push(start);
      return;
    }
    
    const mid = Math.floor((start + end) / 2);
    positions.push(start);
    positions.push(end);
    
    if (mid > start) {
      generatePositionsRecursive(start + 1, mid);
      generatePositionsRecursive(mid + 1, end - 1);
    }
  }
  
  generatePositionsRecursive(0, bracketSize - 1);
  return positions;
}

/**
 * Get the smallest valid bracket size that can accommodate the given number of teams
 */
function getSmallestValidBracketSize(numTeams: number): number {
  for (const size of VALID_BRACKET_SIZES) {
    if (size >= numTeams) {
      return size;
    }
  }
  
  // Default to the largest supported size
  return VALID_BRACKET_SIZES[VALID_BRACKET_SIZES.length - 1];
}

/**
 * Record a match result and advance the winner to the next match
 */
export async function recordMatchResult(
  matchId: number,
  winnerId: number,
  loserId: number,
  score: string,
  scoreDetails?: Record<string, any>
): Promise<void> {
  try {
    // Validate the match exists
    const match = await db.query.tournamentBracketMatches.findFirst({
      where: eq(tournamentBracketMatches.id, matchId)
    });
    
    if (!match) {
      throw new Error(`Match with ID ${matchId} not found`);
    }
    
    // Validate the teams
    if (match.team1Id !== winnerId && match.team2Id !== winnerId) {
      throw new Error(`Team ${winnerId} is not playing in this match`);
    }
    
    if (match.team1Id !== loserId && match.team2Id !== loserId) {
      throw new Error(`Team ${loserId} is not playing in this match`);
    }
    
    // Update the match result
    await db.update(tournamentBracketMatches)
      .set({
        winnerId,
        loserId,
        score,
        scoreDetails: scoreDetails || {},
        status: "completed",
        updatedAt: new Date()
      })
      .where(eq(tournamentBracketMatches.id, matchId));
    
    // If there's a next match, advance the winner
    if (match.nextMatchId) {
      const nextMatch = await db.query.tournamentBracketMatches.findFirst({
        where: eq(tournamentBracketMatches.id, match.nextMatchId)
      });
      
      if (!nextMatch) {
        throw new Error(`Next match with ID ${match.nextMatchId} not found`);
      }
      
      // Determine if this winner goes into team1 or team2 slot
      // Even-numbered matches (0, 2, 4...) go to team1, odd to team2
      const isEvenMatch = match.matchNumber % 2 === 0;
      
      if (isEvenMatch) {
        await db.update(tournamentBracketMatches)
          .set({ team1Id: winnerId })
          .where(eq(tournamentBracketMatches.id, match.nextMatchId));
      } else {
        await db.update(tournamentBracketMatches)
          .set({ team2Id: winnerId })
          .where(eq(tournamentBracketMatches.id, match.nextMatchId));
      }
    } else {
      // This was the final match, mark the bracket as completed
      const bracket = await db.query.tournamentBrackets.findFirst({
        where: eq(tournamentBrackets.id, match.bracketId)
      });
      
      if (bracket) {
        await db.update(tournamentBrackets)
          .set({ 
            status: "completed",
            endDate: new Date(),
            updatedAt: new Date()
          })
          .where(eq(tournamentBrackets.id, match.bracketId));
      }
    }
  } catch (error) {
    console.error("Error recording match result:", error);
    throw error;
  }
}

/**
 * Get a complete bracket structure with all matches and teams
 */
export async function getBracketWithMatches(bracketId: number) {
  try {
    // Get the bracket
    const bracket = await db.query.tournamentBrackets.findFirst({
      where: eq(tournamentBrackets.id, bracketId)
    });
    
    if (!bracket) {
      throw new Error(`Bracket with ID ${bracketId} not found`);
    }
    
    // Get all rounds
    const rounds = await db.query.tournamentRounds.findMany({
      where: eq(tournamentRounds.bracketId, bracketId),
      orderBy: (rounds) => rounds.roundNumber
    });
    
    // Get all matches
    const matches = await db.query.tournamentBracketMatches.findMany({
      where: eq(tournamentBracketMatches.bracketId, bracketId),
      orderBy: (matches) => matches.matchNumber
    });
    
    // Get all teams involved in this bracket
    const teamIds = new Set<number>();
    matches.forEach(match => {
      if (match.team1Id) teamIds.add(match.team1Id);
      if (match.team2Id) teamIds.add(match.team2Id);
    });
    
    // Fetch all teams
    const teams = await db.query.tournamentTeams.findMany({
      where: inArray(tournamentTeams.id, Array.from(teamIds))
    });
    
    // Build the response
    return {
      bracket,
      rounds,
      matches,
      teams
    };
  } catch (error) {
    console.error("Error getting bracket with matches:", error);
    throw error;
  }
}

// Use drizzleInArray directly
function inArray(column: Column, values: any[]) {
  return drizzleInArray(column, values);
}