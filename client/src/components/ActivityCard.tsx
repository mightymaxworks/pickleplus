import { Card, CardContent } from "@/components/ui/card";
import type { Activity } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  // Define icon and background color based on activity type
  const getActivityStyles = (type: string) => {
    switch (type) {
      case "tournament":
        return {
          icon: "emoji_events",
          bgColor: "bg-[#2196F3] bg-opacity-10",
          iconColor: "text-[#2196F3]"
        };
      case "match":
        return {
          icon: "sports",
          bgColor: "bg-[#FF5722] bg-opacity-10",
          iconColor: "text-[#FF5722]"
        };
      case "achievement":
        return {
          icon: "military_tech",
          bgColor: "bg-[#4CAF50] bg-opacity-10",
          iconColor: "text-[#4CAF50]"
        };
      case "code_redemption":
        return {
          icon: "redeem",
          bgColor: "bg-purple-500 bg-opacity-10",
          iconColor: "text-purple-500"
        };
      default:
        return {
          icon: "bolt",
          bgColor: "bg-gray-500 bg-opacity-10",
          iconColor: "text-gray-500"
        };
    }
  };

  const { icon, bgColor, iconColor } = getActivityStyles(activity.type);
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

  return (
    <Card className="mb-3 pickle-shadow">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center mr-3`}>
            <span className={`material-icons ${iconColor}`}>{icon}</span>
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1).replace('_', ' ')}</h4>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
              <div className="text-right">
                <span className="text-[#4CAF50] font-medium">+{activity.xpEarned} XP</span>
                <p className="text-xs text-gray-500">{timeAgo}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
