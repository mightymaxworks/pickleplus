/**
 * PKL-278651-XP-0002-UI
 * XP Progress Tracker Component
 * 
 * This component displays XP progress with level indicators and progress bars.
 * Shows current level, XP required for next level, and progress.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

// Types for XP progress data
export interface XpProgressData {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
  progress: number;
  remainingXp: number;
  lifetimeXp: number;
  benefits: {
    perks: string[];
    isKeyMilestone?: boolean;
  };
}

interface XpProgressTrackerProps {
  userId?: number; // If not provided, will use the current user
  minimal?: boolean; // Show minimal version
  showDetails?: boolean; // Show detailed XP breakdown
}

/**
 * XpProgressTracker Component
 * 
 * Displays XP progress with level indicators and animations
 */
const XpProgressTracker: React.FC<XpProgressTrackerProps> = ({
  userId,
  minimal = false,
  showDetails = true
}) => {
  // Get the user's XP progress data
  const { data: xpProgress, isLoading, error } = useQuery<XpProgressData>({
    queryKey: ['/api/xp/progress', userId],
    enabled: true,
  });
  
  // Handle loading state
  if (isLoading) {
    return minimal ? (
      <Skeleton className="w-full h-2 rounded-full" />
    ) : (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-2 w-full rounded-full mb-2" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Handle error state
  if (error || !xpProgress) {
    return minimal ? (
      <div className="w-full rounded-full h-2 bg-gray-200" />
    ) : (
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">XP Progress</CardTitle>
          <CardDescription className="text-xs text-gray-400">Unable to load XP data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2" />
        </CardContent>
      </Card>
    );
  }
  
  // Animation variants
  const progressVariants = {
    hidden: { width: 0 },
    visible: { 
      width: `${xpProgress.progress}%`,
      transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 }
    }
  };
  
  // Get progress color based on level
  const getProgressColor = () => {
    const { currentLevel } = xpProgress;
    if (currentLevel >= 75) return 'bg-purple-500';
    if (currentLevel >= 50) return 'bg-indigo-500';
    if (currentLevel >= 25) return 'bg-blue-500';
    if (currentLevel >= 10) return 'bg-green-500';
    return 'bg-emerald-500';
  };
  
  // Get level badge based on level
  const getLevelBadge = () => {
    const { currentLevel, benefits } = xpProgress;
    const isKeyMilestone = benefits?.isKeyMilestone;
    
    if (currentLevel >= 75) {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Master</Badge>;
    }
    if (currentLevel >= 50) {
      return <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">Expert</Badge>;
    }
    if (currentLevel >= 25) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Veteran</Badge>;
    }
    if (currentLevel >= 10) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Skilled</Badge>;
    }
    
    return isKeyMilestone ? 
      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Milestone</Badge> : 
      null;
  };
  
  // Render minimal version (just progress bar)
  if (minimal) {
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Level {xpProgress.currentLevel}</span>
          <span>{xpProgress.progress}%</span>
        </div>
        <div className="w-full rounded-full h-2 bg-gray-200 overflow-hidden">
          <motion.div 
            className={`h-full ${getProgressColor()}`}
            initial="hidden"
            animate="visible"
            variants={progressVariants}
          />
        </div>
      </div>
    );
  }
  
  // Render full card
  return (
    <Card className="transition-all hover:shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <Award className="mr-2 h-5 w-5 text-amber-500" />
            Level {xpProgress.currentLevel}
          </CardTitle>
          {getLevelBadge()}
        </div>
        <CardDescription>
          {xpProgress.remainingXp} XP to next level
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <Progress value={xpProgress.progress} className="h-2" indicatorColor={getProgressColor()} />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Zap className="h-3 w-3 mr-1 text-amber-500" />
            {xpProgress.currentXp} XP
          </span>
          <span className="flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            {xpProgress.nextLevelXp} XP needed
          </span>
        </div>
        
        {showDetails && xpProgress.benefits?.perks?.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Level perks:</p>
            <div className="flex flex-wrap gap-1">
              {xpProgress.benefits.perks.map((perk, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {perk}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {showDetails && (
        <CardFooter className="pt-0 pb-3 px-6">
          <div className="w-full text-center text-xs text-gray-400">
            Lifetime XP: {xpProgress.lifetimeXp}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default XpProgressTracker;