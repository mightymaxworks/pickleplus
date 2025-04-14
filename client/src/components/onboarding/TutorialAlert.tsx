/**
 * PKL-278651-GAME-0002-TUT
 * Tutorial Alert Component
 * 
 * This is a simplified version of DiscoveryAlert specifically for the tutorial system.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Gift, Star, Info, AlertTriangle } from 'lucide-react';

// Types for the component props
export interface TutorialReward {
  id: number;
  name: string;
  description: string;
  type: 'xp' | 'badge' | 'item' | 'currency';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: {
    xpAmount?: number;
    badgeId?: string;
    itemId?: string;
    currencyAmount?: number;
  };
}

export interface TutorialAlertProps {
  title: string;
  message: string;
  level?: 'info' | 'success' | 'warning' | 'special';
  open?: boolean;
  autoHide?: boolean;
  hideDelay?: number;
  reward?: TutorialReward;
  onClose?: () => void;
}

/**
 * TutorialAlert Component
 * 
 * Displays an animated alert for tutorial-related discoveries.
 */
const TutorialAlert: React.FC<TutorialAlertProps> = ({
  title,
  message,
  level = 'info',
  open = true,
  autoHide = false,
  hideDelay = 5000,
  reward,
  onClose
}) => {
  // State for controlling the visibility
  const [isVisible, setIsVisible] = useState(open);
  
  // Auto hide logic
  useEffect(() => {
    setIsVisible(open);
    
    if (open && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, hideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [open, autoHide, hideDelay, onClose]);
  
  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  // Get the appropriate icon based on the level
  const getLevelIcon = () => {
    switch (level) {
      case 'success':
        return <Award className="text-green-500" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={24} />;
      case 'special':
        return <Star className="text-purple-500" size={24} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };
  
  // Get the appropriate colors based on the level
  const getLevelColors = () => {
    switch (level) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'special':
        return 'bg-purple-50 border-purple-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  // Get the reward rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600';
      case 'uncommon':
        return 'text-green-600';
      case 'rare':
        return 'text-blue-600';
      case 'epic':
        return 'text-purple-600';
      case 'legendary':
        return 'text-orange-500';
      default:
        return 'text-gray-600';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className={`rounded-lg shadow-lg border p-4 ${getLevelColors()}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                {getLevelIcon()}
                <h3 className="ml-2 font-bold text-gray-900">{title}</h3>
              </div>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{message}</p>
            
            {reward && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2 }}
                className="mt-2 p-3 bg-white rounded-md border border-gray-100"
              >
                <div className="flex items-center">
                  <Gift className="text-[#FF5722]" size={18} />
                  <span className="ml-2 font-medium">Reward Earned</span>
                </div>
                <div className="mt-2">
                  <h4 className={`font-bold ${getRarityColor(reward.rarity)}`}>
                    {reward.name}
                  </h4>
                  <p className="text-xs text-gray-500">{reward.description}</p>
                  
                  {reward.type === 'xp' && reward.value.xpAmount && (
                    <div className="mt-1 text-xs font-medium text-[#4CAF50]">
                      +{reward.value.xpAmount} XP
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialAlert;