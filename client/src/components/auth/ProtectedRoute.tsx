/**
 * PKL-278651-AUTH-0003-ROUTE
 * Enhanced Protected Route Component
 * 
 * A central component for protecting routes based on authentication status
 * with improved role management and redirect handling.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React, { useEffect } from 'react';
import { Route, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  requiredRole?: string;
  exact?: boolean;
  redirectPath?: string;
}

export function ProtectedRoute({
  component: Component,
  path,
  requiredRole,
  exact = false,
  redirectPath = '/auth',
  ...rest
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole } = useAuth();
  
  // If we're on a protected route, save it for post-login redirect
  useEffect(() => {
    if (!user && !isLoading) {
      authService.saveRedirectUrl(path);
    }
  }, [path, user, isLoading]);

  return (
    <Route path={path} {...rest}>
      {() => {
        // Loading state
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          );
        }

        // Not authenticated
        if (!user) {
          return <Redirect to={redirectPath} />;
        }

        // Role check if a role is required
        if (requiredRole && !hasRole(requiredRole)) {
          // User is authenticated but doesn't have the required role
          return (
            <div className="container mx-auto p-6 mt-10">
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground rounded-md p-4">
                <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                <p>You don't have permission to access this page.</p>
              </div>
            </div>
          );
        }

        // Authentication passed, render the protected component
        return <Component {...rest} />;
      }}
    </Route>
  );
}

export default ProtectedRoute;