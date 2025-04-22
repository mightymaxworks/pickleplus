/**
 * PKL-278651-BOUNCE-0008-ASSIST - Bounce Assistance Request Enhancement
 * 
 * BounceGuidedTaskStep - Component for displaying and interacting with a single
 * step in a guided task. Handles various types of verification methods.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  ChevronRight, 
  Camera, 
  Code, 
  BookOpen, 
  Lightbulb, 
  AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  VerificationType, 
  GuidedTaskStep as GuidedTaskStepType, 
  VerificationData,
  useGuidedTask
} from '@/contexts/BounceGuidedTaskContext';

interface BounceGuidedTaskStepProps {
  step: GuidedTaskStepType;
  isActive: boolean;
  isCompleted: boolean;
  onComplete: (verificationData: VerificationData) => void;
  onNext?: () => void;
  stepNumber: number;
  totalSteps: number;
}

export const BounceGuidedTaskStep: React.FC<BounceGuidedTaskStepProps> = ({
  step,
  isActive,
  isCompleted,
  onComplete,
  onNext,
  stepNumber,
  totalSteps
}) => {
  const [verificationValue, setVerificationValue] = useState('');
  const [showEducationalContent, setShowEducationalContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = () => {
    setError(null);
    
    // Validation logic based on verification type
    if (step.verificationType === 'code' && verificationValue.trim().length < 3) {
      setError('Please enter a valid verification code');
      return;
    }
    
    if (step.verificationType === 'observation' && verificationValue.trim().length < 10) {
      setError('Please provide more detailed observations');
      return;
    }
    
    if (step.verificationType === 'screenshot' && !verificationValue) {
      setError('Please upload a screenshot');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate verification delay
    setTimeout(() => {
      const verificationData: VerificationData = {
        stepId: step.id,
        type: step.verificationType,
        data: verificationValue,
        timestamp: new Date()
      };
      
      onComplete(verificationData);
      setIsSubmitting(false);
      
      // Auto advance to next step if available
      if (onNext) {
        setTimeout(onNext, 500);
      }
    }, 1000);
  };
  
  // Create upload ref for screenshots
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // For demo purposes, just store the file name
    // In a real implementation, we'd upload the file to storage
    setVerificationValue(file.name);
  };
  
  const renderVerificationInput = () => {
    switch (step.verificationType) {
      case 'code':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={`verification-${step.id}`}>
              {step.verificationPrompt}
            </label>
            <Input
              id={`verification-${step.id}`}
              value={verificationValue}
              onChange={(e) => setVerificationValue(e.target.value)}
              placeholder="Enter verification code"
              className="font-mono"
              maxLength={16}
              disabled={isCompleted || isSubmitting}
            />
          </div>
        );
        
      case 'selection':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {step.verificationPrompt}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Option A', 'Option B', 'Option C', 'Option D'].map((option) => (
                <Button
                  key={option}
                  variant={verificationValue === option ? 'default' : 'outline'}
                  onClick={() => setVerificationValue(option)}
                  className="justify-start"
                  disabled={isCompleted || isSubmitting}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
        
      case 'observation':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={`verification-${step.id}`}>
              {step.verificationPrompt}
            </label>
            <Textarea
              id={`verification-${step.id}`}
              value={verificationValue}
              onChange={(e) => setVerificationValue(e.target.value)}
              placeholder="Describe what you observed..."
              className="min-h-[80px]"
              disabled={isCompleted || isSubmitting}
            />
          </div>
        );
        
      case 'screenshot':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {step.verificationPrompt}
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={verificationValue}
                readOnly
                placeholder="No file selected"
                className="flex-1"
                disabled={isCompleted || isSubmitting}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompleted || isSubmitting}
              >
                <Camera className="w-4 h-4 mr-2" />
                Browse
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isCompleted || isSubmitting}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Take a screenshot of the relevant page or feature
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // If step is not active or completed, show a compact view
  if (!isActive && !isCompleted) {
    return (
      <Card className="mb-3 border-gray-200 dark:border-gray-800">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 mr-2">
              <span className="text-xs">{stepNumber}</span>
            </div>
            {step.title}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  // If the step is completed, show a success state
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-3 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-800 mr-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              {step.title}
              <div className="ml-auto text-xs flex items-center text-green-600 dark:text-green-400">
                <span>+{step.xpReward} XP</span>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }
  
  // Active step - full view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-5 border-blue-200 dark:border-blue-900 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 mr-2">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{stepNumber}</span>
              </div>
              <CardTitle className="text-md font-medium text-blue-700 dark:text-blue-300">
                {step.title}
              </CardTitle>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Step {stepNumber} of {totalSteps}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {step.instructions}
          </div>
          
          {/* Educational content toggle */}
          {step.educationalContent && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-transparent"
                onClick={() => setShowEducationalContent(!showEducationalContent)}
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">
                  {showEducationalContent ? 'Hide' : 'Show'} learning tips
                </span>
              </Button>
              
              {showEducationalContent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-100 dark:border-amber-900/30"
                >
                  <div className="flex">
                    <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-xs text-amber-700 dark:text-amber-300">
                      {step.educationalContent}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          
          {/* Verification input area */}
          <div className="mt-4">
            {renderVerificationInput()}
            
            {/* Error message */}
            {error && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex justify-between items-center">
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {`Complete this step to earn +${step.xpReward} XP`}
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="relative"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              <span className="flex items-center">
                Verify Completion
                <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};