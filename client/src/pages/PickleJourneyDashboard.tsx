/**
 * PKL-278651-JOUR-001.4: PickleJourney™ Dashboard Page
 * 
 * This page serves as the main interface for the PickleJourney™ emotionally
 * intelligent journaling system, presenting users with their emotional journey
 * and relevant journal entries.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  EmotionReporter, 
  JournalEntryForm, 
  JournalTimeline,
  EmotionalJourneyVisualization,
  useEmotionDetection
} from '@/modules/picklejourney';
import { MainLayout } from '@/components/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Lightbulb, 
  BarChart, 
  RefreshCw,
  ArrowUpRight,
  Award,
  BarChart2,
  Brain
} from 'lucide-react';

export default function PickleJourneyDashboard() {
  const { currentEmotionalState } = useEmotionDetection();
  
  // Get SAGE advice based on emotional state
  const getSageAdvice = () => {
    switch(currentEmotionalState) {
      case 'frustrated-disappointed':
        return {
          title: "Dealing with Setbacks",
          content: "Everyone faces challenges in pickleball. Take time to reflect on what you can learn from this experience, and remember that setbacks are often the best teachers.",
          icon: <RefreshCw className="h-5 w-5 mr-2" />
        };
      case 'anxious-uncertain':
        return {
          title: "Finding Your Confidence",
          content: "Pre-game jitters are normal, even for pros. Focus on your preparation, trust your training, and remember specific shots or plays where you've succeeded in the past.",
          icon: <Brain className="h-5 w-5 mr-2" />
        };
      case 'neutral-focused':
        return {
          title: "Maintaining Consistency",
          content: "Great job staying balanced! This is the ideal state for skill development. Consider setting a specific goal for your next practice or match to keep your motivation strong.",
          icon: <BarChart2 className="h-5 w-5 mr-2" />
        };
      case 'excited-proud':
        return {
          title: "Building on Success",
          content: "Congratulations on your success! Take a moment to analyze what contributed to this positive outcome so you can replicate it in future matches.",
          icon: <ArrowUpRight className="h-5 w-5 mr-2" />
        };
      case 'determined-growth':
        return {
          title: "Harnessing Your Motivation",
          content: "Your growth mindset is your greatest asset. Channel this energy into deliberate practice focusing on specific skills that will elevate your game to the next level.",
          icon: <Award className="h-5 w-5 mr-2" />
        };
      default:
        return {
          title: "Daily Reflection",
          content: "Regular journaling about your pickleball journey helps identify patterns and accelerates improvement. Try to note both technical aspects and how you felt during play.",
          icon: <Lightbulb className="h-5 w-5 mr-2" />
        };
    }
  };
  
  const advice = getSageAdvice();
  
  return (
    <MainLayout>
      <Helmet>
        <title>PickleJourney™ | Pickle+</title>
      </Helmet>
      
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Your PickleJourney™</h1>
          <p className="text-muted-foreground">
            Track your emotional journey, record your experiences, and gain personalized insights.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Current State */}
          <div className="space-y-6">
            {/* Emotion Reporter */}
            <EmotionReporter />
            
            {/* SAGE Advice Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  SAGE Advice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {advice.icon}
                    <h3 className="font-medium">{advice.title}</h3>
                  </div>
                  <p className="text-sm">{advice.content}</p>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Get Custom Guidance
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Visualization */}
            <EmotionalJourneyVisualization timeRange="week" />
          </div>
          
          {/* Middle Column - Journal Entry Form */}
          <div className="md:col-span-2">
            <JournalEntryForm />
          </div>
        </div>
        
        {/* Journal Timeline - Full Width */}
        <div className="mt-4">
          <JournalTimeline limit={5} />
        </div>
        
        {/* Statistics and Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <BarChart className="h-5 w-5 mr-2" />
                Emotional Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Your most common emotional states:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-green-500">Excited</Badge>
                  <span className="text-sm">42%</span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-purple-500">Determined</Badge>
                  <span className="text-sm">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-blue-500">Neutral</Badge>
                  <span className="text-sm">15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-amber-500">Anxious</Badge>
                  <span className="text-sm">10%</span>
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-red-500">Frustrated</Badge>
                  <span className="text-sm">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="h-5 w-5 mr-2" />
                Journal Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">Your journal activity:</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Entries</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Week</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Streak</span>
                    <span className="font-medium">3 days</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Entries
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Lightbulb className="h-5 w-5 mr-2" />
                Growth Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Based on your emotional patterns:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="bg-green-500/20 text-green-600 p-1 rounded-full mt-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                  <span>
                    Try practices focused on handling high-pressure situations
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-purple-500/20 text-purple-600 p-1 rounded-full mt-0.5">
                    <Award className="h-3 w-3" />
                  </div>
                  <span>
                    Your determination is key to your progress - keep setting specific goals
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-500/20 text-blue-600 p-1 rounded-full mt-0.5">
                    <Brain className="h-3 w-3" />
                  </div>
                  <span>
                    Mental resilience training could help with pre-match anxiety
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}