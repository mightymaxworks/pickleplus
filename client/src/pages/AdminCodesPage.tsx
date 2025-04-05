import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import RedemptionCodesList from "@/components/admin/RedemptionCodesList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdminCodesPage = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Check if user is an admin, if not redirect to dashboard
  useEffect(() => {
    if (user && !user.isAdmin) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (!user || !user.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={() => setLocation("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Admin Portal</h1>
        <p className="text-muted-foreground">Manage platform redemption codes</p>
      </div>
      
      <RedemptionCodesList />
    </div>
  );
};

export default AdminCodesPage;