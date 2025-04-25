import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Menu, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlayerPassport from '@/components/passport/PlayerPassport';
import XPProgressCard from '@/components/xp/XPProgressCard';
import RecentMatchesSummary from '@/components/match/RecentMatchesSummary';
import CourtIQStats from '@/components/rankings/CourtIQStats';
import AchievementsShowcase from '@/components/achievement/AchievementsShowcase';
import UpcomingTournaments from '@/components/tournament/UpcomingTournaments';
import SageRecommendationsWidget from '@/components/sage/SageRecommendationsWidget';
import MobileNavigation from '@/components/layout/MobileNavigation';
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import UserDropdownMenu from '@/components/layout/UserDropdownMenu';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const isFoundingMember = !!user.badges?.includes('founding_member');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:flex">
        <DesktopSidebar user={user} />
      </div>

      {/* Mobile sidebar - shown when menu is clicked */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Pickle+</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <DesktopSidebar user={user} compact />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top navigation - mobile only */}
        <header className="sticky top-0 z-10 bg-white border-b md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Dashboard</h1>
            <UserDropdownMenu user={user} />
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="sticky top-0 z-10 bg-white border-b hidden md:block">
          <div className="px-6 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <UserDropdownMenu user={user} />
          </div>
        </header>

        {/* Main dashboard content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 space-y-6">
          {/* Player Passport */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">My Passport</h2>
            <PlayerPassport user={user} isFoundingMember={isFoundingMember} />
          </section>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* XP Progress */}
            <div className="col-span-1">
              <XPProgressCard userId={user.id} />
            </div>

            {/* Recent Matches */}
            <div className="col-span-1">
              <RecentMatchesSummary userId={user.id} />
            </div>

            {/* SAGE Recommendations - Added in Sprint 7 */}
            <div className="col-span-1">
              <SageRecommendationsWidget />
            </div>

            {/* CourtIQ Stats */}
            <div className="col-span-1">
              <CourtIQStats userId={user.id} />
            </div>

            {/* Achievements */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <AchievementsShowcase userId={user.id} />
            </div>

            {/* Upcoming Tournaments */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <UpcomingTournaments userId={user.id} />
            </div>
          </div>
        </main>

        {/* Mobile bottom navigation */}
        <MobileNavigation user={user} />
      </div>
    </div>
  );
}