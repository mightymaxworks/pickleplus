import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar, Star, Award, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'consistency' | 'milestone' | 'social';
  progress: number;
  target: number;
  completed: boolean;
  icon: React.ReactNode;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface AchievementTrackerProps {
  userLevel: string;
  currentRating: number;
  ratingType: 'pcp' | 'dupr' | 'pickle_points';
  className?: string;
}

export default function AchievementTracker({
  userLevel,
  currentRating,
  ratingType,
  className = ''
}: AchievementTrackerProps) {
  const { t } = useLanguage();

  // Generate achievements based on user progress
  const generateAchievements = (): Achievement[] => {
    return [
      {
        id: 'rating_milestone',
        title: 'Rating Climber',
        description: 'Reach 3.5 PCP rating',
        category: 'milestone',
        progress: Math.min(currentRating, 3.5),
        target: 3.5,
        completed: currentRating >= 3.5,
        icon: <Trophy className="w-4 h-4" />,
        reward: '+50 Pickle Points',
        difficulty: 'medium'
      },
      {
        id: 'consistency_streak',
        title: 'Consistent Player',
        description: 'Play matches 7 days in a row',
        category: 'consistency',
        progress: 5,
        target: 7,
        completed: false,
        icon: <Calendar className="w-4 h-4" />,
        reward: '+25 Pickle Points',
        difficulty: 'easy'
      },
      {
        id: 'skill_mastery',
        title: 'Technical Master',
        description: 'Master 5 different shot types',
        category: 'skill',
        progress: 3,
        target: 5,
        completed: false,
        icon: <Target className="w-4 h-4" />,
        reward: 'Badge: Shot Master',
        difficulty: 'hard'
      },
      {
        id: 'community_engagement',
        title: 'Community Builder',
        description: 'Help 3 new players improve',
        category: 'social',
        progress: 1,
        target: 3,
        completed: false,
        icon: <Star className="w-4 h-4" />,
        reward: 'Coach Recognition',
        difficulty: 'medium'
      },
      {
        id: 'tournament_participant',
        title: 'Tournament Ready',
        description: 'Participate in first tournament',
        category: 'milestone',
        progress: 0,
        target: 1,
        completed: false,
        icon: <Award className="w-4 h-4" />,
        reward: '+100 Pickle Points',
        difficulty: 'medium'
      }
    ];
  };

  const achievements = generateAchievements();
  const completedCount = achievements.filter(a => a.completed).length;
  const inProgressCount = achievements.filter(a => !a.completed && a.progress > 0).length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'skill':
        return 'bg-blue-100 text-blue-800';
      case 'consistency':
        return 'bg-green-100 text-green-800';
      case 'milestone':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={`backdrop-blur-md bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 border-white/20 shadow-2xl shadow-yellow-500/10 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Achievement Progress</span>
        </CardTitle>
        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {completedCount} completed
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            {inProgressCount} in progress
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            {achievements.length - completedCount - inProgressCount} available
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              achievement.completed 
                ? 'bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/50 shadow-green-500/10' 
                : achievement.progress > 0 
                  ? 'bg-gradient-to-br from-blue-50/80 to-sky-50/80 border-blue-200/50 shadow-blue-500/10' 
                  : 'bg-gradient-to-br from-gray-50/80 to-slate-50/80 border-gray-200/50 shadow-gray-500/10'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${
                  achievement.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {achievement.completed ? <CheckCircle className="w-4 h-4" /> : achievement.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getCategoryColor(achievement.category)}`}
                >
                  {achievement.category}
                </Badge>
                <div 
                  className={`w-2 h-2 rounded-full ${getDifficultyColor(achievement.difficulty)}`}
                  title={`${achievement.difficulty} difficulty`}
                />
              </div>
            </div>

            {!achievement.completed && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{achievement.progress} / {achievement.target}</span>
                  <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.target) * 100} 
                  className="h-1.5"
                />
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                Reward: {achievement.reward}
              </span>
              {achievement.completed && (
                <Badge variant="outline" className="text-xs text-green-600">
                  Completed!
                </Badge>
              )}
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100/60 to-blue-100/60 backdrop-blur-sm rounded-xl border border-purple-200/30 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Next Milestone</span>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
            Complete 2 more achievements to unlock the "Rising Star" badge and earn +200 Pickle Points!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}