import { motion } from 'framer-motion';

interface PicklePlusGamingLogoProps {
  className?: string;
  animated?: boolean;
}

export function PicklePlusGamingLogo({ className = "h-12 w-auto", animated = false }: PicklePlusGamingLogoProps) {
  const LogoContent = animated ? motion.div : 'div';
  
  return (
    <LogoContent
      className={`flex items-center gap-3 ${className}`}
      {...(animated && {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5 }
      })}
    >
      {/* Minimalist Icon - Paddle + Plus Symbol */}
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Paddle shape with modern angular design */}
          <path
            d="M20 4 L32 12 L32 28 L20 36 L8 28 L8 12 Z"
            fill="url(#pickleGradient)"
            stroke="url(#pickleStroke)"
            strokeWidth="2"
          />
          
          {/* Plus symbol integrated into design */}
          <line x1="20" y1="14" x2="20" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <line x1="14" y1="20" x2="26" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round" />
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="pickleGradient" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF5722" />
              <stop offset="100%" stopColor="#E91E63" />
            </linearGradient>
            <linearGradient id="pickleStroke" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6B45" />
              <stop offset="100%" stopColor="#FF4081" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Glow effect for gaming aesthetic */}
        <div className="absolute inset-0 blur-xl opacity-50 bg-gradient-to-r from-orange-500 to-pink-500 -z-10" />
      </div>
      
      {/* Wordmark */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white tracking-tight">PICKLE</span>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">+</span>
        </div>
        <span className="hidden sm:block text-[10px] text-gray-400 tracking-widest uppercase font-medium -mt-1">
          Where Players Become Legends
        </span>
      </div>
    </LogoContent>
  );
}

// Icon-only version for smaller spaces
export function PicklePlusIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 4 L32 12 L32 28 L20 36 L8 28 L8 12 Z"
          fill="url(#pickleGradient)"
          stroke="url(#pickleStroke)"
          strokeWidth="2"
        />
        <line x1="20" y1="14" x2="20" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="20" x2="26" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <defs>
          <linearGradient id="pickleGradient" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF5722" />
            <stop offset="100%" stopColor="#E91E63" />
          </linearGradient>
          <linearGradient id="pickleStroke" x1="8" y1="4" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6B45" />
            <stop offset="100%" stopColor="#FF4081" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 blur-lg opacity-40 bg-gradient-to-r from-orange-500 to-pink-500 -z-10" />
    </div>
  );
}
