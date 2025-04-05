import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { userApi, leaderboardApi } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Activity } from "@/types";
import { 
  PlusCircle, Award, TrendingUp, ArrowUp, ArrowDown, UserCog, Megaphone, 
  ChevronRight, User, MapPin, Calendar, Clock, Trophy, Activity as ActivityIcon,
  Crown, Share2, BadgePlus, Target, Zap, Dumbbell, Heart, Flame, Sparkles, 
  Medal, Gamepad2, Clock4, PanelTop, BarChart, Waypoints, Bell, QrCode
} from "lucide-react";
import { Features, useFeatureFlag } from "@/lib/featureFlags";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Link } from "wouter";

// Import our new component
import { PersonalInformationCard } from "@/components/profile/PersonalInformationCard";
import { ProfileCompletenessCard } from "@/components/profile/ProfileCompletenessCard";
import { PassportQrCodeCard } from "@/components/profile/PassportQrCodeCard";
import { QuickActionsCard } from "@/components/profile/QuickActionsCard";
import { UpcomingTournamentsCard } from "@/components/profile/UpcomingTournamentsCard";

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(user: any): number {
  const requiredFields = [
    'location',
    'playingSince',
    'skillLevel',
    'bio',
    'paddleBrand',
    'paddleModel',
    'preferredPosition',
    'dominantHand',
    'playingStyle'
  ];
  
  let filledFields = 0;
  requiredFields.forEach(field => {
    if (user[field]) filledFields++;
  });
  
  return Math.round((filledFields / requiredFields.length) * 100);
}

// Helper function to get tier information based on user level
function getTierInfo(level: number): { name: string; description: string } {
  // Define tier levels
  const tiers = [
    { min: 1, max: 15, name: "Dink Dabbler", description: "Just starting your pickleball journey" },
    { min: 16, max: 30, name: "Rally Rookie", description: "Growing your skills on the court" },
    { min: 31, max: 45, name: "Serve Specialist", description: "Mastering the fundamentals" },
    { min: 46, max: 60, name: "Volley Virtuoso", description: "Developing advanced techniques" },
    { min: 61, max: 75, name: "Third Shot Tactician", description: "Strategic play and court awareness" },
    { min: 76, max: 90, name: "Kitchen Commander", description: "Dominating the non-volley zone" },
    { min: 91, max: 100, name: "Pickleball Pro", description: "Elite skills and tournament ready" }
  ];
  
  // Find the tier for the user's level
  const userTier = tiers.find(tier => level >= tier.min && level <= tier.max);
  
  // Return the tier data or a default if not found
  return userTier || { name: "Pickle Padawan", description: "Finding your way in pickleball" };
}

