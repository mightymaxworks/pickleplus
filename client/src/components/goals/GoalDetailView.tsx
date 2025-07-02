/**
 * PKL-278651-PHASE1-GOALS-004 - Goal Detail View Component
 * 
 * Provides detailed view and management for individual goals.
 * Includes progress tracking, milestone management, and completion workflow.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  Circle, 
  Plus,
  Edit3,
  ArrowLeft,
  Flag,
  Trophy,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  targetDate?: string;
  progressPercentage: number;
  createdDate: string;
  milestones?: Milestone[];
  progressNotes?: string;
}

interface Milestone {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  targetDate?: string;
  completedDate?: string;
}

interface GoalDetailViewProps {
  goal: Goal;
  onBack: () => void;
  onUpdate: () => void;
}

export default function GoalDetailView({ goal, onBack, onUpdate }: GoalDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState(goal.progressPercentage);
  const [progressNotes, setProgressNotes] = useState(goal.progressNotes || "");
  const [newMilestone, setNewMilestone] = useState("");
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update goal progress
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { progressPercentage: number; progressNotes: string }) => {
      const response = await apiRequest("PUT", `/api/goals/${goal.id}/progress`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Your goal progress has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsEditing(false);
      onUpdate();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Complete goal
  const completeGoalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/goals/${goal.id}/complete`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🎉 Goal Completed!",
        description: "Congratulations on achieving your goal!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      onUpdate();
    },
    onError: () => {
      toast({
        title: "Completion Failed",
        description: "Failed to mark goal as complete. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add milestone
  const addMilestoneMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", `/api/goals/${goal.id}/milestones`, {
        title,
        completed: false
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone Added",
        description: "New milestone has been added to your goal."
      });
      setNewMilestone("");
      setShowAddMilestone(false);
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      onUpdate();
    },
    onError: () => {
      toast({
        title: "Failed to Add Milestone",
        description: "Could not add milestone. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Toggle milestone completion
  const toggleMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      const response = await apiRequest("PUT", `/api/goals/${goal.id}/milestones/${milestoneId}/toggle`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone Updated",
        description: "Milestone status has been updated."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      onUpdate();
    }
  });

  const handleProgressSave = () => {
    updateProgressMutation.mutate({
      progressPercentage: progressUpdate,
      progressNotes
    });
  };

  const handleCompleteGoal = () => {
    completeGoalMutation.mutate();
  };

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      addMilestoneMutation.mutate(newMilestone.trim());
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      case 'critical': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Target className="w-5 h-5" />;
      case 'physical': return <TrendingUp className="w-5 h-5" />;
      case 'mental': return <Trophy className="w-5 h-5" />;
      case 'tactical': return <Flag className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-[58px] mb-[58px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Goals
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {getCategoryIcon(goal.category)}
              {goal.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={goal.priority === 'high' ? 'destructive' : 'default'}>
                {goal.priority}
              </Badge>
              <Badge variant="outline">{goal.category}</Badge>
              <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                {goal.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {goal.status !== 'completed' && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Update Progress'}
              </Button>
              
              {goal.progressPercentage >= 100 && (
                <Button
                  onClick={handleCompleteGoal}
                  disabled={completeGoalMutation.isPending}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Goal Overview */}
          <Card className={`border-2 ${getPriorityColor(goal.priority)}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Goal Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goal.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="mt-1">{goal.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <p className="mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(goal.createdDate).toLocaleDateString()}
                  </p>
                </div>
                
                {goal.targetDate && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Target Date</Label>
                    <p className="mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Progress</Label>
                  <span className="text-2xl font-bold">{goal.progressPercentage}%</span>
                </div>
                <Progress value={goal.progressPercentage} className="h-3" />
              </div>

              {isEditing ? (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label htmlFor="progress">Update Progress (%)</Label>
                    <Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={progressUpdate}
                      onChange={(e) => setProgressUpdate(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Progress Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about your progress..."
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleProgressSave}
                      disabled={updateProgressMutation.isPending}
                    >
                      Save Progress
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                goal.progressNotes && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium text-muted-foreground">Latest Notes</Label>
                    <p className="mt-1">{goal.progressNotes}</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  Milestones
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAddMilestone && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter milestone title..."
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                  />
                  <Button 
                    onClick={handleAddMilestone}
                    disabled={!newMilestone.trim() || addMilestoneMutation.isPending}
                  >
                    Add
                  </Button>
                </div>
              )}

              {goal.milestones && goal.milestones.length > 0 ? (
                <div className="space-y-2">
                  {goal.milestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMilestoneMutation.mutate(milestone.id)}
                        className="p-0 h-auto"
                      >
                        {milestone.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <p className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {milestone.title}
                        </p>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        )}
                        {milestone.completedDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed: {new Date(milestone.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No milestones yet. Add some milestones to track your progress!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="font-bold">{goal.progressPercentage}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Milestones</span>
                <span className="font-bold">
                  {goal.milestones?.filter(m => m.completed).length || 0} / {goal.milestones?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Days Active</span>
                <span className="font-bold">
                  {Math.ceil((Date.now() - new Date(goal.createdDate).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Goal Completion */}
          {goal.status === 'completed' && (
            <Card className="border-green-500 bg-green-50">
              <CardContent className="pt-6 text-center">
                <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-green-800 mb-2">Goal Completed!</h3>
                <p className="text-sm text-green-700">
                  Congratulations on achieving this goal!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}