/**
 * PKL-278651-JOUR-002.1: Role Discovery Wizard
 * 
 * Main wizard component that orchestrates the multi-step onboarding flow
 * for the PickleJourney™ multi-role system.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/roles';
import { useJourneyRoles } from '../../hooks/useJourneyRoles';
import { RoleSelectionPanel } from './RoleSelectionPanel';
import { RolePrioritization } from './RolePrioritization';
import { WhyExploration } from './WhyExploration';
import { GoalSetting } from './GoalSetting';
import { WizardComplete } from './WizardComplete';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the wizard step structure
interface WizardStep {
  id: string;
  label: string;
  component: React.ReactNode;
  canProgress?: () => boolean;
}

/**
 * Hook for tracking wizard progress in localStorage
 */
function useWizardProgress(wizardId: string) {
  const storageKey = `picklejourney:wizard:${wizardId}`;
  
  // Load progress from localStorage
  const loadProgress = (): string[] => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading wizard progress:', error);
    }
    return [];
  };
  
  // Save progress to localStorage
  const saveProgress = (completedSteps: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedSteps));
    } catch (error) {
      console.error('Error saving wizard progress:', error);
    }
  };
  
  const [completedSteps, setCompletedSteps] = useState<string[]>(loadProgress());
  
  // Mark a step as complete
  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const updated = [...completedSteps, stepId];
      setCompletedSteps(updated);
      saveProgress(updated);
    }
  };
  
  // Check if a step is complete
  const isStepComplete = (stepId: string): boolean => {
    return completedSteps.includes(stepId);
  };
  
  // Reset progress
  const resetProgress = () => {
    setCompletedSteps([]);
    localStorage.removeItem(storageKey);
  };
  
  return {
    completedSteps,
    markStepComplete,
    isStepComplete,
    resetProgress
  };
}

/**
 * Component for a single wizard step indicator
 */
interface StepIndicatorProps {
  label: string;
  isActive: boolean;
  isComplete: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const StepIndicator = ({ 
  label, 
  isActive, 
  isComplete, 
  onClick, 
  disabled 
}: StepIndicatorProps) => {
  return (
    <div 
      className={`
        flex items-center space-x-2 p-2 rounded-md cursor-pointer
        ${isActive ? 'bg-primary/10 text-primary' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <div 
        className={`
          h-6 w-6 rounded-full flex items-center justify-center
          ${isComplete 
            ? 'bg-green-500 text-white' 
            : isActive 
              ? 'border-2 border-primary text-primary' 
              : 'border-2 border-muted-foreground text-muted-foreground'
          }
        `}
      >
        {isComplete ? <Check className="h-4 w-4" /> : null}
      </div>
      <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>{label}</span>
    </div>
  );
};

/**
 * Main wizard component
 */
export function RoleDiscoveryWizard() {
  const { 
    roles, 
    primaryRole,
    hasRole,
    getRoleLabel,
    getRoleMetadata
  } = useJourneyRoles();
  
  const { 
    completedSteps, 
    markStepComplete, 
    isStepComplete 
  } = useWizardProgress('role-discovery');
  
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset back to first step if no roles are selected
  useEffect(() => {
    if (roles.length === 0 && step > 0) {
      setStep(0);
    }
  }, [roles, step]);
  
  // Define the wizard steps
  const getSteps = (): WizardStep[] => [
    { 
      id: 'role-selection', 
      label: 'Select Roles', 
      component: <RoleSelectionPanel />,
      canProgress: () => roles.length > 0
    },
    { 
      id: 'role-prioritization', 
      label: 'Prioritize Roles', 
      component: <RolePrioritization /> 
    },
    ...roles.map(role => ({
      id: `why-${role}`,
      label: `${getRoleLabel(role)} Journey`,
      component: <WhyExploration role={role} />,
      canProgress: () => {
        const metadata = getRoleMetadata(role);
        return !!metadata.why && metadata.why.trim().length > 0;
      }
    })),
    { 
      id: 'goals', 
      label: 'Set Goals', 
      component: <GoalSetting /> 
    },
    { 
      id: 'complete', 
      label: 'Complete', 
      component: <WizardComplete /> 
    }
  ];
  
  const steps = getSteps();
  const currentStep = steps[step];
  
  // Handle navigation to the next step
  const handleNext = async () => {
    // If the current step has a canProgress function, check it
    if (currentStep.canProgress && !currentStep.canProgress()) {
      return;
    }
    
    setIsLoading(true);
    
    // Mark current step as complete
    markStepComplete(currentStep.id);
    
    // Wait a bit for animations
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Move to the next step if there is one
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
    
    setIsLoading(false);
  };
  
  // Handle navigation to the previous step
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  // Handle clicking on a step indicator
  const handleStepClick = (index: number) => {
    // Only allow clicking on completed steps or the next available step
    if (index < step || (index === step + 1 && isStepComplete(currentStep.id))) {
      setStep(index);
    }
  };
  
  // Check if the next button should be disabled
  const isNextDisabled = () => {
    if (isLoading) return true;
    
    // If the current step has a canProgress function, use it
    if (currentStep.canProgress) {
      return !currentStep.canProgress();
    }
    
    return false;
  };
  
  // Check if a given step is accessible
  const isStepAccessible = (index: number) => {
    // First step is always accessible
    if (index === 0) return true;
    
    // Otherwise, all previous steps must be completed
    for (let i = 0; i < index; i++) {
      if (!isStepComplete(steps[i].id)) {
        return false;
      }
    }
    
    return true;
  };
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 space-y-1 mb-4 md:mb-0">
            {steps.map((s, i) => (
              <StepIndicator
                key={s.id}
                label={s.label}
                isActive={i === step}
                isComplete={isStepComplete(s.id)}
                onClick={() => handleStepClick(i)}
                disabled={!isStepAccessible(i)}
              />
            ))}
          </div>
          
          <div className="md:w-3/4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px]"
              >
                {currentStep.component}
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <>
                    {step === steps.length - 1 ? 'Complete' : 'Continue'}
                    {step !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}