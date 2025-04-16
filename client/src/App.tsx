import { Fragment, useEffect, Suspense } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { TournamentChangeProvider } from './core/modules/tournament/context/TournamentChangeContext'
import { UserDataProvider } from '@/contexts/UserDataContext' // PKL-278651-PERF-0001.1-CACHE
import { TutorialProvider } from '@/components/onboarding' // PKL-278651-GAME-0002-TUT
import { LazyLoadingFallback, lazyLoad } from '@/utils/lazyLoad' // PKL-278651-PERF-0001.2-SPLIT
import { moduleRegistry } from '@/core/modules/moduleRegistry' // For feedback module
import { SimpleBugReportButton } from '@/components/bug-report/BugReportButton' // Simplified bug report button

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
  LazyBugReportDashboard,
  LazyUserDetailsPage, // PKL-278651-ADMIN-0015-USER
  LazyUsersPage, // PKL-278651-ADMIN-0015-USER
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
import PlayerSearchTestPage from './pages/PlayerSearchTestPage'
import MatchRewardDemo from './pages/match-reward-demo'
import EnhancedProfile from './pages/EnhancedProfile'
import EnhancedProfilePage from './pages/EnhancedProfilePage'
import ContextualEnhancedProfile from './pages/ContextualEnhancedProfile'
import LandingPageTest from './pages/LandingPageTest'
import QRTestPage from './pages/dev/QRTestPage'
import EventTestPage from './pages/events/EventTestPage'
import CommunityPage from './pages/CommunityPage'
import SettingsPage from './pages/SettingsPage'
import SearchTestPage from './pages/SearchTest'
import Register from './pages/Register'
import TestCommunityPage from './pages/TestCommunityPage' // PKL-278651-COMM-0001-UIMOCK
import CommunityDashboardMockup from './pages/CommunityDashboardMockup' // PKL-278651-COMM-0002-DASH-MOCK
import ModernCommunityDashboard from './pages/ModernCommunityDashboard' // PKL-278651-COMM-0003-DASH-MODERN

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
  
  // Import bug report button directly
  const { BugReportButton } = moduleRegistry.hasModule('feedback') 
    ? moduleRegistry.getModule('feedback').exports 
    : { BugReportButton: null };

  // Use this for debugging
  useEffect(() => {
    console.log("Feedback module loaded:", moduleRegistry.hasModule('feedback'));
    if (moduleRegistry.hasModule('feedback')) {
      console.log("Feedback module exports:", Object.keys(moduleRegistry.getModule('feedback').exports));
    }
  }, []);

  return (
    <div className="app-container">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserDataProvider>
            <TournamentChangeProvider>
              <TutorialProvider>
                <Suspense fallback={<LazyLoadingFallback />}>
                  {/* Add Simplified Bug Report Button (PKL-278651-FEED-0001-BUG) */}
                  <SimpleBugReportButton position="bottom-right" />
                  
                  <Switch>
                    {/* Public Routes */}
                  <Route path="/" component={LazyLandingPage} />
                  <Route path="/login" component={LazyAuthPage} />
                  <Route path="/register" component={Register} />
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
                  <Route path="/tournaments">
                    {(params) => <ProtectedRoute component={LazyTournamentDiscoveryPage} path="/tournaments" />}
                  </Route>
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
                    {(params) => <ProtectedRoute component={CommunityPage} path="/community" />}
                  </Route>
                  <Route path="/passport">
                    {(params) => <ProtectedRoute component={LazyDashboardPage} path="/passport" />}
                  </Route>
                  <Route path="/profile">
                    {(params) => <ProtectedRoute component={LazyProfilePage} path="/profile" />}
                  </Route>
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
                  <Route path="/admin/mobile-test">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyMobileTestPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/reports">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyReportsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/reporting">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyReportsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  {/* PKL-278651-ADMIN-0015-USER - User Management Routes */}
                  <Route path="/admin/users/:id/edit">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyUserDetailsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/users/:id">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyUserDetailsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/users">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyUsersPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/settings">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazySettingsPage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/admin/bug-reports">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyBugReportDashboard />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/settings">
                    {(params) => <ProtectedRoute component={SettingsPage} path="/settings" />}
                  </Route>
                  <Route path="/leaderboard">
                    {(params) => <ProtectedRoute component={LazyLeaderboardPage} path="/leaderboard" />}
                  </Route>
                  <Route path="/mastery-paths">
                    {(params) => <ProtectedRoute component={LazyMasteryPathsPage} path="/mastery-paths" />}
                  </Route>
                  <Route path="/demo/match-reward" component={MatchRewardDemo} />
                  <Route path="/dev/qr-test" component={QRTestPage} />
                  <Route path="/events">
                    {(params) => <ProtectedRoute component={LazyEventDiscoveryPage} path="/events" />}
                  </Route>
                  <Route path="/events/my">
                    {(params) => <ProtectedRoute component={LazyMyEventsPage} path="/events/my" />}
                  </Route>
                  <Route path="/events/test">
                    {(params) => <ProtectedRoute component={EventTestPage} path="/events/test" />}
                  </Route>
                  <Route path="/search-test">
                    {(params) => <ProtectedRoute component={SearchTestPage} path="/search-test" />}
                  </Route>
                  <Route path="/player-search-test">
                    {(params) => <ProtectedRoute component={PlayerSearchTestPage} path="/player-search-test" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0001-UIMOCK - Community Module UI Test Route */}
                  <Route path="/test/community" component={TestCommunityPage} />
                  
                  {/* PKL-278651-COMM-0002-DASH-MOCK - Community Dashboard Mockup Route */}
                  <Route path="/test/community-dashboard" component={CommunityDashboardMockup} />
                  
                  {/* PKL-278651-COMM-0003-DASH-MODERN - Modern Social Media Inspired Dashboard Route */}
                  <Route path="/test/modern-community" component={ModernCommunityDashboard} />
                  
                  <Route component={LazyNotFoundPage} />
                </Switch>
              </Suspense>
              </TutorialProvider>
            </TournamentChangeProvider>
          </UserDataProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </div>
  )
}