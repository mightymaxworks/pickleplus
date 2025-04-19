/**
 * PKL-278651-XP-0002-UI
 * Level Up Notification Component
 * 
 * Displays an animated notification when a user levels up with celebration effects.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award, X, Sparkles } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LevelUpNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  previousLevel: number;
  perks?: string[];
  isKeyMilestone?: boolean;
}

/**
 * LevelUpNotification Component
 * 
 * Displays an animated celebration when a user levels up
 */
const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  isOpen,
  onClose,
  level,
  previousLevel,
  perks = [],
  isKeyMilestone = false
}) => {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  
  // Trigger confetti effect when component mounts if it's open
  useEffect(() => {
    if (isOpen && !hasTriggeredConfetti) {
      // Different confetti effects based on level milestone
      if (level % 25 === 0) {
        // Major milestone (levels 25, 50, 75, 100) - extra celebratory
        triggerMajorConfetti();
      } else if (level % 10 === 0) {
        // Medium milestone (levels 10, 20, 30...) - medium celebration
        triggerMediumConfetti();
      } else {
        // Regular level up - subtle confetti
        triggerRegularConfetti();
      }
      
      setHasTriggeredConfetti(true);
    }
    
    // Reset the flag when the modal closes
    if (!isOpen) {
      setHasTriggeredConfetti(false);
    }
  }, [isOpen, level, hasTriggeredConfetti]);
  
  // Major milestone confetti
  const triggerMajorConfetti = () => {
    // Fire multiple bursts of confetti for major milestones
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#9370DB', '#4169E1'],
          gravity: 0.8,
          scalar: 1.2
        });
      }, i * 300);
    }
  };
  
  // Medium milestone confetti
  const triggerMediumConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#9370DB', '#4169E1', '#32CD32', '#48D1CC'],
      gravity: 0.8
    });
  };
  
  // Regular level up confetti
  const triggerRegularConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#32CD32', '#48D1CC', '#3CB371'],
      gravity: 0.8
    });
  };
  
  // Determine badge style based on level
  const getBadgeStyle = () => {
    if (level >= 75) return "bg-purple-100 text-purple-800 border-purple-200";
    if (level >= 50) return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (level >= 25) return "bg-blue-100 text-blue-800 border-blue-200";
    if (level >= 10) return "bg-green-100 text-green-800 border-green-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
  };
  
  // Get rank name based on level
  const getRankName = () => {
    if (level >= 75) return "Master";
    if (level >= 50) return "Expert";
    if (level >= 25) return "Veteran";
    if (level >= 10) return "Skilled";
    return "Rookie";
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            // Close when clicking the backdrop
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="max-w-sm w-full"
          >
            <Card className="border-2 border-amber-300 bg-gradient-to-b from-white to-amber-50 shadow-xl">
              <CardHeader className="relative pb-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex justify-center mb-2">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 15,
                      delay: 0.2
                    }}
                  >
                    <div className="relative">
                      <Award className="h-16 w-16 text-amber-500" />
                      {isKeyMilestone && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute -top-2 -right-2"
                        >
                          <Sparkles className="h-6 w-6 text-purple-500" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                <CardTitle className="text-center text-xl">
                  Level Up!
                </CardTitle>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <p className="text-gray-700">
                    You've reached
                  </p>
                  <div className="flex justify-center items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold text-amber-700">Level {level}</span>
                    <Badge variant="outline" className={getBadgeStyle()}>
                      {getRankName()}
                    </Badge>
                  </div>
                </motion.div>
              </CardHeader>
              
              <CardContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-gray-500 text-sm"
                >
                  {isKeyMilestone 
                    ? <p>You've reached a key milestone level! New rewards unlocked.</p>
                    : <p>Keep earning XP to unlock more rewards and reach the next level!</p>
                  }
                </motion.div>
                
                {perks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-4"
                  >
                    <p className="text-center text-sm font-medium text-gray-700 mb-2">
                      New perks unlocked:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {perks.map((perk, i) => (
                        <Badge key={i} variant="secondary" className="animate-pulse">
                          {perk}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
              
              <CardFooter className="justify-center pb-4">
                <Button onClick={onClose} className="px-8">
                  Continue
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpNotification;