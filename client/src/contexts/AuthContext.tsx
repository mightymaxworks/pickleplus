/**
 * PKL-278651-AUTH-0002-CONTEXT
 * Authentication Context with Role Management
 * 
 * A central React context for managing authentication state throughout the application
 * following Framework 5.3 principles of simplicity and frontend-first design.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastModified 2025-04-24
 */

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import authService, { 
  LoginCredentials, 
  RegisterCredentials 
} from '@/services/authService';
import { UserRole } from '@/lib/roles';
import { UserWithRole, hasRoleInfo, ensureUserHasRole } from '@shared/user-types';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  getUserRole: () => UserRole | null;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for the current user when the app starts
  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        console.error('Error loading user:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      
      // Invalidate queries that might depend on auth state
      queryClient.invalidateQueries();
      
      // Toast will be shown by the auth page to avoid duplicates
      
      return loggedInUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed');
      setError(error);
      
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newUser = await authService.register(credentials);
      setUser(newUser);
      
      // Invalidate queries that might depend on auth state
      queryClient.invalidateQueries();
      
      toast({
        title: 'Registration successful',
        description: `Welcome to Pickle+, ${newUser.username}!`,
      });
      
      return newUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Registration failed');
      setError(error);
      
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      
      // Clear cache on logout to prevent stale data
      queryClient.clear();
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Logout failed');
      setError(error);
      
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: error.message,
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Role check function
  const hasRole = (role: string): boolean => {
    return authService.hasRole(user, role);
  };
  
  // Get user role function
  const getUserRole = (): UserRole | null => {
    if (!user) return null;
    
    const userWithRole = hasRoleInfo(user) 
      ? user as UserWithRole 
      : ensureUserHasRole(user);
      
    return userWithRole.role;
  };

  // Create the value object for the provider
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
    getUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;