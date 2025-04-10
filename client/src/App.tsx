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

// A protected route component
const ProtectedRoute = ({ component: Component, path }: { component: React.ComponentType<any>; path: string }) => {
  // Create a routing component that will handle redirection to login
  // This must be rendered INSIDE the route so it has access to the auth context
  const ProtectedRouteContent = () => {
    const { user, isLoading } = useAuth();
    const [, navigate] = useLocation();
    
    // If the auth state is still loading, show nothing
    if (isLoading) return null;
    
    // If no user is authenticated, redirect to auth page
    if (!user) {
      navigate("/auth");
      return null;
    }
    
    // If authenticated, render the component wrapped in the layout
    return (
      <Layout>
        <Component />
      </Layout>
    );
  };
  
  // Return a route with the correct path that will render our protected content
  return (
    <Route path={path}>
      {() => <ProtectedRouteContent />}
    </Route>
  );
};

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
            <Route path="/test-routing" component={TestRoutingPage} />
            <Route path="/landing-test">
              {() => (
                <Layout>
                  <LandingPageTest />
                </Layout>
              )}
            </Route>
            
            {/* Protected Routes */}
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/matches" component={ModernizedMatchPage} />
            <ProtectedRoute path="/tournaments" component={TournamentDiscoveryPage} />
            <ProtectedRoute path="/training" component={Dashboard} />
            <ProtectedRoute path="/community" component={Dashboard} />
            <ProtectedRoute path="/passport" component={Dashboard} />
            <ProtectedRoute path="/profile" component={StreamlinedProfilePage} />
            <ProtectedRoute path="/profile/enhanced" component={EnhancedProfilePage} />
            <ProtectedRoute path="/profile/contextual" component={ContextualEnhancedProfile} />
            <ProtectedRoute path="/profile/edit" component={ProfileEdit} />
            <ProtectedRoute path="/profile/streamlined" component={StreamlinedProfilePage} />
            <ProtectedRoute path="/record-match" component={RecordMatchPage} />
            <ProtectedRoute path="/admin" component={Dashboard} />
            <ProtectedRoute path="/admin/prize-drawing" component={PrizeDrawingPage} />
            <ProtectedRoute path="/admin/golden-ticket" component={GoldenTicketAdmin} />
            <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
            <ProtectedRoute path="/mastery-paths" component={MasteryPathsPage} />
            
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
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </Fragment>
  )
}