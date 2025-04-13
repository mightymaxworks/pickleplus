import { Fragment, useEffect, Suspense } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { TournamentChangeProvider } from './core/modules/tournament/context/TournamentChangeContext'
import { UserDataProvider } from '@/contexts/UserDataContext' // PKL-278651-PERF-0001.1-CACHE
import { LazyLoadingFallback } from '@/utils/lazyLoad' // PKL-278651-PERF-0001.2-SPLIT

// Import module initializations
import '@/modules/admin/init'
import '@/core/modules/tournament/init'

// Import lazy-loaded components (PKL-278651-PERF-0001.2-SPLIT)
import {
  LazyLandingPage,
  LazyAuthPage,
  LazyAboutUsPage,
  LazyProfilePage,
  LazyProfileEditPage,
  LazyMatchesPage, 
  LazyRecordMatchPage,
  LazyTournamentDiscoveryPage,
  LazyTournamentManagementPage,
  LazyTournamentDetailsPage,
  LazyBracketDetailsPage,
  LazyLeaderboardPage,
  LazyMasteryPathsPage,
  LazyEventDiscoveryPage,
  LazyMyEventsPage,
  LazyAdminDashboardPage,
  LazyPrizeDrawingPage,
  LazyGoldenTicketAdmin,
  LazyPassportVerificationPage,
  LazyReportsPage,
  LazySettingsPage,
  LazyMobileTestPage,
  LazyNotFoundPage,
  LazyDashboardPage,
  preloadProfilePages,
  preloadMatchPages,
  preloadTournamentPages,
  preloadEventPages,
  preloadAdminPages
} from './lazyComponents'

// Keep imports for non-lazy loaded pages
import TestAuthPage from './pages/TestAuthPage'
import TestRoutingPage from './pages/TestRoutingPage'
import MatchRewardDemo from './pages/match-reward-demo'
import EnhancedProfile from './pages/EnhancedProfile'
import EnhancedProfilePage from './pages/EnhancedProfilePage'
import ContextualEnhancedProfile from './pages/ContextualEnhancedProfile'
import LandingPageTest from './pages/LandingPageTest'
import QRTestPage from './pages/dev/QRTestPage'
import EventTestPage from './pages/events/EventTestPage'

import { useAuth } from './hooks/useAuth'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'

// Protected route component
function ProtectedRoute({ 
  component: Component,
  ...rest
}: { 
  component: React.ComponentType<any>;
  path: string;
}) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  if (isLoading) return null;

  if (!user) {
    navigate("/auth");
    return null;
  }
  
  return <Component {...rest} />;
}