export default function Profile() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [, setLocation] = useLocation();
  
  // Check feature flags
  const showPassportQR = useFeatureFlag(Features.PASSPORT_QR);
  
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

  // Fetch user tournaments
  const {
    data: userTournaments = [],
    isLoading: tournamentsLoading
  } = useQuery({
    queryKey: ["/api/user/tournaments"],
    enabled: isAuthenticated,
  });
  
  // Fetch user achievements
  const { 
    data: achievements = [],
    isLoading: achievementsLoading 
  } = useQuery({
    queryKey: ["/api/user/achievements"],
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

  // Determine profile completion percentage if not already available
  const profileCompletionPct = user.profileCompletionPct || calculateProfileCompletion(user);

  // Calculate XP required to next level - simplified example
  const currentLevelXP = user.level * 1000;
  const nextLevelXP = (user.level + 1) * 1000;
  const xpProgress = Math.min(100, Math.max(0, ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));
  
  // Calculate tier info based on user level
  const tierInfo = getTierInfo(user.level);
  
  // Get achievement count 
  const achievementCount = achievements ? achievements.length : 0;
  
  // Calculate stats
  const winRatio = user.totalMatches > 0 ? (user.matchesWon / user.totalMatches) : 0;
  
  return (
    <div className="profile-view pb-20 md:pb-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-[#FF5722] to-[#FF9800]"></div>
            <div className="px-6 pb-6 relative">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md -mt-12 overflow-hidden">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user.avatarInitials || user.username?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold flex items-center justify-center gap-1">
                  {user.displayName || user.username}
                  {user.isFoundingMember && (
                    <Badge variant="outline" className="ml-1 border-amber-500 text-amber-500">
                      <Crown className="h-3 w-3 mr-1" /> Founding Member
                    </Badge>
                  )}
                </h2>
                <p className="text-muted-foreground text-sm">@{user.username}</p>
                
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {user.isCoach && (
                    <Badge className="bg-[#2196F3] hover:bg-[#1E88E5]" onClick={() => setLocation('/coaching')}>
                      Coach
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="border-[#9C27B0] text-[#9C27B0]">
                    {tierInfo.name}
                  </Badge>
                  
                  <Badge variant="outline" className="border-[#FF5722] text-[#FF5722]">
                    Level {user.level}
                  </Badge>
                </div>
                
                <div className="mt-6 text-sm text-muted-foreground">
                  {tierInfo.description}
                </div>
                
                <div className="mt-6 flex justify-center gap-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => setLocation('/profile/edit')}
                  >
                    <UserCog className="h-3.5 w-3.5 mr-1" />
                    Edit Profile
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const url = `https://pickleplus.app/player/${user.username}`;
                      navigator.clipboard.writeText(url);
                      alert('Profile URL copied to clipboard!');
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Level Card */}
          <Card className="overflow-hidden bg-gradient-to-br from-[#673AB7] to-[#3F51B5] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="border-white/50 text-white bg-white/10 hover:bg-white/20">
                  {tierInfo.name}
                </Badge>
                <div className="text-sm">Level {user.level}</div>
              </div>
              
              <div className="flex justify-between text-sm mb-1 text-white/80">
                <span>Level {user.level}</span>
                <span>Level {user.level + 1}</span>
              </div>
              
              <Progress value={xpProgress} className="h-2 bg-white/30" indicatorClassName="bg-white" />
              
              <div className="mt-1 text-xs text-white/80 text-right">
                {Math.floor(nextLevelXP - user.xp).toLocaleString()} XP until next level
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold mb-1">{user.matchesWon}</div>
                  <div className="text-xs">Wins</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold mb-1">{user.totalTournaments}</div>
                  <div className="text-xs">Tournaments</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold mb-1">{achievementCount}</div>
                  <div className="text-xs">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passport QR Card - removed in favor of global QR code button */}
          
          {/* Upcoming Tournaments Card */}
          <UpcomingTournamentsCard 
            tournaments={userTournaments} 
            isLoading={tournamentsLoading} 
          />
          
          {/* Quick Actions Card */}
          <QuickActionsCard 
            matchDialogOpen={matchDialogOpen}
            setMatchDialogOpen={setMatchDialogOpen}
          />
        </div>
        
        {/* Right Column - Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6 col-span-2 md:col-span-1">
              <PersonalInformationCard user={user} />
              <ProfileCompletenessCard 
                user={user} 
                profileCompletion={profileCompletionPct} 
              />
            </div>
            
            {/* Detailed Statistics */}
            <Card className="col-span-2 md:col-span-1">
              <CardHeader className="pb-0">
                <Tabs defaultValue="performance">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="performance" className="text-sm">
                      <ActivityIcon className="h-4 w-4 mr-2" />
                      Performance
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Activity
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="text-sm">
                      <Trophy className="h-4 w-4 mr-2" />
                      Achievements
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="performance" className="pt-4">
                    <div className="space-y-6">
                      {/* Win/Loss Record */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <Gamepad2 className="h-4 w-4 mr-2 text-[#FF5722]" /> 
                          Win/Loss Record
                        </h4>
                        
                        {activitiesLoading ? (
                          <Skeleton className="h-16 w-full" />
                        ) : (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Win Rate: <span className="font-semibold">{(winRatio * 100).toFixed(1)}%</span></span>
                              <span className="text-muted-foreground">{user.matchesWon} / {user.totalMatches} matches</span>
                            </div>
                            
                            <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                              <div 
                                className="bg-gradient-to-r from-[#4CAF50] to-[#8BC34A]"
                                style={{ width: `${winRatio * 100}%` }}
                              ></div>
                              <div 
                                className="bg-gradient-to-r from-[#FF5722] to-[#FF9800]"
                                style={{ width: `${(1 - winRatio) * 100}%` }}
                              ></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <div className="bg-[#4CAF50]/10 text-[#4CAF50] rounded-lg p-3 text-center">
                                <div className="text-lg font-bold">{user.matchesWon}</div>
                                <div className="text-xs">Wins</div>
                              </div>
                              <div className="bg-[#FF5722]/10 text-[#FF5722] rounded-lg p-3 text-center">
                                <div className="text-lg font-bold">{user.totalMatches - user.matchesWon}</div>
                                <div className="text-xs">Losses</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Ranking */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center">
                          <BarChart className="h-4 w-4 mr-2 text-[#2196F3]" /> 
                          Ranking Points
                        </h4>
                        
                        {rankingHistoryLoading ? (
                          <Skeleton className="h-16 w-full" />
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center bg-[#2196F3]/10 text-[#2196F3] px-4 py-3 rounded-lg">
                              <div className="flex-1">
                                <div className="text-xs uppercase">Current Ranking</div>
                                <div className="text-2xl font-bold">{user.rankingPoints || 0}</div>
                              </div>
                              <div className="p-2 bg-[#2196F3] rounded-full">
                                <TrendingUp className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            
                            <div className="text-sm font-medium">Recent Changes</div>
                            <ScrollArea className="h-24">
                              {rankingHistory && rankingHistory.length > 0 ? (
                                <div className="space-y-2">
                                  {rankingHistory.slice(0, 5).map((item: any, index: number) => {
                                    const pointChange = item.newRanking - item.oldRanking;
                                    const isPositive = pointChange > 0;
                                    
                                    return (
                                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div>
                                          <div className="text-sm font-medium">{item.reason}</div>
                                          <div className="text-xs text-muted-foreground">
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
                                <div className="text-center py-6 text-muted-foreground text-sm">
                                  <p>No ranking history yet</p>
                                  <p className="text-xs mt-1">Play matches to earn ranking points</p>
                                </div>
                              )}
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* XP Breakdown */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-[#9C27B0]" /> 
                        XP Breakdown
                      </h4>
                      
                      {activitiesLoading ? (
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gradient-to-br from-[#FF5722]/10 to-[#FF9800]/10 rounded-lg p-4 text-center border border-[#FF5722]/20">
                            <div className="text-xl font-bold mb-1 text-[#FF5722]">{matchXP}</div>
                            <div className="text-xs text-[#FF5722]/80 font-medium">Match XP</div>
                            <div className="text-[10px] text-muted-foreground">{Math.round((matchXP / user.xp) * 100)}% of total</div>
                          </div>
                          <div className="bg-gradient-to-br from-[#2196F3]/10 to-[#03A9F4]/10 rounded-lg p-4 text-center border border-[#2196F3]/20">
                            <div className="text-xl font-bold mb-1 text-[#2196F3]">{tournamentXP}</div>
                            <div className="text-xs text-[#2196F3]/80 font-medium">Tournament XP</div>
                            <div className="text-[10px] text-muted-foreground">{Math.round((tournamentXP / user.xp) * 100)}% of total</div>
                          </div>
                          <div className="bg-gradient-to-br from-[#4CAF50]/10 to-[#8BC34A]/10 rounded-lg p-4 text-center border border-[#4CAF50]/20">
                            <div className="text-xl font-bold mb-1 text-[#4CAF50]">{achievementXP}</div>
                            <div className="text-xs text-[#4CAF50]/80 font-medium">Achievement XP</div>
                            <div className="text-[10px] text-muted-foreground">{Math.round((achievementXP / user.xp) * 100)}% of total</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="pt-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <Clock4 className="h-4 w-4 mr-2 text-[#9C27B0]" /> 
                      Recent Activity
                    </h4>
                    
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {activitiesLoading ? (
                          Array(8).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))
                        ) : activities && activities.length > 0 ? (
                          activities.map((activity, index) => (
                            <Card key={index} className="overflow-hidden">
                              <div className="flex items-start p-4">
                                <div className={`p-3 rounded-full mr-4 ${
                                  activity.type === 'match' ? 'bg-[#FF5722]/10 text-[#FF5722]' : 
                                  activity.type === 'tournament' ? 'bg-[#2196F3]/10 text-[#2196F3]' : 
                                  'bg-[#4CAF50]/10 text-[#4CAF50]'
                                }`}>
                                  {activity.type === 'match' ? (
                                    <Gamepad2 className="h-5 w-5" />
                                  ) : activity.type === 'tournament' ? (
                                    <Trophy className="h-5 w-5" />
                                  ) : activity.type === 'achievement' ? (
                                    <Medal className="h-5 w-5" />
                                  ) : (
                                    <ActivityIcon className="h-5 w-5" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="font-medium">{activity.description}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                
                                <div className="flex items-center px-3 py-1 rounded-full bg-[#4CAF50]/10 text-[#4CAF50] text-sm font-medium">
                                  <Zap className="h-3.5 w-3.5 mr-1" />
                                  +{activity.xpEarned} XP
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-10 text-muted-foreground">
                            <ActivityIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p>No activities recorded yet</p>
                            <p className="text-sm mt-2">Play matches, join tournaments, and earn achievements to see your activity here.</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="achievements" className="pt-4">
                    <div className="text-center py-12 text-muted-foreground">
                      <Medal className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p>Achievements coming soon!</p>
                      <p className="text-sm mt-2">Earn badges and rewards for your pickleball accomplishments.</p>
                      <Button variant="outline" className="mt-6">
                        <Bell className="mr-2 h-4 w-4" />
                        Notify Me When Available
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>

          {/* Player Equipment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-[#9C27B0]" /> 
                Player Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Paddle */}
                <div className="bg-[#9C27B0]/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-[#9C27B0] mb-2">Paddle</h4>
                  {user.paddleBrand || user.paddleModel ? (
                    <div className="space-y-2">
                      {user.paddleBrand && (
                        <div>
                          <div className="text-xs text-muted-foreground">Brand</div>
                          <div className="font-medium">{user.paddleBrand}</div>
                        </div>
                      )}
                      {user.paddleModel && (
                        <div>
                          <div className="text-xs text-muted-foreground">Model</div>
                          <div className="font-medium">{user.paddleModel}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      Not specified
                    </div>
                  )}
                </div>
                
                {/* Play Style */}
                <div className="bg-[#FF5722]/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-[#FF5722] mb-2">Play Style</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Preferred Position</div>
                      <div className="font-medium">{user.preferredPosition || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Playing Style</div>
                      <div className="font-medium">{user.playingStyle || "Not specified"}</div>
                    </div>
                  </div>
                </div>
                
                {/* Personal */}
                <div className="bg-[#2196F3]/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-[#2196F3] mb-2">Personal</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Dominant Hand</div>
                      <div className="font-medium">{user.dominantHand || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Skill Level</div>
                      <div className="font-medium">{user.skillLevel || "Not specified"}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {(!user.paddleBrand && !user.paddleModel && !user.preferredPosition && !user.playingStyle && !user.dominantHand && !user.skillLevel) && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/profile/edit">Add Your Equipment & Style</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}