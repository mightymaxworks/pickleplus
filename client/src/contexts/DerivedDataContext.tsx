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

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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

export function DerivedDataProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  // Cast the auth user to our utility type to avoid type errors
  const user = authUser as AuthUser | null;
  const [calculationService] = useState(() => new DataCalculationService());
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedUserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate metrics when user data changes
  useEffect(() => {
    let isMounted = true;
    
    if (user) {
      setIsLoading(true);
      
      // Safe type assertion to work around TypeScript limitations
      // This is necessary because the actual user object from auth might have 
      // fields that TypeScript doesn't know about at compile time
      const safeUser = user as any;
      
      // Create a properly formatted EnhancedUser object
      // This is a workaround for TypeScript errors since the user object from auth
      // doesn't exactly match the EnhancedUser interface
      const formattedUser: EnhancedUser = {
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
      
      // Run calculation outside of React's rendering cycle to prevent loops
      try {
        const metrics = calculationService.calculateUserMetrics(formattedUser);
        
        // Only update state if the component is still mounted
        if (isMounted) {
          setCalculatedMetrics(metrics);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error calculating user metrics:", error);
        if (isMounted) {
          setCalculatedMetrics(DEFAULT_METRICS);
          setIsLoading(false);
        }
      }
    } else {
      setCalculatedMetrics(null);
      setIsLoading(false);
    }
    
    // Cleanup function to prevent updates if component unmounts during calculation
    return () => {
      isMounted = false;
    };
  }, [user, calculationService]);

  // Function to trigger recalculation (now with safe handling)
  const calculateAndUpdateMetrics = (userData: EnhancedUser) => {
    setIsLoading(true);
    
    try {
      const metrics = calculationService.calculateUserMetrics(userData);
      setCalculatedMetrics(metrics);
    } catch (error) {
      console.error("Error calculating user metrics:", error);
      setCalculatedMetrics(DEFAULT_METRICS);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to trigger recalculation
  const updateCalculations = () => {
    if (user) {
      setIsLoading(true);
      
      // Safe type assertion just like in the useEffect
      const safeUser = user as any;
      
      // Create a properly formatted EnhancedUser object (same approach as in useEffect)
      const formattedUser: EnhancedUser = {
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
      
      try {
        const metrics = calculationService.calculateUserMetrics(formattedUser);
        setCalculatedMetrics(metrics);
        setIsLoading(false);
      } catch (error) {
        console.error("Error calculating user metrics:", error);
        setCalculatedMetrics(DEFAULT_METRICS);
        setIsLoading(false);
      }
    }
  };

  return (
    <DerivedDataContext.Provider
      value={{
        calculationService,
        calculatedMetrics,
        updateCalculations,
        isLoading
      }}
    >
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