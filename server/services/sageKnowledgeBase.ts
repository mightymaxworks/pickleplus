/**
 * PKL-278651-SAGE-0015-CONCIERGE
 * SAGE Knowledge Base for Platform Navigation
 * 
 * This service provides a structured knowledge base of all platform features
 * for the SAGE concierge functionality. It maps features to dimensions,
 * user roles, and natural language keywords for intent matching.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { DimensionCode } from '../../shared/schema/sage';
import { UserRole } from '../../shared/schema/sage-concierge';

export interface PlatformFeature {
  id: string;
  name: string;
  description: string;
  path: string;
  keywords: string[];
  relatedDimensions?: DimensionCode[];
  requiredRole?: UserRole;
}

export interface FeatureCategory {
  id: string;
  name: string;
  features: PlatformFeature[];
}

/**
 * Comprehensive knowledge base of all platform features
 * categorized by functionality type
 */
export const platformFeatures: FeatureCategory[] = [
  {
    id: 'training',
    name: 'Training & Development',
    features: [
      {
        id: 'drills',
        name: 'Pickleball Drills',
        description: 'Access specialized drills for all skill levels to improve specific aspects of your game',
        path: '/drills',
        keywords: ['drill', 'practice', 'exercise', 'training', 'improve', 'skill'],
        relatedDimensions: ['TECH', 'TACT', 'PHYS', 'CONS']
      },
      {
        id: 'sage_coaching',
        name: 'SAGE Coaching',
        description: 'Get personalized coaching advice from your AI pickleball coach',
        path: '/coach/sage',
        keywords: ['coach', 'advice', 'improve', 'learn', 'sage', 'ai', 'coaching'],
        relatedDimensions: ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS']
      },
      {
        id: 'journaling',
        name: 'Performance Journal',
        description: 'Track your progress and reflect on your pickleball journey',
        path: '/coach/sage?tab=journal',
        keywords: ['journal', 'track', 'progress', 'reflection', 'diary', 'log'],
        relatedDimensions: ['MENT', 'CONS']
      },
      {
        id: 'training_plans',
        name: 'Training Plans',
        description: 'Follow structured training regimens designed to enhance specific skills',
        path: '/coach/sage?tab=structured',
        keywords: ['plan', 'regimen', 'schedule', 'program', 'training'],
        relatedDimensions: ['TECH', 'PHYS', 'CONS']
      }
    ]
  },
  {
    id: 'competitive',
    name: 'Competitive Play',
    features: [
      {
        id: 'tournaments',
        name: 'Tournaments',
        description: 'Find and register for upcoming tournaments in your area',
        path: '/tournaments',
        keywords: ['tournament', 'compete', 'competition', 'bracket', 'event', 'match play'],
        relatedDimensions: ['TACT', 'MENT']
      },
      {
        id: 'match_recording',
        name: 'Match Recording',
        description: 'Record and analyze your match results to track performance',
        path: '/record-match',
        keywords: ['match', 'game', 'score', 'record', 'result', 'log match'],
        relatedDimensions: ['TACT', 'MENT', 'CONS']
      },
      {
        id: 'match_history',
        name: 'Match History',
        description: 'View your past matches and performance analytics',
        path: '/matches',
        keywords: ['history', 'past', 'previous', 'matches', 'record', 'games'],
        relatedDimensions: ['TACT', 'MENT', 'CONS']
      },
      {
        id: 'leaderboard',
        name: 'Leaderboard',
        description: 'See how you rank compared to other players',
        path: '/leaderboard',
        keywords: ['leaderboard', 'ranking', 'rank', 'position', 'standings', 'compare'],
        relatedDimensions: ['MENT']
      }
    ]
  },
  {
    id: 'performance',
    name: 'Performance Analytics',
    features: [
      {
        id: 'courtiq',
        name: 'CourtIQ Analysis',
        description: 'View your multi-dimensional rating analysis across all five skill dimensions',
        path: '/courtiq/analysis',
        keywords: ['courtiq', 'rating', 'analysis', 'dimension', 'skill', 'assessment'],
        relatedDimensions: ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS']
      },
      {
        id: 'skills_assessment',
        name: 'Skills Assessment',
        description: 'Take an assessment to identify your strengths and improvement areas',
        path: '/onboarding',
        keywords: ['assessment', 'evaluate', 'test', 'measure', 'skill', 'rating'],
        relatedDimensions: ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS']
      },
      {
        id: 'mastery_paths',
        name: 'Mastery Paths',
        description: 'Track your progress on various skill mastery paths',
        path: '/mastery',
        keywords: ['mastery', 'path', 'progress', 'track', 'achievement', 'level'],
        relatedDimensions: ['TECH', 'TACT', 'CONS']
      }
    ]
  },
  {
    id: 'community',
    name: 'Community & Social',
    features: [
      {
        id: 'communities',
        name: 'Pickleball Communities',
        description: 'Join and interact with pickleball communities in your area',
        path: '/communities',
        keywords: ['community', 'group', 'club', 'connect', 'local', 'players'],
        relatedDimensions: ['MENT']
      },
      {
        id: 'connections',
        name: 'Player Connections',
        description: 'Connect with other pickleball players and expand your network',
        path: '/connections',
        keywords: ['connection', 'friend', 'player', 'network', 'contact', 'connect'],
        relatedDimensions: ['MENT']
      },
      {
        id: 'events',
        name: 'Community Events',
        description: 'Discover local pickleball events and meetups',
        path: '/events',
        keywords: ['event', 'meetup', 'gathering', 'local', 'community', 'social'],
        relatedDimensions: ['MENT']
      },
      {
        id: 'referrals',
        name: 'Referral Program',
        description: 'Invite friends to join Pickle+ and earn rewards',
        path: '/referrals',
        keywords: ['referral', 'invite', 'friend', 'reward', 'share', 'recommend'],
        relatedDimensions: []
      }
    ]
  },
  {
    id: 'profile',
    name: 'Profile & Achievements',
    features: [
      {
        id: 'profile',
        name: 'Player Profile',
        description: 'View and edit your player profile information',
        path: '/profile',
        keywords: ['profile', 'account', 'personal', 'info', 'settings', 'bio'],
        relatedDimensions: []
      },
      {
        id: 'achievements',
        name: 'Achievements',
        description: 'Track your earned achievements and badges',
        path: '/achievements',
        keywords: ['achievement', 'badge', 'award', 'earn', 'accomplish', 'trophy'],
        relatedDimensions: ['MENT', 'CONS']
      },
      {
        id: 'passport',
        name: 'Pickleball Passport',
        description: 'View your digital pickleball passport with your stats and accomplishments',
        path: '/passport',
        keywords: ['passport', 'card', 'id', 'digital', 'credential', 'identity'],
        relatedDimensions: []
      }
    ]
  }
];

