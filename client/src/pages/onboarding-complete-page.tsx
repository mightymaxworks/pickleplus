/**
 * PKL-278651-COURTIQ-0002-GUIDANCE - Simple Version
 * Onboarding Completion Page
 * 
 * A simple standalone page that shows next steps after onboarding
 */

import React from 'react';
import { useLocation } from 'wouter';
import { 
  CheckCircle, 
  Award, 
  BarChart, 
  Users, 
  Calendar,
  Trophy,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Extremely simple "next steps" page that appears after onboarding
 */
export default function OnboardingCompletePage() {
  const [, setLocation] = useLocation();

  // Simple list of next steps with URLs
  const nextSteps = [
    {
      title: "View your dashboard",
      description: "See your ratings, stats, and progress all in one place",
      icon: <BarChart className="h-5 w-5 text-blue-500" />,
      url: "/dashboard"
    },
    {
      title: "Record a match",
      description: "Start tracking your games and earn XP",
      icon: <Trophy className="h-5 w-5 text-green-500" />,
      url: "/match/record"
    },
    {
      title: "Find communities",
      description: "Connect with other pickleball players",
      icon: <Users className="h-5 w-5 text-purple-500" />,
      url: "/communities"
    },
    {
      title: "Browse tournaments",
      description: "Find and register for upcoming events",
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
      url: "/tournaments"
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-6 w-6" />
            <CardTitle className="text-white">Onboarding Complete!</CardTitle>
          </div>
          <div className="flex items-center mt-2 bg-white/20 rounded px-3 py-2">
            <Award className="h-8 w-8 text-yellow-300 mr-2" />
            <div>
              <div className="font-bold">350 XP Earned</div>
              <div className="text-sm opacity-90">Great start to your Pickle+ journey!</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="mt-4">
          <h3 className="text-lg font-medium mb-4">What would you like to do next?</h3>
          
          <div className="space-y-2">
            {nextSteps.map((step, index) => (
              <React.Fragment key={index}>
                <div 
                  className="flex items-center gap-3 p-3 border rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setLocation(step.url)}
                >
                  <div className="flex-shrink-0">
                    {step.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                {index < nextSteps.length - 1 && <Separator className="my-1" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end border-t pt-4">
          <Button onClick={() => setLocation('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}