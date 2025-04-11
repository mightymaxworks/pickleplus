import React from "react";
import { useQuery } from "@tanstack/react-query";
import PassportVerificationDashboard from "@/components/admin/PassportVerificationDashboard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

interface User {
  id: number;
  role: string;
  username: string;
}

const PassportVerificationPage: React.FC = () => {
  const [, navigate] = useLocation();
  
  // Check if the current user is an admin
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['/api/me'],
    queryFn: async () => {
      const response = await apiRequest('/api/me');
      return response as User;
    }
  });
  
  const isAdmin = currentUser?.role === 'admin';
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page. Admin privileges are required.
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <PassportVerificationDashboard />
    </DashboardLayout>
  );
};

export default PassportVerificationPage;