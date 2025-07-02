/**
 * PKL-278651-COACH-GOALS-001 - Goals Dashboard
 * 
 * Comprehensive goal display and management dashboard for the coach-player ecosystem.
 * Shows active goals, progress tracking, and quick actions.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Target, Calendar, TrendingUp, CheckCircle, Clock, Users } from "lucide-react";
import { format, differenceInDays } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  type PlayerGoal,
  GoalStatus,
  GoalPriority,
  GoalCategories
} from "@shared/schema";

import GoalSettingForm from "./GoalSettingForm";

interface GoalCardProps {
  goal: PlayerGoal;
  onUpdate: () => void;
}

function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining <= 7 && daysRemaining >= 0;

  const updateGoalMutation = useMutation({
    mutationFn: async (updates: Partial<PlayerGoal>) => {
      const response = await apiRequest("PATCH", `/api/goals/${goal.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Goal Updated",
        description: "Your goal has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      onUpdate();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleGoalStatus = () => {
    const newStatus = goal.status === GoalStatus.ACTIVE ? GoalStatus.COMPLETED : GoalStatus.ACTIVE;
    updateGoalMutation.mutate({ status: newStatus });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case GoalCategories.SKILL_DEVELOPMENT: return "bg-blue-100 text-blue-800";
      case GoalCategories.FITNESS: return "bg-green-100 text-green-800";
      case GoalCategories.TECHNIQUE: return "bg-purple-100 text-purple-800";
      case GoalCategories.MENTAL_GAME: return "bg-indigo-100 text-indigo-800";
      case GoalCategories.TOURNAMENT_PREP: return "bg-orange-100 text-orange-800";
      case GoalCategories.COACHING: return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case GoalPriority.HIGH: return "destructive";
      case GoalPriority.MEDIUM: return "default";
      case GoalPriority.LOW: return "secondary";
      default: return "secondary";
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      goal.status === GoalStatus.COMPLETED ? 'opacity-75' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className={`w-5 h-5 ${
              goal.status === GoalStatus.COMPLETED ? 'text-green-500' : 'text-primary'
            }`} />
            {goal.title}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={getPriorityVariant(goal.priority)}>
              {goal.priority}
            </Badge>
            {goal.isSharedWithCoach && (
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Shared
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge className={getCategoryColor(goal.category)} variant="secondary">
            {goal.category.replace(/_/g, ' ')}
          </Badge>
          <span>•</span>
          <Calendar className="w-4 h-4" />
          <span className={isOverdue ? 'text-red-500 font-medium' : isUrgent ? 'text-orange-500 font-medium' : ''}>
            {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : 
             daysRemaining === 0 ? 'Due today' :
             `${daysRemaining} days remaining`}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {goal.description && (
          <p className="text-sm text-muted-foreground">{goal.description}</p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{goal.progressPercentage || 0}%</span>
          </div>
          <Progress value={goal.progressPercentage || 0} className="w-full" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant={goal.status === GoalStatus.COMPLETED ? "outline" : "default"}
            size="sm"
            onClick={toggleGoalStatus}
            disabled={updateGoalMutation.isPending}
            className="flex items-center gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            {goal.status === GoalStatus.COMPLETED ? "Reopen" : "Complete"}
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <a href={`/goals/${goal.id}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              Details
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GoalsDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data: goals = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/goals");
      return response.json();
    }
  });

  const activeGoals = goals.filter((goal: PlayerGoal) => goal.status === GoalStatus.ACTIVE);
  const completedGoals = goals.filter((goal: PlayerGoal) => goal.status === GoalStatus.COMPLETED);
  const overDueGoals = activeGoals.filter((goal: PlayerGoal) => 
    differenceInDays(new Date(goal.targetDate), new Date()) < 0
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Goals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Goals</h2>
          <p className="text-muted-foreground">
            {activeGoals.length} active • {completedGoals.length} completed
            {overDueGoals.length > 0 && (
              <span className="text-red-500 ml-2">• {overDueGoals.length} overdue</span>
            )}
          </p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <GoalSettingForm 
              onSuccess={() => {
                setShowCreateForm(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats Cards */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                  <p className="text-2xl font-bold">{goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-blue-500">{activeGoals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-500">{completedGoals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {activeGoals.length > 0 
                      ? Math.round(activeGoals.reduce((acc, goal) => acc + (goal.progressPercentage || 0), 0) / activeGoals.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals Display */}
      {goals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Set your first goal to start tracking your pickleball journey
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
            <TabsTrigger value="all">All Goals ({goals.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No active goals</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map((goal: PlayerGoal) => (
                  <GoalCard key={goal.id} goal={goal} onUpdate={refetch} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedGoals.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No completed goals yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map((goal: PlayerGoal) => (
                  <GoalCard key={goal.id} goal={goal} onUpdate={refetch} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal: PlayerGoal) => (
                <GoalCard key={goal.id} goal={goal} onUpdate={refetch} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}