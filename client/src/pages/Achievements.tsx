import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { achievementApi } from "@/lib/apiClient";
import { AchievementBadge } from "@/components/AchievementBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Achievement, UserAchievementWithDetails } from "@/types";

export default function Achievements() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("unlocked");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLocation("/login");
    }
  }, [isAuthenticated, user, setLocation]);
  
  // Fetch all achievements
  const { 
    data: allAchievements,
    isLoading: allAchievementsLoading 
  } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    enabled: isAuthenticated,
  });
  
  // Fetch user achievements
  const { 
    data: userAchievements,
    isLoading: userAchievementsLoading 
  } = useQuery<UserAchievementWithDetails[]>({
    queryKey: ["/api/user/achievements"],
    enabled: isAuthenticated,
  });
  
  const isLoading = allAchievementsLoading || userAchievementsLoading;
  
  // Filter achievements by category
  const getAchievementsByCategory = (achievements: Achievement[], category: string) => {
    return achievements.filter(achievement => achievement.category === category);
  };
  
  // Get locked achievements
  const getLockedAchievements = () => {
    if (!allAchievements || !userAchievements) return [];
    
    return allAchievements.filter(achievement => 
      !userAchievements.some(ua => ua.achievement.id === achievement.id)
    );
  };
  
  // Get unlocked achievements
  const getUnlockedAchievements = () => {
    if (!userAchievements) return [];
    
    return userAchievements.map(ua => ua.achievement);
  };
  
  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();
  
  // Group achievements by category
  const categories = ["skill", "tournament", "social", "matches"];
  const categoryLabels: Record<string, string> = {
    skill: "Skill Achievements",
    tournament: "Tournament Achievements",
    social: "Social Achievements",
    matches: "Match Achievements"
  };

  return (
    <div className="achievements-view pb-20 md:pb-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2 font-product-sans">Achievements</h2>
        <p className="text-gray-500">Unlock badges by completing challenges and milestones</p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="unlocked">Unlocked ({unlockedAchievements.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({lockedAchievements.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="unlocked" className="pt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Skeleton className="h-20 w-20 rounded-full mb-2" />
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : unlockedAchievements.length > 0 ? (
            <>
              {categories.map(category => {
                const categoryAchievements = getAchievementsByCategory(unlockedAchievements, category);
                if (categoryAchievements.length === 0) return null;
                
                return (
                  <div key={category} className="mb-6">
                    <h3 className="font-bold mb-3 font-product-sans">{categoryLabels[category]}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {categoryAchievements.map(achievement => (
                        <AchievementBadge 
                          key={achievement.id} 
                          achievement={achievement} 
                          unlocked={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-gray-300 mb-2">emoji_events</span>
              <h3 className="font-bold mb-1">No Achievements Yet</h3>
              <p className="text-sm text-gray-500">
                Play matches and participate in tournaments to unlock achievements
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="locked" className="pt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Skeleton className="h-20 w-20 rounded-full mb-2" />
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : lockedAchievements.length > 0 ? (
            <>
              {categories.map(category => {
                const categoryAchievements = getAchievementsByCategory(lockedAchievements, category);
                if (categoryAchievements.length === 0) return null;
                
                return (
                  <div key={category} className="mb-6">
                    <h3 className="font-bold mb-3 font-product-sans">{categoryLabels[category]}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {categoryAchievements.map(achievement => (
                        <AchievementBadge 
                          key={achievement.id} 
                          achievement={achievement} 
                          unlocked={false}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-12">
              <span className="material-icons text-6xl text-gray-300 mb-2">check_circle</span>
              <h3 className="font-bold mb-1">All Achievements Unlocked!</h3>
              <p className="text-sm text-gray-500">
                Impressive! You've completed all available achievements
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
