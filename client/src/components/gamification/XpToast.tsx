/**
 * PKL-278651-PROF-0024-COMP - Pickle Points Toast Component
 * 
 * Animated toast notification for displaying Pickle Points rewards.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-30
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';

interface PicklePointsToastProps {
  amount: number;
  message?: string;
}

export default function PicklePointsToast({ amount, message }: PicklePointsToastProps) {
  const [particles, setParticles] = useState<{ x: number, y: number, scale: number, opacity: number }[]>([]);
  
  // Generate particles for the Pickle Points award animation
  useEffect(() => {
    const newParticles = Array.from({ length: Math.min(10, amount / 5) }, () => ({
      x: Math.random() * 40 - 20,
      y: Math.random() * -30 - 10,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.5
    }));
    
    setParticles(newParticles);
  }, [amount]);
  
  return (
    <motion.div 
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div className="bg-primary/20 rounded-full p-2 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        
        {/* Animated particles */}
        <AnimatePresence>
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-primary rounded-full"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: particle.scale,
                opacity: particle.opacity
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </div>
      
      <div className="flex flex-col">
        <motion.div 
          className="flex items-center gap-1.5 font-medium"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-yellow-500">+{amount} Pickle Points</span>
        </motion.div>
        
        {message && (
          <motion.p 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}