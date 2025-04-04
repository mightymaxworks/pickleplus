import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { leaderboardApi } from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types";

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, setLocation]);
  
  // Fetch leaderboard data
  const { 
    data: leaderboardUsers,
    isLoading
  } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
  });

  return (
    <div className="leaderboard-view pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 font-product-sans">Leaderboard</h2>
        <p className="text-gray-500">See how you rank against other pickleball enthusiasts</p>
      </div>
      
      <Card className="pickle-shadow">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 bg-[#2196F3] bg-opacity-10">
            <div className="grid grid-cols-12 text-sm font-medium">
              <div className="col-span-1 text-gray-500">#</div>
              <div className="col-span-6 text-gray-500">Player</div>
              <div className="col-span-2 text-gray-500 text-center">Level</div>
              <div className="col-span-3 text-gray-500 text-right">XP Points</div>
            </div>
          </div>
          
          {isLoading ? (
            // Loading state
            Array(10).fill(0).map((_, index) => (
              <div key={index} className="border-b border-gray-100 p-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))
          ) : leaderboardUsers && leaderboardUsers.length > 0 ? (
            // Leaderboard entries
            leaderboardUsers.map((leaderboardUser, index) => {
              const isCurrentUser = user?.id === leaderboardUser.id;
              
              return (
                <div 
                  key={leaderboardUser.id} 
                  className={`p-4 border-b border-gray-100 ${
                    isCurrentUser ? "bg-[#FF5722] bg-opacity-5" : ""
                  }`}
                >
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-1 font-bold">
                      {index + 1}
                    </div>
                    <div className="col-span-6 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#FF5722] to-[#2196F3] flex items-center justify-center text-white font-bold mr-3">
                        {leaderboardUser.avatarInitials || leaderboardUser.displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {leaderboardUser.displayName}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-[#FF5722] text-white px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {leaderboardUser.location || "No location"}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="player-level mx-auto">
                        {leaderboardUser.level || 1}
                      </div>
                    </div>
                    <div className="col-span-3 text-right font-bold">
                      {leaderboardUser.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty state
            <div className="p-8 text-center">
              <span className="material-icons text-6xl text-gray-300 mb-2">leaderboard</span>
              <h3 className="font-bold mb-1">No players yet</h3>
              <p className="text-sm text-gray-500">
                Be the first to join the leaderboard!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {user && leaderboardUsers && (
        <div className="mt-6">
          <h3 className="font-bold mb-3 font-product-sans">How XP Points Work</h3>
          <Card className="pickle-shadow">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-[#FF5722] text-xl font-bold mb-1">+50</div>
                  <div className="text-xs text-gray-500">Per Match Win</div>
                </div>
                <div className="text-center">
                  <div className="text-[#2196F3] text-xl font-bold mb-1">+250</div>
                  <div className="text-xs text-gray-500">Tournament Placement</div>
                </div>
                <div className="text-center">
                  <div className="text-[#4CAF50] text-xl font-bold mb-1">+100</div>
                  <div className="text-xs text-gray-500">Unlocked Achievement</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-500 text-xl font-bold mb-1">+?</div>
                  <div className="text-xs text-gray-500">Redeem Special Codes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
