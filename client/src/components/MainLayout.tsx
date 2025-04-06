import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Trophy, 
  Award, 
  Users, 
  UserCircle, 
  BookOpen, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Tournaments', path: '/tournaments', icon: <Trophy className="h-5 w-5" /> },
    { name: 'Achievements', path: '/achievements', icon: <Award className="h-5 w-5" /> },
    { name: 'Connections', path: '/connections', icon: <Users className="h-5 w-5" /> },
    { name: 'Coaching', path: '/coaching', icon: <BookOpen className="h-5 w-5" /> },
    { name: 'Profile', path: '/profile', icon: <UserCircle className="h-5 w-5" /> },
    { name: 'Preferences', path: '/preferences', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card shadow-md border-r hidden md:block">
        <div className="px-6 py-6">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <span className="font-bold text-2xl text-primary">Pickle+</span>
            </div>
          </Link>
        </div>
        <nav className="px-4 mt-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link href={item.path}>
                  <a 
                    className={`flex items-center p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
                      location === item.path ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">CourtIQ: {user?.courtiqRating?.toFixed(1) || 'N/A'}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b z-30 flex items-center justify-between px-4">
        <Link href="/">
          <div className="font-bold text-xl text-primary">Pickle+</div>
        </Link>
        {/* Mobile menu button would go here */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;