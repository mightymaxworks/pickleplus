/**
 * Match Service
 * 
 * Provides data operations for match recording and management
 * following Framework 5.3 principles for frontend-first data handling.
 */

import { BaseEntity, getStorageService, IStorageService } from './storage-service';
import { queryClient } from '../queryClient';
import { apiRequest } from '../queryClient';
import { toast } from '@/hooks/use-toast';

// Match types

export interface MatchPlayer {
  userId: number;
  partnerId?: number;
  score: string;
  isWinner: boolean;
}

export interface GameScore {
  playerOneScore: number;
  playerTwoScore: number;
}

export interface Match extends BaseEntity {
  date: string;
  formatType: 'singles' | 'doubles' | 'mixed';
  scoringSystem: 'traditional' | 'rally' | 'skinny';
  pointsToWin: number;
  players: MatchPlayer[];
  gameScores: GameScore[];
  matchType?: 'casual' | 'competitive' | 'tournament' | 'league';
  eventTier?: 'local' | 'regional' | 'national' | 'international';
  division?: string;
  location?: string;
  validationStatus: 'pending' | 'confirmed' | 'disputed' | 'validated';
  metadata?: Record<string, any>;
}

// Input type for creating matches
export interface MatchInput {
  formatType: 'singles' | 'doubles' | 'mixed';
  scoringSystem: 'traditional' | 'rally' | 'skinny';
  pointsToWin: number;
  players: MatchPlayer[];
  gameScores: GameScore[];
  matchType?: 'casual' | 'competitive' | 'tournament' | 'league';
  eventTier?: 'local' | 'regional' | 'national' | 'international';
  division?: string;
  location?: string;
  metadata?: Record<string, any>;
}

// Match assessment types
export interface MatchAssessment extends BaseEntity {
  matchId: number | string;
  userId: number;
  targetUserId: number;
  dimensions: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
    consistency: number;
  };
  comments?: string;
  contextualFactors?: {
    surface?: string;
    weather?: string;
    fatigue?: number;
    pressure?: number;
  };
}

// Match assessment input
export interface MatchAssessmentInput {
  matchId: number | string;
  userId: number;
  targetUserId: number;
  dimensions: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
    consistency: number;
  };
  comments?: string;
  contextualFactors?: {
    surface?: string;
    weather?: string;
    fatigue?: number;
    pressure?: number;
  };
}

/**
 * Match Service class for handling match-related operations
 */
export class MatchService {
  private matchStorage: IStorageService<Match>;
  private assessmentStorage: IStorageService<MatchAssessment>;
  
  constructor() {
    this.matchStorage = getStorageService<Match>('matches');
    this.assessmentStorage = getStorageService<MatchAssessment>('match-assessments');
  }
  
  /**
   * Record a new match with frontend-first approach
   */
  async recordMatch(matchData: MatchInput): Promise<Match> {
    try {
      console.log('MatchService: Recording match with data:', matchData);
      
      // 1. Save to local storage first
      const match = await this.matchStorage.create({
        ...matchData,
        date: new Date().toISOString(),
        validationStatus: 'pending'
      });
      
      console.log('MatchService: Match saved locally:', match);
      
      // 2. Try to sync with the server in the background
      this.syncMatchWithServer(match).catch(error => {
        console.error('MatchService: Background sync failed:', error);
        // We don't block the UI flow on server sync failures
      });
      
      // 3. Return the locally saved match immediately
      return match;
    } catch (error) {
      console.error('MatchService: Error recording match:', error);
      throw error;
    }
  }
  
  /**
   * Get recent matches
   */
  async getRecentMatches(userId?: number, limit: number = 10): Promise<Match[]> {
    try {
      // Get all matches from storage
      const matches = await this.matchStorage.getAll();
      
      // Filter by user ID if provided
      const userMatches = userId 
        ? matches.filter(match => match.players.some(player => player.userId === userId))
        : matches;
      
      // Sort by date (newest first)
      const sortedMatches = userMatches.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Limit the number of results
      return sortedMatches.slice(0, limit);
    } catch (error) {
      console.error('MatchService: Error getting recent matches:', error);
      return [];
    }
  }
  
  /**
   * Get match details by ID
   */
  async getMatchById(id: string | number): Promise<Match | null> {
    return this.matchStorage.getById(id);
  }
  
  /**
   * Record a match assessment
   */
  async recordMatchAssessment(assessmentData: MatchAssessmentInput): Promise<MatchAssessment> {
    try {
      console.log('MatchService: Recording assessment:', assessmentData);
      
      // 1. Save locally first
      const assessment = await this.assessmentStorage.create(assessmentData);
      
      // 2. Try to sync with the server in the background
      this.syncAssessmentWithServer(assessment).catch(error => {
        console.error('MatchService: Assessment sync failed:', error);
        // We don't block the UI flow on server sync failures
      });
      
      // 3. Return the locally saved assessment
      return assessment;
    } catch (error) {
      console.error('MatchService: Error recording assessment:', error);
      throw error;
    }
  }
  
