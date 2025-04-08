import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useXPTier } from "@/hooks/useXPTier";
import { userApi, tournamentApi, achievementApi } from "@/lib/apiClient";
import { StatCard } from "@/components/StatCard";
import { ActivityCard } from "@/components/ActivityCard";
import { TournamentCard } from "@/components/TournamentCard";
import { AchievementBadge } from "@/components/AchievementBadge";
import { TierBadge } from "@/components/TierBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Achievement, Tournament, User as UserType } from "@/types";
import { FoundingMemberBadge } from "@/components/ui/founding-member-badge";
import { XpMultiplierIndicator } from "@/components/ui/xp-multiplier-indicator";
import { ChangelogBanner } from "@/components/ChangelogBanner";
import { useChangelogNotification } from "@/hooks/useChangelogNotification";
import { ConnectionStatsWidget } from "@/components/social/ConnectionStatsWidget";
import { SocialActivityFeed } from "@/components/social/SocialActivityFeed";
import type { SocialActivityType } from "@/components/social/SocialActivityFeed";
import { PCPGlobalRankingCard } from "@/components/ranking/PCPGlobalRankingCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/dashboard/PlayerCard";
import { QrCode, MapPin, Zap, Award, Calendar, Users, TrendingUp, Target, Settings, Scan, BookOpen, Plus, ArrowRight, Wrench, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewMatchRecordingForm } from "@/components/match/NewMatchRecordingForm";
import { formatDistanceToNow } from "date-fns";
import { TestUserGenerator } from "@/components/dev/TestUserGenerator";
import { toast } from "@/hooks/use-toast";

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

// Helper function to check if user is admin
const isAdmin = (user: any): boolean => {
  return (user as any)?.role === "admin";
};

export default function Dashboard() {
  const { user } = useAuth();
  const { tierInfo, isLoading: tierLoading } = useXPTier();
  const [, setLocation] = useLocation();
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  
  // Show changelog notification toast on login
  useChangelogNotification();
  
  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);
  
  // Fetch user activities
  const { 
    data: activities,
    isLoading: activitiesLoading
  } = useQuery<Activity[]>({
    queryKey: ["/api/user/activities"],
    enabled: !!user,
  });
  
  // Fetch user tournaments
  const { 
    data: tournaments,
    isLoading: tournamentsLoading
  } = useQuery<UserTournament[]>({
    queryKey: ["/api/user/tournaments"],
    enabled: !!user,
  });
  
  // Fetch user achievements
  const { 
    data: achievements,
    isLoading: achievementsLoading
  } = useQuery<UserAchievementWithDetails[]>({
    queryKey: ["/api/user/achievements"],
    enabled: !!user,
  });

  // Fetch connection statistics
  const {
    data: connectionStats,
    isLoading: connectionStatsLoading
  } = useQuery({
    queryKey: ["/api/connections/stats"],
    enabled: !!user,
    // Temporary mock data until API endpoint is available
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        total: 4,
        byType: {
          partner: 2,
          friend: 1,
          coach: 1,
          teammate: 0
        }
      };
    }
  });

  // Define SocialActivity interface to match the import type
  interface SocialActivity {
    id: number;
    type: SocialActivityType;
    createdAt: string;
    actors: {
      id: number;
      displayName: string;
      username: string;
      avatarInitials: string;
    }[];
    contextData?: {
      matchId?: number;
      matchType?: string;
      tournamentId?: number;
      tournamentName?: string;
      achievementId?: number;
      achievementName?: string;
    };
  }

  // Fetch social activity feed
  const {
    data: socialActivities,
    isLoading: socialActivitiesLoading
  } = useQuery<SocialActivity[]>({
    queryKey: ["/api/connections/activities"],
    enabled: !!user,
    // Temporary mock data until API endpoint is available
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      // Cast the types to match SocialActivityType
      return [
        {
          id: 1,
          type: "connection_accepted" as SocialActivityType,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          actors: [{
            id: 2,
            displayName: "Dink Star",
            username: "dinkstar",
            avatarInitials: "DS"
          }]
        },
        {
          id: 2,
          type: "match_played" as SocialActivityType,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          actors: [{
            id: 3,
            displayName: "Slice Queen",
            username: "slicequeen",
            avatarInitials: "SQ"
          }],
          contextData: {
            matchId: 123,
            matchType: "doubles"
          }
        },
        {
          id: 3,
          type: "tournament_joined" as SocialActivityType,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
          actors: [{
            id: 4,
            displayName: "Top Spinner",
            username: "topspinner",
            avatarInitials: "TS"
          }],
          contextData: {
            tournamentId: 1,
            tournamentName: "Spring Championship 2025"
          }
        }
      ];
    }
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

  // Quick Action Component for Dashboard
  const QuickAction = ({ icon, label, onClick, className = "" }: { 
    icon: React.ReactNode, 
    label: string, 
    onClick: () => void,
    className?: string 
  }) => (
    <Button 
      type="button"
      variant="outline" 
      className={`flex items-center gap-2 px-3 py-2 h-auto ${className}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
  
  // Partner Matching Section Component
  const PartnerMatchingSection = () => {
    // This would be connected to real data in a full implementation
    const suggestedPartners = [
      { id: 1, name: "Sarah M.", compatibility: 85, avatarInitials: "SM", playingStyle: "Aggressive" },
      { id: 2, name: "David K.", compatibility: 79, avatarInitials: "DK", playingStyle: "Defensive" },
      { id: 3, name: "Jamie L.", compatibility: 92, avatarInitials: "JL", playingStyle: "All-Court" },
    ];
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Partner Matching
          </CardTitle>
          <CardDescription>
            Find players that match your style and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Looking for Partners</span>
            {/* Toggle button would be functional in full implementation */}
            <div className="h-6 w-12 rounded-full bg-primary/90 relative flex items-center px-1">
              <div className="h-4 w-4 rounded-full bg-white absolute right-1 transition-all"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            {suggestedPartners.map(partner => (
              <div key={partner.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3 text-sm font-medium">
                    {partner.avatarInitials}
                  </div>
                  <div>
                    <div className="font-medium">{partner.name}</div>
                    <div className="text-xs text-muted-foreground">{partner.playingStyle} Player</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                    {partner.compatibility}% Match
                  </Badge>
                  <span className="text-xs text-muted-foreground mt-1">3 mutual connections</span>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule a Match
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  // Skill Development Section Component
  const SkillDevelopmentSection = () => {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Skill Development
          </CardTitle>
          <CardDescription>
            Personalized recommendations to improve your game
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col">
              <div className="text-sm font-medium mb-2">Skill Breakdown</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Serving</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Return</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "82%" }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Dinking</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Volleys</span>
                    <span className="font-medium">69%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "69%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Recommended Focus</div>
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary rounded-full p-2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Dinking Consistency</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Practice controlled dinks to all areas of the kitchen to improve your soft game.
                    </p>
                    <Button variant="link" className="h-8 px-0 text-xs text-primary" onClick={() => setLocation("/guidance")}>
                      View Tutorial <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Tournament Spotlight Component
  const TournamentSpotlight = ({ tournament, registration, isLoading }: { 
    tournament: Tournament, 
    registration: { checkedIn: boolean },
    isLoading: boolean
  }) => {
    if (isLoading) {
      return <Skeleton className="h-64 w-full rounded-lg" />;
    }
    
    // Ensure we have valid dates by providing fallbacks
    const startDate = new Date(tournament.startDate as unknown as string);
    const endDate = new Date(tournament.endDate as unknown as string);
    const today = new Date();
    const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Tournament Spotlight
          </CardTitle>
          <CardDescription>
            Upcoming tournaments and your registrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold">{tournament.name}</h4>
                <div className="text-sm text-muted-foreground">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </div>
                <div className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{tournament.location}</span>
                </div>
              </div>
              
              <Badge variant={daysUntil <= 3 ? "destructive" : "outline"}>
                {daysUntil <= 0 ? "Today" : `${daysUntil} days left`}
              </Badge>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <Badge variant={registration.checkedIn ? "default" : "secondary"}>
                {registration.checkedIn ? "Checked In" : "Not Checked In"}
              </Badge>
              
              <Button size="sm" variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Check In
              </Button>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" size="sm" onClick={() => setLocation("/tournaments")}>
            Browse All Tournaments
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  // Main Community Insights Component
  const CommunityInsights = () => {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Community Insights
          </CardTitle>
          <CardDescription>
            Local pickleball activity and trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Active Players</span>
                <span className="font-medium">
                  128 <span className="text-xs text-green-600">↑ 12%</span>
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: "72%" }}></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Court Availability</span>
                <span className="font-medium">
                  Medium <span className="text-xs text-yellow-600">~45%</span>
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: "45%" }}></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Tournament Activity</span>
                <span className="font-medium">
                  High <span className="text-xs text-green-600">↑ 32%</span>
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <h4 className="text-sm font-medium mb-1">Popular Playing Times</h4>
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between mb-1">
                <span>Weekdays:</span>
                <span className="font-medium">5:30 PM - 8:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Weekends:</span>
                <span className="font-medium">9:00 AM - 12:00 PM</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="dashboard-view p-3 md:p-8 pb-20 md:pb-8">
      {/* Changelog Banner */}
      <ChangelogBanner />
      
      {/* Hero Header */}
      <div className="mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Welcome message */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {user.displayName?.split(' ')[0] || user.username}!
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Ready to elevate your pickleball game today?
            </p>
            {user.isFoundingMember && (
              <div className="flex items-center pt-1">
                <FoundingMemberBadge size="md" showText={true} className="mr-3" />
                {user.xpMultiplier && user.xpMultiplier > 100 && (
                  <XpMultiplierIndicator 
                    multiplier={user.xpMultiplier} 
                    size="md" 
                    showLabel={true}
                    showTooltip={true} 
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <QuickAction 
              icon={<QrCode className="h-4 w-4" />} 
              label="My QR Passport" 
              onClick={() => setLocation("/profile")}
            />
            <QuickAction 
              icon={<Scan className="h-4 w-4" />} 
              label="Scan Code" 
              onClick={() => setLocation("/scan")}
              className="bg-primary text-white hover:bg-primary/90 hover:text-white"
            />
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          {isAdmin(user) && <TabsTrigger value="development">Development</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          {/* Main Dashboard Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-6">
              {/* Player Card */}
              <PlayerCard user={user as any} rating={1845} />
              
              {/* Activity Feed */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30">
                  <CardTitle className="text-base flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    Activity Feed
                  </CardTitle>
                  <CardDescription>
                    Recent matches, achievements, and social activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-y-auto p-5 space-y-4">
                    {activitiesLoading ? (
                      Array(3).fill(0).map((_, index) => (
                        <div key={index} className="mb-3">
                          <Skeleton className="h-24 w-full rounded-lg" />
                        </div>
                      ))
                    ) : activities && activities.length > 0 ? (
                      activities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No recent activities</p>
                    )}
                    
                    {socialActivities && !socialActivitiesLoading && (
                      <SocialActivityFeed 
                        activities={socialActivities}
                        isLoading={socialActivitiesLoading}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Center Column */}
            <div className="md:col-span-1 space-y-6">
              {/* XP Level Progress */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30">
                  <CardTitle className="text-base flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    Level Progress
                  </CardTitle>
                  <CardDescription>
                    Your progress towards the next level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-xl mr-4 shadow-sm">
                      {user.level || 1}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
                        <span className="text-sm text-muted-foreground">{xpPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary/80 to-primary" 
                          style={{ width: `${xpPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>{xpNeeded.toLocaleString()} XP until Level {(user.level || 1) + 1}</span>
                    
                    {user.xpMultiplier && user.xpMultiplier > 100 && (
                      <XpMultiplierIndicator 
                        multiplier={user.xpMultiplier} 
                        size="sm" 
                        showLabel={true}
                        showTooltip={true} 
                      />
                    )}
                  </div>
                  
                  {tierInfo && !tierLoading && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium mr-2">Current Tier:</span>
                        <TierBadge 
                          tier={tierInfo.tier}
                          tierDescription={tierInfo.tierDescription}
                          tierProgress={tierInfo.tierProgress}
                          nextTier={tierInfo.nextTier}
                          levelUntilNextTier={tierInfo.levelUntilNextTier}
                          showDetails={false}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tierInfo.levelUntilNextTier > 0 
                          ? `${tierInfo.levelUntilNextTier} more levels until ${tierInfo.nextTier}`
                          : `You're at the highest tier!`}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Partner Matching Section */}
              <PartnerMatchingSection />
              
              {/* Community Insights Section */}
              <CommunityInsights />
            </div>
            
            {/* Right Column */}
            <div className="md:col-span-1 space-y-6">
              {/* PCP Global Rankings Card */}
              <PCPGlobalRankingCard />
              
              {/* Tournament Spotlight */}
              {upcomingTournament && (
                <TournamentSpotlight 
                  tournament={upcomingTournament.tournament} 
                  registration={upcomingTournament.registration}
                  isLoading={tournamentsLoading}
                />
              )}
              
              {/* Achievements Display */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-muted/30">
                  <CardTitle className="text-base flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>
                    Badges and rewards you've unlocked recently
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {achievementsLoading ? (
                    <div className="grid grid-cols-3 gap-4">
                      {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <Skeleton className="h-16 w-16 rounded-full mb-2" />
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-2 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 pb-2">
                      {achievements && achievements.length > 0 ? (
                        achievements.slice(0, 3).map(({ achievement, userAchievement }) => (
                          <AchievementBadge 
                            key={achievement.id} 
                            achievement={achievement} 
                            unlocked={true}
                          />
                        ))
                      ) : (
                        <div className="col-span-3 py-4 text-center text-sm text-muted-foreground">
                          Play matches and tournaments to earn achievements
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full text-sm" 
                      size="sm"
                      onClick={() => setLocation("/achievements")}
                    >
                      View All Achievements
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillDevelopmentSection />
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Performance Stats
                </CardTitle>
                <CardDescription>
                  Your match history and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-muted-foreground">
                  Detailed performance analytics are coming soon!
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="social" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  My Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConnectionStatsWidget 
                  stats={connectionStats} 
                  isLoading={connectionStatsLoading}
                />
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => setLocation("/connections")}
                  >
                    Manage Connections
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Coaching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-muted-foreground">
                  Coaching features are coming soon!
                </p>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setLocation("/coaching")}
                >
                  Explore Coaching
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="training" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Training Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-10 text-muted-foreground">
                  Personalized training programs are coming soon!
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {isAdmin(user) && (
          <TabsContent value="development" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <TestUserGenerator />
              </div>
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Wrench className="h-5 w-5 mr-2 text-primary" />
                      Development Tools
                    </CardTitle>
                    <CardDescription>
                      Additional utilities for development and testing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Use these tools to test and debug features of the app.
                    </p>
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => toast({
                          title: "Feature coming soon",
                          description: "This development feature is not yet implemented."
                        })}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reset Rating Cache
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Match Recording Dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Match Results</DialogTitle>
          </DialogHeader>
          <NewMatchRecordingForm onSuccess={() => setMatchDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
