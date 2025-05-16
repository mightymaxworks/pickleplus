/**
 * PKL-278651-RANK-0010-CARD
 * Ranking Points Card Component
 * 
 * A visually striking card that prominently displays the user's total ranking points,
 * current tier level, progress to next tier, and recent ranking point changes.
 * Designed as the primary focus element of the redesigned dashboard.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-05-16
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Medal, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown,
  Award,
  Filter
} from 'lucide-react';
import { User } from '@shared/schema';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AgeDivision, 
  PlayFormat,
  RatingTier 
} from "@shared/multi-dimensional-rankings";
import { usePCPGlobalRankingData } from "@/hooks/use-pcp-global-rankings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RankingPointsCardProps {
  user: User;
}

export function RankingPointsCard({ user }: RankingPointsCardProps) {
  // State for selected format and division
  const [format, setFormat] = useState<PlayFormat>('singles');
  const [ageDivision, setAgeDivision] = useState<AgeDivision>('19plus');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use the custom hook to fetch data from the API
  const {
    position,
    history,
    tiers,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = usePCPGlobalRankingData(user.id, format, ageDivision);
  
  // Calculate recent gain (last 7 days)
  const sevenDaysAgo = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }, []);
  
  // Format and prepare the ranking data
  const rankingData = React.useMemo(() => {
    // If data is loading or there's an error, return default values
    if (isLoading || isError || !position || !tiers.length) {
      return {
        points: 0,
        tier: 'Bronze',
        tierIndex: 0,
        totalTiers: 5,
        nextTierName: 'Silver',
        nextTierThreshold: 100,
        percentToNextTier: 0,
        recentGain: 0,
        hasInsufficientData: false,
        isNotRanked: false,
        message: 'Loading your ranking data...'
      };
    }
    
    // Check for insufficient data or not ranked status
    const hasInsufficientData = position.status === "insufficient_data";
    const isNotRanked = position.status === "not_ranked";
    
    // If we have insufficient data or not ranked status, return default values with flags
    if (hasInsufficientData || isNotRanked) {
      return {
        points: 0,
        tier: 'Bronze',
        tierIndex: 0,
        totalTiers: tiers.length,
        nextTierName: tiers.length > 1 ? tiers[1].name : 'Silver',
        nextTierThreshold: tiers.length > 1 ? tiers[1].minRating : 100,
        percentToNextTier: 0,
        recentGain: 0,
        hasInsufficientData,
        isNotRanked,
        message: hasInsufficientData 
          ? `Play ${position.requiredMatches || 3} more matches to receive your initial ranking`
          : "Complete your first match to join the rankings!"
      };
    }
    
    // Calculate recent ranking gains/losses
    const recentHistory = history
      .filter(entry => new Date(entry.timestamp || '') >= sevenDaysAgo)
      .filter(entry => entry.format === format && entry.ageDivision === ageDivision);
    
    const recentGain = recentHistory.reduce((acc, entry) => {
      // If we don't have old/new ranking fields, use a default gain of 0
      if (!entry.oldRanking || !entry.newRanking) return acc;
      return acc + (entry.newRanking - entry.oldRanking);
    }, 0);
    
    // Determine tier based on points and calculate progress to next tier
    const rankingPoints = position.rankingPoints || 0;
    const sortedTiers = [...tiers].sort((a, b) => a.minRating - b.minRating);
    
    const userTier = sortedTiers.find(tier => 
      rankingPoints >= tier.minRating && 
      (tier.maxRating === undefined || rankingPoints <= tier.maxRating)
    ) || sortedTiers[0];
    
    const tierIndex = sortedTiers.findIndex(tier => tier.id === userTier.id);
    const nextTierIndex = Math.min(tierIndex + 1, sortedTiers.length - 1);
    const nextTier = sortedTiers[nextTierIndex];
    
    // Calculate percentage to next tier
    const currentTierMin = userTier.minRating;
    const nextTierMin = nextTier.minRating;
    const pointsRange = nextTierMin - currentTierMin;
    const pointsEarned = rankingPoints - currentTierMin;
    const percentToNextTier = Math.min(99, Math.max(0, Math.floor((pointsEarned / pointsRange) * 100)));
    
    return {
      points: rankingPoints,
      tier: userTier.name,
      tierIndex,
      totalTiers: sortedTiers.length,
      nextTierName: nextTier.name,
      nextTierThreshold: nextTier.minRating,
      percentToNextTier: tierIndex === nextTierIndex ? 100 : percentToNextTier,
      recentGain,
      hasInsufficientData: false,
      isNotRanked: false,
      message: ''
    };
  }, [isLoading, isError, position, history, tiers, format, ageDivision, sevenDaysAgo]);
  
  // Get proper tier color
  const getTierColor = (tierName: string) => {
    const tier = tiers.find(t => t.name === tierName);
    if (tier?.colorCode) {
      return tier.colorCode;
    }
    
    // Fallback colors if not found in data
    switch (tierName.toLowerCase()) {
      case 'bronze': return 'from-amber-600 to-amber-800';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-cyan-600';
      case 'diamond': return 'from-blue-400 to-purple-500';
      case 'master': return 'from-purple-600 to-pink-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };
  
  // Animations for numbers counting up
  const [animatedPoints, setAnimatedPoints] = useState(0);
  
  useEffect(() => {
    if (isLoading) return;
    
    const duration = 1000;
    const pointsInterval = 20;
    
    let pointsTimer: NodeJS.Timeout;
    
    // Animate points counting up
    const pointsStep = Math.ceil(rankingData.points / (duration / pointsInterval));
    pointsTimer = setInterval(() => {
      setAnimatedPoints(prev => {
        if (prev + pointsStep >= rankingData.points) {
          clearInterval(pointsTimer);
          return rankingData.points;
        }
        return prev + pointsStep;
      });
    }, pointsInterval);
    
    return () => {
      clearInterval(pointsTimer);
    };
  }, [rankingData, isLoading]);
  
  return (
    <motion.div 
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      layout
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center">
            <Award className="mr-2 h-5 w-5" />
            Ranking Points
          </h3>
          <motion.button 
            className="bg-white/20 rounded-full p-1.5 backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse ranking details" : "Expand ranking details"}
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
          </motion.button>
        </div>
        <p className="text-white/80 text-xs mt-1">Your cumulative points determine your tier and global ranking</p>
      </div>
      
      {/* Format and Division Selector - Only visible when expanded */}
      {isExpanded && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <Filter className="h-3 w-3 mr-1" />
              Format
            </label>
            <Select
              value={format}
              onValueChange={(value) => setFormat(value as PlayFormat)}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="singles">Singles</SelectItem>
                <SelectItem value="doubles">Doubles</SelectItem>
                <SelectItem value="mixed">Mixed Doubles</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <Filter className="h-3 w-3 mr-1" />
              Division
            </label>
            <Select
              value={ageDivision}
              onValueChange={(value) => setAgeDivision(value as AgeDivision)}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select Division" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="19plus">Open (19+)</SelectItem>
                <SelectItem value="35plus">35+</SelectItem>
                <SelectItem value="50plus">50+</SelectItem>
                <SelectItem value="60plus">60+</SelectItem>
                <SelectItem value="70plus">70+</SelectItem>
                <SelectItem value="U19">Junior U19</SelectItem>
                <SelectItem value="U16">Junior U16</SelectItem>
                <SelectItem value="U14">Junior U14</SelectItem>
                <SelectItem value="U12">Junior U12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="p-4">
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-full" />
            {isExpanded && (
              <>
                <Skeleton className="h-8 w-36 mt-4" />
                <Skeleton className="h-20 w-full" />
              </>
            )}
          </div>
        ) : isError ? (
          // Error state
          <div className="text-center py-6">
            <p className="text-red-500 dark:text-red-400">
              Failed to load ranking data. Please try again.
            </p>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Main Ranking Display */}
            <div className="mb-4">
              {rankingData.hasInsufficientData || rankingData.isNotRanked ? (
                // Not ranked yet / Insufficient data state
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text mb-2">
                    {rankingData.hasInsufficientData ? "Almost There!" : "Start Your Journey!"}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {rankingData.message}
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    Record a Match
                  </Button>
                </div>
              ) : (
                // Ranked state with points and tier
                <div className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                        <TrendingUp size={16} className="text-indigo-500 mr-1" />
                        Total Ranking Points
                      </div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                        {animatedPoints.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Tier</div>
                      <Badge 
                        className={`text-white bg-gradient-to-r ${getTierColor(rankingData.tier)} px-3 py-1.5 text-lg font-semibold`}
                      >
                        {rankingData.tier}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Week Change Indicator */}
                  <div className="mt-2">
                    {rankingData.recentGain > 0 ? (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-md inline-flex items-center text-sm">
                        <ArrowUp size={14} className="mr-1" />
                        +{rankingData.recentGain} points this week
                      </div>
                    ) : rankingData.recentGain < 0 ? (
                      <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-md inline-flex items-center text-sm">
                        <ArrowDown size={14} className="mr-1" />
                        {rankingData.recentGain} points this week
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md inline-flex items-center text-sm">
                        No point changes this week
                      </div>
                    )}
                  </div>
                  
                  {/* Progress to Next Tier */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Progress to {rankingData.nextTierName}</span>
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{rankingData.percentToNextTier}%</span>
                    </div>
                    <Progress value={rankingData.percentToNextTier} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <div>{rankingData.points} points</div>
                      <div>{rankingData.nextTierThreshold} needed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Expanded Category View */}
            {isExpanded && !rankingData.isNotRanked && !rankingData.hasInsufficientData && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Medal size={14} className="mr-1 text-indigo-500" />
                  Category Breakdown
                </h4>
                
                <div className="space-y-3">
                  {/* Singles */}
                  <div 
                    className={`p-3 rounded-lg border border-gray-200 dark:border-gray-800 ${format === 'singles' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30' : ''}`}
                    onClick={() => setFormat('singles')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Singles</span>
                      <Badge 
                        variant={format === 'singles' ? "default" : "outline"}
                        className={format === 'singles' ? "bg-indigo-500" : ""}
                      >
                        {format === 'singles' ? rankingData.points.toLocaleString() : 'View'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Doubles */}
                  <div 
                    className={`p-3 rounded-lg border border-gray-200 dark:border-gray-800 ${format === 'doubles' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30' : ''}`}
                    onClick={() => setFormat('doubles')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Doubles</span>
                      <Badge 
                        variant={format === 'doubles' ? "default" : "outline"}
                        className={format === 'doubles' ? "bg-indigo-500" : ""}
                      >
                        {format === 'doubles' ? rankingData.points.toLocaleString() : 'View'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Mixed Doubles */}
                  <div 
                    className={`p-3 rounded-lg border border-gray-200 dark:border-gray-800 ${format === 'mixed' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30' : ''}`}
                    onClick={() => setFormat('mixed')}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Mixed Doubles</span>
                      <Badge 
                        variant={format === 'mixed' ? "default" : "outline"}
                        className={format === 'mixed' ? "bg-indigo-500" : ""}
                      >
                        {format === 'mixed' ? rankingData.points.toLocaleString() : 'View'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}