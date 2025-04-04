export interface User {
  id: number;
  username: string;
  displayName: string;
  avatarInitials: string;
  passportId: string | null;
  location: string | null;
  playingSince: string | null;
  skillLevel: string | null;
  level: number;
  xp: number;
  rankingPoints: number;
  totalMatches: number;
  matchesWon: number;
  totalTournaments: number;
  lastMatchDate: Date | null;
  createdAt: Date;
}

export interface Tournament {
  id: number;
  name: string;
  description: string | null;
  location: string;
  startDate: Date;
  endDate: Date | null;
  registrationDeadline: Date | null;
  maxParticipants: number | null;
  currentParticipants: number;
  tournamentType: string;
  skillLevelRequired: string | null;
  xpReward: number;
  rankingPointsReward: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface TournamentRegistration {
  id: number;
  userId: number;
  tournamentId: number;
  registeredAt: Date;
  checkedIn: boolean;
  checkedInAt: Date | null;
  placement: number | null;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  criteria: string;
  xpReward: number;
  badgeImageUrl: string | null;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'special';
  createdAt: Date;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  unlockedAt: Date;
}

export interface Activity {
  id: number;
  userId: number;
  type: string;
  description: string;
  xpEarned: number;
  relatedId: number | null;
  relatedType: string | null;
  createdAt: Date;
}

export interface RedemptionCode {
  id: number;
  code: string;
  description: string;
  xpReward: number;
  rankingPointsReward: number | null;
  achievementId: number | null;
  expiresAt: Date | null;
  isActive: boolean;
  maxRedemptions: number | null;
  currentRedemptions: number;
  createdAt: Date;
}

export interface UserRedemption {
  id: number;
  userId: number;
  redemptionCodeId: number;
  redeemedAt: Date;
}

export interface Match {
  id: number;
  location: string | null;
  tournamentId: number | null;
  matchDate: Date;
  notes: string | null;
  playerOneId: number;
  playerTwoId: number;
  playerOnePartnerId: number | null;
  playerTwoPartnerId: number | null;
  winnerId: number;
  matchType: 'singles' | 'doubles';
  scorePlayerOne: string;
  scorePlayerTwo: string;
  xpEarned: number;
  rankingPointsEarned: number;
  gameScores: any;
  createdAt: Date;
}

export interface RankingHistory {
  id: number;
  userId: number;
  oldRanking: number;
  newRanking: number;
  reason: string;
  matchId: number | null;
  tournamentId: number | null;
  createdAt: Date;
}