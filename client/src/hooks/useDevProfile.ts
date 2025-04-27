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

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { EnhancedUser } from "@/types/enhanced-user";

/**
 * Hook for development profile data access
 */
export function useDevProfile() {
  // Query for fetching development profile data
  const { 
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile
  } = useQuery<EnhancedUser>({
    queryKey: ['/api/dev/profile'],
    queryFn: async () => {
      console.log('[DEV MODE] Fetching profile from development endpoint');
      const response = await apiRequest('GET', '/api/dev/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch development profile');
      }
      return response.json();
    }
  });

  // Mutation for updating profile fields
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      console.log('[DEV MODE] Updating profile with:', updates);
      const response = await apiRequest('POST', '/api/dev/profile/update', updates);
      if (!response.ok) {
        throw new Error('Failed to update development profile');
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the profile query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/dev/profile'] });
    }
  });

  return {
    profile,
    isLoadingProfile,
    profileError,
    refetchProfile,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error
  };
}