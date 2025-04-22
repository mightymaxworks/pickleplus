/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * BounceGuidedTask - Container component for displaying a guided task and
 * its steps. Manages the progression through steps and handles step completion.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight } from 'lucide-react';
import { useGuidedTask } from '@/contexts/BounceGuidedTaskContext';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BounceGuidedTaskStep } from './BounceGuidedTaskStep';
import { useToast } from '@/hooks/use-toast';
import { useBounceAwareness } from '@/hooks/use-bounce-awareness';
import { VerificationData, TaskUpdateMessage } from '@/types/bounce';

interface BounceGuidedTaskProps {
  taskId: string;
}

export const BounceGuidedTask: React.FC<BounceGuidedTaskProps> = ({
  taskId
}) => {
  const { tasks, completeTask, getStepProgress } = useGuidedTask();
  const { sendTaskUpdate } = useBounceAwareness();
  const { toast } = useToast();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Find the current task
  const task = tasks.find((t: any) => t.id === taskId);
  
  // If task not found, don't render anything
  if (!task) {
    return null;
  }
  
  const steps = task.steps || [];
  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];
  const progress = getStepProgress(taskId);
  
  // Handle step completion
  const handleStepComplete = (verificationData: VerificationData) => {
    // If there are more steps, advance to the next one
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      
      // Notify the Bounce system of progress
      sendTaskUpdate({
        taskId: taskId,
        stepIndex: currentStepIndex,
        status: 'completed',
        verificationData
      });
      
      // Show success toast
      toast({
        title: "Step Completed",
        description: "Moving to the next step in the task.",
        duration: 3000,
      });
    } else {
      // This was the last step, complete the whole task
      setIsCompleted(true);
      
      // Notify the Bounce system of task completion
      sendTaskUpdate({
        taskId: taskId,
        stepIndex: currentStepIndex,
        status: 'completed',
        verificationData
      });
      
      // Call the completeTask function
      completeTask(taskId, {
        completedAt: new Date(),
        verificationData
      });
      
      // Show completion toast
      toast({
        title: "Task Completed!",
        description: `You've earned ${task.totalXpReward} XP for completing this task.`,
        duration: 4000,
      });
    }
  };
  
  // Move to the next step without verification (for optional steps)
  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      
      // Notify the Bounce system of skipping
      sendTaskUpdate({
        taskId: taskId,
        stepIndex: currentStepIndex,
        status: 'skipped',
        verificationData: null
      });
    }
  };
  
  // Render task completion screen
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mt-3 text-center"
      >
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center mb-2">
          <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-medium text-green-700 dark:text-green-300 mb-1">Task Completed!</h3>
        <p className="text-sm text-green-600 dark:text-green-400 mb-3">
          You've earned {task.totalXpReward} XP for your contribution.
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Thank you for helping improve Pickle+!
        </div>
      </motion.div>
    );
  }
  
  // Render current step
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Step {currentStepIndex + 1} of {totalSteps}
        </div>
        <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
          {progress}% Complete
        </div>
      </div>
      
      <Progress value={progress} className="h-1 mb-3" />
      
      <Separator className="my-2" />
      
      <BounceGuidedTaskStep
        step={currentStep}
        isActive={true}
        isCompleted={false}
        onComplete={handleStepComplete}
        onNext={currentStep.optional ? handleNextStep : undefined}
        stepNumber={currentStepIndex + 1}
        totalSteps={totalSteps}
      />
      
      {currentStep.optional && (
        <div className="flex justify-end mt-2">
          <Button
            variant="ghost" 
            size="sm"
            className="text-xs"
            onClick={handleNextStep}
          >
            Skip <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};