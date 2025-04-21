import { Fragment, useEffect, Suspense } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { TournamentChangeProvider } from './core/modules/tournament/context/TournamentChangeContext'
import { UserDataProvider } from '@/contexts/UserDataContext' // PKL-278651-PERF-0001.1-CACHE
import { TutorialProvider } from '@/components/onboarding' // PKL-278651-GAME-0002-TUT
import { CommunityProvider } from '@/lib/providers/CommunityProvider' // PKL-278651-COMM-0014-CONT
import { LazyLoadingFallback, lazyLoad } from '@/utils/lazyLoad' // PKL-278651-PERF-0001.2-SPLIT
import { moduleRegistry } from '@/core/modules/moduleRegistry' // For feedback module
import { SimpleBugReportButton } from '@/components/bug-report/BugReportButton' // Simplified bug report button
import { ProtectedRouteWithLayout } from './lib/protected-route-with-layout' // PKL-278651-UI-0001-STDROUTE
import { BounceMascot } from '@/components/mascot' // PKL-278651-MASCOT-0001-CORE


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
  LazyBouncePage, // PKL-278651-BOUNCE-0001-CORE
  LazyUserDetailsPage, // PKL-278651-ADMIN-0015-USER
  LazyUsersPage, // PKL-278651-ADMIN-0015-USER
  LazyNotFoundPage,
  LazyDashboardPage,
  LazyPassportPage, // PKL-278651-CONN-0008-UX-MOD2
  preloadProfilePages,
  preloadMatchPages,
  preloadTournamentPages,
  preloadEventPages,
  preloadAdminPages
} from './lazyComponents'

// Import community pages (PKL-278651-COMM-0006-HUB-UI)
import CommunitiesPage from './pages/communities'
import CommunityDetailPage from './pages/communities/[id]'
import CreateCommunityPage from './pages/communities/create'
import CommunityEventDetailPage from './pages/CommunityEventDetailPage' // PKL-278651-COMM-0016-RSVP
import CommunityDiscoveryPage from './pages/community-discover' // PKL-278651-COMM-0022-DISC
import CommunityEngagementPage from './pages/community/CommunityEngagementPage' // PKL-278651-COMM-0021-ENGAGE

// Import notification pages (PKL-278651-COMM-0028-NOTIF)
import NotificationsPage from './pages/notifications-page'
import NotificationPreferencesPage from './pages/NotificationPreferencesPage'

// Import custom test login page to help with loading issues
import TestLoginPage from './pages/test-login-page'

