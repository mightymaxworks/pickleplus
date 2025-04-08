import { Fragment } from 'react'
import { Route, Switch } from 'wouter'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import MainLayout from './components/MainLayout'

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
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminCodesPage from './pages/AdminCodesPage'

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
            <Route path="/landing">
              <LandingPage />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/register">
              <Register />
            </Route>
            <Route path="/scan/:id">
              {(params) => <ScanPage id={params.id} />}
            </Route>
            
            {/* Protected Routes with MainLayout */}
            <Route path="/">
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </Route>
            <Route path="/profile">
              <MainLayout>
                <Profile />
              </MainLayout>
            </Route>
            <Route path="/profile/edit">
              <MainLayout>
                <ProfileEdit />
              </MainLayout>
            </Route>
            <Route path="/tournaments">
              <MainLayout>
                <Tournaments />
              </MainLayout>
            </Route>
            <Route path="/leaderboard">
              <MainLayout>
                <Leaderboard />
              </MainLayout>
            </Route>
            <Route path="/connections">
              <MainLayout>
                <ConnectionsPage />
              </MainLayout>
            </Route>
            <Route path="/preferences">
              <MainLayout>
                <PreferencesPage />
              </MainLayout>
            </Route>
            <Route path="/coaching">
              <MainLayout>
                <CoachingPage />
              </MainLayout>
            </Route>
            <Route path="/match">
              <MainLayout>
                <MatchPage />
              </MainLayout>
            </Route>
            <Route path="/modernized-match">
              <MainLayout>
                <ModernizedMatchPage />
              </MainLayout>
            </Route>
            <Route path="/coming-soon">
              <MainLayout>
                <ComingSoonPage />
              </MainLayout>
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard">
              <MainLayout>
                <AdminDashboardPage />
              </MainLayout>
            </Route>
            <Route path="/admin/users">
              <MainLayout>
                <AdminUsersPage />
              </MainLayout>
            </Route>
            <Route path="/admin/codes">
              <MainLayout>
                <AdminCodesPage />
              </MainLayout>
            </Route>
            
            {/* Demo Routes (Development Only) */}
            <Route path="/demo/match-reward">
              <MatchRewardDemo />
            </Route>
            <Route path="/demo/xp-ranking">
              <XPRankingDemo />
            </Route>
            
            {/* 404 Route */}
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </Fragment>
  )
}