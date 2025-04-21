/**
 * PKL-278651-UI-0001-STDROUTE
 * Protected Route with Standard Layout
 * 
 * A route component that combines authentication protection with the
 * standard application layout.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React from 'react';
import { Route, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StandardLayout, StandardLayoutProps } from '@/components/layout/StandardLayout';

interface ProtectedRouteWithLayoutProps extends StandardLayoutProps {
  path: string;
  component: React.ComponentType<any>;
  layoutProps?: StandardLayoutProps;
  exact?: boolean;
}

export function ProtectedRouteWithLayout({
  path,
  component: Component,
  layoutProps = {},
  exact = false,
  ...rest
}: ProtectedRouteWithLayoutProps) {
  const { user, isLoading } = useAuth();

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

  // Authenticated - render component with standard layout
  return (
    <Route path={path}>
      <StandardLayout {...layoutProps} {...rest} children={<Component />} />
    </Route>
  );
}