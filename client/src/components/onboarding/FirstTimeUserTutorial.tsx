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
  Users, 
  Award, 
  Calendar, 
  Trophy,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDiscoveryTracking, useDiscoveryTrigger } from '@/core/modules/gamification/hooks';
import { cn } from '@/lib/utils';
import TutorialAlert, { TutorialReward } from './TutorialAlert';

// Define the tutorial steps with their content and targets
const tutorialSteps = [
  {
    id: 1,
    code: 'first_time_welcome',
    title: 'Welcome to Pickle+!',
    description: 'Let\'s take a quick tour to help you get started with the key features of Pickle+.',
    icon: <Sparkles className="h-5 w-5 text-blue-500" />,
    position: 'center',
    buttonText: 'Start Tour',
    route: '/',
  },
  {
    id: 2,
    code: 'first_time_profile',
    title: 'Your Player Profile',
    description: 'Complete your profile to connect with other players, track your progress, and showcase your skills.',
    icon: <User className="h-5 w-5 text-blue-500" />,
    position: 'right',
    targetSelector: '.profile-link', // This should match an actual element in your app
    route: '/profile',
    buttonText: 'Next',
  },
  {
    id: 3,
    code: 'first_time_rankings',
    title: 'Competitive Rankings',
    description: 'Track your progress in the CourtIQ™ ranking system and see how you stack up against other players.',
    icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
    position: 'right',
    targetSelector: '.rankings-link', // This should match an actual element in your app
    route: '/rankings',
    buttonText: 'Next',
  },
  {
    id: 4,
    code: 'first_time_community',
    title: 'Connect with the Community',
    description: 'Find players near you, join groups, and build your pickleball network.',
    icon: <Users className="h-5 w-5 text-blue-500" />,
    position: 'right',
    targetSelector: '.community-link', // This should match an actual element in your app
    route: '/community',
    buttonText: 'Next',
  },
  {
    id: 5,
    code: 'first_time_achievements',
    title: 'Achievements & Rewards',
    description: 'Earn badges, XP, and rewards as you play matches and improve your skills.',
    icon: <Award className="h-5 w-5 text-blue-500" />,
    position: 'right',
    targetSelector: '.achievements-link', // This should match an actual element in your app
    route: '/achievements',
    buttonText: 'Next',
  },
  {
    id: 6,
    code: 'first_time_events',
    title: 'Events & Tournaments',
    description: 'Discover and register for local tournaments, clinics, and other pickleball events.',
    icon: <Calendar className="h-5 w-5 text-blue-500" />,
    position: 'right',
    targetSelector: '.events-link', // This should match an actual element in your app
    route: '/events',
    buttonText: 'Next',
  },
  {
    id: 7,
    code: 'first_time_matches',
    title: 'Record Your Matches',
    description: 'Track your matches, analyze your performance, and improve your game with detailed statistics.',
    icon: <Trophy className="h-5 w-5 text-blue-500" />,
    position: 'right',
    targetSelector: '.record-match-link', // This should match an actual element in your app
    route: '/record-match',
    buttonText: 'Finish Tour',
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

  // Initialize discovery campaign for the tutorial
  useEffect(() => {
    if (isFirstTimeUser) {
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
    }
  }, [isFirstTimeUser]);

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

  // Track discovery for the current step
  useEffect(() => {
    if (currentStep > 0 && currentStep <= tutorialSteps.length) {
      trackDiscovery(tutorialSteps[currentStep - 1].code);
    }
  }, [currentStep, trackDiscovery]);

  // Handle advancing to the next step
  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length) {
      // If route navigation is needed
      const nextStep = tutorialSteps[currentStep];
      if (nextStep.route && nextStep.route !== location) {
        setLocation(nextStep.route);
      }
      setCurrentStep(prev => prev + 1);
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

  // Position styles based on step position property
  const positionStyles = {
    center: 'fixed inset-0 flex items-center justify-center z-50',
    right: 'fixed top-20 right-4 z-50',
    left: 'fixed top-20 left-4 z-50',
    bottom: 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
  };

  return (
    <>
      {/* Main tutorial card with steps */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className={positionStyles[step.position as keyof typeof positionStyles] || positionStyles.center}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={cn(
              "p-5 shadow-lg max-w-md w-full bg-white",
              step.position !== 'center' && "w-80"
            )}>
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