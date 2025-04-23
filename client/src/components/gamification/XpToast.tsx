/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * XP Toast Component
 * 
 * This component displays an animated toast notification when users earn XP points.
 */

import React from 'react';
import { Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface XpToastProps {
  xpAmount: number;
  message?: string;
  onDismiss?: () => void;
}

const XpToast: React.FC<XpToastProps> = ({ 
  xpAmount, 
  message = "XP Earned!", 
  onDismiss 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.7 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        // Auto-dismiss after 3 seconds
        const timer = setTimeout(() => {
          if (onDismiss) onDismiss();
        }, 3000);
        return () => clearTimeout(timer);
      }}
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-yellow-300 p-4 text-black shadow-lg"
    >
      <div className="flex items-center space-x-2">
        <Award className="h-6 w-6 text-white" />
        <div>
          <div className="text-lg font-bold text-white">+{xpAmount} XP</div>
          <div className="text-sm text-amber-100">{message}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default XpToast;