/**
 * Assessment Service
 * 
 * Provides data operations for match assessment and skill ratings
 * following Framework 5.3 principles for frontend-first data handling.
 */

import { BaseEntity, getStorageService, IStorageService } from './storage-service';
import { queryClient } from '../queryClient';
import { apiRequest } from '../queryClient';
import { toast } from '@/hooks/use-toast';
import featureFlags from '../featureFlags';

// Assessment types
export interface SkillDimension {
  id: number;
  code: string;
  name: string;
  description: string;
  maxRating: number;
  defaultWeight: number;
}

export interface AssessmentRating {
  dimensionId: number;
  dimensionCode: string;
  rating: number;
  notes?: string;
}

export interface MatchAssessment extends BaseEntity {
  matchId: number | string;
  assessorId: number; // User ID of the person giving the assessment
  targetId: number;   // User ID of the person being assessed
  ratings: AssessmentRating[];
  contextualFactors?: {
    surface?: string;
    weather?: string;
    fatigue?: number;
    pressure?: number;
    notes?: string;
  };
  isConfidential?: boolean;
  createdAt: string;
}

// Input type for creating assessments
export interface AssessmentInput {
  matchId: number | string;
  assessorId: number;
  targetId: number;
  ratings: AssessmentRating[];
  contextualFactors?: {
    surface?: string;
    weather?: string;
    fatigue?: number;
    pressure?: number;
    notes?: string;
  };
  isConfidential?: boolean;
}

// Interface for saving incomplete assessments
export interface IncompleteAssessment {
  matchId: number | string;
  assessorId: number;
  targetId: number;
  formData: Record<string, any>; // Stores form values in current state
  lastUpdated: string;
  currentStep: string;
  isComplete: boolean;
}

/**
 * Assessment Service class for handling skill assessments and ratings
 */
export class AssessmentService {
  private assessmentStorage: IStorageService<MatchAssessment>;
  private dimensionsStorage: IStorageService<SkillDimension>;
  private readonly INCOMPLETE_ASSESSMENTS_KEY = 'pickle_plus_incomplete_assessments';
  
  // Default skill dimensions
  private defaultDimensions: SkillDimension[] = [
    {
      id: 1,
      code: "TECH",
      name: "Technical Skills",
      description: "Shot execution, form, and technical fundamentals",
      maxRating: 10,
      defaultWeight: 1.0
    },
    {
      id: 2,
      code: "TACT",
      name: "Tactical Awareness",
      description: "Court positioning, shot selection, and strategic decision-making",
      maxRating: 10,
      defaultWeight: 1.0
    },
    {
      id: 3,
      code: "PHYS",
      name: "Physical Fitness",
      description: "Speed, agility, and endurance during play",
      maxRating: 10,
      defaultWeight: 1.0
    },
    {
      id: 4,
      code: "MENT",
      name: "Mental Toughness",
      description: "Focus, resilience, and performance under pressure",
      maxRating: 10,
      defaultWeight: 1.0
    },
    {
      id: 5,
      code: "CONS",
      name: "Consistency",
      description: "Reliability and error reduction during play",
      maxRating: 10,
      defaultWeight: 1.0
    }
  ];
  
  constructor() {
    this.assessmentStorage = getStorageService<MatchAssessment>('match-assessments');
    this.dimensionsStorage = getStorageService<SkillDimension>('skill-dimensions');
    
    // Initialize default skill dimensions
    this.initializeSkillDimensions();
  }
  
  /**
   * Initialize default skill dimensions if none exist
   */
  private async initializeSkillDimensions(): Promise<void> {
    try {
      const dimensions = await this.dimensionsStorage.getAll();
      
      // If no dimensions exist, create defaults
      if (dimensions.length === 0) {
        console.log('AssessmentService: Initializing default skill dimensions');
        
        for (const dimension of this.defaultDimensions) {
          await this.dimensionsStorage.create(dimension);
        }
      }
    } catch (error) {
      console.error('AssessmentService: Error initializing skill dimensions:', error);
    }
  }
  
  /**
   * Get all skill dimensions
   */
  async getSkillDimensions(): Promise<SkillDimension[]> {
    try {
      const dimensions = await this.dimensionsStorage.getAll();
      return dimensions.length > 0 ? dimensions : this.defaultDimensions;
    } catch (error) {
      console.error('AssessmentService: Error getting skill dimensions:', error);
      return this.defaultDimensions;
    }
  }
  
