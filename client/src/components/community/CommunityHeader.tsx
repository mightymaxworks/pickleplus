/**
 * PKL-278651-COMM-0014-HEAD
 * Enhanced Community Header Component
 * 
 * This component displays the header section of a community detail page,
 * including the community name, description, statistics, and quick action buttons.
 * 
 * Enhancements:
 * - Added Creator badge for community creators
 * - Improved navigation with back button to communities listing
 * - Fixed display logic for join/leave actions based on membership status
 * - Enhanced mobile responsiveness
 */

import React from "react";
import { useLocation } from "wouter";
import { Community, CommunityMemberRole } from "@/types/community";
import { useCommunityContext } from "@/lib/providers/CommunityProvider";
import { useJoinCommunity, useLeaveCommunity } from "@/lib/hooks/useCommunity";
import { useAuth } from "@/lib/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  MapPin, 
  Trophy, 
  Settings, 
  MoreHorizontal, 
  Bell, 
  BellOff,
  LogOut,
  Shield,
  Crown,
  Lock,
  Share2,
  Flag,
  Edit,
  ChevronDown,
  ChevronLeft,
  Star,
  Info,
  Image
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistance } from "date-fns";

interface CommunityHeaderProps {
  community: Community;
  userRole?: CommunityMemberRole | null;
  activeMemberCount?: number;
  isAdmin?: boolean;
  isModerator?: boolean;
  onTabChange?: (value: string) => void;
  currentTab?: string;
}

