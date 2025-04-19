/**
 * PKL-278651-XP-0005-ACHIEVE
 * User Achievements Display Component
 * 
 * This component displays a user's achievements with visuals for tiers
 * and integration with the XP system.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Award, 
  Star, 
  Clock, 
  ChevronRight, 
  Trophy, 
  Activity, 
  Medal,
  Shield,
  Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  tier: string;
  category: string;
  icon?: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface UserAchievementsDisplayProps {
  userId: number;
  compact?: boolean;
}

export function UserAchievementsDisplay({ userId, compact = false }: UserAchievementsDisplayProps) {
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Fetch user achievements
  const { data: achievements, isLoading, error } = useQuery({
    queryKey: ['/api/xp/achievements', userId],
    queryFn: async () => {
      const res = await fetch(`/api/xp/achievements?userId=${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch achievements');
      }
      return res.json();
    }
  });

  // Get achievement icon based on category
  const getAchievementIcon = (category: string, tier: string) => {
    switch (category) {
      case 'MATCH':
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 'COMMUNITY':
        return <Star className="h-5 w-5 text-indigo-500" />;
      case 'PROGRESSION':
        return <Activity className="h-5 w-5 text-emerald-500" />;
      case 'TOURNAMENT':
        return <Medal className="h-5 w-5 text-blue-500" />;
      case 'MASTERY':
        return <Shield className="h-5 w-5 text-purple-500" />;
      case 'CHALLENGE':
        return <Target className="h-5 w-5 text-rose-500" />;
      default:
        return <Award className="h-5 w-5 text-primary" />;
    }
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'BRONZE':
        return 'bg-amber-800 text-amber-100';
      case 'SILVER':
        return 'bg-slate-400 text-slate-100';
      case 'GOLD':
        return 'bg-amber-500 text-amber-100';
      case 'PLATINUM':
        return 'bg-cyan-700 text-cyan-100';
      case 'DIAMOND':
        return 'bg-sky-500 text-sky-100';
      case 'MASTER':
        return 'bg-purple-600 text-purple-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  // Filter achievements based on active tab
  const getFilteredAchievements = () => {
    if (!achievements?.achievements) return [];
    
    if (activeTab === 'all') {
      return achievements.achievements;
    } else if (activeTab === 'unlocked') {
      return achievements.achievements.filter((a: Achievement) => a.unlockedAt);
    } else if (activeTab === 'inprogress') {
      return achievements.achievements.filter((a: Achievement) => !a.unlockedAt && a.progress !== undefined);
    } else {
      return achievements.achievements.filter((a: Achievement) => a.category === activeTab.toUpperCase());
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Achievements</CardTitle>
          <CardDescription>
            There was a problem fetching achievements. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If no achievements data yet
  if (!achievements || !achievements.achievements) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
          <CardDescription>
            Complete actions and challenges to earn achievements and XP rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No achievements available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Compact view (for dashboard widgets)
  if (compact) {
    const unlockedCount = achievements.achievements.filter((a: Achievement) => a.unlockedAt).length;
    const totalCount = achievements.achievements.length;
    const recentAchievements = achievements.achievements
      .filter((a: Achievement) => a.unlockedAt)
      .sort((a: Achievement, b: Achievement) => 
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
      )
      .slice(0, 3);

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </div>
            <Badge variant="outline">
              {unlockedCount}/{totalCount}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {recentAchievements.length > 0 ? (
            <div className="space-y-2">
              {recentAchievements.map((achievement: Achievement) => (
                <div key={achievement.id} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getTierColor(achievement.tier)} flex items-center justify-center`}>
                    {getAchievementIcon(achievement.category, achievement.tier)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.unlockedAt && formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No achievements unlocked yet</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button variant="ghost" size="sm" className="w-full justify-between">
            View all achievements
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Full view
  const filteredAchievements = getFilteredAchievements();
  const unlockedCount = achievements.achievements.filter((a: Achievement) => a.unlockedAt).length;
  const totalCount = achievements.achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Achievements
        </CardTitle>
        <CardDescription>
          Complete actions and challenges to earn achievements and XP rewards
        </CardDescription>
      </CardHeader>
      
      <div className="px-6 pb-3">
        <div className="flex flex-col sm:flex-row gap-4 items-center border rounded-lg p-4 bg-muted/30">
          <ProgressCircle 
            value={completionPercentage} 
            size={80} 
            strokeWidth={8}
            className="text-primary"
          >
            <div className="text-center">
              <div className="text-xl font-bold">{completionPercentage}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </ProgressCircle>
          
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Achievement Progress</span>
              <span className="text-sm font-medium">{unlockedCount}/{totalCount}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span className="text-xs">Match</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                <span className="text-xs">Community</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs">Progression</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Tournament</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="unlocked" className="flex-1">Unlocked</TabsTrigger>
            <TabsTrigger value="inprogress" className="flex-1">In Progress</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            <Badge 
              variant={activeTab === 'all' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTab('all')}
            >
              All
            </Badge>
            <Badge 
              variant={activeTab === 'match' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTab('match')}
            >
              Match
            </Badge>
            <Badge 
              variant={activeTab === 'community' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTab('community')}
            >
              Community
            </Badge>
            <Badge 
              variant={activeTab === 'progression' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTab('progression')}
            >
              Progression
            </Badge>
            <Badge 
              variant={activeTab === 'tournament' ? 'default' : 'outline'} 
              className="cursor-pointer"
              onClick={() => setActiveTab('tournament')}
            >
              Tournament
            </Badge>
          </div>
        </div>
        
        <CardContent>
          {filteredAchievements.length > 0 ? (
            <div className="space-y-4">
              {filteredAchievements.map((achievement: Achievement) => (
                <TooltipProvider key={achievement.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`
                          flex items-center gap-4 p-3 rounded-lg
                          ${achievement.unlockedAt ? 'bg-muted/30' : 'bg-muted/10'}
                          transition-all hover:shadow-sm hover:bg-muted/50 cursor-default
                        `}
                      >
                        <div className={`
                          h-12 w-12 rounded-full flex items-center justify-center
                          ${getTierColor(achievement.tier)}
                        `}>
                          {getAchievementIcon(achievement.category, achievement.tier)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{achievement.title}</h4>
                            <Badge variant="outline" className="text-xs">{achievement.tier}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {achievement.description}
                          </p>
                          
                          {/* For in-progress achievements */}
                          {!achievement.unlockedAt && achievement.progress !== undefined && achievement.maxProgress && (
                            <div className="mt-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-muted-foreground">Progress</span>
                                <span className="text-xs text-muted-foreground">{achievement.progress}/{achievement.maxProgress}</span>
                              </div>
                              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-primary h-full rounded-full"
                                  style={{ width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {/* For unlocked achievements */}
                          {achievement.unlockedAt && (
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Unlocked {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* XP reward indicator */}
                        {achievement.unlockedAt && (
                          <div className="px-2 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded text-xs font-medium">
                            +{getTierXpValue(achievement.tier)} XP
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="text-center">
                        <div className="font-semibold">{achievement.title}</div>
                        <p className="text-xs">{achievement.description}</p>
                        {!achievement.unlockedAt && (
                          <div className="mt-1 text-xs text-amber-500">
                            Complete to earn +{getTierXpValue(achievement.tier)} XP
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No achievements found in this category</p>
            </div>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
}

// Helper function to get XP value based on tier
function getTierXpValue(tier: string): number {
  switch (tier.toUpperCase()) {
    case 'BRONZE':
      return 10;
    case 'SILVER':
      return 20;
    case 'GOLD':
      return 35;
    case 'PLATINUM':
      return 50;
    case 'DIAMOND':
      return 75;
    case 'MASTER':
      return 100;
    default:
      return 5;
  }
}

export default UserAchievementsDisplay;