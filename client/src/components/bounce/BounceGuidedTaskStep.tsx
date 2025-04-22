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
import { CheckCircle, ArrowRight, HelpCircle, AlertCircle, Camera, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GuidedTaskStepType, 
  VerificationData, 
  VerificationMethod 
} from '@/types/bounce';

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
  const [textInput, setTextInput] = useState('');
  const [textareaInput, setTextareaInput] = useState('');
  const [multipleChoiceSelection, setMultipleChoiceSelection] = useState<string | null>(null);
  
  // Handle verification submission
  const handleVerify = () => {
    // Different verification data based on the verification method
    const verificationData: VerificationData = {
      method: step.verificationMethod,
      timestamp: new Date(),
      data: {}
    };
    
    // Add the appropriate data based on verification method
    switch (step.verificationMethod) {
      case 'manual_confirmation':
        verificationData.data = { confirmed: true };
        break;
        
      case 'text_input':
        verificationData.data = { input: textInput };
        break;
        
      case 'textarea_input':
        verificationData.data = { input: textareaInput };
        break;
        
      case 'multiple_choice':
        verificationData.data = { 
          selection: multipleChoiceSelection,
          options: step.verificationOptions 
        };
        break;
        
      case 'screenshot_upload':
        // Placeholder for screenshot - would typically integrate with a file upload
        verificationData.data = { 
          screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' 
        };
        break;
        
      default:
        verificationData.data = { default: true };
    }
    
    // Call the onComplete callback with the verification data
    onComplete(verificationData);
  };
  
  // Render verification controls based on the verification method
  const renderVerificationControls = () => {
    switch (step.verificationMethod) {
      case 'text_input':
        return (
          <div className="mt-3">
            <Label htmlFor="text-verification" className="text-xs mb-2">
              {step.verificationPrompt || 'Please provide your answer:'}
            </Label>
            <Input
              id="text-verification"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={step.verificationPlaceholder || 'Type your answer here...'}
              className="text-sm"
            />
          </div>
        );
        
      case 'textarea_input':
        return (
          <div className="mt-3">
            <Label htmlFor="textarea-verification" className="text-xs mb-2">
              {step.verificationPrompt || 'Please provide your detailed answer:'}
            </Label>
            <Textarea
              id="textarea-verification"
              value={textareaInput}
              onChange={(e) => setTextareaInput(e.target.value)}
              placeholder={step.verificationPlaceholder || 'Type your detailed answer here...'}
              className="text-sm"
              rows={4}
            />
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="mt-3">
            <Label className="text-xs mb-2 block">
              {step.verificationPrompt || 'Please select one of the following:'}
            </Label>
            <RadioGroup 
              value={multipleChoiceSelection || ''}
              onValueChange={setMultipleChoiceSelection}
              className="space-y-1 mt-2"
            >
              {step.verificationOptions?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} className="w-4 h-4" />
                  <Label htmlFor={`option-${index}`} className="text-xs">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case 'screenshot_upload':
        return (
          <div className="mt-3">
            <Label className="text-xs mb-2 block">
              {step.verificationPrompt || 'Please take a screenshot of the completed step:'}
            </Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-4 mt-2 text-center">
              <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to capture a screenshot
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Determine if the verification is valid and the continue button should be enabled
  const isVerificationValid = () => {
    switch (step.verificationMethod) {
      case 'manual_confirmation':
        return true;
      case 'text_input':
        return textInput.trim().length > 0;
      case 'textarea_input':
        return textareaInput.trim().length > 0;
      case 'multiple_choice':
        return multipleChoiceSelection !== null;
      case 'screenshot_upload':
        // Simplified for this implementation
        return true;
      default:
        return true;
    }
  };
  
  // If step is not active, render a simple indicator
  if (!isActive) {
    return (
      <div className={`p-2 rounded-md ${
        isCompleted ? 'bg-gray-50 dark:bg-gray-900/20' : 'bg-gray-50 dark:bg-gray-900/10'
      }`}>
        <div className="flex items-center">
          {isCompleted ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-gray-300 mr-2" />
          )}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {step.title}
          </div>
        </div>
      </div>
    );
  }
  
  // Render active step
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50"
    >
      <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
        {step.title}
      </div>
      
      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-line">
        {step.description}
      </div>
      
      {/* Render instructions if present */}
      {step.instructions && step.instructions.length > 0 && (
        <Alert className="mb-3 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50">
          <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs text-amber-600 dark:text-amber-400 pl-2 whitespace-pre-line">
            {step.instructions}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Render verification controls */}
      {renderVerificationControls()}
      
      {/* Action buttons */}
      <div className="flex justify-between mt-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          {step.optional && (
            <span className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
              Optional
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {onNext && step.optional && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8"
              onClick={onNext}
            >
              Skip <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="default"
            size="sm"
            className="text-xs h-8"
            onClick={handleVerify}
            disabled={!isVerificationValid()}
          >
            {step.verificationMethod === 'manual_confirmation' ? 'Confirm' : 'Submit'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};