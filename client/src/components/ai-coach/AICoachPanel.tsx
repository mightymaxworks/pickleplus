/**
 * PKL-278651-COACH-0001-AI-UI
 * AI Coach Panel Component
 * 
 * This component provides the UI for interacting with the AI Coach.
 * It allows players to get personalized coaching advice, training plans,
 * and match analysis.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Lightbulb, Calendar, Award } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

/**
 * AI Coach Panel component
 */
export function AICoachPanel() {
  const { toast } = useToast();
  const [goals, setGoals] = useState<string>('');
  const [timeframe, setTimeframe] = useState<number>(4);
  const [activeTab, setActiveTab] = useState<string>('advice');

  // Query for getting coaching advice
  const {
    data: adviceData,
    isLoading: isAdviceLoading,
    error: adviceError,
    refetch: refetchAdvice
  } = useQuery<{ advice: string }>({
    queryKey: ['/api/coach/advice'],
    enabled: activeTab === 'advice',
  });

  // Mutation for generating a training plan
  const trainingPlanMutation = useMutation({
    mutationFn: async ({ goals, timeframe }: { goals: string; timeframe: number }) => {
      const res = await apiRequest('POST', '/api/coach/training-plan', { goals, timeframe });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Training Plan Generated',
        description: 'Your personalized training plan has been created.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Generate Training Plan',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Handle generating a training plan
  const handleGeneratePlan = () => {
    if (!goals) {
      toast({
        title: 'Missing Information',
        description: 'Please enter your training goals.',
        variant: 'destructive',
      });
      return;
    }
    
    trainingPlanMutation.mutate({ goals, timeframe });
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Lightbulb className="h-6 w-6" />
          AI Coach
        </CardTitle>
        <CardDescription>
          Get personalized coaching advice powered by advanced AI
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="advice" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="advice">Coaching Advice</TabsTrigger>
            <TabsTrigger value="plan">Training Plan</TabsTrigger>
            <TabsTrigger value="analysis">Match Analysis</TabsTrigger>
          </TabsList>
          
          {/* Coaching Advice Tab */}
          <TabsContent value="advice">
            <div className="space-y-4">
              <div className="bg-secondary/10 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Your Personal AI Coach</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant coaching advice based on your match history and performance metrics.
                  Our AI analyzes your strengths and weaknesses to provide targeted improvement suggestions.
                </p>
              </div>
              
              {isAdviceLoading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Analyzing your performance...</p>
                </div>
              ) : adviceError ? (
                <div className="bg-destructive/10 p-4 rounded-md text-center">
                  <p className="text-sm">
                    Unable to load coaching advice. Please try again later.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => refetchAdvice()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="bg-card border rounded-md p-4">
                  <div className="prose prose-sm max-w-none">
                    {adviceData?.advice ? (
                      <div dangerouslySetInnerHTML={{ __html: adviceData.advice.replace(/\n/g, '<br />') }} />
                    ) : (
                      <p className="text-muted-foreground italic">
                        Your coaching advice will appear here. If you don't see anything,
                        you may need to play more matches to generate meaningful advice.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => refetchAdvice()}
                disabled={isAdviceLoading}
              >
                {isAdviceLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh Advice
              </Button>
            </div>
          </TabsContent>
          
          {/* Training Plan Tab */}
          <TabsContent value="plan">
            <div className="space-y-4">
              <div className="bg-secondary/10 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Custom Training Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Get a personalized training plan designed to help you achieve your pickleball goals.
                  Our AI will create a structured plan based on your objectives and timeframe.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-3">
                  <Label htmlFor="goals">What are your training goals?</Label>
                  <Textarea
                    id="goals"
                    placeholder="e.g., Improve my third shot drop, increase my agility, prepare for a tournament..."
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="timeframe">Training plan duration (weeks)</Label>
                  <Input
                    id="timeframe"
                    type="number"
                    min={1}
                    max={12}
                    value={timeframe}
                    onChange={(e) => setTimeframe(Number(e.target.value))}
                  />
                </div>
              </div>
              
              {trainingPlanMutation.isPending ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Creating your training plan...</p>
                </div>
              ) : trainingPlanMutation.isSuccess ? (
                <div className="bg-card border rounded-md p-4">
                  <h4 className="font-semibold mb-2">{trainingPlanMutation.data.overview}</h4>
                  <Separator className="my-4" />
                  
                  <div className="space-y-6">
                    {trainingPlanMutation.data.weeks?.map((week: any) => (
                      <div key={`week-${week.week}`} className="space-y-2">
                        <h5 className="font-semibold text-sm">Week {week.week}: {week.focus}</h5>
                        
                        <div className="space-y-2">
                          {week.sessions?.map((session: any, idx: number) => (
                            <div key={`session-${idx}`} className="bg-muted/50 p-3 rounded-sm text-xs">
                              <div className="font-medium">{session.day} • {session.duration}</div>
                              <ul className="list-disc list-inside mt-1">
                                {session.activities?.map((activity: string, actIdx: number) => (
                                  <li key={`activity-${actIdx}`}>{activity}</li>
                                ))}
                              </ul>
                              {session.notes && (
                                <p className="mt-1 italic text-muted-foreground">{session.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleGeneratePlan}
                disabled={trainingPlanMutation.isPending || !goals}
              >
                {trainingPlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Training Plan
              </Button>
            </div>
          </TabsContent>
          
          {/* Match Analysis Tab */}
          <TabsContent value="analysis">
            <div className="space-y-4">
              <div className="bg-secondary/10 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Match Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed analysis of your recent matches. Our AI will identify patterns, 
                  strengths, and areas for improvement based on your match statistics.
                </p>
              </div>
              
              <div className="text-center p-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h4 className="font-semibold mb-2">Select a match to analyze</h4>
                <p className="text-sm text-muted-foreground">
                  Your recent matches will appear here. Select one to get a detailed AI analysis.
                </p>
                <Button variant="outline" className="mt-4" disabled>
                  No matches available
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-muted/20 flex flex-col items-start pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>Powered by advanced AI using the latest GPT-4o model</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AICoachPanel;