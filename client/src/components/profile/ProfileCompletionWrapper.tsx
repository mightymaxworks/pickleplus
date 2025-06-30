import { ProfileCompletionModal } from './ProfileCompletionModal';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

interface ProfileCompletionWrapperProps {
  children: React.ReactNode;
}

export function ProfileCompletionWrapper({ children }: ProfileCompletionWrapperProps) {
  const {
    completionStatus,
    shouldShowModal,
    handleModalClose,
    handleProfileComplete
  } = useProfileCompletion();

  return (
    <>
      {children}
      {completionStatus && shouldShowModal && (
        <ProfileCompletionModal
          isOpen={shouldShowModal}
          onClose={handleModalClose}
          onComplete={handleProfileComplete}
          currentProfile={completionStatus.currentProfile}
          missingFields={completionStatus.missingFields}
        />
      )}
    </>
  );
}