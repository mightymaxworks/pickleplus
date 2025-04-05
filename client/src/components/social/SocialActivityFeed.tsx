import { useLocation } from "wouter";
import { UserPlus, Users, Medal, Calendar, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export type SocialActivityType = 
  | "connection_request" 
  | "connection_accepted" 
  | "match_played" 
  | "tournament_joined" 
  | "achievement_unlocked";

interface SocialActivity {
  id: number;
  type: SocialActivityType;
  createdAt: string;
  actors: {
    id: number;
    displayName: string;
    username: string;
    avatarInitials: string;
  }[];
  contextData?: {
    matchId?: number;
    matchType?: string;
    tournamentId?: number;
    tournamentName?: string;
    achievementId?: number;
    achievementName?: string;
  };
}

interface SocialActivityFeedProps {
  activities?: SocialActivity[];
  isLoading?: boolean;
}

export function SocialActivityFeed({ activities, isLoading = false }: SocialActivityFeedProps) {
  const [, setLocation] = useLocation();
  
  // Get icon based on activity type
  const getActivityIcon = (type: SocialActivityType) => {
    switch (type) {
      case "connection_request":
      case "connection_accepted":
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      case "match_played":
        return <Users className="h-5 w-5 text-green-500" />;
      case "tournament_joined":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case "achievement_unlocked":
        return <Medal className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get activity message based on type
  const getActivityMessage = (activity: SocialActivity) => {
    const actorNames = activity.actors.map(a => a.displayName).join(", ");
    
    switch (activity.type) {
      case "connection_request":
        return `${actorNames} sent you a connection request`;
      case "connection_accepted":
        return `${actorNames} accepted your connection request`;
      case "match_played":
        return `You played a ${activity.contextData?.matchType} match with ${actorNames}`;
      case "tournament_joined":
        return `${actorNames} joined the ${activity.contextData?.tournamentName} tournament`;
      case "achievement_unlocked":
        return `${actorNames} unlocked ${activity.contextData?.achievementName} achievement`;
      default:
        return "New activity";
    }
  };
  
  // Get activity time
  const getActivityTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 mb-6 pickle-shadow">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-0">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-4/5 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg p-4 mb-6 pickle-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold font-product-sans">Social Feed</h3>
        <span 
          className="text-[#2196F3] text-sm cursor-pointer"
          onClick={() => setLocation("/connections")}
        >
          View All
        </span>
      </div>
      
      {!activities || activities.length === 0 ? (
        <div className="text-center py-4">
          <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No social activity yet</p>
        </div>
      ) : (
        activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start space-x-3 mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-0"
          >
            <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="text-sm">{getActivityMessage(activity)}</p>
              <p className="text-xs text-gray-500 mt-1">{getActivityTime(activity.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}