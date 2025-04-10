/**
 * PKL-278651-GAME-0001-MOD
 * RewardDisplay Component
 * 
 * This component displays reward information with animations and styling based on rarity.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Award, Shield, Coins } from 'lucide-react';
import { Reward } from './DiscoveryAlert';

export interface RewardDisplayProps {
  reward: Reward;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * RewardDisplay Component
 * 
 * Displays a reward with appropriate styling based on its rarity
 */
const RewardDisplay: React.FC<RewardDisplayProps> = ({
  reward,
  animate = true,
  size = 'md'
}) => {
  // Get icon based on reward type
  const getRewardIcon = () => {
    switch (reward.type) {
      case 'badge':
        return <Award />;
      case 'item':
        return <Shield />;
      case 'currency':
        return <Coins />;
      case 'xp':
      default:
        return <Gift />;
    }
  };
  
  // Get the reward rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-200 to-gray-300 text-gray-700 border-gray-300';
      case 'uncommon':
        return 'from-green-200 to-green-300 text-green-700 border-green-300';
      case 'rare':
        return 'from-blue-200 to-blue-300 text-blue-700 border-blue-300';
      case 'epic':
        return 'from-purple-200 to-purple-300 text-purple-700 border-purple-300';
      case 'legendary':
        return 'from-orange-200 to-orange-300 text-orange-700 border-orange-300';
      default:
        return 'from-gray-200 to-gray-300 text-gray-700 border-gray-300';
    }
  };
  
  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2 text-xs';
      case 'lg':
        return 'p-5 text-base';
      case 'md':
      default:
        return 'p-3 text-sm';
    }
  };
  
  // Get icon size
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      case 'md':
      default:
        return 20;
    }
  };
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };
  
  const iconVariants = {
    hidden: { opacity: 0, rotate: -20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      rotate: 0,
      scale: 1,
      transition: { duration: 0.4, delay: 0.2, ease: 'easeOut' }
    }
  };
  
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, delay: 0.3, ease: 'easeOut' }
    }
  };
  
  // Wrapper component - either motion.div or regular div based on animate prop
  const Wrapper = animate ? motion.div : 'div';
  const IconWrapper = animate ? motion.div : 'div';
  const TextWrapper = animate ? motion.div : 'div';
  
  return (
    <Wrapper
      className={`rounded-lg border ${getSizeClasses()} bg-gradient-to-br ${getRarityColor(reward.rarity)} relative overflow-hidden`}
      initial={animate ? 'hidden' : undefined}
      animate={animate ? 'visible' : undefined}
      variants={cardVariants}
    >
      <div className="flex items-start">
        <IconWrapper
          className="mr-3 flex-shrink-0"
          initial={animate ? 'hidden' : undefined}
          animate={animate ? 'visible' : undefined}
          variants={iconVariants}
        >
          {React.cloneElement(getRewardIcon() as React.ReactElement, { size: getIconSize() })}
        </IconWrapper>
        
        <TextWrapper
          className="flex-1"
          initial={animate ? 'hidden' : undefined}
          animate={animate ? 'visible' : undefined}
          variants={textVariants}
        >
          <h4 className="font-bold">{reward.name}</h4>
          <p className="opacity-80 text-xs">{reward.description}</p>
          
          {reward.type === 'xp' && reward.value.xpAmount && (
            <div className="mt-1 font-medium text-xs">
              +{reward.value.xpAmount} XP
            </div>
          )}
        </TextWrapper>
      </div>
      
      {reward.rarity === 'legendary' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent animate-pulse"></div>
        </div>
      )}
    </Wrapper>
  );
};

export default RewardDisplay;