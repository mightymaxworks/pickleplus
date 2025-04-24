/**
 * PKL-278651-UI-0001-STDROUTE
 * Protected Route with Standard Layout
 * 
 * A route component that combines authentication protection with the
 * standard application layout.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastModified 2025-04-24
 */

import React, { useEffect } from 'react';
import { Route, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';
import { StandardLayout, StandardLayoutProps } from '@/components/layout/StandardLayout';

interface ProtectedRouteWithLayoutProps {
  path: string;
  component: React.ComponentType<any>;
  layoutProps?: Omit<StandardLayoutProps, 'children'>;
  exact?: boolean;
  pageTitle?: string;
  hideSearch?: boolean;
  hideNotifications?: boolean;
  customNavItems?: Array<{
    label: string;
    icon: React.ReactNode;
    path: string;
  }>;
  hideMobileNav?: boolean;
  onLogout?: () => void;
  headerProps?: Record<string, any>;
  requiredRole?: string;
}

export function ProtectedRouteWithLayout({
  path,
  component: Component,
  layoutProps = {},
  exact = false,
  requiredRole,
  ...rest
}: ProtectedRouteWithLayoutProps) {
  const { user, isLoading, hasRole } = useAuth();
  
  // Save the path for post-login redirect if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      authService.saveRedirectUrl(path);
    }
  }, [path, user, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Not authenticated - redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // Role check if a role is required
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Route path={path}>
        <div className="container mx-auto p-6 mt-10">
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p>You don't have permission to access this page.</p>
          </div>
        </div>
      </Route>
    );
  }

  // Authenticated - render component with standard layout
  return (
    <Route path={path}>
      <StandardLayout {...layoutProps} {...rest} children={<Component />} />
    </Route>
  );
}