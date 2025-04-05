import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle } from 'lucide-react';

interface BounceMascotProps {
  className?: string;
  initialMessage?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

// Facial expression types
type Expression = 'normal' | 'happy' | 'excited' | 'surprised' | 'wink';
// Animation pattern types
type AnimationPattern = 'normal' | 'excited' | 'wobble' | 'spin' | 'breathe';

/**
 * Interactive Bounce mascot that responds to clicks and reveals an XP code
 * after 5 clicks
 */
export const BounceMascot: React.FC<BounceMascotProps> = ({
  className = '',
  initialMessage = "Hi! I'm Bounce! Click me for tips!",
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [message, setMessage] = useState(initialMessage);
  const [showXpCode, setShowXpCode] = useState(false);
  const [isBouncing, setIsBouncing] = useState(true);
  const [currentPosition, setCurrentPosition] = useState<string>(position);
  const [expression, setExpression] = useState<Expression>('normal');
  const [animationPattern, setAnimationPattern] = useState<AnimationPattern>('normal');
  
  // Refs for timers
  const bounceTimer = useRef<NodeJS.Timeout | null>(null);
  const expressionTimer = useRef<NodeJS.Timeout | null>(null);
  const behaviorTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Random tips and fun facts about pickleball
  const randomTips = [
    "Try to keep your paddle up and ready when playing at the kitchen line!",
    "The 'kitchen' in pickleball is the 7-foot non-volley zone near the net.",
    "Pickleball was invented in 1965 on Bainbridge Island, Washington!",
    "A 'dink' is a soft shot that just clears the net into the kitchen.",
    "When serving, your paddle must make contact with the ball below your waist.",
    "Pickleball is the fastest growing sport in America for three years running!",
    "Track your matches in Pickle+ to see your improvement over time!",
    "Did you know? Pickleball was named after one inventor's dog, Pickles!",
    "The 'erne' shot is when a player jumps around the kitchen to volley.",
    "Want to find playing partners? Check out the Connections feature!",
  ];
  
  // Greeting messages when the mascot first appears
  const greetings = [
    "Hi there! I'm Bounce!",
    "Hello pickleball friend!",
    "Hey! Ready to play?",
    "Welcome to Pickle+!",
    "Let's dink around!",
  ];
  
  // Messages for different click counts
  const messages = [
    "Oh hey! You found me! I'm Bounce!",
    "Welcome to Pickle+! I'm here to help!",
    "Did you know you can track all your pickleball matches here?",
    "One more click and I'll show you something special!",
  ];
  
  // Position styles
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };
  
  // Randomly change expressions periodically
  useEffect(() => {
    const changeExpression = () => {
      // Only change expressions if not in conversation mode
      if (!isExpanded) {
        const expressions: Expression[] = ['normal', 'happy', 'excited', 'surprised', 'wink'];
        const newExpression = expressions[Math.floor(Math.random() * expressions.length)];
        setExpression(newExpression);
        
        // If winking, change back to normal after a short time
        if (newExpression === 'wink') {
          setTimeout(() => setExpression('normal'), 600);
        }
      }
      
      // Set next timer with random interval (3-10 seconds)
      const nextInterval = Math.floor(Math.random() * 7000) + 3000;
      expressionTimer.current = setTimeout(changeExpression, nextInterval);
    };
    
    // Initial random expression change (after 2-5 seconds)
    expressionTimer.current = setTimeout(changeExpression, Math.floor(Math.random() * 3000) + 2000);
    
    return () => {
      if (expressionTimer.current) {
        clearTimeout(expressionTimer.current);
      }
    };
  }, [isExpanded]);
  
  // Random behaviors (position changes, animation patterns)
  useEffect(() => {
    const randomBehavior = () => {
      // 10% chance to change position if not in conversation
      if (!isExpanded && Math.random() < 0.1) {
        const positions = Object.keys(positionStyles);
        const newPosition = positions[Math.floor(Math.random() * positions.length)];
        setCurrentPosition(newPosition as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left');
      }
      
      // 30% chance to change animation pattern if not in conversation
      if (!isExpanded && Math.random() < 0.3) {
        const patterns: AnimationPattern[] = ['normal', 'excited', 'wobble', 'spin', 'breathe'];
        setAnimationPattern(patterns[Math.floor(Math.random() * patterns.length)]);
        
        // Reset to normal animation after a while for some patterns
        if (['excited', 'spin', 'wobble'].includes(animationPattern)) {
          setTimeout(() => setAnimationPattern('normal'), 5000);
        }
      }
      
      // 5% chance to show a random tip if not already showing message
      if (!isExpanded && Math.random() < 0.05) {
        setMessage(randomTips[Math.floor(Math.random() * randomTips.length)]);
        setIsExpanded(true);
        setIsBouncing(false);
        
        // Hide message after a longer delay
        setTimeout(() => {
          setIsExpanded(false);
          setIsBouncing(true);
        }, 8000);
      }
      
      // Set next behavior check in 5-15 seconds
      const nextInterval = Math.floor(Math.random() * 10000) + 5000;
      behaviorTimer.current = setTimeout(randomBehavior, nextInterval);
    };
    
    // Initial random behavior after 5-10 seconds
    behaviorTimer.current = setTimeout(randomBehavior, Math.floor(Math.random() * 5000) + 5000);
    
    // Set initial greeting message (50% chance)
    if (Math.random() < 0.5) {
      setMessage(greetings[Math.floor(Math.random() * greetings.length)]);
      setIsExpanded(true);
      
      // Hide initial greeting after 4 seconds
      setTimeout(() => {
        setIsExpanded(false);
      }, 4000);
    }
    
    return () => {
      if (behaviorTimer.current) {
        clearTimeout(behaviorTimer.current);
      }
    };
  }, [isExpanded, animationPattern]);
  
  // Handle clicks on the mascot
  const handleClick = () => {
    // Increment click counter
    const newClicks = clicks + 1;
    setClicks(newClicks);
    
    // Stop bouncing animation temporarily
    setIsBouncing(false);
    if (bounceTimer.current) {
      clearTimeout(bounceTimer.current);
    }
    
    // Change expression to excited or happy
    setExpression(Math.random() > 0.5 ? 'excited' : 'happy');
    
    // Expand the message bubble
    setIsExpanded(true);
    
    // Update the message based on click count
    if (newClicks < 5) {
      setMessage(messages[newClicks - 1]);
      
      // Resume bouncing after a delay
      bounceTimer.current = setTimeout(() => {
        setIsBouncing(true);
        setExpression('normal');
      }, 5000);
    } else if (newClicks === 5) {
      // On 5th click, reveal the XP code
      setMessage("You found a secret XP code! Use BOUNCE2025 for 100 XP!");
      setShowXpCode(true);
      setExpression('excited'); // Keep excited expression for the reward
    } else {
      // Reset after 6+ clicks
      setMessage("Remember to use code BOUNCE2025 for 100 XP! See you around!");
      
      // Resume bouncing after a delay
      bounceTimer.current = setTimeout(() => {
        setIsBouncing(true);
        setIsExpanded(false);
        setExpression('normal');
      }, 5000);
    }
  };
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (bounceTimer.current) clearTimeout(bounceTimer.current);
      if (expressionTimer.current) clearTimeout(expressionTimer.current);
      if (behaviorTimer.current) clearTimeout(behaviorTimer.current);
    };
  }, []);
  
  // Handle closing the mascot
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };
  
  // Get animation based on current pattern
  const getAnimation = () => {
    switch (animationPattern) {
      case 'excited':
        return {
          y: [0, -15, -5, -12, 0],
          rotate: [0, 8, -8, 5, 0],
        };
      case 'wobble':
        return {
          rotate: [0, 15, 0, -15, 0],
          x: [0, 5, 0, -5, 0],
        };
      case 'spin':
        return {
          rotate: [0, 180, 360],
        };
      case 'breathe':
        return {
          scale: [1, 1.1, 1],
        };
      case 'normal':
      default:
        return {
          y: [0, -10, 0],
          rotate: [0, 5, 0, -5, 0],
        };
    }
  };
  
  // Get animation transition based on pattern
  const getTransition = () => {
    switch (animationPattern) {
      case 'excited':
        return {
          duration: 1.5,
          ease: "easeInOut",
          repeat: isBouncing ? Infinity : 0,
        };
      case 'wobble':
        return {
          duration: 2.5,
          ease: "easeInOut",
          repeat: isBouncing ? Infinity : 0,
        };
      case 'spin':
        return {
          duration: 2,
          ease: "easeInOut",
          repeat: isBouncing ? Infinity : 0,
        };
      case 'breathe':
        return {
          duration: 3,
          ease: "easeInOut",
          repeat: isBouncing ? Infinity : 0,
        };
      case 'normal':
      default:
        return {
          duration: 2,
          ease: "easeInOut",
          repeat: isBouncing ? Infinity : 0,
        };
    }
  };
  
  // Function to get the appropriate facial expression SVG elements
  const getFacialExpression = () => {
    switch (expression) {
      case 'happy':
        return (
          <>
            {/* Happier smile with raised edges */}
            <path 
              d="M75,105 Q100,140 125,105" 
              fill="none" 
              stroke="black" 
              strokeWidth="5" 
              strokeLinecap="round"
            />
            {/* Slightly curved eyes for happy look */}
            <path d="M75,82 Q80,78 85,82" stroke="black" strokeWidth="2.5" fill="none" />
            <path d="M115,82 Q120,78 125,82" stroke="black" strokeWidth="2.5" fill="none" />
          </>
        );
      case 'excited':
        return (
          <>
            {/* Big open mouth */}
            <ellipse cx="100" cy="115" rx="20" ry="15" fill="black" />
            <ellipse cx="100" cy="115" rx="15" ry="10" fill="#FF3D00" />
            {/* Raised eyebrows */}
            <path d="M72,78 Q80,72 88,78" stroke="black" strokeWidth="2" fill="none" />
            <path d="M112,78 Q120,72 128,78" stroke="black" strokeWidth="2" fill="none" />
          </>
        );
      case 'surprised':
        return (
          <>
            {/* Small round mouth */}
            <circle cx="100" cy="115" r="10" fill="black" />
            <circle cx="100" cy="115" r="7" fill="#FF3D00" />
            {/* Wide eyes */}
            <circle cx="80" cy="85" r="14" fill="white" />
            <circle cx="120" cy="85" r="14" fill="white" />
            <circle cx="80" cy="85" r="8" fill="black" />
            <circle cx="120" cy="85" r="8" fill="black" />
          </>
        );
      case 'wink':
        return (
          <>
            {/* Normal smile */}
            <path 
              d="M75,110 Q100,135 125,110" 
              fill="none" 
              stroke="black" 
              strokeWidth="5" 
              strokeLinecap="round"
            />
            {/* One normal eye, one winking */}
            <circle cx="120" cy="85" r="12" fill="white" />
            <circle cx="120" cy="85" r="7" fill="black" />
            <circle cx="123" cy="82" r="3" fill="white" />
            <path d="M72,85 Q80,90 88,85" stroke="black" strokeWidth="3" fill="none" />
          </>
        );
      case 'normal':
      default:
        return (
          <>
            {/* Default smile */}
            <path 
              d="M75,110 Q100,135 125,110" 
              fill="none" 
              stroke="black" 
              strokeWidth="5" 
              strokeLinecap="round"
            />
            {/* Default eyes */}
            <circle cx="80" cy="85" r="12" fill="white" />
            <circle cx="120" cy="85" r="12" fill="white" />
            <circle cx="80" cy="85" r="7" fill="black" />
            <circle cx="120" cy="85" r="7" fill="black" />
            <circle cx="83" cy="82" r="3" fill="white" />
            <circle cx="123" cy="82" r="3" fill="white" />
          </>
        );
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div 
      className={`fixed ${positionStyles[currentPosition]} z-50 flex items-end ${className}`}
      onClick={handleClick}
      animate={{ 
        x: currentPosition !== position ? [50, 0] : 0,
        opacity: currentPosition !== position ? [0, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut"
      }}
    >
      {/* Message Bubble */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className={`
              bg-white rounded-xl p-3 shadow-lg border-2 border-[#FF5722] 
              mb-2 max-w-[250px] relative ${currentPosition.includes('left') ? 'mr-2' : 'ml-2'}
            `}
          >
            <div className="text-sm text-gray-700">
              {message}
              
              {showXpCode && (
                <div className="mt-2 bg-[#FF5722]/10 p-2 rounded-md border border-[#FF5722]/30">
                  <div className="font-bold text-[#FF5722] flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>XP CODE</span>
                  </div>
                  <div className="bg-black/5 text-center font-mono font-bold p-1 rounded mt-1">
                    BOUNCE2025
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">Worth 100 XP!</div>
                </div>
              )}
            </div>
            
            {/* Triangle Pointer */}
            <div 
              className={`
                absolute -bottom-2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-[#FF5722]
                ${currentPosition === 'bottom-right' ? 'left-3' : 
                  currentPosition === 'bottom-left' ? 'right-3' : 
                  currentPosition === 'top-right' ? 'left-3 -top-2 rotate-[225deg] border-l-2 border-t-2 border-r-0 border-b-0' :
                  'right-3 -top-2 rotate-[225deg] border-l-2 border-t-2 border-r-0 border-b-0'}
              `}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mascot SVG */}
      <div className="relative">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-white rounded-full z-10 text-gray-500 hover:text-gray-700"
        >
          <XCircle size={18} />
        </button>
        
        {/* The actual mascot */}
        <motion.div
          animate={isBouncing ? getAnimation() : {}}
          transition={getTransition()}
          className="cursor-pointer"
        >
          <svg 
            width="72" 
            height="72" 
            viewBox="0 0 200 200" 
            className="drop-shadow-xl"
          >
            {/* Main ball body - orange pickleball */}
            <circle cx="100" cy="100" r="80" fill="#FF5722" />
            <circle cx="100" cy="100" r="75" fill="#FF7043" />
            
            {/* Pickleball holes pattern */}
            <circle cx="70" cy="70" r="8" fill="#FF5722" />
            <circle cx="100" cy="60" r="8" fill="#FF5722" />
            <circle cx="130" cy="70" r="8" fill="#FF5722" />
            <circle cx="140" cy="100" r="8" fill="#FF5722" />
            <circle cx="130" cy="130" r="8" fill="#FF5722" />
            <circle cx="100" cy="140" r="8" fill="#FF5722" />
            <circle cx="70" cy="130" r="8" fill="#FF5722" />
            <circle cx="60" cy="100" r="8" fill="#FF5722" />
            
            {/* Dynamic facial expressions */}
            {getFacialExpression()}
            
            {/* Pixelated "8-bit" style effect */}
            <g opacity="0.2">
              <rect x="65" y="65" width="10" height="10" fill="#FFFFFF" />
              <rect x="125" y="65" width="10" height="10" fill="#FFFFFF" />
              <rect x="95" y="125" width="10" height="10" fill="#FFFFFF" />
              <rect x="65" y="95" width="10" height="10" fill="#FFFFFF" />
              <rect x="125" y="95" width="10" height="10" fill="#FFFFFF" />
            </g>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BounceMascot;