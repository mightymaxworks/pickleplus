import React, { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  tiltAmount?: number;
  glowAmount?: number;
  perspective?: number;
  hoverScale?: number;
  glowOnHover?: boolean;
  glowAlways?: boolean;
  onClick?: () => void;
}

/**
 * TiltCard Component
 * 
 * An interactive card component that tilts based on mouse/touch position with optional
 * glow effects and depth through shadows.
 * 
 * Part of the MATCH-UI-278651[ENHANCE] implementation.
 */
export function TiltCard({
  children,
  className = '',
  glowColor = 'rgba(255, 87, 34, 0.35)', // Pickle+ orange with transparency
  tiltAmount = 5,
  glowAmount = 20,
  perspective = 800,
  hoverScale = 1.02,
  glowOnHover = true,
  glowAlways = false,
  onClick
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring animations
  const springConfig = { damping: 20, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  
  // Transform x/y to rotations (scale down the rotation for a subtle effect)
  const rotateX = useTransform(ySpring, [tiltAmount, -tiltAmount], [-tiltAmount, tiltAmount]);
  const rotateY = useTransform(xSpring, [-tiltAmount, tiltAmount], [-tiltAmount, tiltAmount]);
  
  // Handle mouse move for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to card
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Convert to percentage from center for tilt calculation
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Update motion values
    x.set(mouseX / (rect.width / 2) * tiltAmount);
    y.set(mouseY / (rect.height / 2) * tiltAmount);
  };
  
  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    setIsHovering(false);
    x.set(0);
    y.set(0);
  };
  
  // Set hover state on mouse enter
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  // Calculate whether glow should be visible
  const shouldShowGlow = (glowAlways || (glowOnHover && isHovering));
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-lg overflow-hidden cursor-pointer transition-shadow duration-300',
        shouldShowGlow ? 'shadow-lg' : 'shadow-md',
        className
      )}
      style={{
        perspective: perspective,
        transformStyle: 'preserve-3d',
        rotateX: rotateX,
        rotateY: rotateY,
      }}
      whileHover={{ scale: hoverScale }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {/* Glow effect */}
      {shouldShowGlow && (
        <motion.div 
          className="absolute inset-0 rounded-lg pointer-events-none z-0"
          style={{
            background: `radial-gradient(
              circle at 
              ${isHovering ? ((x.get() / tiltAmount) * 0.5 + 0.5) * 100 : 50}% 
              ${isHovering ? ((y.get() / tiltAmount) * 0.5 + 0.5) * 100 : 50}%, 
              ${glowColor}, 
              transparent ${glowAmount + 50}%
            )`,
            opacity: isHovering ? 1 : 0.7,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: shouldShowGlow ? (isHovering ? 1 : 0.7) : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default TiltCard;