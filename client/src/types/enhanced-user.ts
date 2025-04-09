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
  
  // Additional fields
  playerGoals?: string;
  lookingForPartners?: boolean;
  lastUpdated?: string;
  privacyProfile?: string;
  
  // Tournament and achievement data (optional)
  tournamentCount?: number;
  achievements?: any[];
  
  // Rating and ranking
  tier?: string;
}