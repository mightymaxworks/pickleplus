import { Progress } from "@/components/ui/progress";

interface LevelProgressProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
}

export function LevelProgress({ level, currentXP, nextLevelXP }: LevelProgressProps) {
  // Calculate XP percentage and XP needed for next level
  const xpPerLevel = 1000;
  const xpInCurrentLevel = currentXP % xpPerLevel;
  const xpProgressPercentage = (xpInCurrentLevel / xpPerLevel) * 100;
  const xpNeeded = nextLevelXP - currentXP;

  return (
    <div className="bg-white rounded-lg p-4 mb-6 pickle-shadow">
      <h3 className="font-bold mb-3 font-product-sans">Level Progress</h3>
      <div className="flex items-center mb-2">
        <div className="w-12 h-12 rounded-full bg-[#FF5722] text-white flex items-center justify-center font-bold text-xl mr-3">
          {level}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">{currentXP} / {nextLevelXP} XP</span>
            <span className="text-sm text-gray-500">{xpProgressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={xpProgressPercentage} className="h-2" />
        </div>
      </div>
      <p className="text-sm text-gray-500">{xpNeeded} XP until Level {level + 1}</p>
    </div>
  );
}
