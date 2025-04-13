// Frontend type definitions for React components

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  level: number;
  xp: number;
  rating: number;
  skillLevel: string;
  totalMatches: number;
  wins: number;
  losses: number;
  profileImage?: string;
  playerId: string;
}

export interface Tournament {
  id: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  skillLevel: string;
  status: "open" | "ongoing" | "completed";
  imageUrl?: string;
}

export interface TournamentParticipant {
  id: number;
  tournamentId: number;
  userId: number;
  registrationDate: string;
  status: "registered" | "checked-in" | "completed";
}

export interface Match {
  id: number;
  matchType: "singles" | "doubles";
  matchDate: string;
  tournamentId?: number;
  players: MatchPlayer[];
  scores: Score[];
  winnerIds: number[];
  loserIds: number[];
  xpEarned: number;
  ratingChange: Record<string, number>;
}

export interface MatchPlayer {
  id: number;
  displayName: string;
  team: 1 | 2;
}

export interface Score {
  team1: number;
  team2: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  iconClass: string;
  requiredValue: number;
  category: string;
  xpReward: number;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  progress: number;
  completed: boolean;
  completedDate: string | null;
}

export interface StatItem {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  iconBgClass: string;
}

export interface LeaderboardItem {
  rank: number;
  user: User;
}

export interface XpCode {
  id: number;
  code: string;
  xpValue: number;
  description: string;
  expiryDate?: string;
  isUsed: boolean;
  createdBy: number;
}
