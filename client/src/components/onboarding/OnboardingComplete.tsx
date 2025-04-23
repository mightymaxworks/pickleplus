/**
 * PKL-278651-COURTIQ-0002-GUIDANCE - Simplified Version
 * Next Steps After Onboarding
 * 
 * This is a simplified guidance page that shows users what they can do
 * after completing the onboarding process.
 */

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  CheckCircle, 
  Award, 
  BarChart, 
  Users, 
  Calendar,
  TrendingUp,
  ChevronRight,
  Trophy
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface OnboardingCompleteProps {
  xpEarned: number;
  className?: string;
}

/**
 * Simple Next Steps Component
 * 
 * Shows a straightforward list of places users can visit next
 * with direct links
 */
const OnboardingComplete: React.FC<OnboardingCompleteProps> = ({ 
  xpEarned = 350,
  className = ''
}) => {
  const [, setLocation] = useLocation();
  
  // Log the component rendering
  useEffect(() => {
    console.log("[OnboardingComplete] Component rendered with", xpEarned, "XP");
  }, [xpEarned]);

  // Simple list of next steps with URLs
  const nextSteps = [
    {
      title: "Go to your dashboard",
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
    <Card className={`w-full ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-6 w-6" />
          <CardTitle className="text-white">Onboarding Complete!</CardTitle>
        </div>
        <div className="flex items-center mt-2 bg-white/20 rounded px-3 py-2">
          <Award className="h-8 w-8 text-yellow-300 mr-2" />
          <div>
            <div className="font-bold">{xpEarned} XP Earned</div>
            <div className="text-sm opacity-90">Great start to your Pickle+ journey!</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <h3 className="text-lg font-medium mb-3">What would you like to do next?</h3>
        
        <div className="space-y-4">
          {nextSteps.map((step, index) => (
            <div 
              key={index}
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
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end border-t pt-4">
        <Button onClick={() => setLocation('/dashboard')}>
          Go to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingComplete;