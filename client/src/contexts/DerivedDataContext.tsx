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

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { EnhancedUser } from "@/types/enhanced-user";
import { DataCalculationService, CalculatedUserMetrics } from "@/services/DataCalculationService";

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
  const { user } = useAuth();
  const [calculationService] = useState(() => new DataCalculationService());
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedUserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate metrics when user data changes
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      calculateAndUpdateMetrics(user);
    } else {
      setCalculatedMetrics(null);
      setIsLoading(false);
    }
  }, [user]);

  // Function to calculate and update metrics
  const calculateAndUpdateMetrics = (userData: EnhancedUser) => {
    // Use setTimeout to prevent blocking the main thread for complex calculations
    setTimeout(() => {
      try {
        const metrics = calculationService.calculateUserMetrics(userData);
        setCalculatedMetrics(metrics);
      } catch (error) {
        console.error("Error calculating user metrics:", error);
        setCalculatedMetrics(DEFAULT_METRICS);
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  // Function to trigger recalculation
  const updateCalculations = () => {
    if (user) {
      setIsLoading(true);
      calculateAndUpdateMetrics(user);
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