  /**
   * Record a new match assessment with frontend-first approach
   */
  async recordAssessment(assessmentData: AssessmentInput): Promise<MatchAssessment> {
    try {
      console.log('AssessmentService: Recording assessment with data:', assessmentData);
      
      // 1. Save to local storage first
      const assessment = await this.assessmentStorage.create({
        ...assessmentData,
        createdAt: new Date().toISOString()
      });
      
      console.log('AssessmentService: Assessment saved locally:', assessment);
      
      // 2. Try to sync with the server in the background
      this.syncAssessmentWithServer(assessment).catch(error => {
        console.error('AssessmentService: Background sync failed:', error);
        // We don't block the UI flow on server sync failures
      });
      
      // 3. Return the locally saved assessment immediately
      return assessment;
    } catch (error) {
      console.error('AssessmentService: Error recording assessment:', error);
      throw error;
    }
  }
  
  /**
   * Get all assessments for a match
   */
  async getMatchAssessments(matchId: number | string): Promise<MatchAssessment[]> {
    try {
      return await this.assessmentStorage.query(
        assessment => assessment.matchId === matchId
      );
    } catch (error) {
      console.error('AssessmentService: Error getting match assessments:', error);
      return [];
    }
  }
  
  /**
   * Get all assessments for a player
   */
  async getPlayerAssessments(playerId: number): Promise<MatchAssessment[]> {
    try {
      return await this.assessmentStorage.query(
        assessment => assessment.targetId === playerId
      );
    } catch (error) {
      console.error('AssessmentService: Error getting player assessments:', error);
      return [];
    }
  }
  
  /**
   * Get a specific assessment by ID
   */
  async getAssessmentById(id: number | string): Promise<MatchAssessment | null> {
    return this.assessmentStorage.getById(id);
  }
  
  /**
   * Sync an assessment with the server
   * Made public so it can be used by SyncManager
   */
  public async syncAssessmentWithServer(assessment: MatchAssessment): Promise<void> {
    try {
      console.log('AssessmentService: Syncing assessment with server:', assessment);
      
      // Try to send to server
      const response = await apiRequest('POST', '/api/match-assessment/record', assessment);
      
      if (!response.ok) {
        console.error('AssessmentService: Server sync failed with status:', response.status);
        // Store this assessment for future sync attempts
        this.storeFailedSync('match-assessments', assessment.id);
        return;
      }
      
      // Get the server's version of the assessment
      const serverAssessment = await response.json();
      console.log('AssessmentService: Server sync successful, received:', serverAssessment);
      
      // Update local version with server data
      if (serverAssessment && serverAssessment.id) {
        await this.assessmentStorage.update(assessment.id, serverAssessment);
      }
      
      // Invalidate related queries
      this.invalidateAssessmentQueries();
      
    } catch (error) {
      console.error('AssessmentService: Error syncing with server:', error);
      // Store this assessment for future sync attempts
      this.storeFailedSync('match-assessments', assessment.id);
      throw error;
    }
  }
  
  /**
   * Store a failed sync attempt for retry later
   */
  private storeFailedSync(type: string, id: string | number): void {
    try {
      const failedSyncs = JSON.parse(localStorage.getItem('pickle_plus_failed_syncs') || '{}');
      
      if (!failedSyncs[type]) {
        failedSyncs[type] = [];
      }
      
      if (!failedSyncs[type].includes(id)) {
        failedSyncs[type].push(id);
      }
      
      localStorage.setItem('pickle_plus_failed_syncs', JSON.stringify(failedSyncs));
    } catch (error) {
      console.error('AssessmentService: Error storing failed sync:', error);
    }
  }
  
