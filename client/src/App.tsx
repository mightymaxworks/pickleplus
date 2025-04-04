import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Tournaments from "@/pages/Tournaments";
import Achievements from "@/pages/Achievements";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/LandingPage";
import TournamentCheckIn from "@/pages/TournamentCheckIn";
import { MainLayout } from "@/components/MainLayout";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
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
  const showQuickMatchFAB = useFeatureFlag(Features.QUICK_MATCH);
  
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

        {/* 404 Route */}
        <Route>
          <NotFound />
        </Route>
      </Switch>
      
      {/* Global Components */}
      {showQuickMatchFAB && <QuickMatchFAB />}
      <Toaster />
    </div>
  );
}

export default App;
