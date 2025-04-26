import { useState } from "react";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronUp, Info, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { calculateLevelFromXP, getXpRequiredForLevel } from "@/lib/calculateLevel";

interface XPProgressCardProps {
  user: User;
}

export default function XPProgressCard({ user }: XPProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate XP progress using the correct level calculation
  const currentXP = user.xp || 0;
  // Use the correct level based on XP amount, not the stored level value
  const currentLevel = calculateLevelFromXP(currentXP);
  
  console.debug(`[XP Debug] XP=${currentXP}, Calculated Level=${currentLevel}, Stored Level=${user.level}`);
  
  // Get the current and next level thresholds
  const previousLevelThreshold = getXpRequiredForLevel(currentLevel);
  const nextLevelThreshold = getXpRequiredForLevel(currentLevel + 1);
  
  const xpForCurrentLevel = currentXP - previousLevelThreshold;
  const xpNeededForNextLevel = nextLevelThreshold - previousLevelThreshold;
  const progressPercentage = Math.min(99, Math.floor((xpForCurrentLevel / xpNeededForNextLevel) * 100));
  
  // Query XP history
  const { data: xpHistory, isLoading: isXpLoading } = useQuery({
    queryKey: ["/api/xp/transactions", { userId: user.id, limit: 5 }],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/xp/transactions?userId=${user.id}&limit=5`);
        if (!res.ok) throw new Error("Failed to fetch XP history");
        return await res.json();
      } catch (error) {
        console.error("Error fetching XP history:", error);
        return [];
      }
    },
    enabled: isExpanded, // Only fetch when expanded
  });
  
  // Calculate next reward at level milestone
  const nextRewardLevel = Math.ceil(currentLevel / 5) * 5; // Next multiple of 5
  const isFoundingMember = user.isFoundingMember;
  
  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'border-primary/20' : ''}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center">
          <Award className="mr-2 h-5 w-5 text-primary" />
          XP Progress
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Current Level Display */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full ${isFoundingMember ? 'bg-gradient-to-r from-[#FF5722] to-[#FFD700]' : 'bg-primary'} flex items-center justify-center text-white font-bold`}>
                {currentLevel}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-700">Level {currentLevel}</div>
                <div className="text-xs text-gray-500">
                  {isFoundingMember && (
                    <span className="text-yellow-600 flex items-center">
                      <Star size={12} className="mr-1" /> 10% XP Bonus Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-primary">{xpForCurrentLevel.toLocaleString()} / {xpNeededForNextLevel.toLocaleString()} XP</div>
              <div className="text-xs text-gray-500">{progressPercentage}% to Level {currentLevel + 1}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <Progress value={progressPercentage} className="h-2" indicatorClassName={isFoundingMember ? 'bg-gradient-to-r from-[#FF5722] to-[#FFD700]' : undefined} />
          
          {/* Next Reward Preview */}
          <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                <Award size={16} />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">Next Reward at Level {nextRewardLevel}</div>
                <div className="text-xs text-gray-500">Unlock premium avatar frames</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {nextRewardLevel - currentLevel} levels to go
            </div>
          </div>
          
          {/* Expanded Content - XP History */}
          {isExpanded && (
            <div className="mt-4 border-t pt-4 border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Recent XP Activity</h4>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  View All
                </Button>
              </div>
              
              {isXpLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <div className="text-xs text-gray-500 mt-2">Loading XP history...</div>
                </div>
              ) : xpHistory && xpHistory.length > 0 ? (
                <div className="space-y-2">
                  {xpHistory.map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getSourceColor(transaction.source)}`}>
                          {getSourceIcon(transaction.source)}
                        </div>
                        <div className="ml-2">
                          <div className="text-xs font-medium">{transaction.source}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600">+{transaction.amount} XP</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-xs text-gray-500">No recent XP activity</div>
                  <div className="text-xs text-gray-400 mt-1">Play matches to earn XP!</div>
                </div>
              )}
              
              {/* XP Explanation */}
              <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs">
                <div className="flex items-start">
                  <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-2 text-blue-700">
                    <p className="font-medium">How XP Works:</p>
                    <ul className="mt-1 list-disc pl-4 space-y-1">
                      <li>Earn XP from matches, tournaments, and achievements</li>
                      <li>Daily match bonus: First 2 matches earn 25 XP each</li>
                      <li>Tournament multipliers: Club (1.5x) to International (3.0x)</li>
                      {isFoundingMember && (
                        <li className="text-yellow-700">Founding Member: +10% XP on all activities</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for styling XP sources
function getSourceColor(source: string): string {
  const sourceMap: Record<string, string> = {
    "match": "bg-green-500",
    "tournament": "bg-blue-500",
    "achievement": "bg-purple-500",
    "daily_bonus": "bg-yellow-500",
    "redemption": "bg-orange-500",
    "admin": "bg-gray-500"
  };
  
  // Check for partial matches
  for (const [key, value] of Object.entries(sourceMap)) {
    if (source.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return "bg-gray-400"; // Default color
}

function getSourceIcon(source: string): React.ReactNode {
  const sourceMap: Record<string, React.ReactNode> = {
    "match": <span>M</span>,
    "tournament": <span>T</span>,
    "achievement": <span>A</span>,
    "daily_bonus": <span>D</span>,
    "redemption": <span>R</span>,
    "admin": <span>S</span>
  };
  
  // Check for partial matches
  for (const [key, value] of Object.entries(sourceMap)) {
    if (source.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return <span>•</span>; // Default icon
}