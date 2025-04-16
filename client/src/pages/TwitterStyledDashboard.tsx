import React, { useState, useRef } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  MessageCircle, 
  RefreshCw, 
  Heart, 
  Calendar, 
  Trophy, 
  Users, 
  Bell, 
  Home,
  Search, 
  PlusCircle,
  X,
  ChevronDown,
  CheckCircle2,
  Clock,
  Star,
  Settings,
  User,
  Bookmark,
  UserPlus,
  Award,
  Send,
  MapPin,
  Filter,
  PenSquare,
  Hash,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Custom Pickleball Icon
const PickleballIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 3V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4.5 7.5L19.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4.5 16.5L19.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// User data
const currentUser = {
  id: 1,
  username: "mightymax",
  passportId: "PKL1234",
  name: "Mighty Max",
  bio: "Competitive pickleball player from Seattle. 4.5 DUPR.",
  avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  verified: true,
  courtIQ: {
    score: 4.5,
    trend: 0.2,
    history: [4.2, 4.3, 4.3, 4.4, 4.5]
  },
  skills: {
    serve: 82,
    volley: 90,
    groundstrokes: 75,
    strategy: 85,
    mobility: 78
  },
  stats: {
    wins: 24,
    losses: 8,
    winStreak: 3
  },
  badges: [
    { id: 1, name: "Tournament Champion", icon: <Trophy className="h-3 w-3" /> },
    { id: 2, name: "Power Server", icon: <Star className="h-3 w-3" /> },
    { id: 3, name: "Community Leader", icon: <Users className="h-3 w-3" /> }
  ]
};

// Feed data
const feedItems = [
  {
    id: 1,
    type: "match_result",
    user: {
      name: "Mighty Max",
      username: "mightymax",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      verified: true,
      courtIQ: 4.5
    },
    content: {
      matchType: "singles",
      result: "win",
      score: "11-8, 9-11, 11-7",
      opponent: "Sarah Lopez",
      courtIQImpact: 0.2,
      location: "Seattle Community Center"
    },
    engagement: {
      likes: 12,
      comments: 3
    },
    timeAgo: "2h"
  },
  {
    id: 2,
    type: "community_announcement",
    user: {
      name: "Seattle Pickleball Club",
      username: "seattlepickle",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      verified: true,
      isOfficial: true
    },
    content: {
      title: "Weekend Tournament Registration Open!",
      text: "Join us this weekend for our monthly tournament. All skill levels welcome. Register by Friday.",
      eventDate: "Apr 20, 2025"
    },
    engagement: {
      likes: 45,
      comments: 8
    },
    timeAgo: "5h"
  },
  {
    id: 3,
    type: "skill_achievement",
    user: {
      name: "Mighty Max",
      username: "mightymax",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      verified: true,
      courtIQ: 4.5
    },
    content: {
      achievement: "Volley Master",
      description: "Reached 90% rating in volleys",
      skillImprovement: 5
    },
    engagement: {
      likes: 23,
      comments: 5
    },
    timeAgo: "1d"
  },
  {
    id: 4,
    type: "match_result",
    user: {
      name: "Aisha Patel",
      username: "aisha_p",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      courtIQ: 4.2
    },
    content: {
      matchType: "doubles",
      result: "win",
      score: "11-9, 11-7",
      teammate: "Carlos Rodriguez",
      opponents: "Emma Wilson & Mark Johnson",
      courtIQImpact: 0.1,
      location: "Portland Indoor Courts"
    },
    engagement: {
      likes: 8,
      comments: 2
    },
    timeAgo: "1d"
  },
  {
    id: 5,
    type: "coaching_tip",
    user: {
      name: "Pickle+ Coach",
      username: "picklecoach",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      verified: true,
      isOfficial: true
    },
    content: {
      tip: "Third Shot Drop Technique",
      text: "Focus on softening your grip when executing the third shot drop. This gives you better control and touch.",
      relevance: "Based on your recent matches"
    },
    engagement: {
      likes: 34,
      comments: 7
    },
    timeAgo: "2d"
  }
];

