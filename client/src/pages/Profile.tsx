import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { userApi, leaderboardApi } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PassportQRCode from "@/components/passport/PassportQRCode";
import { CodeRedemptionForm } from "@/components/CodeRedemptionForm";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Activity } from "@/types";
import { PlusCircle, Award, TrendingUp, ArrowUp, ArrowDown, UserCog, Megaphone, ChevronRight } from "lucide-react";
import { Features, useFeatureFlag } from "@/lib/featureFlags";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function Profile() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [, setLocation] = useLocation();
  
  // Check feature flags
  const showPassportQR = useFeatureFlag(Features.PASSPORT_QR);
  const showQuickMatch = useFeatureFlag(Features.QUICK_MATCH);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, setLocation]);
  
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  
  // Fetch user activities for statistics
  const { 
    data: activities,
    isLoading: activitiesLoading
  } = useQuery<Activity[]>({
    queryKey: ["/api/user/activities"],
    enabled: isAuthenticated,
  });
  
  // Fetch user ranking history
  const {
    data: rankingHistory = [],
    isLoading: rankingHistoryLoading
  } = useQuery<any[]>({
    queryKey: ["/api/user/ranking-history"],
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
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1 font-product-sans">{user.displayName}</h2>
                  <p className="text-gray-500 mb-2">
                    {user.location} • Playing since {user.playingSince || "recently"}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 mt-1">
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="flex items-center gap-2 shadow-sm"
                    onClick={() => setLocation("/profile/edit")}
                  >
                    <UserCog size={18} />
                    Edit Profile
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    size="default" 
                    className="flex items-center gap-2 shadow-sm bg-[#4CAF50]/15 text-[#4CAF50] hover:bg-[#4CAF50]/25 border border-[#4CAF50]/30 font-medium"
                    onClick={() => setLocation("/coach/profile")}
                  >
                    <Megaphone size={18} />
                    Coach Profile
                  </Button>
                </div>
              </div>
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
                {user.profileCompletionPct ? (
                  <span className="bg-purple-100 text-purple-600 text-xs px-3 py-1 rounded-full mb-2">
                    {user.profileCompletionPct}% Profile Complete
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* QR Code Passport - Only display if feature is enabled */}
          {showPassportQR && (
            <div className="mt-4">
              <PassportQRCode user={user} />
            </div>
          )}
          
          {/* Coming Soon Message for Passport QR when disabled */}
          {!showPassportQR && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-[#FF5722] font-semibold mb-1">Passport QR Code Coming Soon!</div>
              <p className="text-sm text-gray-600">Your digital pickleball passport is on the way. Check back on April 12, 2025!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Code Redemption Section */}
      <Card className="mb-6 pickle-shadow">
        <CardContent className="p-6">
          <CodeRedemptionForm />
        </CardContent>
      </Card>
      
      {/* Match Recording Button - Only display if feature is enabled */}
      {showQuickMatch && (
        <div className="flex justify-end mb-6">
          <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#FF5722] flex items-center gap-2">
                <PlusCircle size={16} /> Record Match
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Match Results</DialogTitle>
                <DialogDescription>
                  Log your match results to earn XP and ranking points.
                </DialogDescription>
              </DialogHeader>
              <MatchRecordingForm onSuccess={() => setMatchDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {/* Ranking Card */}
      <Card className="mb-6 pickle-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold font-product-sans">Ranking Status</h3>
            <div className="flex items-center bg-[#FF5722] bg-opacity-10 text-[#FF5722] px-3 py-1 rounded-full">
              <TrendingUp size={16} className="mr-1" /> 
              <span className="font-bold">{user.rankingPoints || 0}</span>
              <span className="text-xs ml-1">pts</span>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Award className="mr-1 h-4 w-4" /> Recent Ranking Changes
            </h4>
            
            {rankingHistoryLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : rankingHistory && rankingHistory.length > 0 ? (
              <div className="space-y-2">
                {rankingHistory.slice(0, 5).map((item: any, index: number) => {
                  const pointChange = item.newRanking - item.oldRanking;
                  const isPositive = pointChange > 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div>
                        <div className="text-sm font-medium">{item.reason}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`flex items-center ${isPositive ? 'text-[#4CAF50]' : 'text-[#FF5722]'}`}>
                        {isPositive ? (
                          <ArrowUp size={16} className="mr-1" />
                        ) : (
                          <ArrowDown size={16} className="mr-1" />
                        )}
                        <span className="font-bold">{isPositive ? '+' : ''}{pointChange}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <TrendingUp className="mx-auto h-8 w-8 mb-2 opacity-40" />
                <p>No ranking history yet</p>
                <p className="text-xs">Play matches to earn ranking points</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics Section */}
      <Card className="mb-6 pickle-shadow">
        <CardContent className="p-6">
          <Tabs defaultValue="stats">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats">
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
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="space-y-2">
                {activitiesLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : activities && activities.length > 0 ? (
                  activities.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-start border-b border-gray-100 pb-3 last:border-0">
                      <div className="p-2 rounded-full bg-[#F5F5F5] mr-3">
                        {activity.type === 'match_played' ? (
                          <TrendingUp className="h-4 w-4 text-[#FF5722]" />
                        ) : activity.type === 'tournament' ? (
                          <Award className="h-4 w-4 text-[#2196F3]" />
                        ) : (
                          <Award className="h-4 w-4 text-[#4CAF50]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.description}</div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                          <span className="text-[#4CAF50]">+{activity.xpEarned} XP</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
