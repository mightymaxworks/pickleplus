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

import React, { createContext, useContext } from "react";
import { DataCalculationService, CalculatedUserMetrics } from "@/services/DataCalculationService";

interface DerivedDataContextType {
  calculationService: DataCalculationService;
  calculatedMetrics: CalculatedUserMetrics | null;
  updateCalculations: () => void;
  isLoading: boolean;
}

// Default metrics to use as a fallback
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

// Create a service instance once
const calculationService = new DataCalculationService();

// EMERGENCY FIX: Static context to prevent infinite loops
// This is a temporary static implementation that prevents render loops
// by not having any state updates
const DerivedDataContext = createContext<DerivedDataContextType>({
  calculationService,
  calculatedMetrics: DEFAULT_METRICS,
  updateCalculations: () => { 
    console.log("EMERGENCY FIX: updateCalculations called but ignored");
  },
  isLoading: false
});

/**
 * EMERGENCY FIX: Simplified Provider with no state to prevent infinite loops
 */
export function DerivedDataProvider({ children }: { children: React.ReactNode }) {
  // Simply render the children with the static context
  // This prevents any render loops by not having state updates
  console.log("EMERGENCY FIX: Using static DerivedDataContext");
  
  return (
    <DerivedDataContext.Provider value={{
      calculationService,
      calculatedMetrics: DEFAULT_METRICS,
      updateCalculations: () => {
        console.log("EMERGENCY FIX: updateCalculations called but ignored");
      },
      isLoading: false
    }}>
      {children}
    </DerivedDataContext.Provider>
  );
}

/**
 * Use the derived data context
 */
export function useDerivedData() {
  return useContext(DerivedDataContext);
}