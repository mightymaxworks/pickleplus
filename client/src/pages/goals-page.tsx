/**
 * PKL-278651-COACH-GOALS-001 - Goals Page
 * 
 * Main goals page for the goal-setting foundation system.
 * Displays user goals and provides access to goal creation.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, Plus, Calendar, TrendingUp, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { GoalCreationForm } from "@/components/goals/GoalCreationForm";

interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  targetDate?: string;
  progressPercentage?: number;
  coachId?: number;
}

export default function GoalsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/goals");
        return response.json();
      } catch (err) {
        console.error("Failed to fetch goals:", err);
        return [];
      }
    }
  });

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Goals</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to load goals</h3>
            <p className="text-muted-foreground mb-4">
              There was an issue loading your goals. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-[58px] mb-[58px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            My Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your pickleball journey with personalized goals
          </p>
        </div>
        
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4" />
          Create Goal
        </Button>
      </div>
      {/* Quick Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {goals.filter((goal: Goal) => goal.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-green-500" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-500">
                    {goals.filter((goal: Goal) => goal.status === 'completed').length}
                  </p>
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
                    {goals.length > 0 
                      ? Math.round(goals.reduce((acc: number, goal: Goal) => acc + (goal.progressPercentage || 0), 0) / goals.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Set your first goal to start tracking your pickleball journey
            </p>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal: Goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    {goal.title}
                  </CardTitle>
                  <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'default' : 'secondary'}>
                    {goal.priority}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {goal.category.replace(/_/g, ' ')}
                  </Badge>
                  <span>•</span>
                  <span className={goal.status === 'completed' ? 'text-green-600' : 'text-blue-600'}>
                    {goal.status}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {goal.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {goal.description}
                  </p>
                )}
                
                {goal.targetDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                )}

                {goal.progressPercentage !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${goal.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  {goal.status !== 'completed' && (
                    <Button size="sm" className="flex-1">
                      Update Progress
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}