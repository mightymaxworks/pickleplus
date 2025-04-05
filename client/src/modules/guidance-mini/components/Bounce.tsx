import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type MascotState = 'idle' | 'talking' | 'celebrating' | 'spinning' | 'bouncing';

interface BounceProps {
  state?: MascotState;
  scale?: number;
  className?: string;
}

/**
 * Bounce - An 8-bit pickleball mascot character
 * 
 * SVG-based character that can be animated with different states
 */
export const Bounce: React.FC<BounceProps> = ({ 
  state = 'idle', 
  scale = 1, 
  className 
}) => {
  // Define animations based on state
  const animations = {
    idle: {
      y: [0, -2, 0],
      transition: {
        y: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }
      }
    },
    talking: {
      y: [0, -1, 0],
      transition: {
        y: {
          duration: 0.3,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear'
        }
      }
    },
    celebrating: {
      y: [0, -10, 0],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        y: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeOut'
        },
        rotate: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }
      }
    },
    spinning: {
      rotate: [0, 360],
      transition: {
        rotate: {
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }
      }
    },
    bouncing: {
      y: [0, -15, 0],
      scale: [1, 1.1, 1],
      transition: {
        y: {
          duration: 0.6,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeOut'
        },
        scale: {
          duration: 0.6,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }
      }
    }
  };

  return (
    <motion.div 
      className={cn('w-16 h-16', className)}
      animate={animations[state]}
      style={{ 
        transformOrigin: 'center bottom',
        transform: `scale(${scale})`
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pickle Ball */}
        <circle cx="32" cy="32" r="28" fill="#D7FC31" stroke="#333333" strokeWidth="2" />
        
        {/* Holes pattern */}
        <circle cx="24" cy="20" r="3" fill="#333333" />
        <circle cx="40" cy="20" r="3" fill="#333333" />
        <circle cx="20" cy="32" r="3" fill="#333333" />
        <circle cx="44" cy="32" r="3" fill="#333333" />
        <circle cx="32" cy="44" r="3" fill="#333333" />
        <circle cx="32" cy="20" r="3" fill="#333333" />
        
        {/* Eyes */}
        <circle cx="26" cy="28" r="4" fill="white" stroke="#333333" strokeWidth="1.5" />
        <circle cx="38" cy="28" r="4" fill="white" stroke="#333333" strokeWidth="1.5" />
        <circle cx="26" cy="28" r="2" fill="#333333" />
        <circle cx="38" cy="28" r="2" fill="#333333" />
        
        {/* Mouth - changes based on state */}
        {state === 'idle' && (
          <path d="M26 36C26 36 30 39 38 36" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'talking' && (
          <path d="M26 36C26 36 30 39 38 36M32 36V41" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'celebrating' && (
          <path d="M26 36C26 36 32 42 38 36" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'spinning' && (
          <path d="M26 36H38" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'bouncing' && (
          <path d="M26 36C26 36 32 40 38 36" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </motion.div>
  );
};

export default Bounce;