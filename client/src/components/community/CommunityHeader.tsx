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
import { useAuth } from "@/hooks/useAuth";
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
  Info
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
  const isCreator = user?.id === community.createdByUserId;
  // Force hasManagePermissions to true if user is creator
  const hasManagePermissions = isAdmin || isModerator || 
                              userRole === CommunityMemberRole.ADMIN || 
                              userRole === CommunityMemberRole.MODERATOR || 
                              isCreator;
  
  console.log("Is creator calculated:", isCreator, "Current user ID:", user?.id, "Creator ID:", community.createdByUserId, "hasManagePermissions:", hasManagePermissions);
  
  // Format dates
  const formattedCreatedAt = community.createdAt 
    ? format(new Date(community.createdAt), 'MMMM yyyy')
    : 'Unknown';
  
  // Format statistics
  const memberCountDisplay = community.memberCount.toLocaleString();
  const eventCountDisplay = community.eventCount.toLocaleString(); 
  const postCountDisplay = community.postCount.toLocaleString();
  
  // Handle navigation
  const handleBackToList = () => {
    setLocation('/communities');
  };
  
  // Handle join/leave
  const handleJoin = () => {
    joinCommunity(community.id);
  };
  
  const handleLeave = () => {
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
      
      {/* Hero section - optimized for mobile */}
      <div className={cn(
        "relative rounded-xl p-4 sm:p-6 text-white overflow-hidden",
        "bg-gradient-to-r from-primary/90 to-primary/70",
      )}>
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-repeat">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="communityPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 0h20v20H0z" fill="none" />
              <path d="M10 0v20M0 10h20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#communityPattern)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            {/* Avatar and Title */}
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-4 border-white/20 shadow-lg flex-shrink-0">
              <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
              <AvatarFallback className="text-xl sm:text-2xl md:text-3xl font-medium">
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
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
                {community.isPrivate && (
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
            
            {/* Action buttons - moved to top right for mobile */}
            <div className="flex gap-2 flex-shrink-0">
              {hasManagePermissions ? (
                /* Admin/Creator Menu Button */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-white hover:bg-white/90 text-primary font-medium h-8 flex items-center gap-1"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      <span>Manage</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Management Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onTabChange && onTabChange("manage")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Community Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Members
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Manage Events
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Community
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* Regular User Menu Button */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Community Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isMember ? (
                      <>
                        <DropdownMenuItem>
                          <Bell className="h-4 w-4 mr-2" />
                          Notifications
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="h-4 w-4 mr-2" />
                          Report Community
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleLeave}
                          className="text-destructive focus:text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Leave Community
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={handleJoin}>
                        <Users className="h-4 w-4 mr-2" />
                        Join Community
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
          
          {/* Join button for non-members - moved to bottom */}
          {!isMember && !isCreator && (
            <Button 
              size="sm"
              variant="secondary" 
              onClick={handleJoin}
              className="bg-white hover:bg-white/90 text-primary mt-2"
            >
              Join Community
            </Button>
          )}
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
                <p className="text-lg sm:text-2xl font-bold">{memberCountDisplay}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Members</p>
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
      
      {/* Navigation tabs - optimized for mobile */}
      <div className="border-b overflow-x-auto">
        <Tabs
          defaultValue={currentTab}
          onValueChange={onTabChange}
          className="w-full"
        >
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 flex-nowrap">
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm flex-shrink-0"
            >
              <Info className="h-3.5 w-3.5 sm:hidden mr-1" />
              About
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm flex-shrink-0"
            >
              <Calendar className="h-3.5 w-3.5 sm:hidden mr-1" />
              Events
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm flex-shrink-0"
            >
              <Users className="h-3.5 w-3.5 sm:hidden mr-1" />
              Members
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm flex-shrink-0"
            >
              <MessageSquare className="h-3.5 w-3.5 sm:hidden mr-1" />
              Posts
            </TabsTrigger>
            {hasManagePermissions && (
              <TabsTrigger
                value="manage"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-2 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm flex-shrink-0 bg-primary/10 text-primary"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                <span>Manage</span>
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}