/**
 * PKL-278651-PROF-0008-CONT - Derived Data Context
 * 
 * This context provides derived data calculations from base user data
 * to reduce redundant calculations across components.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import React, { createContext, useContext, useMemo, useCallback, useState } from "react";
import { useAuth } from "@/lib/auth";
import { EnhancedUser } from "@/types/enhanced-user";
import { DataCalculationService, CalculatedUserMetrics } from "@/services/DataCalculationService";

// Define a utility type to safely work with the auth user object
interface AuthUser {
  id?: number;
  username?: string;
  email?: string | null;
  password?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  avatarInitials?: string;
  bio?: string | null;
  location?: string | null;
  yearOfBirth?: number | null;
  isAdmin?: boolean;
  isCoach?: boolean;
  isVerified?: boolean;
  passportId?: string | null;
  level?: number;
  xp?: number;
  totalMatches?: number;
  matchesWon?: number;
  matchesLost?: number;
  totalTournaments?: number;
  rankingPoints?: number;
  profileCompletionPct?: number;
  lastVisit?: Date | string;
  createdAt?: Date | string;
  lastUpdated?: Date | string;
  paddleBrand?: string;
  paddleModel?: string;
  achievements?: any[];
  [key: string]: any; // Allow any other properties
}

interface DerivedDataContextType {
  calculationService: DataCalculationService;
  calculatedMetrics: CalculatedUserMetrics | null;
  updateCalculations: () => void;
  isLoading: boolean;
}

const DerivedDataContext = createContext<DerivedDataContextType | null>(null);

// Default values for metrics when user data isn't available
const DEFAULT_METRICS: CalculatedUserMetrics = {
  level: 1,
  nextLevelXP: 100,
  xpProgressPercentage: 0,
  recentPerformance: 0,
  overallRating: 1000,
  completionPercentage: 0,
  pcpRanking: {
    tier: "Bronze",
    points: 0,
    nextTierThreshold: 1000,
    progressPercentage: 0,
    ratingContribution: 0
  }
};

// Helper function to create an EnhancedUser object from an AuthUser
function formatUserData(user: AuthUser | null): EnhancedUser | null {
  if (!user) return null;
  
  return {
    // Required base properties
    id: user.id || 0,
    username: user.username || '',
    password: user.password || '',
    avatarInitials: user.avatarInitials || '',
    level: user.level || 1,
    xp: user.xp || 0,
    totalMatches: user.totalMatches || 0,
    matchesWon: user.matchesWon || 0,
    totalTournaments: user.totalTournaments || 0,
    profileCompletionPct: user.profileCompletionPct || 0,
    rankingPoints: user.rankingPoints || 0,
    achievements: Array.isArray(user.achievements) ? user.achievements : [],
    
    // Optional properties with safe defaults
    email: user.email || null,
    displayName: user.displayName || null,
    avatarUrl: user.avatarUrl || null,
    bio: user.bio || null,
    location: user.location || null,
    yearOfBirth: user.yearOfBirth || null,
    
    // Boolean properties with nullish coalescing for proper default
    isAdmin: typeof user.isAdmin === 'boolean' ? user.isAdmin : false,
    isCoach: typeof user.isCoach === 'boolean' ? user.isCoach : false,
    isVerified: typeof user.isVerified === 'boolean' ? user.isVerified : false,
    
    // Other properties with proper types
    passportId: user.passportId || null,
    matchesLost: typeof user.matchesLost === 'number' ? user.matchesLost : undefined,
    createdAt: user.createdAt ? user.createdAt : undefined,
    lastUpdated: user.lastUpdated ? user.lastUpdated : undefined,
    lastVisit: user.lastVisit ? user.lastVisit : undefined,
    paddleBrand: typeof user.paddleBrand === 'string' ? user.paddleBrand : undefined,
    paddleModel: typeof user.paddleModel === 'string' ? user.paddleModel : undefined,
    
    // All other fields default to undefined
    backupPaddleBrand: undefined,
    backupPaddleModel: undefined,
    otherEquipment: undefined,
    preferredPosition: undefined,
    forehandStrength: undefined,
    backhandStrength: undefined,
    servePower: undefined,
    dinkAccuracy: undefined,
    thirdShotConsistency: undefined,
    courtCoverage: undefined,
    preferredSurface: undefined,
    indoorOutdoorPreference: undefined,
    height: undefined,
    reach: undefined,
    competitiveIntensity: undefined,
    mentorshipInterest: undefined,
    homeCourtLocations: undefined,
    travelRadiusKm: undefined,
    playerGoals: undefined,
    lookingForPartners: undefined,
    duprRating: undefined,
    utprRating: undefined,
    wprRating: undefined,
    externalRatingsVerified: undefined,
    privacyProfile: undefined
  };
}

export function DerivedDataProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  // Cast the auth user to our utility type to avoid type errors
  const user = authUser as AuthUser | null;
  
  // Force recalculation state - incremented to trigger recalculation
  const [recalculationCounter, setRecalculationCounter] = useState(0);
  
  // Create calculation service instance (stable reference)
  const calculationService = useMemo(() => new DataCalculationService(), []);
  
  // Format user data into EnhancedUser type (memoized)
  const formattedUser = useMemo(() => formatUserData(user), [user]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate metrics from user data (memoized)
  // Important: We're using useState and useEffect instead of directly calling setState in useMemo
  // to avoid the setState inside render error that causes infinite loops
  const [currentMetrics, setCurrentMetrics] = useState<CalculatedUserMetrics | null>(null);
  
  React.useEffect(() => {
    if (!formattedUser) {
      setCurrentMetrics(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const metrics = calculationService.calculateUserMetrics(formattedUser);
      setCurrentMetrics(metrics);
    } catch (error) {
      console.error("Error calculating user metrics:", error);
      setCurrentMetrics(DEFAULT_METRICS);
    } finally {
      setIsLoading(false);
    }
  }, [formattedUser, calculationService, recalculationCounter]);
  
  // Use the state variable instead of the direct calculation
  const calculatedMetrics = currentMetrics;
  
  // Function to trigger manual recalculation
  const updateCalculations = useCallback(() => {
    setRecalculationCounter(prev => prev + 1);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    calculationService,
    calculatedMetrics,
    updateCalculations,
    isLoading
  }), [calculationService, calculatedMetrics, updateCalculations, isLoading]);

  return (
    <DerivedDataContext.Provider value={contextValue}>
      {children}
    </DerivedDataContext.Provider>
  );
}

export function useDerivedData() {
  const context = useContext(DerivedDataContext);
  if (!context) {
    throw new Error("useDerivedData must be used within a DerivedDataProvider");
  }
  return context;
}