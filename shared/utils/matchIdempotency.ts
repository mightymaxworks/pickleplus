// CRITICAL FIX 2: Match Processing Idempotency System
// Prevents double-processing of matches in additive ranking system

import crypto from 'crypto';

export interface MatchSignature {
  tournamentId: number;
  player1: string;
  player2: string;
  player3: string | null;
  player4: string | null;
  scoreP1: string;
  scoreP2: string;
  matchDate: string;
}

export function generateMatchIdempotencyKey(match: MatchSignature): string {
  // Create deterministic hash from match details
  const matchData = `${match.tournamentId}-${match.player1}-${match.player2}-${match.player3 || ''}-${match.player4 || ''}-${match.scoreP1}-${match.scoreP2}-${match.matchDate}`;
  return crypto.createHash('sha256').update(matchData).digest('hex').substring(0, 16);
}

export function validateMatchUniqueness(idempotencyKey: string, existingKeys: Set<string>): boolean {
  return !existingKeys.has(idempotencyKey);
}

// Gender bonus algorithm specification (CRITICAL FIX 3)
export interface GenderBonusConfig {
  readonly BASE_WIN_POINTS: number;
  readonly BASE_LOSS_POINTS: number;
  readonly FEMALE_CROSS_GENDER_MULTIPLIER: number;
  readonly POINTS_THRESHOLD: number;
  readonly PRECISION_DECIMALS: number;
}

export const OFFICIAL_PCP_CONFIG: GenderBonusConfig = {
  BASE_WIN_POINTS: 3.0,
  BASE_LOSS_POINTS: 1.0, 
  FEMALE_CROSS_GENDER_MULTIPLIER: 1.15,
  POINTS_THRESHOLD: 1000.0,
  PRECISION_DECIMALS: 2
};

export function calculateMatchPoints(
  isWinner: boolean,
  playerGender: string,
  currentRankingPoints: number,
  isCrossGenderMatch: boolean,
  config: GenderBonusConfig = OFFICIAL_PCP_CONFIG
): number {
  const basePoints = isWinner ? config.BASE_WIN_POINTS : config.BASE_LOSS_POINTS;
  
  // Apply gender bonus: 1.15x for females <1000 pts in cross-gender matches
  const shouldApplyGenderBonus = 
    !isWinner && 
    playerGender === 'female' && 
    currentRankingPoints < config.POINTS_THRESHOLD && 
    isCrossGenderMatch;
  
  const finalPoints = shouldApplyGenderBonus 
    ? basePoints * config.FEMALE_CROSS_GENDER_MULTIPLIER 
    : basePoints;
  
  // Round to specified precision (2 decimal places per UDF standards)
  return Math.round(finalPoints * Math.pow(10, config.PRECISION_DECIMALS)) / Math.pow(10, config.PRECISION_DECIMALS);
}

export function isCrossGenderMatch(p1Gender: string, p2Gender: string, p3Gender?: string, p4Gender?: string): boolean {
  const genders = [p1Gender, p2Gender, p3Gender, p4Gender].filter(g => g && g.trim() !== '');
  const uniqueGenders = new Set(genders.filter(g => g === 'male' || g === 'female'));
  return uniqueGenders.size > 1;
}