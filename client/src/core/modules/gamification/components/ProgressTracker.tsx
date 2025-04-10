/**
 * PKL-278651-GAME-0001-MOD
 * ProgressTracker Component
 * 
 * This component displays a user's progress in discovering content.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Trophy, Lightbulb, HelpCircle } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDiscoveryTracking } from '../hooks';

interface ProgressTrackerProps {
  campaignId?: number;
  title?: string;
  description?: string;
  onRequestHint?: () => void;
  showHints?: boolean;
  className?: string;
  compact?: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  campaignId,
  title = "Discovery Progress",
  description = "Track your explorations and findings",
  onRequestHint,
  showHints = true,
  className = '',
  compact = false
}) => {
  const { 
    totalDiscoveries, 
    discoveredCount, 
    completionPercentage, 
    isComplete,
    getNextHint
  } = useDiscoveryTracking({ campaignId });
  
  // Get appropriate message based on completion percentage
  const getMessage = () => {
    if (isComplete) {
      return "Congratulations! You've found all the hidden discoveries in this campaign!";
    } else if (completionPercentage >= 75) {
      return "You're almost there! Just a few more discoveries to find.";
    } else if (completionPercentage >= 50) {
      return "Great progress! Keep exploring to uncover more secrets.";
    } else if (completionPercentage >= 25) {
      return "You're on your way! Continue exploring to find more discoveries.";
    } else {
      return "Your journey has just begun. Explore the app to uncover hidden features!";
    }
  };
  
  // Get icon and color based on completion
  const getStatusConfig = () => {
    if (isComplete) {
      return {
        icon: <Trophy className="h-5 w-5" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
      };
    } else if (completionPercentage >= 50) {
      return {
        icon: <Search className="h-5 w-5" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
      };
    } else {
      return {
        icon: <Search className="h-5 w-5" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
      };
    }
  };
  
  const statusConfig = getStatusConfig();
  const hint = getNextHint();
  
  if (compact) {
    // Compact display
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className={`${statusConfig.bgColor} ${statusConfig.color} p-2 rounded-full`}>
          {statusConfig.icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Discovery Progress</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <motion.div 
              className="bg-blue-600 h-1.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {discoveredCount} of {totalDiscoveries} discoveries found
          </div>
        </div>
      </div>
    );
  }
  
  // Full card display
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className={`${statusConfig.bgColor} ${statusConfig.color} p-2 rounded-full`}>
            {statusConfig.icon}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          
          <div className="text-sm">
            <span className="font-medium">{discoveredCount}</span> of <span className="font-medium">{totalDiscoveries}</span> discoveries found
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm">{getMessage()}</p>
          </div>
          
          {showHints && hint && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30 flex">
              <Lightbulb className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{hint}</p>
            </div>
          )}
        </div>
      </CardContent>
      {showHints && onRequestHint && (
        <CardFooter>
          <Button 
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onRequestHint}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Get a Hint
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProgressTracker;