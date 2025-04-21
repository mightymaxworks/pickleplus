/**
 * PKL-278651-MASCOT-0001-CORE - Bounce Mascot Component
 * 
 * This component displays the Bounce mascot character that appears randomly
 * and interacts with users while they navigate the Pickle+ platform.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageCircle, Lightbulb, ThumbsUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// List of messages Bounce can display
const BOUNCE_MESSAGES = [
  {
    type: 'tip',
    icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
    content: "Did you know you can earn XP by reporting bugs? Try the Bounce testing feature!",
  },
  {
    type: 'tip',
    icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
    content: "The more details you provide in your bug reports, the more XP you can earn!",
  },
  {
    type: 'achievement',
    icon: <Award className="h-4 w-4 text-yellow-500" />,
    content: "You're just 3 verified bug reports away from the Bug Hunter achievement!",
  },
  {
    type: 'encouragement',
    icon: <ThumbsUp className="h-4 w-4 text-green-500" />,
    content: "Great job using Pickle+! The more you participate, the more rewards you'll unlock.",
  },
  {
    type: 'tip',
    icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
    content: "Try validating other users' findings to earn verification XP!",
  },
  {
    type: 'tip',
    icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
    content: "Looking for more XP? You earn points for every minute spent testing!",
  },
  {
    type: 'achievement',
    icon: <Award className="h-4 w-4 text-yellow-500" />,
    content: "Complete 5 test sessions to unlock the Test Pioneer achievement!",
  },
];

// Positions where Bounce can appear
const POSITIONS = [
  { bottom: '20px', right: '20px' }, // Bottom right
  { bottom: '20px', left: '20px' }, // Bottom left
  { top: '100px', right: '20px' }, // Top right
  { top: '100px', left: '20px' }, // Top left
];

interface BounceMascotProps {
  /** Minimum time in ms before Bounce can appear */
  minDelay?: number;
  /** Maximum time in ms before Bounce can appear */
  maxDelay?: number;
  /** Duration in ms that Bounce stays visible */
  displayDuration?: number;
  /** Whether to show Bounce on component mount */
  showOnMount?: boolean;
  /** Probability (0-1) that Bounce will appear after the delay */
  appearProbability?: number;
  /** Path to a custom image to use for the mascot */
  customImagePath?: string;
}

/**
 * BounceMascot component - displays a cute animated mascot character
 * that appears randomly and provides tips, encouragement, and notifications
 */
const BounceMascot: React.FC<BounceMascotProps> = ({
  minDelay = 30000, // Default: 30 seconds minimum
  maxDelay = 120000, // Default: 2 minutes maximum
  displayDuration = 12000, // Default: 12 seconds display time
  showOnMount = false, // Default: don't show immediately
  appearProbability = 0.7, // Default: 70% chance to appear
  customImagePath = undefined, // Default: use SVG
}) => {
  const [visible, setVisible] = useState(showOnMount);
  const [message, setMessage] = useState(BOUNCE_MESSAGES[0]);
  const [position, setPosition] = useState(POSITIONS[0]);
  const [expanded, setExpanded] = useState(false);
  const [isCustomImage] = useState(!!customImagePath);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const disappearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to schedule Bounce's next appearance
  const scheduleAppearance = () => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Calculate random delay within min/max range
    const delay = Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
    
    // Set timeout for appearance
    timeoutRef.current = setTimeout(() => {
      // Only appear based on probability
      if (Math.random() < appearProbability) {
        // Select random message and position
        const randomMessageIndex = Math.floor(Math.random() * BOUNCE_MESSAGES.length);
        const randomPositionIndex = Math.floor(Math.random() * POSITIONS.length);
        
        setMessage(BOUNCE_MESSAGES[randomMessageIndex]);
        setPosition(POSITIONS[randomPositionIndex]);
        setVisible(true);
        setExpanded(false);
        
        // Set timeout to hide after display duration
        if (disappearTimeoutRef.current) {
          clearTimeout(disappearTimeoutRef.current);
        }
        
        disappearTimeoutRef.current = setTimeout(() => {
          setVisible(false);
          scheduleAppearance(); // Schedule next appearance
        }, displayDuration);
      } else {
        // If didn't appear this time, schedule again
        scheduleAppearance();
      }
    }, delay);
  };

  // Start the cycle on component mount
  useEffect(() => {
    if (showOnMount) {
      // If showing on mount, set initial message and position
      const randomMessageIndex = Math.floor(Math.random() * BOUNCE_MESSAGES.length);
      const randomPositionIndex = Math.floor(Math.random() * POSITIONS.length);
      
      setMessage(BOUNCE_MESSAGES[randomMessageIndex]);
      setPosition(POSITIONS[randomPositionIndex]);
      
      // Set timeout to hide after display duration
      disappearTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        scheduleAppearance(); // Schedule next appearance
      }, displayDuration);
    } else {
      // Otherwise just schedule the first appearance
      scheduleAppearance();
    }
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (disappearTimeoutRef.current) {
        clearTimeout(disappearTimeoutRef.current);
      }
    };
  }, []);

  // Handle dismissing the mascot
  const handleDismiss = () => {
    setVisible(false);
    if (disappearTimeoutRef.current) {
      clearTimeout(disappearTimeoutRef.current);
    }
    scheduleAppearance();
  };

  // Handle expanding the message bubble
  const handleToggleExpand = () => {
    setExpanded(!expanded);
    
    // If expanding, reset the disappear timeout
    if (!expanded && disappearTimeoutRef.current) {
      clearTimeout(disappearTimeoutRef.current);
      disappearTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        scheduleAppearance();
      }, displayDuration);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-[9999]"
          style={{ bottom: '20px', right: '20px' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20 
          }}
        >
          <div className="flex flex-col items-end">
            {/* Message bubble */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  className="mb-2 p-4 bg-white rounded-lg shadow-lg max-w-[240px]"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <div className="flex items-start gap-2">
                    {message.icon}
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Mascot and controls */}
            <div className="flex items-end gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200"
                      onClick={handleDismiss}
                    >
                      <X className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Dismiss Bounce</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div 
                className="relative cursor-pointer bg-yellow-300 p-3 rounded-full shadow-md overflow-hidden"
                onClick={handleToggleExpand}
                style={{ width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="text-4xl font-bold">🎾</div>
                </div>
                <img 
                  src={customImagePath || "/pickleball-mascot.svg"} 
                  alt="Bounce Mascot" 
                  className="h-24 w-24 object-contain relative z-10"
                  onError={(e) => {
                    // If image fails to load, hide it and show emoji fallback
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {!expanded && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    <MessageCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BounceMascot;