// Import icons test page (PKL-278651-COMM-0007-ICONS)
import IconsPage from './pages/icons'

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
import FixedTwitterDashboard from './pages/FixedTwitterDashboard' // PKL-278651-COMM-0004-DASH-TWITTER
import UnifiedActivityDashboard from './pages/UnifiedActivityDashboard' // PKL-278651-COMM-0005-DASH-UNIFIED
import SimpleUnifiedDashboard from './pages/SimpleUnifiedDashboard' // PKL-278651-COMM-0005-DASH-SIMPLE
import XpDashboardPage from './pages/xp-dashboard' // PKL-278651-XP-0002-UI

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
                <CommunityProvider>
                  <Suspense fallback={<LazyLoadingFallback />}>
                    {/* Add Simplified Bug Report Button (PKL-278651-FEED-0001-BUG) */}
                    <SimpleBugReportButton position="bottom-right" />
                    
                    {/* Add Bounce Mascot (PKL-278651-MASCOT-0001-CORE) */}
                    <BounceMascot customImagePath="/custom-bounce-mascot.png" />
                    
                    {/* Community navigation commented out for now */}
                    
                    <Switch>
                    {/* Public Routes */}
                  <Route path="/" component={LazyLandingPage} />
                  <Route path="/login" component={LazyAuthPage} />
                  <Route path="/register" component={Register} />
                  <Route path="/auth" component={LazyAuthPage} />
                  <Route path="/about" component={LazyAboutUsPage} />
                  <Route path="/test-routing" component={TestRoutingPage} />
                  <Route path="/landing-test" component={LandingPageTest} />
                  <Route path="/test-login" component={TestLoginPage} />
                
                  {/* Protected Routes - Now using StandardLayout */}
                  <ProtectedRouteWithLayout 
                    path="/dashboard" 
                    component={LazyDashboardPage} 
                    pageTitle="Dashboard"
                  />
                  <ProtectedRouteWithLayout 
                    path="/matches" 
                    component={LazyMatchesPage} 
                    pageTitle="Your Matches"
                  />
                  <ProtectedRouteWithLayout 
                    path="/tournaments" 
                    component={LazyTournamentDiscoveryPage} 
                    pageTitle="Tournaments"
                  />
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
                  {/* Redirect old /community route to /communities */}
                  <Route path="/community">
                    {() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/communities';
                      }
                      return null;
                    }}
                  </Route>
                  <Route path="/passport">
                    {(params) => <ProtectedRoute component={LazyPassportPage} path="/passport" />}
                  </Route>
                  <ProtectedRouteWithLayout
                    path="/profile"
                    component={LazyProfilePage}
                    pageTitle="Your Profile"
                  />
                  <ProtectedRouteWithLayout
                    path="/profile/enhanced"
                    component={EnhancedProfilePage}
                    pageTitle="Enhanced Profile"
                  />
                  <ProtectedRouteWithLayout
                    path="/profile/contextual"
                    component={ContextualEnhancedProfile}
                    pageTitle="Contextual Profile"
                  />
                  <ProtectedRouteWithLayout
                    path="/profile/edit"
                    component={LazyProfileEditPage}
                    pageTitle="Edit Profile"
                  />
                  <ProtectedRouteWithLayout
                    path="/profile/streamlined"
                    component={LazyProfilePage}
                    pageTitle="Streamlined Profile"
                  />
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
                  {/* PKL-278651-BOUNCE-0001-CORE: Bounce Testing System Route */}
                  <Route path="/admin/bounce">
                    {(params) => (
                      <AdminProtectedRoute>
                        <LazyBouncePage />
                      </AdminProtectedRoute>
                    )}
                  </Route>
                  <Route path="/settings">
                    {(params) => <ProtectedRoute component={SettingsPage} path="/settings" />}
                  </Route>
                  <ProtectedRouteWithLayout
                    path="/leaderboard"
                    component={LazyLeaderboardPage}
                    pageTitle="Leaderboard"
                  />
                  <ProtectedRouteWithLayout
                    path="/mastery-paths"
                    component={LazyMasteryPathsPage}
                    pageTitle="Mastery Paths"
                  />
                  
                  {/* PKL-278651-COMM-0028-NOTIF - Notifications Page */}
                  <ProtectedRouteWithLayout
                    path="/notifications"
                    component={NotificationsPage}
                    pageTitle="Notifications"
                  />
                  <ProtectedRouteWithLayout
                    path="/notifications/preferences"
                    component={NotificationPreferencesPage}
                    pageTitle="Notification Preferences"
                  />
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
                  
                  {/* PKL-278651-COMM-0004-DASH-TWITTER - Twitter/X-Inspired Dashboard Route */}
                  <Route path="/test/twitter-style" component={FixedTwitterDashboard} />
                  
                  {/* PKL-278651-XP-0002-UI - XP System Dashboard */}
                  <Route path="/xp-dashboard">
                    {(params) => <ProtectedRoute component={XpDashboardPage} path="/xp-dashboard" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0005-DASH-UNIFIED - Unified Activity-Centric Dashboard Route */}
                  <Route path="/test/unified-activity" component={UnifiedActivityDashboard} />
                  
                  {/* PKL-278651-COMM-0005-DASH-SIMPLE - Simple Unified Activity-Centric Dashboard Route */}
                  <Route path="/test/simple-unified" component={SimpleUnifiedDashboard} />
                  
                  {/* PKL-278651-COMM-0006-HUB - Community Hub Implementation */}
                  <Route path="/communities/create">
                    {(params) => <ProtectedRoute component={CreateCommunityPage} path="/communities/create" />}
                  </Route>
                  <Route path="/communities/:id">
                    {(params) => <ProtectedRoute component={CommunityDetailPage} path="/communities/:id" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0021-ENGAGE - Community Engagement Page */}
                  <Route path="/communities/:communityId/engagement">
                    {(params) => <ProtectedRoute component={CommunityEngagementPage} path="/communities/:communityId/engagement" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0016-RSVP - Community Event Detail Page with RSVP */}
                  <Route path="/communities/:communityId/events/:eventId">
                    {(params) => <ProtectedRoute component={CommunityEventDetailPage} path="/communities/:communityId/events/:eventId" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0036-MEDIA - Community Media Management */}
                  <Route path="/communities/:communityId/media">
                    {(params) => {
                      const MediaManagementPage = lazyLoad(() => import('./pages/community/MediaManagementPage'));
                      return <ProtectedRoute component={MediaManagementPage} path="/communities/:communityId/media" />;
                    }}
                  </Route>
                  
                  <ProtectedRouteWithLayout 
                    path="/communities" 
                    component={CommunitiesPage} 
                    pageTitle="Communities"
                  />
                  
                  {/* PKL-278651-COMM-0022-DISC - Enhanced Community Discovery */}
                  <Route path="/communities/discover">
                    {(params) => <ProtectedRoute component={CommunityDiscoveryPage} path="/communities/discover" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0011-OSI - NodeBB Community Hub v2 */}
                  <Route path="/community/v2">
                    {(params) => <ProtectedRoute component={(props) => {
                      const CommunityHubV2 = lazyLoad(() => import('./pages/community/v2'));
                      return <CommunityHubV2 {...props} />;
                    }} path="/community/v2" />}
                  </Route>
                  
                  {/* PKL-278651-COMM-0007-ICONS - Custom Icons Showcase */}
                  <ProtectedRouteWithLayout
                    path="/icons"
                    component={IconsPage}
                    pageTitle="Icons"
                  />
                  
                  {/* Test Login Page for easier testing */}
                  <Route path="/test-login">
                    {(params) => <TestLoginPage />}
                  </Route>
                  
                  <Route component={LazyNotFoundPage} />
                </Switch>
                  </Suspense>
                </CommunityProvider>
              </TutorialProvider>
            </TournamentChangeProvider>
          </UserDataProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </div>
  )
}