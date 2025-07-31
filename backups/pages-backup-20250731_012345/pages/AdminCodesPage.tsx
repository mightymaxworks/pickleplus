import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import RedemptionCodesList from "@/components/admin/RedemptionCodesList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex items-center justify-center h-full py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center">
            <KeyRound className="w-5 h-5 mr-2 text-[#FF5722]" />
            <h1 className="text-2xl font-bold font-product-sans">Admin Portal</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="mt-2 sm:mt-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">Manage Pickle+ redemption codes and special privileges</p>
      </div>
      
      <RedemptionCodesList />
    </div>
  );
};

export default AdminCodesPage;