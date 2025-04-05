export interface User {
  id: number;
  username: string;
  displayName: string;
  avatarInitials: string;
  passportId: string | null;
  location: string | null;
  yearOfBirth?: string | number | null;
  playingSince: string | null;
  skillLevel: string | null;
  level: number;
  xp: number;
  rankingPoints: number;
  totalMatches: number;
  matchesWon: number;
  totalTournaments: number;
  lastMatchDate: Date | null;
  isFoundingMember?: boolean;
  xpMultiplier?: number;
  isAdmin?: boolean;
  isCoach?: boolean;
  hasCoachAccess?: boolean;
  avatarUrl?: string | null;
  
  // Pickleball-specific fields
  bio?: string | null;
  preferredPosition?: string | null;
  paddleBrand?: string | null;
  paddleModel?: string | null;
  playingStyle?: string | null;
  shotStrengths?: string | null;
  preferredFormat?: string | null;
  dominantHand?: string | null;
  regularSchedule?: string | null;
  lookingForPartners?: boolean;
  partnerPreferences?: string | null;
  playerGoals?: string | null;
  
  // Social/Community fields
  coach?: string | null;
  clubs?: string | null;
  leagues?: string | null;
  socialHandles?: Record<string, string>;
  willingToMentor?: boolean;
  
  // Physical/Health information
  mobilityLimitations?: string | null;
  preferredMatchDuration?: string | null;
  fitnessLevel?: string | null;
  
  // Profile completion tracking
  profileCompletionPct?: number;
  profileLastUpdated?: Date | null;
  profileSetupStep?: number;
  
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
  description: string | null;
  xpReward: number;
  isActive: boolean | null;
  isFoundingMemberCode: boolean | null;
  isCoachAccessCode: boolean | null;
  codeType: string | null;
  maxRedemptions: number | null;
  currentRedemptions: number | null;
  expiresAt: Date | null;
  createdAt?: Date;
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

export interface AuthUser {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (userData: RegisterFormData) => Promise<User>;
  logout: () => Promise<void>;
}

export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  displayName: string;
  yearOfBirth: number | null;
  location?: string;
  playingSince?: string;
  skillLevel?: string;
  redemptionCode?: string;
  confirmPassword: string; // Required by the server validation
  
  // Optional fields that can be collected during registration
  bio?: string;
  preferredFormat?: string;
  dominantHand?: string;
  lookingForPartners?: boolean;
}

export interface ProfileUpdateFormData {
  displayName?: string;
  yearOfBirth?: number | null;
  location?: string | null;
  playingSince?: string | null;
  skillLevel?: string | null;
  
  // Pickleball-specific fields
  bio?: string | null;
  preferredPosition?: string | null;
  paddleBrand?: string | null;
  paddleModel?: string | null;
  playingStyle?: string | null;
  shotStrengths?: string | null; 
  preferredFormat?: string | null;
  dominantHand?: string | null;
  regularSchedule?: string | null;
  lookingForPartners?: boolean;
  partnerPreferences?: string | null;
  playerGoals?: string | null;
  
  // Social/Community fields
  coach?: string | null;
  clubs?: string | null;
  leagues?: string | null;
  socialHandles?: Record<string, string>;
  willingToMentor?: boolean;
  
  // Physical/Health information
  mobilityLimitations?: string | null;
  preferredMatchDuration?: string | null;
  fitnessLevel?: string | null;
}

export interface ProfileCompletionData {
  completionPercentage: number;
  completedFields: string[];
  missingFields: string[];
  xpAwarded: number;
  totalFields: number;
  xpEligibleFields: number;
  newFields: string[];
  tierLevel: number;
  tierName: string;
}

export interface RedeemCodeFormData {
  code: string;
}

export interface UserTournament extends Tournament {
  registrationId: number;
  registeredAt: Date;
  checkedIn: boolean;
  checkedInAt: Date | null;
  placement: number | null;
}

export interface UserAchievementWithDetails extends Achievement {
  unlockedAt: Date;
}

export interface Coach {
  id: number;
  userId: number;
  username: string;
  displayName?: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  level?: number;
  skillLevel?: string;
  yearsCoaching?: number;
  isPCPCertified?: boolean;
  isAdminVerified?: boolean;
  certifications?: string[];
  teachingPhilosophy?: string;
  specialties?: string[];
  specializations?: string[];
  coachingFormats?: string[];
  hourlyRate?: number;
  location?: string;
  availabilitySchedule?: Record<string, any>;
  acceptingNewStudents?: boolean;
  studentSuccesses?: any[];
}