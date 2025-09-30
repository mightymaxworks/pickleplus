/**
 * PKL-278651-PERF-0001.2-SPLIT
 * Code Splitting Utilities
 * 
 * This file provides utilities for implementing code splitting using React.lazy()
 * with appropriate loading states and error handling.
 */

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

// Gaming-style loading component
const GamingLoader = () => (
  <div className="flex flex-col items-center justify-center space-y-8">
    {/* Hexagonal loader */}
    <div className="relative w-32 h-32">
      {/* Outer rotating hexagons */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3 - i * 0.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.2
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
              fill="none"
              stroke={i === 0 ? '#f97316' : i === 1 ? '#ec4899' : '#a855f7'}
              strokeWidth="2"
              opacity={0.8 - i * 0.2}
            />
          </svg>
        </motion.div>
      ))}
      
      {/* Center pulsing core */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 blur-sm" />
      </motion.div>
      
      {/* Glowing particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-4px',
            marginTop: '-4px'
          }}
          animate={{
            x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
            y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
    
    {/* Loading text with glitch effect */}
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-2xl font-bold text-white mb-2 tracking-wider">
        <span className="inline-block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-transparent bg-clip-text">
          LOADING
        </span>
      </h3>
      
      {/* Animated progress dots */}
      <div className="flex items-center justify-center space-x-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15
            }}
          />
        ))}
      </div>
    </motion.div>
    
    {/* Status bar */}
    <div className="w-64">
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <motion.p
        className="text-xs text-gray-400 text-center mt-3"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Preparing your experience...
      </motion.p>
    </div>
  </div>
);

// Loading fallback component shown during lazy loading
export const LazyLoadingFallback = () => (
  <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
    {/* Animated grid pattern background */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(#ea580c 1px, transparent 1px), linear-gradient(90deg, #ea580c 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />
    </div>
    
    {/* Radial glow effects */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
    
    <div className="relative z-10">
      <GamingLoader />
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