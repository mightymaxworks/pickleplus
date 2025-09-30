/**
 * PKL-278651-PERF-0001.2-SPLIT
 * Code Splitting Utilities
 * 
 * This file provides utilities for implementing code splitting using React.lazy()
 * with appropriate loading states and error handling.
 */

import React, { Suspense } from 'react';

import MascotLoader from '@/components/ui/MascotLoader';

// Loading fallback component shown during lazy loading
export const LazyLoadingFallback = () => (
  <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
    {/* Animated grid pattern background */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(#ea580c 1px, transparent 1px), linear-gradient(90deg, #ea580c 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
    </div>
    
    <div className="relative z-10">
      <MascotLoader message="Getting things ready..." size="md" />
    </div>
  </div>
);

// Error boundary component for handling lazy loading errors
export class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[LazyErrorBoundary] Error caught:', error);
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-8 rounded-md bg-destructive/10 border border-destructive">
          <h2 className="text-xl font-bold text-destructive mb-4">Something went wrong</h2>
          <p className="mb-4">There was an error loading this component.</p>
          <details className="text-sm mb-4">
            <summary className="cursor-pointer font-medium mb-2">Technical Details</summary>
            <pre className="p-4 bg-background rounded border border-border overflow-auto">
              {this.state.error?.toString() || 'Unknown error'}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for lazy-loading components with error boundary
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> & { preload: () => Promise<any> } {
  const LazyComponent = React.lazy(importFunc);
  
  // Add preload function to component
  const componentWithPreload = LazyComponent as React.LazyExoticComponent<T> & { preload: () => Promise<any> };
  componentWithPreload.preload = importFunc;
  
  return componentWithPreload;
}

// Utility to preload a component
export function preloadComponent(component: { preload: () => Promise<any> }) {
  return component.preload();
}

// Lazy-loaded page components
export const LazyLandingPage = lazyLoad(() => import('../pages/LandingPage'));
export const LazyAuthPage = lazyLoad(() => import('../pages/auth-page'));
export const LazyAboutUsPage = lazyLoad(() => import('../pages/AboutUs'));
export const LazyFeatureShowcasePage = lazyLoad(() => import('../pages/FeatureShowcase'));
export const LazyProfilePage = lazyLoad(() => import('../pages/Profile'));
export const LazyProfileEditPage = lazyLoad(() => import('../pages/ProfileEdit'));
export const LazyMatchesPage = lazyLoad(() => import('../pages/Matches'));
export const LazyMatchHistoryPage = lazyLoad(() => import('../pages/MatchHistoryPage')); // Sprint 1: Foundation
export const LazyRecordMatchPage = lazyLoad(() => import('../pages/record-match-page'));
export const LazyTournamentDiscoveryPage = lazyLoad(() => import('../pages/tournaments/index'));
export const LazyTournamentManagementPage = lazyLoad(() => import('../pages/Tournaments'));
export const LazyTournamentDetailsPage = lazyLoad(() => import('../pages/tournaments/[id]'));
export const LazyBracketDetailsPage = lazyLoad(() => import('../pages/Tournaments'));
export const LazyLeaderboardPage = lazyLoad(() => import('../pages/Leaderboard'));
export const LazyMasteryPathsPage = lazyLoad(() => import('../pages/MasteryPathsPage'));
export const LazyEventDiscoveryPage = lazyLoad(() => import('../pages/events/EventDiscoveryPage'));
export const LazyEventDetailsPage = lazyLoad(() => import('../pages/events/EventDiscoveryPage'));
export const LazyPlayerDevelopmentHubPage = lazyLoad(() => import('../pages/training-center'));
export const LazyTrainingCenterPage = lazyLoad(() => import('../pages/training-center'));
export const LazyDashboardPage = lazyLoad(() => import('../pages/Dashboard'));
export const LazyFeaturesPage = lazyLoad(() => import('../pages/FeatureShowcase'));
export const LazyForgotPasswordPage = lazyLoad(() => import('../pages/ForgotPasswordPage'));
export const LazyResetPasswordPage = lazyLoad(() => import('../pages/ResetPasswordPage'));
// LazyTestPage removed - test-login-page file deleted in cleanup
export const LazyNotFoundPage = lazyLoad(() => import('../pages/not-found'));