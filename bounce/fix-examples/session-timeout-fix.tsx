/**
 * PKL-278651-AUTHENTICATION-0051-FIX
 * 
 * Fix for session timeout handling issue.
 * This file provides a solution for the session timeout issue identified in the bug report.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Session timeout handler component
 * Add this to App.tsx to enable global session timeout handling
 */
export function SessionTimeoutHandler() {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Set timeout threshold (30 minutes)
  const timeoutThreshold = 30 * 60 * 1000;
  
  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
    };
  }, []);
  
  // Check for inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      if (inactiveTime > timeoutThreshold) {
        handleSessionTimeout();
        clearInterval(interval);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [lastActivity]);
  
  // Intercept API errors
  useEffect(() => {
    // Add this to apiRequest function in queryClient.ts
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      if (response.status === 401) {
        handleSessionTimeout();
      }
      
      return response;
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  
  const handleSessionTimeout = () => {
    // Clear auth state
    queryClient.setQueryData(['/api/user'], null);
    
    // Show friendly message
    toast({
      title: "Session Expired",
      description: "Your session has timed out due to inactivity. Please log in again.",
      variant: "warning",
    });
    
    // Redirect to login
    navigate("/auth", { 
      state: { 
        returnTo: window.location.pathname,
        sessionExpired: true 
      } 
    });
  };
  
  return null;
}

/**
 * Session timeout interceptor for API client
 * Add this to src/lib/queryClient.ts
 */
export function createSessionTimeoutInterceptor(queryClient: any, navigate: any, toast: any) {
  return async (
    url: string,
    config: RequestInit,
    onResponse: (response: Response) => Promise<any>
  ) => {
    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Clear auth state
        queryClient.setQueryData(['/api/user'], null);
        
        // Show friendly message
        toast({
          title: "Session Expired",
          description: "Your session has timed out. Please log in again.",
          variant: "warning",
        });
        
        // Redirect to login
        navigate("/auth", { 
          state: { 
            returnTo: window.location.pathname,
            sessionExpired: true 
          } 
        });
        
        return null;
      }
      
      return onResponse(response);
    } catch (error) {
      throw error;
    }
  };
}