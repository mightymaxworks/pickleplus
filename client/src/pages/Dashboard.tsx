import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { userApi, tournamentApi, achievementApi } from "@/lib/apiClient";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";
import { TournamentCard } from "@/components/TournamentCard";
import { AchievementBadge } from "@/components/AchievementBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Achievement, Tournament } from "@/types";
import { FoundingMemberBadge } from "@/components/ui/founding-member-badge";
import { XpMultiplierIndicator } from "@/components/ui/xp-multiplier-indicator";

// Define missing interfaces
interface UserAchievementWithDetails {
  achievement: Achievement;
  userAchievement: {
    id: number;
    userId: number;
    achievementId: number;
    unlockedAt: Date;
  };
}

interface UserTournament {
  tournament: Tournament;
  registration: {
    id: number;
    userId: number;
    tournamentId: number;
    registeredAt: Date;
    checkedIn: boolean;
    checkedInAt: Date | null;
    placement: number | null;
  };
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, setLocation]);
  
  // Fetch user activities
  const { 
    data: activities,
    isLoading: activitiesLoading
  } = useQuery<Activity[]>({
    queryKey: ["/api/user/activities"],
    enabled: isAuthenticated,
  });
  
  // Fetch user tournaments
  const { 
    data: tournaments,
    isLoading: tournamentsLoading
  } = useQuery<UserTournament[]>({
    queryKey: ["/api/user/tournaments"],
    enabled: isAuthenticated,
  });
  
  // Fetch user achievements
  const { 
    data: achievements,
    isLoading: achievementsLoading
  } = useQuery<UserAchievementWithDetails[]>({
    queryKey: ["/api/user/achievements"],
    enabled: isAuthenticated,
  });
  
  // Find upcoming tournaments
  const upcomingTournament = tournaments?.find(
    t => new Date(t.tournament.startDate) > new Date()
  );
  
  if (!user) {
    return null;
  }
  
  // Calculate XP needed for next level
  const xpPerLevel = 1000;
  const currentXP = user.xp || 0;
  const nextLevelXP = (user.level || 1) * xpPerLevel;
  const xpNeeded = nextLevelXP - currentXP;
  const xpPercentage = (currentXP % xpPerLevel) / xpPerLevel * 100;

  return (
    <div className="dashboard-view pb-20 md:pb-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <h2 className="text-xl font-bold font-product-sans mr-2">Welcome back, {user.displayName.split(' ')[0]}!</h2>
          {user.isFoundingMember && <FoundingMemberBadge size="sm" showText={true} />}
          {user.isAdmin && (
            <span
              className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full cursor-pointer"
              onClick={() => setLocation("/admin/codes")}
            >
              Admin Panel
            </span>
          )}
        </div>
        <div className="flex items-center">
          <p className="text-gray-500 mr-3">Ready to elevate your pickleball game?</p>
          {user.isFoundingMember && user.xpMultiplier && (
            <XpMultiplierIndicator multiplier={user.xpMultiplier} size="sm" showLabel={true} showTooltip={true} />
          )}
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Level" 
          value={user.level || 1} 
          icon="emoji_events"
          iconColor="text-[#FF5722]"
          badge="+1 this week"
        />
        <StatCard 
          title="XP Points" 
          value={user.xp || 0} 
          icon="bolt"
          iconColor="text-[#2196F3]"
          badge={activities && activities.length > 0 ? `+${activities[0].xpEarned}` : undefined}
        />
        <StatCard 
          title="Matches" 
          value={user.totalMatches || 0} 
          icon="sports"
          iconColor="text-[#FF5722]"
          badge={`Won ${user.matchesWon || 0}`}
        />
        <StatCard 
          title="Tournaments" 
          value={user.totalTournaments || 0} 
          icon="workspace_premium"
          iconColor="text-[#2196F3]"
          badge={upcomingTournament ? "1 upcoming" : undefined}
        />
      </div>
      
      {/* Level Progress Section */}
      <div className="bg-white rounded-lg p-4 mb-6 pickle-shadow">
        <h3 className="font-bold mb-3 font-product-sans">Level Progress</h3>
        <div className="flex items-center mb-2">
          <div className="w-12 h-12 rounded-full bg-[#FF5722] text-white flex items-center justify-center font-bold text-xl mr-3">
            {user.level || 1}
          </div>
          <div className="flex-grow">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{currentXP} / {nextLevelXP} XP</span>
              <span className="text-sm text-gray-500">{xpPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF5722]" 
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">{xpNeeded} XP until Level {(user.level || 1) + 1}</p>
      </div>
      
      {/* Recent Activity Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold font-product-sans">Recent Activity</h3>
          <span 
            className="text-[#2196F3] text-sm cursor-pointer"
            onClick={() => setLocation("/profile")}
          >
            View All
          </span>
        </div>
        
        {activitiesLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="mb-3">
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))
        ) : activities && activities.length > 0 ? (
          activities.slice(0, 3).map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activities</p>
        )}
      </div>
      
      {/* Upcoming Tournaments Section */}
      {upcomingTournament && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold font-product-sans">Upcoming Tournaments</h3>
            <span 
              className="text-[#2196F3] text-sm cursor-pointer"
              onClick={() => setLocation("/tournaments")}
            >
              View All
            </span>
          </div>
          
          {tournamentsLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : (
            <TournamentCard 
              tournament={upcomingTournament.tournament} 
              registration={upcomingTournament.registration}
            />
          )}
        </div>
      )}
      
      {/* Recent Achievements Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold font-product-sans">Recent Achievements</h3>
          <span 
            className="text-[#2196F3] text-sm cursor-pointer"
            onClick={() => setLocation("/achievements")}
          >
            View All
          </span>
        </div>
        
        {achievementsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full mb-2" />
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements && achievements.length > 0 ? (
              achievements.slice(0, 3).map(({ achievement, userAchievement }) => (
                <AchievementBadge 
                  key={achievement.id} 
                  achievement={achievement} 
                  unlocked={true}
                />
              ))
            ) : (
              // Show sample locked achievement if none unlocked
              <AchievementBadge 
                achievement={{
                  id: 0,
                  name: "Champion",
                  description: "Win a tournament",
                  xpReward: 500,
                  category: "tournament",
                  difficulty: "hard",
                  badgeImageUrl: null,
                  criteria: "Win a tournament",
                  createdAt: new Date()
                }} 
                unlocked={false}
              />
            )}
            
            {/* Always show at least one locked achievement */}
            <AchievementBadge 
              achievement={{
                id: 0,
                name: "Champion",
                description: "Win a tournament",
                xpReward: 500,
                category: "tournament",
                difficulty: "hard",
                badgeImageUrl: null,
                criteria: "Win a tournament",
                createdAt: new Date()
              }} 
              unlocked={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
