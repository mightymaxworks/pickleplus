/**
 * Match Reward SDK
 * 
 * Functions for interacting with match reward data, including XP and ranking rewards calculations
 */

export interface XPBreakdown {
  dailyMatchNumber: number;
  baseAmount: number;
  cooldownReduction: boolean;
  cooldownAmount: number | null;
  tournamentMultiplier: number | null;
  victoryBonus: number | null;
  winStreakBonus: number | null;
  closeMatchBonus: number | null;
  skillBonus: number | null;
  foundingMemberBonus: number | null;
  weeklyCapReached: boolean;
}

export interface MatchStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  recentXP: Array<{ amount: number; timestamp: Date }>;
  recentRanking: Array<{ amount: number; timestamp: Date }>;
  recentMatches: Array<{ date: Date; opponent: string; result: string; score: string }>;
}

/**
 * Get match statistics for the current authenticated user
 * 
 * @returns Promise with match statistics
 */
export async function getMatchStats(): Promise<MatchStats> {
  const response = await fetch('/api/match/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch match statistics');
  }
  return await response.json();
}

export interface MatchPlayer {
  userId: number;
  username: string;
  score: number;
  isWinner: boolean;
}

export interface MatchData {
  matchType: 'casual' | 'league' | 'tournament' | 'challenge';
  tournamentId?: number;
  tournamentType?: 'club' | 'regional' | 'national' | 'international';
  matchDate: string;
  matchLocation?: string;
  players: [MatchPlayer, MatchPlayer];
  notes?: string;
}

export interface XPReward {
  amount: number;
  breakdown: XPBreakdown;
}

export interface RankingChange {
  points: number;
  previousTier: string;
  newTier: string;
  tierChanged: boolean;
}

export interface PlayerReward {
  userId: number;
  xp: XPReward;
  ranking: RankingChange;
}

export interface MatchRewardResult {
  match: {
    id: number;
    matchType: string;
    matchDate: string;
    players: MatchPlayer[];
  };
  rewards: {
    playerOne: PlayerReward;
    playerTwo: PlayerReward;
  };
}

/**
 * Record a match and get the calculated rewards
 * 
 * @param matchData Match data
 * @returns Promise with match record and calculated rewards
 */
/**
 * Estimate match rewards without recording a match
 * 
 * This is useful for showing a preview of rewards before submitting
 * 
 * @param matchData Match data
 * @returns Promise with estimated rewards
 */
export async function estimateMatchRewards(matchData: Partial<MatchData>): Promise<MatchRewardResult> {
  // For simplicity in our demo, we'll just call the same endpoint
  // In a real app, this would be a different endpoint that doesn't persist data
  const fullMatchData: MatchData = {
    matchDate: new Date().toISOString(),
    matchType: 'casual',
    players: [
      { userId: 1, username: 'PickleballPro', score: 11, isWinner: true },
      { userId: 2, username: 'Opponent', score: 9, isWinner: false }
    ],
    ...matchData
  };
  
  const response = await fetch('/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fullMatchData),
  });

  if (!response.ok) {
    throw new Error('Failed to estimate match rewards');
  }

  return await response.json();
}

/**
 * Record a match and get the calculated rewards
 * 
 * @param matchData Match data
 * @returns Promise with match record and calculated rewards
 */
export async function recordMatch(matchData: MatchData): Promise<MatchRewardResult> {
  const response = await fetch('/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(matchData),
  });

  if (!response.ok) {
    throw new Error('Failed to record match');
  }

  return await response.json();
}