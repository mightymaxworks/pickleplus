/**
 * PKL-278651-AUTH-0001-CORE
 * Authentication Service
 * 
 * A centralized service to handle all authentication-related operations
 * following Framework 5.3 principles of simplicity and reliability.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

// Define the types for login and registration
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// Constants
const AUTH_ENDPOINTS = {
  LOGIN: '/api/login',
  REGISTER: '/api/register',
  LOGOUT: '/api/logout',
  CURRENT_USER: '/api/user',
};

// Storage keys
const STORAGE_KEYS = {
  REDIRECT_AFTER_LOGIN: 'pickle_redirect_after_login',
};

/**
 * The AuthService class that handles all authentication operations
 */
export class AuthService {
  /**
   * Attempts to log in a user with the given credentials
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiRequest('POST', AUTH_ENDPOINTS.LOGIN, credentials);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }
      
      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Registers a new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // Validation
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = credentials;
      
      const response = await apiRequest('POST', AUTH_ENDPOINTS.REGISTER, registerData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed. Please try again.');
      }
      
      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logs out the current user
   */
  async logout(): Promise<void> {
    try {
      const response = await apiRequest('POST', AUTH_ENDPOINTS.LOGOUT);
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Gets the current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiRequest('GET', AUTH_ENDPOINTS.CURRENT_USER);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          return null;
        }
        throw new Error('Failed to get current user');
      }
      
      const user = await response.json();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      // Don't throw here - return null to indicate not authenticated
      return null;
    }
  }

  /**
   * Checks if a user has a specific role
   */
  hasRole(user: User | null, role: string): boolean {
    if (!user) return false;
    
    // For admin role check
    if (role === 'admin') {
      return user.isAdmin === true;
    }
    
    // For other roles, can be expanded in the future
    return false;
  }

  /**
   * Saves a redirect URL to use after login
   */
  saveRedirectUrl(url: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN, url);
    }
  }

  /**
   * Gets the saved redirect URL and clears it from storage
   */
  getAndClearRedirectUrl(): string | null {
    if (typeof window !== 'undefined') {
      const url = localStorage.getItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN);
      localStorage.removeItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN);
      return url;
    }
    return null;
  }
}

// Create a singleton instance
export const authService = new AuthService();

export default authService;