// Trending tournaments
const trendingTournaments = [
  { id: 1, name: "Seattle Spring Open", date: "Apr 20", registered: true },
  { id: 2, name: "Portland Classic", date: "May 5", registered: false },
  { id: 3, name: "West Coast Championship", date: "May 15", registered: false }
];

// Upcoming matches
const upcomingMatches = [
  { id: 1, opponent: "Sarah Lopez", date: "Apr 18, 6:30 PM", location: "Seattle Community Center" }
];

// Communities 
const myCommunities = [
  { id: 1, name: "Seattle Pickleball Club", memberCount: 342, isActive: true },
  { id: 2, name: "Pro Tips & Tricks", memberCount: 1245, isActive: false },
  { id: 3, name: "Tournament Players", memberCount: 587, isActive: false }
];

// Feed Item Component
const FeedItem = ({ item }: { item: typeof feedItems[0] }) => {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <div className="border-b border-border p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.user.avatar} alt={item.user.name} />
            <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          {/* CourtIQ badge for players */}
          {item.user.courtIQ && (
            <div className="absolute -bottom-1 -right-1 bg-primary/10 rounded-full flex items-center justify-center w-5 h-5 text-[10px] font-medium border border-border text-primary">
              {item.user.courtIQ}
            </div>
          )}
          
          {/* Official badge for organizations */}
          {item.user.isOfficial && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full flex items-center justify-center w-5 h-5">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm">{item.user.name}</span>
            {item.user.verified && <CheckCircle2 className="w-3 h-3 text-blue-500" />}
            <span className="text-muted-foreground text-xs">@{item.user.username}</span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">{item.timeAgo}</span>
          </div>
          
          {/* Match Result */}
          {item.type === "match_result" && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <Badge variant={item.content.result === "win" ? "default" : "outline"} className={item.content.result === "win" ? "bg-green-500 hover:bg-green-500/90" : "text-red-500 border-red-500"}>
                  {item.content.result === "win" ? "WIN" : "LOSS"}
                </Badge>
                <span className="font-medium text-sm">{item.content.score}</span>
                {item.content.courtIQImpact !== undefined && item.content.courtIQImpact > 0 && (
                  <span className="text-xs text-green-500 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-0.5" /> {item.content.courtIQImpact}
                  </span>
                )}
                {item.content.courtIQImpact !== undefined && item.content.courtIQImpact < 0 && (
                  <span className="text-xs text-red-500 flex items-center">
                    <ArrowDown className="h-3 w-3 mr-0.5" /> {Math.abs(item.content.courtIQImpact)}
                  </span>
                )}
              </div>
              
              <p className="text-sm mt-1">
                {item.content.matchType === "singles" ? (
                  <>vs <span className="font-medium">{item.content.opponent}</span></>
                ) : (
                  <>
                    w/ <span className="font-medium">{item.content.teammate}</span> vs <span className="font-medium">{item.content.opponents}</span>
                  </>
                )}
                
                <span className="text-muted-foreground text-xs ml-1">
                  at {item.content.location}
                </span>
              </p>
            </div>
          )}
          
          {/* Community Announcement */}
          {item.type === "community_announcement" && (
            <div className="mt-2">
              <p className="font-medium text-sm">{item.content.title}</p>
              <p className="text-sm mt-1">{item.content.text}</p>
              {item.content.eventDate && (
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {item.content.eventDate}
                </div>
              )}
            </div>
          )}
          
          {/* Skill Achievement */}
          {item.type === "skill_achievement" && (
            <div className="mt-2">
              <div className="flex items-center">
                <Badge className="bg-blue-500 hover:bg-blue-500/90">Achievement</Badge>
                <span className="font-medium text-sm ml-2">{item.content.achievement}</span>
              </div>
              <p className="text-sm mt-1">{item.content.description}</p>
              <div className="flex items-center mt-2 text-xs text-green-500">
                <ArrowUp className="h-3 w-3 mr-0.5" /> 
                {item.content.skillImprovement}% improvement
              </div>
            </div>
          )}
          
          {/* Coaching Tip */}
          {item.type === "coaching_tip" && (
            <div className="mt-2">
              <div className="flex items-center">
                <Badge className="bg-purple-500 hover:bg-purple-500/90">Coaching Tip</Badge>
                <span className="font-medium text-sm ml-2">{item.content.tip}</span>
              </div>
              <p className="text-sm mt-1">{item.content.text}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">{item.content.relevance}</p>
            </div>
          )}
          
          {/* Engagement */}
          <div className="flex items-center gap-4 mt-3">
            <button 
              className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {isLiked ? item.engagement.likes + 1 : item.engagement.likes}
            </button>
            
            <button className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4 mr-1" />
              {item.engagement.comments}
            </button>
            
            <button className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="h-4 w-4 mr-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Passport Card Component
const PassportCard = ({ user }: { user: typeof currentUser }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 px-2">
          <div className="flex items-center">
            <div className="bg-primary/10 text-primary text-xs font-medium rounded px-1.5 py-0.5 flex items-center">
              <PickleballIcon />
              <span className="ml-1">{user.passportId}</span>
            </div>
            <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs p-6">
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 w-full rounded-lg p-4 flex flex-col items-center">
            <h3 className="font-bold text-lg mb-1">Pickleball Passport</h3>
            <QRCodeSVG value={user.passportId} size={120} className="mb-3" />
            <div className="text-2xl font-mono font-bold text-primary">{user.passportId}</div>
            <div className="flex items-center mt-1 text-sm">
              <span className="font-medium">{user.name}</span>
              {user.verified && <CheckCircle2 className="w-3 h-3 ml-1 text-blue-500" />}
            </div>
            <div className="mt-2 bg-background rounded-full px-3 py-1 text-sm flex items-center shadow-sm">
              <span className="font-medium mr-1">CourtIQ:</span> 
              {user.courtIQ.score}
              <span className="text-green-500 text-xs flex items-center ml-1">
                <ArrowUp className="h-3 w-3" /> {user.courtIQ.trend}
              </span>
            </div>
          </div>
          
          <div className="w-full mt-4">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">{user.stats.wins}</span>
                <span className="text-muted-foreground ml-1">Wins</span>
              </div>
              <div>
                <span className="font-medium">{user.stats.losses}</span>
                <span className="text-muted-foreground ml-1">Losses</span>
              </div>
              <div>
                <span className="font-medium text-green-500">{user.stats.winStreak}</span>
                <span className="text-muted-foreground ml-1">Streak</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// CourtIQ Component
const CourtIQScore = ({ user }: { user: typeof currentUser }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 px-2">
          <div className="flex items-center">
            <div className="bg-green-500/10 text-green-500 text-xs font-semibold rounded px-1.5 py-0.5 flex items-center">
              {user.courtIQ.score}
              <ArrowUp className="h-3 w-3 ml-0.5" />
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs p-6">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-3">CourtIQ™ Performance</h3>
          
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold flex items-center">
              {user.courtIQ.score}
              <span className="text-green-500 text-sm flex items-center ml-2">
                <ArrowUp className="h-3 w-3 mr-0.5" /> {user.courtIQ.trend}
              </span>
            </div>
            
            <Badge className="bg-green-500 hover:bg-green-500/90">Top 15%</Badge>
          </div>
          
          <div className="mt-4">
            <div className="h-12 bg-muted rounded-md overflow-hidden flex items-end">
              {user.courtIQ.history.map((score, index) => (
                <div 
                  key={index} 
                  className="bg-primary h-full flex-1 mx-0.5 rounded-t-sm"
                  style={{ height: `${(score / 5) * 100}%` }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>30d ago</span>
              <span>Today</span>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Skill Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(user.skills).map(([skill, value]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{skill}</span>
                  <div className="flex-1 mx-2">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Record Match Button
const RecordMatchButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full" size="icon">
          <PickleballIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-3">Record Match</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Quick match recording feature will be implemented here.
          </p>
          <Button>Implementation Coming Soon</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Dashboard Component
const TwitterStyledDashboard = () => {
  const [activeTab, setActiveTab] = useState("for-you");
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 h-screen border-r flex-col p-3">
        <div className="flex items-center justify-center h-12 w-12 rounded-full hover:bg-primary/10 transition-colors mb-6">
          <PickleballIcon />
        </div>
        
        <nav className="space-y-1 flex-1">
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <Home className="mr-4 h-5 w-5" />
            <span>Home</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <Search className="mr-4 h-5 w-5" />
            <span>Explore</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <Bell className="mr-4 h-5 w-5" />
            <span>Notifications</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <MessageCircle className="mr-4 h-5 w-5" />
            <span>Messages</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <Users className="mr-4 h-5 w-5" />
            <span>Communities</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <Trophy className="mr-4 h-5 w-5" />
            <span>Tournaments</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <Award className="mr-4 h-5 w-5" />
            <span>Achievements</span>
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="lg">
            <User className="mr-4 h-5 w-5" />
            <span>Profile</span>
          </Button>
        </nav>
        
        <Button className="w-full rounded-full mt-4">Record Match</Button>
        
        <div className="mt-auto pt-4">
          <div className="flex items-center p-3 rounded-full hover:bg-muted transition-colors cursor-pointer">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <div className="flex items-center">
                <span className="font-semibold text-sm truncate">{currentUser.name}</span>
                {currentUser.verified && <CheckCircle2 className="w-3 h-3 ml-1 text-blue-500 shrink-0" />}
              </div>
              <span className="text-xs text-muted-foreground truncate">@{currentUser.username}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:max-w-[600px] border-r">
        {/* Header */}
        <header className="border-b sticky top-0 bg-background z-10 backdrop-blur-sm bg-opacity-80">
          <div className="flex items-center justify-between p-3">
            {/* Mobile Only Avatar */}
            <Avatar className="h-8 w-8 lg:hidden">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {/* Logo for Mobile */}
            <div className="lg:hidden flex-1 flex justify-center">
              <PickleballIcon />
            </div>
            
            {/* Title for Desktop */}
            <div className="hidden lg:block text-xl font-bold">Home</div>
            
            {/* Compact Passport and CourtIQ */}
            <div className="flex items-center gap-1">
              {/* CourtIQ Score */}
              <CourtIQScore user={currentUser} />
              
              {/* Passport ID */}
              <PassportCard user={currentUser} />
            </div>
          </div>
        </header>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none bg-transparent border-b h-12">
            <TabsTrigger value="for-you" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full">
              For You
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full">
              Following
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full">
              Communities
            </TabsTrigger>
          </TabsList>
          
          {/* Smart Post/Search Component */}
          <div className="border-b border-border">
            <div className="p-4">
              <SmartInteractionBox />
            </div>
          </div>
          
          {/* Feed */}
          <div className="flex-1">
            <TabsContent value="for-you" className="m-0">
              {/* AI Response Example */}
              <AiResponseItem />
              
              {/* Regular Feed Items */}
              {feedItems.map(item => (
                <FeedItem key={item.id} item={item} />
              ))}
            </TabsContent>
            
            <TabsContent value="following" className="m-0">
              <div className="p-10 text-center text-muted-foreground">
                Content from people you follow will appear here.
              </div>
            </TabsContent>
            
            <TabsContent value="communities" className="m-0">
              <CommunityView />
            </TabsContent>
          </div>
        </Tabs>
        
        {/* Floating Action Button - Mobile Only */}
        <div className="fixed bottom-20 right-4 lg:hidden z-10">
          <RecordMatchButton />
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex items-center justify-around p-2 z-10">
          <Button variant="ghost" size="icon">
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Right Sidebar - Desktop Only */}
      <div className="hidden lg:block lg:w-80 xl:w-96 p-4">
        <div className="sticky top-0">
          {/* Search */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input 
              type="search"
              placeholder="Search Pickle+"
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          {/* Trending Tournaments */}
          <div className="bg-muted/30 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-lg mb-3">Upcoming Tournaments</h3>
            <div className="space-y-3">
              {trendingTournaments.map(tournament => (
                <div key={tournament.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{tournament.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {tournament.date}
                    </div>
                  </div>
                  <Button 
                    variant={tournament.registered ? "default" : "outline"} 
                    size="sm"
                  >
                    {tournament.registered ? "Registered" : "Register"}
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3 text-primary text-sm">
              View all tournaments
            </Button>
          </div>
          
          {/* My Communities */}
          <div className="bg-muted/30 rounded-xl p-4 mb-4">
            <h3 className="font-bold text-lg mb-3">My Communities</h3>
            <div className="space-y-3">
              {myCommunities.map(community => (
                <div key={community.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <PickleballIcon />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{community.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {community.memberCount} members
                        {community.isActive && (
                          <>
                            <span className="mx-1">•</span>
                            <span className="text-green-500 flex items-center">
                              <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                              Active now
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3 text-primary text-sm">
              <PlusCircle className="h-3 w-3 mr-1" />
              Join more communities
            </Button>
          </div>
          
          {/* Upcoming Matches */}
          {upcomingMatches.length > 0 && (
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="font-bold text-lg mb-3">Upcoming Matches</h3>
              <div className="space-y-3">
                {upcomingMatches.map(match => (
                  <div key={match.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">vs {match.opponent}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {match.date}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {match.location}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-6 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-x-2">
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/accessibility">Accessibility</Link>
              <Link href="/about">About</Link>
            </div>
            <div className="mt-2">
              © 2025 Pickle+ • All rights reserved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Smart interaction box - Twitter-style + AI-powered interface
const SmartInteractionBox = () => {
  const [inputValue, setInputValue] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [mode, setMode] = useState<'post'|'question'|'community'>('post');
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Simulate sending the message to the backend and getting a response
    setIsAsking(true);
    
    // Reset after simulated delay
    setTimeout(() => {
      setInputValue("");
      setIsAsking(false);
    }, 1000);
  };

  return (
    <div className="flex">
      <Avatar className="h-10 w-10 mr-3 mt-1">
        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Textarea
              placeholder={
                mode === 'post' 
                  ? "What's happening in your pickleball world?" 
                  : mode === 'question' 
                    ? "Ask about events, courts, or players near you..." 
                    : "Share with your community..."
              }
              className="min-h-[80px] resize-none text-base placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary pb-10"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            
            {/* Mode toggler */}
            <div className="absolute bottom-2 left-2 flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`rounded-full p-2 h-8 ${mode === 'post' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                onClick={() => setMode('post')}
              >
                <PenSquare className="h-4 w-4" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`rounded-full p-2 h-8 ${mode === 'question' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                onClick={() => setMode('question')}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`rounded-full p-2 h-8 ${mode === 'community' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                    onClick={() => setMode('community')}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search communities..." />
                    <CommandList>
                      <CommandEmpty>No communities found.</CommandEmpty>
                      <CommandGroup heading="Your Communities">
                        {myCommunities.map(community => (
                          <CommandItem 
                            key={community.id}
                            onSelect={() => {
                              setSelectedCommunity(community.id);
                              setMode('community');
                            }}
                            className="flex items-center"
                          >
                            <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                              <PickleballIcon />
                            </div>
                            <span>{community.name}</span>
                            {selectedCommunity === community.id && (
                              <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              {mode === 'post' && (
                <>
                  <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <Calendar className="h-4 w-4 text-primary" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <MapPin className="h-4 w-4 text-primary" />
                  </Button>
                </>
              )}
              
              {mode === 'question' && (
                <>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                    Events
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                    Near me
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                </>
              )}
              
              {mode === 'community' && selectedCommunity && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                  {myCommunities.find(c => c.id === selectedCommunity)?.name}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedCommunity(null)} 
                  />
                </Badge>
              )}
            </div>
            
            <Button 
              type="submit" 
              size="sm" 
              className="rounded-full" 
              disabled={!inputValue.trim() || isAsking}
            >
              {isAsking ? (
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>{mode === 'question' ? 'Ask' : 'Post'}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// AI Response Item - Shows response to user questions
const AiResponseItem = () => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setExpanded(true);
      setLoading(false);
    }, 800);
  };
  
  return (
    <div className="border-b border-border p-4 bg-primary/5">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm">Pickle+ Assistant</span>
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
            <span className="text-muted-foreground text-xs">@pickleassist</span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">Just now</span>
          </div>
          
          <div className="mt-2">
            <p className="text-sm">Here are upcoming events near Seattle this week:</p>
            
            <div className="mt-3 space-y-3">
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Seattle Spring Tournament</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Apr 20, 2025 • 9:00 AM
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      Seattle Community Center
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Register</Button>
                </div>
              </div>
              
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Beginner Clinic</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Apr 18, 2025 • 6:00 PM
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      Greenlake Courts
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Register</Button>
                </div>
              </div>
              
              {expanded && (
                <>
                  <div className="bg-background p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Mixed Doubles Showdown</div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Apr 22, 2025 • 5:30 PM
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          Bellevue Indoor Courts
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Register</Button>
                    </div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Evening Social Play</div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Apr 19, 2025 • 7:00 PM
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          Redmond Rec Center
                        </div>
                      </div>
                      <Button size="sm" variant="outline">RSVP</Button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {!expanded && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-3 w-full text-xs" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                ) : (
                  'Show more events'
                )}
              </Button>
            )}
            
            <div className="mt-4 text-sm font-medium">
              Would you like me to filter by skill level or find events on a specific date?
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Show beginner events</Button>
              <Button variant="outline" size="sm">Show weekend events</Button>
              <Button variant="outline" size="sm">Show events with open spots</Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            <button className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4 mr-1" />
              Ask follow-up
            </button>
            
            <button className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
            
            <button className="flex items-center text-xs text-primary transition-colors ml-auto">
              <Info className="h-4 w-4 mr-1" />
              How this works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Community View Component
const CommunityView = () => {
  const [selectedCommunity, setSelectedCommunity] = useState(myCommunities[0]);
  
  return (
    <div className="flex flex-col">
      {/* Community Selector */}
      <div className="border-b border-border p-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center">
                <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                  <PickleballIcon />
                </div>
                <span>{selectedCommunity.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <Command>
              <CommandInput placeholder="Search communities..." />
              <CommandList>
                <CommandEmpty>No communities found.</CommandEmpty>
                <CommandGroup heading="Your Communities">
                  {myCommunities.map(community => (
                    <CommandItem 
                      key={community.id}
                      onSelect={() => setSelectedCommunity(community)}
                      className="flex items-center"
                    >
                      <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                        <PickleballIcon />
                      </div>
                      <span>{community.name}</span>
                      {community.id === selectedCommunity.id && (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Community Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{selectedCommunity.name}</h3>
            <div className="text-sm text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {selectedCommunity.memberCount} members
            </div>
          </div>
          <Button size="sm" variant="outline">Community Settings</Button>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>
      
      {/* Community Feed */}
      <div className="mt-2">
        <div className="p-4 border-b border-border">
          <div className="flex items-center">
            <Badge className="bg-blue-500 hover:bg-blue-500/90">Announcement</Badge>
            <span className="font-medium text-sm ml-2">Weekend Tournament Registration</span>
          </div>
          <p className="text-sm mt-2">
            Registration is now open for our weekend tournament! All skill levels welcome.
            Register by Friday to secure your spot.
          </p>
          <div className="flex items-center text-xs text-muted-foreground mt-3">
            <Calendar className="h-3 w-3 mr-1" />
            Apr 20, 2025
          </div>
          <div className="flex items-center gap-4 mt-3">
            <Button size="sm">Register Now</Button>
            <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Learn more
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b border-border">
          <div className="flex items-start">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="https://randomuser.me/api/portraits/women/68.jpg" alt="Sarah" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="font-medium text-sm">Sarah Lopez</span>
                <span className="text-muted-foreground text-xs ml-2">@sarah_l</span>
              </div>
              <p className="text-sm mt-1">
                Looking for a doubles partner for the tournament this weekend! I'm a 3.5 player.
                Message me if interested!
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-3 w-3 inline mr-1" />
                  Reply
                </button>
                <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Heart className="h-3 w-3 inline mr-1" />
                  Like
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwitterStyledDashboard;