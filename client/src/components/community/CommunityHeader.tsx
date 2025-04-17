/**
 * PKL-278651-COMM-0014-UI
 * Community Header Component
 * 
 * This component displays the header section of a community detail page,
 * including the community name, description, statistics, and quick action buttons.
 */

import React from "react";
import { Community, CommunityMemberRole } from "@/types/community";
import { useCommunityContext } from "@/lib/providers/CommunityProvider";
import { useJoinCommunity, useLeaveCommunity } from "@/lib/hooks/useCommunity";
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
  Edit
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
  const { joinCommunity, leaveCommunity } = useCommunityContext();
  
  // Determine user's relationship with community
  const isMember = community.isMember || userRole !== null;
  const hasManagePermissions = isAdmin || isModerator || userRole === CommunityMemberRole.ADMIN || userRole === CommunityMemberRole.MODERATOR;
  
  // Format dates
  const formattedCreatedAt = community.createdAt 
    ? format(new Date(community.createdAt), 'MMMM yyyy')
    : 'Unknown';
  
  // Format statistics
  const memberCountDisplay = community.memberCount.toLocaleString();
  const eventCountDisplay = community.eventCount.toLocaleString(); 
  const postCountDisplay = community.postCount.toLocaleString();
  
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
      {/* Hero section */}
      <div className={cn(
        "relative rounded-xl p-6 text-white overflow-hidden",
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
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <Avatar className="h-24 w-24 border-4 border-white/20 shadow-lg">
            <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
            <AvatarFallback className="text-3xl font-medium">
              {community.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {/* Title and badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{community.name}</h1>
              
              {community.isPrivate && (
                <Badge variant="outline" className="border-white/40 text-white">
                  <Lock className="h-3.5 w-3.5 mr-1" />
                  Private
                </Badge>
              )}
              
              {community.requiresApproval && (
                <Badge variant="outline" className="border-white/40 text-white">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  Approval Required
                </Badge>
              )}
              
              {isMember && <RoleBadge />}
            </div>
            
            {/* Location and founding date */}
            <div className="flex flex-wrap items-center gap-4 mb-3 text-white/90">
              {community.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  <span>{community.location}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>Founded {formattedCreatedAt}</span>
              </div>
              
              {community.skillLevel && (
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1.5" />
                  <span>{community.skillLevel}</span>
                </div>
              )}
            </div>
            
            {/* Description */}
            {community.description && (
              <p className="mb-4 max-w-3xl text-white/90">
                {community.description}
              </p>
            )}
            
            {/* Tags */}
            {community.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {community.tags.split(',').map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-white/10 border-white/25 backdrop-blur-sm">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-2 md:mt-0 md:self-start">
            {isMember ? (
              <>
                <Button 
                  variant="secondary" 
                  className="bg-white/20 border-white/20 hover:bg-white/30 text-white"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Community Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    
                    {hasManagePermissions && (
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Community
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem>
                      <BellOff className="h-4 w-4 mr-2" />
                      Mute Notifications
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                variant="secondary" 
                onClick={handleJoin}
                className="bg-white hover:bg-white/90 text-primary"
              >
                Join Community
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{memberCountDisplay}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eventCountDisplay}</p>
                <p className="text-sm text-muted-foreground">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{postCountDisplay}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Navigation tabs */}
      <div className="border-b">
        <Tabs
          defaultValue={currentTab}
          onValueChange={onTabChange}
          className="w-full"
        >
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0">
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4"
            >
              Events
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4"
            >
              Members
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4"
            >
              Posts
            </TabsTrigger>
            {hasManagePermissions && (
              <TabsTrigger
                value="manage"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}