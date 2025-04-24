/**
 * PKL-278651-COACH-0001-UI
 * AI Coach Page Component
 * 
 * This page provides AI-powered coaching features for users.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AICoachPanel } from '@/components/ai-coach/AICoachPanel';
import { Dumbbell, ChevronRight, Zap, Award, TrendingUp, BookOpen } from 'lucide-react';

const CoachPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6 space-y-12 max-w-6xl">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          AI Pickle Coach
        </h1>
        <p className="text-muted-foreground text-lg">
          Your personalized AI coach helps improve your game with data-driven insights
        </p>
        <Separator className="my-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <AICoachPanel />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your CourtIQ™ Score
              </CardTitle>
              <CardDescription>
                Your multi-dimensional skill ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Technical</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-6 bg-primary rounded-full"
                      />
                    ))}
                    {[1, 2].map((_, i) => (
                      <div
                        key={i + 3}
                        className="w-2 h-6 bg-muted rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium">Tactical</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-6 bg-primary rounded-full"
                      />
                    ))}
                    {[1].map((_, i) => (
                      <div
                        key={i + 4}
                        className="w-2 h-6 bg-muted rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium">Physical</div>
                  <div className="flex space-x-1">
                    {[1, 2].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-6 bg-primary rounded-full"
                      />
                    ))}
                    {[1, 2, 3].map((_, i) => (
                      <div
                        key={i + 2}
                        className="w-2 h-6 bg-muted rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium">Mental</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-6 bg-primary rounded-full"
                      />
                    ))}
                    {[1].map((_, i) => (
                      <div
                        key={i + 4}
                        className="w-2 h-6 bg-muted rounded-full"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-medium">Consistency</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-6 bg-primary rounded-full"
                      />
                    ))}
                    {[1, 2].map((_, i) => (
                      <div
                        key={i + 3}
                        className="w-2 h-6 bg-muted rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button className="w-full mt-4 gap-1">
                <TrendingUp className="h-4 w-4" />
                View Full Analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Learning Resources
              </CardTitle>
              <CardDescription>
                Recommended videos and articles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border rounded-md">
                <div className="font-medium">Backhand Techniques</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Master the stacked paddle grip for controlled backhand shots
                </p>
                <Button variant="link" className="text-xs p-0 h-auto mt-1" asChild>
                  <a href="#" className="flex items-center">
                    Watch video <ChevronRight className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
              <div className="p-3 border rounded-md">
                <div className="font-medium">Dink Strategy Guide</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Learn the key principles of effective soft game
                </p>
                <Button variant="link" className="text-xs p-0 h-auto mt-1" asChild>
                  <a href="#" className="flex items-center">
                    Read article <ChevronRight className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
              <div className="p-3 border rounded-md">
                <div className="font-medium">Court Positioning</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Advanced court coverage for intermediate players
                </p>
                <Button variant="link" className="text-xs p-0 h-auto mt-1" asChild>
                  <a href="#" className="flex items-center">
                    Watch video <ChevronRight className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Next Level Tips
              </CardTitle>
              <CardDescription>
                Based on your recent games, here are some tips to improve your play
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Shot Selection</h4>
                  <p className="text-sm text-muted-foreground">
                    Your third shot drop has improved, but data shows you're still relying 
                    too heavily on the drive. Try using the drop shot more consistently to 
                    set up better net play opportunities.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Court Positioning</h4>
                  <p className="text-sm text-muted-foreground">
                    Analysis shows you're staying back from the kitchen line too often. 
                    Focus on getting to the non-volley zone quickly after your third shot drop.
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Shot Selection</h4>
                  <p className="text-sm text-muted-foreground">
                    Your dinking pattern becomes predictable after 3-4 exchanges. 
                    Practice changing directions and speeds to keep opponents guessing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoachPage;