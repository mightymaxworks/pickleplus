import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface ProfileCompletionStatus {
  needsCompletion: boolean;
  missingFields: string[];
  currentProfile: {
    firstName?: string | null;
    lastName?: string | null;
    username: string;
    email?: string | null;
  };
}

export function useProfileCompletion() {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [hasUserDismissed, setHasUserDismissed] = useState(false);

  const { data: completionStatus, isLoading, refetch } = useQuery<ProfileCompletionStatus>({
    queryKey: ['/api/user/profile-completion-status'],
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show modal if profile needs completion and user hasn't dismissed it
  // TEMP FIX: Disable automatic modal showing to avoid confusion with password reset
  useEffect(() => {
    if (completionStatus?.needsCompletion && !hasUserDismissed) {
      // DISABLED: Add a small delay to avoid showing immediately on page load
      // const timer = setTimeout(() => {
      //   setShouldShowModal(true);
      // }, 2000);
      // return () => clearTimeout(timer);
      
      // Profile completion is now optional - user can access via profile settings
      console.log('[ProfileCompletion] Profile needs completion but modal disabled to avoid confusion');
    }
  }, [completionStatus?.needsCompletion, hasUserDismissed]);

  const handleModalClose = () => {
    setShouldShowModal(false);
    setHasUserDismissed(true);
  };

  const handleProfileComplete = () => {
    setShouldShowModal(false);
    setHasUserDismissed(true);
    refetch(); // Refresh the completion status
  };

  return {
    completionStatus,
    isLoading,
    shouldShowModal,
    handleModalClose,
    handleProfileComplete,
    refetch
  };
}