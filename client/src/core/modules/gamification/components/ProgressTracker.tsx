/**
 * PKL-278651-GAME-0001-MOD
 * ProgressTracker Component
 * 
 * This component displays campaign progress with animations and visual indicators.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle } from 'lucide-react';

// Types for the component props
export interface Campaign {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  totalDiscoveries: number;
  discoveredCount: number;
  completionPercentage: number;
  isComplete: boolean;
}

export interface ProgressTrackerProps {
  campaign: Campaign | null;
  onSelect?: (campaignId: number) => void;
  minimal?: boolean;
}

/**
 * ProgressTracker Component
 * 
 * Displays progress for discovery campaigns with visual indicators
 */
const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  campaign,
  onSelect,
  minimal = false
}) => {
  if (!campaign) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center text-gray-500 text-sm">
        No active campaign found
      </div>
    );
  }
  
  // Determine progress color
  const getProgressColor = () => {
    const { completionPercentage } = campaign;
    if (completionPercentage >= 100) return 'bg-green-500';
    if (completionPercentage >= 75) return 'bg-blue-500';
    if (completionPercentage >= 50) return 'bg-yellow-500';
    if (completionPercentage >= 25) return 'bg-orange-500';
    return 'bg-gray-500';
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  const progressVariants = {
    hidden: { width: 0 },
    visible: { 
      width: `${campaign.completionPercentage}%`,
      transition: { duration: 0.8, ease: 'easeOut', delay: 0.5 }
    }
  };
  
  // Handle campaign selection
  const handleSelect = () => {
    if (onSelect) {
      onSelect(campaign.id);
    }
  };
  
  // Render minimal version (just progress bar)
  if (minimal) {
    return (
      <div 
        className="w-full rounded-full h-2 bg-gray-200 overflow-hidden"
        onClick={handleSelect}
      >
        <motion.div 
          className={`h-full ${getProgressColor()}`}
          initial="hidden"
          animate="visible"
          variants={progressVariants}
        />
      </div>
    );
  }
  
  // Render full version
  return (
    <motion.div 
      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow transition-all"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onClick={handleSelect}
    >
      <motion.div className="flex items-center mb-3" variants={itemVariants}>
        {campaign.isComplete ? (
          <Trophy className="text-yellow-500 mr-2" size={20} />
        ) : (
          <Trophy className="text-gray-400 mr-2" size={20} />
        )}
        <h3 className="font-bold text-gray-900">{campaign.name}</h3>
        
        {campaign.isComplete && (
          <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
            <CheckCircle size={12} className="mr-1" />
            Complete
          </span>
        )}
      </motion.div>
      
      <motion.p className="text-sm text-gray-600 mb-4" variants={itemVariants}>
        {campaign.description}
      </motion.p>
      
      <motion.div variants={itemVariants}>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{campaign.discoveredCount} of {campaign.totalDiscoveries} discovered</span>
          <span>{campaign.completionPercentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div 
            className={`h-full ${getProgressColor()}`}
            initial="hidden"
            animate="visible"
            variants={progressVariants}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgressTracker;