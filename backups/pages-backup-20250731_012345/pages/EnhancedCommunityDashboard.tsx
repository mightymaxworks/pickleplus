/**
 * PKL-278651-COMM-0002-DASH-ENHANCED
 * Enhanced Community-Centric Dashboard
 * 
 * This component displays an engaging, social-media inspired
 * dashboard focused entirely on community interaction.
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Users, MapPin, Calendar, Trophy, Star, Bell, Search,
  Plus, ChevronRight, MessageSquare, Activity, Zap,
  Clock, Award, CalendarDays, Bookmark, TrendingUp,
  UserPlus, ThumbsUp, Heart, Share2, Camera, Gift,
  ExternalLink, CheckCircle2, Play, Pin, Flame, Sparkles
} from 'lucide-react';

// Pickleball SVG Icon
const PickleballIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

// Mock data for communities with more visual elements
const FEATURED_COMMUNITIES = [
  {
    id: 1,
    name: "Seattle Pickleball Club",
    tagline: "Join Seattle's most active pickleball community!",
    gradient: "from-blue-500 to-sky-400",
    coverImage: "https://images.unsplash.com/photo-1669703437226-897bea9c28a3",
    memberCount: 342,
    location: "Seattle, WA",
    isHot: true,
    isVerified: true,
    activity: 98,
    activeNow: 24,
    events: [
      { name: "Weekend Tournament", date: "Apr 20", attendees: 28 },
      { name: "Beginners Workshop", date: "Apr 23", attendees: 12 }
    ],
    stats: { wins: 126, tournaments: 8, avgRating: 4.8 },
    achievements: ["Most Active", "Tournament Champions", "Fastest Growing"],
    featuredMembers: [
      { id: 1, name: "Alex Chen", image: "https://randomuser.me/api/portraits/men/32.jpg", rating: 4.7 },
      { id: 2, name: "Sarah Lopez", image: "https://randomuser.me/api/portraits/women/44.jpg", rating: 4.9 },
      { id: 3, name: "Jordan Kim", image: "https://randomuser.me/api/portraits/men/59.jpg", rating: 4.6 }
    ],
    recentActivity: "New tournament announced: Summer Classic"
  },
  {
    id: 2,
    name: "Portland Pickle Smashers",
    tagline: "Casual play with competitive spirit",
    gradient: "from-purple-600 to-pink-500",
    coverImage: "https://images.unsplash.com/photo-1626224583764-f88b501d07dc",
    memberCount: 187,
    location: "Portland, OR",
    isHot: false,
    isVerified: true,
    activity: 76,
    activeNow: 13,
    events: [
      { name: "Beginners Night", date: "Apr 22", attendees: 16 },
      { name: "Skills Clinic", date: "Apr 25", attendees: 10 }
    ],
    stats: { wins: 84, tournaments: 4, avgRating: 4.5 },
    achievements: ["Most Improved", "Beginner Friendly", "Best Facility"],
    featuredMembers: [
      { id: 4, name: "Taylor Reed", image: "https://randomuser.me/api/portraits/women/67.jpg", rating: 4.3 },
      { id: 5, name: "Chris Johnson", image: "https://randomuser.me/api/portraits/men/83.jpg", rating: 4.6 }
    ],
    recentActivity: "New members welcome event this Friday!"
  },
  {
    id: 3,
    name: "NorCal Tournament Players",
    tagline: "Elite play for competitive athletes",
    gradient: "from-amber-500 to-orange-500",
    coverImage: "https://images.unsplash.com/photo-1626224583764-f88b501d07dc",
    memberCount: 156,
    location: "San Francisco, CA",
    isHot: true,
    isVerified: true,
    activity: 92,
    activeNow: 18,
    events: [
      { name: "Skills Workshop", date: "Apr 18", attendees: 12 },
      { name: "Pro Exhibition", date: "Apr 30", attendees: 45 }
    ],
    stats: { wins: 203, tournaments: 12, avgRating: 4.9 },
    achievements: ["Tournament Champions", "Highest Rated", "Pro Coach Certified"],
    featuredMembers: [
      { id: 6, name: "Maya Patel", image: "https://randomuser.me/api/portraits/women/33.jpg", rating: 5.0 },
      { id: 7, name: "Derek Wilson", image: "https://randomuser.me/api/portraits/men/11.jpg", rating: 4.9 }
    ],
    recentActivity: "Coach Williams hosting strategy session next week"
  }
];

// Activity feed with more social media style content
const SOCIAL_FEED_ITEMS = [
  {
    id: 1,
    type: "photo",
    author: {
      name: "Seattle Pickleball Club",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      isVerified: true
    },
    timePosted: "2 hours ago",
    location: "Green Lake Community Center",
    content: {
      text: "Amazing turnout for our weekend tournament! Congratulations to all winners and participants.",
      image: "https://images.unsplash.com/photo-1626224583764-f88b501d07dc"
    },
    stats: { likes: 124, comments: 18, shares: 7 },
    isLiked: true
  },
  {
    id: 2,
    type: "event",
    author: {
      name: "Portland Pickle Smashers",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      isVerified: true
    },
    timePosted: "3 hours ago",
    location: "Portland Indoor Sports Complex",
    content: {
      text: "Our beginners' workshop is now open for registration! All skill levels welcome.",
      eventDate: "April 22, 7:00 PM",
      attendeeCount: 16,
      isRegistered: false
    },
    stats: { likes: 57, comments: 8, shares: 12 },
    isLiked: false
  },
  {
    id: 3,
    type: "achievement",
    author: {
      name: "Maya Patel",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      community: "NorCal Tournament Players"
    },
    timePosted: "Yesterday",
    content: {
      text: "Just reached Level 5.0! Thanks to everyone who's helped me improve my game.",
      achievement: "Level 5.0 Rating",
      badgeColor: "bg-gradient-to-r from-yellow-400 to-amber-600"
    },
    stats: { likes: 203, comments: 42, shares: 5 },
    isLiked: true
  },
  {
    id: 4,
    type: "video",
    author: {
      name: "Coach Williams",
      image: "https://randomuser.me/api/portraits/men/83.jpg",
      community: "NorCal Tournament Players",
      isVerified: true
    },
    timePosted: "Yesterday",
    content: {
      text: "Quick tip: Improving your dink accuracy. Watch this 30-second demonstration.",
      thumbnail: "https://images.unsplash.com/photo-1669703437226-897bea9c28a3",
      duration: "0:32"
    },
    stats: { likes: 312, comments: 45, shares: 87 },
    isLiked: false
  }
];

// Trending community challenges
const COMMUNITY_CHALLENGES = [
  {
    id: 1,
    title: "#DinkChallenge",
    description: "Show off your dinking skills in a 15-second video",
    participants: 2843,
    featured: true,
    gradient: "from-violet-600 to-indigo-600",
    icon: <Activity className="h-5 w-5" />
  },
  {
    id: 2,
    title: "#ServeAccuracy",
    description: "How many serves can you land in the target zone?",
    participants: 1756,
    featured: false,
    gradient: "from-emerald-500 to-teal-600",
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 3,
    title: "#ThirdShotDrop",
    description: "Master the third shot drop - share your progress!",
    participants: 954,
    featured: false,
    gradient: "from-amber-500 to-orange-600",
    icon: <Zap className="h-5 w-5" />
  }
];

// Discover communities section with visual categorization
const DISCOVER_CATEGORIES = [
  {
    id: 1,
    name: "Nearby Communities",
    icon: <MapPin className="h-5 w-5" />,
    gradient: "from-blue-500 to-cyan-500",
    count: 12
  },
  {
    id: 2,
    name: "Beginner Friendly",
    icon: <Users className="h-5 w-5" />,
    gradient: "from-green-500 to-emerald-500",
    count: 28
  },
  {
    id: 3,
    name: "Tournament Focused",
    icon: <Trophy className="h-5 w-5" />,
    gradient: "from-amber-500 to-orange-500",
    count: 16
  },
  {
    id: 4,
    name: "Training Programs",
    icon: <Zap className="h-5 w-5" />,
    gradient: "from-purple-500 to-pink-500",
    count: 19
  }
];

// Online friends in communities
const ONLINE_FRIENDS = [
  { id: 1, name: "Alex C.", image: "https://randomuser.me/api/portraits/men/32.jpg", status: "playing" },
  { id: 2, name: "Maya P.", image: "https://randomuser.me/api/portraits/women/33.jpg", status: "online" },
  { id: 3, name: "Jordan K.", image: "https://randomuser.me/api/portraits/men/59.jpg", status: "online" },
  { id: 4, name: "Sarah L.", image: "https://randomuser.me/api/portraits/women/44.jpg", status: "offline" },
  { id: 5, name: "Derek W.", image: "https://randomuser.me/api/portraits/men/11.jpg", status: "playing" }
];

const EnhancedCommunityDashboard: React.FC = () => {
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  
  // Simple animation for progress bars
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(66);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Simple animation for featured communities
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedIndex((prevIndex) => 
        prevIndex === FEATURED_COMMUNITIES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="pb-8">
      {/* Immersive Hero Carousel */}
      <div className="mb-8 overflow-hidden relative rounded-2xl h-[420px] shadow-xl group">
        {FEATURED_COMMUNITIES.map((community, index) => (
          <div 
            key={community.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === animatedIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              backgroundImage: `url(${community.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${community.gradient} opacity-80`}></div>
            
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-full">
                  <CourtPatternIcon />
                </div>
              </div>
            </div>
            
            {/* Content container */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-3 mr-4">
                    <PickleballIcon />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-3xl font-bold mr-2">{community.name}</h2>
                      {community.isVerified && (
                        <CheckCircle2 className="h-5 w-5 text-white fill-primary" />
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1.5 opacity-80" />
                      <span className="text-white/90">{community.location}</span>
                      {community.isHot && (
                        <Badge className="ml-3 bg-orange-500/80 hover:bg-orange-500 border-transparent py-1 gap-1">
                          <Flame className="h-3 w-3" /> Trending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-transparent backdrop-blur-md">
                    <Share2 className="h-4 w-4 mr-1.5" />
                    Share
                  </Button>
                  <Button className="bg-white text-primary hover:bg-white/90 hover:text-primary/90">
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Join
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="max-w-2xl">
                  <p className="text-xl font-medium mb-3">{community.tagline}</p>
                  
                  <div className="flex space-x-4 mb-5">
                    <div className="bg-black/20 backdrop-blur-sm rounded-md px-3 py-2 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-white/80" />
                      <div>
                        <div className="font-semibold">{community.memberCount}</div>
                        <div className="text-xs text-white/80">Members</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 backdrop-blur-sm rounded-md px-3 py-2 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-white/80" />
                      <div>
                        <div className="font-semibold">{community.activity}%</div>
                        <div className="text-xs text-white/80">Activity</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 backdrop-blur-sm rounded-md px-3 py-2 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-white/80" />
                      <div>
                        <div className="font-semibold">{community.events.length}</div>
                        <div className="text-xs text-white/80">Events</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 backdrop-blur-sm rounded-md px-3 py-2 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-white/80 fill-yellow-300" />
                      <div>
                        <div className="font-semibold">{community.stats.avgRating}</div>
                        <div className="text-xs text-white/80">Rating</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {community.achievements.map((achievement, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-transparent py-1"
                      >
                        <Award className="h-3 w-3 mr-1.5" /> {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex -space-x-3 mr-2">
                  {community.featuredMembers.map((member, idx) => (
                    <div key={idx} className="relative">
                      <Avatar className="border-2 border-white h-10 w-10">
                        <AvatarImage src={member.image} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-primary text-[10px] text-white rounded-full h-5 w-5 flex items-center justify-center border border-white">
                        {member.rating}
                      </div>
                    </div>
                  ))}
                  <div className="bg-black/40 backdrop-blur-sm text-white h-10 w-10 rounded-full flex items-center justify-center border-2 border-white text-xs font-medium">
                    +{community.memberCount - community.featuredMembers.length}
                  </div>
                  <div className="ml-3 bg-emerald-500/80 text-white px-3 flex items-center rounded-full backdrop-blur-sm text-sm">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse mr-2"></div>
                    {community.activeNow} active now
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel indicator dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {FEATURED_COMMUNITIES.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setAnimatedIndex(idx)}
              className={`h-2 w-2 rounded-full transition-all ${
                idx === animatedIndex 
                  ? "bg-white w-6" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`View community ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Social Feed */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold flex items-center">
              <Bell className="h-5 w-5 mr-2 text-primary" />
              Community Feed
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full">
                <TrendingUp className="h-4 w-4 mr-1.5" />
                Trending
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                <Users className="h-4 w-4 mr-1.5" />
                Following
              </Button>
            </div>
          </div>
          
          {/* Post creation box */}
          <Card className="overflow-hidden border-muted/50">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Avatar>
                  <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="bg-muted/50 rounded-full px-4 py-2.5 text-muted-foreground cursor-pointer hover:bg-muted transition-colors">
                    Share an update with your communities...
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                      <Camera className="h-4 w-4 mr-1.5" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                      <Play className="h-4 w-4 mr-1.5" />
                      Video
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      Event
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Social feed items */}
          <div className="space-y-5">
            {SOCIAL_FEED_ITEMS.map((item) => (
              <Card key={item.id} className="overflow-hidden border-muted/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="p-0">
                  {/* Post header */}
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={item.author.image} />
                        <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{item.author.name}</span>
                          {item.author.isVerified && (
                            <CheckCircle2 className="h-4 w-4 ml-1 text-primary fill-primary/20" />
                          )}
                          {item.author.community && (
                            <div className="ml-2 text-xs text-muted-foreground flex items-center">
                              <span>•</span>
                              <PickleballIcon />
                              <span className="ml-1">{item.author.community}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          <span>{item.timePosted}</span>
                          {item.location && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="h-3 w-3 mr-0.5" />
                              <span>{item.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                      <span className="sr-only">More options</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </Button>
                  </div>
                  
                  {/* Post content */}
                  <div className="px-4 mb-3">
                    <p className="text-sm">{item.content.text}</p>
                  </div>
                  
                  {/* Post type-specific content */}
                  {item.type === "photo" && (
                    <div className="relative h-72 w-full bg-muted/40 overflow-hidden mb-2">
                      <img 
                        src={item.content.image} 
                        alt={`Post by ${item.author.name}`} 
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                      />
                    </div>
                  )}
                  
                  {item.type === "video" && (
                    <div className="relative h-72 w-full bg-muted/40 overflow-hidden mb-2">
                      <img 
                        src={item.content.thumbnail} 
                        alt={`Video by ${item.author.name}`} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform">
                          <Play className="h-8 w-8 text-white" fill="white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                        {item.content.duration}
                      </div>
                    </div>
                  )}
                  
                  {item.type === "event" && (
                    <div className="mx-4 mb-4 bg-muted/20 rounded-xl overflow-hidden border border-muted">
                      <div className="p-4 flex items-center">
                        <div className="h-14 w-14 bg-primary/10 rounded-lg mr-4 flex flex-col items-center justify-center text-primary">
                          <Calendar className="h-6 w-6 mb-1" />
                          <div className="text-[10px] font-medium uppercase">
                            {item.content.eventDate.split(',')[0]}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.content.eventDate}</h4>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>{item.content.attendeeCount} attending</span>
                          </div>
                        </div>
                        <Button size="sm" className={item.content.isRegistered ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}>
                          {item.content.isRegistered ? "Registered" : "Register"}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {item.type === "achievement" && (
                    <div className="mx-4 mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl overflow-hidden border border-amber-200 dark:border-amber-800">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-12 w-12 rounded-full ${item.content.badgeColor} flex items-center justify-center mr-3`}>
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{item.content.achievement}</div>
                            <div className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Achievement Unlocked!</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                          <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Congrats!
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Post interactions */}
                  <div className="px-4 pb-3 flex items-center justify-between border-t border-muted/50 pt-3">
                    <div className="flex space-x-5">
                      <button className={`flex items-center text-sm font-medium ${item.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Heart className={`h-4 w-4 mr-1.5 ${item.isLiked ? 'fill-primary' : ''}`} />
                        <span>{item.stats.likes}</span>
                      </button>
                      <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        <span>{item.stats.comments}</span>
                      </button>
                      <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                        <Share2 className="h-4 w-4 mr-1.5" />
                        <span>{item.stats.shares}</span>
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button variant="outline" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Load More
            </Button>
          </div>
        </div>
        
        {/* Middle column - Challenges & Discover */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active user indicator */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center mr-2">
                <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
              </div>
              <span className="text-green-700 dark:text-green-400 font-medium">{ONLINE_FRIENDS.filter(f => f.status !== 'offline').length} friends active</span>
            </div>
            <Button variant="ghost" size="sm" className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/50 h-8 px-2">
              <Users className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Play Status */}
          <Card className="border-primary/20 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center">
                  <Activity className="h-4 w-4 mr-1.5 text-primary" />
                  Your Stats
                </h3>
                <Badge variant="outline" className="font-normal">
                  Level 32
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span className="font-medium">{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="font-semibold">24</div>
                    <div className="text-xs text-muted-foreground">Matches</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="font-semibold">7</div>
                    <div className="text-xs text-muted-foreground">Communities</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="font-semibold">4.2</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  View Full Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        
          {/* Trending Challenges */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Flame className="h-4 w-4 mr-1.5 text-orange-500" />
              Trending Challenges
            </h3>
            
            <div className="space-y-3">
              {COMMUNITY_CHALLENGES.map((challenge) => (
                <Card 
                  key={challenge.id} 
                  className={`overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${
                    challenge.featured ? 'border-primary/30 hover:border-primary' : 'border-muted/60'
                  }`}
                >
                  <CardContent className="p-0">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${challenge.gradient}`}></div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm flex items-center">
                          {challenge.icon}
                          <span className="ml-1.5">{challenge.title}</span>
                          {challenge.featured && (
                            <Badge className="ml-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-transparent text-[10px] h-4">
                              Hot
                            </Badge>
                          )}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          {challenge.participants.toLocaleString()} participants
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 mb-2.5">
                        {challenge.description}
                      </p>
                      
                      <div className="flex justify-between">
                        <Button size="sm" className={`group-hover:bg-gradient-to-r ${challenge.gradient} text-xs h-7 px-2.5 group-hover:text-white transition-all duration-300`}>
                          Join Challenge
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2.5">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
                See All Challenges
              </Button>
            </div>
          </div>
          
          {/* Discover */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-1.5 text-primary" />
              Discover Communities
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {DISCOVER_CATEGORIES.map((category) => (
                <Card 
                  key={category.id}
                  className="overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 border-muted/60 hover:border-primary/30"
                >
                  <CardContent className="p-0">
                    <div className={`h-2 w-full bg-gradient-to-r ${category.gradient}`}></div>
                    <div className="p-3 text-center">
                      <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                        {category.icon}
                      </div>
                      <div className="font-medium text-sm mb-1">{category.name}</div>
                      <div className="text-xs text-muted-foreground">{category.count} communities</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button variant="outline" size="sm" className="w-full mt-3">
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Advanced Search
            </Button>
          </div>
          
          {/* Active Friends */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-primary" />
              Friends
            </h3>
            
            <div className="space-y-2">
              {ONLINE_FRIENDS.map((friend) => (
                <div 
                  key={friend.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={friend.image} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                        friend.status === 'playing' ? 'bg-orange-500' : 
                        friend.status === 'online' ? 'bg-green-500' : 'bg-muted'
                      }`}></div>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{friend.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {friend.status === 'playing' ? 'In a match' : friend.status}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground">
                See All Friends
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right column - Upcoming Events */}
        <div className="lg:col-span-3 space-y-6">
          {/* Community actions quick access */}
          <Card className="border-primary/20 overflow-hidden">
            <CardContent className="p-4">
              <h3 className="font-semibold flex items-center mb-4">
                <Zap className="h-4 w-4 mr-1.5 text-primary" />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-auto py-3 flex-col items-center justify-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Join Community</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col items-center justify-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Community</span>
                </Button>
                <Button variant="secondary" className="h-auto py-3 flex-col items-center justify-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Find Events</span>
                </Button>
                <Button variant="secondary" className="h-auto py-3 flex-col items-center justify-center gap-2">
                  <Search className="h-5 w-5" />
                  <span>Find Players</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        
          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center">
                <Calendar className="h-4 w-4 mr-1.5 text-primary" />
                Upcoming Events
              </h3>
              <Button variant="ghost" size="sm">
                <CalendarDays className="h-4 w-4 mr-1.5" />
                Calendar
              </Button>
            </div>
            
            <ScrollArea className="h-[480px] pr-3">
              <div className="space-y-3">
                {FEATURED_COMMUNITIES.flatMap(community => 
                  community.events.map((event, idx) => (
                    <Card 
                      key={`${community.id}-${idx}`}
                      className="overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer border-muted/60 hover:border-primary/30"
                    >
                      <CardContent className="p-0">
                        <div className={`h-1.5 w-full bg-gradient-to-r ${community.gradient}`}></div>
                        <div className="p-4">
                          <div className="flex">
                            <div className="mr-3 h-12 w-12 bg-muted/30 rounded-lg flex flex-col items-center justify-center">
                              <div className="text-xs text-muted-foreground">
                                {event.date.split(' ')[0]}
                              </div>
                              <div className="font-bold text-lg leading-tight">
                                {event.date.split(' ')[1]}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{event.name}</h3>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <PickleballIcon />
                                <span className="ml-1 mr-2">{community.name}</span>
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-0.5" />
                                  {event.attendees}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-7 px-2.5"
                            >
                              <Bell className="h-3.5 w-3.5 mr-1" />
                              Remind Me
                            </Button>
                            <Button 
                              size="sm" 
                              className={`text-xs h-7 px-2.5 bg-gradient-to-r ${community.gradient} hover:opacity-90 text-white border-none`}
                            >
                              Register
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                
                <Button variant="outline" className="w-full">
                  View All Events
                </Button>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCommunityDashboard;