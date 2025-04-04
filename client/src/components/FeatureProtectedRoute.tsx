import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureFlag } from '@/lib/featureFlags';
import ComingSoonPage from '@/pages/ComingSoonPage';
import { Loader2 } from 'lucide-react';
import { MainLayout } from './MainLayout';

interface FeatureProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  featureFlag: string;
}

export function FeatureProtectedRoute({
  path,
  component: Component,
  featureFlag
}: FeatureProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;
  const isFeatureEnabled = useFeatureFlag(featureFlag);
  
  // If still loading auth, show loading spinner
  if (authLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // If feature is not enabled, show coming soon page
  if (!isFeatureEnabled) {
    return (
      <Route path={path}>
        <MainLayout>
          <ComingSoonPage />
        </MainLayout>
      </Route>
    );
  }
  
  // If authenticated and feature is enabled, show the component
  return (
    <Route path={path}>
      <MainLayout>
        <Component />
      </MainLayout>
    </Route>
  );
}