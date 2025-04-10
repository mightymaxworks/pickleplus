/**
 * PKL-278651-GAME-0001-MOD
 * RewardDisplay Component
 * 
 * A component that displays a reward and allows the user to claim it.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, Star, Zap, Award, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Reward } from '../api/types';

interface RewardDisplayProps {
  reward: Reward;
  onClaim?: () => void;
  claimed?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * A component that displays a reward and allows the user to claim it.
 */
export default function RewardDisplay({
  reward,
  onClaim,
  claimed = false,
  compact = false,
  className
}: RewardDisplayProps) {
  // Get icon based on reward type
  const getIcon = () => {
    const size = compact ? 'h-5 w-5' : 'h-6 w-6';
    
    switch (reward.type) {
      case 'badge':
        return <Award className={cn(size, 'text-blue-500')} />;
      case 'xp':
        return <Zap className={cn(size, 'text-yellow-500')} />;
      case 'physical':
        return <Gift className={cn(size, 'text-purple-500')} />;
      default:
        return <Trophy className={cn(size, 'text-orange-500')} />;
    }
  };
  
  // Get color for rarity
  const getRarityColor = () => {
    switch (reward.rarity) {
      case 'common':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
      case 'uncommon':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'rare':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      case 'epic':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'legendary':
        return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };
  
  // Format the reward value
  const getRewardValue = () => {
    if (!reward.value) return null;
    
    switch (reward.type) {
      case 'xp':
        return reward.value.xpAmount ? `+${reward.value.xpAmount} XP` : null;
      case 'badge':
        return 'New Badge';
      case 'physical':
        return reward.value.physicalItem?.name || 'Physical Reward';
      default:
        return null;
    }
  };
  
  if (compact) {
    // Compact version - for lists
    return (
      <div className={cn("flex items-center gap-3 p-2 rounded-md", className)}>
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full", 
          getRarityColor()
        )}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{reward.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {reward.description}
          </p>
        </div>
        {claimed ? (
          <Badge variant="outline" className="text-green-600 dark:text-green-400">
            <Check className="h-3 w-3 mr-1" />
            Claimed
          </Badge>
        ) : (
          <Badge variant="outline" className={getRarityColor().split(' ')[0]}>
            {reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)}
          </Badge>
        )}
      </div>
    );
  }
  
  // Full version - for detail view
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base font-semibold">{reward.name}</CardTitle>
          </div>
          <Badge variant="outline" className={getRarityColor()}>
            {reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">{reward.description}</p>
        
        {getRewardValue() && (
          <div className="flex items-center">
            <Badge variant="secondary">
              {getRewardValue()}
            </Badge>
          </div>
        )}
        
        {reward.imageUrl && (
          <div className="rounded-md overflow-hidden mt-2">
            <motion.img 
              src={reward.imageUrl}
              alt={reward.name}
              className="w-full h-auto object-cover"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </CardContent>
      
      {onClaim && !claimed && (
        <CardFooter className="pt-0">
          <Button 
            variant="default" 
            className="w-full" 
            onClick={onClaim}
          >
            <Gift className="mr-2 h-4 w-4" />
            Claim Reward
          </Button>
        </CardFooter>
      )}
      
      {claimed && (
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full" 
            disabled 
          >
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Claimed
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}