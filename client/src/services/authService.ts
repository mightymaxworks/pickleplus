/**
 * PKL-278651-AUTH-0001-SERVICE - Centralized Authentication Service
 * 
 * This service centralizes all authentication-related functions to provide
 * a consistent interface for login, logout, and session management.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

// Type definitions
export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  yearOfBirth?: number | null;
  location?: string | null;
  playingSince?: string | null;
  skillLevel?: string | null;
};

// AuthResult interface for better error handling
export interface AuthResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Centralized authentication service that handles all auth-related operations
 */
const authService = {
  /**
   * Check if a user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!queryClient.getQueryData(["/api/auth/current-user"]);
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return queryClient.getQueryData<User>(["/api/auth/current-user"]) || null;
  },

  /**
   * Log in a user with username/email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult<User>> {
    try {
      // Clear any previous logout flags
      sessionStorage.removeItem('just_logged_out');
      
      const response = await apiRequest("POST", "/api/login", credentials);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Login failed. Please check your credentials.",
          code: "AUTH_INVALID_CREDENTIALS"
        };
      }
      
      const user = await response.json();
      
      // Update the auth state in React Query
      queryClient.setQueryData(["/api/auth/current-user"], user);
      
      return { success: true, data: user };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        code: "AUTH_UNKNOWN_ERROR"
      };
    }
  },

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResult<User>> {
    try {
      const response = await apiRequest("POST", "/api/register", userData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Registration failed. Please try again.",
          code: errorData.code || "AUTH_REGISTRATION_FAILED" 
        };
      }
      
      const user = await response.json();
      
      // Update the auth state in React Query
      queryClient.setQueryData(["/api/auth/current-user"], user);
      
      return { success: true, data: user };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        code: "AUTH_UNKNOWN_ERROR"
      };
    }
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<AuthResult<void>> {
    try {
      // 1. Set flag to prevent redirect loops
      sessionStorage.setItem('just_logged_out', 'true');
      console.log("[AuthService] Set logout flag to prevent redirect loops");
      
      // 2. Call the logout API endpoint
      const response = await apiRequest("POST", "/api/logout");
      
      // 3. Clear all client-side state regardless of API response
      this.clearAuthState();
      
      if (!response.ok) {
        console.warn("[AuthService] Logout API returned error, but client state was cleared");
        return {
          success: true,
          error: "Warning: Server logout failed, but you've been logged out locally.",
          code: "AUTH_PARTIAL_LOGOUT"
        };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("[AuthService] Logout error:", error);
      
      // Even on error, clear client state
      this.clearAuthState();
      
      return {
        success: true,
        error: "Warning: Server logout failed, but you've been logged out locally.",
        code: "AUTH_PARTIAL_LOGOUT"
      };
    }
  },

  /**
   * Clear all authentication state on the client
   */
  clearAuthState(): void {
    // 1. Clear React Query cache
    queryClient.setQueryData(["/api/auth/current-user"], null);
    queryClient.invalidateQueries({queryKey: ["/api/auth/current-user"]});
    
    // 2. Clear any JWT or auth tokens from localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    
    // 3. Clear cookies (best effort approach)
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log("[AuthService] All auth state cleared");
  },

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    
    if (!user) return false;
    
    // Handle admin role specially
    if (role === 'admin') return !!user.isAdmin;
    
    // For future role implementations
    return false;
  },

  /**
   * Refresh the current user's data
   */
  async refreshUserData(): Promise<User | null> {
    try {
      queryClient.invalidateQueries({queryKey: ["/api/auth/current-user"]});
      const data = await queryClient.fetchQuery({
        queryKey: ["/api/auth/current-user"],
        queryFn: async () => {
          const response = await fetch('/api/auth/current-user', {
            credentials: 'include'
          });
          if (!response.ok) return null;
          return response.json();
        }
      });
      
      return data;
    } catch (error) {
      console.error("[AuthService] Error refreshing user data:", error);
      return null;
    }
  }
};

export default authService;