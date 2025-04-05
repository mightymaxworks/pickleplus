import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, BarChart, Tag, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Check if the user is an admin
  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        } else if (response.status === 403) {
          throw new Error('You do not have admin privileges');
        }
        throw new Error('Failed to fetch admin dashboard data');
      }
      return response.json();
    }
  });
  
  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error',
        description: (error as Error)?.message || 'Failed to load admin dashboard',
        variant: 'destructive',
      });
      
      // If the user is not an admin or not authenticated, redirect to home
      if ((error as Error)?.message === 'Unauthorized' || 
          (error as Error)?.message === 'You do not have admin privileges') {
        navigate('/');
      }
    }
  }, [isError, error, toast, navigate]);
  
  // Navigation items
  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <BarChart className="h-5 w-5 mr-2" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5 mr-2" /> },
    { label: 'Redemption Codes', href: '/admin/codes', icon: <Tag className="h-5 w-5 mr-2" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5 mr-2" /> },
  ];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card shadow-sm hidden md:block">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-muted transition-colors cursor-pointer ${
                      location === item.href ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1">
        {/* Mobile header */}
        <div className="md:hidden bg-card p-4 border-b border-border shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            {/* Mobile menu button would go here */}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;