export default function App() {
  // Add location hook to debug routing
  const [location] = useLocation();
  
  console.log("Current location:", location);
  
  // Debugging useEffect to log location changes
  useEffect(() => {
    console.log("App.tsx - Location changed to:", location);
  }, [location]);
  
  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserDataProvider> {/* PKL-278651-PERF-0001.1-CACHE */}
            <TournamentChangeProvider>
              <Suspense fallback={<LazyLoadingFallback />}>
                <Switch>
              {/* Public Routes */}
              <Route path="/" component={LazyLandingPage} />
              <Route path="/login" component={LazyAuthPage} />
              <Route path="/register" component={LazyAuthPage} />
              <Route path="/auth" component={LazyAuthPage} />
              <Route path="/about" component={LazyAboutUsPage} />
              <Route path="/test-routing" component={TestRoutingPage} />
              <Route path="/landing-test" component={LandingPageTest} />
            
            {/* Protected Routes */}
            <Route path="/dashboard">
              {(params) => <ProtectedRoute component={LazyDashboardPage} path="/dashboard" />}
            </Route>
            <Route path="/matches">
              {(params) => <ProtectedRoute component={LazyMatchesPage} path="/matches" />}
            </Route>
            {/* Tournament discovery route - available to all users */}
            <Route path="/tournaments">
              {(params) => <ProtectedRoute component={LazyTournamentDiscoveryPage} path="/tournaments" />}
            </Route>

            {/* Admin routes for tournament management - PKL-278651-TOURN-0002-ADMIN */}
            <Route path="/admin/tournaments">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyTournamentManagementPage />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/admin/tournaments/:id">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyTournamentDetailsPage />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/admin/brackets/:id">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyBracketDetailsPage />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/training">
              {(params) => <ProtectedRoute component={LazyDashboardPage} path="/training" />}
            </Route>
            <Route path="/community">
              {(params) => <ProtectedRoute component={LazyDashboardPage} path="/community" />}
            </Route>
            <Route path="/passport">
              {(params) => <ProtectedRoute component={LazyDashboardPage} path="/passport" />}
            </Route>
            {/* Main profile route now points to StreamlinedProfilePage */}
            <Route path="/profile">
              {(params) => <ProtectedRoute component={LazyProfilePage} path="/profile" />}
            </Route>
            {/* Legacy profile routes kept for backward compatibility */}
            <Route path="/profile/enhanced">
              {(params) => <ProtectedRoute component={EnhancedProfilePage} path="/profile/enhanced" />}
            </Route>
            <Route path="/profile/contextual">
              {(params) => <ProtectedRoute component={ContextualEnhancedProfile} path="/profile/contextual" />}
            </Route>
            <Route path="/profile/edit">
              {(params) => <ProtectedRoute component={LazyProfileEditPage} path="/profile/edit" />}
            </Route>
            <Route path="/profile/streamlined">
              {(params) => <ProtectedRoute component={LazyProfilePage} path="/profile/streamlined" />}
            </Route>
            <Route path="/record-match">
              {(params) => <ProtectedRoute component={LazyRecordMatchPage} path="/record-match" />}
            </Route>
            <Route path="/admin">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyAdminDashboardPage />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/admin/prize-drawing">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyPrizeDrawingPage />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/admin/golden-ticket">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyGoldenTicketAdmin />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/admin/passport-verification">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyPassportVerificationPage />
                </AdminProtectedRoute>
              )}
            </Route>
            
            {/* Mobile Optimization Test Page (PKL-278651-ADMIN-0009-MOBILE) */}
            <Route path="/admin/mobile-test">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyMobileTestPage />
                </AdminProtectedRoute>
              )}
            </Route>
            
            {/* Reports Dashboard (PKL-278651-ADMIN-0010-REPORT) */}
            <Route path="/admin/reports">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyReportsPage />
                </AdminProtectedRoute>
              )}
            </Route>
            
            {/* Reports Dashboard (alternate route for nav consistency) */}
            <Route path="/admin/reporting">
              {(params) => (
                <AdminProtectedRoute>
                  <LazyReportsPage />
                </AdminProtectedRoute>
              )}
            </Route>
            
            {/* Admin Settings Page (PKL-278651-ADMIN-0014-UX) */}
            <Route path="/admin/settings">
              {(params) => (
                <AdminProtectedRoute>
                  <LazySettingsPage />
                </AdminProtectedRoute>
              )}
            </Route>
            
            {/* Leaderboard Route */}
            <Route path="/leaderboard">
              {(params) => <ProtectedRoute component={LazyLeaderboardPage} path="/leaderboard" />}
            </Route>
            
            {/* Mastery Paths Route */}
            <Route path="/mastery-paths">
              {(params) => <ProtectedRoute component={LazyMasteryPathsPage} path="/mastery-paths" />}
            </Route>
            
            {/* For now we'll keep the Match Reward Demo accessible */}
            <Route path="/demo/match-reward" component={MatchRewardDemo} />
            
            {/* QR Code Development Test Page (PKL-278651-CONN-0002-QR) */}
            <Route path="/dev/qr-test" component={QRTestPage} />
            
            {/* PKL-278651-CONN-0006-ROUTE - PicklePass™ URL Structure Refinement */}
            {/* Main Events Discovery Page */}
            <Route path="/events">
              {(params) => <ProtectedRoute component={LazyEventDiscoveryPage} path="/events" />}
            </Route>
            
            {/* My Events Page */}
            <Route path="/events/my">
              {(params) => <ProtectedRoute component={LazyMyEventsPage} path="/events/my" />}
            </Route>
            
            {/* Legacy route - redirect handled by EventTestPage */}
            <Route path="/events/test">
              {(params) => <ProtectedRoute component={EventTestPage} path="/events/test" />}
            </Route>
            
            {/* 404 Route */}
            <Route component={LazyNotFoundPage} />
          </Switch>
              </Suspense>
            </TournamentChangeProvider>
          </UserDataProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </Fragment>
  )
}