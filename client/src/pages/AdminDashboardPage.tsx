import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, KeyRound, Users, Layers, Award, Code, Activity, BarChart3, Mail, QrCode, Codesandbox, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getModuleAPI } from "@/modules/moduleRegistration";
import { AdminModuleAPI } from "@/modules/types";

// Quick action component for dashboard
const QuickAction = ({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) => (
  <Link href={href}>
    <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="text-primary">{icon}</div>
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

const StatsCard = ({ title, value, icon, loading = false }: { title: string, value: string | number, icon: React.ReactNode, loading?: boolean }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription>{title}</CardDescription>
        <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const adminApi = getModuleAPI<AdminModuleAPI>('admin');
  
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
    // Only enable if user is admin
    enabled: !!user?.isAdmin,
    // Shorter stale time for fresher data
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
            <h1 className="text-2xl font-bold font-product-sans">Admin Dashboard</h1>
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
        <p className="text-muted-foreground mb-6">Manage Pickle+ platform settings, users, and content</p>
      </div>
      
      {/* Platform Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Users" 
            value={isLoadingStats ? "..." : dashboardStats?.userCount || 0} 
            icon={<Users className="h-4 w-4" />}
            loading={isLoadingStats}
          />
          <StatsCard 
            title="Active Players" 
            value={isLoadingStats ? "..." : dashboardStats?.activeUserCount || 0} 
            icon={<Activity className="h-4 w-4" />}
            loading={isLoadingStats}
          />
          <StatsCard 
            title="Redemption Codes" 
            value={isLoadingStats ? "..." : dashboardStats?.activeCodesCount || 0} 
            icon={<Code className="h-4 w-4" />}
            loading={isLoadingStats}
          />
          <StatsCard 
            title="Pickle Points" 
            value={isLoadingStats ? "..." : dashboardStats?.totalXpAwarded || 0}
            icon={<Award className="h-4 w-4" />}
            loading={isLoadingStats}
          />
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction 
            icon={<Code className="h-5 w-5" />} 
            title="Redemption Codes" 
            description="Create and manage redemption codes"
            href="/admin/codes"
          />
          <QuickAction 
            icon={<Users className="h-5 w-5" />} 
            title="User Management" 
            description="View and manage user accounts"
            href="/admin/users"
          />
          <QuickAction 
            icon={<Codesandbox className="h-5 w-5" />} 
            title="Feature Flags" 
            description="Toggle platform features"
            href="/admin/features"
          />
          <QuickAction 
            icon={<BarChart3 className="h-5 w-5" />} 
            title="Analytics" 
            description="View platform analytics and reports"
            href="/admin/analytics"
          />
          <QuickAction 
            icon={<Award className="h-5 w-5" />} 
            title="Achievements" 
            description="Manage player achievements"
            href="/admin/achievements"
          />
          <QuickAction 
            icon={<Settings className="h-5 w-5" />} 
            title="System Settings" 
            description="Configure platform settings"
            href="/admin/settings"
          />
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-4">
            {isLoadingStats ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Activity data will be available soon</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;