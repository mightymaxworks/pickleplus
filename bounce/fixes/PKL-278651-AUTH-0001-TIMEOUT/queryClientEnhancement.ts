/**
 * PKL-278651-AUTH-0001-TIMEOUT
 * Query Client Enhancement for Session Timeout
 * 
 * This file provides enhancements to the API client to handle session timeouts:
 * 1. API request interceptor that detects 401 responses
 * 2. Integration with authentication workflow
 * 3. Propagation of error information for improved UX
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

/**
 * Session timeout interceptor for apiRequest
 * Integrate this into your queryClient.ts file's apiRequest function
 */
export function createAuthenticatedRequest(queryClient: QueryClient, navigate: Function) {
  return async function apiRequest(
    method: string,
    url: string, 
    data?: any, 
    options?: RequestInit
  ): Promise<Response> {
    // Merge custom options with defaults
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      ...options,
    };

    // Add request body for non-GET requests
    if (method !== 'GET' && data) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestOptions);

      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        // Clear user data from query cache
        queryClient.setQueryData(['/api/user'], null);
        
        // Show toast notification
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "warning",
        });
        
        // Get current path for redirect after login
        const currentPath = window.location.pathname;
        
        // Redirect to auth page with returnTo information
        setTimeout(() => {
          navigate('/auth', { 
            state: { 
              returnTo: currentPath,
              sessionExpired: true 
            } 
          });
        }, 100);
        
        throw new Error('Session expired');
      }
      
      // Return the response for further processing
      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };
}

/**
 * Enhanced error handler for auth-related errors
 * Use this in your QueryClient setup
 */
export const authErrorHandler = {
  onError: (error: any) => {
    // Check for auth-related errors
    if (
      error.message === 'Session expired' || 
      error.status === 401 || 
      error.statusCode === 401
    ) {
      // These errors are already handled by the interceptor
      // No need for additional error toasts
      return;
    }
    
    // Handle other errors as usual...
    toast({
      title: "An error occurred",
      description: error.message || "Something went wrong",
      variant: "destructive",
    });
  }
};

/**
 * Integration guide:
 * 
 * In your queryClient.ts file:
 * 
 * // Import the enhanced request creator
 * import { createAuthenticatedRequest, authErrorHandler } from './authEnhancements';
 * 
 * // Create the query client with auth error handling
 * export const queryClient = new QueryClient({
 *   defaultOptions: {
 *     queries: {
 *       ...authErrorHandler,
 *       // other options...
 *     },
 *     mutations: {
 *       ...authErrorHandler,
 *       // other options...
 *     }
 *   }
 * });
 * 
 * // Create the API request function using the navigate function from your router
 * export const apiRequest = createAuthenticatedRequest(queryClient, navigate);
 */