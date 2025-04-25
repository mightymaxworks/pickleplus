/**
 * PKL-278651-SAGE-0010-FEEDBACK - Feedback System Hook
 * 
 * This hook provides functionality for interacting with the feedback system API.
 * 
 * Part of Sprint 5: Social Features & UI Polish
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";

// Type definitions for feedback
export interface FeedbackItem {
  id: number;
  itemType: 'drill' | 'training_plan' | 'sage_conversation' | 'video';
  itemId: number;
  userId: number;
  
  // Ratings
  overallRating: number;
  clarityRating?: number;
  difficultyRating?: number;
  enjoymentRating?: number;
  effectivenessRating?: number;
  
  // Qualitative feedback
  positiveFeedback?: string;
  improvementFeedback?: string;
  specificChallenges?: string;
  suggestions?: string;
  
  // Context data
  userSkillLevel?: string;
  courtIqScores?: Record<string, number>;
  completionStatus?: string;
  attemptCount?: number;
  timeSpent?: number;
  environment?: Record<string, any>;
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  status: 'new' | 'reviewed' | 'implemented' | 'declined';
  reviewedBy?: number;
  reviewedAt?: Date;
  
  // Analysis fields
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  keywords?: string[];
  actionableInsights?: string;
  similarFeedbackIds?: number[];
}

export interface FeedbackSubmission {
  itemType: 'drill' | 'training_plan' | 'sage_conversation' | 'video';
  itemId: number;
  
  // Required ratings
  overallRating: number;
  clarityRating?: number;
  difficultyRating?: number;
  enjoymentRating?: number;
  effectivenessRating?: number;
  
  // At least one of these is required
  positiveFeedback?: string;
  improvementFeedback?: string;
  specificChallenges?: string;
  suggestions?: string;
  
  // Optional context
  userSkillLevel?: string;
  courtIqScores?: Record<string, number>;
  completionStatus?: string;
  attemptCount?: number;
  timeSpent?: number;
  environment?: Record<string, any>;
}

export interface FeedbackAnalytics {
  itemType: string;
  itemId: number;
  averageRatings: {
    overall: number | null;
    clarity: number | null;
    difficulty: number | null;
    enjoyment: number | null;
    effectiveness: number | null;
  };
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  feedbackCount: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
  commonThemes?: Record<string, number>;
  improvementSuggestions?: string[];
  ratingTrend?: Record<string, any>;
  sentimentTrend?: Record<string, any>;
  lastUpdatedAt: Date;
}

export function useFeedback() {
  const { toast } = useToast();
  
  // Get feedback for an item
  const getFeedback = (itemType: string, itemId: number, options = { limit: 20, offset: 0 }) => {
    return useQuery({
      queryKey: ['/api/feedback/item', itemType, itemId, options],
      queryFn: () => apiRequest(
        'GET', 
        `/api/feedback/item/${itemType}/${itemId}?limit=${options.limit}&offset=${options.offset}`
      ).then(res => res.json()),
    });
  };
  
  // Get analytics for an item
  const getAnalytics = (itemType: string, itemId: number) => {
    return useQuery({
      queryKey: ['/api/feedback/analytics', itemType, itemId],
      queryFn: () => apiRequest(
        'GET', 
        `/api/feedback/analytics/${itemType}/${itemId}`
      ).then(res => res.json()),
    });
  };
  
  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (feedback: FeedbackSubmission) => {
      const res = await apiRequest('POST', '/api/feedback', feedback);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! It helps us improve.",
        variant: "default",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/item', data.data.itemType, data.data.itemId] });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/analytics', data.data.itemType, data.data.itemId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  return {
    // Queries
    getFeedback,
    getAnalytics,
    
    // Mutations
    submitFeedback,
  };
}