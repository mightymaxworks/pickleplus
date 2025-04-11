import { Fragment, useEffect } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'

// Import admin module initialization
import '@/modules/admin/init'
import EnhancedLandingPage from './pages/EnhancedLandingPage'
import EnhancedAuthPage from './pages/EnhancedAuthPage'
import TestAuthPage from './pages/TestAuthPage'
import TestRoutingPage from './pages/TestRoutingPage'
import Dashboard from './pages/Dashboard'
import RecordMatchPage from './pages/record-match-page'
import MatchesPage from './pages/matches-page'
import ModernizedMatchPage from './pages/modernized-match-page'
import MatchRewardDemo from './pages/match-reward-demo'
import EnhancedProfile from './pages/EnhancedProfile'
import EnhancedProfilePage from './pages/EnhancedProfilePage'
import ContextualEnhancedProfile from './pages/ContextualEnhancedProfile'
import ProfileEdit from './pages/ProfileEdit'
import StreamlinedProfilePage from './pages/StreamlinedProfilePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import LandingPageTest from './pages/LandingPageTest'
import MasteryPathsPage from './pages/MasteryPathsPage'
import TournamentDiscoveryPage from './pages/TournamentDiscoveryPage'
import AboutUs from './pages/AboutUs'
import PrizeDrawingPage from './pages/admin/PrizeDrawingPage'
import GoldenTicketAdmin from './pages/admin/GoldenTicketAdmin'
import PassportVerificationPage from './pages/admin/PassportVerificationPage'
import MobileTestPage from './pages/admin/MobileTestPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import QRTestPage from './pages/dev/QRTestPage'
import EventTestPage from './pages/events/EventTestPage'
import NotFound from './pages/not-found'

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
          <Switch>
            {/* Public Routes */}
            <Route path="/" component={EnhancedLandingPage} />
            <Route path="/login" component={EnhancedAuthPage} />
            <Route path="/register" component={EnhancedAuthPage} />
            <Route path="/auth" component={EnhancedAuthPage} />
            <Route path="/about" component={AboutUs} />
            <Route path="/test-routing" component={TestRoutingPage} />
            <Route path="/landing-test" component={LandingPageTest} />
            
            {/* Protected Routes */}
            <Route path="/dashboard">
              {(params) => <ProtectedRoute component={Dashboard} path="/dashboard" />}
            </Route>
            <Route path="/matches">
              {(params) => <ProtectedRoute component={ModernizedMatchPage} path="/matches" />}
            </Route>
            <Route path="/tournaments">
              {(params) => <ProtectedRoute component={TournamentDiscoveryPage} path="/tournaments" />}
            </Route>
            <Route path="/training">
              {(params) => <ProtectedRoute component={Dashboard} path="/training" />}
            </Route>
            <Route path="/community">
              {(params) => <ProtectedRoute component={Dashboard} path="/community" />}
            </Route>
            <Route path="/passport">
              {(params) => <ProtectedRoute component={Dashboard} path="/passport" />}
            </Route>
            {/* Main profile route now points to StreamlinedProfilePage */}
            <Route path="/profile">
              {(params) => <ProtectedRoute component={StreamlinedProfilePage} path="/profile" />}
            </Route>
            {/* Legacy profile routes kept for backward compatibility */}
            <Route path="/profile/enhanced">
              {(params) => <ProtectedRoute component={EnhancedProfilePage} path="/profile/enhanced" />}
            </Route>
            <Route path="/profile/contextual">
              {(params) => <ProtectedRoute component={ContextualEnhancedProfile} path="/profile/contextual" />}
            </Route>
            <Route path="/profile/edit">
              {(params) => <ProtectedRoute component={ProfileEdit} path="/profile/edit" />}
            </Route>
            <Route path="/profile/streamlined">
              {(params) => <ProtectedRoute component={StreamlinedProfilePage} path="/profile/streamlined" />}
            </Route>
            <Route path="/record-match">
              {(params) => <ProtectedRoute component={RecordMatchPage} path="/record-match" />}
            </Route>
            <Route path="/admin">
              {(params) => (
                <AdminProtectedRoute>
                  <AdminDashboardPage />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/admin/prize-drawing">
              {(params) => (
                <AdminProtectedRoute>
                  <PrizeDrawingPage />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/admin/golden-ticket">
              {(params) => (
                <AdminProtectedRoute>
                  <GoldenTicketAdmin />
                </AdminProtectedRoute>
              )}
            </Route>
            <Route path="/admin/passport-verification">
              {(params) => (
                <AdminProtectedRoute>
                  <PassportVerificationPage />
                </AdminProtectedRoute>
              )}
            </Route>
            
            {/* Mobile Optimization Test Page (PKL-278651-ADMIN-0009-MOBILE) */}
            <Route path="/admin/mobile-test">
              {(params) => (
                <AdminProtectedRoute>
                  <MobileTestPage />
                </AdminProtectedRoute>
              )}
            </Route>
            
            {/* Leaderboard Route */}
            <Route path="/leaderboard">
              {(params) => <ProtectedRoute component={LeaderboardPage} path="/leaderboard" />}
            </Route>
            
            {/* Mastery Paths Route */}
            <Route path="/mastery-paths">
              {(params) => <ProtectedRoute component={MasteryPathsPage} path="/mastery-paths" />}
            </Route>
            
            {/* For now we'll keep the Match Reward Demo accessible */}
            <Route path="/demo/match-reward" component={MatchRewardDemo} />
            
            {/* QR Code Development Test Page (PKL-278651-CONN-0002-QR) */}
            <Route path="/dev/qr-test" component={QRTestPage} />
            
            {/* Event Check-in System Test Page (PKL-278651-CONN-0003-EVENT) */}
            <Route path="/events/test">
              {(params) => <ProtectedRoute component={EventTestPage} path="/events/test" />}
            </Route>
            
            {/* 404 Route */}
            <Route component={NotFound} />
          </Switch>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </Fragment>
  )
}