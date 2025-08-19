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
  LogOut,
  Menu,
  Shield,
  CheckCircle2,
  Palette,
  HeartPulse,
  Ticket
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import pickleLogoPath from "../assets/Pickle (2).png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';

// Navigation item type definition
type NavigationItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  };
};

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    console.log("Logout button clicked - direct approach");
    
    // Framework 5.3 Direct Solution: Simple approach with multiple fallbacks
    try {
      // Set a flag to prevent redirect loop on auth page
      sessionStorage.setItem('just_logged_out', 'true');
      console.log("Logout flag set to prevent redirect loop");
      
      // 1. Try the logout mutation
      logout();
      
      // 2. Direct cookie clearing regardless of mutation success
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // 3. Clear all cached auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      
      // 4. Force a complete page reload to reset all React state
      window.location.replace('/auth');
    } catch (e) {
      console.error("Error during logout:", e);
      
      // Even on error, set the flag and force a logout
      sessionStorage.setItem('just_logged_out', 'true');
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Force a complete page reload
      window.location.replace('/auth');
    }
  };

  // Core navigation items per user request: Dashboard, Record Match, Rankings, My Profile + Pickle Points
  const baseNavigationItems: NavigationItem[] = [
    { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Record Match', path: '/matches', icon: <CheckCircle2 className="h-5 w-5" /> },
    { name: 'Rankings', path: '/rankings', icon: <Award className="h-5 w-5" /> },
    { name: 'Pickle Points', path: '/pickle-points', icon: <Ticket className="h-5 w-5" /> },
    { name: 'My Profile', path: '/profile', icon: <Users className="h-5 w-5" /> },
  ];

  // Debug user data for coach dashboard
  console.log("User admin status:", user?.isAdmin);
  console.log("User coach level:", user?.coachLevel);
  console.log("Full user object keys:", user ? Object.keys(user) : "no user");
  console.log("User data sample:", user ? { id: user.id, username: user.username, coachLevel: user.coachLevel, isAdmin: user.isAdmin } : "no user");
  
  let navigationItems: NavigationItem[] = [...baseNavigationItems];
  
  // Add coach dashboard for users with coach level
  if (user?.coachLevel && user.coachLevel > 0) {
    navigationItems.push({
      name: 'Coach Dashboard', 
      path: '/coach-dashboard', 
      icon: <BookOpen className="h-5 w-5 text-blue-600" />
    });
  }
  
  // Add admin dashboard for admin users
  if (user?.isAdmin) {
    navigationItems.push({
      name: 'Admin Dashboard', 
      path: '/admin', 
      icon: <Shield className="h-5 w-5 text-rose-500" />
    });
  }

  // Generate initials for avatar
  const initials = user?.displayName
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || user?.avatarInitials || 'P+';

  // Gold border for founding members
  const avatarBorderClass = user?.isFoundingMember 
    ? "ring-2 ring-[#FFD700] ring-offset-1" 
    : "ring-2 ring-primary/20 ring-offset-1";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card shadow-md border-r hidden md:block">
        <div className="px-6 py-4">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <img 
                src={pickleLogoPath} 
                alt="Pickle+ Logo" 
                className="h-12 object-contain" 
              />
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
                      location === item.path ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                    {item.name === 'Tournaments' && (
                      <Badge className="ml-auto bg-primary/90 text-white text-xs">New</Badge>
                    )}
                    {item.badge && (
                      <Badge className="ml-auto text-xs" variant={item.badge.variant}>
                        {item.badge.text}
                      </Badge>
                    )}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 border-t p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className={`w-10 h-10 ${avatarBorderClass}`}>
              <AvatarFallback 
                className={user?.isFoundingMember ? "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white" : undefined}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.displayName || user?.username}</p>
              <p className="text-xs text-muted-foreground">
                Level {user?.level || 1} • {user?.xp?.toLocaleString() || 0} XP
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b z-30 flex items-center justify-between px-4">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <img 
              src={pickleLogoPath} 
              alt="Pickle+ Logo" 
              className="h-8 object-contain" 
            />
          </div>
        </Link>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-card shadow-lg p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <nav>
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.path}>
                      <a 
                        className={`flex items-center p-3 rounded-md hover:bg-accent hover:text-accent-foreground ${
                          location === item.path ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                        {item.name === 'Tournaments' && (
                          <Badge className="ml-auto bg-primary/90 text-white text-xs">New</Badge>
                        )}
                        {item.badge && (
                          <Badge className="ml-auto text-xs" variant={item.badge.variant}>
                            {item.badge.text}
                          </Badge>
                        )}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t mt-4 pt-4">
              {/* Debug element - remove in production */}
              {user?.isAdmin && (
                <div className="mb-2 text-xs text-center p-1 bg-rose-100 text-rose-700 rounded">
                  Admin Access: {user?.isAdmin ? "Yes" : "No"}
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;