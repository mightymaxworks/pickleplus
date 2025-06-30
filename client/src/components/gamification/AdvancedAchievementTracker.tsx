import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  TrendingUp, 
  Award,
  Calendar,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';

interface AchievementProgress {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'tactical' | 'social' | 'consistency' | 'milestone' | 'community';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  dependency?: string[];
  estimatedTimeToComplete: number; // in days
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  rewardPoints: number;
  rewardPicklePoints: number;
  unlockConditions: string[];
  completedDate?: Date;
  streakRequired?: number;
  currentStreak?: number;
}

interface AchievementChain {
  id: string;
  name: string;
  description: string;
  achievements: AchievementProgress[];
  totalProgress: number;
  chainReward: {
    points: number;
    picklePoints: number;
    specialBadge?: string;
  };
}

interface AdvancedAchievementTrackerProps {
  userId: number;
  onAchievementClick?: (achievement: AchievementProgress) => void;
  onViewHistory?: () => void;
  onClose?: () => void;
}

export default function AdvancedAchievementTracker({
  userId,
  onAchievementClick,
  onViewHistory,
  onClose
}: AdvancedAchievementTrackerProps) {
  const [activeTab, setActiveTab] = useState<'progress' | 'chains' | 'analytics'>('progress');
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [achievementChains, setAchievementChains] = useState<AchievementChain[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - replace with real API calls
  useEffect(() => {
    const mockAchievements: AchievementProgress[] = [
      {
        id: 'serve_master',
        name: 'Serve Master',
        description: 'Complete 100 successful serves in matches',
        category: 'technical',
        tier: 'gold',
        currentProgress: 67,
        targetProgress: 100,
        isCompleted: false,
        difficultyLevel: 3,
        rewardPoints: 500,
        rewardPicklePoints: 100,
        estimatedTimeToComplete: 12,
        unlockConditions: ['Complete basic serving drill'],
        streakRequired: 5,
        currentStreak: 3
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Play matches with 20 different players',
        category: 'social',
        tier: 'silver',
        currentProgress: 14,
        targetProgress: 20,
        isCompleted: false,
        difficultyLevel: 2,
        rewardPoints: 300,
        rewardPicklePoints: 75,
        estimatedTimeToComplete: 8,
        unlockConditions: ['Join community'],
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Play every day for 7 consecutive days',
        category: 'consistency',
        tier: 'bronze',
        currentProgress: 4,
        targetProgress: 7,
        isCompleted: false,
        difficultyLevel: 2,
        rewardPoints: 200,
        rewardPicklePoints: 50,
        estimatedTimeToComplete: 3,
        unlockConditions: [],
        streakRequired: 7,
        currentStreak: 4
      }
    ];

    const mockChains: AchievementChain[] = [
      {
        id: 'serve_progression',
        name: 'Serving Excellence',
        description: 'Master the art of serving through progressive challenges',
        achievements: mockAchievements.filter(a => a.name.includes('Serve')),
        totalProgress: 45,
        chainReward: {
          points: 1000,
          picklePoints: 250,
          specialBadge: 'Ace Specialist'
        }
      }
    ];

    setAchievements(mockAchievements);
    setAchievementChains(mockChains);
    setIsLoading(false);
  }, [userId]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-400 to-amber-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-indigo-400 to-indigo-600';
      case 'legendary': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-300 to-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Target className="w-4 h-4" />;
      case 'tactical': return <BarChart3 className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'consistency': return <Calendar className="w-4 h-4" />;
      case 'milestone': return <Trophy className="w-4 h-4" />;
      case 'community': return <Star className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getDifficultyDisplay = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < level ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const filteredAchievements = achievements.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const categories = [
    { id: 'all', name: 'All', icon: <Award className="w-4 h-4" /> },
    { id: 'technical', name: 'Technical', icon: <Target className="w-4 h-4" /> },
    { id: 'tactical', name: 'Tactical', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'social', name: 'Social', icon: <Users className="w-4 h-4" /> },
    { id: 'consistency', name: 'Consistency', icon: <Calendar className="w-4 h-4" /> },
    { id: 'milestone', name: 'Milestone', icon: <Trophy className="w-4 h-4" /> }
  ];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Advanced Achievement Tracking
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onViewHistory}>
            <Clock className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="chains">Chains</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Achievement List */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onAchievementClick?.(achievement)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center text-white`}>
                          {getCategoryIcon(achievement.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {achievement.name}
                            <Badge variant="outline" className="text-xs">
                              {achievement.tier}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          {getDifficultyDisplay(achievement.difficultyLevel)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {achievement.estimatedTimeToComplete}d
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.currentProgress}/{achievement.targetProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.currentProgress / achievement.targetProgress) * 100} 
                        className="h-2"
                      />
                      
                      {achievement.streakRequired && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-orange-500" />
                            Streak
                          </span>
                          <span>{achievement.currentStreak || 0}/{achievement.streakRequired}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>+{achievement.rewardPoints} Points</span>
                          <span>+{achievement.rewardPicklePoints} Pickle Points</span>
                        </div>
                        {achievement.unlockConditions.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {achievement.unlockConditions.length} conditions
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="chains" className="space-y-4">
            {achievementChains.map((chain) => (
              <Card key={chain.id} className="border-2 border-dashed border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{chain.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{chain.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10">
                      {chain.achievements.length} achievements
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Chain Progress</span>
                      <span>{chain.totalProgress}%</span>
                    </div>
                    <Progress value={chain.totalProgress} className="h-3" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chain.achievements.map((achievement, index) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </div>
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center text-white text-sm`}>
                            {getCategoryIcon(achievement.category)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{achievement.name}</h5>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{achievement.currentProgress}/{achievement.targetProgress}</span>
                            {achievement.isCompleted && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                ✓ Complete
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                    <h5 className="font-semibold text-sm mb-2">Chain Completion Reward</h5>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        +{chain.chainReward.points} Points
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        +{chain.chainReward.picklePoints} Pickle Points
                      </span>
                      {chain.chainReward.specialBadge && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {chain.chainReward.specialBadge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed Achievements</span>
                    <span className="font-semibold">{achievements.filter(a => a.isCompleted).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Progress</span>
                    <span className="font-semibold">{achievements.filter(a => !a.isCompleted).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Pickle Points Earned</span>
                    <span className="font-semibold text-primary">2,450 Points</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Streak</span>
                    <span className="font-semibold text-orange-500">4 days</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.slice(1).map((category) => {
                    const categoryAchievements = achievements.filter(a => a.category === category.id);
                    const completed = categoryAchievements.filter(a => a.isCompleted).length;
                    const total = categoryAchievements.length;
                    const percentage = total > 0 ? (completed / total) * 100 : 0;
                    
                    return (
                      <div key={category.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {category.icon}
                            {category.name}
                          </span>
                          <span>{completed}/{total}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}