  /**
   * Get assessments for a match
   */
  async getMatchAssessments(matchId: string | number): Promise<MatchAssessment[]> {
    try {
      const assessments = await this.assessmentStorage.query(
        assessment => assessment.matchId === matchId
      );
      return assessments;
    } catch (error) {
      console.error('MatchService: Error getting match assessments:', error);
      return [];
    }
  }
  
  /**
   * Private method to sync a match with the server
   */
  private async syncMatchWithServer(match: Match): Promise<void> {
    try {
      console.log('MatchService: Syncing match with server:', match);
      
      // Try to send to server
      const response = await apiRequest('POST', '/api/match/record', match);
      
      if (!response.ok) {
        console.error('MatchService: Server sync failed with status:', response.status);
        // Store this match for future sync attempts
        this.storeFailedSync('matches', match.id);
        return;
      }
      
      // Get the server's version of the match (might have additional fields)
      const serverMatch = await response.json();
      console.log('MatchService: Server sync successful, received:', serverMatch);
      
      // Update local version with server data
      if (serverMatch && serverMatch.id) {
        await this.matchStorage.update(match.id, serverMatch);
      }
      
      // Invalidate related queries
      this.invalidateMatchQueries();
      
    } catch (error) {
      console.error('MatchService: Error syncing with server:', error);
      // Store this match for future sync attempts
      this.storeFailedSync('matches', match.id);
      throw error;
    }
  }
  
  /**
   * Private method to sync an assessment with the server
   */
  private async syncAssessmentWithServer(assessment: MatchAssessment): Promise<void> {
    try {
      console.log('MatchService: Syncing assessment with server:', assessment);
      
      // Try to send to server
      const response = await apiRequest('POST', '/api/match-assessment/record', assessment);
      
      if (!response.ok) {
        console.error('MatchService: Assessment server sync failed with status:', response.status);
        // Store this assessment for future sync attempts
        this.storeFailedSync('match-assessments', assessment.id);
        return;
      }
      
      // Get the server's version of the assessment
      const serverAssessment = await response.json();
      console.log('MatchService: Assessment server sync successful, received:', serverAssessment);
      
      // Update local version with server data
      if (serverAssessment && serverAssessment.id) {
        await this.assessmentStorage.update(assessment.id, serverAssessment);
      }
      
      // Invalidate related queries
      this.invalidateMatchQueries();
      
    } catch (error) {
      console.error('MatchService: Error syncing assessment with server:', error);
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
      console.error('MatchService: Error storing failed sync:', error);
    }
  }
  
  /**
   * Invalidate related queries when data changes
   */
  private invalidateMatchQueries(): void {
    console.log('MatchService: Invalidating related queries');
    queryClient.invalidateQueries({ queryKey: ['/api/match/recent'] });
    queryClient.invalidateQueries({ queryKey: ['/api/match/history'] });
    queryClient.invalidateQueries({ queryKey: ['/api/match/stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/activities'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/xp-tier'] });
    queryClient.invalidateQueries({ queryKey: ['/api/ranking-leaderboard'] });
    queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
  }
  
  /**
   * Attempt to sync all pending data with server
   */
  async syncAllPendingData(): Promise<void> {
    try {
      // Get all failed syncs
      const failedSyncs = JSON.parse(localStorage.getItem('pickle_plus_failed_syncs') || '{}');
      
      // Sync matches
      if (failedSyncs.matches && failedSyncs.matches.length > 0) {
        for (const id of failedSyncs.matches) {
          const match = await this.matchStorage.getById(id);
          if (match) {
            try {
              await this.syncMatchWithServer(match);
              // Remove from failed syncs if successful
              failedSyncs.matches = failedSyncs.matches.filter((i: string | number) => i !== id);
            } catch (error) {
              console.error(`MatchService: Failed to sync match ${id}:`, error);
            }
          }
        }
      }
      
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
              console.error(`MatchService: Failed to sync assessment ${id}:`, error);
            }
          }
        }
      }
      
      // Update failed syncs
      localStorage.setItem('pickle_plus_failed_syncs', JSON.stringify(failedSyncs));
      
      // Show toast if syncs were successful
      const beforeCount = (failedSyncs.matches?.length || 0) + (failedSyncs['match-assessments']?.length || 0);
      const afterCount = (failedSyncs.matches?.length || 0) + (failedSyncs['match-assessments']?.length || 0);
      
      if (beforeCount > 0 && beforeCount > afterCount) {
        toast({
          title: 'Data synchronized',
          description: `Successfully synced ${beforeCount - afterCount} items with the server.`,
        });
      }
    } catch (error) {
      console.error('MatchService: Error syncing all pending data:', error);
    }
  }
}

// Create a singleton instance
export const matchService = new MatchService();

// Export a hook to use the match service
export function useMatchService() {
  return matchService;
}