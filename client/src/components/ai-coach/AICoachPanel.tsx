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
    refetch: refetchAdvice,
    isError: isAdviceError
  } = useQuery<{ advice: string }>({
    queryKey: ['/api/coach/advice'],
    enabled: activeTab === 'advice',
    retry: 1, // Only retry once to avoid excessive failed calls
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
    
    // First attempt the API call
    trainingPlanMutation.mutate({ goals, timeframe });
    
    // If there's an authentication error, we'll show the default plan automatically via the UI
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Lightbulb className="h-6 w-6" />
          CourtIQ Pro
        </CardTitle>
        <CardDescription>
          Get personalized coaching insights powered by advanced intelligence
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs defaultValue="advice" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="advice">Coaching Advice</TabsTrigger>
            <TabsTrigger value="plan">Training Plan</TabsTrigger>
          </TabsList>
          
          {/* Coaching Advice Tab */}
          <TabsContent value="advice">
            <div className="space-y-4">
              <div className="bg-secondary/10 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Your Personal CourtIQ Pro Coach</h3>
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
              ) : isAdviceError ? (
                <div className="bg-card border rounded-md p-4">
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-semibold mb-2">Default Coaching Advice</h4>
                    <p>
                      Based on common pickleball skill development patterns, here are some general recommendations:
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li>Focus on consistent third shot drops to gain control of the point</li>
                      <li>Practice dinking with different paces and spins to create opportunities</li>
                      <li>Work on quick reaction volleys at the kitchen line</li>
                      <li>Develop a reliable serve with placement variation</li>
                      <li>Improve court positioning and movement patterns with your partner</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      Note: This is general advice. For personalized coaching, please log in and play more matches.
                    </p>
                  </div>
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
                <h3 className="font-semibold mb-2">CourtIQ Pro Training Plan</h3>
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
              ) : trainingPlanMutation.isError || goals ? (
                <div className="bg-card border rounded-md p-4">
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-semibold mb-2">Personalized Training Plan</h4>
                    <p>
                      {goals ? `Based on your goal to "${goals}", here's a training plan:` : 
                        "Here's a general training plan to improve your pickleball skills:"}
                    </p>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <h5 className="font-semibold text-sm">Week 1: Fundamentals & Targeted Skills</h5>
                        <ul className="mt-1 space-y-1 text-sm">
                          <li>Monday: 45min - Warm-up drills & skill-specific practice</li>
                          <li>Wednesday: 60min - Serving accuracy & movement training</li>
                          <li>Saturday: 90min - Friendly games with focus on application</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-sm">Week 2: Advanced Techniques & Strategy</h5>
                        <ul className="mt-1 space-y-1 text-sm">
                          <li>Tuesday: 60min - Third shot options & transition zone play</li>
                          <li>Thursday: 45min - Kitchen line strategy & tactical play</li>
                          <li>Sunday: 75min - Game scenarios with targeted feedback</li>
                        </ul>
                      </div>
                      
                      {timeframe > 2 && (
                        <div>
                          <h5 className="font-semibold text-sm">Week 3-{timeframe}: Progressive Development</h5>
                          <ul className="mt-1 space-y-1 text-sm">
                            <li>3 sessions per week with increasing intensity</li>
                            <li>Weekly progression focusing on different skill aspects</li>
                            <li>Regular assessment to track improvement</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {trainingPlanMutation.isError ? (
                      <p className="text-sm text-muted-foreground mt-4">
                        Note: For a more detailed plan based on your specific goals, please log in.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-4">
                        Click "Generate Training Plan" for a more detailed version customized to your goals.
                      </p>
                    )}
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
          

        </Tabs>
      </CardContent>
      
      <CardFooter className="bg-muted/20 flex flex-col items-start pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4" />
          <span>Powered by CourtIQ™ advanced analytics technology</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AICoachPanel;