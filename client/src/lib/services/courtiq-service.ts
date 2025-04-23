/**
 * CourtIQ™ Rating System Service
 * PKL-278651-RATINGS-0001-COURTIQ - Multi-dimensional Rating System
 * 
 * This service provides frontend integration with the CourtIQ™ rating system API.
 * It includes methods for retrieving and updating player ratings and assessment data,
 * along with frontend validation and data transformation.
 */

import { apiRequest } from "../queryClient";
import { getStorageService } from "./storage-service";
import { 
  type MatchAssessment, type InsertMatchAssessment,
  type CourtiqUserRating, type IncompleteAssessment, type InsertIncompleteAssessment
} from "@shared/schema/courtiq";

// Type for radar chart data display
export interface RadarChartData {
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  consistency: number;
  overall: number;
}

// Type for performance data API response
export interface PerformanceData {
  status: "success" | "insufficient_data";
  message: string;
  data: null | {
    radarData: RadarChartData;
    comparisonData: null | RadarChartData & { playerId: number; playerName: string };
    confidenceScore: number;
    assessmentCount: number;
    priorityImprovement: string;
    recommendationSummary: string;
  };
}

// Type for assessment auto-save data
export interface AssessmentDraft {
  technicalRating?: number;
  tacticalRating?: number;
  physicalRating?: number;
  mentalRating?: number;
  consistencyRating?: number;
  notes?: string;
  currentStep: string;
}

// Define retry configuration for synchronized operations
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
};

/**
 * CourtIQ™ Rating System Service
 * Handles integration with the CourtIQ™ API and local storage for the frontend
 */
class CourtIQService {
  private readonly STORAGE_KEY_PREFIX = "courtiq_";
  
  /**
   * Get a user's CourtIQ™ ratings
   * @param userId User ID to get ratings for
   * @returns The user's CourtIQ™ ratings or null if not found
   */
  async getUserRatings(userId: number): Promise<CourtiqUserRating | null> {
    try {
      // First check local storage for cached data
      const cachedRatings = this.getCachedRatings(userId);
      
      // Try to fetch from API
      try {
        const res = await apiRequest("GET", `/api/courtiq/ratings/${userId}`);
        const ratings = await res.json();
        
        // Cache the ratings
        this.cacheRatings(userId, ratings);
        
        return ratings;
      } catch (error) {
        console.warn("Error fetching user ratings from API:", error);
        
        // Return cached data if available
        if (cachedRatings) {
          return cachedRatings;
        }
        
        // Return null if no data is available
        return null;
      }
    } catch (error) {
      console.error("Error in getUserRatings:", error);
      return null;
    }
  }

  /**
   * Get performance data for the radar chart
   * @param userId User ID
   * @param format Format (singles, doubles, mixed)
   * @param division Division (open, 19+, etc.)
   * @returns Performance data for the radar chart
   */
  async getPerformanceData(
    userId: number, 
    format?: string, 
    division?: string
  ): Promise<PerformanceData> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("userId", userId.toString());
      
      if (format) {
        params.append("format", format);
      }
      
      if (division) {
        params.append("division", division);
      }
      
      // First check local storage for cached data
      const cacheKey = `performance_${userId}_${format || 'all'}_${division || 'all'}`;
      const cachedData = this.getLocalData(cacheKey);
      
