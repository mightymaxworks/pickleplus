// Enhanced Profile Types

export interface UserPrivacySetting {
  fieldName: string;
  visibilityLevel: 'public' | 'connections' | 'private';
}

export interface PhysicalAttributes {
  height?: number;
  reach?: number;
}

export interface EquipmentPreferences {
  paddleBrand?: string;
  paddleModel?: string;
  backupPaddleBrand?: string;
  backupPaddleModel?: string;
  otherEquipment?: string;
  preferredPosition?: string;
}

export interface PerformanceMetrics {
  forehandStrength?: number;
  backhandStrength?: number;
  servePower?: number;
  dinkAccuracy?: number;
  thirdShotConsistency?: number;
  courtCoverage?: number;
}

export interface MatchPreferences {
  preferredSurface?: string;
  indoorOutdoorPreference?: string;
  competitiveIntensity?: number;
  mentorshipInterest?: boolean;
  preferredFormat?: string;
}

export interface LocationData {
  homeCourtLocations?: string;
  travelRadiusKm?: number;
  location?: string;
}

export interface ContactPreference {
  allowMatchRequests: boolean;
  allowDirectMessages: boolean;
  allowConnectionRequests: boolean;
  allowMentoring: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly' | 'none';
}

export interface ProfileCompletionData {
  completionPercentage: number;
  completedCategories: Record<string, number>;
  completedFields: string[];
  incompleteFields: string[];
  tierLevel: number;
  xpAwarded: number;
}

// Form values for profile update
export interface ProfileUpdateFormValues {
  displayName?: string;
  bio?: string;
  location?: string;
  yearOfBirth?: number;
  playingSince?: string;
  skillLevel?: string;
  
  // Physical attributes
  height?: number;
  reach?: number;
  
  // Equipment preferences
  preferredPosition?: string;
  paddleBrand?: string;
  paddleModel?: string;
  backupPaddleBrand?: string;
  backupPaddleModel?: string;
  otherEquipment?: string;
  
  // Playing style and preferences
  playingStyle?: string;
  shotStrengths?: string;
  preferredFormat?: string;
  dominantHand?: string;
  regularSchedule?: string;
  playerGoals?: string;
  lookingForPartners?: boolean;
  
  // Performance self-assessment
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
  
  // Privacy settings
  privacyProfile?: string;
}

// Tab configuration for profile editing
export interface ProfileTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: string[];
}

// Field metadata for profile editing
export interface ProfileField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'slider' | 'date';
  category: string;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  dependent?: {
    field: string;
    value: any;
  };
  required?: boolean;
}