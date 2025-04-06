import { useLocation } from "wouter";
import { Activity } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { 
  Trophy, 
  Medal, 
  User, 
  Clock, 
  Calendar, 
  Award,
  TrendingUp,
  Zap,
  CheckCircle
} from "lucide-react";

interface ActivityFeedProps {
  activities?: Activity[];
  isLoading?: boolean;
  limit?: number;
}

export function ActivityFeed({ activities, isLoading = false, limit = 5 }: ActivityFeedProps) {
  const [, setLocation] = useLocation();
  
  // Function to get icon based on activity type
  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case "match_win":
        return <Trophy className="h-5 w-5 text-green-500" />;
      case "match_played":
        return <User className="h-5 w-5 text-blue-500" />;
      case "tournament_registration":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case "tournament_check_in":
        return <CheckCircle className="h-5 w-5 text-cyan-500" />;
      case "tournament_placement":
        return <Medal className="h-5 w-5 text-amber-500" />;
      case "achievement_earned":
        return <Award className="h-5 w-5 text-yellow-500" />;
      case "level_up":
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case "xp_gain":
        return <Zap className="h-5 w-5 text-indigo-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Display time since activity
  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex space-x-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Display 'no activities' state if array is empty
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-medium mb-1">No activity yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Play matches, enter tournaments, or earn achievements to build your activity history.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <span 
            className="text-sm text-primary cursor-pointer hover:underline"
            onClick={() => setLocation("/profile")}
          >
            View All
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.slice(0, limit).map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-0 last:pb-0">
            <div className="bg-muted rounded-full p-2 flex-shrink-0">
              {getActivityIcon(activity)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {activity.description}
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {getTimeAgo(activity.timestamp)}
                </span>
                
                {activity.xpEarned > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="flex items-center text-xs font-medium"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    +{activity.xpEarned} XP
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}