      // Try to fetch from API
      try {
        const res = await apiRequest(
          "GET", 
          `/api/courtiq/performance?${params.toString()}`
        );
        
        const data = await res.json();
        
        // Cache the data
        this.saveLocalData(cacheKey, data);
        
        return data;
      } catch (error) {
        console.warn("Error fetching performance data from API:", error);
        
        // Return cached data if available
        if (cachedData) {
          return cachedData;
        }
        
        // Return default response if no data is available
        return {
          status: "insufficient_data",
          message: "Unable to fetch performance data. Please try again later.",
          data: null
        };
      }
    } catch (error) {
      console.error("Error in getPerformanceData:", error);
      
      return {
        status: "insufficient_data",
        message: "An error occurred while fetching performance data.",
        data: null
      };
    }
  }

  /**
   * Save a match assessment
   * @param assessment Assessment data to save
   * @returns The saved assessment data
   */
  async saveMatchAssessment(assessment: InsertMatchAssessment): Promise<MatchAssessment | null> {
    try {
      // Make sure required fields are present
      this.validateAssessment(assessment);
      
      // Save to API with retry
      return await this.saveAssessmentWithRetry(assessment);
    } catch (error) {
      console.error("Error in saveMatchAssessment:", error);
      
      // Save to local storage for later sync
      this.saveOfflineAssessment(assessment);
      
      throw new Error("Failed to save assessment. Data saved locally and will sync when online.");
    }
  }

  /**
   * Auto-save an incomplete match assessment
   * @param matchId Match ID
   * @param assessorId Assessor user ID
   * @param targetId Target user ID
   * @param formData Current form data to save
   * @param currentStep Current step in the assessment process
   * @returns Success status
   */
  async autoSaveAssessment(
    matchId: number,
    assessorId: number,
    targetId: number,
    formData: any,
    currentStep: string
  ): Promise<boolean> {
    try {
      const incompleteAssessment: InsertIncompleteAssessment = {
        matchId,
        assessorId,
        targetId,
        formData,
        currentStep: currentStep as any,
        isComplete: false
      };
      
      // Try saving to API
      try {
        await apiRequest(
          "POST",
          "/api/courtiq/incomplete-assessment",
          incompleteAssessment
        );
        
        return true;
      } catch (error) {
        console.warn("Error saving incomplete assessment to API:", error);
        
        // Fall back to local storage
        const key = `draft_${matchId}_${assessorId}_${targetId}`;
        this.saveLocalData(key, incompleteAssessment);
        
        return true;
      }
    } catch (error) {
      console.error("Error in autoSaveAssessment:", error);
      return false;
    }
  }

  /**
   * Get an incomplete assessment draft
   * @param matchId Match ID
   * @param assessorId Assessor user ID
   * @param targetId Target user ID
   * @returns The incomplete assessment draft or null if not found
   */
  async getIncompleteAssessment(
    matchId: number,
    assessorId: number,
    targetId: number
  ): Promise<IncompleteAssessment | null> {
    try {
      // Try to fetch from API
      try {
        const params = new URLSearchParams({
          matchId: matchId.toString(),
          assessorId: assessorId.toString(),
          targetId: targetId.toString()
        });
        
        const res = await apiRequest(
          "GET",
          `/api/courtiq/incomplete-assessment?${params.toString()}`
        );
        
        return await res.json();
      } catch (error) {
        console.warn("Error fetching incomplete assessment from API:", error);
        
        // Check local storage
        const key = `draft_${matchId}_${assessorId}_${targetId}`;
        const localDraft = this.getLocalData(key);
        
        return localDraft;
      }
    } catch (error) {
      console.error("Error in getIncompleteAssessment:", error);
      return null;
    }
  }

  /**
   * Synchronize locally saved assessments with the server
   * @returns Number of assessments successfully synced
   */
  async syncLocalAssessments(): Promise<number> {
    try {
      const offlineAssessments = this.getOfflineAssessments();
      let syncedCount = 0;
      
      // Process each offline assessment
      for (const assessment of offlineAssessments) {
        try {
          await this.saveAssessmentWithRetry(assessment);
          this.removeOfflineAssessment(assessment);
          syncedCount++;
        } catch (error) {
          console.warn(`Failed to sync assessment ${assessment.matchId}:`, error);
        }
      }
      
      return syncedCount;
    } catch (error) {
      console.error("Error syncing local assessments:", error);
      return 0;
    }
  }

  /**
   * Get top rated players for a specific dimension
   * @param dimension Rating dimension (TECH, TACT, PHYS, MENT, CONS, OVERALL)
   * @param limit Maximum number of players to return
   * @returns List of top rated players
   */
  async getTopRatedPlayers(dimension: string = 'OVERALL', limit: number = 10): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        dimension,
        limit: limit.toString()
      });
      
      const res = await apiRequest("GET", `/api/courtiq/top-players?${params.toString()}`);
      return await res.json();
    } catch (error) {
      console.error(`Error getting top rated players for ${dimension}:`, error);
      return [];
    }
  }

  /**
   * Get player strengths and weaknesses analysis
   * @param userId User ID
   * @returns Analysis of player strengths and weaknesses
   */
  async getPlayerAnalysis(userId: number): Promise<any> {
    try {
      const res = await apiRequest("GET", `/api/courtiq/analysis/${userId}`);
      return await res.json();
    } catch (error) {
      console.error("Error getting player analysis:", error);
      
      // Return default analysis if API call fails
      return {
        strengths: [],
        weaknesses: [],
        analysis: "Unable to fetch player analysis. Please try again later."
      };
    }
  }

  /**
   * Get coaching recommendations for a player
   * @param userId User ID
   * @returns Coaching recommendations
   */
  async getCoachingRecommendations(userId: number): Promise<any> {
    try {
      const res = await apiRequest("GET", `/api/courtiq/recommendations/${userId}`);
      return await res.json();
    } catch (error) {
      console.error("Error getting coaching recommendations:", error);
      
      // Return default recommendations if API call fails
      return {
        recommendations: [],
        priorityArea: "OVERALL",
        overallAdvice: "Unable to fetch coaching recommendations. Please try again later."
      };
    }
  }

  /**
   * Get similar players to a specified player
   * @param userId User ID
   * @param limit Maximum number of similar players to return
   * @returns List of similar players
   */
  async getSimilarPlayers(userId: number, limit: number = 5): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      const res = await apiRequest(
        "GET", 
        `/api/courtiq/similar-players/${userId}?${params.toString()}`
      );
      
      return await res.json();
    } catch (error) {
      console.error("Error getting similar players:", error);
      return [];
    }
  }

  /**
   * Get a user's rating progression over time
   * @param userId User ID
   * @param dimension Rating dimension
   * @param startDate Start date for the progression
   * @param endDate End date for the progression
   * @returns Rating progression data
   */
  async getRatingProgression(
    userId: number, 
    dimension: string = 'OVERALL',
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        dimension
      });
      
      if (startDate) {
        params.append("startDate", startDate.toISOString());
      }
      
      if (endDate) {
        params.append("endDate", endDate.toISOString());
      }
      
      const res = await apiRequest(
        "GET", 
        `/api/courtiq/progression/${userId}?${params.toString()}`
      );
      
      return await res.json();
    } catch (error) {
      console.error("Error getting rating progression:", error);
      return [];
    }
  }

  // Private helper methods

  /**
   * Validate assessment data before saving
   * @param assessment Assessment data to validate
   */
  private validateAssessment(assessment: InsertMatchAssessment): void {
    // Ensure all required fields have valid values
    if (!assessment.matchId || assessment.matchId <= 0) {
      throw new Error("Invalid match ID");
    }
    
    if (!assessment.assessorId || assessment.assessorId <= 0) {
      throw new Error("Invalid assessor ID");
    }
    
    if (!assessment.targetId || assessment.targetId <= 0) {
      throw new Error("Invalid target ID");
    }
    
    if (!assessment.assessmentType) {
      throw new Error("Assessment type is required");
    }
    
    // Validate rating values
    const ratingFields = [
      "technicalRating", 
      "tacticalRating", 
      "physicalRating", 
      "mentalRating", 
      "consistencyRating"
    ];
    
    for (const field of ratingFields) {
      const value = assessment[field as keyof InsertMatchAssessment] as number;
      
      if (value === undefined || value === null || value < 1 || value > 5) {
        throw new Error(`Invalid ${field} value (must be between 1 and 5)`);
      }
    }
  }

  /**
   * Save an assessment with retry logic
   * @param assessment Assessment data to save
   * @returns The saved assessment
   */
  private async saveAssessmentWithRetry(assessment: InsertMatchAssessment): Promise<MatchAssessment | null> {
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries < RETRY_CONFIG.maxRetries) {
      try {
        const res = await apiRequest(
          "POST",
          "/api/courtiq/assessment",
          assessment
        );
        
        const data = await res.json();
        return data.assessment;
      } catch (error: any) {
        lastError = error;
        retries++;
        
        if (retries >= RETRY_CONFIG.maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, retries) + Math.random() * 1000,
          RETRY_CONFIG.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError || new Error("Failed to save assessment after multiple retries");
  }

  /**
   * Save an assessment to local storage for offline use
   * @param assessment Assessment data to save
   */
  private saveOfflineAssessment(assessment: InsertMatchAssessment): void {
    try {
      const offlineAssessments = this.getOfflineAssessments();
      
      // Check if this assessment already exists
      const existingIndex = offlineAssessments.findIndex(a => 
        a.matchId === assessment.matchId && 
        a.assessorId === assessment.assessorId && 
        a.targetId === assessment.targetId
      );
      
      if (existingIndex >= 0) {
        // Update existing assessment
        offlineAssessments[existingIndex] = assessment;
      } else {
        // Add new assessment
        offlineAssessments.push(assessment);
      }
      
      // Save to local storage
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}offline_assessments`,
        JSON.stringify(offlineAssessments)
      );
    } catch (error) {
      console.error("Error saving offline assessment:", error);
    }
  }

  /**
   * Get all assessments saved in local storage
   * @returns List of offline assessments
   */
  private getOfflineAssessments(): InsertMatchAssessment[] {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}offline_assessments`);
      
      if (!data) {
        return [];
      }
      
      return JSON.parse(data) as InsertMatchAssessment[];
    } catch (error) {
      console.error("Error getting offline assessments:", error);
      return [];
    }
  }

  /**
   * Remove an assessment from local storage
   * @param assessment Assessment to remove
   */
  private removeOfflineAssessment(assessment: InsertMatchAssessment): void {
    try {
      const offlineAssessments = this.getOfflineAssessments();
      
      // Filter out the assessment
      const filtered = offlineAssessments.filter(a => 
        !(a.matchId === assessment.matchId && 
          a.assessorId === assessment.assessorId && 
          a.targetId === assessment.targetId)
      );
      
      // Save to local storage
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}offline_assessments`,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Error removing offline assessment:", error);
    }
  }

  /**
   * Get cached ratings for a user
   * @param userId User ID
   * @returns Cached ratings or null if not found
   */
  private getCachedRatings(userId: number): CourtiqUserRating | null {
    return this.getLocalData(`ratings_${userId}`);
  }

  /**
   * Cache ratings data in local storage
   * @param userId User ID
   * @param ratings Ratings data to cache
   */
  private cacheRatings(userId: number, ratings: CourtiqUserRating): void {
    this.saveLocalData(`ratings_${userId}`, ratings);
  }

  /**
   * Save data to local storage
   * @param key Storage key
   * @param data Data to save
   */
  private saveLocalData(key: string, data: any): void {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}${key}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
    }
  }

  /**
   * Get data from local storage
   * @param key Storage key
   * @returns Data or null if not found
   */
  private getLocalData(key: string): any {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${key}`);
      
      if (!data) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }
}

// Export a singleton instance
export const courtiqService = new CourtIQService();