import { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { FoundingMemberBadge } from "@/components/ui/founding-member-badge";
import { XpMultiplierIndicator } from "@/components/ui/xp-multiplier-indicator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Zap, Users, Star, MapPin, QrCode } from "lucide-react";
import { cva } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

const statIconVariants = cva("w-4 h-4 mr-1", {
  variants: {
    variant: {
      rating: "text-yellow-500",
      matches: "text-green-500",
      xp: "text-blue-500",
      tournaments: "text-purple-500",
      level: "text-orange-500"
    }
  },
  defaultVariants: {
    variant: "level"
  }
});

interface PlayerCardProps {
  user: User;
  rating?: number;
  className?: string;
}

export function PlayerCard({ user, rating, className = "" }: PlayerCardProps) {
  const { isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  if (isLoading || !user) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold opacity-0">Loading...</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate initials for avatar fallback
  const initials = user.displayName
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || user.avatarInitials || 'P+';

  // Gold border and gradient for founding members
  const avatarBorderClass = user.isFoundingMember 
    ? "ring-2 ring-[#FFD700] ring-offset-2 ring-offset-background" 
    : "ring-2 ring-primary/20 ring-offset-2 ring-offset-background";
  
  // Calculate XP progress
  const xpPerLevel = 1000;
  const currentXP = user.xp || 0;
  const currentLevel = user.level || 1;
  const levelProgress = Math.min(100, ((currentXP % xpPerLevel) / xpPerLevel) * 100);
  const xpToNextLevel = xpPerLevel - (currentXP % xpPerLevel);

  // Using badges for various player attributes
  const ratingTierBadge = rating ? (
    <div className="flex items-center gap-1 text-lg font-bold text-yellow-500">
      <Star className="h-5 w-5" fill="currentColor" />
      <span>{rating}</span>
    </div>
  ) : null;

  return (
    <Card className={`${className} overflow-hidden`}>
      <div className={`w-full h-2 ${user.isFoundingMember ? "bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600" : "bg-primary"}`}></div>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            Digital Passport
            {user.isFoundingMember && (
              <FoundingMemberBadge size="sm" showText={false} className="ml-2" />
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-primary"
            onClick={() => setLocation("/profile")}
          >
            <QrCode className="h-4 w-4 mr-1" />
            View QR
          </Button>
        </div>
        <CardDescription className="flex items-center text-xs">
          <MapPin className="h-3 w-3 mr-1 inline" /> 
          {user.location || "No location set"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="flex items-center gap-5 mb-4">
          <Avatar className={`w-20 h-20 ${avatarBorderClass}`}>
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.displayName || ""} />
            ) : (
              <AvatarFallback 
                className={user.isFoundingMember ? "bg-gradient-to-br from-yellow-300 to-yellow-600 text-white" : undefined}
              >
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-1 mb-1.5">
              <div>
                <h3 className="text-xl font-bold">
                  {user.displayName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  ID: {user.passportId || `P+${user.id?.toString().padStart(4, '0')}`}
                </p>
              </div>
              
              {/* Rating display */}
              {ratingTierBadge}
            </div>
            
            {/* XP Level Progress */}
            <div className="mb-2.5">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Level {currentLevel}</span>
                <span className="text-muted-foreground text-xs">{xpToNextLevel} XP to Level {currentLevel + 1}</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
            
            {/* Multiplier indicator */}
            {user.xpMultiplier && user.xpMultiplier > 100 && (
              <div className="flex justify-end">
                <XpMultiplierIndicator 
                  multiplier={user.xpMultiplier} 
                  size="sm" 
                  showLabel={true}
                  showTooltip={true} 
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Player Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-muted/40 px-3 py-2 rounded-lg">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Zap className="h-3.5 w-3.5 mr-1 text-blue-500" />
              XP Points
            </div>
            <div className="text-lg font-bold">
              {user.xp?.toLocaleString() || 0}
            </div>
          </div>
          
          <div className="bg-muted/40 px-3 py-2 rounded-lg">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Trophy className="h-3.5 w-3.5 mr-1 text-amber-500" />
              Rank Pts
            </div>
            <div className="text-lg font-bold">
              {user.rankingPoints?.toLocaleString() || 0}
            </div>
          </div>
          
          <div className="bg-muted/40 px-3 py-2 rounded-lg">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5 mr-1 text-green-500" />
              Matches
            </div>
            <div className="text-lg font-bold">
              {user.totalMatches || 0}
            </div>
          </div>
          
          <div className="bg-muted/40 px-3 py-2 rounded-lg">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <Target className="h-3.5 w-3.5 mr-1 text-purple-500" />
              Tournaments
            </div>
            <div className="text-lg font-bold">
              {user.totalTournaments || 0}
            </div>
          </div>
        </div>
        
        {/* Player play style attributes */}
        {(user.preferredPosition || user.playingStyle || user.paddleBrand) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {user.preferredPosition && (
              <Badge variant="outline" className="text-xs px-2">
                {user.preferredPosition.charAt(0).toUpperCase() + user.preferredPosition.slice(1)}
              </Badge>
            )}
            {user.playingStyle && (
              <Badge variant="outline" className="text-xs px-2">
                {user.playingStyle.charAt(0).toUpperCase() + user.playingStyle.slice(1)} Player
              </Badge>
            )}
            {user.paddleBrand && (
              <Badge variant="outline" className="text-xs px-2">
                {user.paddleBrand.charAt(0).toUpperCase() + user.paddleBrand.slice(1)}
                {user.paddleModel ? ` ${user.paddleModel}` : ''}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}