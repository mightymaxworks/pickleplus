import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Tournaments from "@/pages/Tournaments";
import Achievements from "@/pages/Achievements";
import Leaderboard from "@/pages/Leaderboard";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";

function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  // Check if user is logged in
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/users/current'],
    retry: false,
    onSuccess: (data) => {
      if (data) {
        setLoggedIn(true);
      }
    },
    onError: () => {
      setLoggedIn(false);
    }
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login">
        {loggedIn ? <Dashboard /> : <Login onLoginSuccess={() => setLoggedIn(true)} />}
      </Route>
      <Route path="/register">
        {loggedIn ? <Dashboard /> : <Register onRegisterSuccess={() => setLoggedIn(true)} />}
      </Route>

      {/* Protected routes */}
      <Route path="/">
        {loggedIn ? 
          <AppLayout>
            <Dashboard />
          </AppLayout> 
          : <Login onLoginSuccess={() => setLoggedIn(true)} />
        }
      </Route>
      <Route path="/profile">
        {loggedIn ? 
          <AppLayout>
            <Profile />
          </AppLayout> 
          : <Login onLoginSuccess={() => setLoggedIn(true)} />
        }
      </Route>
      <Route path="/tournaments">
        {loggedIn ? 
          <AppLayout>
            <Tournaments />
          </AppLayout> 
          : <Login onLoginSuccess={() => setLoggedIn(true)} />
        }
      </Route>
      <Route path="/achievements">
        {loggedIn ? 
          <AppLayout>
            <Achievements />
          </AppLayout> 
          : <Login onLoginSuccess={() => setLoggedIn(true)} />
        }
      </Route>
      <Route path="/leaderboard">
        {loggedIn ? 
          <AppLayout>
            <Leaderboard />
          </AppLayout> 
          : <Login onLoginSuccess={() => setLoggedIn(true)} />
        }
      </Route>

      {/* Fallback route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default App;
