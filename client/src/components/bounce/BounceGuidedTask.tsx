/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * BounceGuidedTask - Container component for displaying a guided task and
 * its steps. Manages the progression through steps and handles step completion.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight, ChevronLeft, ArrowRight, Zap } from 'lucide-react';
import { useGuidedTask, VerificationData } from '@/contexts/BounceGuidedTaskContext';
import { BounceGuidedTaskStep } from './BounceGuidedTaskStep';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface BounceGuidedTaskProps {
  taskId: string;
}

export const BounceGuidedTask: React.FC<BounceGuidedTaskProps> = ({
  taskId
}) => {
  const { 
    tasks,
    activeTaskId,
    currentStepIndex,
    setCurrentStep,
    setActiveTask,
    completedStepIds,
    completeStep,
    taskProgress
  } = useGuidedTask();
  
  const { toast } = useToast();
  
  // Find the task
  const task = tasks.find(t => t.id === taskId);
  
  // If no task found, render nothing
  if (!task) {
    return null;
  }
  
  // Get current step
  const currentStep = task.steps[currentStepIndex];
  
  // Calculate progress
  const progress = taskProgress(taskId);
  
  // Handle step completion
  const handleStepComplete = (verificationData: VerificationData) => {
    completeStep(verificationData.stepId, verificationData);
    
    // Show toast
    toast({
      title: "Step completed!",
      description: `You earned ${currentStep.xpReward} XP for this step.`,
      duration: 3000,
    });
    
    // Check if all steps are completed
    if (progress.completed + 1 === progress.total) {
      // Show completion toast
      setTimeout(() => {
        toast({
          title: "Task completed!",
          description: `You've completed all steps and earned ${task.totalXpReward} XP in total.`,
          duration: 5000,
        });
      }, 1000);
    }
  };
  
  // Handle navigation
  const goToNextStep = () => {
    if (currentStepIndex < task.steps.length - 1) {
      setCurrentStep(currentStepIndex + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(currentStepIndex - 1);
    }
  };
  
  // If task is complete, show a summary
  const isTaskComplete = progress.completed === progress.total;
  
  if (isTaskComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-3"
      >
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900">
          <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-center font-medium text-green-700 dark:text-green-300 mb-1">
            Task Completed
          </h3>
          <p className="text-center text-sm text-green-600 dark:text-green-400 mb-3">
            You've completed all {task.steps.length} steps!
          </p>
          <div className="flex items-center justify-center mb-3">
            <div className="bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 px-3 py-1 rounded-full flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              {task.totalXpReward} XP Earned
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTask(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3"
    >
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{progress.completed} of {progress.total} steps</span>
        </div>
        <Progress value={progress.percentage} className="h-2" />
      </div>
      
      {/* Task steps */}
      <div className="space-y-2">
        {/* Render the current step with full details */}
        <BounceGuidedTaskStep
          step={currentStep}
          isActive={true}
          isCompleted={completedStepIds.includes(currentStep.id)}
          onComplete={handleStepComplete}
          onNext={goToNextStep}
          stepNumber={currentStepIndex + 1}
          totalSteps={task.steps.length}
        />
        
        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Step {currentStepIndex + 1} of {task.steps.length}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextStep}
            disabled={currentStepIndex === task.steps.length - 1 || !completedStepIds.includes(currentStep.id)}
            className="h-8 px-2"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};