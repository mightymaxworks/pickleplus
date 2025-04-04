import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { userApi } from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { CodeRedemptionForm } from "@/components/CodeRedemptionForm";
import type { Activity } from "@/types";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, setLocation]);
  
  // Fetch user activities for statistics
  const { 
    data: activities,
    isLoading: activitiesLoading
  } = useQuery<Activity[]>({
    queryKey: ["/api/user/activities"],
    enabled: isAuthenticated,
  });
  
  if (!user) {
    return null;
  }
  
  // Calculate statistics from user data
  const winPercentage = user.totalMatches > 0 
    ? Math.round((user.matchesWon / user.totalMatches) * 100) 
    : 0;
  
  // Calculate XP by source (simplified calculation for demo)
  const matchXP = activities 
    ? activities.filter(a => a.type === 'match').reduce((sum, a) => sum + a.xpEarned, 0)
    : 1200;
    
  const tournamentXP = activities 
    ? activities.filter(a => a.type === 'tournament').reduce((sum, a) => sum + a.xpEarned, 0)
    : 1850;
    
  const achievementXP = activities 
    ? activities.filter(a => a.type === 'achievement').reduce((sum, a) => sum + a.xpEarned, 0)
    : 400;

  return (
    <div className="profile-view pb-20 md:pb-6">
      {/* Profile Card */}
      <Card className="mb-6 pickle-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center mb-6">
            <div className="relative mb-4 md:mb-0 md:mr-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FF5722] to-[#2196F3] flex items-center justify-center text-white text-4xl font-bold">
                {user.avatarInitials}
              </div>
              <div className="absolute -bottom-2 -right-2 player-level">{user.level}</div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-1 font-product-sans">{user.displayName}</h2>
              <p className="text-gray-500 mb-2">
                {user.location} • Playing since {user.playingSince || "recently"}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start">
                {user.skillLevel && (
                  <span className="bg-[#FF5722] bg-opacity-10 text-[#FF5722] text-xs px-3 py-1 rounded-full mr-2 mb-2">
                    {user.skillLevel} Skill Level
                  </span>
                )}
                <span className="bg-[#2196F3] bg-opacity-10 text-[#2196F3] text-xs px-3 py-1 rounded-full mr-2 mb-2">
                  {user.totalMatches} Matches
                </span>
                <span className="bg-[#4CAF50] bg-opacity-10 text-[#4CAF50] text-xs px-3 py-1 rounded-full mb-2">
                  {user.totalTournaments} Tournaments
                </span>
              </div>
            </div>
          </div>
          
          {/* QR Code Passport */}
          <QRCodeDisplay userId={user.id} username={user.username} />
        </CardContent>
      </Card>
      
      {/* Code Redemption Section */}
      <Card className="mb-6 pickle-shadow">
        <CardContent className="p-6">
          <CodeRedemptionForm />
        </CardContent>
      </Card>
      
      {/* Statistics Section */}
      <Card className="pickle-shadow">
        <CardContent className="p-6">
          <h3 className="font-bold mb-3 font-product-sans">My Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Win/Loss Record */}
            <div>
              <h4 className="text-sm font-medium mb-2">Win/Loss Record</h4>
              {activitiesLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <div className="flex">
                  <div 
                    className="flex-grow h-6 bg-[#4CAF50] rounded-l-full relative flex items-center pl-3"
                    style={{ width: `${winPercentage}%` }}
                  >
                    <span className="text-xs text-white font-medium z-10">
                      {user.matchesWon} Wins
                    </span>
                  </div>
                  <div 
                    className="h-6 bg-[#FF5722] rounded-r-full relative flex items-center justify-end pr-3"
                    style={{ width: `${100 - winPercentage}%` }}
                  >
                    <span className="text-xs text-white font-medium z-10">
                      {user.totalMatches - user.matchesWon} Losses
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tournament Performance */}
            <div>
              <h4 className="text-sm font-medium mb-2">Tournament Performance</h4>
              {activitiesLoading ? (
                <Skeleton className="h-6 w-full" />
              ) : (
                <div className="flex h-6">
                  <div className="w-1/5 h-full bg-[#2196F3] rounded-l-sm flex items-center justify-center">
                    <span className="text-xs text-white">1st</span>
                  </div>
                  <div className="w-2/5 h-full bg-[#2196F3] opacity-80 flex items-center justify-center">
                    <span className="text-xs text-white">2nd</span>
                  </div>
                  <div className="w-1/5 h-full bg-[#2196F3] opacity-60 flex items-center justify-center">
                    <span className="text-xs text-white">3rd</span>
                  </div>
                  <div className="w-1/5 h-full bg-[#2196F3] opacity-40 rounded-r-sm flex items-center justify-center">
                    <span className="text-xs text-white">Other</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* XP Earned by Activity */}
          <div>
            <h4 className="text-sm font-medium mb-2">XP Earned by Activity</h4>
            {activitiesLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#F5F5F5] rounded-lg p-3 text-center">
                  <div className="text-[#FF5722] text-xl font-bold mb-1">{matchXP}</div>
                  <div className="text-xs text-gray-500">Matches</div>
                </div>
                <div className="bg-[#F5F5F5] rounded-lg p-3 text-center">
                  <div className="text-[#2196F3] text-xl font-bold mb-1">{tournamentXP}</div>
                  <div className="text-xs text-gray-500">Tournaments</div>
                </div>
                <div className="bg-[#F5F5F5] rounded-lg p-3 text-center">
                  <div className="text-[#4CAF50] text-xl font-bold mb-1">{achievementXP}</div>
                  <div className="text-xs text-gray-500">Achievements</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
