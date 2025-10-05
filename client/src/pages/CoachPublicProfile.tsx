import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { InlineEditableProfile } from '@/components/coach/InlineEditableProfile';
import type { CoachPublicProfileWithRelations } from '@/shared/schema/coach-public-profiles';

const CoachPublicProfile = () => {
  const { slug } = useParams();
  const { user: currentUser } = useAuth();

  console.log('[CoachProfile] Component rendering with slug:', slug);
  console.log('[CoachProfile] Current user:', currentUser?.id);

  // Query coach profile data
  const { data: coach, isLoading, error } = useQuery<CoachPublicProfileWithRelations>({
    queryKey: ['/api/coach-public-profiles', slug],
    queryFn: async () => {
      console.log('[CoachProfile] Fetching profile for slug:', slug);
      const response = await fetch(`/api/coach-public-profiles/${slug}`, {
        credentials: 'include'
      });
      console.log('[CoachProfile] Response status:', response.status);
      if (!response.ok) throw new Error('Coach profile not found');
      const data = await response.json();
      console.log('[CoachProfile] Profile data received:', data);
      return data as CoachPublicProfileWithRelations;
    },
    enabled: !!slug
  });

  // Log any errors or loading states
  console.log('[CoachProfile] Query state:', { isLoading, error, hasData: !!coach, slug });
  console.log('[CoachProfile] About to render. isLoading:', isLoading, 'coach:', !!coach);

  if (error) {
    console.error('[CoachProfile] Error loading profile:', error);
  }

  if (isLoading) {
    console.log('[CoachProfile] Rendering loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin">
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="#f97316"
                strokeWidth="8"
              />
            </svg>
          </div>
          <p>Loading coach profile for {slug}...</p>
          {error && <p className="text-red-500 mt-2">Error: {String(error)}</p>}
        </div>
      </div>
    );
  }

  if (!coach) {
    console.log('[CoachProfile] Rendering not found state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Coach Not Found</h2>
          <Button onClick={() => window.location.href = '/coaches'}>
            Back to Coach Directory
          </Button>
        </div>
      </div>
    );
  }

  console.log('[CoachProfile] Rendering main profile content for:', coach.displayName);
  
  // Check if current user owns this profile
  const isOwner = currentUser && coach && currentUser.id === coach.userId;
  console.log('[CoachProfile] Ownership check:', { currentUserId: currentUser?.id, coachUserId: coach?.userId, isOwner });
  
  // Use the new inline editing component for better UX
  return (
    <InlineEditableProfile 
      profile={coach} 
      isOwner={!!isOwner}
    />
  );
};

export default CoachPublicProfile;