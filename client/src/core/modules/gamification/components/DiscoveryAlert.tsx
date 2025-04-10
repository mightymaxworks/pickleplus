/**
 * PKL-278651-GAME-0001-MOD
 * DiscoveryAlert Component
 * 
 * A component that displays an alert when a discovery is made.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Star, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RewardDisplay from './RewardDisplay';
import { Reward } from '../api/types';

interface DiscoveryAlertProps {
  title: string;
  message: string;
  imageUrl?: string;
  open: boolean;
  level?: 'info' | 'success' | 'special';
  reward?: Reward;
  onClose: () => void;
  onClaim?: () => void;
  hasBeenClaimed?: boolean;
  autoHide?: boolean;
  hideDelay?: number; // in milliseconds
}

/**
 * A component that displays an alert when a discovery is made.
 */
export default function DiscoveryAlert({
  title,
  message,
  imageUrl,
  open,
  level = 'info',
  reward,
  onClose,
  onClaim,
  hasBeenClaimed = false,
  autoHide = false,
  hideDelay = 7000 // 7 seconds default
}: DiscoveryAlertProps) {
  // State to track whether to show the alert
  const [show, setShow] = useState(open);
  
  // State to track whether to show the reward
  const [showReward, setShowReward] = useState(false);
  
  // Handle auto-hide
  useEffect(() => {
    setShow(open);
    
    // If autoHide is enabled, hide after the specified delay
    if (open && autoHide) {
      const timeoutId = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 500); // Call onClose after exit animation
      }, hideDelay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [open, autoHide, hideDelay, onClose]);
  
  // Get appropriate icon based on level
  const getIcon = () => {
    switch (level) {
      case 'success':
        return <Trophy className="h-8 w-8 text-green-500" />;
      case 'special':
        return <Star className="h-8 w-8 text-yellow-500" />;
      default:
        return <Award className="h-8 w-8 text-blue-500" />;
    }
  };
  
  // Get background color based on level
  const getBgColor = () => {
    switch (level) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30';
      case 'special':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30';
      default:
        return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30';
    }
  };
  
  // Get border color based on level
  const getBorderColor = () => {
    switch (level) {
      case 'success':
        return 'border-green-200 dark:border-green-800';
      case 'special':
        return 'border-amber-200 dark:border-amber-800';
      default:
        return 'border-blue-200 dark:border-blue-800';
    }
  };
  
  // Handle close button click
  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Call onClose after exit animation
  };
  
  // Handle view reward button click
  const handleViewReward = () => {
    setShowReward(true);
  };
  
  // Handle claim reward button click
  const handleClaimReward = () => {
    if (onClaim) {
      onClaim();
    }
  };
  
  // If not showing, don't render anything
  if (!open) return null;
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-6 right-6 z-50 max-w-sm"
        >
          <Card 
            className={cn(
              "border-2 shadow-lg",
              getBgColor(),
              getBorderColor()
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getIcon()}
                  <CardTitle className="text-xl">{title}</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <Badge 
                variant="outline" 
                className={cn(
                  "font-semibold",
                  level === 'success' ? "text-green-600 dark:text-green-400" : 
                  level === 'special' ? "text-amber-600 dark:text-amber-400" : 
                  "text-blue-600 dark:text-blue-400"
                )}
              >
                Discovery
              </Badge>
              
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
              
              {imageUrl && (
                <div className="relative h-40 w-full overflow-hidden rounded-md">
                  <img 
                    src={imageUrl} 
                    alt={title} 
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )}
              
              {reward && showReward && (
                <RewardDisplay
                  reward={reward}
                  onClaim={handleClaimReward}
                  claimed={hasBeenClaimed}
                />
              )}
            </CardContent>
            
            <CardFooter className="pt-0">
              {reward && !showReward ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleViewReward}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  View Reward
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleClose}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}