/**
 * PKL-278651-AUTH-0001-CORE
 * Authentication Service
 * 
 * A centralized service to handle all authentication-related operations
 * following Framework 5.3 principles of simplicity and reliability.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastModified 2025-04-24
 */

import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { UserRole, hasRequiredRole } from '@/lib/roles';
import { UserWithRole, hasRoleInfo, ensureUserHasRole } from '@shared/user-types';

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
  firstName?: string;
  lastName?: string;
  yearOfBirth?: number;
  location?: string;
  playingSince?: string;
  skillLevel?: string;
}

// Constants
const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  CURRENT_USER: '/api/auth/current-user',
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
      console.log('[AuthService] Login attempt with credentials:', { 
        username: credentials.username, 
        hasPassword: !!credentials.password,
        rememberMe: credentials.rememberMe 
      });
      
      const response = await apiRequest('POST', AUTH_ENDPOINTS.LOGIN, credentials);
      
      console.log('[AuthService] Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[AuthService] Login failed:', errorData);
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }
      
      const user = await response.json();
      console.log('[AuthService] Login successful:', { username: user.username, id: user.id });
      return user;
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      throw error;
    }
  }

  /**
   * Registers a new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      console.log('AuthService: Received credentials:', {
        ...credentials,
        password: '[REDACTED]',
        confirmPassword: '[REDACTED]',
        passwordsMatch: credentials.password === credentials.confirmPassword
      });
      
      // Validation - only check if confirmPassword is provided
      if (credentials.confirmPassword && credentials.password !== credentials.confirmPassword) {
        console.error('AuthService: Password mismatch detected');
        throw new Error('Passwords do not match');
      }
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = credentials;
      
      console.log('AuthService: Sending registration data:', {
        ...registerData,
        password: '[REDACTED]'
      });
      
      const response = await apiRequest('POST', AUTH_ENDPOINTS.REGISTER, registerData);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AuthService: Registration failed with status:', response.status, errorData);
        throw new Error(errorData.message || 'Registration failed. Please try again.');
      }
      
      const user = await response.json();
      console.log('AuthService: Registration successful:', user);
      return user;
    } catch (error) {
      console.error('AuthService: Registration error:', error);
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
   * Gets the current user with role information
   * @returns User with role information or null if not authenticated
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
      
      // Enhance the user with role information
      if (user && !hasRoleInfo(user)) {
        return ensureUserHasRole(user);
      }
      
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      // Don't throw here - return null to indicate not authenticated
      return null;
    }
  }

  /**
   * Checks if a user has a specific role
   * @param user The user to check
   * @param role The required role as a string (player, coach, admin)
   * @returns boolean indicating if the user has the required permissions
   */
  hasRole(user: User | null, role: string): boolean {
    if (!user) return false;
    
    const userWithRole = hasRoleInfo(user) 
      ? user as UserWithRole 
      : ensureUserHasRole(user);
    
    let requiredRole: UserRole;
    
    // Map string role to enum
    switch (role.toLowerCase()) {
      case 'admin':
        requiredRole = UserRole.ADMIN;
        break;
      case 'coach':
        requiredRole = UserRole.COACH;
        break;
      case 'player':
      default:
        requiredRole = UserRole.PLAYER;
    }
    
    return hasRequiredRole(userWithRole.role, requiredRole);
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