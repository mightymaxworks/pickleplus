/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * BounceTestingModeToggle - A component that toggles the Bounce testing mode
 * and displays its current status. Can be placed in strategic locations in the UI.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Power } from 'lucide-react';
import { useGuidedTask } from '@/contexts/BounceGuidedTaskContext';
import { useBounceAwareness } from '@/hooks/use-bounce-awareness';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BounceTestingModeToggleProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const BounceTestingModeToggle: React.FC<BounceTestingModeToggleProps> = ({
  className = '',
  variant = 'full'
}) => {
  const { isTestingModeActive, setTestingMode, setFloatingWidgetVisibility } = useGuidedTask();
  const { isActive: isBounceActive, joinTesting } = useBounceAwareness();
  const { toast } = useToast();
  
  const handleToggle = () => {
    const newStatus = !isTestingModeActive;
    
    // If activating, also activate the Bounce integration
    if (newStatus && !isBounceActive) {
      joinTesting();
      toast({
        title: "Testing Mode Activated",
        description: "You'll now receive assistance requests from Bounce to help test the system.",
        duration: 3000,
      });
    }
    
    // Update testing mode status
    setTestingMode(newStatus);
    
    // Show floating widget when activating
    if (newStatus) {
      setFloatingWidgetVisibility(true);
    }
  };
  
  // Compact version - just a button with status indicator
  if (variant === 'compact') {
    return (
      <Button
        variant={isTestingModeActive ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        className={`relative ${className}`}
      >
        <div className={`absolute w-2 h-2 rounded-full ${
          isTestingModeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        } -top-0.5 -right-0.5`} />
        <Bot className="h-4 w-4" />
      </Button>
    );
  }
  
  // Full version with text and animation
  return (
    <motion.div
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`flex items-center ${className}`}
    >
      <Button
        variant={isTestingModeActive ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
        className="relative flex items-center"
      >
        <Bot className="h-4 w-4 mr-1.5" />
        <span>{isTestingModeActive ? 'Testing Active' : 'Start Testing'}</span>
        <div className={`ml-1.5 w-2 h-2 rounded-full ${
          isTestingModeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`} />
      </Button>
    </motion.div>
  );
};