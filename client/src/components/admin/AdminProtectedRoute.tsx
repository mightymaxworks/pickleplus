/**
 * PKL-278651-ADMIN-0002-UI
 * Admin Protected Route Component
 * 
 * This component wraps admin routes to ensure only users with admin privileges can access them.
 * Updated to use proper admin layout according to Framework 5.0 requirements.
 */

import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Check if user is authenticated and is an admin
  const isAdmin = user?.isAdmin === true;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p>Loading authentication status...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access this page.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button onClick={() => navigate("/login?redirect=/admin")}>
            Login to continue
          </Button>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access the admin area. Admin privileges are required.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // Return the children components for admin pages
  return <>{children}</>;
};

export default AdminProtectedRoute;