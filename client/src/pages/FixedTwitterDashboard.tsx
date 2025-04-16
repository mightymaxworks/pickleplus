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
    <path d="M7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Current User Mock Data
const currentUser = {
  id: 1,
  name: "Mighty Max",
  username: "mightymax",
  avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  passportId: "PKL4578",
  courtIQ: 85,
  paddleBrand: "SHOT3",
  paddleModel: "Genesis Pro Ai",
  preferredSide: "Forehand",
  playStyle: "All-court"
};

// Feed Mock Data
const feedItems = [
  {
    id: 1,
    user: {
      name: "John Doe",
      username: "john_doe",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    content: "Just hit a perfect third shot drop! Anyone playing at Central Courts this weekend?",
    timestamp: "3h ago",
    likes: 24,
    comments: 5,
    isLiked: false,
    hasImage: false,
    image: ""
  },
  {
    id: 2,
    user: {
      name: "Riley Tennis",
      username: "riley_t",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    content: "Switched to pickleball from tennis last month and I'm addicted! Looking for some 3.5-4.0 players in the Portland area for regular games.",
    timestamp: "5h ago",
    likes: 31,
    comments: 12,
    isLiked: true,
    hasImage: true,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGlja2xlYmFsbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
  },
  {
    id: 3,
    user: {
      name: "Pickleball Pro Tour",
      username: "pbtour",
      avatarUrl: "https://randomuser.me/api/portraits/lego/5.jpg",
      isVerified: true
    },
    content: "Tournament registration is now open for the Seattle Open! Early bird pricing ends in 48 hours.",
    timestamp: "1d ago",
    likes: 128,
    comments: 43,
    isLiked: false,
    hasImage: false,
    image: ""
  }
];

// Trending Tournaments Mock Data
const trendingTournaments = [
  {
    id: 1,
    name: "Seattle Spring Open",
    date: "Apr 20-22, 2025",
    registered: true
  },
  {
    id: 2,
    name: "Portland Masters",
    date: "May 5-7, 2025",
    registered: false
  },
  {
    id: 3,
    name: "Regional Championship",
    date: "May 15-18, 2025",
    registered: false
  }
];

// My Communities Mock Data
const myCommunities = [
  {
    id: 1,
    name: "Seattle Picklers",
    memberCount: 1240,
    isActive: true
  },
  {
    id: 2,
    name: "Dink Masters",
    memberCount: 867,
    isActive: false
  },
  {
    id: 3,
    name: "Beginners Welcome",
    memberCount: 2134,
    isActive: true
  }
];

// Upcoming Matches Mock Data
const upcomingMatches = [
  {
    id: 1,
    opponent: "Team Alpha",
    date: "Tomorrow, 3:00 PM",
    location: "Central Courts"
  },
  {
    id: 2,
    opponent: "The Dinkers",
    date: "Sat, Apr 19, 10:00 AM",
    location: "Westside Rec Center"
  }
];

// Feed Item Component
interface FeedItemProps {
  item: {
    id: number;
    user: {
      name: string;
      username: string;
      avatarUrl: string;
      isVerified?: boolean;
    };
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    hasImage: boolean;
    image: string;
  };
}

const FeedItem = ({ item }: FeedItemProps) => {
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likeCount, setLikeCount] = useState(item.likes);
  
  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev: number) => prev - 1);
    } else {
      setLikeCount((prev: number) => prev + 1);
    }
    setIsLiked(!isLiked);
  };
  
  return (
    <div className="border-b border-border p-4">
      <div className="flex">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={item.user.avatarUrl} alt={item.user.name} />
          <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-semibold text-sm">{item.user.name}</span>
            {item.user.isVerified && (
              <CheckCircle2 className="h-3 w-3 ml-1 text-blue-500" />
            )}
            <span className="text-muted-foreground text-xs ml-1">@{item.user.username}</span>
            <span className="text-muted-foreground text-xs ml-1">·</span>
            <span className="text-muted-foreground text-xs ml-1">{item.timestamp}</span>
          </div>
          
          <p className="mt-2 text-sm">{item.content}</p>
          
          {item.hasImage && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img src={item.image} alt="Post image" className="w-full h-auto" />
            </div>
          )}
          
          <div className="flex mt-3 text-xs text-muted-foreground">
            <button className="flex items-center mr-4 hover:text-primary transition-colors">
              <MessageCircle className="h-4 w-4 mr-1" />
              {item.comments}
            </button>
            
            <button 
              className={`flex items-center mr-4 transition-colors ${isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-primary'}`}
              onClick={handleLike}
            >
              <Heart className="h-4 w-4 mr-1" fill={isLiked ? "currentColor" : "none"} />
              {likeCount}
            </button>
            
            <button className="flex items-center hover:text-primary transition-colors">
              <RefreshCw className="h-4 w-4 mr-1" />
            </button>
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
const FixedTwitterDashboard = () => {
  return (
    <div className="flex container mx-auto max-w-7xl">
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden lg:flex lg:w-64 flex-col p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-6">
          <PickleballIcon />
          <span className="font-bold text-xl">Pickle+</span>
        </div>
        
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/search">
              <Search className="mr-2 h-5 w-5" />
              Search
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/communities">
              <Users className="mr-2 h-5 w-5" />
              Communities
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/tournaments">
              <Trophy className="mr-2 h-5 w-5" />
              Tournaments
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/notifications">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/messages">
              <MessageCircle className="mr-2 h-5 w-5" />
              Messages
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/bookmarks">
              <Bookmark className="mr-2 h-5 w-5" />
              Bookmarks
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/profile">
              <User className="mr-2 h-5 w-5" />
              Profile
            </Link>
          </Button>
        </div>
        
        <div className="mt-6">
          <Button className="w-full" asChild>
            <Link href="/match/record">
              Record Match
            </Link>
          </Button>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center gap-3 bg-background p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-border">
            <Avatar>
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{currentUser.name}</div>
              <div className="text-xs text-muted-foreground truncate">@{currentUser.username}</div>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
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
            <div className="lg:hidden flex items-center gap-1">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md cursor-pointer">
                    <div className="text-xs">{currentUser.passportId}</div>
                    <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">
                      {currentUser.courtIQ}
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="w-72">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-16 w-16 mb-2">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg">{currentUser.name}</h3>
                      <div className="text-sm text-muted-foreground">@{currentUser.username}</div>
                      
                      <div className="mt-4 flex justify-center">
                        <QRCodeSVG 
                          value={`PKL:${currentUser.passportId}`}
                          size={150}
                          includeMargin={true}
                          className="border-2 border-primary p-1 rounded-md"
                        />
                      </div>
                      
                      <div className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium">
                        Passport ID: {currentUser.passportId}
                      </div>
                      
                      <div className="mt-2 flex items-center">
                        <span className="font-medium mr-2">CourtIQ™:</span>
                        <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
                          {currentUser.courtIQ}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Equipment</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paddle Brand:</span>
                          <span>{currentUser.paddleBrand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paddle Model:</span>
                          <span>{currentUser.paddleModel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Preferred Side:</span>
                          <span>{currentUser.preferredSide}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Playing Style:</span>
                          <span>{currentUser.playStyle}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>
          
        <Tabs defaultValue="for-you" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="for-you">
              For You
            </TabsTrigger>
            <TabsTrigger value="following">
              Following
            </TabsTrigger>
            <TabsTrigger value="communities">
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

export default FixedTwitterDashboard;