import { Home, Trophy, UserCircle, PlusCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { hapticFeedback, isMobileDevice } from '@/lib/mobile-utils';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  testId: string;
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: 'Dashboard',
    path: '/dashboard',
    testId: 'nav-dashboard'
  },
  {
    icon: PlusCircle,
    label: 'Record',
    path: '/record-match',
    testId: 'nav-record-match'
  },
  {
    icon: Trophy,
    label: 'Rankings',
    path: '/rankings',
    testId: 'nav-rankings'
  },
  {
    icon: UserCircle,
    label: 'Profile',
    path: '/profile',
    testId: 'nav-profile'
  }
];

export function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  
  if (!isMobileDevice()) {
    return null;
  }

  const handleNavClick = (path: string) => {
    hapticFeedback.selection();
    setLocation(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb md:hidden"
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[60px] rounded-lg transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={item.testId}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn("h-6 w-6 mb-1", isActive && "fill-primary/20")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
