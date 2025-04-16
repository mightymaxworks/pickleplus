/**
 * PKL-278651-ADMIN-0009-MOBILE
 * Passport Verification Page
 * 
 * This page handles the verification of PicklePass™ passports,
 * with responsive layout for both mobile and desktop views.
 */

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
// AdminLayout is provided by AdminProtectedRoute, no need to import it here
import { useIsMobile } from "@/modules/admin/utils/deviceDetection";
import { ResponsivePassportVerification } from "@/modules/admin/components/responsive";

const PassportVerificationPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  
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
  
  // Use our responsive component which will render based on device type
  // Note: AdminLayout is provided by AdminProtectedRoute wrapper
  return <ResponsivePassportVerification />;
};

export default PassportVerificationPage;