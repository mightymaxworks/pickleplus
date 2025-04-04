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
import LandingPage from "@/pages/LandingPage";
import TournamentCheckIn from "@/pages/TournamentCheckIn";
import { MainLayout } from "@/components/MainLayout";
import { AuthLayout } from "@/components/AuthLayout";
import { AuthProvider } from "@/hooks/useAuth";
import QuickMatchFAB from "@/components/QuickMatchFAB";

function App() {
  return (
    <AuthProvider>
      <div className="font-pairing-default">
      <Switch>
        {/* Root redirects to welcome page */}
        <Route path="/">
          <Redirect to="/welcome" />
        </Route>
        
        {/* Landing Page */}
        <Route path="/welcome">
          <LandingPage />
        </Route>
        
        {/* Auth Routes */}
        <Route path="/login">
          <AuthLayout>
            <Login />
          </AuthLayout>
        </Route>
        <Route path="/register">
          <AuthLayout>
            <Register />
          </AuthLayout>
        </Route>

        {/* Main App Routes */}
        <Route path="/dashboard">
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </Route>
        <Route path="/tournaments">
          <MainLayout>
            <Tournaments />
          </MainLayout>
        </Route>
        <Route path="/achievements">
          <MainLayout>
            <Achievements />
          </MainLayout>
        </Route>
        <Route path="/leaderboard">
          <MainLayout>
            <Leaderboard />
          </MainLayout>
        </Route>
        <Route path="/profile">
          <MainLayout>
            <Profile />
          </MainLayout>
        </Route>
        <Route path="/tournaments/:id/check-in">
          <MainLayout>
            <TournamentCheckIn />
          </MainLayout>
        </Route>

        {/* 404 Route */}
        <Route>
          <NotFound />
        </Route>
      </Switch>
      
      {/* Global Components */}
      <QuickMatchFAB />
      <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
