import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

// Use the User type directly from shared schema

// Define auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

// Define login data type
type LoginData = {
  username: string;
  password: string;
};

// Define register data type
type RegisterData = {
  username: string;
  email: string;
  password: string;
  displayName: string;
  firstName: string;   // Add required firstName field
  lastName: string;    // Add required lastName field
  yearOfBirth?: number | null;
  location?: string | null;
  playingSince?: string | null;
  skillLevel?: string | null;
};

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Query for current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/current-user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/current-user");
        if (res.status === 401) {
          return null;
        }
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error fetching current user:", err);
        return null;
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login attempt with credentials:", credentials);
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      console.log("Login response status:", res.status);
      console.log("Login response headers:", 
        Array.from(res.headers.entries()).reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, string>)
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Login error response:", errorData);
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await res.json();
      console.log("Login success response:", data);
      return data;
    },
    onSuccess: (data: User) => {
      console.log("Login mutation success, setting user data");
      queryClient.setQueryData(["/api/auth/current-user"], data);
      
      // Force a refetch of the current user to ensure the session is properly established
      queryClient.invalidateQueries({queryKey: ["/api/auth/current-user"]});
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Could not log you in. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return await res.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(["/api/auth/current-user"], data);
      toast({
        title: "Registration successful",
        description: `Welcome to Pickle+, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation - Enhanced with direct cookie clearing for more reliability
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Attempting logout...");
      try {
        // First try the server-side logout
        const response = await apiRequest("POST", "/api/auth/logout");
        console.log("Logout API response:", response.status);
        
        // Also manually clear cookies to ensure session is destroyed
        // This is a direct solution that works even if the server response fails
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        console.log("Cookies cleared");
        
        // Return the response
        return response;
      } catch (error) {
        console.error("Logout error:", error);
        
        // Even if server-side logout fails, still clear cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        console.log("Cookies cleared despite error");
        
        // Re-throw for error handling
        throw error;
      }
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.setQueryData(["/api/auth/current-user"], null);
      queryClient.invalidateQueries();
      
      // Add a small delay to ensure state updates properly
      setTimeout(() => {
        window.location.href = '/auth'; // Direct redirect to auth page
      }, 300);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      // Even on error, clear local state
      queryClient.setQueryData(["/api/auth/current-user"], null);
      
      // Force reload the page to reset the application state
      setTimeout(() => {
        window.location.href = '/auth';
      }, 300);
      
      toast({
        title: "Logout issue",
        description: "You have been logged out, but there was an issue with the server.",
        variant: "default",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}