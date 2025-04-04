import type { Achievement } from "@/types";

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
}

export function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  const getBadgeBackgroundColor = (category: string) => {
    switch (category) {
      case "skill":
        return "bg-[#FF5722] bg-opacity-10";
      case "tournament":
        return "bg-[#2196F3] bg-opacity-10";
      case "social":
        return "bg-[#4CAF50] bg-opacity-10";
      case "matches":
        return "bg-purple-500 bg-opacity-10";
      default:
        return "bg-gray-200";
    }
  };

  const getBadgeIcon = (imageUrl?: string) => {
    if (imageUrl) {
      // Use a default SVG if we don't have an actual image path
      return (
        <svg viewBox="0 0 24 24" className="w-12 h-12">
          <path 
            fill={achievement.category === "skill" ? "#FF5722" : 
                 achievement.category === "tournament" ? "#2196F3" :
                 achievement.category === "social" ? "#4CAF50" : "purple"}
            d="M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.55,1.92,4.63,4.39,4.94c0.63,1.5,1.98,2.63,3.61,2.96V19H7v2h10v-2h-4v-3.1 c1.63-0.33,2.98-1.46,3.61-2.96C19.08,12.63,21,10.55,21,8V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.82C5.84,10.4,5,9.3,5,8z M12,14 c-1.65,0-3-1.35-3-3V5h6v6C15,12.65,13.65,14,12,14z M19,8c0,1.3-0.84,2.4-2,2.82V7h2V8z"
          />
        </svg>
      );
    }
    
    return (
      <span className="material-icons text-4xl">
        {achievement.category === "skill" ? "emoji_events" : 
         achievement.category === "tournament" ? "workspace_premium" :
         achievement.category === "social" ? "people" : "sports"}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`badge mb-2 pickle-shadow ${getBadgeBackgroundColor(achievement.category)} ${unlocked ? "" : "locked"}`}
      >
        {getBadgeIcon(achievement.imageUrl)}
      </div>
      <h4 className="text-sm font-medium text-center">{achievement.name}</h4>
      <p className="text-xs text-gray-500 text-center">{achievement.description}</p>
    </div>
  );
}
