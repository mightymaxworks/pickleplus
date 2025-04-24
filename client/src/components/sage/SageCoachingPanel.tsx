/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Coaching Panel
 * 
 * This component provides the main interface for the SAGE coaching system.
 * It allows users to create coaching sessions, view insights, and manage training plans.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ChevronDown, ChevronRight, CheckCircle2, CircleDashed, Brain, Award, Dumbbell, PenTool, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';

// Interface for coaching session
interface CoachingSession {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: string;
  dimensionFocus: string;
  status: string;
  matchId: number | null;
  createdAt: string;
  updatedAt: string;
}

// Interface for coaching insight
interface CoachingInsight {
  id: number;
  sessionId: number;
  title: string;
  content: string;
  insightType: string;
  dimensionCode: string;
  priority: number;
  matchId?: number | null;
  createdAt: string;
}

// Interface for training plan
interface TrainingPlan {
  id: number;
  sessionId: number;
  title: string;
  description: string;
  durationDays: number;
  status: string;
  difficultyLevel: string;
  primaryDimensionFocus: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for training exercise
interface TrainingExercise {
  id: number;
  planId: number;
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number;
  dimensionCode: string;
  dayNumber: number;
  orderInDay: number;
  isCompleted: boolean;
  difficultyLevel: string;
  createdAt: string;
  updatedAt: string;
}

// Dimension mappings for icons and colors
const dimensionIcons = {
  TECH: <PenTool className="h-5 w-5" />,
  TACT: <Brain className="h-5 w-5" />,
  PHYS: <Dumbbell className="h-5 w-5" />,
  MENT: <Award className="h-5 w-5" />,
  CONS: <Target className="h-5 w-5" />
};

const dimensionColors = {
  TECH: "text-blue-500",
  TACT: "text-purple-500",
  PHYS: "text-orange-500",
  MENT: "text-green-500",
  CONS: "text-yellow-500"
};

const dimensionNames = {
  TECH: "Technical Skills",
  TACT: "Tactical Awareness",
  PHYS: "Physical Fitness",
  MENT: "Mental Toughness",
  CONS: "Consistency"
};

const sessionTypes = [
  { value: "ASSESSMENT", label: "Skill Assessment" },
  { value: "MATCH_REVIEW", label: "Match Review" },
  { value: "TRAINING", label: "Training Session" },
  { value: "MENTAL_COACHING", label: "Mental Coaching" }
];

export function SageCoachingPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sessionType, setSessionType] = useState("ASSESSMENT");
  const [dimensionFocus, setDimensionFocus] = useState("TECH");

  // Fetch coaching sessions
  const {
    data: sessions,
    isLoading: isLoadingSessions,
    error: sessionsError
  } = useQuery({
    queryKey: ['/api/coach/sage/sessions'],
    enabled: !!user
  });

  // Fetch specific session details when selected
  const {
    data: sessionDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useQuery({
    queryKey: ['/api/coach/sage/sessions', selectedSession],
    enabled: !!selectedSession
  });

  // Fetch training plan details when selected
  const {
    data: planDetails,
    isLoading: isLoadingPlan,
    error: planError
  } = useQuery({
    queryKey: ['/api/coach/sage/training-plans', selectedPlan],
    enabled: !!selectedPlan
  });

  // Generate a new coaching session
  const generateSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        'POST',
        '/api/coach/sage/generate-session',
        data
      );
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Coaching session created',
        description: 'Your personalized coaching insights are ready',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/sage/sessions'] });
      setSelectedSession(data.session.id);
      setCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create coaching session',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Generate a training plan for a session
  const generatePlanMutation = useMutation({
    mutationFn: async (data: { sessionId: number, durationDays: number }) => {
      const res = await apiRequest(
        'POST',
        `/api/coach/sage/sessions/${data.sessionId}/generate-plan`,
        { durationDays: data.durationDays }
      );
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Training plan created',
        description: 'Your personalized training plan is ready',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/sage/sessions', selectedSession] });
      setSelectedPlan(data.plan.id);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create training plan',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark exercise as complete
  const markExerciseMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      const res = await apiRequest(
        'PATCH',
        `/api/coach/sage/exercises/${id}/complete`,
        { completed }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/sage/training-plans', selectedPlan] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update exercise',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle generating a new coaching session
  const handleGenerateSession = () => {
    generateSessionMutation.mutate({
      sessionType,
      dimensionFocus
    });
  };

  // Handle generating a training plan
  const handleGeneratePlan = (sessionId: number) => {
    generatePlanMutation.mutate({
      sessionId,
      durationDays: 7
    });
  };

  // Handle marking an exercise as complete
  const handleMarkExercise = (id: number, completed: boolean) => {
    markExerciseMutation.mutate({ id, completed });
  };

  // Calculate completion percentage for a plan
  const calculatePlanCompletion = (exercises: TrainingExercise[]) => {
    if (!exercises || exercises.length === 0) return 0;
    const completed = exercises.filter(ex => ex.isCompleted).length;
    return Math.round((completed / exercises.length) * 100);
  };

  // Group exercises by day
  const groupExercisesByDay = (exercises: TrainingExercise[]) => {
    const grouped: Record<number, TrainingExercise[]> = {};
    
    if (exercises) {
      exercises.forEach(exercise => {
        if (!grouped[exercise.dayNumber]) {
          grouped[exercise.dayNumber] = [];
        }
        grouped[exercise.dayNumber].push(exercise);
      });
      
      // Sort exercises by orderInDay within each day
      Object.keys(grouped).forEach(day => {
        grouped[parseInt(day)].sort((a, b) => a.orderInDay - b.orderInDay);
      });
    }
    
    return grouped;
  };

  // Check if there are any errors
  if (sessionsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Coaching Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error loading your coaching data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">S.A.G.E. Coaching</h2>
          <p className="text-muted-foreground">Skills Assessment & Growth Engine</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Coaching Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Coaching Session</DialogTitle>
              <DialogDescription>
                Configure your coaching session below. SAGE will analyze your playing history and generate personalized insights.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="session-type" className="text-sm font-medium">Session Type</label>
                <Select
                  value={sessionType}
                  onValueChange={(value) => setSessionType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="dimension-focus" className="text-sm font-medium">Primary Focus</label>
                <Select
                  value={dimensionFocus}
                  onValueChange={(value) => setDimensionFocus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dimensionNames).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center">
                          <span className={dimensionColors[code as keyof typeof dimensionColors]}>
                            {dimensionIcons[code as keyof typeof dimensionIcons]}
                          </span>
                          <span className="ml-2">{name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleGenerateSession} 
                disabled={generateSessionMutation.isPending}
              >
                {generateSessionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Coaching Session"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingSessions ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Coaching Sessions</CardTitle>
                <CardDescription>
                  Select a session to view detailed insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((session: CoachingSession) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedSession === session.id
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className={`mr-2 ${dimensionColors[session.dimensionFocus as keyof typeof dimensionColors]}`}>
                              {dimensionIcons[session.dimensionFocus as keyof typeof dimensionIcons]}
                            </span>
                            <div>
                              <h3 className="font-medium">{session.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(session.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {selectedSession === session.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No coaching sessions yet. Create your first session to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 md:col-span-2">
            {selectedSession && sessionDetails ? (
              <Tabs defaultValue="insights">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="insights">Coaching Insights</TabsTrigger>
                  <TabsTrigger value="plan">Training Plan</TabsTrigger>
                </TabsList>
                <TabsContent value="insights" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{sessionDetails.session.title}</CardTitle>
                      <CardDescription>{sessionDetails.session.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sessionDetails.insights && sessionDetails.insights.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {sessionDetails.insights.map((insight: CoachingInsight) => (
                            <AccordionItem key={insight.id} value={`insight-${insight.id}`}>
                              <AccordionTrigger>
                                <div className="flex items-center">
                                  <span className={`mr-2 ${dimensionColors[insight.dimensionCode as keyof typeof dimensionColors]}`}>
                                    {dimensionIcons[insight.dimensionCode as keyof typeof dimensionIcons]}
                                  </span>
                                  {insight.title}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="whitespace-pre-line">
                                  {insight.content}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <p className="text-muted-foreground">No insights available for this session.</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleGeneratePlan(sessionDetails.session.id)}
                        disabled={generatePlanMutation.isPending}
                      >
                        {generatePlanMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Plan...
                          </>
                        ) : (
                          "Generate Training Plan"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="plan" className="space-y-4 mt-4">
                  {planDetails ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>{planDetails.plan.title}</CardTitle>
                        <CardDescription>{planDetails.plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Plan Completion</span>
                            <span className="text-sm font-medium">
                              {calculatePlanCompletion(planDetails.exercises)}%
                            </span>
                          </div>
                          <Progress value={calculatePlanCompletion(planDetails.exercises)} className="h-2" />
                        </div>
                        
                        {planDetails.exercises && planDetails.exercises.length > 0 ? (
                          <div className="space-y-6">
                            {Object.entries(groupExercisesByDay(planDetails.exercises)).map(([day, exercises]) => (
                              <div key={day} className="space-y-3">
                                <h3 className="text-lg font-medium">Day {day}</h3>
                                {exercises.map((exercise: TrainingExercise) => (
                                  <div 
                                    key={exercise.id} 
                                    className={`p-4 rounded-lg border ${exercise.isCompleted ? "bg-primary/5 border-primary/20" : "bg-card"}`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <div className="flex items-center">
                                          <span className={`mr-2 ${dimensionColors[exercise.dimensionCode as keyof typeof dimensionColors]}`}>
                                            {dimensionIcons[exercise.dimensionCode as keyof typeof dimensionIcons]}
                                          </span>
                                          <h4 className="font-medium">{exercise.title}</h4>
                                        </div>
                                        <p className="mt-1 text-sm">{exercise.description}</p>
                                        
                                        <Accordion type="single" collapsible className="w-full mt-2">
                                          <AccordionItem value={`instructions-${exercise.id}`}>
                                            <AccordionTrigger className="text-sm py-2">
                                              Instructions
                                            </AccordionTrigger>
                                            <AccordionContent>
                                              <div className="text-sm whitespace-pre-line">
                                                {exercise.instructions}
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        </Accordion>
                                        
                                        <div className="flex items-center mt-3 text-sm text-muted-foreground">
                                          <span>{exercise.durationMinutes} minutes</span>
                                          <span className="mx-2">•</span>
                                          <span>{exercise.difficultyLevel}</span>
                                        </div>
                                      </div>
                                      
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleMarkExercise(exercise.id, !exercise.isCompleted)}
                                      >
                                        {exercise.isCompleted ? (
                                          <CheckCircle2 className="h-5 w-5 text-primary" />
                                        ) : (
                                          <CircleDashed className="h-5 w-5" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No exercises available for this plan.</p>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>No Training Plan</CardTitle>
                        <CardDescription>
                          Generate a training plan from the Coaching Insights tab to see exercises.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select a Session</CardTitle>
                  <CardDescription>
                    Select a coaching session from the left to view insights and training plans.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      S.A.G.E. uses rule-based analysis to provide personalized coaching insights
                      and training plans based on your playing history and skill level.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SageCoachingPanel;