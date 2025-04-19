/**
 * PKL-278651-XP-0002-UI
 * Reward Display Component
 * 
 * This component displays a list of user rewards.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Trophy, Users, Medal, Gift, Star } from 'lucide-react';

// Reward types
export type RewardType = 'achievement' | 'badge' | 'title' | 'item';
export type RewardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Reward {
  id: number;
  title: string;
  description: string;
  type: RewardType;
  rarity: RewardRarity;
  icon: string;
  dateEarned: string;
}

interface RewardDisplayProps {
  rewards: Reward[];
  title?: string;
  description?: string;
}

const RewardDisplay: React.FC<RewardDisplayProps> = ({
  rewards,
  title = 'Rewards',
  description = 'Your earned rewards and achievements'
}) => {
  // Get icon based on reward type
  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrophyIcon':
        return <Trophy className="h-5 w-5" />;
      case 'UsersIcon':
        return <Users className="h-5 w-5" />;
      case 'MedalIcon':
        return <Medal className="h-5 w-5" />;
      case 'GiftIcon':
        return <Gift className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  // Get badge color based on rarity
  const getRarityColor = (rarity: RewardRarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'uncommon':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'legendary':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    }
  };

  // Format date to relative time
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (err) {
      return 'recently';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rewards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No rewards earned yet. Keep playing to earn rewards!
          </p>
        ) : (
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-md ${getRarityColor(reward.rarity)}`}>
                  {getRewardIcon(reward.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <h4 className="text-sm font-medium truncate mr-2">
                      {reward.title}
                    </h4>
                    <Badge variant="outline" className="ml-auto text-xs font-normal">
                      {reward.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reward.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Earned {formatDate(reward.dateEarned)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardDisplay;