// Enhanced User type for the Pickle+ platform
export interface EnhancedUser {
  // Base user properties
  id: number;
  username: string;
  email: string | null;
  password: string;
  displayName: string | null;
  location: string | null;
  bio: string | null;
  yearOfBirth: number | null;
  passportId: string | null;
  
  // System fields
  level?: number;
  xp?: number;
  totalMatches?: number;
  matchesWon?: number;
  isAdmin?: boolean;
  createdAt?: Date;
  lastUpdated?: Date;
  avatarInitials?: string;
  avatarUrl?: string | null;
  
  // Profile completion
  profileCompletionPct?: number;
  
  // Physical attributes
  height?: number;
  reach?: number;
  
  // Equipment preferences
  paddleBrand?: string;
  paddleModel?: string;
  backupPaddleBrand?: string;
  backupPaddleModel?: string;
  apparelBrand?: string;
  shoesBrand?: string;
  otherEquipment?: string;
  preferredPosition?: string;
  
  // Performance metrics
  forehandStrength?: number;
  backhandStrength?: number;
  servePower?: number;
  dinkAccuracy?: number;
  thirdShotConsistency?: number;
  courtCoverage?: number;
  
  // Match preferences
  preferredSurface?: string;
  indoorOutdoorPreference?: string;
  competitiveIntensity?: number;
  mentorshipInterest?: boolean;
  
  // Location data
  homeCourtLocations?: string;
  travelRadiusKm?: number;
  
  // Playing style preferences
  playingStyle?: string;
  shotStrengths?: string;
  preferredFormat?: string;
  dominantHand?: string;
  regularSchedule?: string;
  playingSince?: string;
  skillLevel?: string;
  
  // Additional fields
  playerGoals?: string;
  lookingForPartners?: boolean;
  privacyProfile?: string;
  
  // Tournament and achievement data (optional)
  totalTournaments?: number;
  tournamentCount?: number;
  achievements?: any[];
  
  // Rating and ranking
  rankingPoints?: number;
  tier?: string;
  isFoundingMember?: boolean;
  xpMultiplier?: number;
  lastMatchDate?: Date | null;
}