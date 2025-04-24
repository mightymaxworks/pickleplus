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

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, ClipboardList, Book, Brain, Dumbbell, Star } from "lucide-react";

// Type definitions for SAGE coaching data
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

export default function SageCoachingPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  
  // Fetch coaching sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/coach/sage/sessions"],
    enabled: !!user,
  });
  
  // Fetch session details when a session is selected
  const { data: sessionDetails, isLoading: isLoadingSessionDetails } = useQuery({
    queryKey: ["/api/coach/sage/sessions", activeSessionId],
    enabled: !!activeSessionId,
  });
  
  // Fetch training plan details when a plan is selected
  const { data: planDetails, isLoading: isLoadingPlanDetails } = useQuery({
    queryKey: ["/api/coach/sage/training-plans", activePlanId],
    enabled: !!activePlanId,
  });
  
  // Generate a new coaching session
  const generateSessionMutation = useMutation({
    mutationFn: async (data: { sessionType: string; dimensionFocus: string }) => {
      const response = await fetch("/api/coach/sage/generate-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate coaching session");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/sage/sessions"] });
      toast({
        title: "Coaching session created",
        description: "Your new coaching session has been generated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error creating session",
        description: error.message,
      });
    },
  });
  
  // Generate a training plan for a session
  const generatePlanMutation = useMutation({
    mutationFn: async ({ sessionId, durationDays }: { sessionId: number; durationDays?: number }) => {
      const response = await fetch(`/api/coach/sage/sessions/${sessionId}/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationDays: durationDays || 7 }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate training plan");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/sage/sessions", activeSessionId] });
      toast({
        title: "Training plan created",
        description: "Your new training plan has been generated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error creating plan",
        description: error.message,
      });
    },
  });
  
  // Mark exercise as complete/incomplete
  const markExerciseMutation = useMutation({
    mutationFn: async ({ exerciseId, completed }: { exerciseId: number; completed: boolean }) => {
      const response = await fetch(`/api/coach/sage/exercises/${exerciseId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update exercise status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/sage/training-plans", activePlanId] });
      toast({
        title: "Exercise updated",
        description: "Exercise status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error updating exercise",
        description: error.message,
      });
    },
  });
  
  // Generate a new session for a specific dimension
  const handleGenerateSession = (dimensionFocus: string) => {
    generateSessionMutation.mutate({
      sessionType: "GENERAL",
      dimensionFocus,
    });
  };
  
  // Generate a training plan for the active session
  const handleGeneratePlan = () => {
    if (activeSessionId) {
      generatePlanMutation.mutate({ sessionId: activeSessionId });
    }
  };
  
  // Toggle exercise completion status
  const handleToggleExercise = (exerciseId: number, currentStatus: boolean) => {
    markExerciseMutation.mutate({
      exerciseId,
      completed: !currentStatus,
    });
  };
  
  // Render dimension badge with appropriate color
  const renderDimensionBadge = (dimensionCode: string) => {
    let color;
    let label;
    
    switch (dimensionCode) {
      case "TECH":
        color = "bg-blue-500";
        label = "Technical";
        break;
      case "TACT":
        color = "bg-purple-500";
        label = "Tactical";
        break;
      case "PHYS":
        color = "bg-green-500";
        label = "Physical";
        break;
      case "MENT":
        color = "bg-yellow-500";
        label = "Mental";
        break;
      case "CONS":
        color = "bg-red-500";
        label = "Consistency";
        break;
      default:
        color = "bg-gray-500";
        label = dimensionCode;
    }
    
    return (
      <Badge className={`${color} text-white`}>
        {label}
      </Badge>
    );
  };
  
  // Loading state for the entire panel
  if (isLoadingSessions) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">S.A.G.E. Coaching</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Skills Assessment & Growth Engine - Your Rule-Based Pickleball Coach
        </p>
      </div>
      
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sessions">Coaching Sessions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="training">Training Plans</TabsTrigger>
        </TabsList>
        
        {/* Coaching Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Session</CardTitle>
                <CardDescription>
                  Start a new coaching session focused on a specific dimension
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateSession("TECH")}
                  disabled={generateSessionMutation.isPending}
                  className="flex items-center justify-start gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Technical Skills
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateSession("TACT")}
                  disabled={generateSessionMutation.isPending}
                  className="flex items-center justify-start gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Tactical Awareness
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateSession("PHYS")}
                  disabled={generateSessionMutation.isPending}
                  className="flex items-center justify-start gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Physical Fitness
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleGenerateSession("MENT")}
                  disabled={generateSessionMutation.isPending}
                  className="flex items-center justify-start gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Mental Toughness
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleGenerateSession("CONS")}
                  disabled={generateSessionMutation.isPending}
                  className="flex items-center justify-start gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Consistency
                </Button>
              </CardContent>
              {generateSessionMutation.isPending && (
                <CardFooter>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating your coaching session...
                  </div>
                </CardFooter>
              )}
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Coaching Sessions</CardTitle>
                <CardDescription>
                  Select a session to view insights and training plans
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[320px] overflow-y-auto">
                {sessions && sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((session: CoachingSession) => (
                      <div 
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-accent ${
                          activeSessionId === session.id ? "border-primary bg-accent" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{session.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {renderDimensionBadge(session.dimensionFocus)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No coaching sessions yet. Create your first session to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Selected Session Details */}
          {activeSessionId && sessionDetails && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{sessionDetails.session.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {sessionDetails.session.description}
                    </CardDescription>
                  </div>
                  {renderDimensionBadge(sessionDetails.session.dimensionFocus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Insights</h3>
                    {sessionDetails.insights && sessionDetails.insights.length > 0 ? (
                      <div className="space-y-2">
                        {sessionDetails.insights.map((insight: CoachingInsight) => (
                          <div key={insight.id} className="rounded-md border p-3">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{insight.title}</div>
                              {renderDimensionBadge(insight.dimensionCode)}
                            </div>
                            <div className="mt-2 text-sm">
                              {insight.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        No insights yet for this session.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={handleGeneratePlan}
                  disabled={generatePlanMutation.isPending}
                  className="flex-1"
                >
                  {generatePlanMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Generate Training Plan
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {activeSessionId && sessionDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Insights for {sessionDetails.session.title}
                </h2>
                {renderDimensionBadge(sessionDetails.session.dimensionFocus)}
              </div>
              
              {sessionDetails.insights && sessionDetails.insights.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {sessionDetails.insights.map((insight: CoachingInsight) => (
                    <Card key={insight.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{insight.title}</CardTitle>
                          {renderDimensionBadge(insight.dimensionCode)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{insight.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <Book className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">No insights available</p>
                    <p className="mt-2 text-muted-foreground">
                      Select a coaching session first or create a new one.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No session selected</p>
                <p className="mt-2 text-muted-foreground">
                  Select a coaching session first to view your insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Training Plans Tab */}
        <TabsContent value="training" className="space-y-4">
          {activePlanId && planDetails ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{planDetails.plan.title}</h2>
                {renderDimensionBadge(planDetails.plan.primaryDimensionFocus)}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Plan Overview</CardTitle>
                  <CardDescription>{planDetails.plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Duration</div>
                      <div className="mt-1 font-medium">{planDetails.plan.durationDays} days</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Difficulty</div>
                      <div className="mt-1 font-medium">{planDetails.plan.difficultyLevel}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Status</div>
                      <div className="mt-1 font-medium">{planDetails.plan.status}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {planDetails.exercises && planDetails.exercises.length > 0 ? (
                <div className="space-y-4">
                  {/* Group exercises by day */}
                  {Array.from(
                    { length: planDetails.plan.durationDays },
                    (_, dayIndex) => dayIndex + 1
                  ).map((day) => {
                    const dayExercises = planDetails.exercises.filter(
                      (ex: TrainingExercise) => ex.dayNumber === day
                    );
                    
                    if (dayExercises.length === 0) return null;
                    
                    return (
                      <Card key={`day-${day}`}>
                        <CardHeader>
                          <CardTitle>Day {day}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {dayExercises
                            .sort((a, b) => a.orderInDay - b.orderInDay)
                            .map((exercise: TrainingExercise) => (
                              <div 
                                key={exercise.id}
                                className={`flex items-start justify-between rounded-md border p-3 ${
                                  exercise.isCompleted ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <div className="font-medium">{exercise.title}</div>
                                    <div className="ml-2">
                                      {renderDimensionBadge(exercise.dimensionCode)}
                                    </div>
                                  </div>
                                  <div className="mt-1 text-sm">{exercise.description}</div>
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-medium">Instructions: </span>
                                    {exercise.instructions}
                                  </div>
                                  <div className="mt-1 text-sm text-muted-foreground">
                                    <span className="font-medium">Duration: </span>
                                    {exercise.durationMinutes} minutes
                                  </div>
                                </div>
                                <Button
                                  variant={exercise.isCompleted ? "default" : "outline"}
                                  className="ml-4 shrink-0"
                                  onClick={() => handleToggleExercise(exercise.id, exercise.isCompleted)}
                                  disabled={markExerciseMutation.isPending}
                                >
                                  {exercise.isCompleted ? "Completed" : "Mark Complete"}
                                </Button>
                              </div>
                            ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center">
                    <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">No exercises available</p>
                    <p className="mt-2 text-muted-foreground">
                      This training plan doesn't have any exercises yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : activeSessionId && sessionDetails ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Training Plans</CardTitle>
                  <CardDescription>
                    Training plans for {sessionDetails.session.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* If no plans, show create button */}
                  <div className="text-center py-10">
                    <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-medium">No training plans yet</p>
                    <p className="mt-2 text-muted-foreground">
                      Generate a training plan to start improving your skills.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={handleGeneratePlan}
                      disabled={generatePlanMutation.isPending}
                    >
                      {generatePlanMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Generate Training Plan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No session selected</p>
                <p className="mt-2 text-muted-foreground">
                  Select a coaching session first to view or create training plans.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}