import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { leaderboardApi } from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Medal } from "lucide-react";
import type { User } from "@/types";

type LeaderboardType = "xp" | "ranking";

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<LeaderboardType>("xp");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, setLocation]);
  
  // Fetch XP leaderboard data
  const { 
    data: xpLeaderboardUsers,
    isLoading: isLoadingXp
  } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
  });
  
  // Fetch ranking leaderboard data
  const {
    data: rankingLeaderboardUsers,
    isLoading: isLoadingRanking
  } = useQuery<User[]>({
    queryKey: ["/api/ranking-leaderboard"],
    enabled: isAuthenticated,
  });

  // Get the current leaderboard data based on active tab
  const currentLeaderboard = activeTab === "xp" ? xpLeaderboardUsers : rankingLeaderboardUsers;
  const isLoading = activeTab === "xp" ? isLoadingXp : isLoadingRanking;

  return (
    <div className="leaderboard-view pb-20 md:pb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2 font-product-sans">Leaderboard</h2>
        <p className="text-gray-500">See how you rank against other pickleball enthusiasts</p>
      </div>
      
      <Tabs
        defaultValue="xp"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as LeaderboardType)}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="xp" className="flex items-center gap-2">
            <Trophy size={16} /> XP Leaderboard
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Medal size={16} /> Ranking Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="xp" className="mt-0">
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
              ) : currentLeaderboard && currentLeaderboard.length > 0 ? (
                // Leaderboard entries
                currentLeaderboard.map((leaderboardUser, index) => {
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
                          {leaderboardUser.xp?.toLocaleString() || 0} XP
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Empty state
                <div className="p-8 text-center">
                  <Trophy className="mx-auto h-16 w-16 text-gray-300 mb-2" />
                  <h3 className="font-bold mb-1">No players yet</h3>
                  <p className="text-sm text-gray-500">
                    Be the first to join the XP leaderboard!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ranking" className="mt-0">
          <Card className="pickle-shadow">
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-200 bg-[#FF5722] bg-opacity-10">
                <div className="grid grid-cols-12 text-sm font-medium">
                  <div className="col-span-1 text-gray-500">#</div>
                  <div className="col-span-6 text-gray-500">Player</div>
                  <div className="col-span-2 text-gray-500 text-center">Win/Loss</div>
                  <div className="col-span-3 text-gray-500 text-right">Ranking Points</div>
                </div>
              </div>
              
              {isLoading ? (
                // Loading state
                Array(10).fill(0).map((_, index) => (
                  <div key={index} className="border-b border-gray-100 p-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              ) : currentLeaderboard && currentLeaderboard.length > 0 ? (
                // Leaderboard entries
                currentLeaderboard.map((leaderboardUser, index) => {
                  const isCurrentUser = user?.id === leaderboardUser.id;
                  const winRate = leaderboardUser.totalMatches 
                    ? Math.round((leaderboardUser.matchesWon / leaderboardUser.totalMatches) * 100) 
                    : 0;
                  
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
                          <div className="text-sm">
                            <span className="font-medium">{leaderboardUser.matchesWon || 0}W</span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="font-medium">{(leaderboardUser.totalMatches || 0) - (leaderboardUser.matchesWon || 0)}L</span>
                            <div className="text-xs text-gray-500">{winRate}% win rate</div>
                          </div>
                        </div>
                        <div className="col-span-3 text-right font-bold">
                          {leaderboardUser.rankingPoints?.toLocaleString() || 0} pts
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Empty state
                <div className="p-8 text-center">
                  <Medal className="mx-auto h-16 w-16 text-gray-300 mb-2" />
                  <h3 className="font-bold mb-1">No ranking data yet</h3>
                  <p className="text-sm text-gray-500">
                    Play matches to earn ranking points!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {user && (
        <div className="mt-6">
          {activeTab === "xp" ? (
            <>
              <h3 className="font-bold mb-3 font-product-sans">How XP Points Work</h3>
              <Card className="pickle-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-[#FF5722] text-xl font-bold mb-1">+25</div>
                      <div className="text-xs text-gray-500">Play a Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#2196F3] text-xl font-bold mb-1">+50</div>
                      <div className="text-xs text-gray-500">Tournament Check-In</div>
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
            </>
          ) : (
            <>
              <h3 className="font-bold mb-3 font-product-sans">How Ranking Points Work</h3>
              <Card className="pickle-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-[#FF5722] text-xl font-bold mb-1">+10</div>
                      <div className="text-xs text-gray-500">Win Casual Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#2196F3] text-xl font-bold mb-1">+15</div>
                      <div className="text-xs text-gray-500">Win League Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#4CAF50] text-xl font-bold mb-1">+20</div>
                      <div className="text-xs text-gray-500">Win Tournament Match</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
