import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { userApi, leaderboardApi } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PassportQRCode from "@/components/passport/PassportQRCode";
import { CodeRedemptionForm } from "@/components/CodeRedemptionForm";
import { MatchRecordingForm } from "@/components/MatchRecordingForm";
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
  Medal, Gamepad2, Clock4, PanelTop, BarChart, Waypoints
} from "lucide-react";
import { Features, useFeatureFlag } from "@/lib/featureFlags";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Link } from "wouter";

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

  // Determine profile completion percentage if not already available
  const profileCompletionPct = user.profileCompletionPct || calculateProfileCompletion(user);

  // Calculate XP required to next level - simplified example
  const currentLevelXP = user.level * 1000;
  const nextLevelXP = (user.level + 1) * 1000;
  const xpProgress = Math.min(100, Math.max(0, ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));
  
  // Calculate tier info based on user level
  const tierInfo = getTierInfo(user.level);
  
  // Get achievement count 
  const achievementCount = 0; // This would come from a real query
  
  // Calculate stats
  const winRatio = user.totalMatches > 0 ? (user.matchesWon / user.totalMatches) : 0;
  
  return (
    <div className="profile-view pb-20 md:pb-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Hero Profile Card */}
          <Card className="overflow-hidden shadow-lg border-0">
            <div className="h-32 bg-gradient-to-r from-[#FF5722] to-[#2196F3] relative">
              {user.isFoundingMember && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-none font-medium px-3 flex items-center">
                    <Crown className="h-3 w-3 mr-1 text-yellow-300" />
                    Founding Member
                  </Badge>
                </div>
              )}
              
              <div className="absolute -bottom-16 left-6">
                <div className="rounded-full border-4 border-white bg-gradient-to-br from-[#FF5722] to-[#2196F3] w-32 h-32 flex items-center justify-center text-white text-5xl font-bold shadow-md">
                  {user.avatarInitials}
                  <div className="absolute -bottom-2 -right-2 rounded-full bg-[#4CAF50] text-white w-10 h-10 flex items-center justify-center text-sm font-bold border-2 border-white shadow-md">
                    {user.level}
                  </div>
                </div>
              </div>
            </div>
            
            <CardContent className="pt-20 pb-6 px-6">
              <div className="flex flex-col">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold mb-1 font-product-sans">{user.displayName}</h1>
                  <p className="text-muted-foreground flex items-center text-sm">
                    <User className="h-3.5 w-3.5 mr-1 opacity-70" />
                    @{user.username}
                  </p>
                </div>
                
                <div className="space-y-2 mb-6">
                  {user.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mr-2 opacity-70" />
                      {user.location}
                    </div>
                  )}
                  
                  {user.playingSince && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-2 opacity-70" />
                      Playing since {user.playingSince}
                    </div>
                  )}
                  
                  {user.skillLevel && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="h-3.5 w-3.5 mr-2 opacity-70" />
                      {user.skillLevel} Skill Level
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {user.paddleBrand && (
                    <Badge variant="secondary" className="bg-gray-100">
                      {user.paddleBrand} {user.paddleModel && `- ${user.paddleModel}`}
                    </Badge>
                  )}
                  
                  {user.preferredPosition && (
                    <Badge variant="secondary" className="bg-gray-100">
                      {user.preferredPosition}
                    </Badge>
                  )}
                  
                  {user.dominantHand && (
                    <Badge variant="secondary" className="bg-gray-100">
                      {user.dominantHand}-handed
                    </Badge>
                  )}
                  
                  {user.playingStyle && (
                    <Badge variant="secondary" className="bg-gray-100">
                      {user.playingStyle} Style
                    </Badge>
                  )}
                </div>
                
                {user.bio && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">About</h3>
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  </div>
                )}
                
                <div className="flex justify-between mt-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => setLocation("/profile/edit")}
                  >
                    <UserCog size={15} />
                    Edit Profile
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm" 
                    className="flex items-center gap-2 text-[#4CAF50] border-[#4CAF50]/30"
                    onClick={() => setLocation("/coach/profile/edit")}
                  >
                    <Megaphone size={15} />
                    Coach Portal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Profile Completeness */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Profile Completeness</CardTitle>
                <Badge variant={profileCompletionPct === 100 ? "default" : "outline"} className={profileCompletionPct === 100 ? "bg-[#4CAF50]" : ""}>
                  {profileCompletionPct}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <Progress value={profileCompletionPct} className="h-2 mb-4" />
              
              {profileCompletionPct < 100 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Complete your profile to unlock additional features:</p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {!user.bio && (
                      <div className="flex items-center justify-between text-sm py-1">
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                          Add a short bio
                        </span>
                        <Badge variant="outline" className="text-amber-500">+5 XP</Badge>
                      </div>
                    )}
                    
                    {!user.paddleBrand && (
                      <div className="flex items-center justify-between text-sm py-1">
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                          Add paddle information
                        </span>
                        <Badge variant="outline" className="text-amber-500">+5 XP</Badge>
                      </div>
                    )}
                    
                    {!user.playingStyle && (
                      <div className="flex items-center justify-between text-sm py-1">
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>
                          Add playing style
                        </span>
                        <Badge variant="outline" className="text-amber-500">+5 XP</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {profileCompletionPct === 100 && (
                <div className="flex items-center justify-center text-sm text-[#4CAF50] font-medium">
                  <BadgePlus className="mr-2 h-4 w-4" />
                  Profile Complete! 
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Passport QR Code */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pickleball Passport</CardTitle>
              <CardDescription>Your digital identity for tournaments</CardDescription>
            </CardHeader>
            <CardContent>
              {showPassportQR ? (
                <div className="flex flex-col items-center">
                  <PassportQRCode user={user} />
                  <div className="mt-3 text-sm text-center text-muted-foreground">
                    <p>Show this QR code for easy tournament check-in</p>
                    <Button variant="ghost" size="sm" className="mt-2 gap-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share QR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <div className="text-[#FF5722] font-semibold mb-1">QR Code Coming Soon!</div>
                  <p className="text-sm text-gray-600">Your digital passport is on the way. Check back on April 12, 2025!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Center & Right Columns - Stats, Achievements, Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP and Level Progress */}
          <Card className="shadow-md border-0 bg-gradient-to-r from-[#FF5722]/90 to-[#FF9800]/90 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold">{tierInfo.name}</h3>
                  <p className="text-white/80 text-sm">{tierInfo.description}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">{user.xp.toLocaleString()}</div>
                  <div className="text-xs text-right text-white/80">Total XP</div>
                </div>
              </div>
              
              <div className="mb-1 flex justify-between text-sm">
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
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code Redemption Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BadgePlus className="h-5 w-5 text-[#FF5722]" /> 
                  Redeem Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeRedemptionForm />
              </CardContent>
            </Card>
            
            {/* Record Match Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#2196F3]" /> 
                  Record Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showQuickMatch ? (
                  <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-[#2196F3] hover:bg-[#1976D2]">
                        <PlusCircle size={16} className="mr-2" /> Log Match Results
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
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-[#2196F3] font-semibold mb-1">Feature Coming Soon!</div>
                    <p className="text-sm text-gray-600">Quick match recording will be available on April 8, 2025!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Statistics */}
          <Card>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <ActivityIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
                          <p className="font-medium">No activity recorded yet</p>
                          <p className="text-sm mt-1">Start playing matches to track your progress</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="achievements" className="pt-4">
                  <div className="text-center py-10 border border-dashed rounded-lg border-gray-200">
                    <Medal className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <h3 className="text-lg font-medium mb-1">Achievements Coming Soon</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Track your milestones and unlock special badges as you progress in your pickleball journey.
                    </p>
                    <Badge variant="outline" className="mt-4">Coming April 15, 2025</Badge>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
