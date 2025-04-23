/**
 * PKL-278651-AUTH-0001-TIMEOUT
 * Session Timeout Handler Component
 * 
 * This component provides comprehensive session timeout handling by:
 * 1. Monitoring user activity and performing auto-logout on inactivity
 * 2. Intercepting 401 responses and providing proper redirection
 * 3. Displaying user-friendly messages on session expiration
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Session timeout configuration
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 1 * 60 * 1000; // 1 minute before timeout
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

export function SessionTimeoutHandler() {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showingWarning, setShowingWarning] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logoutMutation } = useAuth();
  
  // Update last activity timestamp on user interaction
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowingWarning(false);
    };
    
    // Track user activity
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);
  
  // Check for inactivity and show warning/perform logout
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      // Show warning before timeout
      if (!showingWarning && inactiveTime > SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT) {
        setShowingWarning(true);
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire due to inactivity. Do you want to stay logged in?",
          action: (
            <button 
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs"
              onClick={() => setLastActivity(Date.now())}
            >
              Stay Logged In
            </button>
          ),
          variant: "warning",
          duration: 60000,
        });
      }
      
      // Perform logout on timeout
      if (inactiveTime > SESSION_TIMEOUT) {
        handleSessionTimeout("Your session has expired due to inactivity.");
        clearInterval(interval);
      }
    }, ACTIVITY_CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [lastActivity, showingWarning, toast]);
  
  // Intercept API 401 errors
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      if (response.status === 401 && location[0] !== '/auth') {
        // Only handle 401s outside of auth page
        handleSessionTimeout("Your session has expired. Please log in again.");
      }
      
      return response;
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, [location]);
  
  // Session timeout handler
  const handleSessionTimeout = (message: string) => {
    // Display user-friendly message
    toast({
      title: "Session Expired",
      description: message,
      variant: "warning",
      duration: 5000,
    });
    
    // Clear auth state
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        // Redirect to login with return path
        navigate("/auth", {
          state: {
            returnTo: location[0],
            sessionExpired: true,
          }
        });
      }
    });
  };
  
  return null; // This is a background component with no UI
}

/**
 * Hook this component into your App.tsx file like this:
 * 
 * function App() {
 *   return (
 *     <>
 *       <SessionTimeoutHandler />
 *       <Router />
 *     </>
 *   );
 * }
 */