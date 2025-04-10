/**
 * PKL-278651-GAME-0001-MOD
 * ProgressTracker Component
 * 
 * A component that displays a user's progress in gamification campaigns.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Map, Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '../context/GamificationContext';

interface ProgressTrackerProps {
  campaignId?: number;
  compact?: boolean;
  className?: string;
  showDetailLink?: boolean;
  onDetailClick?: (campaignId: number) => void;
}

/**
 * A component that displays a user's progress in gamification campaigns.
 */
export default function ProgressTracker({
  campaignId,
  compact = false,
  className,
  showDetailLink = false,
  onDetailClick
}: ProgressTrackerProps) {
  // Get gamification context
  const { 
    state, 
    getCampaignProgress, 
    getActiveCampaignIds 
  } = useGamification();
  
  // Get active campaign IDs
  const activeCampaignIds = React.useMemo(() => {
    if (campaignId) {
      return [campaignId];
    }
    return getActiveCampaignIds();
  }, [campaignId, getActiveCampaignIds]);
  
  // Get campaign details from state
  const campaigns = React.useMemo(() => {
    return activeCampaignIds
      .map(id => {
        const campaign = state.campaigns.find(c => c.id === id);
        const progress = getCampaignProgress(id);
        
        if (!campaign || !progress) return null;
        
        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description || '',
          completionPercentage: progress.completionPercentage,
          discoveredCount: progress.discoveredCount,
          totalDiscoveries: progress.totalDiscoveries,
          isComplete: progress.isComplete
        };
      })
      .filter(Boolean);
  }, [activeCampaignIds, state.campaigns, getCampaignProgress]);
  
  // If no campaigns, show placeholder
  if (campaigns.length === 0) {
    if (compact) {
      return null;
    }
    
    return (
      <Card className={cn("bg-gray-50 dark:bg-gray-900", className)}>
        <CardContent className="p-6 text-center">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <h3 className="text-base font-medium text-gray-600 dark:text-gray-300 mb-1">
            No Active Discoveries
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            There are no active discovery campaigns at the moment. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Compact version - just the progress bar with minimal info
  if (compact) {
    const campaign = campaigns[0];
    if (!campaign) return null;
    
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Map className="h-4 w-4 mr-1 text-blue-500" />
            <span className="text-sm font-medium">{campaign.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {campaign.discoveredCount} / {campaign.totalDiscoveries}
          </Badge>
        </div>
        
        <Progress
          value={campaign.completionPercentage}
          className="h-2"
        />
      </div>
    );
  }
  
  // Full version - detailed card for each campaign
  return (
    <div className={cn("space-y-4", className)}>
      {campaigns.map(campaign => (
        <Card key={campaign.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {campaign.name}
              </CardTitle>
              
              {campaign.isComplete ? (
                <Badge variant="success" className="px-2 py-1">
                  <Trophy className="h-3 w-3 mr-1" />
                  Complete!
                </Badge>
              ) : (
                <Badge variant="outline" className="px-2 py-1">
                  {campaign.completionPercentage}% Complete
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {campaign.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {campaign.description}
              </p>
            )}
            
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Discoveries
                </span>
                <span className="font-medium">
                  {campaign.discoveredCount} / {campaign.totalDiscoveries}
                </span>
              </div>
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Progress
                  value={campaign.completionPercentage}
                  className="h-2"
                />
              </motion.div>
            </div>
          </CardContent>
          
          {showDetailLink && onDetailClick && (
            <CardFooter className="pt-0">
              <Button 
                variant="ghost" 
                className="w-full flex justify-between items-center" 
                onClick={() => onDetailClick(campaign.id)}
              >
                <span>View Details</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}