  /**
   * Invalidate related queries when data changes
   */
  private invalidateAssessmentQueries(): void {
    console.log('AssessmentService: Invalidating related queries');
    queryClient.invalidateQueries({ queryKey: ['/api/match-assessment'] });
    queryClient.invalidateQueries({ queryKey: ['/api/courtiq/performance'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/rating-detail'] });
  }
  
  /**
   * Attempt to sync all pending assessments with server
   */
  async syncAllPendingAssessments(): Promise<void> {
    try {
      // Get all failed syncs
      const failedSyncs = JSON.parse(localStorage.getItem('pickle_plus_failed_syncs') || '{}');
      
      // Sync assessments
      if (failedSyncs['match-assessments'] && failedSyncs['match-assessments'].length > 0) {
        for (const id of failedSyncs['match-assessments']) {
          const assessment = await this.assessmentStorage.getById(id);
          if (assessment) {
            try {
              await this.syncAssessmentWithServer(assessment);
              // Remove from failed syncs if successful
              failedSyncs['match-assessments'] = failedSyncs['match-assessments'].filter(
                (i: string | number) => i !== id
              );
            } catch (error) {
              console.error(`AssessmentService: Failed to sync assessment ${id}:`, error);
            }
          }
        }
      }
      
      // Update failed syncs
      localStorage.setItem('pickle_plus_failed_syncs', JSON.stringify(failedSyncs));
      
      // Show toast if syncs were successful
      const beforeCount = failedSyncs['match-assessments']?.length || 0;
      const afterCount = failedSyncs['match-assessments']?.length || 0;
      
      if (beforeCount > 0 && beforeCount > afterCount) {
        toast({
          title: 'Assessments synchronized',
          description: `Successfully synced ${beforeCount - afterCount} assessments with the server.`,
        });
      }
    } catch (error) {
      console.error('AssessmentService: Error syncing all pending assessments:', error);
    }
  }
  
  /**
   * Save an incomplete assessment for later completion
   * This allows users to pause and resume their assessments
   */
  async saveIncompleteAssessment(data: IncompleteAssessment): Promise<void> {
    try {
      console.log('AssessmentService: Saving incomplete assessment:', data);
      
      // Get current incomplete assessments
      const incompleteAssessments = this.getIncompleteAssessments();
      
      // Find if there's an existing incomplete assessment for this match and user
      const existingIndex = incompleteAssessments.findIndex(
        a => a.matchId === data.matchId && a.assessorId === data.assessorId
      );
      
      // Update or add the incomplete assessment
      if (existingIndex >= 0) {
        incompleteAssessments[existingIndex] = {
          ...data,
          lastUpdated: new Date().toISOString()
        };
      } else {
        incompleteAssessments.push({
          ...data,
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Save back to local storage
      localStorage.setItem(this.INCOMPLETE_ASSESSMENTS_KEY, JSON.stringify(incompleteAssessments));
      
      console.log('AssessmentService: Incomplete assessment saved successfully');
    } catch (error) {
      console.error('AssessmentService: Error saving incomplete assessment:', error);
      throw error;
    }
  }
  
  /**
   * Get all incomplete assessments
   */
  getIncompleteAssessments(): IncompleteAssessment[] {
    try {
      const data = localStorage.getItem(this.INCOMPLETE_ASSESSMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('AssessmentService: Error getting incomplete assessments:', error);
      return [];
    }
  }
  
  /**
   * Get incomplete assessment for a specific match and user
   */
  getIncompleteAssessment(matchId: number | string, assessorId: number): IncompleteAssessment | null {
    try {
      const incompleteAssessments = this.getIncompleteAssessments();
      return incompleteAssessments.find(
        a => a.matchId === matchId && a.assessorId === assessorId
      ) || null;
    } catch (error) {
      console.error(`AssessmentService: Error getting incomplete assessment for match ${matchId}:`, error);
      return null;
    }
  }
  
  /**
   * Delete an incomplete assessment
   * Used when an assessment is complete or abandoned
   */
  deleteIncompleteAssessment(matchId: number | string, assessorId: number): void {
    try {
      const incompleteAssessments = this.getIncompleteAssessments();
      const filteredAssessments = incompleteAssessments.filter(
        a => !(a.matchId === matchId && a.assessorId === assessorId)
      );
      
      localStorage.setItem(this.INCOMPLETE_ASSESSMENTS_KEY, JSON.stringify(filteredAssessments));
      console.log(`AssessmentService: Deleted incomplete assessment for match ${matchId}`);
    } catch (error) {
      console.error(`AssessmentService: Error deleting incomplete assessment for match ${matchId}:`, error);
    }
  }
  
  /**
   * Get the count of incomplete assessments
   */
  getIncompleteAssessmentCount(): number {
    return this.getIncompleteAssessments().length;
  }
  
  /**
   * Check if an assessment is in progress
   */
  hasIncompleteAssessment(matchId: number | string, assessorId: number): boolean {
    return this.getIncompleteAssessment(matchId, assessorId) !== null;
  }
}

// Create a singleton instance
export const assessmentService = new AssessmentService();

// Export a hook to use the assessment service
export function useAssessmentService() {
  return assessmentService;
}