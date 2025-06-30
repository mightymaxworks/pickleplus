import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Award, Target, Users, Zap, Calendar, Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'tactical' | 'social' | 'consistency' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  rarity: number; // Percentage of players who have this badge
}

interface BadgeShowcaseProps {
  userLevel: string;
  currentRating: number;
  ratingType: 'pcp' | 'dupr' | 'pickle_points';
  className?: string;
}

export default function BadgeShowcase({
  userLevel,
  currentRating,
  ratingType,
  className = ''
}: BadgeShowcaseProps) {
  const { t } = useLanguage();

  // Generate badge collection based on user progress
  const generateBadges = (): BadgeDefinition[] => {
    return [
      // Technical Badges
      {
        id: 'first_winner',
        name: 'First Victory',
        description: 'Win your first match',
        category: 'milestone',
        tier: 'bronze',
        icon: <Trophy className="w-4 h-4" />,
        unlocked: true,
        progress: 1,
        maxProgress: 1,
        unlockedAt: new Date('2025-06-15'),
        rarity: 95
      },
      {
        id: 'rating_climber',
        name: 'Rating Climber',
        description: 'Reach 3.5 PCP rating',
        category: 'technical',
        tier: 'silver',
        icon: <Target className="w-4 h-4" />,
        unlocked: currentRating >= 3.5,
        progress: Math.min(currentRating, 3.5),
        maxProgress: 3.5,
        unlockedAt: currentRating >= 3.5 ? new Date('2025-06-20') : undefined,
        rarity: 60
      },
      {
        id: 'shot_master',
        name: 'Shot Master',
        description: 'Master 5 different shot types',
        category: 'technical',
        tier: 'gold',
        icon: <Award className="w-4 h-4" />,
        unlocked: false,
        progress: 3,
        maxProgress: 5,
        rarity: 25
      },
      // Social Badges
      {
        id: 'community_builder',
        name: 'Community Builder',
        description: 'Help 3 new players improve',
        category: 'social',
        tier: 'silver',
        icon: <Users className="w-4 h-4" />,
        unlocked: false,
        progress: 1,
        maxProgress: 3,
        rarity: 40
      },
      {
        id: 'mentor',
        name: 'Mentor',
        description: 'Coach 10 players to improvement',
        category: 'social',
        tier: 'gold',
        icon: <Star className="w-4 h-4" />,
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        rarity: 15
      },
      // Consistency Badges
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Play for 7 consecutive days',
        category: 'consistency',
        tier: 'bronze',
        icon: <Calendar className="w-4 h-4" />,
        unlocked: false,
        progress: 5,
        maxProgress: 7,
        rarity: 70
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain 30-day play streak',
        category: 'consistency',
        tier: 'platinum',
        icon: <Zap className="w-4 h-4" />,
        unlocked: false,
        progress: 12,
        maxProgress: 30,
        rarity: 5
      },
      // Tactical Badges
      {
        id: 'strategist',
        name: 'Strategist',
        description: 'Win 10 matches with tactical superiority',
        category: 'tactical',
        tier: 'gold',
        icon: <Crown className="w-4 h-4" />,
        unlocked: false,
        progress: 4,
        maxProgress: 10,
        rarity: 30
      }
    ];
  };

  const badges = generateBadges();
  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const totalBadges = badges.length;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'tactical':
        return 'bg-purple-100 text-purple-800';
      case 'social':
        return 'bg-green-100 text-green-800';
      case 'consistency':
        return 'bg-orange-100 text-orange-800';
      case 'milestone':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-600 to-amber-800';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-indigo-400 to-indigo-600';
      default:
        return 'from-gray-300 to-gray-500';
    }
  };

  const getRarityText = (rarity: number) => {
    if (rarity >= 80) return 'Common';
    if (rarity >= 50) return 'Uncommon';
    if (rarity >= 20) return 'Rare';
    if (rarity >= 5) return 'Epic';
    return 'Legendary';
  };

  const categories = ['technical', 'tactical', 'social', 'consistency', 'milestone'] as const;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Badge Collection
        </CardTitle>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {unlockedBadges.length} of {totalBadges} badges unlocked
          </p>
          <div className="text-sm font-medium">
            {Math.round((unlockedBadges.length / totalBadges) * 100)}% complete
          </div>
        </div>
        <Progress 
          value={(unlockedBadges.length / totalBadges) * 100} 
          className="h-2"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => {
          const categoryBadges = badges.filter(badge => badge.category === category);
          if (categoryBadges.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm capitalize">{category} Badges</h4>
                <Badge variant="outline" className={`text-xs ${getCategoryColor(category)}`}>
                  {categoryBadges.filter(b => b.unlocked).length}/{categoryBadges.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categoryBadges.map(badge => (
                  <div
                    key={badge.id}
                    className={`relative p-3 rounded-lg border transition-all ${
                      badge.unlocked 
                        ? 'bg-gradient-to-br border-2 shadow-md' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                    style={badge.unlocked ? {
                      backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                    } : {}}
                  >
                    {badge.unlocked && (
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${getTierColor(badge.tier)} opacity-10`} />
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded ${
                          badge.unlocked 
                            ? `bg-gradient-to-br ${getTierColor(badge.tier)} text-white` 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {badge.icon}
                        </div>
                        {badge.unlocked && (
                          <Badge variant="outline" className="text-xs">
                            {getRarityText(badge.rarity)}
                          </Badge>
                        )}
                      </div>
                      
                      <h5 className={`font-medium text-sm mb-1 ${
                        badge.unlocked ? 'text-gray-800' : 'text-gray-500'
                      }`}>
                        {badge.name}
                      </h5>
                      
                      <p className={`text-xs mb-2 ${
                        badge.unlocked ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {badge.description}
                      </p>
                      
                      {!badge.unlocked && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{badge.progress} / {badge.maxProgress}</span>
                            <span>{Math.round((badge.progress / badge.maxProgress) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(badge.progress / badge.maxProgress) * 100} 
                            className="h-1"
                          />
                        </div>
                      )}
                      
                      {badge.unlocked && badge.unlockedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Unlocked {badge.unlockedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-800">Next Achievement</span>
          </div>
          <p className="text-xs text-purple-600">
            Complete your 7-day streak to unlock the "Week Warrior" bronze badge! 
            Only 2 more days needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}