import { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { FoundingMemberBadge } from "@/components/ui/founding-member-badge";
import { XpMultiplierIndicator } from "@/components/ui/xp-multiplier-indicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Target, Zap, Users, Star } from "lucide-react";
import { cva } from "class-variance-authority";

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
    .toUpperCase() || 'P+';

  // Gold border for founding members - dynamic class based on founding member status
  const avatarBorderClass = user.isFoundingMember 
    ? "ring-2 ring-[#FFD700] ring-offset-2 ring-offset-background" 
    : "ring-2 ring-primary/20 ring-offset-2 ring-offset-background";

  // Using badges for various player attributes
  const ratingTierBadge = rating ? (
    <Badge variant="secondary" className="flex items-center gap-1 px-2">
      <Star className={statIconVariants({ variant: "rating" })} />
      Rating: {rating}
    </Badge>
  ) : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          Player Passport
          {user.isFoundingMember && (
            <FoundingMemberBadge size="sm" showText={false} className="ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center gap-4">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold">
                {user.displayName}
              </h3>
              <p className="text-sm text-muted-foreground">
                ID: {user.playerId || `PKL-${user.id?.toString().padStart(4, '0')}`}
              </p>
            </div>
            
            {user.xpMultiplier && (
              <XpMultiplierIndicator 
                multiplier={user.xpMultiplier} 
                size="sm" 
                showLabel={true}
                showTooltip={true} 
              />
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {ratingTierBadge}
            
            <Badge variant="outline" className="flex items-center gap-1 px-2">
              <Trophy className={statIconVariants({ variant: "level" })} />
              Level {user.level || 1}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1 px-2">
              <Zap className={statIconVariants({ variant: "xp" })} />
              {user.xp?.toLocaleString() || 0} XP
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1 px-2">
              <Users className={statIconVariants({ variant: "matches" })} />
              {user.totalMatches || 0} Matches
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1 px-2">
              <Target className={statIconVariants({ variant: "tournaments" })} />
              {user.totalTournaments || 0} Tournaments
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}