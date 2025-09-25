import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Trading card rarity levels matching our UDF specifications
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type CardType = 'player' | 'coach' | 'facility' | 'event' | 'achievement';
export type CardSize = 'compact' | 'standard' | 'detailed';
export type InteractionMode = 'swipe' | 'tap' | 'view' | 'edit';

interface BaseCardProps {
  cardType: CardType;
  rarity: CardRarity;
  size?: CardSize;
  interactionMode?: InteractionMode;
  animationEnabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
  'data-testid'?: string;
}

// Rarity-based visual styles following UDF Rule 45
const rarityStyles: Record<CardRarity, string> = {
  common: `
    bg-gradient-to-br from-gray-50 to-gray-100 
    border-2 border-gray-200 
    shadow-sm
  `,
  uncommon: `
    bg-gradient-to-br from-blue-50 to-blue-100 
    border-2 border-blue-300 
    shadow-md shadow-blue-100
    [&_.card-glow]:shadow-[0_0_10px_rgba(33,150,243,0.3)]
  `,
  rare: `
    bg-gradient-to-br from-amber-50 to-yellow-100 
    border-2 border-amber-400 
    shadow-lg shadow-amber-200
    [&_.card-glow]:shadow-[0_0_15px_rgba(255,152,0,0.4)]
  `,
  epic: `
    bg-gradient-to-br from-purple-100 to-purple-200 
    border-2 border-purple-500 
    shadow-xl shadow-purple-300
    [&_.card-glow]:shadow-[0_0_20px_rgba(156,39,176,0.5)]
  `,
  legendary: `
    bg-gradient-to-45deg from-red-200 via-blue-200 via-green-200 to-purple-200
    bg-[length:400%_400%]
    animate-[legendary-gradient_6s_ease-in-out_infinite]
    border-3 border-white 
    shadow-2xl shadow-white/60
    [&_.card-glow]:shadow-[0_0_30px_rgba(255,255,255,0.6)]
  `
};

// Card size variations
const sizeStyles: Record<CardSize, string> = {
  compact: 'w-48 h-64', // 3:4 ratio for compact display
  standard: 'w-64 h-80', // Standard trading card proportions
  detailed: 'w-80 h-96' // Larger detailed view
};

export default function BaseCard({
  cardType,
  rarity,
  size = 'standard',
  interactionMode = 'tap',
  animationEnabled = true,
  children,
  className,
  onClick,
  onSwipe,
  'data-testid': testId,
  ...props
}: BaseCardProps) {
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const cardVariants = {
    initial: animationEnabled ? { 
      opacity: 0, 
      scale: 0.9,
      y: 20 
    } : {},
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0 
    },
    whileHover: animationEnabled ? { 
      scale: 1.02,
      y: -2,
      transition: { duration: 0.2 }
    } : {},
    whileTap: animationEnabled ? { 
      scale: 0.98 
    } : {},
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      whileTap="whileTap"
      className={cn(
        // Base card styling
        'relative rounded-xl overflow-hidden cursor-pointer select-none',
        'transition-all duration-200 ease-in-out',
        // Rarity-specific styles
        rarityStyles[rarity],
        // Size-specific styles  
        sizeStyles[size],
        // Custom className
        className
      )}
      onClick={handleClick}
      data-testid={testId || `card-${cardType}-${rarity}`}
      {...props}
    >
      {/* Card glow effect container */}
      <div className="card-glow absolute inset-0 pointer-events-none" />
      
      {/* Card content */}
      <div className="relative z-10 h-full p-4 flex flex-col">
        {children}
      </div>

      {/* Rarity indicator corner */}
      <div className={cn(
        "absolute top-2 right-2 w-3 h-3 rounded-full",
        {
          'bg-gray-400': rarity === 'common',
          'bg-blue-400': rarity === 'uncommon', 
          'bg-amber-400': rarity === 'rare',
          'bg-purple-500': rarity === 'epic',
          'bg-gradient-to-r from-red-400 to-purple-400 animate-pulse': rarity === 'legendary'
        }
      )} />
    </motion.div>
  );
}