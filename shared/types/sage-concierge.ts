/**
 * PKL-278651-SAGE-0013-CONCIERGE
 * SAGE Concierge Types
 * 
 * Type definitions for the SAGE Concierge feature that provides platform
 * navigation and recommendations.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { z } from 'zod';
import { DimensionCode } from '@shared/schema/sage';

/**
 * A feature category in the platform
 */
export interface FeatureCategory {
  id: string;
  name: string;
  description: string;
  features: PlatformFeature[];
}

/**
 * A platform feature that can be discovered and navigated to
 */
export interface PlatformFeature {
  id: string;
  name: string;
  description: string;
  path: string;
  relatedDimensions: DimensionCode[];
  keywords?: string[];
  primaryAction?: string;
  roleRequired?: string;
  categoryId?: string;
  categoryName?: string;
}

/**
 * Type of recommendation
 */
export type RecommendationType = 'drill' | 'tournament' | 'training_plan' | 'match' | 'community';

/**
 * A personalized recommendation for a user
 */
export interface Recommendation {
  id: number;
  type: RecommendationType;
  title: string;
  description: string;
  path: string;
  dimension?: DimensionCode;
  difficulty?: number;
  relevanceScore: number;
  imageUrl?: string;
}

/**
 * Navigation intent types
 */
export type NavigationIntentType = 'drill' | 'tournament' | 'profile' | 'training' | 
  'community' | 'match' | 'feature' | 'help' | 'unknown';

/**
 * Parameters for navigation intents
 */
export interface NavigationIntentParams {
  skillLevel?: string;
  dimension?: string;
  timeframe?: string;
  section?: string;
  duration?: string;
  activity?: string;
  matchType?: string;
  featureId?: string;
}

/**
 * Navigation intent with parameters and context
 */
export interface NavigationIntent {
  type: NavigationIntentType;
  params?: NavigationIntentParams;
  rawMessage?: string;
}

/**
 * Navigation action types
 */
export type NavigationActionType = 'navigate' | 'response';

/**
 * Navigation types
 */
export type NavigationType = 'path' | 'url' | 'action';

/**
 * Response types for navigation service
 */
export type SimulatedResponseType = 'clarification' | 'general' | 'error' | 'not_found' | 'help';

/**
 * A navigation action resulting from processing a user's intent
 */
export type NavigationAction = 
  | {
      type: 'navigate';
      navigationType: NavigationType;
      path: string;
      message?: string;
    }
  | {
      type: 'response';
      responseType: SimulatedResponseType;
      message: string;
    };

/**
 * Schema for navigation request validation
 */
export const navigationRequestSchema = z.object({
  message: z.string().min(1, "Message is required")
});

/**
 * Schema for tracking data validation
 */
export const trackingDataSchema = z.object({
  messageContent: z.string(),
  navigationType: z.string(),
  navigationTarget: z.string(),
  dimension: z.string().optional(),
  isCompleted: z.boolean().default(false)
});

/**
 * Schema for inserting concierge interaction
 */
export const insertConciergeInteractionSchema = z.object({
  userId: z.number(),
  messageContent: z.string(),
  navigationType: z.string(),
  navigationTarget: z.string(),
  dimension: z.string().optional(),
  isCompleted: z.boolean().default(false)
});