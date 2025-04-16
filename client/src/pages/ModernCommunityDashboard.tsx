/**
 * PKL-278651-COMM-0003-DASH-MODERN
 * Modern Social Media Inspired Community Dashboard
 * 
 * This component creates a modern community-centric dashboard inspired by
 * Discord, Messenger, Facebook, and Instagram interfaces with minimal scrolling
 * and maximum engagement through interactive cards and modals.
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Bell, Calendar, Trophy, Star, Search,
  MessageSquare, Activity, Zap, Settings, 
  Clock, Award, Gift, Heart, Share2, Video,
  Image, Smile, Send, Paperclip, Hash, 
  ChevronDown, ChevronRight, Plus, X, Menu,
  Globe, Flag, Lock, UserPlus, AlignJustify,
  HelpCircle, LogOut, Home, MapPin, Sparkles,
  CheckCircle2, PlusCircle, ChevronLeft, MoreHorizontal,
  Edit3, Trash2, ExternalLink, Bookmark, Play,
  Target
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Pickleball Pattern SVG
const CourtPattern = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" className="text-primary/10" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
    <line x1="0" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
    <line x1="30" y1="0" x2="30" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
    <circle cx="30" cy="30" r="10" stroke="currentColor" strokeWidth="0.5" fill="none" />
  </svg>
);

// Pickleball Icon
const PickleballIcon = ({ className = "w-5 h-5", fill = "none" }: { className?: string, fill?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C13.3 2 14.6 2.3 15.8 2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M19.4 5.2C21.5 7.8 22.5 11.4 21.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17.7 19.8C15.1 21.9 11.5 22.5 8.2 21.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3.3 16.5C2 13.3 2.3 9.6 4.3 6.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Special communities with auto-enrollment
const OFFICIAL_COMMUNITIES = [
  {
    id: "pickle-giveaway",
    name: "Pickleball Giveaway Community",
    icon: <Gift className="w-5 h-5" />,
    type: "official",
    notifications: 3,
    description: "Official community for Pickle+ giveaways and promotions",
    memberCount: 14562,
    isAdminManaged: true
  },
  {
    id: "global-tournaments",
    name: "Global Tournaments Community",
    icon: <Trophy className="w-5 h-5" />,
    type: "official",
    notifications: 1,
    description: "Stay updated on all major pickleball tournaments worldwide",
    memberCount: 14562,
    isAdminManaged: true
  }
];

// User's communities
const USER_COMMUNITIES = [
  {
    id: "seattle-pickleball",
    name: "Seattle Pickleball Club",
    icon: <PickleballIcon />,
    type: "local",
    notifications: 5,
    unread: true,
    isActive: true
  },
  {
    id: "portland-picklers",
    name: "Portland Pickle Smashers",
    icon: <PickleballIcon />,
    type: "local",
    notifications: 0,
    unread: false,
    isActive: false
  },
  {
    id: "norcal-tournament",
    name: "NorCal Tournament Players",
    icon: <PickleballIcon />,
    type: "tournament",
    notifications: 2,
    unread: true,
    isActive: true
  },
  {
    id: "beginners-clinic",
    name: "Beginners Clinic",
    icon: <PickleballIcon />,
    type: "coaching",
    notifications: 0,
    unread: false,
    isActive: false
  }
];

// Recent activity/stories from communities
const COMMUNITY_STORIES = [
  {
    id: 1,
    communityId: "seattle-pickleball",
    communityName: "Seattle Pickleball Club",
    image: "https://images.unsplash.com/photo-1626224583764-f88b501d07dc",
    title: "Weekend Tournament",
    isViewed: false,
    isLive: true
  },
  {
    id: 2,
    communityId: "pickle-giveaway",
    communityName: "Pickleball Giveaway",
    image: "https://images.unsplash.com/photo-1569513611819-6a0c088e8e6c",
    title: "New Paddle Giveaway!",
    isViewed: false,
    isLive: false
  },
  {
    id: 3,
    communityId: "norcal-tournament",
    communityName: "NorCal Tournament",
    image: "https://images.unsplash.com/photo-1626224583764-f88b501d07dc",
    title: "Pro Exhibition Highlights",
    isViewed: true,
    isLive: false
  },
  {
    id: 4,
    communityId: "global-tournaments",
    communityName: "Global Tournaments",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8",
    title: "US Open Registration",
    isViewed: false,
    isLive: false
  },
  {
    id: 5,
    communityId: "portland-picklers",
    communityName: "Portland Pickle Smashers",
    image: "https://images.unsplash.com/photo-1626224583764-f88b501d07dc",
    title: "New Court Location",
    isViewed: true,
    isLive: false
  }
];

// Activity feed data
const COMMUNITY_FEED = [
  {
    id: 1,
    type: "post",
    communityId: "seattle-pickleball",
    communityName: "Seattle Pickleball Club",
    communityImage: "https://randomuser.me/api/portraits/men/32.jpg",
    author: {
      name: "Alex Chen",
      role: "Community Admin",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    content: "Amazing turnout for our weekend tournament! Congratulations to all winners and participants. Check out some highlights from the event.",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1626224583764-f88b501d07dc"
    },
    timeAgo: "2h ago",
    reactions: { likes: 24, comments: 8 },
    hasLiked: false
  },
  {
    id: 2,
    type: "event",
    communityId: "pickle-giveaway",
    communityName: "Pickleball Giveaway Community",
    communityImage: "https://randomuser.me/api/portraits/women/68.jpg",
    author: {
      name: "Pickle+ Team",
      role: "Official",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      isVerified: true
    },
    content: "🎁 NEW GIVEAWAY! Win a premium paddle set from our sponsors. Enter by April 30th.",
    event: {
      title: "Premium Paddle Giveaway",
      date: "Ends Apr 30",
      registered: false
    },
    timeAgo: "3h ago",
    reactions: { likes: 156, comments: 42 },
    hasLiked: true
  },
  {
    id: 3,
    type: "video",
    communityId: "norcal-tournament",
    communityName: "NorCal Tournament Players",
    communityImage: "https://randomuser.me/api/portraits/men/45.jpg",
    author: {
      name: "Coach Williams",
      role: "Pro Coach",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      isVerified: true
    },
    content: "Quick tip: Improving your third shot drop. Watch this 45-second demonstration that can change your game.",
    media: {
      type: "video",
      url: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8",
      duration: "0:45"
    },
    timeAgo: "5h ago",
    reactions: { likes: 87, comments: 12 },
    hasLiked: false
  },
  {
    id: 4,
    type: "announcement",
    communityId: "global-tournaments",
    communityName: "Global Tournaments Community",
    communityImage: "https://randomuser.me/api/portraits/men/92.jpg",
    author: {
      name: "Tournament Director",
      role: "Official",
      image: "https://randomuser.me/api/portraits/men/92.jpg",
      isVerified: true
    },
    content: "🏆 US Open registration is now OPEN! Early bird pricing until May 1st. Don't miss the biggest tournament of the year.",
    timeAgo: "1d ago",
    reactions: { likes: 215, comments: 63 },
    hasLiked: false
  }
];

// Friend data for the right sidebar
const ONLINE_FRIENDS = [
  { id: 1, name: "Sarah Lopez", image: "https://randomuser.me/api/portraits/women/44.jpg", status: "online", rating: 4.2 },
  { id: 2, name: "Mark Johnson", image: "https://randomuser.me/api/portraits/men/32.jpg", status: "playing", rating: 3.8 },
  { id: 3, name: "Aisha Patel", image: "https://randomuser.me/api/portraits/women/33.jpg", status: "online", rating: 4.5 },
  { id: 4, name: "Carlos Rodriguez", image: "https://randomuser.me/api/portraits/men/64.jpg", status: "online", rating: 4.0 },
  { id: 5, name: "Emma Wilson", image: "https://randomuser.me/api/portraits/women/58.jpg", status: "offline", rating: 3.5 }
];

// Upcoming events
const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Weekend Tournament",
    communityId: "seattle-pickleball",
    communityName: "Seattle Pickleball Club",
    date: "Apr 20",
    time: "9:00 AM",
    attendees: 28,
    isRegistered: true
  },
  {
    id: 2,
    title: "Beginners Workshop",
    communityId: "seattle-pickleball",
    communityName: "Seattle Pickleball Club",
    date: "Apr 23",
    time: "6:30 PM",
    attendees: 12,
    isRegistered: false
  },
  {
    id: 3,
    title: "Pro Exhibition Match",
    communityId: "global-tournaments",
    communityName: "Global Tournaments",
    date: "Apr 25",
    time: "7:00 PM",
    attendees: 156,
    isRegistered: false
  }
];

// Component for the Discord-inspired sidebar community icons
const CommunitySidebar = ({ 
  selectedCommunity, 
  setSelectedCommunity,
  setCommunityModalOpen,
  isExpanded,
  setIsExpanded
}: { 
  selectedCommunity: string | null; 
  setSelectedCommunity: (id: string | null) => void;
  setCommunityModalOpen: (open: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}) => {
  return (
    <motion.div 
      className="h-screen flex flex-col border-r bg-background"
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ duration: 0.2 }}
    >
      {/* Home button */}
      <div className="p-3 border-b">
        <Button 
          onClick={() => setSelectedCommunity(null)} 
          variant={selectedCommunity === null ? "default" : "ghost"}
          className={`w-full justify-${isExpanded ? 'start' : 'center'} mb-1`}
        >
          <Home className="h-5 w-5" />
          {isExpanded && <span className="ml-2">Home</span>}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-3 right-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Official communities section */}
      <div className="pt-2 px-2">
        {isExpanded && (
          <div className="flex items-center px-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground">OFFICIAL COMMUNITIES</span>
          </div>
        )}
        
        <div className="space-y-2">
          {OFFICIAL_COMMUNITIES.map((community) => (
            <TooltipProvider key={community.id} delayDuration={500}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    key={community.id}
                    variant={selectedCommunity === community.id ? "default" : "ghost"}
                    className={`w-full relative justify-${isExpanded ? 'start' : 'center'} hover:bg-primary/10`}
                    onClick={() => setSelectedCommunity(community.id)}
                  >
                    <div className="relative">
                      <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-10 h-10">
                        {community.icon}
                      </div>
                      {community.notifications > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {community.notifications}
                        </div>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="ml-3 text-left overflow-hidden">
                        <div className="truncate font-medium text-sm">{community.name}</div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-primary/10 border-none text-primary text-[10px] h-4 px-1 font-normal">
                            Official
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Button>
                </TooltipTrigger>
                {!isExpanded && (
                  <TooltipContent side="right">
                    <div>
                      <p className="font-medium">{community.name}</p>
                      <p className="text-xs text-muted-foreground">Official Pickle+ Community</p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
      
      {/* Separator */}
      <div className="my-2 px-2">
        <div className="border-t border-border"></div>
      </div>
      
      {/* User communities section */}
      <div className="px-2">
        {isExpanded && (
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground">MY COMMUNITIES</span>
          </div>
        )}
        
        <ScrollArea className={`${isExpanded ? 'h-[calc(100vh-300px)]' : 'h-[calc(100vh-200px)]'}`}>
          <div className="space-y-2 pr-2">
            {USER_COMMUNITIES.map((community) => (
              <TooltipProvider key={community.id} delayDuration={500}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      key={community.id}
                      variant={selectedCommunity === community.id ? "default" : "ghost"}
                      className={`w-full relative justify-${isExpanded ? 'start' : 'center'} hover:bg-primary/10`}
                      onClick={() => setSelectedCommunity(community.id)}
                    >
                      <div className="relative">
                        <div className={`flex items-center justify-center bg-muted rounded-full w-10 h-10 ${community.unread ? 'text-primary' : 'text-muted-foreground'}`}>
                          {community.icon}
                        </div>
                        {community.notifications > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {community.notifications}
                          </div>
                        )}
                        {community.isActive && !community.notifications && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center animate-pulse">
                          </div>
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="ml-3 text-left overflow-hidden">
                          <div className={`truncate text-sm ${community.unread ? 'font-semibold' : 'font-medium'}`}>
                            {community.name}
                          </div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-muted/50 border-none text-muted-foreground text-[10px] h-4 px-1 font-normal">
                              {community.type === 'local' ? 'Local Club' : 
                               community.type === 'tournament' ? 'Tournament' : 
                               community.type === 'coaching' ? 'Coaching' : 'Community'}
                            </Badge>
                            {community.isActive && (
                              <div className="flex items-center ml-1.5 text-[10px] text-green-500">
                                <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                Active
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right">
                      <div>
                        <p className="font-medium">{community.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{community.type} Community</p>
                        {community.isActive && (
                          <div className="flex items-center mt-1 text-xs text-green-500">
                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                            Active now
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Add community button */}
      <div className="mt-auto p-3 border-t">
        <Button 
          onClick={() => setCommunityModalOpen(true)}
          variant="outline" 
          className={`w-full justify-${isExpanded ? 'start' : 'center'}`}
        >
          <PlusCircle className="h-4 w-4" />
          {isExpanded && <span className="ml-2">Join Community</span>}
        </Button>
      </div>
    </motion.div>
  );
};

// Stories carousel at the top of the main feed (Instagram-style)
const StoriesRow = ({ stories }: { stories: typeof COMMUNITY_STORIES }) => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);
  
  return (
    <div className="pb-2 pt-1">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 pl-1 scrollbar-none">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center">
            <Dialog open={selectedStory === story.id} onOpenChange={(open) => !open && setSelectedStory(null)}>
              <DialogTrigger asChild>
                <button
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedStory(story.id)}
                >
                  <div className={`relative h-14 w-14 rounded-full p-[2px] ${
                    story.isViewed 
                      ? 'bg-muted' 
                      : story.isLive
                        ? 'bg-gradient-to-tr from-red-500 to-amber-500' 
                        : 'bg-gradient-to-tr from-primary to-primary-foreground/75'
                  }`}>
                    <div className="h-full w-full overflow-hidden rounded-full border-2 border-background">
                      <img 
                        src={story.image} 
                        alt={story.communityName} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                      />
                    </div>
                    {story.isLive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-medium px-1.5 rounded-full">
                        LIVE
                      </div>
                    )}
                  </div>
                  <p className={`mt-1 text-xs text-center truncate max-w-[70px] ${story.isViewed ? 'text-muted-foreground' : 'font-medium'}`}>
                    {story.title}
                  </p>
                </button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-xl p-0 rounded-lg overflow-hidden">
                <div className="relative h-[80vh] bg-black flex flex-col">
                  {/* Story header */}
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2 border border-white">
                        <AvatarImage src={story.image} />
                        <AvatarFallback>{story.communityName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium text-sm">{story.communityName}</p>
                        <p className="text-white/80 text-xs">1h ago</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={() => setSelectedStory(null)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Story content */}
                  <div className="flex-1 flex items-center justify-center">
                    <img 
                      src={story.image} 
                      alt={story.communityName} 
                      className="w-full h-full object-contain" 
                    />
                    
                    {story.isLive && (
                      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white font-medium px-3 py-1 rounded-full flex items-center space-x-2">
                        <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Story interaction */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex justify-between items-center">
                      <div className="relative flex-1">
                        <Input 
                          className="pr-20 bg-white/20 border-white/30 text-white placeholder:text-white/60 rounded-full"
                          placeholder="Send a message..."
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                          <Button size="icon" variant="ghost" className="text-white h-7 w-7">
                            <Smile className="h-5 w-5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-white h-7 w-7">
                            <Send className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-2">
                        <Button size="icon" variant="ghost" className="text-white h-10 w-10 rounded-full">
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white h-10 w-10 rounded-full">
                          <MessageSquare className="h-5 w-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white h-10 w-10 rounded-full">
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
        
        {/* Add your story button */}
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center cursor-pointer group hover:bg-primary/10 transition-colors">
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          <p className="mt-1 text-xs text-center text-muted-foreground max-w-[70px]">
            Add Story
          </p>
        </div>
      </div>
    </div>
  );
};

// Feed post component
const FeedPost = ({ post }: { post: typeof COMMUNITY_FEED[0] }) => {
  const [liked, setLiked] = useState(post.hasLiked);
  const [commentOpen, setCommentOpen] = useState(false);
  const [likes, setLikes] = useState(post.reactions.likes);
  
  const handleLike = () => {
    if (liked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setLiked(!liked);
  };
  
  return (
    <Card className="mb-4 overflow-hidden border-muted/60 hover:border-primary/30 transition-all duration-300">
      {/* Post header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={post.author.image} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-sm">{post.author.name}</span>
              {post.author.isVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 ml-1 text-primary fill-primary/20" />
              )}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>{post.author.role}</span>
              <span className="mx-1.5">•</span>
              <span>{post.timeAgo}</span>
              <span className="mx-1.5">•</span>
              <PickleballIcon className="w-3.5 h-3.5 mx-0.5" />
              <span>{post.communityName}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Post content */}
      <div className="px-3">
        <p className="text-sm mb-3">{post.content}</p>
      </div>
      
      {/* Post media */}
      {post.media && (
        <div className="mb-3 relative">
          <img 
            src={post.media.url} 
            alt="Post media" 
            className="w-full object-cover max-h-[400px]" 
          />
          
          {post.media.type === 'video' && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:bg-primary transition-colors">
                  <Play className="h-8 w-8 ml-1" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {post.media.duration}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Event details */}
      {post.type === 'event' && post.event && (
        <div className="mx-3 mb-3 bg-muted/20 rounded-lg p-3 border border-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mr-3 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{post.event.title}</h4>
                <p className="text-xs text-muted-foreground">{post.event.date}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant={post.event.registered ? "outline" : "default"}
              className={post.event.registered ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" : ""}
            >
              {post.event.registered ? "Registered" : "Register"}
            </Button>
          </div>
        </div>
      )}
      
      {/* Post interactions */}
      <div className="px-3 py-2 border-t border-muted/30 flex items-center justify-between">
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" className={`px-3 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`} onClick={handleLike}>
            <Heart className={`h-4 w-4 mr-1.5 ${liked ? 'fill-red-500' : ''}`} />
            <span>{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="px-3 text-muted-foreground hover:text-foreground" onClick={() => setCommentOpen(!commentOpen)}>
            <MessageSquare className="h-4 w-4 mr-1.5" />
            <span>{post.reactions.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="px-3 text-muted-foreground hover:text-foreground">
            <Share2 className="h-4 w-4 mr-1.5" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="px-3 text-muted-foreground hover:text-foreground">
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Comments section (collapsed) */}
      {commentOpen && (
        <div className="px-3 py-2 border-t border-muted/30">
          <div className="flex items-center mb-3">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
            <div className="relative flex-1">
              <Input 
                className="pr-20 py-1 h-9 text-sm" 
                placeholder="Add a comment..."
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Post</Button>
              </div>
            </div>
          </div>
          
          {/* Sample comments */}
          <div className="space-y-3 mb-1">
            <div className="flex">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" />
                <AvatarFallback>SL</AvatarFallback>
              </Avatar>
              <div>
                <div className="bg-muted/30 rounded-lg px-3 py-2">
                  <div className="font-medium text-xs">Sarah Lopez</div>
                  <p className="text-xs">Great tournament! The final match was incredible.</p>
                </div>
                <div className="flex items-center mt-1 pl-2 text-xs text-muted-foreground">
                  <button className="hover:text-foreground">Like</button>
                  <span className="mx-1.5">•</span>
                  <button className="hover:text-foreground">Reply</button>
                  <span className="mx-1.5">•</span>
                  <span>1h</span>
                </div>
              </div>
            </div>
            
            <div className="flex">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://randomuser.me/api/portraits/men/59.jpg" />
                <AvatarFallback>JK</AvatarFallback>
              </Avatar>
              <div>
                <div className="bg-muted/30 rounded-lg px-3 py-2">
                  <div className="font-medium text-xs">Jordan Kim</div>
                  <p className="text-xs">When's the next one scheduled?</p>
                </div>
                <div className="flex items-center mt-1 pl-2 text-xs text-muted-foreground">
                  <button className="hover:text-foreground">Like</button>
                  <span className="mx-1.5">•</span>
                  <button className="hover:text-foreground">Reply</button>
                  <span className="mx-1.5">•</span>
                  <span>45m</span>
                </div>
              </div>
            </div>
          </div>
          
          {post.reactions.comments > 2 && (
            <Button variant="ghost" size="sm" className="w-full mt-1 text-xs text-muted-foreground">
              View all {post.reactions.comments} comments
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

// Friends sidebar component (right side)
const FriendsSidebar = ({ isExpanded }: { isExpanded: boolean }) => {
  return (
    <div className={`h-screen border-l bg-background w-${isExpanded ? 80 : 0} transition-all duration-300 overflow-hidden`}>
      {isExpanded && (
        <div className="flex flex-col h-full">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-sm flex items-center mb-2">
              <Users className="h-4 w-4 mr-1.5 text-primary" />
              Friends
            </h3>
            <Input 
              className="h-8 text-xs" 
              placeholder="Search friends..." 
              prefix={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
            />
          </div>
          
          {/* Online friends list */}
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                ONLINE - {ONLINE_FRIENDS.filter(f => f.status !== 'offline').length}
              </div>
              
              {ONLINE_FRIENDS.filter(f => f.status !== 'offline').map((friend) => (
                <div 
                  key={friend.id}
                  className="flex items-center px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer group"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={friend.image} />
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                      friend.status === 'playing' ? 'bg-orange-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="text-sm font-medium truncate">{friend.name}</div>
                      <div className="ml-1.5 text-xs bg-primary/10 text-primary px-1 rounded">
                        {friend.rating}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {friend.status === 'playing' ? 'In a match' : 'Online'}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="text-xs font-medium text-muted-foreground px-2 py-1 mt-3">
                OFFLINE - {ONLINE_FRIENDS.filter(f => f.status === 'offline').length}
              </div>
              
              {ONLINE_FRIENDS.filter(f => f.status === 'offline').map((friend) => (
                <div 
                  key={friend.id}
                  className="flex items-center px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer group text-muted-foreground"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 mr-2 opacity-70">
                      <AvatarImage src={friend.image} />
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-muted"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="text-sm font-medium truncate">{friend.name}</div>
                      <div className="ml-1.5 text-xs bg-muted/50 px-1 rounded">
                        {friend.rating}
                      </div>
                    </div>
                    <div className="text-xs">
                      Offline
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Upcoming events section */}
          <div className="border-t p-3">
            <h3 className="font-semibold text-sm flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-1.5 text-primary" />
              Upcoming Events
            </h3>
            
            <div className="space-y-2">
              {UPCOMING_EVENTS.slice(0, 2).map((event) => (
                <div 
                  key={event.id}
                  className="rounded-md border border-muted p-2 hover:border-primary/20 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center mb-1">
                    <div className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center rounded-md mr-2">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.date} • {event.time}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-muted-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {event.attendees} attending
                    </div>
                    <Badge variant={event.isRegistered ? "outline" : "default"} className={`text-[10px] px-1.5 ${event.isRegistered ? 'bg-primary/10 text-primary border-primary/20' : ''}`}>
                      {event.isRegistered ? 'Registered' : 'Register'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View All Events ({UPCOMING_EVENTS.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal for joining or discovering communities
const JoinCommunityModal = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Communities', icon: <Globe className="h-4 w-4" /> },
    { id: 'nearby', name: 'Nearby', icon: <MapPin className="h-4 w-4" /> },
    { id: 'tournament', name: 'Tournaments', icon: <Trophy className="h-4 w-4" /> },
    { id: 'coaching', name: 'Coaching', icon: <Zap className="h-4 w-4" /> }
  ];
  
  // Demo suggested communities
  const suggestedCommunities = [
    {
      id: 'chicago-pickleball',
      name: 'Chicago Pickleball Network',
      description: 'The largest pickleball community in the Chicago area',
      memberCount: 342,
      image: 'https://images.unsplash.com/photo-1626224583764-f88b501d07dc',
      location: 'Chicago, IL',
      distance: '3.2 miles'
    },
    {
      id: 'pro-tournament-players',
      name: 'Pro Tournament Players',
      description: 'For serious competitors looking to improve their tournament performance',
      memberCount: 156,
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8',
      location: 'National',
      isVerified: true
    },
    {
      id: 'beginners-welcome',
      name: 'Beginners Welcome',
      description: 'A supportive community for those new to the sport',
      memberCount: 521,
      image: 'https://images.unsplash.com/photo-1569513611819-6a0c088e8e6c',
      location: 'Online Community'
    }
  ];
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="flex h-[80vh]">
          {/* Categories sidebar */}
          <div className="w-1/3 border-r pt-12">
            <h2 className="px-4 font-semibold mb-2">Discover</h2>
            <div className="space-y-1 px-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon}
                  <span className="ml-2">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Main content */}
          <div className="w-2/3 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-xl mb-4">Join a Community</h2>
              <Input 
                placeholder="Search communities..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
            </div>
            
            <ScrollArea className="flex-1 px-4 py-3">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">SUGGESTED FOR YOU</h3>
              
              <div className="space-y-3">
                {suggestedCommunities.map((community) => (
                  <div 
                    key={community.id}
                    className="rounded-lg border hover:border-primary/30 transition-all hover:-translate-y-0.5 overflow-hidden cursor-pointer"
                  >
                    <div className="h-36 relative bg-muted">
                      <img 
                        src={community.image} 
                        alt={community.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                        <div className="text-white">
                          <div className="flex items-center">
                            <h3 className="font-semibold">{community.name}</h3>
                            {community.isVerified && (
                              <CheckCircle2 className="h-4 w-4 ml-1 text-primary fill-primary/20" />
                            )}
                          </div>
                          <div className="flex items-center text-xs text-white/80 mt-0.5">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{community.location}</span>
                            {community.distance && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{community.distance}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-muted-foreground mb-2">{community.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5 inline mr-1" />
                          {community.memberCount} members
                        </div>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 mb-3">
                <Button variant="outline" className="w-full">
                  View All Communities
                </Button>
              </div>
              
              <div className="text-center py-3">
                <h3 className="font-medium text-base mb-2">Can't find what you're looking for?</h3>
                <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create a Community
                </Button>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main component for the modern community dashboard
const ModernCommunityDashboard: React.FC = () => {
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [friendsSidebarExpanded, setFriendsSidebarExpanded] = useState(true);
  const [communityModalOpen, setCommunityModalOpen] = useState(false);
  const [showCreatePostBar, setShowCreatePostBar] = useState(true);
  const [selectedFeedFilter, setSelectedFeedFilter] = useState<'all' | 'following' | 'trending'>('all');
  
  // Sample effect to simulate loading different community data when selected
  useEffect(() => {
    // This would be replaced with actual data loading for the selected community
    if (selectedCommunity) {
      console.log(`Loading data for community: ${selectedCommunity}`);
    }
  }, [selectedCommunity]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Side community navigation (Discord style) */}
      <CommunitySidebar 
        selectedCommunity={selectedCommunity} 
        setSelectedCommunity={setSelectedCommunity}
        setCommunityModalOpen={setCommunityModalOpen}
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
      />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {/* Top navigation */}
        <div className="bg-background border-b py-2 px-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Only show hamburger on mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <CommunitySidebar 
                  selectedCommunity={selectedCommunity} 
                  setSelectedCommunity={(id) => {
                    setSelectedCommunity(id);
                  }}
                  setCommunityModalOpen={setCommunityModalOpen}
                  isExpanded={true}
                  setIsExpanded={() => {}}
                />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center">
              <h1 className="font-bold text-lg mr-2">
                {selectedCommunity 
                  ? [...OFFICIAL_COMMUNITIES, ...USER_COMMUNITIES].find(c => c.id === selectedCommunity)?.name || 'Community'
                  : 'Home'}
              </h1>
              {selectedCommunity && (
                <Badge variant="outline" className="bg-primary/10 border-none">
                  {[...OFFICIAL_COMMUNITIES, ...USER_COMMUNITIES].find(c => c.id === selectedCommunity)?.type || 'community'}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px]">3</span>
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => setFriendsSidebarExpanded(!friendsSidebarExpanded)}>
              <Users className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
              <AvatarFallback>MJ</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Friends info bar */}
        {selectedCommunity && (
          <div className="bg-muted/30 px-4 py-1.5 text-sm flex items-center justify-between border-b">
            <div className="flex items-center">
              <div className="flex -space-x-1 mr-2">
                <Avatar className="h-5 w-5 border border-background">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <Avatar className="h-5 w-5 border border-background">
                  <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" />
                  <AvatarFallback>SL</AvatarFallback>
                </Avatar>
                <Avatar className="h-5 w-5 border border-background">
                  <AvatarImage src="https://randomuser.me/api/portraits/men/59.jpg" />
                  <AvatarFallback>JK</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">3 friends</span> are members
              </span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>{[...OFFICIAL_COMMUNITIES, ...USER_COMMUNITIES].find(c => c.id === selectedCommunity)?.isActive ? 'Active now' : 'Members online'}</span>
            </div>
          </div>
        )}
        
        {/* Main scrollable content */}
        <ScrollArea className="flex-1">
          <div className="p-4 max-w-3xl mx-auto">
            {/* Create post / status box */}
            {showCreatePostBar && (
              <Card className="mb-5 overflow-hidden border-muted/60">
                <div className="p-3">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div 
                      className="flex-1 bg-muted/30 hover:bg-muted/50 transition-colors rounded-full px-4 py-2 text-muted-foreground cursor-pointer text-sm"
                      onClick={() => setShowCreatePostBar(false)}
                    >
                      What's happening in your pickleball world?
                    </div>
                  </div>
                  
                  <div className="flex mt-3 border-t pt-3 -mx-3 px-3">
                    <Button variant="ghost" size="sm" className="flex-1 flex items-center justify-center space-x-1 rounded-full">
                      <Image className="h-4 w-4" />
                      <span>Photo</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 flex items-center justify-center space-x-1 rounded-full">
                      <Video className="h-4 w-4" />
                      <span>Video</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 flex items-center justify-center space-x-1 rounded-full">
                      <Calendar className="h-4 w-4" />
                      <span>Event</span>
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Create post expanded panel (hidden by default) */}
            {!showCreatePostBar && (
              <Card className="mb-5 overflow-hidden border-muted/60">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Create Post</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setShowCreatePostBar(true)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <Avatar className="h-9 w-9 mr-3">
                      <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">Your Name</div>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Public" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <textarea 
                    className="w-full h-24 p-3 bg-muted/20 border-muted rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="What's happening in your pickleball world?"
                  ></textarea>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Image className="h-4 w-4 mr-1.5" />
                        Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Video className="h-4 w-4 mr-1.5" />
                        Video
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Smile className="h-4 w-4 mr-1.5" />
                        Feeling
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <MapPin className="h-4 w-4 mr-1.5" />
                        Location
                      </Button>
                    </div>
                    <Button>Post</Button>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Stories row (Instagram style) */}
            <StoriesRow stories={COMMUNITY_STORIES} />
            
            {/* Feed filter tabs */}
            <div className="mb-4 flex justify-center">
              <div className="flex space-x-1 bg-muted/30 p-1 rounded-full">
                <Button 
                  variant={selectedFeedFilter === 'all' ? 'default' : 'ghost'} 
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedFeedFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={selectedFeedFilter === 'following' ? 'default' : 'ghost'} 
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedFeedFilter('following')}
                >
                  Following
                </Button>
                <Button 
                  variant={selectedFeedFilter === 'trending' ? 'default' : 'ghost'} 
                  size="sm"
                  className="rounded-full"
                  onClick={() => setSelectedFeedFilter('trending')}
                >
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Trending
                </Button>
              </div>
            </div>
            
            {/* Feed posts */}
            <div className="space-y-2">
              {COMMUNITY_FEED.map((post) => (
                <FeedPost key={post.id} post={post} />
              ))}
              
              <Button variant="outline" className="w-full">
                Load More
              </Button>
            </div>
            
            {/* Court pattern decorations */}
            <div className="absolute top-40 -right-20 opacity-10 pointer-events-none hidden lg:block">
              <CourtPattern />
            </div>
            <div className="absolute top-80 -left-10 opacity-5 pointer-events-none rotate-45 hidden lg:block">
              <CourtPattern />
            </div>
          </div>
        </ScrollArea>
      </div>
      
      {/* Friends and events sidebar (right side) */}
      <FriendsSidebar isExpanded={friendsSidebarExpanded} />
      
      {/* Join/Discover Community Modal */}
      <JoinCommunityModal open={communityModalOpen} setOpen={setCommunityModalOpen} />
    </div>
  );
};

export default ModernCommunityDashboard;