/**
 * PKL-278651-COMM-0014-UI
 * Community Card Component
 * 
 * This component displays a community card with basic information about the community,
 * including name, location, member count, and visual elements.
 */

import React from "react";
import { Link } from "wouter";
import { Community } from "@/types/community";
import { useCommunityContext } from "@/lib/providers/CommunityProvider";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Users, 
  Calendar, 
  Star, 
  Trophy, 
  ChevronRight,
  Lock,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

// Pickleball SVG Icon for community cards
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

interface CommunityCardProps {
  community: Community;
  compact?: boolean;
  showActions?: boolean;
}

export function CommunityCard({ 
  community, 
  compact = false,
  showActions = true
}: CommunityCardProps) {
  const { viewCommunity, joinCommunity, leaveCommunity, isJoining } = useCommunityContext();
  
  // Generate background gradient based on community id
  const bgGradients = [
    "bg-gradient-to-br from-blue-500 to-green-400",
    "bg-gradient-to-br from-purple-500 to-pink-400",
    "bg-gradient-to-br from-amber-500 to-orange-400",
    "bg-gradient-to-br from-teal-500 to-emerald-400",
    "bg-gradient-to-br from-indigo-500 to-sky-400",
    "bg-gradient-to-br from-rose-500 to-red-400"
  ];
  
  const gradientClass = bgGradients[community.id % bgGradients.length];
  const isFeatured = community.featuredTag;
  
  // Handle view community
  const handleViewCommunity = () => {
    viewCommunity(community.id);
  };
  
  // Handle join community
  const handleJoinCommunity = (e: React.MouseEvent) => {
    e.stopPropagation();
    joinCommunity(community.id);
  };

  // Compact list view
  if (compact) {
    return (
      <Card 
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleViewCommunity}
      >
        <div className="flex items-center p-4">
          {community.bannerUrl ? (
            <div className="h-12 w-12 mr-4 relative rounded-full overflow-hidden border border-muted">
              <img
                src={community.bannerUrl}
                alt={`${community.name} banner`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30"></div>
              <Avatar className="h-6 w-6 absolute bottom-0 right-0 border-2 border-white">
                <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
                <AvatarFallback className={`${gradientClass} text-white text-xs`}>
                  {community.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
              <AvatarFallback className={`${gradientClass} text-white`}>
                {community.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h3 className="text-base font-semibold truncate">{community.name}</h3>
              
              {community.isPrivate && (
                <Lock className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
              )}
              
              {isFeatured && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 py-0 h-5 px-1.5 text-xs"
                >
                  {community.featuredTag}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              {community.location && (
                <div className="flex items-center mr-3">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span className="truncate">{community.location}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1" />
                <span>{community.memberCount} members</span>
              </div>
            </div>
          </div>
          
          {!community.isMember && showActions && (
            <Button 
              variant="outline" 
              size="sm"
              className="ml-2 shrink-0"
              onClick={handleJoinCommunity}
              disabled={isJoining}
            >
              Join
            </Button>
          )}
          
          {!showActions && (
            <ChevronRight className="h-5 w-5 text-muted-foreground ml-2" />
          )}
        </div>
      </Card>
    );
  }

  // Standard grid view
  return (
    <Card 
      className="group overflow-hidden rounded-xl border-muted/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
      onClick={handleViewCommunity}
    >
      {/* Card Header with Banner Image or Gradient Background */}
      <div className={`relative h-48 ${!community.bannerUrl ? gradientClass : ''}`}>
        {/* Banner Image (if available) */}
        {community.bannerUrl && (
          <div className="absolute inset-0 z-0">
            <img 
              src={community.bannerUrl}
              alt={`${community.name} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-[300px] h-[300px] rotate-[20deg]">
              <CourtPatternIcon />
            </div>
          </div>
        </div>
        
        {/* Featured tag */}
        {isFeatured && (
          <div className="absolute top-3 right-3 z-10">
            <Badge 
              className={cn(
                "px-3 py-1.5 rounded-full font-medium shadow-md",
                community.featuredTag === 'Featured' ? 'bg-yellow-400 text-yellow-950' : 
                community.featuredTag === 'Elite' ? 'bg-purple-400 text-purple-950' : 
                'bg-blue-400 text-blue-950'
              )}
            >
              {community.featuredTag === 'Featured' ? (
                <><Trophy className="h-3.5 w-3.5 mr-1.5" /> {community.featuredTag}</>
              ) : community.featuredTag === 'Elite' ? (
                <><Star className="h-3.5 w-3.5 mr-1.5" /> {community.featuredTag}</>
              ) : (
                <>{community.featuredTag}</>
              )}
            </Badge>
          </div>
        )}
        
        {/* Logo and Name Container */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
          <div className="mb-1">
            {community.skillLevel && (
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm mb-2">
                <PickleballIcon />
                <span className="ml-1.5 font-medium">{community.skillLevel}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-white group-hover:text-white/90 mb-1.5 drop-shadow-md">
            {community.name}
            {community.isPrivate && (
              <Lock className="h-4 w-4 inline-block ml-2" />
            )}
          </h3>
          
          {community.location && (
            <div className="flex items-center text-white/90 text-sm drop-shadow-md">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              {community.location}
            </div>
          )}
        </div>
      </div>
      
      {/* Card Content */}
      <CardContent className="pt-5 pb-3">
        {/* Stats row */}
        <div className="flex gap-4 mb-3">
          <div className="flex items-center">
            <div className="bg-primary/10 rounded-full p-1.5 mr-2 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{community.memberCount}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-primary/10 rounded-full p-1.5 mr-2 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium">{community.eventCount}</div>
              <div className="text-xs text-muted-foreground">Events</div>
            </div>
          </div>
        </div>
        
        {/* Description - truncated */}
        {community.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {community.description}
          </p>
        )}
        
        {/* Tags */}
        {community.tags && (
          <div className="flex flex-wrap gap-1 mb-2">
            {community.tags.split(',').map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="bg-muted/50 hover:bg-muted text-xs py-0 px-1.5"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Card Footer with Actions */}
      {showActions && (
        <CardFooter className="pt-0 flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="text-xs"
          >
            <Link href={`/communities/${community.id}`}>
              <span className="flex items-center">
                View
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </span>
            </Link>
          </Button>
          
          {!community.isMember ? (
            <Button 
              variant="default" 
              size="sm"
              className="text-xs"
              onClick={(e) => handleJoinCommunity(e)}
              disabled={isJoining}
            >
              {community.requiresApproval ? (
                <span className="flex items-center">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  Request to Join
                </span>
              ) : (
                "Join Community"
              )}
            </Button>
          ) : (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Member
            </Badge>
          )}
        </CardFooter>
      )}
    </Card>
  );
}