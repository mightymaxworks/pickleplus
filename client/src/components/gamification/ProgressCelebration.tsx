import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, X, Share2, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'tactical' | 'social' | 'consistency' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: React.ReactNode;
  rarity: number;
  earnedXP: number;
  earnedPoints: number;
}

interface ProgressCelebrationProps {
  achievement: Achievement | null;
  isVisible: boolean;
  onClose: () => void;
  onShare?: (achievement: Achievement) => void;
  onViewBadges?: () => void;
}

export default function ProgressCelebration({
  achievement,
  isVisible,
  onClose,
  onShare,
  onViewBadges
}: ProgressCelebrationProps) {
  const [celebrationStage, setCelebrationStage] = useState<'entrance' | 'celebration' | 'details'>('entrance');

  useEffect(() => {
    if (isVisible && achievement) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);

      // Stage progression
      setTimeout(() => setCelebrationStage('celebration'), 500);
      setTimeout(() => setCelebrationStage('details'), 2000);

      return () => clearInterval(interval);
    }
  }, [isVisible, achievement]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-400 to-amber-600';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-indigo-400 to-indigo-600';
      default:
        return 'from-gray-300 to-gray-500';
    }
  };

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

  const getRarityText = (rarity: number) => {
    if (rarity >= 80) return 'Common';
    if (rarity >= 50) return 'Uncommon';
    if (rarity >= 20) return 'Rare';
    if (rarity >= 5) return 'Epic';
    return 'Legendary';
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0, rotateY: 180 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 100,
              delay: celebrationStage === 'entrance' ? 0 : 0.2
            }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-md mx-auto relative overflow-hidden">
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getTierColor(achievement.tier)} opacity-10`} />
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>

              <CardContent className="p-6 text-center relative z-10">
                {celebrationStage === 'entrance' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-xl font-bold text-gray-800">Achievement Unlocked!</h2>
                  </motion.div>
                )}

                {celebrationStage === 'celebration' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotateZ: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: 2,
                        repeatType: "reverse"
                      }}
                      className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center text-white text-2xl shadow-lg`}
                    >
                      {achievement.icon}
                    </motion.div>
                    
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {achievement.name}
                      </h2>
                      <p className="text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                  </motion.div>
                )}

                {celebrationStage === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Badge display */}
                    <div className="flex justify-center">
                      <div className={`relative p-4 rounded-full bg-gradient-to-br ${getTierColor(achievement.tier)} shadow-xl`}>
                        <div className="text-white text-3xl">
                          {achievement.icon}
                        </div>
                        <div className="absolute -top-2 -right-2">
                          <Badge variant="outline" className="bg-white text-xs font-bold">
                            {achievement.tier.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Achievement details */}
                    <div className="space-y-3">
                      <h2 className="text-xl font-bold text-gray-800">
                        {achievement.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {achievement.description}
                      </p>
                      
                      {/* Category and rarity */}
                      <div className="flex justify-center gap-2">
                        <Badge className={`text-xs ${getCategoryColor(achievement.category)}`}>
                          {achievement.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getRarityText(achievement.rarity)}
                        </Badge>
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                      <h3 className="font-medium text-sm text-gray-800 mb-2">Rewards Earned</h3>
                      <div className="flex justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>+{achievement.earnedXP} XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-blue-500" />
                          <span>+{achievement.earnedPoints} Points</span>
                        </div>
                      </div>
                    </div>

                    {/* Rarity info */}
                    <div className="text-xs text-gray-500">
                      Only {achievement.rarity}% of players have unlocked this achievement
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      {onShare && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => onShare(achievement)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      )}
                      {onViewBadges && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={onViewBadges}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View All Badges
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}