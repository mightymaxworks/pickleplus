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
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievement Progress
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{completedCount} completed</span>
          <span>{inProgressCount} in progress</span>
          <span>{achievements.length - completedCount - inProgressCount} available</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`p-3 rounded-lg border transition-all ${
              achievement.completed 
                ? 'bg-green-50 border-green-200' 
                : achievement.progress > 0 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
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

        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-800">Next Milestone</span>
          </div>
          <p className="text-xs text-purple-600">
            Complete 2 more achievements to unlock the "Rising Star" badge and earn +200 Pickle Points!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}