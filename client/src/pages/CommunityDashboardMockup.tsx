/**
 * PKL-278651-COMM-0002-DASH-MOCK
 * Community-Centric Dashboard Mockup
 * 
 * This component displays a mockup of a reimagined dashboard
 * with community features as the central focus.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, MapPin, Calendar, Trophy, Star, Bell, Search,
  Plus, ChevronRight, MessageSquare, Activity, Zap,
  Clock, Award, CalendarDays, Bookmark, TrendingUp,
  Loader, UserPlus, ThumbsUp, Gift, Hash
} from 'lucide-react';

// Pickleball SVG Icon
const PickleballIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C13.3 2 14.6 2.3 15.8 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.4 5.2C21.5 7.8 22.5 11.4 21.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.7 19.8C15.1 21.9 11.5 22.5 8.2 21.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3.3 16.5C2 13.3 2.3 9.6 4.3 6.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 3.3C8.4 3.1 8.8 3 9.2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Court Pattern SVG for backgrounds
const CourtPatternIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

// Mock data for communities
const EXAMPLE_USER_COMMUNITIES = [
  {
    id: 1,
    name: "Seattle Pickleball Club",
    image: "/path/to/image1.jpg",
    memberCount: 342,
    location: "Seattle, WA",
    unreadUpdates: 3,
    isAdmin: true,
    upcomingEvents: 2
  },
  {
    id: 2,
    name: "Portland Pickle Smashers",
    image: "/path/to/image2.jpg",
    memberCount: 187,
    location: "Portland, OR",
    unreadUpdates: 0,
    isAdmin: false,
    upcomingEvents: 1
  },
  {
    id: 3,
    name: "NorCal Tournament Players",
    image: "/path/to/image3.jpg",
    memberCount: 156,
    location: "San Francisco, CA",
    unreadUpdates: 5,
    isAdmin: false,
    upcomingEvents: 3
  }
];

// Mock data for recommended communities
const RECOMMENDED_COMMUNITIES = [
  {
    id: 4,
    name: "Denver Pickleball Network",
    image: "/path/to/image4.jpg",
    memberCount: 224,
    location: "Denver, CO",
    skill: "All Levels",
    matchInterests: true,
    tags: ["Tournaments", "All Levels", "Coaching"]
  },
  {
    id: 5,
    name: "Austin Dink Warriors",
    image: "/path/to/image5.jpg",
    memberCount: 118,
    location: "Austin, TX",
    skill: "Intermediate",
    locationInterests: true,
    tags: ["Intermediate", "Drills", "Weekend Games"]
  },
  {
    id: 6,
    name: "Chicago Pickleball United",
    image: "/path/to/image6.jpg",
    memberCount: 276,
    location: "Chicago, IL",
    skill: "All Levels",
    friendsJoined: 3,
    tags: ["Indoor", "Year-round", "Social"]
  }
];

// Mock upcoming events
const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Weekend Tournament",
    community: "Seattle Pickleball Club",
    date: "Apr 20, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Green Lake Community Center",
    attendees: 28,
    isRegistered: true
  },
  {
    id: 2,
    title: "Skills Workshop: Dinking",
    community: "NorCal Tournament Players",
    date: "Apr 18, 2025",
    time: "6:30 PM - 8:00 PM",
    location: "Bay Club SF Tennis",
    attendees: 12,
    isRegistered: false
  },
  {
    id: 3,
    title: "Beginners Night",
    community: "Portland Pickle Smashers",
    date: "Apr 22, 2025",
    time: "7:00 PM - 9:00 PM",
    location: "PDX Indoor Sports",
    attendees: 16,
    isRegistered: true
  }
];

// Mock activity feed
const ACTIVITY_FEED = [
  {
    id: 1,
    type: "event_created",
    community: "Seattle Pickleball Club",
    content: "New event: Summer League Kickoff",
    time: "2 hours ago",
    icon: <Calendar className="h-4 w-4 text-blue-500" />
  },
  {
    id: 2,
    type: "member_joined",
    community: "NorCal Tournament Players",
    content: "Sarah J. joined the community",
    time: "3 hours ago",
    icon: <UserPlus className="h-4 w-4 text-green-500" />
  },
  {
    id: 3,
    type: "announcement",
    community: "Portland Pickle Smashers",
    content: "Court maintenance this weekend",
    time: "Yesterday",
    icon: <Bell className="h-4 w-4 text-amber-500" />
  },
  {
    id: 4,
    type: "match_result",
    community: "Seattle Pickleball Club",
    content: "Team Alpha won against Team Beta (11-7, 11-9)",
    time: "Yesterday",
    icon: <Trophy className="h-4 w-4 text-purple-500" />
  },
  {
    id: 5,
    type: "milestone",
    community: "NorCal Tournament Players",
    content: "Community reached 150 members!",
    time: "2 days ago",
    icon: <Award className="h-4 w-4 text-indigo-500" />
  }
];

// Mock featured players
const FEATURED_PLAYERS = [
  {
    id: 1,
    name: "Alex Chen",
    image: "/path/to/avatar1.jpg",
    rating: 4.5,
    communities: ["Seattle Pickleball Club", "NorCal Tournament Players"],
    recentAchievement: "Tournament Finalist"
  },
  {
    id: 2,
    name: "Maya Johnson",
    image: "/path/to/avatar2.jpg",
    rating: 4.8,
    communities: ["Portland Pickle Smashers"],
    recentAchievement: "Most Improved Player"
  },
  {
    id: 3,
    name: "Raj Patel",
    image: "/path/to/avatar3.jpg",
    rating: 4.2,
    communities: ["Seattle Pickleball Club", "Denver Pickleball Network"],
    recentAchievement: "5-Match Win Streak"
  }
];

const CommunityDashboardMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed');
  
  return (
    <div className="flex flex-col space-y-8 pb-8">
      {/* Hero Section with Stats Summary */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-blue-400/5 rounded-full blur-xl"></div>
        
        {/* Pattern overlay */}
        <div className="absolute right-12 top-0 bottom-0 opacity-10">
          <div className="w-96 h-full flex items-center justify-center">
            <div className="w-full h-96 rotate-12">
              <CourtPatternIcon />
            </div>
          </div>
        </div>
        
        <div className="relative p-6 sm:p-8 md:p-10 z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2">Welcome to your Pickle+ Community</h1>
              <p className="text-muted-foreground max-w-3xl">
                Connect with other players, join communities, and participate in local events.
                Your pickleball journey is better with friends!
              </p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <Badge variant="secondary" className="px-3 py-1.5 text-sm gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>3 Communities</span>
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-sm gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>6 Upcoming Events</span>
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-sm gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>8 New Updates</span>
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-sm gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Seattle, WA</span>
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button className="flex-1 gap-2">
                <Plus className="h-4 w-4" />
                Join Community
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Search className="h-4 w-4" />
                Explore
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Your Communities & Upcoming Events */}
        <div className="lg:col-span-1 space-y-6">
          {/* Your Communities Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">Your Communities</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                See All <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-3 py-1">
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 px-3">
                  {EXAMPLE_USER_COMMUNITIES.map(community => (
                    <div 
                      key={community.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 relative">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white">
                            <PickleballIcon />
                          </div>
                          {community.unreadUpdates > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-background text-[10px] flex items-center justify-center text-white font-semibold">
                              {community.unreadUpdates}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate pr-2">{community.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{community.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {community.isAdmin && (
                          <Badge variant="outline" className="mb-1 text-[10px] py-0 px-1.5">Admin</Badge>
                        )}
                        {community.upcomingEvents > 0 && (
                          <div className="text-xs text-primary">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            <span>{community.upcomingEvents} events</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Community
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Upcoming Events Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">Upcoming Events</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Calendar <CalendarDays className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="px-3 py-1">
              <ScrollArea className="h-[320px]">
                <div className="space-y-3 px-3">
                  {UPCOMING_EVENTS.map(event => (
                    <Card key={event.id} className="border-muted/60 hover:border-primary/30 transition-colors duration-200 cursor-pointer overflow-hidden">
                      <div className="flex flex-col">
                        <div className={`w-full h-1 ${event.isRegistered ? 'bg-primary' : 'bg-muted'}`}></div>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="h-12 w-12 flex flex-col items-center justify-center bg-muted rounded-md text-center">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {event.date.split(',')[0]}
                                </span>
                                <span className="text-lg font-bold leading-none">
                                  {event.date.split(' ')[1]}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1 text-sm">{event.title}</h3>
                              <div className="flex items-center text-xs text-muted-foreground mb-1">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{event.community}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{event.time}</span>
                                <MapPin className="h-3 w-3 ml-2 mr-1" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-muted-foreground">
                              <Avatar className="h-4 w-4 inline-block align-text-bottom">
                                <AvatarFallback>+</AvatarFallback>
                              </Avatar>
                              <span className="ml-1">{event.attendees} attending</span>
                            </div>
                            <Badge 
                              variant={event.isRegistered ? "default" : "outline"} 
                              className="text-xs py-0 h-5"
                            >
                              {event.isRegistered ? 'Registered' : 'Register'}
                            </Badge>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View All Events
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Middle Column - Activity Feed & Trending */}
        <div className="lg:col-span-1 space-y-6">
          {/* Activity Feed Tabs */}
          <Card>
            <CardHeader className="pb-2">
              <Tabs 
                defaultValue={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-xl font-semibold">Activity Feed</CardTitle>
                  <TabsList className="grid grid-cols-2 h-8">
                    <TabsTrigger value="feed" className="text-xs px-3">
                      <Activity className="h-3.5 w-3.5 mr-1" />
                      Feed
                    </TabsTrigger>
                    <TabsTrigger value="trending" className="text-xs px-3">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      Trending
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="feed" className="m-0">
                  <ScrollArea className="h-[420px]">
                    <div className="space-y-3 px-1">
                      {ACTIVITY_FEED.map(item => (
                        <div 
                          key={item.id}
                          className="flex gap-3 p-3 rounded-lg border border-muted hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-muted/80 flex items-center justify-center">
                              {item.icon}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.content}</p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-primary font-medium">
                                {item.community}
                              </span>
                              <span className="text-xs text-muted-foreground mx-1.5">•</span>
                              <span className="text-xs text-muted-foreground">
                                {item.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-center py-3">
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                          <Loader className="h-3.5 w-3.5 mr-1" />
                          Load More
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="trending" className="m-0">
                  <ScrollArea className="h-[420px]">
                    <div className="space-y-4 px-1">
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Hash className="h-4 w-4 mr-1.5 text-primary" />
                          Trending Topics
                        </h3>
                        
                        <div className="flex flex-wrap gap-2">
                          {["#PickleballTips", "#WeekendTournament", "#BeginnerAdvice", 
                            "#ProTechniques", "#CourtEtiquette", "#NewEquipment"].map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary"
                              className="px-2.5 py-1 cursor-pointer hover:bg-muted/60"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1.5 text-primary" />
                          Growing Communities
                        </h3>
                        
                        <div className="space-y-2">
                          {RECOMMENDED_COMMUNITIES.slice(0, 2).map(community => (
                            <div 
                              key={community.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white">
                                  <PickleballIcon />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{community.name}</div>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Users className="h-3 w-3 mr-1" />
                                    <span>{community.memberCount} members</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                <span>+24%</span>
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Award className="h-4 w-4 mr-1.5 text-primary" />
                          Recent Achievements
                        </h3>
                        
                        <div className="space-y-2">
                          {FEATURED_PLAYERS.slice(0, 2).map(player => (
                            <div 
                              key={player.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm flex items-center">
                                    {player.name}
                                    <div className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-semibold inline-flex items-center">
                                      <Star className="h-2 w-2 mr-0.5 fill-amber-500 text-amber-500" />
                                      {player.rating}
                                    </div>
                                  </div>
                                  <div className="text-xs text-primary font-medium">
                                    {player.recentAchievement}
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
        
        {/* Right Column - Recommended Communities & Featured Players */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recommended Communities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">Recommended For You</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Refresh <Zap className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="px-3 py-1">
              <ScrollArea className="h-[360px]">
                <div className="space-y-4 px-3">
                  {RECOMMENDED_COMMUNITIES.map(community => (
                    <Card 
                      key={community.id} 
                      className="border-muted/60 hover:border-primary/30 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/50 relative">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-[300px] h-[300px] rotate-[20deg]">
                              <CourtPatternIcon />
                            </div>
                          </div>
                        </div>
                        
                        {/* Recommendation reason */}
                        <div className="absolute top-2 right-2">
                          <Badge 
                            className={`
                              text-[10px] py-0 px-2 
                              ${community.matchInterests ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400' : 
                                community.locationInterests ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}
                            `}
                          >
                            {community.matchInterests ? 'Matches your interests' : 
                              community.locationInterests ? 'Near you' : 
                              `${community.friendsJoined} friends joined`}
                          </Badge>
                        </div>
                        
                        {/* Community info in the gradient */}
                        <div className="absolute bottom-3 left-3 text-white">
                          <h3 className="font-bold text-base drop-shadow-sm">
                            {community.name}
                          </h3>
                          <div className="flex items-center text-xs text-white/90">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{community.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center text-sm">
                            <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            <span>{community.memberCount} members</span>
                          </div>
                          <div className="bg-muted/50 px-2 py-0.5 rounded text-xs">
                            {community.skill}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {community.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="text-xs px-2 py-0 bg-muted/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7 gap-1"
                          >
                            <Bookmark className="h-3 w-3" />
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            className="text-xs h-7 gap-1"
                          >
                            <UserPlus className="h-3 w-3" />
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Discover More Communities
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Featured Players Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">Featured Players</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="px-3 py-1">
              <div className="space-y-3 px-3">
                {FEATURED_PLAYERS.map(player => (
                  <div 
                    key={player.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border border-muted hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{player.name}</span>
                        <div className="flex items-center text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-500 mr-0.5" />
                          <span className="text-xs font-semibold">{player.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 flex-wrap">
                        {player.communities.map((community, idx) => (
                          <React.Fragment key={community}>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                              {community.split(' ')[0]}
                            </Badge>
                            {idx < player.communities.length - 1 && (
                              <span className="text-muted-foreground text-xs mx-0.5">•</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      
                      <div className="mt-1 text-xs flex items-center text-primary">
                        <Gift className="h-3 w-3 mr-1" />
                        <span>{player.recentAchievement}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Connect with Players
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboardMockup;