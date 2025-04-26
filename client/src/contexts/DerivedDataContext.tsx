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
  
  // Use a ref to track if calculation is in progress to prevent infinite loops
  const isCalculatingRef = useRef(false);

  // Calculate metrics when user data changes
  useEffect(() => {
    let isMounted = true;
    
    // Use the ref to prevent infinite loops
    if (isCalculatingRef.current) {
      return;
    }
    
    if (!user) {
      setCalculatedMetrics(null);
      setIsLoading(false);
      return;
    }
    
    // Mark that we're starting a calculation cycle
    isCalculatingRef.current = true;
    setIsLoading(true);
    
    // Safe type assertion to work around TypeScript limitations
    const safeUser = user as any;
    
    // Use setTimeout to break the render cycle and avoid infinite loops
    setTimeout(() => {
      if (!isMounted) return;
      
      try {
        // Create a properly formatted EnhancedUser object
        const formattedUser: EnhancedUser = {
          // Required base properties
          id: safeUser.id || 0,
          username: safeUser.username || '',
          password: safeUser.password || '',
          avatarInitials: safeUser.avatarInitials || '',
          level: safeUser.level || 1,
          xp: safeUser.xp || 0,
          totalMatches: safeUser.totalMatches || 0,
          matchesWon: safeUser.matchesWon || 0,
          totalTournaments: safeUser.totalTournaments || 0,
          profileCompletionPct: safeUser.profileCompletionPct || 0,
          rankingPoints: safeUser.rankingPoints || 0,
          achievements: Array.isArray(safeUser.achievements) ? safeUser.achievements : [],
          
          // Optional properties with safe defaults
          email: safeUser.email || null,
          displayName: safeUser.displayName || null,
          avatarUrl: safeUser.avatarUrl || null,
          bio: safeUser.bio || null,
          location: safeUser.location || null,
          yearOfBirth: safeUser.yearOfBirth || null,
          
          // Boolean properties with nullish coalescing for proper default
          isAdmin: typeof safeUser.isAdmin === 'boolean' ? safeUser.isAdmin : false,
          isCoach: typeof safeUser.isCoach === 'boolean' ? safeUser.isCoach : false,
          isVerified: typeof safeUser.isVerified === 'boolean' ? safeUser.isVerified : false,
          
          // Other properties with proper types
          passportId: safeUser.passportId || null,
          matchesLost: typeof safeUser.matchesLost === 'number' ? safeUser.matchesLost : undefined,
          createdAt: safeUser.createdAt ? safeUser.createdAt : undefined,
          lastUpdated: safeUser.lastUpdated ? safeUser.lastUpdated : undefined,
          lastVisit: safeUser.lastVisit ? safeUser.lastVisit : undefined,
          paddleBrand: typeof safeUser.paddleBrand === 'string' ? safeUser.paddleBrand : undefined,
          paddleModel: typeof safeUser.paddleModel === 'string' ? safeUser.paddleModel : undefined,
          
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
        
        // Calculate metrics
        const metrics = calculationService.calculateUserMetrics(formattedUser);
        
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
      } finally {
        // Reset the flag to allow future calculations
        isCalculatingRef.current = false;
      }
    }, 0);
    
    // Cleanup function to prevent updates if component unmounts during calculation
    return () => {
      isMounted = false;
    };
  }, [user, calculationService]);

  // Function to calculate metrics from provided user data
  const calculateAndUpdateMetrics = (userData: EnhancedUser) => {
    // Prevent multiple calculations from running simultaneously
    if (isCalculatingRef.current) {
      console.log("Calculation already in progress, skipping calculateAndUpdateMetrics request");
      return;
    }
    
    // Mark that we're starting a calculation
    isCalculatingRef.current = true;
    setIsLoading(true);
    
    // Use setTimeout to break potential render cycle
    setTimeout(() => {
      try {
        const metrics = calculationService.calculateUserMetrics(userData);
        setCalculatedMetrics(metrics);
      } catch (error) {
        console.error("Error calculating user metrics in calculateAndUpdateMetrics:", error);
        setCalculatedMetrics(DEFAULT_METRICS);
      } finally {
        setIsLoading(false);
        isCalculatingRef.current = false;
      }
    }, 0);
  };

  // Function to trigger manual recalculation
  const updateCalculations = () => {
    // Prevent multiple calculations from running simultaneously
    if (isCalculatingRef.current) {
      console.log("Calculation already in progress, skipping updateCalculations request");
      return;
    }
    
    if (!user) {
      return;
    }
    
    // Mark that we're starting a calculation
    isCalculatingRef.current = true;
    setIsLoading(true);
    
    // Use setTimeout to break potential render cycle
    setTimeout(() => {
      try {
        // Safe type assertion to work around TypeScript limitations
        const safeUser = user as any;
        
        // Create a properly formatted EnhancedUser object
        const formattedUser: EnhancedUser = {
          // Required base properties
          id: safeUser.id || 0,
          username: safeUser.username || '',
          password: safeUser.password || '',
          avatarInitials: safeUser.avatarInitials || '',
          level: safeUser.level || 1,
          xp: safeUser.xp || 0,
          totalMatches: safeUser.totalMatches || 0,
          matchesWon: safeUser.matchesWon || 0,
          totalTournaments: safeUser.totalTournaments || 0,
          profileCompletionPct: safeUser.profileCompletionPct || 0,
          rankingPoints: safeUser.rankingPoints || 0,
          achievements: Array.isArray(safeUser.achievements) ? safeUser.achievements : [],
          
          // Optional properties with safe defaults
          email: safeUser.email || null,
          displayName: safeUser.displayName || null,
          avatarUrl: safeUser.avatarUrl || null,
          bio: safeUser.bio || null,
          location: safeUser.location || null,
          yearOfBirth: safeUser.yearOfBirth || null,
          
          // Boolean properties with nullish coalescing for proper default
          isAdmin: typeof safeUser.isAdmin === 'boolean' ? safeUser.isAdmin : false,
          isCoach: typeof safeUser.isCoach === 'boolean' ? safeUser.isCoach : false,
          isVerified: typeof safeUser.isVerified === 'boolean' ? safeUser.isVerified : false,
          
          // Other properties with proper types
          passportId: safeUser.passportId || null,
          matchesLost: typeof safeUser.matchesLost === 'number' ? safeUser.matchesLost : undefined,
          createdAt: safeUser.createdAt ? safeUser.createdAt : undefined,
          lastUpdated: safeUser.lastUpdated ? safeUser.lastUpdated : undefined,
          lastVisit: safeUser.lastVisit ? safeUser.lastVisit : undefined,
          paddleBrand: typeof safeUser.paddleBrand === 'string' ? safeUser.paddleBrand : undefined,
          paddleModel: typeof safeUser.paddleModel === 'string' ? safeUser.paddleModel : undefined,
          
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
        
        // Calculate the metrics
        const metrics = calculationService.calculateUserMetrics(formattedUser);
        setCalculatedMetrics(metrics);
      } catch (error) {
        console.error("Error calculating user metrics in updateCalculations:", error);
        setCalculatedMetrics(DEFAULT_METRICS);
      } finally {
        setIsLoading(false);
        isCalculatingRef.current = false;
      }
    }, 0);
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