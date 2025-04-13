// Enhanced User type for the Pickle+ platform
export interface EnhancedUser {
  // Base user properties
  id: number;
  username: string;
  email: string | null;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
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
  
  // Profile customization
  avatarInitials?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bannerPattern?: string | null;
  
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
  preferredMatchDuration?: string;
  fitnessLevel?: string;
  mobilityLimitations?: string;
  
  // Location data
  homeCourtLocations?: string;
  travelRadiusKm?: number;
  
  // External Rating Systems - PKL-278651-EXTR-0001
  duprRating?: string;
  duprProfileUrl?: string;
  utprRating?: string;
  utprProfileUrl?: string;
  wprRating?: string;
  wprProfileUrl?: string;
  externalRatingsVerified?: boolean;
  lastExternalRatingUpdate?: Date;
  
  // Playing style preferences
  playingStyle?: string;
  shotStrengths?: string;
  
  // Communication preferences
  privateMessagePreference?: string;
  
  // Social and partner settings
  lookingForPartners?: boolean;
  preferredFormat?: string;
  dominantHand?: string;
  regularSchedule?: string;
  playingSince?: string;
  skillLevel?: string;
  privacyProfile?: string;
  
  // Social connections and community
  coach?: string;
  clubs?: string;
  leagues?: string;
  
  // Goals and development
  playerGoals?: string;
  
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