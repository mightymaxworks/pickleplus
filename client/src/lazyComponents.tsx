/**
 * PKL-278651-PERF-0001.2-SPLIT
 * Lazy-loaded components for code splitting
 * 
 * This file contains lazy-loaded component imports for the major routes.
 * Components are grouped based on functionality for optimal code splitting.
 */

import { lazyLoad } from '@/utils/lazyLoad';

// Public pages
export const LazyLandingPage = lazyLoad(() => import('./pages/EnhancedLandingPage'));
export const LazyAuthPage = lazyLoad(() => import('./pages/EnhancedAuthPage'));
export const LazyAboutUsPage = lazyLoad(() => import('./pages/AboutUs'));

// Profile related pages
export const LazyProfilePage = lazyLoad(() => import('./pages/StreamlinedProfilePage'));
export const LazyProfileEditPage = lazyLoad(() => import('./pages/ProfileEdit'));

// Match related pages
export const LazyMatchesPage = lazyLoad(() => import('./pages/modernized-match-page'));
export const LazyRecordMatchPage = lazyLoad(() => import('./pages/record-match-page'));

// Tournament related pages
export const LazyTournamentDiscoveryPage = lazyLoad(() => import('./pages/TournamentDiscoveryPage'));
export const LazyTournamentManagementPage = lazyLoad(() => 
  import('./core/modules/tournament/pages/TournamentManagementPage').then(
    module => ({ default: module.TournamentManagementPage })
  )
);

export const LazyTournamentDetailsPage = lazyLoad(() => 
  import('./core/modules/tournament/pages/TournamentDetailsPage').then(
    module => ({ default: module.TournamentDetailsPage })
  )
);

export const LazyBracketDetailsPage = lazyLoad(() => 
  import('./core/modules/tournament/pages/BracketDetailsPage').then(
    module => ({ default: module.BracketDetailsPage })
  )
);

// Community pages
export const LazyLeaderboardPage = lazyLoad(() => 
  import('./pages/LeaderboardPage').then(
    module => ({ default: module.LeaderboardPage })
  )
);
export const LazyMasteryPathsPage = lazyLoad(() => import('./pages/MasteryPathsPage'));

// Event related pages
export const LazyEventDiscoveryPage = lazyLoad(() => import('./pages/events/EventDiscoveryPage'));
export const LazyMyEventsPage = lazyLoad(() => import('./pages/events/MyEventsPage'));

// Admin related pages
export const LazyAdminDashboardPage = lazyLoad(() => import('./pages/AdminDashboardPage'));
export const LazyPrizeDrawingPage = lazyLoad(() => import('./pages/admin/PrizeDrawingPage'));
export const LazyGoldenTicketAdmin = lazyLoad(() => import('./pages/admin/GoldenTicketAdmin'));
export const LazyPassportVerificationPage = lazyLoad(() => import('./pages/admin/PassportVerificationPage'));
export const LazyReportsPage = lazyLoad(() => import('./pages/admin/ReportsPage'));
export const LazySettingsPage = lazyLoad(() => import('./pages/admin/SettingsPage'));
export const LazyMobileTestPage = lazyLoad(() => import('./pages/admin/MobileTestPage'));

// Miscellaneous pages
export const LazyNotFoundPage = lazyLoad(() => import('./pages/not-found'));
export const LazyDashboardPage = lazyLoad(() => import('./pages/Dashboard'));

// Preloading functions by route group
export const preloadProfilePages = () => {
  LazyProfilePage.preload();
  LazyProfileEditPage.preload();
};

export const preloadMatchPages = () => {
  LazyMatchesPage.preload();
  LazyRecordMatchPage.preload();
};

export const preloadTournamentPages = () => {
  LazyTournamentDiscoveryPage.preload();
};

export const preloadEventPages = () => {
  LazyEventDiscoveryPage.preload();
  LazyMyEventsPage.preload();
};

export const preloadAdminPages = () => {
  LazyAdminDashboardPage.preload();
  LazyReportsPage.preload();
};