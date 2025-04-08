import { Fragment } from 'react'
import { Route, Switch } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import EnhancedLandingPage from './pages/EnhancedLandingPage'
import EnhancedAuthPage from './pages/EnhancedAuthPage'
import MatchRewardDemo from './pages/match-reward-demo'
import NotFound from './pages/not-found'

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