import { Fragment, useEffect } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import EnhancedLandingPage from './pages/EnhancedLandingPage'
import EnhancedAuthPage from './pages/EnhancedAuthPage'
import TestAuthPage from './pages/TestAuthPage'
import TestRoutingPage from './pages/TestRoutingPage'
import Dashboard from './pages/Dashboard'
import RecordMatchPage from './pages/record-match-page'
import MatchesPage from './pages/matches-page'
import MatchRewardDemo from './pages/match-reward-demo'
import EnhancedProfile from './pages/EnhancedProfile'
import ProfileEdit from './pages/ProfileEdit'
import NotFound from './pages/not-found'

import { useAuth } from './hooks/useAuth'

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
            <Route path="/test-routing" component={TestRoutingPage} />
            
            {/* Protected Routes */}
            <Route path="/dashboard">
              {(params) => <ProtectedRoute component={Dashboard} path="/dashboard" />}
            </Route>
            <Route path="/matches">
              {(params) => <ProtectedRoute component={MatchesPage} path="/matches" />}
            </Route>
            <Route path="/tournaments">
              {(params) => <ProtectedRoute component={Dashboard} path="/tournaments" />}
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
            <Route path="/profile">
              {(params) => <ProtectedRoute component={EnhancedProfile} path="/profile" />}
            </Route>
            <Route path="/profile/edit">
              {(params) => <ProtectedRoute component={ProfileEdit} path="/profile/edit" />}
            </Route>
            <Route path="/record-match">
              {(params) => <ProtectedRoute component={RecordMatchPage} path="/record-match" />}
            </Route>
            <Route path="/admin">
              {(params) => <ProtectedRoute component={Dashboard} path="/admin" />}
            </Route>
            
            {/* For now we'll keep the Match Reward Demo accessible */}
            <Route path="/demo/match-reward" component={MatchRewardDemo} />
            
            {/* 404 Route */}
            <Route component={NotFound} />
          </Switch>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </Fragment>
  )
}