/**
 * PKL-278651-XP-0002-UI
 * Level Up Notification Component
 * 
 * This component displays a modal notification when a user levels up.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, ChevronUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LevelUpNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  previousLevel: number;
  perks: string[];
  isKeyMilestone: boolean;
}

const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  isOpen,
  onClose,
  level,
  previousLevel,
  perks,
  isKeyMilestone
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="relative">
              <div 
                className={`py-8 px-6 text-center relative overflow-hidden ${
                  isKeyMilestone ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                }`}
              >
                {/* Background effect */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(20)].map((_, i) => (
                    <Star 
                      key={i}
                      className="absolute text-white" 
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        fontSize: `${Math.random() * 20 + 10}px`,
                        opacity: Math.random() * 0.5 + 0.2,
                        transform: `rotate(${Math.random() * 360}deg)`
                      }}
                    />
                  ))}
                </div>
                
                {/* Level badge */}
                <div className="relative mb-2 inline-flex rounded-full bg-white/20 p-2">
                  <div className="rounded-full bg-white p-2 text-blue-600">
                    <Award className="h-6 w-6" />
                  </div>
                </div>
                
                {/* Level up text */}
                <h2 className="text-white text-2xl font-bold mb-1">Level Up!</h2>
                <div className="flex items-center justify-center text-white">
                  <span className="text-lg font-medium">{previousLevel}</span>
                  <ChevronUp className="mx-2" />
                  <span className="text-3xl font-bold">{level}</span>
                </div>
                
                {/* Close button */}
                <button 
                  onClick={onClose}
                  className="absolute top-2 right-2 text-white/70 hover:text-white p-1"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">
                Congratulations! You've reached Level {level}
              </h3>
              
              {isKeyMilestone && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-800 text-sm font-medium">
                    <Star className="h-4 w-4 inline-block mr-1 text-amber-500" />
                    This is a key milestone level!
                  </p>
                </div>
              )}
              
              {perks.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">New Perks Unlocked:</h4>
                  <ul className="space-y-2">
                    {perks.map((perk, index) => (
                      <li key={index} className="flex items-center">
                        <div className="mr-2 h-5 w-5 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <ChevronUp className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-sm">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Keep playing to earn more XP and unlock additional features!
                </p>
                <Button onClick={onClose} className="w-full">
                  Continue
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpNotification;