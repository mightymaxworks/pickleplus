import React from 'react';
import { Link } from 'wouter';
import {
  Bell,
  Calendar,
  Clock,
  Home,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Trophy,
  TrendingUp,
  Users,
  UserPlus,
  MapPin,
  CalendarCheck,
  BarChart2,
  Activity,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Test data for the components
const currentUser = {
  id: 1,
  name: 'Mighty Max',
  username: 'mightymax',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  passportId: 'PKL7X4Z',
  courtIQ: 5.2,
  level: 7,
  xp: 2350,
  nextLevelXp: 3000,
  matches: 42,
  wins: 28,
};

// Upcoming matches data
const upcomingMatches = [
  {
    id: 1,
    type: 'Singles',
    opponent: 'Sarah Johnson',
    opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    date: 'Today, 6:00 PM',
    location: 'Westside Courts',
    joinable: true,
  },
  {
    id: 2,
    type: 'Doubles',
    opponent: 'Mike & Dave',
    opponentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    date: 'Tomorrow, 7:30 PM',
    location: 'Downtown Recreation Center',
    joinable: true,
  },
];

// Recent activity data
const recentActivity = [
  {
    id: 1,
    type: 'match',
    user: {
      name: 'Chris Parker',
      username: 'cparker',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    },
    content: 'Won a match against you (15-12, 11-15, 15-9)',
    timestamp: '2 hours ago',
    xp: 25,
    courtIQ: -0.1,
  },
  {
    id: 2,
    type: 'achievement',
    user: {
      name: 'Mighty Max',
      username: 'mightymax',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    },
    content: 'Earned the "Consistent Player" badge',
    timestamp: '3 hours ago',
    achievement: 'Consistent Player',
    xp: 50,
  },
];

// Community data
const myCommunities = [
  {
    id: 1,
    name: 'Seattle Picklers',
    memberCount: 234,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seattle',
    isActive: true,
    unreadPosts: 3,
    upcomingEvents: 2,
  },
  {
    id: 2,
    name: 'Beginner Friendly',
    memberCount: 156,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Beginner',
    isActive: false,
    unreadPosts: 0,
    upcomingEvents: 1,
  },
];

// Player leaderboard data
const leaderboardPlayers = [
  {
    id: 1,
    name: 'Alex Morgan',
    username: 'alexm',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    courtIQ: 8.7,
    rank: 1,
    trend: 'up',
  },
  {
    id: 2,
    name: 'Jordan Lee',
    username: 'jlee',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    courtIQ: 8.5,
    rank: 2,
    trend: 'same',
  },
  {
    id: 3,
    name: 'Casey Kim',
    username: 'ckim',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
    courtIQ: 8.2,
    rank: 3,
    trend: 'up',
  },
];

// Pickleball Icon Component
const PickleballIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12a4 4 0 0 1 8 0" />
    <path d="M16 12a4 4 0 0 1-8 0" />
  </svg>
);

// Dashboard Header
const DashboardHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex md:hidden">
          <Button variant="ghost" size="icon" type="button">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <PickleballIcon />
          <span className="hidden font-bold sm:inline-block">
            Pickle+
          </span>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="hidden md:flex relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                type="search" 
                placeholder="Search players, communities..." 
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:w-[200px] lg:w-[300px]" 
              />
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">3</span>
            </Button>
            
            <div className="flex cursor-pointer items-center gap-1 rounded-md bg-muted px-2 py-1">
              <div className="text-xs font-medium">{currentUser.passportId}</div>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {currentUser.courtIQ}
              </div>
            </div>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Quick action buttons
const QuickActions: React.FC = () => {
  return (
    <div className="container mt-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Button className="h-14 flex-col gap-1" variant="default">
          <Activity className="h-5 w-5" />
          <span>Play Now</span>
        </Button>
        <Button className="h-14 flex-col gap-1" variant="outline">
          <UserPlus className="h-5 w-5" />
          <span>Find Players</span>
        </Button>
        <Button className="h-14 flex-col gap-1" variant="outline">
          <CalendarCheck className="h-5 w-5" />
          <span>Record Match</span>
        </Button>
        <Button className="h-14 flex-col gap-1" variant="outline">
          <TrendingUp className="h-5 w-5" />
          <span>View Progress</span>
        </Button>
      </div>
    </div>
  );
};

// Progress card
const ProgressCard: React.FC = () => {
  const progress = (currentUser.xp / currentUser.nextLevelXp) * 100;
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Level {currentUser.level}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            PCP Official
          </Badge>
        </div>
        <CardDescription>
          {currentUser.xp} / {currentUser.nextLevelXp} XP to next level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2" />
        <div className="mt-2 text-xs text-muted-foreground">
          Earn XP by playing matches and participating in community events
        </div>
      </CardContent>
    </Card>
  );
};

