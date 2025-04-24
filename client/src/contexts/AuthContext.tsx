/**
 * PKL-278651-AUTH-0002-CONTEXT - Enhanced Authentication Context
 * 
 * This context provides centralized authentication state management 
 * and functions for all components.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import authService, { 
  LoginCredentials, 
  RegisterData 
} from "@/services/authService";
import { User } from "@shared/schema";

// Context type definition
export interface AuthContextType {
  // State
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  
  // Functions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<Error | null>(null);

  // Fetch current user data with react-query
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/current-user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/current-user", {
          credentials: "include",
        });
        
        // If not authenticated, don't throw an error, just return null
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        return response.json();
      } catch (err) {
        console.error("Error fetching user data:", err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await authService.login(credentials);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: () => {
      refetchUser();
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "default",
      });
      
      // Clear any previous errors
      setLastError(null);
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      
      setLastError(error);
      
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const result = await authService.register(data);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: () => {
      refetchUser();
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
        variant: "default",
      });
      
      // Clear any previous errors
      setLastError(null);
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      
      setLastError(error);
      
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      // Force navigation to auth page
      window.location.replace('/auth');
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      
      toast({
        title: "Logout issue",
        description: "There was an issue during logout, but you've been logged out locally.",
        variant: "default",
      });
      
      // Even on error, redirect to auth page
      window.location.replace('/auth');
    },
  });

  // Public methods exposed through context
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync(credentials);
      return true;
    } catch (error) {
      // Error is handled by mutation
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      await registerMutation.mutateAsync(data);
      return true;
    } catch (error) {
      // Error is handled by mutation
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const refreshUser = async (): Promise<void> => {
    await refetchUser();
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  // Monitor session status
  useEffect(() => {
    const checkSessionStatus = () => {
      // If we were previously authenticated but no longer are, handle it
      if (user === null && sessionStorage.getItem('wasAuthenticated') === 'true') {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        
        // Clear the flag
        sessionStorage.removeItem('wasAuthenticated');
        
        // Redirect to login
        window.location.replace('/auth');
      }
      
      // Set flag if authenticated
      if (user !== null) {
        sessionStorage.setItem('wasAuthenticated', 'true');
      }
    };
    
    checkSessionStatus();
  }, [user, toast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error: lastError || error || null,
        login,
        register,
        logout,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}