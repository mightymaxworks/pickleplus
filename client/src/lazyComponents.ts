/**
 * Lazy Components for Pickle+
 * 
 * This file contains all lazy-loaded components for the application.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { lazy } from 'react';
import { LazyLoadingFallback, lazyLoad } from '@/utils/lazyLoad';

// Main Pages
export const LazyLandingPage = lazyLoad(() => import('./pages/landing-page'));
export const LazyAuthPage = lazyLoad(() => import('./pages/auth-page'));
export const LazyAboutUsPage = lazyLoad(() => import('./pages/about-page'));
export const LazyDashboardPage = lazyLoad(() => import('./pages/dashboard-page'));
export const LazyNotFoundPage = lazyLoad(() => import('./pages/not-found'));

// User Management
export const LazyProfilePage = lazyLoad(() => import('./pages/profile-page'));
export const LazyProfileEditPage = lazyLoad(() => import('./pages/profile-edit-page'));
export const LazySettingsPage = lazyLoad(() => import('./pages/settings-page'));
export const LazyOnboardingPage = lazyLoad(() => import('./pages/onboarding-page'));

// Matches
export const LazyMatchesPage = lazyLoad(() => import('./pages/matches-page'));
export const LazyRecordMatchPage = lazyLoad(() => import('./pages/record-match-page'));

// Tournaments
export const LazyTournamentDiscoveryPage = lazyLoad(() => import('./pages/tournament-discovery-page'));
export const LazyTournamentManagementPage = lazyLoad(() => import('./pages/tournament-management-page'));
export const LazyTournamentDetailsPage = lazyLoad(() => import('./pages/tournament-details-page'));
export const LazyBracketDetailsPage = lazyLoad(() => import('./pages/bracket-details-page'));

// Leaderboards & Mastery
export const LazyLeaderboardPage = lazyLoad(() => import('./pages/leaderboard-page'));
export const LazyMasteryPathsPage = lazyLoad(() => import('./pages/mastery-paths-page'));
export const LazyCourtIQDetailedAnalysisPage = lazyLoad(() => import('./pages/courtiq-detailed-analysis-page'));

// Events
export const LazyEventDiscoveryPage = lazyLoad(() => import('./pages/event-discovery-page'));
export const LazyMyEventsPage = lazyLoad(() => import('./pages/my-events-page'));
export const LazyPrizeDrawingPage = lazyLoad(() => import('./pages/prize-drawing-page'));
export const LazyGoldenTicketAdmin = lazyLoad(() => import('./pages/admin/GoldenTicketAdmin'));

// Admin
export const LazyAdminDashboardPage = lazyLoad(() => import('./pages/admin-dashboard-page'));
export const LazyPassportVerificationPage = lazyLoad(() => import('./pages/admin/PassportVerificationPage'));
export const LazyReportsPage = lazyLoad(() => import('./pages/admin/reports-page'));
export const LazyMobileTestPage = lazyLoad(() => import('./pages/admin/mobile-test-page'));
export const LazyBugReportDashboard = lazyLoad(() => import('./pages/admin/bug-report-dashboard'));
export const LazyBouncePage = lazyLoad(() => import('./pages/admin/bounce-page'));
export const LazyBounceFindingsPage = lazyLoad(() => import('./pages/admin/bounce-findings-page'));
export const LazyUserDetailsPage = lazyLoad(() => import('./pages/admin/user-details-page'));
export const LazyUsersPage = lazyLoad(() => import('./pages/admin/users-page'));

// Passport
export const LazyPassportPage = lazyLoad(() => import('./pages/passport-page'));

// S.A.G.E Coaching System
export const LazySageCoachingPage = lazyLoad(() => import('./pages/sage-coaching-page'));

// OAuth
export const LazyOAuthDeveloperDashboard = lazyLoad(() => import('./pages/OAuthDeveloperDashboard'));

// Preload groups of pages for better UX
export function preloadProfilePages() {
  LazyProfilePage.preload();
  LazyProfileEditPage.preload();
}

export function preloadMatchPages() {
  LazyMatchesPage.preload();
  LazyRecordMatchPage.preload();
}

export function preloadTournamentPages() {
  LazyTournamentDiscoveryPage.preload();
  LazyTournamentManagementPage.preload();
  LazyTournamentDetailsPage.preload();
  LazyBracketDetailsPage.preload();
}

export function preloadEventPages() {
  LazyEventDiscoveryPage.preload();
  LazyMyEventsPage.preload();
}

export function preloadAdminPages() {
  LazyAdminDashboardPage.preload();
  LazyReportsPage.preload();
  LazyUsersPage.preload();
}