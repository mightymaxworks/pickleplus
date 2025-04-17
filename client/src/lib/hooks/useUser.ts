/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * User Hook for Community Module
 * 
 * This hook provides access to the currently authenticated user data.
 */
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export const useUser = () => {
  return useQuery({
    queryKey: ['/api/auth/current-user'],
    queryFn: async () => {
      const response = await apiRequest('/api/auth/current-user');
      return response as User;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};