/**
 * PKL-278651-AUTH-0002-HOOK
 * Auth hook for managing user authentication state
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Define user type with all the properties we need across the app
export interface User {
  id: number;
  username: string;
  email: string | null;
  displayName?: string;
  firstName?: string | null;
  lastName?: string | null;
  location?: string | null; 
  bio?: string | null;
  yearOfBirth?: number | null;
  passportId?: string;
  passportCode?: string;
  level?: number;
  xp?: number;
  avatarUrl?: string;
  avatarInitials?: string;
  lastMatchDate?: string | null;
  totalMatches?: number;
  matchesWon?: number;
  totalTournaments?: number;
  isFoundingMember?: boolean;
  isAdmin?: boolean;
  xpMultiplier?: number;
  profileCompletionPct?: number;
  rankingPoints?: number;
  playingSince?: string | null;
  skillLevel?: string | null;
  height?: number | null;
  reach?: number | null;
  preferredPosition?: string | null;
  paddleBrand?: string | null;
  paddleModel?: string | null;
  createdAt?: string;
}

// Registration data interface
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  yearOfBirth?: number | null;
  location?: string | null;
  playingSince?: string | null;
  skillLevel?: string | null;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [error, setError] = useState<string | null>(null);
  
  // Query the current user
  const { 
    data: user,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['/api/auth/current-user'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 0, // Don't retry if the user is not authenticated
    refetchInterval: false,
  });
  
  const isAuthenticated = !!user;
  
  // Login function
  const login = async (usernameOrEmail: string, password: string) => {
    try {
      setError(null);
      // The server expects 'username' field for login
      const response = await apiRequest('POST', '/api/auth/login', { username: usernameOrEmail, password });
      
      console.log('Making POST request to /api/auth/login with credentials included');
      console.log('POST /api/auth/login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      // Get the user data from the response and manually update cache
      try {
        const userData = await response.json();
        console.log('Login successful - user data:', userData);
        
        // Manually update the cache with the retrieved user data
        queryClient.setQueryData(['/api/auth/current-user'], userData);
        
        // Still refetch to ensure we have latest data
        await refetch();
      } catch (parseError) {
        console.error('Error parsing user data from login response:', parseError);
        // Still refetch even if we couldn't parse the response
        await refetch();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    }
  };
  
  // Register function
  const register = async (data: RegisterData) => {
    try {
      setError(null);
      const response = await apiRequest('POST', '/api/auth/register', data);
      
      console.log('POST /api/auth/register response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      // Try to get the user data from the response
      try {
        const userData = await response.json();
        console.log('Registration successful - user data:', userData);
        
        // Manually update the cache with the retrieved user data
        queryClient.setQueryData(['/api/auth/current-user'], userData);
      } catch (parseError) {
        console.error('Error parsing user data from registration response:', parseError);
      }
      
      // Refetch user data
      await refetch();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
      throw err;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      console.log('Attempting to logout user');
      const response = await apiRequest('POST', '/api/auth/logout', {});
      console.log('POST /api/auth/logout response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      // Clear auth data from cache
      queryClient.setQueryData(['/api/auth/current-user'], null);
      
      // Refetch to update state (should return null/unauthenticated)
      await refetch();
      
      console.log('User logged out successfully');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
    }
  };
  
  // Reset error when user changes
  useEffect(() => {
    setError(null);
  }, [user]);
  
  // Ensure user has the right type - this avoids TypeScript errors
  const typedUser = user as User | null;
  
  return (
    <AuthContext.Provider
      value={{
        user: typedUser,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};