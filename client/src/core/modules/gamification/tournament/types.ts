/**
 * PKL-278651-GAME-0002-TOURN
 * Tournament Discovery Quest Types
 * 
 * Type definitions for the tournament discovery quest module.
 */

/**
 * Tournament bracket position types
 */
export type BracketPositionType = 
  | 'single-elimination'
  | 'round-robin'
  | 'consolation'
  | 'seeding'
  | 'live-scoring'
  | 'leaderboard';

/**
 * Represents a position on the tournament bracket
 * that can be discovered by users
 */
export interface BracketPosition {
  id: number;
  code: string;
  type: BracketPositionType;
  name: string;
  description: string;
  coordinates: {
    x: number;
    y: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  isDiscovered: boolean;
  reward?: TournamentReward;
}

/**
 * Reward for discovering a tournament feature
 */
export interface TournamentReward {
  id: number;
  name: string;
  description: string;
  type: 'xp' | 'badge' | 'token';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: {
    xpAmount?: number;
    badgeId?: string;
    tokenType?: string;
  };
}

/**
 * Tournament discovery campaign
 */
export interface TournamentCampaign {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  positions: BracketPosition[];
  completionPercentage: number;
  isComplete: boolean;
  drawing?: {
    poolId: number;
    isEntered: boolean;
    drawingDate?: string;
  };
}

/**
 * User's entry in a prize drawing pool
 */
export interface DrawingEntry {
  id: number;
  poolId: number;
  poolName: string;
  entryDate: string;
  isWinner: boolean;
  hasBeenNotified: boolean;
  drawingDate?: string;
}

/**
 * Prize drawing pool information
 */
export interface PrizeDrawingPool {
  id: number;
  name: string;
  description: string;
  campaignId: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'drawing' | 'completed';
  entryCount: number;
}

/**
 * Winner information for admin drawing
 */
export interface DrawingWinner {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  entryDate: string;
  drawingDate: string;
  hasBeenNotified: boolean;
}