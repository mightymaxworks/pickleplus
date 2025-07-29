/**
 * PKL-278651-JOUR-002.3: Emotionally Adaptive Prompt Component
 * 
 * This component displays different prompts and content based on the user's
 * detected emotional state. It adapts both its appearance and messaging to
 * provide emotionally intelligent guidance.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-28
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  ArrowRight, 
  Shield, 
  PenTool,
  Lightbulb,
  Target,
  Award,
  Smile,
  ThumbsUp
} from 'lucide-react';
import { useEmotion } from '../contexts/EmotionContext';
import { useJourneyRoles } from '../hooks/useJourneyRoles';
import { UserRole } from '@/lib/roles';

// Import emotion-related images
import excitedProudImage from '@assets/Pickle (10).png';
import determinedGrowthImage from '@assets/Untitled design (50).png';
import frustratedImage from '@assets/Pickle (12).png';
import neutralImage from '@assets/IMG_6517.png';

interface EmotionallyAdaptivePromptProps {
  className?: string;
}

export function EmotionallyAdaptivePrompt({ className }: EmotionallyAdaptivePromptProps) {
  const { 
    currentEmotionalState, 
    getEmotionalTone, 
    getEmotionalColor, 
    getEmotionalIntensity,
    isEmotionallyStable
  } = useEmotion();
  
  const { primaryRole, getRoleLabel } = useJourneyRoles();
  
  // Select an icon based on emotional state
  const getEmotionIcon = () => {
    switch (currentEmotionalState) {
      case 'frustrated-disappointed':
        return <Shield className="h-5 w-5" />;
      case 'anxious-uncertain':
        return <Heart className="h-5 w-5" />;
      case 'neutral-focused':
        return <PenTool className="h-5 w-5" />;
      case 'excited-proud':
        return <Smile className="h-5 w-5" />;
      case 'determined-growth':
        return <Target className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };
  
  // Get title based on emotional state and role
  const getTitle = () => {
    const tone = getEmotionalTone();
    const roleLabel = getRoleLabel(primaryRole).toLowerCase();
    
    switch (tone) {
      case 'negative':
        return `Reflection Time (${roleLabel})`;
      case 'neutral':
        return `Today's ${roleLabel} Focus`;
      case 'positive':
        return `Celebrate Your ${roleLabel} Win`;
      case 'growth':
        return `${roleLabel} Growth Opportunity`;
      default:
        return `${roleLabel} Prompt`;
    }
  };
  
  // Get description based on emotional state
  const getDescription = () => {
    const tone = getEmotionalTone();
    
    switch (tone) {
      case 'negative':
        return "Let's work through this challenge together";
      case 'neutral':
        return "Consistent practice leads to improvement";
      case 'positive':
        return "Acknowledge your progress and achievements";
      case 'growth':
        return "Challenge yourself to reach new heights";
      default:
        return "Reflect on your pickleball journey";
    }
  };
  
  // Get emotionally appropriate prompt based on role and emotional state
  const getPrompt = () => {
    const roleSpecificPrompts: Record<UserRole, Record<string, string[]>> = {
      [UserRole.PLAYER]: {
        'negative': [
          "What specific aspect of the game is challenging you right now?",
          "Describe a recent setback and one thing you learned from it.",
          "What techniques have helped you overcome frustration in the past?"
        ],
        'neutral': [
          "What skill are you most focused on improving this week?",
          "Describe your pre-game routine and how it helps your performance.",
          "What aspect of your game feels most consistent right now?"
        ],
        'positive': [
          "What recent achievement are you most proud of?",
          "How has your hard work paid off in your recent matches?",
          "What technique has improved the most since you started?"
        ],
        'growth': [
          "What's one skill you want to master in the next month?",
          "Which player do you admire, and what quality would you like to adopt?",
          "What's the next level of performance you're targeting?"
        ]
      },
      [UserRole.COACH]: {
        'negative': [
          "What coaching challenge is currently testing your patience?",
          "When students struggle, what approach helps you stay positive?",
          "What's one teaching method that didn't work as expected?"
        ],
        'neutral': [
          "What coaching technique are you currently refining?",
          "How do you balance technical instruction with keeping sessions fun?",
          "What's one coaching resource you've found valuable lately?"
        ],
        'positive': [
          "Which student has shown remarkable improvement recently?",
          "What new coaching approach has worked particularly well?",
          "How has your coaching philosophy evolved in a positive way?"
        ],
        'growth': [
          "What aspect of your coaching do you want to develop further?",
          "Which advanced certification or training interests you?",
          "How are you expanding your coaching toolkit this season?"
        ]
      },
      [UserRole.REFEREE]: {
        'negative': [
          "What challenging call or situation tested you recently?",
          "How do you handle player disagreements with your calls?",
          "What aspect of officiating do you find most difficult?"
        ],
        'neutral': [
          "What aspect of the rulebook are you focusing on mastering?",
          "How do you maintain focus throughout a long tournament day?",
          "What's your routine for preparing to officiate a match?"
        ],
        'positive': [
          "What feedback have you received about your officiating recently?",
          "Describe a match where your calls were particularly precise.",
          "How has your confidence as a referee grown?"
        ],
        'growth': [
          "What's the next level of officiating you're aspiring to?",
          "Which advanced officiating skill are you developing?",
          "How are you contributing to officiating standards in your community?"
        ]
      },
      [UserRole.ADMIN]: {
        'negative': [
          "What administrative challenge is currently requiring your attention?",
          "How do you handle community member concerns or complaints?",
          "What aspect of organization management has been difficult lately?"
        ],
        'neutral': [
          "What administrative process are you currently streamlining?",
          "How do you balance growth objectives with maintaining quality?",
          "What's your approach to delegating responsibilities effectively?"
        ],
        'positive': [
          "What recent community initiative has been particularly successful?",
          "How has member feedback shaped your recent decisions?",
          "What aspect of your administration are you most proud of?"
        ],
        'growth': [
          "What's your vision for the community in the next year?",
          "Which new programs or initiatives are you planning?",
          "How are you developing your leadership skills?"
        ]
      }
    };
    
    const tone = getEmotionalTone();
    const prompts = roleSpecificPrompts[primaryRole][tone] || roleSpecificPrompts[UserRole.PLAYER]['neutral'];
    
    // Randomly select one prompt from the appropriate category
    return prompts[Math.floor(Math.random() * prompts.length)];
  };
  
  // Adjust the UI style based on emotional state
  const getCardStyle = () => {
    const tone = getEmotionalTone();
    const intensity = getEmotionalIntensity();
    
    switch (tone) {
      case 'negative':
        return {
          borderColor: intensity === 'high' ? 'border-red-300' : 'border-red-200',
          bgColor: intensity === 'high' ? 'bg-red-50' : ''
        };
      case 'positive':
        return {
          borderColor: intensity === 'high' ? 'border-green-300' : 'border-green-200',
          bgColor: intensity === 'high' ? 'bg-green-50' : ''
        };
      case 'growth':
        return {
          borderColor: intensity === 'high' ? 'border-purple-300' : 'border-purple-200',
          bgColor: intensity === 'high' ? 'bg-purple-50' : ''
        };
      default:
        return {
          borderColor: '',
          bgColor: ''
        };
    }
  };
  
  const { borderColor, bgColor } = getCardStyle();
  const colorClass = getEmotionalColor();
  
  return (
    <Card className={`${className} ${borderColor} ${bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className={`mr-2 ${colorClass}`}>{getEmotionIcon()}</span>
          {getTitle()}
        </CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/40 rounded-md border border-border/50 relative overflow-hidden">
          <div className="flex items-start gap-4">
            {/* Visual emotion indicator */}
            <div className={`shrink-0 hidden md:block ${colorClass} opacity-75`}>
              <img
                src={
                  currentEmotionalState === 'excited-proud' ? excitedProudImage :
                  currentEmotionalState === 'determined-growth' ? determinedGrowthImage : 
                  currentEmotionalState === 'frustrated-disappointed' ? frustratedImage :
                  neutralImage
                }
                alt={`Emotion visualization: ${currentEmotionalState}`}
                className="w-16 h-16 object-contain rounded-md"
              />
            </div>
            
            {/* Prompt text */}
            <div>
              <p className="text-lg font-medium mb-1">{getPrompt()}</p>
              <p className="text-xs text-muted-foreground">
                Prompt tailored for your current state as a {getRoleLabel(primaryRole).toLowerCase()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="text-xs">
            Skip
          </Button>
          <Button size="sm" className="text-xs gap-1">
            Reflect <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmotionallyAdaptivePrompt;