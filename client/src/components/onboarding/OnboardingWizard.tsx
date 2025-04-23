/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Onboarding Wizard Component
 * 
 * This component provides a multi-step guided onboarding experience
 * for new users, focusing on rating system selection and CourtIQ setup.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  UserCircle, 
  Calendar, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  RefreshCw,
  Timer,
  Bug
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Import onboarding step components
import RatingSystemSelection from './RatingSystemSelection';
import ExperienceSummary from './ExperienceSummary';
import PlayStyleAssessment from './PlayStyleAssessment';

// Development mode - this helps us test without backend connectivity
const isDevelopment = process.env.NODE_ENV === 'development';

// Type for onboarding status
interface OnboardingStatus {
  userId: number;
  progress: {
    profileCompleted: boolean;
    ratingSystemSelected: boolean;
    ratingProvided: boolean;
    experienceSummaryCompleted: boolean;
    equipmentPreferencesSet: boolean;
    playStyleAssessed: boolean;
    initialAssessmentCompleted: boolean;
    tourCompleted: boolean;
  };
  preferences: {
    preferredDivision?: string;
    preferredFormat?: string;
    preferredRatingSystem?: string;
    initialRating?: number;
    experienceYears?: number;
  };
  progress_pct: number;
  nextStep: string;
  completed: boolean;
  xpEarned: number;
  completedAt?: string;
}

// Mock onboarding status for development mode
const mockOnboardingStatus: OnboardingStatus = {
  userId: 1,
  progress: {
    profileCompleted: false,
    ratingSystemSelected: false,
    ratingProvided: false,
    experienceSummaryCompleted: false,
    equipmentPreferencesSet: false,
    playStyleAssessed: false,
    initialAssessmentCompleted: false,
    tourCompleted: false
  },
  preferences: {},
  progress_pct: 0,
  nextStep: 'profile_completion',
  completed: false,
  xpEarned: 0
};

// Type for step completion payload
interface StepCompletionPayload {
  step: string;
  data?: Record<string, any>;
}

// Type for step definition
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isRequired: boolean;
}

interface OnboardingWizardProps {
  userId?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * OnboardingWizard Component
 * 
 * Provides a multi-step guided onboarding experience for new users.
 */
export function OnboardingWizard({ 
  userId, 
  onComplete,
  className = '' 
}: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev'>('next');
  const [devMode, setDevMode] = useState<boolean>(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch the user's onboarding status
  const { 
    data: status, 
    isLoading: isLoadingStatus,
    error: statusError
  } = useQuery({
    queryKey: ['/api/courtiq/onboarding/status', devMode],
    queryFn: async () => {
      // Use mock data in development mode
      if (devMode) {
        console.log('Using mock onboarding data for development mode');
        return mockOnboardingStatus;
      }

      // Try to fetch from the real API
      try {
        const response = await fetch('/api/courtiq/onboarding/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to start onboarding');
        return response.json() as Promise<OnboardingStatus>;
      } catch (error) {
        console.error('Onboarding API error:', error);
        throw error;
      }
    }
  });

  // Define the onboarding steps - we'll substitute with mock component instances
  // since the actual component files don't exist yet
  const steps: OnboardingStep[] = [
    {
      id: 'profile_completion',
      title: 'Complete Your Profile',
      description: 'Enhance your Pickle+ profile with key information about your pickleball journey.',
      icon: <UserCircle className="h-5 w-5 text-blue-500" />,
      component: (
        <Alert className="my-4">
          <AlertTitle>Profile completion is managed separately</AlertTitle>
          <AlertDescription className="text-sm">
            Please visit your profile page to complete this step.
            <div className="mt-2">
              <Button onClick={() => setLocation('/profile')}>
                Go to Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ),
      isRequired: true
    },
    {
      id: 'rating_selection',
      title: 'Select Your Rating System',
      description: 'Choose your preferred pickleball rating system and enter your current rating.',
      icon: <Award className="h-5 w-5 text-purple-500" />,
      component: <RatingSystemSelection onComplete={() => handleStepCompleted('rating_selection')} />,
      isRequired: true
    },
    {
      id: 'experience_summary',
      title: 'Your Pickleball Experience',
      description: 'Tell us about your pickleball journey to help personalize your experience.',
      icon: <Calendar className="h-5 w-5 text-green-500" />,
      component: <ExperienceSummary onComplete={(data) => handleStepCompleted('experience_summary', data)} />,
      isRequired: false
    },
    {
      id: 'play_style_assessment',
      title: 'Your Play Style',
      description: 'Share your play style preferences to help us understand your game better.',
      icon: <Settings className="h-5 w-5 text-amber-500" />,
      component: <PlayStyleAssessment onComplete={(data) => handleStepCompleted('play_style_assessment', data)} />,
      isRequired: false
    }
  ];

  // Mutation for completing an onboarding step
  const completeStepMutation = useMutation({
    mutationFn: async (payload: StepCompletionPayload) => {
      // In development mode, just simulate API success
      if (devMode) {
        console.log('Dev mode active: simulating successful step completion', payload);
        
        // Update mock status with the completed step
        if (payload.step === 'rating_selection') {
          mockOnboardingStatus.progress.ratingSystemSelected = true;
          mockOnboardingStatus.progress.ratingProvided = true;
          mockOnboardingStatus.progress_pct = 40;
          mockOnboardingStatus.nextStep = 'experience_summary';
          
          if (payload.data?.ratingSystem) {
            mockOnboardingStatus.preferences.preferredRatingSystem = payload.data.ratingSystem as string;
          }
        } else if (payload.step === 'experience_summary') {
          mockOnboardingStatus.progress.experienceSummaryCompleted = true;
          mockOnboardingStatus.progress_pct = 70;
          mockOnboardingStatus.nextStep = 'play_style_assessment';
          
          if (payload.data?.experienceYears) {
            mockOnboardingStatus.preferences.experienceYears = Number(payload.data.experienceYears);
          }
        } else if (payload.step === 'play_style_assessment') {
          mockOnboardingStatus.progress.playStyleAssessed = true;
          mockOnboardingStatus.progress_pct = 100;
          mockOnboardingStatus.completed = true;
          mockOnboardingStatus.xpEarned = 250;
          mockOnboardingStatus.completedAt = new Date().toISOString();
        }
        
        return mockOnboardingStatus;
      }
      
      // Real API call for production
      const res = await apiRequest('POST', '/api/courtiq/onboarding/complete-step', payload);
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate onboarding status cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/courtiq/onboarding/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete step",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Determine the initial step based on the onboarding status
  useEffect(() => {
    if (status?.nextStep) {
      const nextStepIndex = steps.findIndex(step => step.id === status.nextStep);
      if (nextStepIndex !== -1) {
        setCurrentStepIndex(nextStepIndex);
      }
    }
  }, [status?.nextStep, steps]);

  // Handle step completion
  const handleStepCompleted = (stepId: string, data?: Record<string, unknown>) => {
    console.log('[OnboardingWizard] Step completed:', stepId, data);
    
    // Create payload with the correct format
    const payload: StepCompletionPayload = { 
      step: stepId,
      data: data || {} 
    };
    
    // For rating selection, ensure the data is properly formatted
    if (stepId === 'rating_selection' && !data) {
      // Create data with the current status preferences if available
      if (status?.preferences?.preferredRatingSystem) {
        payload.data = {
          ratingSystem: status.preferences.preferredRatingSystem,
          ratingValue: status.preferences.initialRating || 3.5
        };
      }
    }
    
    // Perform the mutation to update server
    completeStepMutation.mutate(payload, {
      onSuccess: (result) => {
        console.log('[OnboardingWizard] Step completion success:', result);
        
        // Force refresh the onboarding status
        queryClient.invalidateQueries({ queryKey: ['/api/courtiq/onboarding/status'] });
        
        // Check if this is the last step
        if (currentStepIndex >= steps.length - 1) {
          if (onComplete) {
            onComplete();
          }
        } else {
          // Move to the next step 
          setTransitionDirection('next');
          setCurrentStepIndex(prev => prev + 1);
        }
      }
    });
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setTransitionDirection('prev');
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Navigate to next step (skip the current step)
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setTransitionDirection('next');
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // Handle onboarding completion
  const handleComplete = () => {
    toast({
      title: "Onboarding completed",
      description: "You've completed the CourtIQ™ onboarding process. Welcome to Pickle+!",
    });

    if (onComplete) {
      onComplete();
    }
  };

  // Handle dev mode toggle
  const toggleDevMode = useCallback(() => {
    setDevMode(prev => !prev);
    
    // Show toast notification
    toast({
      title: `Development Mode ${!devMode ? 'Enabled' : 'Disabled'}`,
      description: !devMode 
        ? "Using mock data to bypass authentication requirements." 
        : "Using real API endpoints with authentication.",
    });
    
    // Invalidate the query to force a refetch
    queryClient.invalidateQueries({ queryKey: ['/api/courtiq/onboarding/status'] });
  }, [devMode, toast]);

  // If there's an error fetching the status, display an error message
  if (statusError) {
    return (
      <Card className={`w-full max-w-2xl shadow-lg ${className}`}>
        <CardHeader>
          <CardTitle>Onboarding Error</CardTitle>
          <CardDescription>
            We encountered a problem with the onboarding process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error loading onboarding status</AlertTitle>
            <AlertDescription>
              Please try refreshing the page or contact support if the problem persists.
            </AlertDescription>
          </Alert>
          
          {/* Development mode toggle */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Bug className="mr-2 h-4 w-4 text-amber-500" />
                  <h4 className="font-medium">Development Mode</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable to use mock data and bypass authentication requirements.
                </p>
              </div>
              <div>
                <Switch
                  checked={devMode}
                  onCheckedChange={toggleDevMode}
                  id="dev-mode"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Loading state
  if (isLoadingStatus) {
    return (
      <Card className={`w-full max-w-2xl shadow-lg ${className}`}>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </CardContent>
        <CardFooter className="justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }

  // Check if onboarding is already completed
  if (status?.completed) {
    return (
      <Card className={`w-full max-w-2xl shadow-lg ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle>Onboarding Complete</CardTitle>
          </div>
          <CardDescription>
            You've already completed the CourtIQ™ onboarding process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center rounded-full h-20 w-20 bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">All Set!</h3>
            <p className="text-muted-foreground">
              Your CourtIQ™ profile is ready. You earned {status.xpEarned} XP for completing the onboarding process.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={() => setLocation('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Get the current step
  const currentStep = steps[currentStepIndex];
  const progress = status?.progress_pct || 0;

  return (
    <Card className={`w-full max-w-2xl shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep?.icon}
            <CardTitle>{currentStep?.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
          </div>
        </div>
        <CardDescription>
          {currentStep?.description}
        </CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {Math.round(progress)}% complete
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStepIndex}
            initial={{ 
              opacity: 0, 
              x: transitionDirection === 'next' ? 100 : -100 
            }}
            animate={{ 
              opacity: 1, 
              x: 0 
            }}
            exit={{ 
              opacity: 0, 
              x: transitionDirection === 'next' ? -100 : 100 
            }}
            transition={{ duration: 0.3 }}
          >
            {currentStep?.component}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      
      <CardFooter className="justify-between border-t pt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div>
          {currentStepIndex < steps.length - 1 ? (
            <Button 
              variant="outline" 
              onClick={handleNextStep}
              disabled={currentStep?.isRequired}
            >
              {currentStep?.isRequired ? 'Required Step' : 'Skip'}
              {!currentStep?.isRequired && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={completeStepMutation.isPending}
            >
              {completeStepMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Complete Onboarding'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default OnboardingWizard;