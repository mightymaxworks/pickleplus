import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import PlayerPassport from "@/components/dashboard/PlayerPassport";
import XPProgressCard from "@/components/dashboard/XPProgressCard";
import RecentMatchesSummary from "@/components/dashboard/RecentMatchesSummary";
import CourtIQStatsOverview from "@/components/dashboard/CourtIQStatsOverview";
import AchievementsShowcase from "@/components/dashboard/AchievementsShowcase";
import UpcomingTournaments from "@/components/dashboard/UpcomingTournaments";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user authentication checked and no user, redirect will happen via useEffect
  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Welcome, {user.displayName || user.username}!</h1>
        
        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Passport Card */}
            <PlayerPassport user={user} />
            
            {/* XP Progress */}
            <XPProgressCard user={user} />
            
            {/* Recent Matches */}
            <RecentMatchesSummary userId={user.id} />
          </div>
          
          {/* Column 2 */}
          <div className="space-y-6">
            {/* CourtIQ Stats Overview */}
            <CourtIQStatsOverview userId={user.id} />
            
            {/* Achievements Showcase */}
            <AchievementsShowcase userId={user.id} />
            
            {/* Upcoming Tournaments */}
            <UpcomingTournaments userId={user.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}