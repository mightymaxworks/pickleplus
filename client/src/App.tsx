import { Fragment } from 'react'
import { Route, Switch } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'

// Main Pages
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/not-found'
import LandingPage from './pages/LandingPage'
import ScanPage from './pages/ScanPage'
import Tournaments from './pages/Tournaments'
import Leaderboard from './pages/Leaderboard'
import ConnectionsPage from './pages/ConnectionsPage'
import PreferencesPage from './pages/PreferencesPage'
import CoachingPage from './pages/CoachingPage'
import ComingSoonPage from './pages/ComingSoonPage'
import MatchPage from './pages/match-page'
import ModernizedMatchPage from './pages/modernized-match-page'

// Demo Pages (for development and testing)
import MatchRewardDemo from './pages/match-reward-demo'
import XPRankingDemo from './pages/xp-ranking-demo'

export default function App() {
  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Switch>
            {/* Public Routes */}
            <Route path="/landing" component={LandingPage} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/scan/:id" component={ScanPage} />
            
            {/* Protected Routes */}
            <ProtectedRoute path="/" component={Dashboard} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/profile/edit" component={ProfileEdit} />
            <ProtectedRoute path="/tournaments" component={Tournaments} />
            <ProtectedRoute path="/leaderboard" component={Leaderboard} />
            <ProtectedRoute path="/connections" component={ConnectionsPage} />
            <ProtectedRoute path="/preferences" component={PreferencesPage} />
            <ProtectedRoute path="/coaching" component={CoachingPage} />
            <ProtectedRoute path="/match" component={MatchPage} />
            <ProtectedRoute path="/modernized-match" component={ModernizedMatchPage} />
            <ProtectedRoute path="/coming-soon" component={ComingSoonPage} />
            
            {/* Demo Routes (Development Only) */}
            <Route path="/demo/match-reward" component={MatchRewardDemo} />
            <Route path="/demo/xp-ranking" component={XPRankingDemo} />
            
            {/* 404 Route */}
            <Route component={NotFound} />
          </Switch>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </Fragment>
  )
}