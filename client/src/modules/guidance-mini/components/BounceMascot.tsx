import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle } from 'lucide-react';

interface BounceMascotProps {
  className?: string;
  initialMessage?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

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
  const bounceTimer = useRef<NodeJS.Timeout | null>(null);
  
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
    
    // Expand the message bubble
    setIsExpanded(true);
    
    // Update the message based on click count
    if (newClicks < 5) {
      setMessage(messages[newClicks - 1]);
      
      // Resume bouncing after a delay
      bounceTimer.current = setTimeout(() => {
        setIsBouncing(true);
      }, 5000);
    } else if (newClicks === 5) {
      // On 5th click, reveal the XP code
      setMessage("You found a secret XP code! Use BOUNCE2025 for 100 XP!");
      setShowXpCode(true);
    } else {
      // Reset after 6+ clicks
      setMessage("Remember to use code BOUNCE2025 for 100 XP! See you around!");
      
      // Resume bouncing after a delay
      bounceTimer.current = setTimeout(() => {
        setIsBouncing(true);
        setIsExpanded(false);
      }, 5000);
    }
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (bounceTimer.current) {
        clearTimeout(bounceTimer.current);
      }
    };
  }, []);
  
  // Handle closing the mascot
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={`fixed ${positionStyles[position]} z-50 flex items-end ${className}`}
      onClick={handleClick}
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
              mb-2 max-w-[250px] relative ${position.includes('left') ? 'mr-2' : 'ml-2'}
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
                ${position === 'bottom-right' ? 'left-3' : position === 'bottom-left' ? 'right-3' : ''}
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
          animate={isBouncing ? {
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0],
          } : {}}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: isBouncing ? Infinity : 0,
          }}
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
            
            {/* Eyes */}
            <circle cx="80" cy="85" r="12" fill="white" />
            <circle cx="120" cy="85" r="12" fill="white" />
            <circle cx="80" cy="85" r="7" fill="black" />
            <circle cx="120" cy="85" r="7" fill="black" />
            <circle cx="83" cy="82" r="3" fill="white" />
            <circle cx="123" cy="82" r="3" fill="white" />
            
            {/* Smile */}
            <path 
              d="M75,110 Q100,135 125,110" 
              fill="none" 
              stroke="black" 
              strokeWidth="5" 
              strokeLinecap="round"
            />
            
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
    </div>
  );
};

export default BounceMascot;