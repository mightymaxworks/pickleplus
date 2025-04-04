export interface User {
  id: number;
  username: string;
  displayName: string;
  location?: string;
  playingSince?: string;
  skillLevel?: string;
  level: number;
  xp: number;
  rankingPoints?: number;
  avatarInitials: string;
  totalMatches: number;
  matchesWon: number;
  totalTournaments: number;
}

export interface Tournament {
  id: number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  location: string;
  description?: string;
  imageUrl?: string;
}

export interface TournamentRegistration {
  id: number;
  userId: number;
  tournamentId: number;
  division?: string;
  status: string;
  checkedIn: boolean;
  placement?: string;
  createdAt: string | Date;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  xpReward: number;
  imageUrl?: string;
  category: string;
  requirement: number;
}

export interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  unlockedAt: string | Date;
}

export interface Activity {
  id: number;
  userId: number;
  type: string;
  description: string;
  xpEarned: number;
  createdAt: string | Date;
  metadata?: any;
}

export interface RedemptionCode {
  id: number;
  code: string;
  xpReward: number;
  description?: string;
  isActive: boolean;
  expiresAt?: string | Date;
}

export interface UserTournament {
  tournament: Tournament;
  registration: TournamentRegistration;
}

export interface UserAchievementWithDetails {
  achievement: Achievement;
  userAchievement: UserAchievement;
}

export interface AuthUser {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

export interface RegisterFormData {
  username: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  location?: string;
  playingSince?: string;
  skillLevel?: string;
  avatarInitials: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RedeemCodeFormData {
  code: string;
}

export interface QRScanResult {
  type: 'tournament-check-in' | 'player-connect' | 'unknown';
  data: string;
  tournamentId?: number;
  playerId?: number;
}
