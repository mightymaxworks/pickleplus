import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronUp, Trophy, Medal, Star, Clock, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface AchievementsShowcaseProps {
  userId: number;
}

export default function AchievementsShowcase({ userId }: AchievementsShowcaseProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [, navigate] = useLocation();
  
  // Query user achievements
  const { data: achievements, isLoading } = useQuery({
    queryKey: ["/api/user/achievements", { userId }],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/user/achievements?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch achievements");
        return await res.json();
      } catch (error) {
        console.error("Error fetching achievements:", error);
        return { unlocked: [], inProgress: [] };
      }
    },
  });
  
  const navigateToAchievements = () => {
    navigate("/achievements");
  };
  
  // Get achievement icon based on category
  const getAchievementIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'match':
        return <Medal size={16} />;
      case 'tournament':
        return <Trophy size={16} />;
      case 'special':
        return <Star size={16} />;
      case 'time':
        return <Clock size={16} />;
      default:
        return <Check size={16} />;
    }
  };
  
  return (
    <Card className={`transition-all duration-300 ${isExpanded ? 'border-purple-200' : ''}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-purple-500" />
          Achievements
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
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <div className="text-sm text-gray-500 mt-2">Loading achievements...</div>
          </div>
        ) : achievements ? (
          <div className="space-y-4">
            {/* Achievement Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {achievements.unlocked?.length || 0}
                </div>
                <div className="text-xs text-gray-600">Unlocked</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {achievements.inProgress?.length || 0}
                </div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {((achievements.unlocked?.length || 0) / (achievements.total || 1) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
            </div>
            
            {/* Recent Achievements */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Recent Achievements</h4>
              
              {achievements.unlocked && achievements.unlocked.length > 0 ? (
                <div className="space-y-2">
                  {achievements.unlocked.slice(0, isExpanded ? 3 : 2).map((achievement: any, index: number) => (
                    <div key={index} className="bg-white border border-purple-100 rounded-lg p-3 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                        {getAchievementIcon(achievement.category)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.name}</div>
                        <div className="text-xs text-gray-500">{achievement.description}</div>
                      </div>
                      {achievement.xpReward > 0 && (
                        <div className="text-xs font-medium text-green-600">
                          +{achievement.xpReward} XP
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">No achievements unlocked yet</div>
                </div>
              )}
            </div>
            
            {/* Achievement In Progress */}
            {isExpanded && achievements.inProgress && achievements.inProgress.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">In Progress</h4>
                
                <div className="space-y-2">
                  {achievements.inProgress.slice(0, 2).map((achievement: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-2">
                          {getAchievementIcon(achievement.category)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.name}</div>
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          {achievement.progress || 0}/{achievement.target || 100}
                        </div>
                      </div>
                      
                      <Progress value={(achievement.progress / achievement.target) * 100} className="h-1.5" />
                      
                      <div className="text-xs text-gray-500 mt-2">
                        {achievement.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={navigateToAchievements}
                className="w-full text-sm"
              >
                View All Achievements
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <h3 className="text-base font-medium text-gray-700">No Achievements</h3>
            <p className="text-sm text-gray-500 mt-1">Play matches to earn achievements</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}