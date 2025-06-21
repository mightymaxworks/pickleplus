/**
 * PKL-278651-PERF-0001.2-SPLIT
 * Lazy-loaded components for code splitting
 * 
 * This file contains lazy-loaded component imports for the major routes.
 * Components are grouped based on functionality for optimal code splitting.
 */

import { lazyLoad } from '@/utils/lazyLoad';

// Public pages
export const LazyLandingPage = lazyLoad(() => import('./pages/EnhancedPassportLandingPage'));
export const LazyAuthPage = lazyLoad(() => import('./pages/auth-page'));
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
// LazyOnboardingPage removed - onboarding system disabled

// Event related pages
// Using modernized components for PicklePass™ UI Enhancement (PKL-278651-CONN-0008-UX-MOD)
export const LazyEventDiscoveryPage = lazyLoad(() => 
  import('./pages/events/ModernEventComponents').then(
    module => ({ default: module.ModernEventDiscoveryPage })
  )
);
export const LazyMyEventsPage = lazyLoad(() => 
  import('./pages/events/ModernEventComponents').then(
    module => ({ default: module.ModernMyEventsPage })
  )
);

// Admin related pages
export const LazyAdminDashboardPage = lazyLoad(() => import('./pages/AdminDashboardPage'));
export const LazyPrizeDrawingPage = lazyLoad(() => import('./pages/admin/PrizeDrawingPage'));
export const LazyGoldenTicketAdmin = lazyLoad(() => import('./pages/admin/GoldenTicketAdmin'));
export const LazyPassportVerificationPage = lazyLoad(() => import('./pages/admin/PassportVerificationPage'));
export const LazyReportsPage = lazyLoad(() => import('./pages/admin/ReportsPage'));
export const LazySettingsPage = lazyLoad(() => import('./pages/admin/SettingsPage'));
export const LazyMobileTestPage = lazyLoad(() => import('./pages/admin/MobileTestPage'));
export const LazyBugReportDashboard = lazyLoad(() => import('./modules/admin/components/feedback/BugReportDashboard'));
export const LazyBouncePage = lazyLoad(() => import('./pages/admin/BouncePage')); // PKL-278651-BOUNCE-0001-CORE
export const LazyBounceFindingsPage = lazyLoad(() => import('./pages/admin/BounceFindingsPage')); // PKL-278651-BOUNCE-0006-ADMIN
export const LazyUserDetailsPage = lazyLoad(() => import('./pages/admin/UserDetailsPage')); // PKL-278651-ADMIN-0015-USER
export const LazyUsersPage = lazyLoad(() => import('./pages/admin/UsersPage')); // PKL-278651-ADMIN-0015-USER

// Miscellaneous pages
export const LazyNotFoundPage = lazyLoad(() => import('./pages/not-found'));
export const LazyDashboardPage = lazyLoad(() => import('./pages/Dashboard'));
export const LazyModernDashboardPage = lazyLoad(() => import('./pages/ModernDashboard'));

// CourtIQ detailed analysis page (PKL-278651-COURTIQ-0005-DETAIL)
export const LazyCourtIQDetailedAnalysisPage = lazyLoad(() => import('./pages/CourtIQDetailedAnalysisPage'));

// Passport page (PKL-278651-CONN-0008-UX-MOD2)
export const LazyPassportPage = lazyLoad(() => import('./pages/PassportPage'));

// S.A.G.E. Coaching System (PKL-278651-COACH-0001-CORE)
export const LazySageCoachingPage = lazyLoad(() => import('./pages/SageCoachingPage'));

// Coach Management System (PKL-278651-COACH-001)
export const LazyCoachApplicationPage = lazyLoad(() => import('./pages/coach/apply'));

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
  LazyBouncePage.preload(); // PKL-278651-BOUNCE-0001-CORE
  LazyUserDetailsPage.preload(); // PKL-278651-ADMIN-0015-USER
  LazyUsersPage.preload(); // PKL-278651-ADMIN-0015-USER
};