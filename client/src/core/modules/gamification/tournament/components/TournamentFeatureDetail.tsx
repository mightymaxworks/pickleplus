/**
 * PKL-278651-GAME-0003-ENGGT
 * Tournament Feature Detail Component
 * 
 * This component displays detailed information about tournament features
 * in a visually appealing and informative way with engagement-based XP rewards.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle2, 
  ExternalLink, 
  Clock,
  Rocket,
  Award,
  Trophy,
  Timer
} from 'lucide-react';
import { TournamentFeatureDetail } from '../data/tournamentFeatureDetails';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface TournamentFeatureDetailProps {
  feature: TournamentFeatureDetail;
  onClose: () => void;
  isDiscovered: boolean;
  onClaimReward?: (featureId: string) => void;
  xpAmount?: number;
}

const MIN_READ_TIME = 10; // Minimum seconds required to read the content

const TournamentFeatureDetailComponent: React.FC<TournamentFeatureDetailProps> = ({ 
  feature, 
  onClose,
  isDiscovered,
  onClaimReward,
  xpAmount = 15
}) => {
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [hasClaimedReward, setHasClaimedReward] = useState(isDiscovered);
  const [showRewardButton, setShowRewardButton] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  
  const launchDate = new Date(feature.launchDate);
  const isLaunching = new Date() < launchDate;
  
  // Format date as Month Day, Year
  const formattedDate = launchDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Track time spent reading
  useEffect(() => {
    if (hasClaimedReward) return;
    
    const interval = setInterval(() => {
      setSecondsSpent(prev => {
        const newValue = prev + 1;
        // Calculate reading progress percentage
        const newProgress = Math.min(100, Math.round((newValue / MIN_READ_TIME) * 100));
        setReadProgress(newProgress);
        
        // Show reward button after min read time
        if (newValue >= MIN_READ_TIME && !showRewardButton) {
          setShowRewardButton(true);
        }
        
        return newValue;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hasClaimedReward, showRewardButton]);
  
  // Handle claiming XP reward
  const handleClaimReward = () => {
    if (onClaimReward) {
      onClaimReward(feature.id);
      setHasClaimedReward(true);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
        <h2 className="text-2xl font-bold">{feature.title}</h2>
        <p className="text-orange-50 mt-1">{feature.shortDescription}</p>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">About This Feature</h3>
          <p className="text-gray-700">{feature.fullDescription}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <CheckCircle2 className="mr-2 text-green-500" size={18} />
            Key Features
          </h3>
          <ul className="space-y-2">
            {feature.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">
                  ✓
                </span>
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="flex items-center text-gray-700 mb-2 sm:mb-0">
            <Calendar className="mr-2 text-orange-500" size={18} />
            <span>
              <span className="font-medium">Launch Date:</span>{" "}
              {formattedDate}
            </span>
          </div>
          
          <div className="flex space-x-2">
            {feature.demoAvailable && (
              <Button variant="outline" size="sm" className="flex items-center">
                <ExternalLink size={14} className="mr-1" />
                View Demo
              </Button>
            )}
            
            <Button variant="default" size="sm" onClick={onClose}>
              {hasClaimedReward ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
        
        {isLaunching && (
          <div className="mt-4 bg-orange-50 p-3 rounded-md border border-orange-100 flex items-center">
            <Rocket className="text-orange-500 mr-2 flex-shrink-0" size={18} />
            <p className="text-sm text-orange-800">
              This feature is launching soon! Complete all discoveries to get priority access.
            </p>
          </div>
        )}
        
        {/* XP Reward Section */}
        {!hasClaimedReward && !isDiscovered && (
          <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Timer className="text-blue-600 mr-2" size={18} />
                <span className="text-sm font-medium text-blue-800">Reading Progress</span>
              </div>
              <span className="text-xs text-blue-600">{readProgress}%</span>
            </div>
            <Progress value={readProgress} className="h-2 mb-3" />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Trophy className="text-amber-500 mr-2" size={18} />
                <span className="text-sm font-medium">Reward: {xpAmount} XP</span>
              </div>
              
              <Button 
                variant="default" 
                size="sm" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                disabled={!showRewardButton}
                onClick={handleClaimReward}
              >
                {!showRewardButton ? (
                  <>Keep reading...</>
                ) : (
                  <>
                    <Award className="mr-1" size={14} />
                    Claim XP Reward
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Already claimed message */}
        {hasClaimedReward && (
          <div className="mt-4 bg-green-50 p-3 rounded-md border border-green-100 flex items-center">
            <CheckCircle2 className="text-green-500 mr-2 flex-shrink-0" size={18} />
            <p className="text-sm text-green-800">
              You've already claimed the XP reward for this feature discovery!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TournamentFeatureDetailComponent;