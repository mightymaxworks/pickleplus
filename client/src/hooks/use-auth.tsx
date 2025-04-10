/**
 * PKL-278651-AUTH-0002-HOOK
 * Auth hook for managing user authentication state
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define user type
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role?: string;
  avatarUrl?: string;
  passportCode?: string;
  profileCompletionPct?: number;
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
  login: (email: string, password: string) => Promise<void>;
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
  });
  
  const isAuthenticated = !!user;
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      // Refetch user data
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };
  
  // Register function
  const register = async (data: RegisterData) => {
    try {
      setError(null);
      const response = await apiRequest('POST', '/api/auth/register', data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      // Refetch user data
      await refetch();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      // Refetch to update state (should return null/unauthenticated)
      await refetch();
      
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    }
  };
  
  // Reset error when user changes
  useEffect(() => {
    setError(null);
  }, [user]);
  
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
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