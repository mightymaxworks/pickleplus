/**
 * PKL-278651-GAME-0001-MOD
 * RewardDisplay Component
 * 
 * This component displays a reward in the UI.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Gift, 
  Zap, 
  Trophy, 
  Medal, 
  Crown, 
  Star,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Reward } from '../api/types';

interface RewardDisplayProps {
  reward: Reward;
  isNew?: boolean;
  onClaim?: () => void;
  isClaimed?: boolean;
  className?: string;
  compact?: boolean;
}

// Map rarity to colors and animations
const rarityConfig = {
  'common': {
    bgGradient: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-300',
    glowColor: 'blue-400',
    icon: <Medal className="h-5 w-5" />,
    animation: { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity } }
  },
  'uncommon': {
    bgGradient: 'from-green-500 to-green-600',
    borderColor: 'border-green-300',
    glowColor: 'green-400',
    icon: <Star className="h-5 w-5" />,
    animation: { scale: [1, 1.05, 1], transition: { duration: 1.8, repeat: Infinity } }
  },
  'rare': {
    bgGradient: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-300',
    glowColor: 'purple-400',
    icon: <Trophy className="h-5 w-5" />,
    animation: { scale: [1, 1.07, 1], transition: { duration: 1.5, repeat: Infinity } }
  },
  'epic': {
    bgGradient: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-300',
    glowColor: 'orange-400',
    icon: <Award className="h-5 w-5" />,
    animation: { scale: [1, 1.1, 1], transition: { duration: 1.2, repeat: Infinity } }
  },
  'legendary': {
    bgGradient: 'from-yellow-500 to-yellow-600',
    borderColor: 'border-yellow-300',
    glowColor: 'yellow-400',
    icon: <Crown className="h-5 w-5" />,
    animation: { 
      scale: [1, 1.15, 1], 
      rotate: [0, 3, 0, -3, 0],
      transition: { duration: 1, repeat: Infinity } 
    }
  }
};

// Default to common if rarity not found
const getConfigForRarity = (rarity: string) => {
  return rarityConfig[rarity as keyof typeof rarityConfig] || rarityConfig.common;
};

const RewardDisplay: React.FC<RewardDisplayProps> = ({
  reward,
  isNew = false,
  onClaim,
  isClaimed = false,
  className = '',
  compact = false
}) => {
  const config = getConfigForRarity(reward.rarity);
  
  // Determine reward icon based on type
  const getRewardIcon = () => {
    switch (reward.type) {
      case 'xp':
        return <Zap className="h-6 w-6 text-yellow-300" />;
      case 'badge':
        return <Award className="h-6 w-6 text-blue-300" />;
      case 'feature_unlock':
        return <ExternalLink className="h-6 w-6 text-green-300" />;
      case 'physical':
        return <Gift className="h-6 w-6 text-red-300" />;
      default:
        return <Trophy className="h-6 w-6 text-purple-300" />;
    }
  };

  if (compact) {
    // Compact display (for lists, etc.)
    return (
      <div className={`flex items-center p-2 rounded-lg border ${config.borderColor} bg-gradient-to-r ${config.bgGradient} ${className}`}>
        <motion.div 
          className={`p-1.5 bg-white/20 rounded-full mr-2`}
          animate={config.animation}
        >
          {getRewardIcon()}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm leading-tight truncate">{reward.name}</h4>
          <p className="text-white/80 text-xs truncate">{reward.description}</p>
        </div>
        {isNew && (
          <div className="ml-2 bg-white/20 text-white rounded-full px-2 py-0.5 text-xs font-medium">
            New
          </div>
        )}
      </div>
    );
  }

  // Full display
  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div className={`relative bg-gradient-to-r ${config.bgGradient} p-4`}>
        {/* Rarity indicator */}
        <div className="absolute top-2 right-2 bg-white/20 text-white rounded-full px-2 py-0.5 text-xs font-medium flex items-center">
          {config.icon}
          <span className="ml-1 capitalize">{reward.rarity}</span>
        </div>
        
        {/* New badge */}
        {isNew && (
          <div className="absolute top-2 left-2 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
            New!
          </div>
        )}
        
        {/* Reward icon and name */}
        <div className="flex flex-col items-center mt-4">
          <motion.div 
            className={`p-4 bg-white/20 rounded-full mb-3`}
            animate={config.animation}
          >
            {getRewardIcon()}
          </motion.div>
          <h3 className="text-white font-bold text-xl mb-1">{reward.name}</h3>
          <p className="text-white/80 text-sm text-center">{reward.description}</p>
          
          {/* Reward value */}
          {reward.value && reward.type === 'xp' && reward.value.xpAmount && (
            <div className="mt-3 bg-white/20 rounded-full px-3 py-1 text-white font-bold flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              {reward.value.xpAmount} XP
            </div>
          )}
        </div>
      </div>
      
      {/* Reward image if available */}
      {reward.imageUrl && (
        <div className="p-2 bg-gray-800">
          <img 
            src={reward.imageUrl} 
            alt={reward.name} 
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}
      
      {/* Action button */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800">
        {isClaimed ? (
          <Button 
            variant="outline"
            className="w-full" 
            disabled
          >
            Claimed
          </Button>
        ) : (
          <Button 
            className="w-full"
            onClick={onClaim}
          >
            Claim Reward
          </Button>
        )}
      </div>
    </div>
  );
};

export default RewardDisplay;