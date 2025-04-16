/**
 * PKL-278651-COMM-0006-HUB-UI
 * Community Card Component
 * 
 * This component displays a card showing community information.
 */

import React from "react";
import { Link } from "wouter";
import { Community } from "@shared/schema/community";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users, Calendar, Lock, Shield } from "lucide-react";
import { useCommunityContext } from "@lib/providers/CommunityProvider";

interface CommunityCardProps {
  community: Community;
  compact?: boolean;
  showActions?: boolean;
  isMember?: boolean;
}

export function CommunityCard({
  community,
  compact = false,
  showActions = true,
  isMember = false,
}: CommunityCardProps) {
  const { joinCommunity, leaveCommunity, isJoining, isLeaving } = useCommunityContext();
  
  // Get first letter of community name for the avatar fallback
  const avatarFallback = community.name.charAt(0).toUpperCase();
  
  // Handle joining a community
  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    joinCommunity(community.id);
  };
  
  // Handle leaving a community
  const handleLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    leaveCommunity(community.id);
  };
  
  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <Link href={`/communities/${community.id}`} className="block h-full">
        <CardHeader className={compact ? "p-4" : "p-6"}>
          <div className="flex items-center gap-4">
            <Avatar className={compact ? "h-10 w-10" : "h-16 w-16"}>
              <AvatarImage src={community.avatarUrl || undefined} alt={community.name} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className={`truncate ${compact ? "text-lg" : "text-xl"}`}>
                  {community.name}
                </CardTitle>
                
                {community.isPrivate && (
                  <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                
                {community.requiresApproval && (
                  <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              
              {!compact && (
                <CardDescription className="line-clamp-2">
                  {community.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
          <div className="flex flex-wrap gap-2 mb-4">
            {community.location && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{community.location}</span>
              </Badge>
            )}
            
            {community.skillLevel && (
              <Badge variant="outline" className="flex items-center gap-1">
                <span>{community.skillLevel}</span>
              </Badge>
            )}
            
            {community.tags && 
              community.tags.split(',').map((tag) => (
                <Badge key={tag} variant="secondary" className="max-w-[150px] truncate">
                  {tag.trim()}
                </Badge>
              ))
            }
          </div>
          
          {!compact && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{community.memberCount} members</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{community.eventCount} events</span>
              </div>
            </div>
          )}
        </CardContent>
        
        {showActions && (
          <CardFooter className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
            {isMember ? (
              <Button 
                variant="outline" 
                size={compact ? "sm" : "default"}
                disabled={isLeaving}
                onClick={handleLeave}
                className="ml-auto"
              >
                {isLeaving ? "Leaving..." : "Leave"}
              </Button>
            ) : (
              <Button 
                variant="default" 
                size={compact ? "sm" : "default"}
                disabled={isJoining}
                onClick={handleJoin}
                className="ml-auto"
              >
                {isJoining ? "Joining..." : "Join"}
              </Button>
            )}
          </CardFooter>
        )}
      </Link>
    </Card>
  );
}