export function CommunityHeader({
  community,
  userRole = null,
  activeMemberCount,
  isAdmin = false,
  isModerator = false,
  onTabChange,
  currentTab = "about"
}: CommunityHeaderProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { joinCommunity, leaveCommunity } = useCommunityContext();
  
  // Determine user's relationship with community
  const isMember = community.isMember || userRole !== null;
  
  // NOTE: Force showing the manage button if user is creator, regardless of role
  const isCreator = user?.id === community.creatorId;
  // Force hasManagePermissions to true if user is creator
  const hasManagePermissions = isAdmin || isModerator || 
                              userRole === CommunityMemberRole.ADMIN || 
                              userRole === CommunityMemberRole.MODERATOR || 
                              isCreator;
  
  console.log("Is creator calculated:", isCreator, "Current user ID:", user?.id, "Creator ID:", community.creatorId, "hasManagePermissions:", hasManagePermissions);
  
  // Format dates
  const formattedCreatedAt = community.createdAt 
    ? format(new Date(community.createdAt), 'MMMM yyyy')
    : 'Unknown';
  
  // Format statistics
  const memberCountDisplay = community.isDefault ? "Announcement Group" : community.memberCount.toLocaleString();
  const eventCountDisplay = community.eventCount.toLocaleString(); 
  const postCountDisplay = community.postCount.toLocaleString();
  
  // Content section ref for scrolling
  const contentSectionRef = React.useRef<HTMLDivElement>(null);
  
  // Handle navigation
  const handleBackToList = () => {
    setLocation('/communities');
  };
  
  // Handle tab changes with scroll
  const handleTabChange = (value: string) => {
    // Call the parent's onTabChange if provided
    onTabChange?.(value);
    
    // Scroll to content section after a short delay to allow content to update
    setTimeout(() => {
      if (contentSectionRef.current) {
        contentSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }, 100);
  };
  
  // Handle join/leave
  const handleJoin = () => {
    joinCommunity(community.id);
  };
  
  const handleLeave = () => {
    // Prevent leaving default communities
    if (community.isDefault) {
      alert("You cannot leave official groups as they're automatically joined by all users.");
      return;
    }
    
    if (confirm("Are you sure you want to leave this community?")) {
      leaveCommunity(community.id);
    }
  };
  
  // Role badge component
  const RoleBadge = () => {
    if (isCreator) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Star className="h-3.5 w-3.5 mr-1" />
          Creator
        </Badge>
      );
    }
    
    if (!userRole) return null;
    
    switch (userRole) {
      case CommunityMemberRole.ADMIN:
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
            <Crown className="h-3.5 w-3.5 mr-1" />
            Admin
          </Badge>
        );
      case CommunityMemberRole.MODERATOR:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Shield className="h-3.5 w-3.5 mr-1" />
            Moderator
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
            <Users className="h-3.5 w-3.5 mr-1" />
            Member
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackToList}
        className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Communities
      </Button>
      
      {/* Hero section - enhanced with theme colors and patterns */}
      <div 
        className="relative rounded-xl p-4 sm:p-6 text-white overflow-hidden"
        style={{
          background: community.bannerUrl 
            ? "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.3))" 
            : `linear-gradient(to right, ${
                community.themeColor 
                  ? `${community.themeColor}E6, ${community.themeColor}B3` // 90% and 70% opacity
                  : community.accentColor 
                    ? `${community.accentColor}E6, ${community.themeColor || '#4F46E5'}B3`
                    : "var(--primary)E6, var(--primary)B3"
              })`
        }}>
        {/* Banner Image (if available) */}
        {community.bannerUrl && (
          <div className="absolute inset-0 z-0">
            <img 
              src={community.bannerUrl}
              alt={`${community.name} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        )}
        
        {/* Pattern Overlay - enhanced with banner pattern support */}
        <div className="absolute inset-0 opacity-20 bg-repeat">
          {community.bannerPattern === 'dots' ? (
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{color: 'white'}}>
              <pattern id="communityDotsPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 0h20v20H0z" fill="none" />
                <circle cx="5" cy="5" r="1" fill="currentColor" />
                <circle cx="15" cy="5" r="1" fill="currentColor" />
                <circle cx="5" cy="15" r="1" fill="currentColor" />
                <circle cx="15" cy="15" r="1" fill="currentColor" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#communityDotsPattern)" />
            </svg>
          ) : community.bannerPattern === 'diagonal' ? (
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{color: 'white'}}>
              <pattern id="communityDiagonalPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 0h20v20H0z" fill="none" />
                <path d="M0 20L20 0" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#communityDiagonalPattern)" />
            </svg>
          ) : community.bannerPattern === 'waves' ? (
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{color: 'white'}}>
              <pattern id="communityWavesPattern" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 0h40v20H0z" fill="none" />
                <path d="M0 10C5 5, 15 15, 20 10C25 5, 35 15, 40 10" stroke="currentColor" strokeWidth="0.5" fill="none" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#communityWavesPattern)" />
            </svg>
          ) : (
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{color: 'white'}}>
              <pattern id="communityGridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 0h20v20H0z" fill="none" />
                <path d="M10 0v20M0 10h20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#communityGridPattern)" />
            </svg>
          )}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            {/* Enhanced Avatar with improved styling */}
            <div className="relative">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-4 border-white/20 shadow-lg flex-shrink-0 ring-4 ring-offset-2 ring-offset-transparent ring-white/10">
                <AvatarImage 
                  src={community.avatarUrl || undefined} 
                  alt={community.name}
                  className="object-cover"
                />
                <AvatarFallback 
                  className="text-xl sm:text-2xl md:text-3xl font-medium"
                  style={{
                    backgroundColor: community.themeColor || community.accentColor || '#4F46E5',
                    color: 'white'
                  }}
                >
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {community.isDefault && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-md">
                  <Shield className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{community.name}</h1>
              
              {/* Location and Skill level - condensed for mobile */}
              <div className="flex flex-wrap items-center text-xs sm:text-sm gap-2 sm:gap-3 text-white/90 mt-1">
                {community.location && (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{community.location}</span>
                  </div>
                )}
                
                {community.skillLevel && (
                  <div className="flex items-center">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{community.skillLevel}</span>
                  </div>
                )}
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                {community.isDefault && (
                  <Badge variant="outline" className="border-orange-400 text-orange-100 bg-orange-500/20 text-xs py-0 px-1.5 h-5">
                    <Megaphone className="h-3 w-3 mr-1" />
                    Official
                  </Badge>
                )}
                
                {community.isPrivate && !community.isDefault && (
                  <Badge variant="outline" className="border-white/40 text-white text-xs py-0 px-1.5 h-5">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
                
                {community.requiresApproval && (
                  <Badge variant="outline" className="border-white/40 text-white text-xs py-0 px-1.5 h-5">
                    <Shield className="h-3 w-3 mr-1" />
                    Approval
                  </Badge>
                )}
                
                {/* Role badge */}
                {isCreator ? (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-xs py-0 px-1.5 h-5">
                    <Star className="h-3 w-3 mr-1" />
                    Creator
                  </Badge>
                ) : (
                  isMember && <RoleBadge />
                )}
              </div>
            </div>
            
            {/* PKL-278651-COMM-0035-PROF - Enhanced Action Buttons Implementation - Sprint 1.5 */}
            <div className="flex gap-2 flex-shrink-0">
              {/* Primary Action Button */}
              {hasManagePermissions ? (
                /* Primary Manage Button for admins/mods/creators */
                <Button 
                  size="sm" 
                  className="bg-white hover:bg-white/90 text-primary h-8 font-medium"
                  onClick={() => handleTabChange("manage")}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Manage</span>
                </Button>
              ) : isMember ? (
                community.isDefault ? (
                  /* Member Status Button for default communities - not clickable */
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white h-8 cursor-default"
                    disabled
                  >
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Member</span>
                  </Button>
                ) : (
                  /* Primary Leave Button for members with confirmation dropdown */
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-8"
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Leave</span>
                        <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLeave} className="text-red-600 focus:text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave Community
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              ) : (
                /* Primary Join Button for non-members */
                <Button 
                  size="sm" 
                  className="bg-white hover:bg-white/90 text-primary h-8 font-medium"
                  onClick={handleJoin}
                >
                  <Users className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Join</span>
                </Button>
              )}
              
              {/* Secondary Action Button - always show regardless of role */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-8"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Community Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Share option - available to everyone */}
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  
                  {/* Member-specific options */}
                  {isMember && (
                    <>
                      <DropdownMenuItem>
                        <Bell className="h-4 w-4 mr-2" />
                        Notification Settings
                      </DropdownMenuItem>
                      {!community.isDefault && (
                        <DropdownMenuItem onClick={handleLeave} className="text-red-600 focus:text-red-600">
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave Community
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  
                  {/* Admin/Moderator options */}
                  {hasManagePermissions && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTabChange("manage")}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Community
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Options for everyone */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Report Community
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Description and Founded date */}
          <div className="space-y-2 mb-3">
            {/* Founded date */}
            <div className="flex items-center text-xs sm:text-sm text-white/80">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>Founded {formattedCreatedAt}</span>
            </div>
            
            {/* Description - simplified for mobile */}
            {community.description && (
              <p className="text-xs sm:text-sm md:text-base text-white/90 line-clamp-2 sm:line-clamp-none">
                {community.description}
              </p>
            )}
          </div>
          
          {/* Tags - horizontal scroll on mobile */}
          {community.tags && (
            <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3 overflow-x-auto pb-1 -mx-1 px-1">
              {community.tags.split(',').map((tag) => (
                <Badge 
                  key={tag}
                  variant="outline" 
                  className="bg-white/10 border-white/25 backdrop-blur-sm text-xs py-0 px-1.5 h-5 whitespace-nowrap flex-shrink-0"
                >
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
          
          {/* No duplicate join button needed anymore - the top button is sufficient */}
        </div>
      </div>
      
      {/* Stats cards - optimized for mobile with a more compact horizontal layout */}
      <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4 -mx-4 sm:mx-0 px-4 sm:px-0">
        <Card className="flex-shrink-0 w-28 sm:w-full mr-2 sm:mr-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                {!community.isDefault ? (
                  <>
                    <p className="text-lg sm:text-2xl font-bold">{memberCountDisplay}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Members</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg sm:text-2xl font-bold">Private</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Official Group</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-shrink-0 w-28 sm:w-full mr-2 sm:mr-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg sm:text-2xl font-bold">{eventCountDisplay}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-shrink-0 w-28 sm:w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-lg sm:text-2xl font-bold">{postCountDisplay}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Navigation tabs with improved visuals - Sprint 1.3 */}
      <div className="border-b">
        <Tabs
          defaultValue={currentTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          {/* Using ScrollArea for smoother horizontal scrolling on all devices */}
          <ScrollArea className="w-full" data-orientation="horizontal">
            <div className="pb-px">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 flex-nowrap inline-flex min-w-max">
                <TabsTrigger
                  value="about"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none py-3 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0 transition-all whitespace-nowrap"
                  title="About"
                >
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">About</span>
                </TabsTrigger>
                
                <TabsTrigger
                  value="events"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none py-3 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0 transition-all whitespace-nowrap"
                  title="Events"
                >
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                
                <TabsTrigger
                  value="members"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none py-3 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0 transition-all whitespace-nowrap"
                  title="Members"
                >
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Members</span>
                </TabsTrigger>
                
                <TabsTrigger
                  value="posts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none py-3 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0 transition-all whitespace-nowrap"
                  title="Posts"
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Posts</span>
                </TabsTrigger>
                
                <TabsTrigger
                  value="engagement"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none py-3 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0 transition-all whitespace-nowrap"
                  title="Engagement"
                >
                  <Star className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Engagement</span>
                </TabsTrigger>
                
                {/* PKL-278651-COMM-0036-MEDIA - Media Management Tab */}
                <TabsTrigger
                  value="media"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none py-3 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0 transition-all whitespace-nowrap"
                  title="Media"
                >
                  <Image className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Media</span>
                </TabsTrigger>
                
                {hasManagePermissions && (
                  <TabsTrigger
                    value="manage"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none py-3 px-3 sm:px-4 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto bg-primary/5 transition-all whitespace-nowrap"
                    title="Manage Community"
                  >
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Manage</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
      
      {/* Content area reference for scrolling */}
      <div ref={contentSectionRef} className="h-2" />
    </div>
  );
}