/**
 * Utility methods for working with platform features
 */
export class SageKnowledgeBase {
  /**
   * Find a feature by its ID
   * 
   * @param featureId The feature ID to look for
   * @returns The matching feature or undefined
   */
  public findFeatureById(featureId: string): PlatformFeature | undefined {
    for (const category of platformFeatures) {
      const feature = category.features.find(f => f.id === featureId);
      if (feature) return feature;
    }
    return undefined;
  }
  
  /**
   * Find features related to a specific dimension
   * 
   * @param dimension The dimension code to find features for
   * @returns Array of features related to this dimension
   */
  public findFeaturesByDimension(dimension: DimensionCode): PlatformFeature[] {
    const relatedFeatures: PlatformFeature[] = [];
    
    for (const category of platformFeatures) {
      for (const feature of category.features) {
        if (feature.relatedDimensions?.includes(dimension)) {
          relatedFeatures.push(feature);
        }
      }
    }
    
    return relatedFeatures;
  }
  
  /**
   * Find features matching specific keywords
   * 
   * @param keywords Array of keywords to match against
   * @returns Matching features sorted by relevance (keyword match count)
   */
  public findFeaturesByKeywords(keywords: string[]): PlatformFeature[] {
    const featureMatches: Array<{ feature: PlatformFeature, matchCount: number }> = [];
    
    // Normalize keywords to lowercase
    const normalizedKeywords = keywords.map(k => k.toLowerCase());
    
    // Check each feature for keyword matches
    for (const category of platformFeatures) {
      for (const feature of category.features) {
        let matchCount = 0;
        
        // Count how many keywords match this feature
        for (const keyword of normalizedKeywords) {
          if (feature.keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
            matchCount++;
          }
          
          // Also check name and description for matches
          if (feature.name.toLowerCase().includes(keyword) || 
              feature.description.toLowerCase().includes(keyword)) {
            matchCount++;
          }
        }
        
        if (matchCount > 0) {
          featureMatches.push({ feature, matchCount });
        }
      }
    }
    
    // Sort by match count (descending) and return features
    return featureMatches
      .sort((a, b) => b.matchCount - a.matchCount)
      .map(match => match.feature);
  }
  
  /**
   * Get a list of features accessible to a specific user role
   * 
   * @param role The user role to filter by
   * @returns Features accessible to this role
   */
  public getFeaturesByRole(role: UserRole): PlatformFeature[] {
    const accessibleFeatures: PlatformFeature[] = [];
    
    for (const category of platformFeatures) {
      for (const feature of category.features) {
        // If feature has no required role, it's accessible to everyone
        if (!feature.requiredRole) {
          accessibleFeatures.push(feature);
        }
        // If feature has a required role, check if the user's role is sufficient
        else if (this.isRoleSufficient(role, feature.requiredRole)) {
          accessibleFeatures.push(feature);
        }
      }
    }
    
    return accessibleFeatures;
  }
  
  /**
   * Check if a user role is sufficient to access a feature
   * Private helper method for role-based access control
   */
  private isRoleSufficient(userRole: UserRole, requiredRole: UserRole): boolean {
    // Role hierarchy: ADMIN > COACH > REFEREE > PLAYER
    if (userRole === UserRole.ADMIN) return true;
    if (userRole === UserRole.COACH && requiredRole !== UserRole.ADMIN) return true;
    if (userRole === UserRole.REFEREE && requiredRole === UserRole.REFEREE) return true;
    if (userRole === UserRole.PLAYER && requiredRole === UserRole.PLAYER) return true;
    
    return false;
  }
  
  /**
   * Get all features organized by category
   * @returns The complete features catalog
   */
  public getAllFeatures(): FeatureCategory[] {
    return platformFeatures;
  }
}

// Export singleton instance for use across the application
export const knowledgeBase = new SageKnowledgeBase();

// Export utility functions for direct import in routes
export const searchFeatures = (keywords: string[]) => knowledgeBase.findFeaturesByKeywords(keywords);
export const getFeatureById = (id: string) => knowledgeBase.findFeatureById(id);