import { Fragment } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import EnhancedLandingPage from './pages/EnhancedLandingPage'
import EnhancedAuthPage from './pages/EnhancedAuthPage'
import Dashboard from './pages/Dashboard'
import MatchRewardDemo from './pages/match-reward-demo'
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
            
            {/* Protected Routes */}
            <Route path="/dashboard">
              {(params) => <ProtectedRoute component={Dashboard} path="/dashboard" />}
            </Route>
            <Route path="/matches">
              {(params) => <ProtectedRoute component={Dashboard} path="/matches" />}
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
              {(params) => <ProtectedRoute component={Dashboard} path="/profile" />}
            </Route>
            <Route path="/record-match">
              {(params) => <ProtectedRoute component={Dashboard} path="/record-match" />}
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