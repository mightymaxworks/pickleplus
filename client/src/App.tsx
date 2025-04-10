import { Fragment, useEffect } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { Layout } from '@/components/layout/Layout'
import EnhancedLandingPage from './pages/EnhancedLandingPage'
import EnhancedAuthPage from './pages/EnhancedAuthPage'
import TestRoutingPage from './pages/TestRoutingPage'
import Dashboard from './pages/Dashboard'
import RecordMatchPage from './pages/record-match-page'
import ModernizedMatchPage from './pages/modernized-match-page'
import MatchRewardDemo from './pages/match-reward-demo'
import EnhancedProfilePage from './pages/EnhancedProfilePage'
import ContextualEnhancedProfile from './pages/ContextualEnhancedProfile'
import ProfileEdit from './pages/ProfileEdit'
import StreamlinedProfilePage from './pages/StreamlinedProfilePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import LandingPageTest from './pages/LandingPageTest'
import MasteryPathsPage from './pages/MasteryPathsPage'
import TournamentDiscoveryPage from './pages/TournamentDiscoveryPage'
import PrizeDrawingPage from './pages/admin/PrizeDrawingPage'
import GoldenTicketAdmin from './pages/admin/GoldenTicketAdmin'
import NotFound from './pages/not-found'

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
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </Fragment>
  )
}

// Component with all routes - This ensures it's inside the AuthProvider context
function AppRoutes() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={EnhancedLandingPage} />
      <Route path="/login" component={EnhancedAuthPage} />
      <Route path="/register" component={EnhancedAuthPage} />
      <Route path="/auth" component={EnhancedAuthPage} />
      <Route path="/test-routing" component={TestRoutingPage} />
      <Route path="/landing-test">
        {() => (
          <Layout>
            <LandingPageTest />
          </Layout>
        )}
      </Route>
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        {() => <ProtectedComponent component={Dashboard} />}
      </Route>
      <Route path="/matches">
        {() => <ProtectedComponent component={ModernizedMatchPage} />}
      </Route>
      <Route path="/tournaments">
        {() => <ProtectedComponent component={TournamentDiscoveryPage} />}
      </Route>
      <Route path="/training">
        {() => <ProtectedComponent component={Dashboard} />}
      </Route>
      <Route path="/community">
        {() => <ProtectedComponent component={Dashboard} />}
      </Route>
      <Route path="/passport">
        {() => <ProtectedComponent component={Dashboard} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedComponent component={StreamlinedProfilePage} />}
      </Route>
      <Route path="/profile/enhanced">
        {() => <ProtectedComponent component={EnhancedProfilePage} />}
      </Route>
      <Route path="/profile/contextual">
        {() => <ProtectedComponent component={ContextualEnhancedProfile} />}
      </Route>
      <Route path="/profile/edit">
        {() => <ProtectedComponent component={ProfileEdit} />}
      </Route>
      <Route path="/profile/streamlined">
        {() => <ProtectedComponent component={StreamlinedProfilePage} />}
      </Route>
      <Route path="/record-match">
        {() => <ProtectedComponent component={RecordMatchPage} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedComponent component={Dashboard} />}
      </Route>
      <Route path="/admin/prize-drawing">
        {() => <ProtectedComponent component={PrizeDrawingPage} />}
      </Route>
      <Route path="/admin/golden-ticket">
        {() => <ProtectedComponent component={GoldenTicketAdmin} />}
      </Route>
      <Route path="/leaderboard">
        {() => <ProtectedComponent component={LeaderboardPage} />}
      </Route>
      <Route path="/mastery-paths">
        {() => <ProtectedComponent component={MasteryPathsPage} />}
      </Route>
      
      {/* For now we'll keep the Match Reward Demo accessible */}
      <Route path="/demo/match-reward">
        {() => (
          <Layout>
            <MatchRewardDemo />
          </Layout>
        )}
      </Route>
      
      {/* 404 Route */}
      <Route>
        {() => (
          <Layout>
            <NotFound />
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

// Protected component wrapper
function ProtectedComponent({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Always define hooks at the top level, not inside conditionals
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);
  
  // Show loading indicator while authentication state is loading
  if (isLoading) return <div>Loading...</div>;
  
  // If no user is logged in, don't render the component
  if (!user) return null;
  
  // User is authenticated, render the protected component
  return (
    <Layout>
      <Component />
    </Layout>
  );
}