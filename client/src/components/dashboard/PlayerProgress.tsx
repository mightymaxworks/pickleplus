import { useEffect, useRef } from "react";
import { User } from "@/lib/types";

interface PlayerProgressProps {
  user: User;
}

const PlayerProgress = ({ user }: PlayerProgressProps) => {
  const circleRef = useRef<SVGCircleElement>(null);
  
  // Calculate XP needed for next level (simple formula for demo)
  const xpForNextLevel = user.level * 1000;
  const currentLevelXp = (user.level - 1) * 1000;
  const progressToNextLevel = ((user.xp - currentLevelXp) / (xpForNextLevel - currentLevelXp)) * 100;
  const xpNeeded = xpForNextLevel - user.xp;
  
  // Calculate weekly XP progress (mock data for demo)
  const weeklyGoal = 1000;
  const weeklyProgress = Math.min(750, weeklyGoal);
  const weeklyPercentage = (weeklyProgress / weeklyGoal) * 100;

  useEffect(() => {
    if (circleRef.current) {
      const circle = circleRef.current;
      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = circumference - (progressToNextLevel / 100) * circumference;
    }
  }, [progressToNextLevel]);

  return (
    <div className="bg-white rounded-md shadow-sm p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Player Progress</h3>
        <div className="text-sm bg-primary bg-opacity-10 text-primary rounded-full px-3 py-1">Level {user.level}</div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative mb-4 flex items-center justify-center">
          <svg className="progress-ring" width="180" height="180">
            <circle 
              className="progress-ring-circle" 
              stroke="#E0E0E0" 
              fill="transparent" 
              r="75" 
              cx="90" 
              cy="90" 
            />
            <circle 
              ref={circleRef}
              className="progress-ring-circle" 
              stroke="#FF5722" 
              fill="transparent" 
              r="75" 
              cx="90" 
              cy="90" 
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-900">{Math.round(progressToNextLevel)}%</div>
            <div className="text-sm text-gray-500">to Level {user.level + 1}</div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-900">{user.xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</div>
          <div className="text-sm text-gray-500 mt-1">Earn {xpNeeded.toLocaleString()} more XP to level up</div>
        </div>
        
        <div className="mt-6 w-full">
          <div className="text-sm font-medium text-gray-900 mb-2">Weekly XP Goals</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${weeklyPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0</span>
            <span>{weeklyProgress} XP / {weeklyGoal} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProgress;
