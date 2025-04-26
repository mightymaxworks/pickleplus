/**
 * PKL-278651-PROF-0024-COMP - Achievements Gallery
 * 
 * A gallery view of earned badges and achievements with progress tracking.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Award, 
  Star, 
  Lock, 
  Calendar, 
  ChevronRight, 
  LucideIcon,
  SwordIcon,
  Zap,
  Dumbbell,
  Brain,
  Target,
  Medal,
  BookOpen,
  Users,
  HandHelping
} from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { formatDate } from "@/lib/stringUtils";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface AchievementsGalleryProps {
  user: EnhancedUser;
  className?: string;
}

// Achievement categories
type AchievementCategory = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'special';

// Achievement type definition
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  acquired: boolean;
  acquiredDate?: string;
  progress?: number;
  maxProgress?: number;
  icon: keyof typeof iconMap;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

// Icon map
const iconMap = {
  trophy: Trophy,
  award: Award,
  star: Star,
  sword: SwordIcon,
  zap: Zap,
  dumbbell: Dumbbell,
  brain: Brain,
  target: Target,
  medal: Medal,
  book: BookOpen,
  users: Users,
  help: HandHelping
};

export default function AchievementsGallery({
  user,
  className = ""
}: AchievementsGalleryProps) {
  // State for category filter
  const [category, setCategory] = useState<AchievementCategory>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Get achievements data
  const { 
    data: achievements = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/achievements', user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/achievements?userId=${user.id}`);
      return response.json();
    }
  });
  
  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    if (category === 'all') return achievements;
    return achievements.filter((a: Achievement) => a.category === category);
  }, [achievements, category]);
  
  // Group achievements by acquired status
  const groupedAchievements = useMemo(() => {
    const acquired = filteredAchievements.filter((a: Achievement) => a.acquired);
    const inProgress = filteredAchievements.filter((a: Achievement) => !a.acquired && a.progress !== undefined && a.progress > 0);
    const locked = filteredAchievements.filter((a: Achievement) => !a.acquired && (!a.progress || a.progress === 0));
    
    return { acquired, inProgress, locked };
  }, [filteredAchievements]);
  
  // Calculate achievement statistics
  const stats = useMemo(() => {
    const total = achievements.length;
    const acquired = achievements.filter((a: Achievement) => a.acquired).length;
    const completionPercentage = total > 0 ? Math.round((acquired / total) * 100) : 0;
    const totalXpEarned = achievements
      .filter((a: Achievement) => a.acquired)
      .reduce((sum, a) => sum + a.xpReward, 0);
    
    return { total, acquired, completionPercentage, totalXpEarned };
  }, [achievements]);
  
  // Get color class based on rarity
  const getRarityColorClass = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
      case 'uncommon': return 'bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'rare': return 'bg-blue-200 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'epic': return 'bg-purple-200 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'legendary': return 'bg-amber-200 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300';
      default: return '';
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Achievements Gallery</CardTitle>
            <CardDescription>Your earned badges and accomplishments</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">Achievement Progress</div>
              <div className="text-sm font-medium">{stats.acquired}/{stats.total}</div>
            </div>
            <Progress value={stats.completionPercentage} className="h-2" />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">{stats.completionPercentage}% Complete</span>
              <span className="text-xs font-medium">{stats.totalXpEarned} XP Earned</span>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{groupedAchievements.acquired.length}</div>
              <div className="text-xs text-muted-foreground">Achievements Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{groupedAchievements.inProgress.length}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
          </div>
        </div>
        
        {/* Category Filter */}
        <Tabs 
          defaultValue="all" 
          value={category}
          onValueChange={(value) => setCategory(value as AchievementCategory)}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-auto thin-scrollbar mb-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>
          
          <TabsContent value={category} forceMount>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading achievements...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-destructive">Error loading achievements</p>
                <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No achievements found in this category</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Earned Achievements */}
                {groupedAchievements.acquired.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                      Earned Achievements
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupedAchievements.acquired.map((achievement: Achievement, index) => {
                        const IconComponent = iconMap[achievement.icon] || Trophy;
                        return (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            onClick={() => setSelectedAchievement(achievement)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col items-center p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors">
                              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-primary/10 mb-2">
                                <IconComponent className="h-6 w-6 text-primary" />
                              </div>
                              <Badge className={`${getRarityColorClass(achievement.rarity)} mb-1`}>
                                {achievement.rarity}
                              </Badge>
                              <div className="text-sm font-medium text-center truncate w-full">
                                {achievement.name}
                              </div>
                              <div className="text-xs text-muted-foreground text-center mt-1">
                                Earned {formatDate(achievement.acquiredDate || '', 'short')}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* In Progress Achievements */}
                {groupedAchievements.inProgress.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-blue-500" />
                      In Progress
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupedAchievements.inProgress.map((achievement: Achievement, index) => {
                        const IconComponent = iconMap[achievement.icon] || Trophy;
                        const progressPercentage = achievement.maxProgress ? 
                          Math.min(100, Math.round((achievement.progress || 0) / achievement.maxProgress * 100)) : 0;
                        
                        return (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            onClick={() => setSelectedAchievement(achievement)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors gap-3">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10 flex-shrink-0">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="text-sm font-medium truncate">
                                    {achievement.name}
                                  </div>
                                  <Badge className={`${getRarityColorClass(achievement.rarity)} ml-1`}>
                                    {achievement.rarity}
                                  </Badge>
                                </div>
                                <div className="mt-1">
                                  <Progress value={progressPercentage} className="h-1.5" />
                                </div>
                                <div className="flex justify-between mt-1 text-xs">
                                  <span className="text-muted-foreground">
                                    {achievement.progress}/{achievement.maxProgress}
                                  </span>
                                  <span>{progressPercentage}%</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Locked Achievements */}
                {groupedAchievements.locked.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Locked Achievements
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupedAchievements.locked.map((achievement: Achievement, index) => {
                        const IconComponent = iconMap[achievement.icon] || Trophy;
                        return (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            onClick={() => setSelectedAchievement(achievement)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/30 border border-muted hover:border-muted-foreground/50 transition-colors">
                              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-muted mb-2 opacity-70">
                                <IconComponent className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <Badge className="mb-1 bg-muted text-muted-foreground opacity-70">
                                {achievement.rarity}
                              </Badge>
                              <div className="text-sm font-medium text-center text-muted-foreground truncate w-full opacity-70">
                                {achievement.name}
                              </div>
                              <div className="text-xs text-muted-foreground/70 text-center mt-1">
                                Locked
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Achievement Detail Dialog */}
        {selectedAchievement && (
          <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedAchievement.name}
                  {selectedAchievement.acquired && (
                    <Badge className={getRarityColorClass(selectedAchievement.rarity)}>
                      {selectedAchievement.rarity}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="pt-2">
                  {selectedAchievement.acquired ? (
                    <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                      <Trophy className="h-4 w-4 mr-1.5" />
                      Earned {formatDate(selectedAchievement.acquiredDate || '', 'medium')}
                    </div>
                  ) : selectedAchievement.progress ? (
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                      <Zap className="h-4 w-4 mr-1.5" />
                      In Progress
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground font-medium">
                      <Lock className="h-4 w-4 mr-1.5" />
                      Locked
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col items-center py-4">
                <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-4 ${
                  selectedAchievement.acquired ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {(() => {
                    const IconComponent = iconMap[selectedAchievement.icon] || Trophy;
                    return <IconComponent className={`h-12 w-12 ${
                      selectedAchievement.acquired ? 'text-primary' : 'text-muted-foreground'
                    }`} />;
                  })()}
                </div>
                
                <p className="text-center text-sm">
                  {selectedAchievement.description}
                </p>
                
                {selectedAchievement.progress !== undefined && selectedAchievement.maxProgress && !selectedAchievement.acquired && (
                  <div className="w-full mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {selectedAchievement.progress}/{selectedAchievement.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={Math.round((selectedAchievement.progress / selectedAchievement.maxProgress) * 100)} 
                      className="h-2 mt-1" 
                    />
                  </div>
                )}
                
                <div className="mt-4 text-sm flex items-center">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1.5" />
                  <span className="text-muted-foreground">Reward:</span>
                  <span className="font-medium ml-1">{selectedAchievement.xpReward} XP</span>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <span>View All Achievements</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}