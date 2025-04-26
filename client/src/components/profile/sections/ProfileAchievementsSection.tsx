/**
 * PKL-278651-PROF-0009.4-SECT - Profile Achievements Section
 * 
 * This component displays user achievements with progress indicators.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EnhancedUser } from "@/types/enhanced-user";
import { useQuery } from "@tanstack/react-query";
import { Award, LucideIcon, Trophy, Zap, Target, Clock, Medal } from "lucide-react";

interface ProfileAchievementsSectionProps {
  user: EnhancedUser;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  progress: number;
  maxProgress: number;
  earnedAt?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export function ProfileAchievementsSection({ user }: ProfileAchievementsSectionProps) {
  // Fetch achievements
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['/api/achievements', { userId: user.id }],
    staleTime: 300000, // 5 minutes
  });
  
  // Placeholder achievements for the UI structure
  const placeholderAchievements: Achievement[] = [
    {
      id: 1,
      name: 'Match Maestro',
      description: 'Win 10 matches',
      icon: Trophy,
      progress: 6,
      maxProgress: 10,
      tier: 'bronze'
    },
    {
      id: 2,
      name: 'Tournament Titan',
      description: 'Participate in 5 tournaments',
      icon: Medal,
      progress: 2,
      maxProgress: 5,
      tier: 'bronze'
    },
    {
      id: 3,
      name: 'Consistent Contender',
      description: 'Play 20 matches in a month',
      icon: Clock,
      progress: 10,
      maxProgress: 20,
      tier: 'silver'
    },
    {
      id: 4,
      name: 'Skill Seeker',
      description: 'Reach level 10',
      icon: Zap,
      progress: user.level || 1,
      maxProgress: 10,
      tier: 'gold',
      earnedAt: user.level >= 10 ? new Date().toISOString() : undefined
    }
  ];
  
  // Use actual achievements from API if available, otherwise use placeholders
  const displayAchievements = achievements?.length ? achievements : placeholderAchievements;
  
  // Function to render achievement with progress
  const renderAchievement = (achievement: Achievement) => {
    const isComplete = achievement.progress >= achievement.maxProgress;
    const progressPercentage = Math.min(100, Math.round((achievement.progress / achievement.maxProgress) * 100));
    
    // Tier colors
    const tierColors = {
      bronze: 'bg-amber-600',
      silver: 'bg-slate-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-cyan-500'
    };
    
    return (
      <Card key={achievement.id} className="overflow-hidden">
        <div className={`h-1 ${tierColors[achievement.tier]} w-full`} />
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${isComplete ? 'bg-primary/10' : 'bg-muted'}`}>
              {achievement.icon && <achievement.icon className={`h-6 w-6 ${isComplete ? 'text-primary' : 'text-muted-foreground'}`} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{achievement.name}</h3>
                {isComplete && (
                  <Badge variant="outline" className="text-xs">
                    Complete
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
              
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{achievement.progress} / {achievement.maxProgress}</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1" />
              </div>
              
              {achievement.earnedAt && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Achievements Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary" />
            Achievements
          </CardTitle>
          <CardDescription>
            Track your accomplishments and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">
                {displayAchievements.filter(a => a.progress >= a.maxProgress).length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">
                {displayAchievements.filter(a => a.tier === 'gold' && a.progress >= a.maxProgress).length}
              </div>
              <div className="text-xs text-muted-foreground">Gold Tier</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">
                {Math.round(displayAchievements.reduce((acc, a) => acc + ((a.progress / a.maxProgress) * 100), 0) / displayAchievements.length)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg. Progress</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">
                {displayAchievements.length}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayAchievements.map(renderAchievement)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}