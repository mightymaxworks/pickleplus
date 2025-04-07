import { Switch, Route, Redirect, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Tournaments from "@/pages/Tournaments";
import Achievements from "@/pages/Achievements";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/LandingPage";
import TournamentCheckIn from "@/pages/TournamentCheckIn";
import AdminCodesPage from "@/pages/AdminCodesPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import CoachingPage from "@/pages/CoachingPage";
import ConnectionsPage from "@/pages/ConnectionsPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import CoachProfilePage from "@/pages/CoachProfilePage";
import CoachProfileEditPage from "@/pages/CoachProfileEditPage";
import ScanPage from "@/pages/ScanPage";
import TournamentsComingSoon from "@/pages/TournamentsComingSoon";
import AchievementsComingSoon from "@/pages/AchievementsComingSoon";
import LeaderboardComingSoon from "@/pages/LeaderboardComingSoon";
import PreferencesPage from "@/pages/PreferencesPage";
import { MainLayout } from "@/components/MainLayout";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth.tsx";
import { QrCodeFAB } from "@/components/QrCodeFAB";
import QuickMatchFAB from "@/components/QuickMatchFAB";
import { FeatureProtectedRoute } from "@/components/FeatureProtectedRoute";
import { Features, useFeatureFlag } from "@/lib/featureFlags";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [location] = useLocation();
  
  return (
    <div className="font-pairing-default">
      <Switch>
        {/* Root path - redirects based on authentication status */}
        <Route path="/">
          {isAuthenticated ? (
            <Redirect to="/dashboard" />
          ) : (
            <Redirect to="/welcome" />
          )}
        </Route>
        
        {/* Landing Page */}
        <Route path="/welcome">
          <LandingPage />
        </Route>
        
        {/* Auth Routes */}
        <Route path="/auth">
          <AuthLayout>
            <AuthPage />
          </AuthLayout>
        </Route>
        <Route path="/login">
          <Redirect to="/auth" />
        </Route>
        <Route path="/register">
          <Redirect to="/auth" />
        </Route>

        {/* Main App Routes */}
        <Route path="/dashboard">
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </Route>
        
        {/* Feature Protected Routes */}
        <FeatureProtectedRoute 
          path="/tournaments" 
          component={Tournaments} 
          featureFlag={Features.TOURNAMENTS} 
        />
        
        <FeatureProtectedRoute 
          path="/achievements" 
          component={Achievements} 
          featureFlag={Features.ACHIEVEMENTS} 
        />
        
        <FeatureProtectedRoute 
          path="/leaderboard" 
          component={Leaderboard} 
          featureFlag={Features.LEADERBOARD} 
        />
        
        <FeatureProtectedRoute 
          path="/tournaments/:id/check-in" 
          component={TournamentCheckIn} 
          featureFlag={Features.TOURNAMENTS} 
        />
        
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
        
        <Route path="/scan">
          <ScanPage />
        </Route>

        <Route path="/coaching">
          <MainLayout>
            <CoachingPage />
          </MainLayout>
        </Route>

        <FeatureProtectedRoute 
          path="/connections" 
          component={ConnectionsPage} 
          featureFlag={Features.SOCIAL_CONNECTIONS} 
        />

        <Route path="/coach/profile">
          <MainLayout>
            <ComingSoonPage />
          </MainLayout>
        </Route>

        <Route path="/coach/profile/edit">
          <MainLayout>
            <ComingSoonPage />
          </MainLayout>
        </Route>
        
        <Route path="/preferences">
          <PreferencesPage />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin">
          <Redirect to="/admin/dashboard" />
        </Route>
        
        <Route path="/admin/dashboard">
          <MainLayout>
            <AdminDashboardPage />
          </MainLayout>
        </Route>
        
        <Route path="/admin/codes">
          <MainLayout>
            <AdminCodesPage />
          </MainLayout>
        </Route>
        
        <Route path="/admin/users">
          <MainLayout>
            <AdminUsersPage />
          </MainLayout>
        </Route>

        {/* 404 Route */}
        <Route>
          <NotFound />
        </Route>
      </Switch>
      
      {/* Global Components - only show on authenticated routes, not on landing page */}
      {isAuthenticated && !location.includes("/welcome") && !location.includes("/auth") && <QrCodeFAB />}
      {isAuthenticated && !location.includes("/welcome") && !location.includes("/auth") && <QuickMatchFAB />}
      <Toaster />
    </div>
  );
}

export default App;
