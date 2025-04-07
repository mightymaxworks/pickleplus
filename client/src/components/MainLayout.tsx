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
  Menu
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import pickleLogoPath from "../assets/Pickle (2).png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t mt-4 pt-4">
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
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;