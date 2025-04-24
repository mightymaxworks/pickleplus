import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useFeatureFlag, Features } from '@/lib/featureFlags';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Activity, 
  BarChart4, 
  User, 
  Clock, 
  ChevronRight, 
  Calendar, 
  Shield, 
  Award,
  Sword, // Using Sword as a substitute for Racquet
} from "lucide-react";

import { ProfileImageEditor } from "@/components/profile/ProfileImageEditor";
import { EditableProfileHeader } from "@/components/profile/EditableProfileHeader";
import { EditablePersonalInformationCard } from "@/components/profile/EditablePersonalInformationCard";
import { ProfileCompletenessCard } from "@/components/profile/ProfileCompletenessCard";

interface Activity {
  id: number;
  type: string;
  description: string;
  date: string;
  xpEarned?: number;
}

export default function EnhancedProfile() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  
  // If user is not authenticated, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  
  // Get profile completion percentage
  const { data: profileCompletion } = useQuery({
    queryKey: ["/api/profile/completion"],
    enabled: !!user,
  });
  
  // Get user activities
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/user/activities"],
    enabled: !!user,
  });
  
  // Get user XP tier info
  const { data: xpTierInfo } = useQuery({
    queryKey: ["/api/user/xp-tier"],
    enabled: !!user,
  });
  
  // Loading state
  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-t-[#FF5722] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    );
  }
  
  // Calculate win rate
  const calculateWinRate = () => {
    if (!user.totalMatches || user.totalMatches === 0) return 0;
    return Math.round((user.matchesWon / user.totalMatches) * 100);
  };
  
  const winRate = calculateWinRate();
  
  // Get appropriate level info
  const getLevelInfo = () => {
    if (!xpTierInfo) {
      return {
        name: `Level ${user.level || 1}`,
        description: "Keep playing to earn XP and level up!"
      };
    }
    
    return {
      name: xpTierInfo.levelName || `Level ${user.level || 1}`,
      description: xpTierInfo.levelDescription || "Keep playing to earn XP and level up!"
    };
  };
  
  const levelInfo = getLevelInfo();
  
  // Calculate XP progress percentage
  const getXpProgressPercentage = () => {
    if (!xpTierInfo || !user.level || !user.xp) return 0;
    
    const { totalXpForNextLevel, xpInCurrentLevel, xpRequiredForCurrentLevel } = xpTierInfo;
    return Math.round((xpInCurrentLevel / (totalXpForNextLevel - xpRequiredForCurrentLevel)) * 100);
  };
  
  const xpProgressPercentage = getXpProgressPercentage();
  
  // Format activities for display
  const formatActivityType = (type: string) => {
    if (type === "match_played") return "Match";
    if (type === "match_won") return "Match Win";
    if (type === "match_completed") return "Match Completed";
    if (type === "profile_update") return "Profile Update";
    if (type === "achievement_unlocked") return "Achievement";
    if (type === "tournament_registration") return "Tournament";
    if (type === "tournament_check_in") return "Tournament";
    if (type === "ranking_change") return "Ranking Change";
    if (type === "level_up") return "Level Up";
    if (type === "code_redeemed") return "Code Redeemed";
    if (type === "connection_created") return "New Connection";
    return type.replace(/_/g, ' ');
  };
  
  const getActivityIcon = (type: string) => {
    if (type.includes("match")) return <Sword className="h-4 w-4" />;
    if (type.includes("profile")) return <User className="h-4 w-4" />;
    if (type.includes("achievement")) return <Award className="h-4 w-4" />;
    if (type.includes("tournament")) return <Trophy className="h-4 w-4" />;
    if (type.includes("ranking")) return <BarChart4 className="h-4 w-4" />;
    if (type.includes("level")) return <Shield className="h-4 w-4" />;
    if (type.includes("code")) return <Award className="h-4 w-4" />;
    if (type.includes("connection")) return <User className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };
  
  // Check if the enhanced profile feature is enabled
  const showEnhancedProfile = useFeatureFlag(Features.ENHANCED_PROFILE);
          
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <h1 className="text-2xl font-bold">My Profile</h1>
            
            {/* Always show Enhanced Profile badge */}
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => navigate('/profile/enhanced')}
            >
              Try Enhanced Profile <ChevronRight className="h-3 w-3 ml-1" />
            </Badge>
          </div>
          
          <TabsList className="bg-muted rounded-lg">
            <TabsTrigger value="profile" className="data-[state=active]:bg-background">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-background">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="profile" className="space-y-8 mt-0">
          {/* Profile Header */}
          <EditableProfileHeader user={user} tierInfo={levelInfo} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <EditablePersonalInformationCard user={user} />
              
              {/* Match Stats Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Match Statistics</CardTitle>
                  <CardDescription>
                    Your performance on the court
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold">{user.totalMatches || 0}</div>
                      <div className="text-xs text-muted-foreground">Total Matches</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold">{user.matchesWon || 0}</div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold">
                        {user.totalMatches ? user.totalMatches - (user.matchesWon || 0) : 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Losses</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold">{winRate}%</div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Equipment Card */}
              {(user.paddleBrand || user.paddleModel) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Equipment</CardTitle>
                    <CardDescription>
                      Your pickleball gear
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {user.paddleBrand && (
                        <div className="flex items-start gap-3">
                          <Sword className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">Paddle</div>
                            <div className="text-sm text-muted-foreground">
                              {user.paddleBrand} {user.paddleModel}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              {/* Profile Completeness Card */}
              {profileCompletion && profileCompletion.completionPercentage < 100 ? (
                <ProfileCompletenessCard 
                  user={user} 
                  profileCompletion={profileCompletion.completionPercentage} 
                />
              ) : null}
              
              {/* XP Level Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-[#FF9800]" />
                    Player Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold">{user.level || 1}</div>
                      <div className="text-sm text-muted-foreground">{levelInfo.name}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{user.xp || 0} XP</span>
                        {xpTierInfo && (
                          <span>{xpTierInfo.xpForNextLevel} XP for Level {(user.level || 1) + 1}</span>
                        )}
                      </div>
                      <Progress value={xpProgressPercentage} className="h-2" />
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {xpTierInfo ? (
                        <>Need {xpTierInfo.xpForNextLevel} more XP to level up</>
                      ) : (
                        <>Keep playing to earn XP and level up!</>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Achievements Preview Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-[#FF9800]" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    {user.achievements && user.achievements.length > 0 ? (
                      <div className="space-y-2">
                        {user.achievements.slice(0, 3).map((achievement: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-[#FF5722]/10 flex items-center justify-center">
                              <Award className="h-4 w-4 text-[#FF5722]" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{achievement.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {achievement.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Award className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Complete matches and activities to earn achievements</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <Card className="mb-8">
            <CardHeader className="pb-0">
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                Recent activity on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {activitiesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 rounded-full border-4 border-t-[#FF5722] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  </div>
                ) : activities && activities.length > 0 ? (
                  <div className="space-y-0 relative">
                    {/* Activity Timeline */}
                    <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border"></div>
                    
                    {activities.map((activity: Activity, index: number) => (
                      <div key={index} className="relative pl-10 pr-4 py-4">
                        <div className="absolute left-0 top-5 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center z-10">
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                {activity.description}
                              </div>
                              {activity.xpEarned && activity.xpEarned > 0 && (
                                <Badge variant="outline" className="text-[#4CAF50] border-[#4CAF50]">
                                  +{activity.xpEarned} XP
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="rounded-sm text-xs font-normal">
                                {formatActivityType(activity.type)}
                              </Badge>
                              <span>•</span>
                              <span>{format(new Date(activity.timestamp), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <h3 className="text-lg font-medium mb-1">No activity yet</h3>
                    <p className="text-sm max-w-md mx-auto">
                      Start playing matches, participating in tournaments, or updating your profile to see your activity here.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}