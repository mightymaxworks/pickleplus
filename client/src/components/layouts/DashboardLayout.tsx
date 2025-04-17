/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Dashboard Layout Component
 * 
 * This component provides a consistent layout for dashboard pages including navigation.
 */
import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Home,
  Calendar,
  Trophy,
  Users,
  Bell,
  Menu,
  Search
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from '@/lib/hooks/useUser';
import { useState, useEffect } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { data: user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if the viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/matches', label: 'Matches', icon: <Trophy className="h-5 w-5" /> },
    { path: '/events', label: 'Events', icon: <Calendar className="h-5 w-5" /> },
    { path: '/communities', label: 'Communities', icon: <Users className="h-5 w-5" /> },
  ];
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="px-2 py-6 flex flex-col h-full">
                  <Link href="/" className="flex items-center gap-2 mb-8 px-4">
                    <span className="font-bold text-xl">Pickle+</span>
                  </Link>
                  
                  <nav className="flex flex-col gap-3">
                    {navigationItems.map((item) => (
                      <Link 
                        key={item.path} 
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant={location.startsWith(item.path) ? "secondary" : "ghost"}
                          className="w-full justify-start"
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Button>
                      </Link>
                    ))}
                  </nav>
                  
                  <div className="mt-auto">
                    <div className="px-4 py-4 border-t">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user?.avatarUrl || ""} />
                          <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user?.username || "User"}</p>
                          <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <Link href="/" className="flex items-center gap-2 mr-6">
            <span className="font-bold text-xl hidden md:inline-block">Pickle+</span>
            <span className="font-bold text-xl md:hidden">P+</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-5 text-sm">
            {navigationItems.map((item) => (
              <TooltipProvider key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      href={item.path}
                      className={`flex items-center gap-1 py-1 ${
                        location.startsWith(item.path) 
                          ? "font-medium text-foreground" 
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.icon}
                      <span className="ml-1">{item.label}</span>
                      {location.startsWith(item.path) && (
                        <div className="h-0.5 w-full absolute bottom-0 left-0 bg-primary" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
          
          <div className="ml-auto flex items-center gap-4">
            <form className="hidden md:flex w-full lg:w-[240px]">
              <Input
                type="search"
                placeholder="Search..."
                className="h-9 md:w-[200px] lg:w-[240px]"
              />
            </form>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Link href="/profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Mobile search */}
      {isMobile && (
        <div className="md:hidden p-4 border-b bg-background">
          <form>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8"
              />
            </div>
          </form>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>© {new Date().getFullYear()} Pickle+. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}