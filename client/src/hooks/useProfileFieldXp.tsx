/**
 * PKL-278651-PROF-0023-HOOK - Profile Field XP Hook
 * 
 * Custom hook for managing and tracking profile field completion XP rewards.
 * Implements the frontend-first approach for calculating and displaying XP rewards.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedUser } from '@/types/enhanced-user';
import { 
  recordProfileFieldCompletion, 
  calculateProfileCompletionPercentage 
} from '@/services/DataCalculationService';
import XpToast from '@/components/gamification/XpToast';

interface UseProfileFieldXpParams {
  user: EnhancedUser;
  onXpAwarded?: (amount: number) => void;
}

interface UseProfileFieldXpReturn {
  trackFieldCompletion: (fieldName: string, value: any, previousValue: any) => Promise<void>;
  isProcessingXp: boolean;
  completionPercentage: number;
}

/**
 * Hook for tracking profile field completion and awarding XP
 */
export function useProfileFieldXp({ 
  user, 
  onXpAwarded 
}: UseProfileFieldXpParams): UseProfileFieldXpReturn {
  const { toast } = useToast();
  const [isProcessingXp, setIsProcessingXp] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(() => {
    return user ? calculateProfileCompletionPercentage(user) : 0;
  });
  const [previousPercentage, setPreviousPercentage] = useState(completionPercentage);
  
  // Update completion percentage when user data changes
  useEffect(() => {
    if (user) {
      const newPercentage = calculateProfileCompletionPercentage(user);
      if (newPercentage !== completionPercentage) {
        setPreviousPercentage(completionPercentage);
        setCompletionPercentage(newPercentage);
      }
    }
  }, [user, completionPercentage]);
  
  // Track field completion and award XP if needed
  const trackFieldCompletion = useCallback(async (
    fieldName: string, 
    value: any, 
    previousValue: any
  ) => {
    // Only process if we have a user and value has changed from empty to non-empty
    if (!user || !user.id) return;
    
    // Check if this is the first time completing this field (changed from empty to non-empty)
    const isFirstTimeCompletion = (
      (previousValue === null || previousValue === undefined || previousValue === '') &&
      (value !== null && value !== undefined && value !== '')
    );
    
    // Only process first-time completions
    if (!isFirstTimeCompletion) return;
    
    try {
      setIsProcessingXp(true);
      
      // Calculate completion percentage after this change
      const updatedUser = { ...user, [fieldName]: value };
      const updatedPercentage = calculateProfileCompletionPercentage(updatedUser);
      
      // Record the completion and potentially award XP
      const result = await recordProfileFieldCompletion(
        user.id,
        fieldName,
        isFirstTimeCompletion,
        updatedPercentage,
        completionPercentage
      );
      
      // Show toast notification if XP was awarded
      if (result.success && result.xpAwarded > 0) {
        toast({
          title: "Profile Updated",
          description: <XpToast amount={result.xpAwarded} message={result.message} />,
          duration: 5000,
        });
        
        // Notify parent component of XP award
        if (onXpAwarded) {
          onXpAwarded(result.xpAwarded);
        }
      }
    } catch (error) {
      console.error(`[ProfileFieldXp] Error processing field completion for ${fieldName}:`, error);
    } finally {
      setIsProcessingXp(false);
    }
  }, [user, completionPercentage, toast, onXpAwarded]);
  
  return {
    trackFieldCompletion,
    isProcessingXp,
    completionPercentage
  };
}