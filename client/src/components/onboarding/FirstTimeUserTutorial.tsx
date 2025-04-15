/**
 * PKL-278651-GAME-0002-TUT
 * First Time User Tutorial Component
 * 
 * This component provides a step-by-step tutorial for first-time users,
 * introducing them to key features of the Pickle+ platform.
 * It leverages the existing gamification system for discovery tracking.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  ChevronRight, 
  X, 
  User, 
  TrendingUp, 
  ClipboardList, 
  Award, 
  Calendar, 
  Trophy,
  Sparkles,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDiscoveryTracking } from '@/core/modules/gamification/hooks';
import { cn } from '@/lib/utils';
import TutorialAlert, { TutorialReward } from './TutorialAlert';

// Define the tutorial step interface
interface TutorialStep {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'center' | 'left' | 'right' | 'bottom';
  route: string;
  buttonText?: string;
}

// Define the tutorial steps with their content and targets
const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    code: 'first_time_welcome',
    title: 'Welcome to Pickle+!',
    description: 'Welcome to the premier platform for pickleball players! This quick tour will introduce you to key features to enhance your game.',
    icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
    position: 'center',
    buttonText: 'Start Tour',
    route: '/dashboard',
  },
  {
    id: 2,
    code: 'first_time_profile',
    title: 'Your Player Profile',
    description: 'Your profile displays your progress, stats, and achievements. Complete your profile to earn your first achievement!',
    icon: <User className="h-5 w-5 text-blue-500" />,
    position: 'right',
    route: '/profile',
    buttonText: 'Next',
  },
  {
    id: 3,
    code: 'first_time_rankings',
    title: 'Rankings & Leaderboards',
    description: 'Track how you measure up against other players with the CourtIQ™ ranking system based on your match performance.',
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    position: 'left',
    route: '/leaderboard',
    buttonText: 'Next',
  },
  {
    id: 4,
    code: 'first_time_matches',
    title: 'Record Your Matches',
    description: 'After each game, record your matches here. Your results will update your rankings and help track your improvement over time.',
    icon: <ClipboardList className="h-5 w-5 text-purple-500" />,
    position: 'bottom',
    route: '/record-match',
    buttonText: 'Next',
  },
  {
    id: 5,
    code: 'first_time_achievements',
    title: 'Achievements & XP',
    description: 'Earn badges and XP as you play, improve, and engage with the community. Level up to unlock special features!',
    icon: <Award className="h-5 w-5 text-amber-500" />,
    position: 'right',
    route: '/dashboard',
    buttonText: 'Next',
  },
  {
    id: 6,
    code: 'first_time_events',
    title: 'Events & Tournaments',
    description: 'Join tournaments, clinics, and social play opportunities. Use your PicklePass™ to check in at events!',
    icon: <Calendar className="h-5 w-5 text-red-500" />,
    position: 'left',
    route: '/events',
    buttonText: 'Next',
  },
  {
    id: 7,
    code: 'first_time_complete',
    title: 'You\'re All Set!',
    description: 'Congratulations! You\'ve completed the Pickle+ orientation. You\'ve earned 50 XP and the "Platform Navigator" achievement!',
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    position: 'center',
    route: '/dashboard',
    buttonText: 'Start Playing',
  },
];

// XP Reward for completing the tutorial
const tutorialCompletionReward: TutorialReward = {
  id: 1001,
  name: 'Platform Navigator',
  description: 'You\'ve completed the Pickle+ tour and learned about the key features',
  type: 'xp',
  rarity: 'common',
  value: {
    xpAmount: 50
  }
};

export interface FirstTimeUserTutorialProps {
  isFirstTimeUser: boolean;
  userId: number;
  onComplete?: () => void;
}

/**
 * FirstTimeUserTutorial Component
 * 
 * A step-by-step tutorial that guides first-time users through the major features of Pickle+.
 */
const FirstTimeUserTutorial: React.FC<FirstTimeUserTutorialProps> = ({
  isFirstTimeUser,
  userId,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(isFirstTimeUser);
  const [showReward, setShowReward] = useState(false);
  const [location, setLocation] = useLocation();

  // Use discovery tracking to manage tutorial progress
  const {
    campaigns,
    trackDiscovery,
    addCampaign
  } = useDiscoveryTracking({
    campaignId: 101,
    localStorageKey: `pickle_plus_tutorial_${userId}`,
    onCampaignComplete: () => {
      setShowReward(true);
      if (onComplete) onComplete();
    }
  });

  // Initialize discovery campaign for the tutorial
  useEffect(() => {
    if (isFirstTimeUser) {
      // Use setTimeout to ensure this doesn't happen during render phase
      setTimeout(() => {
        // Add the tutorial campaign to the discovery tracking system
        addCampaign({
          id: 101,
          name: 'First-Time User Tutorial',
          description: 'Complete the introduction to Pickle+ features',
          discoveries: tutorialSteps.map(step => ({
            id: step.id,
            code: step.code,
            name: step.title,
            discovered: false
          }))
        });
      }, 0);
    }
  }, [isFirstTimeUser, addCampaign]);

  // Track discovery for the current step
  useEffect(() => {
    if (currentStep > 0 && currentStep <= tutorialSteps.length) {
      trackDiscovery(tutorialSteps[currentStep - 1].code);
    }
  }, [currentStep, trackDiscovery]);

  // Handle advancing to the next step
  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length) {
      // Always increment the step first
      setCurrentStep(prev => prev + 1);
      
      // Then handle navigation to the appropriate page if needed
      // We use setTimeout to ensure the step change is processed first
      const stepIndex = currentStep;
      const nextStep = tutorialSteps[stepIndex];
      
      if (nextStep && nextStep.route && nextStep.route !== location) {
        // Small delay to ensure state updates are processed first
        setTimeout(() => {
          setLocation(nextStep.route);
        }, 50);
      }
    } else {
      // Tutorial completed
      setShowTutorial(false);
    }
  };

  // Handle skipping the tutorial
  const handleSkipTutorial = () => {
    setShowTutorial(false);
    if (onComplete) onComplete();
  };

  // If not a first-time user or tutorial is hidden, don't render anything
  if (!showTutorial) {
    return null;
  }

  // Get current step data
  const step = currentStep > 0 ? tutorialSteps[currentStep - 1] : tutorialSteps[0];

  // Standardized position style for all tutorial steps - always top center
  // This ensures consistency and helps avoid UI conflicts with bottom navigation
  const standardPosition = 'fixed top-24 left-1/2 transform -translate-x-1/2 z-50';

  return (
    <>
      {/* Main tutorial card with steps */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className={standardPosition}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-5 shadow-lg max-w-md w-full bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  {step.icon}
                  <h3 className="text-lg font-semibold ml-2">{step.title}</h3>
                </div>
                <button 
                  onClick={handleSkipTutorial} 
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close tutorial"
                >
                  <X size={18} />
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">{step.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  {tutorialSteps.map((_, index) => (
                    <div 
                      key={index}
                      className={`h-1.5 w-6 rounded-full ${
                        index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                
                <Button 
                  onClick={handleNextStep}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center"
                  size="sm"
                >
                  {step.buttonText || 'Next'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion reward alert */}
      {showReward && (
        <TutorialAlert
          title="Tutorial Completed!"
          message="You've completed the Pickle+ orientation tour. Keep exploring to discover more features!"
          level="success"
          reward={tutorialCompletionReward}
          autoHide={true}
          hideDelay={8000}
          onClose={() => setShowReward(false)}
        />
      )}
    </>
  );
};

export default FirstTimeUserTutorial;