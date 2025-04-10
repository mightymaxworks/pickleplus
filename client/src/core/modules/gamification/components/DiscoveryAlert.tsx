/**
 * PKL-278651-GAME-0001-MOD
 * DiscoveryAlert Component
 * 
 * This component displays an alert when a discovery is made.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Award, Star, Zap } from 'lucide-react';
import type { DiscoveryNotification } from '../api/types';

interface DiscoveryAlertProps {
  notification: DiscoveryNotification;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
}

const DiscoveryAlert: React.FC<DiscoveryAlertProps> = ({
  notification,
  onClose,
  autoHide = notification.autoHide ?? true,
  duration = notification.duration ?? 5000,
}) => {
  const [visible, setVisible] = useState(true);
  
  // Auto-hide after duration
  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, visible, onClose]);
  
  // Handle close button click
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  // Determine the icon based on notification level
  const getIcon = () => {
    switch (notification.level) {
      case 'success':
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 'special':
        return <Award className="h-6 w-6 text-purple-500" />;
      case 'info':
        return <Star className="h-6 w-6 text-blue-400" />;
      default:
        return <Zap className="h-6 w-6 text-orange-500" />;
    }
  };
  
  // Determine the background color based on notification level
  const getBgColor = () => {
    switch (notification.level) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'special':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default:
        return 'bg-gradient-to-r from-orange-500 to-orange-600';
    }
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 30
          }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className={`${getBgColor()} rounded-lg shadow-lg overflow-hidden`}>
            <div className="px-4 py-3 flex items-start">
              <div className="flex-shrink-0 bg-white/20 rounded-full p-2 mr-3">
                {getIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">
                  {notification.title}
                </h3>
                <p className="text-white/90 text-sm">
                  {notification.message}
                </p>
                
                {notification.reward && (
                  <div className="mt-2 bg-white/10 rounded p-2 flex items-center">
                    <div className="bg-white/20 rounded-full p-1.5 mr-2">
                      <Star className="h-4 w-4 text-yellow-300" />
                    </div>
                    <div className="text-xs text-white">
                      <span className="font-bold">{notification.reward.name}:</span> {notification.reward.description}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleClose}
                className="ml-3 flex-shrink-0 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {notification.imageUrl && (
              <div className="px-4 pb-3">
                <img 
                  src={notification.imageUrl} 
                  alt="Discovery" 
                  className="w-full rounded-md border border-white/20"
                />
              </div>
            )}
            
            <div className="h-1 w-full bg-white/20">
              <motion.div 
                className="h-full bg-white/40"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DiscoveryAlert;