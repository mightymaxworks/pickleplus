import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Higher Order Component that checks if user is authenticated
 * and redirects to auth page if not
 */
export function withAuth<P>(Component: React.ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { user, isLoading } = useAuth();
    const [, navigate] = useLocation();
    
    useEffect(() => {
      // Redirect to auth page if user is not authenticated and loaded
      if (!isLoading && !user) {
        navigate('/auth');
      }
    }, [user, isLoading, navigate]);
    
    // If still loading, show loading state
    if (isLoading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    // If no user and not loading, don't render anything (will redirect)
    if (!user) {
      return null;
    }
    
    // User is authenticated, render the component
    return <Component {...props} />;
  };
}