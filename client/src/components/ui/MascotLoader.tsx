import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pickleCharacterPath from '@assets/Untitled design (51).png';

// Inspiring pickleball quotes
const pickleballQuotes = [
  "Every great player was once a beginner who refused to give up.",
  "The court is your canvas. Paint it with passion.",
  "In pickleball, age is just a number. Skill is everything.",
  "Champions aren't made in comfort zones.",
  "The best shot is the one you're confident in making.",
  "Pickleball: Where strategy meets athleticism.",
  "Play every point like it's match point.",
  "The net divides the court, but the game unites us all.",
  "Your only limit is your willingness to improve.",
  "Winners focus on winning. Losers focus on winners.",
  "The sweet spot isn't just on the paddle—it's in your mindset.",
  "Every serve is a new opportunity to excel.",
  "Consistency beats power every time.",
  "The game is won between the ears.",
  "Practice doesn't make perfect. Perfect practice makes perfect."
];

interface MascotLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showQuotes?: boolean;
  className?: string;
}

export default function MascotLoader({ 
  message = "Getting things ready...", 
  size = 'md',
  showQuotes = true,
  className = ""
}: MascotLoaderProps) {
  const [currentQuote, setCurrentQuote] = useState(0);

  // Rotate quotes every 3 seconds
  useEffect(() => {
    if (!showQuotes) return;
    
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % pickleballQuotes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [showQuotes]);

  const sizes = {
    sm: { character: 'h-16 w-16', container: 'p-6' },
    md: { character: 'h-24 w-24', container: 'p-8' },
    lg: { character: 'h-32 w-32', container: 'p-12' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${currentSize.container} ${className}`}>
      {/* Animated Mascot */}
      <motion.div
        className="relative mb-6"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Glowing background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full blur-2xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <img 
          src={pickleCharacterPath}
          alt="Pickle Mascot"
          className={`${currentSize.character} object-contain relative z-10`}
        />
        
        {/* Enhanced floating particles with gaming colors */}
        <motion.div
          className="absolute -top-2 -right-2 w-3 h-3 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: 0.5
          }}
        />
        <motion.div
          className="absolute top-1 -left-3 w-2 h-2 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: 1
          }}
        />
      </motion.div>

      {/* Loading Message - Gaming Style */}
      <motion.h3 
        className="text-lg font-semibold text-white mb-2 text-center tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.h3>

      {/* Loading Dots - Gaming Colors */}
      <div className="flex space-x-2 mb-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-lg shadow-orange-500/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      {/* Rotating Quotes - Gaming Theme */}
      {showQuotes && (
        <div className="max-w-md mx-auto h-16 flex items-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center text-gray-400 italic text-sm leading-relaxed"
            >
              "{pickleballQuotes[currentQuote]}"
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* Progress Bar - Gaming Style */}
      <div className="w-full max-w-xs mt-4">
        <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/50">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full shadow-lg shadow-orange-500/50"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Compact version for inline loading states
export function MascotLoaderInline({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center space-x-3 p-4">
      <motion.img 
        src={pickleCharacterPath}
        alt="Loading"
        className="h-8 w-8 object-contain"
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <span className="text-gray-300 text-sm">{message}</span>
    </div>
  );
}

// Full screen overlay loader
export function MascotLoaderOverlay({ 
  message = "Preparing your experience...",
  isVisible = true 
}: { 
  message?: string;
  isVisible?: boolean;
}) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      {/* Animated grid pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#ea580c 1px, transparent 1px), linear-gradient(90deg, #ea580c 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Hexagonal Gaming Frame */}
      <div className="relative">
        <motion.svg 
          width="300" 
          height="300" 
          viewBox="0 0 200 200" 
          className="absolute inset-0 m-auto" 
          style={{ top: '-50px' }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <defs>
            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF5722" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#E91E63" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#9C27B0" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path 
            d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z" 
            fill="none" 
            stroke="url(#hexGradient)" 
            strokeWidth="3" 
            strokeLinecap="round"
            strokeDasharray="10 5"
          />
        </motion.svg>
        
        <MascotLoader message={message} size="lg" />
      </div>
    </motion.div>
  );
}