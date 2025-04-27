/**
 * PKL-278651-PROF-0008-DEV - Development Mode Profile Hook
 * 
 * This hook provides access to the development profile endpoints
 * for testing and debugging profile features without authentication.
 * 
 * DO NOT USE IN PRODUCTION!
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { EnhancedUser } from '@/types/enhanced-user';

/**
 * Hook for development profile data access
 */
export function useDevProfile() {
  const { toast } = useToast();

  // Query for user profile data from development endpoint
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError
  } = useQuery({
    queryKey: ['/api/dev/me'],
    queryFn: async () => {
      console.log('[DEV] Fetching profile data from development endpoint');
      try {
        const res = await apiRequest('GET', '/api/dev/me');
        console.log('[DEV] Profile data API response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('[DEV] Profile data fetch error:', errorText);
          throw new Error(`Failed to fetch profile data: ${res.status} ${errorText}`);
        }
        
        const profileData = await res.json();
        console.log('[DEV] Profile data loaded successfully:', profileData);
        return profileData as EnhancedUser;
      } catch (err) {
        console.error('[DEV] Profile data fetch exception:', err);
        throw err;
      }
    }
  });

  // Mutation for updating profile fields using development endpoint
  const updateProfileMutation = useMutation({
    mutationFn: async (updateData: Record<string, any>) => {
      console.log('[DEV] Updating profile fields:', updateData);
      
      try {
        const response = await apiRequest(
          'PATCH',
          '/api/dev/profile/update',
          updateData
        );
        
        console.log('[DEV] Profile update response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[DEV] Profile update error:', errorText);
          throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('[DEV] Profile update result:', result);
        return result;
      } catch (err) {
        console.error('[DEV] Profile update exception:', err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log('[DEV] Profile update succeeded:', data);
      // Invalidate user data query to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/dev/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated in development mode.",
      });
    },
    onError: (error: Error) => {
      console.error('[DEV] Profile update mutation error:', error);
      toast({
        title: "Update failed",
        description: `There was an error updating your profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Function to update profile
  const updateProfile = (updateData: Record<string, any>) => {
    updateProfileMutation.mutate(updateData);
  };

  return {
    profile,
    isLoadingProfile,
    profileError,
    updateProfile,
    isUpdatingProfile: updateProfileMutation.isPending
  };
}