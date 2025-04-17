/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * useUser Hook
 * 
 * A custom hook to fetch and manage the current user data.
 */
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// User type definition
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  role?: string;
  isAdmin?: boolean;
  passportId?: string;
  ratings?: {
    dupr?: number;
    utpr?: number;
    wpr?: number;
  };
}

/**
 * Custom hook to fetch and manage the current authenticated user.
 */
export const useUser = () => {
  return useQuery({
    queryKey: ['/api/auth/current-user'],
    queryFn: async () => {
      const response = await apiRequest('/api/auth/current-user');
      return response as User;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
  });
};