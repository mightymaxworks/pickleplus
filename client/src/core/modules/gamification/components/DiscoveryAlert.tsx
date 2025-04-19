/**
 * PKL-278651-XP-0002-UI
 * Discovery Alert Component
 * 
 * This component displays an alert when a user discovers a new feature or Easter egg.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type AlertLevel = 'info' | 'success' | 'warning';
type RewardType = 'badge' | 'xp' | 'item' | 'currency';
type RewardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface RewardValue {
  xpAmount?: number;
  itemId?: number;
  currencyAmount?: number;
}

interface DiscoveryReward {
  id: number;
  name: string;
  description: string;
  type: RewardType;
  rarity: RewardRarity;
  value: RewardValue;
}

interface DiscoveryAlertProps {
  title: string;
  message: string;
  level: AlertLevel;
  open: boolean;
  onClose: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
  reward?: DiscoveryReward;
}

const DiscoveryAlert: React.FC<DiscoveryAlertProps> = ({
  title,
  message,
  level = 'info',
  open,
  onClose,
  autoHide = true,
  autoHideDelay = 5000,
  reward
}) => {
  // Auto-hide functionality
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (open && autoHide) {
      timer = setTimeout(() => {
        onClose();
      }, autoHideDelay);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open, autoHide, autoHideDelay, onClose]);

  // Get background color based on level
  const getBgColor = () => {
    switch (level) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Get icon color based on level
  const getIconColor = () => {
    switch (level) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  // Get reward color based on rarity
  const getRarityColor = (rarity: RewardRarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800';
      case 'uncommon':
        return 'bg-green-100 text-green-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`rounded-lg border shadow-md p-4 ${getBgColor()}`}
          >
            <div className="flex items-start">
              <div className={`mt-0.5 rounded-full p-2 ${getIconColor()} bg-white/80`}>
                <Lightbulb className="h-4 w-4" />
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  <button
                    onClick={onClose}
                    className="ml-4 inline-flex text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="mt-1 text-sm text-gray-700">{message}</p>
                
                {reward && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-gray-900">Reward Earned</h4>
                      <Badge className={getRarityColor(reward.rarity)} variant="secondary">
                        {reward.rarity}
                      </Badge>
                    </div>
                    
                    <div className="mt-1.5">
                      <h5 className="text-sm font-medium">{reward.name}</h5>
                      <p className="text-xs text-gray-600">{reward.description}</p>
                      
                      {reward.type === 'xp' && reward.value.xpAmount && (
                        <p className="mt-1 text-sm font-medium text-green-600">
                          +{reward.value.xpAmount} XP
                        </p>
                      )}
                      
                      {reward.type === 'currency' && reward.value.currencyAmount && (
                        <p className="mt-1 text-sm font-medium text-amber-600">
                          +{reward.value.currencyAmount} Coins
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="mt-2 w-full text-xs h-8"
                    >
                      Claim Reward
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DiscoveryAlert;