/**
 * PKL-278651-JOUR-001.3: Emotion Reporter Component
 * 
 * A component that allows users to report their emotional state
 * with intuitive UI and visual feedback.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import React from 'react';
import { useEmotion } from '../contexts/EmotionContext';
import { EmotionalState } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Frown, Meh, Smile, Award, Star } from 'lucide-react';

interface EmotionReporterProps {
  className?: string;
}

interface EmotionOption {
  state: EmotionalState;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

/**
 * Component for reporting current emotional state
 */
export function EmotionReporter({ className }: EmotionReporterProps) {
  const { currentEmotionalState, reportEmotionalState } = useEmotion();
  
  // Define the emotion options with icons and descriptions
  const emotionOptions: EmotionOption[] = [
    {
      state: 'frustrated-disappointed',
      icon: <Frown className="h-6 w-6" />,
      label: 'Frustrated',
      description: 'Feeling setbacks or disappointment',
      color: 'text-red-500'
    },
    {
      state: 'anxious-uncertain',
      icon: <Meh className="h-6 w-6" />,
      label: 'Anxious',
      description: 'Feeling nervous or uncertain',
      color: 'text-amber-500'
    },
    {
      state: 'neutral-focused',
      icon: <Meh className="h-6 w-6" />,
      label: 'Neutral',
      description: 'Feeling steady and focused',
      color: 'text-blue-500'
    },
    {
      state: 'excited-proud',
      icon: <Smile className="h-6 w-6" />,
      label: 'Excited',
      description: 'Feeling proud of achievements',
      color: 'text-green-500'
    },
    {
      state: 'determined-growth',
      icon: <Award className="h-6 w-6" />,
      label: 'Determined',
      description: 'Focused on growth and improvement',
      color: 'text-purple-500'
    }
  ];
  
  // Handler for emotion button click
  const handleEmotionClick = (state: EmotionalState) => {
    reportEmotionalState(state);
  };
  
  // Find the current emotion details
  const currentEmotion = emotionOptions.find(option => option.state === currentEmotionalState);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">How are you feeling?</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current emotional state display */}
        <div className="mb-4 p-3 bg-muted rounded-md flex items-center">
          <div className={`mr-3 ${currentEmotion?.color}`}>
            {currentEmotion?.icon}
          </div>
          <div>
            <p className="font-medium">{currentEmotion?.label}</p>
            <p className="text-xs text-muted-foreground">{currentEmotion?.description}</p>
          </div>
        </div>
        
        {/* Emotion selection grid */}
        <div className="grid grid-cols-5 gap-1">
          {emotionOptions.map((option) => (
            <Button
              key={option.state}
              variant={currentEmotionalState === option.state ? "default" : "outline"}
              size="sm"
              className={`flex flex-col items-center py-2 px-1 h-auto ${
                currentEmotionalState === option.state 
                  ? `bg-${option.color.split('-')[1]}-100 hover:bg-${option.color.split('-')[1]}-200` 
                  : ''
              }`}
              onClick={() => handleEmotionClick(option.state)}
            >
              <div className={option.color}>{option.icon}</div>
              <span className="mt-1 text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default EmotionReporter;