// Activity feed item
interface FeedItemProps {
  item: {
    id: number;
    type: string;
    user: {
      name: string;
      username: string;
      avatarUrl: string;
      isCommunity?: boolean;
    };
    content: string;
    timestamp: string;
    xp?: number;
    courtIQ?: number;
    achievement?: string;
    eventDate?: string;
  };
}

const ActivityFeedItem: React.FC<FeedItemProps> = ({ item }) => {
  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={item.user.avatarUrl} alt={item.user.name} />
        <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm">{item.user.name}</span>
          {item.user.isCommunity && (
            <Badge variant="secondary" className="text-xs h-5">Community</Badge>
          )}
          <span className="text-muted-foreground text-xs">@{item.user.username}</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">{item.timestamp}</span>
        </div>
        
        <p className="mt-1 text-sm">{item.content}</p>
        
        {item.type === 'match' && (
          <div className="mt-2 flex items-center gap-3">
            {item.xp !== undefined && (
              <Badge variant="outline" className={cn(
                "text-xs",
                item.xp > 0 ? "text-green-600" : "text-red-600"
              )}>
                {item.xp > 0 ? '+' : ''}{item.xp} XP
              </Badge>
            )}
            {item.courtIQ !== undefined && (
              <Badge variant="outline" className={cn(
                "text-xs",
                item.courtIQ > 0 ? "text-green-600" : "text-red-600"
              )}>
                CourtIQ {item.courtIQ > 0 ? '+' : ''}{item.courtIQ}
              </Badge>
            )}
          </div>
        )}
        
        {item.type === 'achievement' && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              {item.achievement}
            </Badge>
            {item.xp && (
              <Badge variant="outline" className="text-xs text-green-600">
                +{item.xp} XP
              </Badge>
            )}
          </div>
        )}
        
        {item.type === 'community' && item.eventDate && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {item.eventDate}
            </Badge>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              View Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Match card component
interface MatchCardProps {
  match: {
    id: number;
    type: string;
    opponent: string;
    opponentAvatar: string;
    date: string;
    location: string;
    joinable: boolean;
  };
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  return (
    <Card className="mb-3 overflow-hidden">
      <CardHeader className="p-3 pb-0 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm">
            {match.type} Match
          </CardTitle>
          <CardDescription className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {match.date}
          </CardDescription>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src={match.opponentAvatar} alt={match.opponent} />
          <AvatarFallback>{match.opponent.charAt(0)}</AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="text-sm">vs {match.opponent}</div>
        <div className="text-xs text-muted-foreground flex items-center mt-1">
          <MapPin className="h-3 w-3 mr-1" />
          {match.location}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <Button variant="ghost" size="sm" className="text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          Add to Calendar
        </Button>
        <Button variant={match.joinable ? "default" : "secondary"} size="sm" className="text-xs">
          {match.joinable ? "Join Match" : "View Details"}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Community card component
interface CommunityCardProps {
  community: {
    id: number;
    name: string;
    memberCount: number;
    avatarUrl: string;
    isActive: boolean;
    unreadPosts: number;
    upcomingEvents: number;
  };
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  return (
    <Card className="mb-3 overflow-hidden">
      <CardHeader className="p-3 pb-0 flex-row items-center justify-between">
        <div className="flex gap-2 items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={community.avatarUrl} alt={community.name} />
            <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm flex items-center gap-1">
              {community.name}
              {community.isActive && (
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              )}
            </CardTitle>
            <CardDescription>
              {community.memberCount} members
            </CardDescription>
          </div>
        </div>
        {community.unreadPosts > 0 && (
          <Badge className="bg-primary">{community.unreadPosts}</Badge>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-3">
        {community.upcomingEvents > 0 ? (
          <div className="text-sm">
            {community.upcomingEvents} upcoming events
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            No upcoming events
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <Button variant="ghost" size="sm" className="text-xs">
          <MessageCircle className="h-3 w-3 mr-1" />
          View Feed
        </Button>
        <Button variant="default" size="sm" className="text-xs">
          <Users className="h-3 w-3 mr-1" />
          Connect
        </Button>
      </CardFooter>
    </Card>
  );
};

// Player leaderboard component
const PlayerLeaderboard: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">PCP Leaderboard</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            View All
          </Button>
        </div>
        <CardDescription>
          Official PCP CourtIQ™ ratings
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="space-y-2">
          {leaderboardPlayers.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  index === 0 ? "bg-yellow-500 text-black" : 
                  index === 1 ? "bg-slate-300 text-black" : 
                  index === 2 ? "bg-amber-700 text-white" : 
                  "bg-muted text-muted-foreground"
                )}>
                  {player.rank}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.avatarUrl} alt={player.name} />
                  <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{player.name}</div>
                  <div className="text-xs text-muted-foreground">@{player.username}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{player.courtIQ}</span>
                {player.trend === 'up' && <ChevronUp className="h-4 w-4 text-green-500" />}
                {player.trend === 'down' && <ChevronUp className="h-4 w-4 text-red-500 rotate-180" />}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main dashboard component
const SimpleUnifiedDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 pb-16 md:pb-12">
        <QuickActions />
        
        <div className="container mt-6">
          <Tabs defaultValue="feed" className="space-y-4">
            <TabsList className="grid grid-cols-3 h-11 md:w-auto md:grid-cols-4">
              <TabsTrigger value="feed">Activity Feed</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
              <TabsTrigger value="leaderboard" className="hidden md:inline-flex">Leaderboard</TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <TabsContent value="feed" className="space-y-4 m-0">
                  <ProgressCard />
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Recent Activity</span>
                        <Button variant="ghost" size="sm" className="h-7 px-2">Refresh</Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="px-4 divide-y max-h-[500px] overflow-auto">
                        {recentActivity.map(item => (
                          <ActivityFeedItem key={item.id} item={item} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="matches" className="m-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Upcoming Matches</h2>
                    <Button>
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Record Match
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {upcomingMatches.map(match => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                    
                    <Card className="border-dashed flex flex-col items-center justify-center p-6 text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">Schedule a Match</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Find players and schedule your next game
                      </p>
                      <Button variant="default">Find Players</Button>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="communities" className="m-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">My Communities</h2>
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Discover Communities
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {myCommunities.map(community => (
                      <CommunityCard key={community.id} community={community} />
                    ))}
                    
                    <Card className="border-dashed flex flex-col items-center justify-center p-6 text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">Create a Community</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Start your own pickleball community
                      </p>
                      <Button variant="default">Create Community</Button>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="leaderboard" className="m-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">PCP Official Rankings</h2>
                    <Button variant="outline">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      About CourtIQ™
                    </Button>
                  </div>
                  
                  <PlayerLeaderboard />
                  
                  <div className="mt-6">
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-base">Your Ranking</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              42
                            </div>
                            <div>
                              <div className="font-medium">{currentUser.name}</div>
                              <div className="text-sm text-muted-foreground">@{currentUser.username}</div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold">{currentUser.courtIQ}</div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-1 flex justify-between">
                            <span>Progress to next rank</span>
                            <span>+0.3 needed</span>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">View Detailed Stats</Button>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>
              </div>
              
              <div className="hidden md:block">
                <div className="space-y-6 sticky top-[80px]">
                  <TabsContent value="feed" className="m-0">
                    <PlayerLeaderboard />
                  </TabsContent>
                  
                  <TabsContent value="matches" className="m-0">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Top Players Near You</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {leaderboardPlayers.slice(0, 3).map(player => (
                            <div key={player.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={player.avatarUrl} alt={player.name} />
                                  <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm font-medium">{player.name}</div>
                              </div>
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                Challenge
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="communities" className="m-0">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Community Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="border rounded-md p-3">
                            <div className="font-medium text-sm">Weekend Mixer</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Apr 22, 10:00 AM
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              Westside Courts
                            </div>
                            <div className="mt-2">
                              <Button size="sm" className="w-full text-xs">Register</Button>
                            </div>
                          </div>
                          
                          <div className="border rounded-md p-3">
                            <div className="font-medium text-sm">Beginner Clinic</div>
                            <div className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Apr 18, 6:00 PM
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              Downtown Recreation Center
                            </div>
                            <div className="mt-2">
                              <Button size="sm" variant="outline" className="w-full text-xs">View Details</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="leaderboard" className="m-0">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">About PCP</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          The Pickleball Competitive Partnership (PCP) is the official governing body for competitive pickleball worldwide.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Trophy className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-sm">Official ranking system</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-sm">Sanctioned tournaments</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <BarChart2 className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-sm">Standardized rules</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button variant="outline" className="w-full text-sm">Learn More</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background flex items-center justify-around p-2 z-20 md:hidden">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 20V14H15V20M3 12L12 4L21 12V20H3V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </Button>
        <Button variant="ghost" size="icon">
          <Search className="h-6 w-6" />
        </Button>
        <div className="relative -mt-6">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg absolute -top-5"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleUnifiedDashboard;