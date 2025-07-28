/**
 * Sprint 3 Phase 2: Intelligent Goal Creation Interface
 * AI-powered goal generation with customizable milestones and progress tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Plus,
  Trash2,
  Edit3,
  Brain,
  Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface GoalRecommendation {
  title: string;
  description: string;
  category: 'technical' | 'tactical' | 'physical' | 'mental';
  priority: 'high' | 'medium' | 'low';
  estimated_timeline: string;
  milestones: string[];
}

interface CustomGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  timeline: number; // weeks
  milestones: string[];
  selected: boolean;
}

export default function IntelligentGoalCreation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssessment] = useState(123);
  const [selectedStudent] = useState(1);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('technical');
  const [newGoalPriority, setNewGoalPriority] = useState('medium');
  const [newGoalTimeline, setNewGoalTimeline] = useState([4]);
  const [newMilestones, setNewMilestones] = useState<string[]>(['']);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  // Fetch AI-generated goal recommendations
  const { data: recommendationsData, isLoading: loadingRecommendations } = useQuery({
    queryKey: [`/api/coach/assessments/${selectedAssessment}/generate-goals`],
    refetchOnWindowFocus: false,
  });

  const recommendations = recommendationsData?.data?.recommended_goals as GoalRecommendation[] || [];

  // Initialize custom goals from recommendations
  useEffect(() => {
    if (recommendations.length > 0 && customGoals.length === 0) {
      const initialGoals = recommendations.map((rec, index) => ({
        id: `rec-${index}`,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        priority: rec.priority,
        timeline: parseInt(rec.estimated_timeline.split('-')[0]) || 4,
        milestones: rec.milestones,
        selected: true
      }));
      setCustomGoals(initialGoals);
    }
  }, [recommendations, customGoals.length]);

  // Create goals mutation
  const createGoalsMutation = useMutation({
    mutationFn: async (goals: CustomGoal[]) => {
      const response = await fetch('/api/coach/goals/from-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: selectedAssessment,
          selectedGoals: goals.filter(g => g.selected),
          customizations: {
            studentId: selectedStudent,
            createdBy: 'intelligent-system'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create goals');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Goals Created Successfully",
        description: `Created ${data.data?.length || 0} personalized goals for your student`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/goals'] });
      // Navigate to goal management page
      window.location.href = '/coach/goal-management';
    },
    onError: (error) => {
      toast({
        title: "Goal Creation Failed",
        description: "Unable to create goals. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Activity className="h-4 w-4" />;
      case 'tactical': return <Brain className="h-4 w-4" />;
      case 'physical': return <Target className="h-4 w-4" />;
      case 'mental': return <Sparkles className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const addCustomGoal = () => {
    if (!newGoalTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a goal title",
        variant: "destructive",
      });
      return;
    }

    const newGoal: CustomGoal = {
      id: `custom-${Date.now()}`,
      title: newGoalTitle,
      description: newGoalDescription,
      category: newGoalCategory,
      priority: newGoalPriority,
      timeline: newGoalTimeline[0],
      milestones: newMilestones.filter(m => m.trim() !== ''),
      selected: true
    };

    setCustomGoals([...customGoals, newGoal]);
    
    // Reset form
    setNewGoalTitle('');
    setNewGoalDescription('');
    setNewGoalCategory('technical');
    setNewGoalPriority('medium');
    setNewGoalTimeline([4]);
    setNewMilestones(['']);
    setIsCreatingGoal(false);

    toast({
      title: "Custom Goal Added",
      description: "Your custom goal has been added to the list",
    });
  };

  const updateGoalSelection = (goalId: string, selected: boolean) => {
    setCustomGoals(goals => 
      goals.map(goal => 
        goal.id === goalId ? { ...goal, selected } : goal
      )
    );
  };

  const removeGoal = (goalId: string) => {
    setCustomGoals(goals => goals.filter(goal => goal.id !== goalId));
  };

  const addMilestone = () => {
    setNewMilestones([...newMilestones, '']);
  };

  const updateMilestone = (index: number, value: string) => {
    const updated = [...newMilestones];
    updated[index] = value;
    setNewMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setNewMilestones(milestones => milestones.filter((_, i) => i !== index));
  };

  const handleCreateGoals = () => {
    const selectedGoals = customGoals.filter(goal => goal.selected);
    
    if (selectedGoals.length === 0) {
      toast({
        title: "No Goals Selected",
        description: "Please select at least one goal to create",
        variant: "destructive",
      });
      return;
    }

    createGoalsMutation.mutate(selectedGoals);
  };

  if (loadingRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Generating intelligent goal recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Intelligent Goal Creation
                  </CardTitle>
                  <CardDescription className="text-base">
                    AI-powered goal recommendations based on assessment analysis
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={handleCreateGoals}
                disabled={createGoalsMutation.isPending || customGoals.filter(g => g.selected).length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {createGoalsMutation.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Goals ({customGoals.filter(g => g.selected).length})
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Goal Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI-Generated Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized goals based on assessment weak areas and improvement potential
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {customGoals.map((goal) => (
                <Card key={goal.id} className={`backdrop-blur-sm border-0 shadow-lg transition-all ${
                  goal.selected ? 'bg-white/90 ring-2 ring-blue-200' : 'bg-white/60'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={goal.selected}
                          onCheckedChange={(checked) => updateGoalSelection(goal.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(goal.category)}
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <Badge className={getPriorityColor(goal.priority)}>
                              {goal.priority}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {goal.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoal(goal.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {goal.timeline} weeks
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {goal.milestones.length} milestones
                      </div>
                    </div>
                    
                    {goal.selected && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Milestones:</h4>
                        <ul className="space-y-1">
                          {goal.milestones.map((milestone, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Goal Creation */}
          <div className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  Add Custom Goal
                </CardTitle>
                <CardDescription>
                  Create your own personalized goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isCreatingGoal ? (
                  <Button 
                    onClick={() => setIsCreatingGoal(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Goal
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="goalTitle">Goal Title *</Label>
                      <Input
                        id="goalTitle"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        placeholder="e.g., Improve backhand consistency"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goalDescription">Description</Label>
                      <Textarea
                        id="goalDescription"
                        value={newGoalDescription}
                        onChange={(e) => setNewGoalDescription(e.target.value)}
                        placeholder="Detailed description of the goal"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newGoalCategory} onValueChange={setNewGoalCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="tactical">Tactical</SelectItem>
                            <SelectItem value="physical">Physical</SelectItem>
                            <SelectItem value="mental">Mental</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={newGoalPriority} onValueChange={setNewGoalPriority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Timeline: {newGoalTimeline[0]} weeks</Label>
                      <Slider
                        value={newGoalTimeline}
                        onValueChange={setNewGoalTimeline}
                        max={16}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Milestones</Label>
                      {newMilestones.map((milestone, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={milestone}
                            onChange={(e) => updateMilestone(index, e.target.value)}
                            placeholder={`Milestone ${index + 1}`}
                          />
                          {newMilestones.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(index)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addMilestone}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Milestone
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={addCustomGoal} className="flex-1">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Add Goal
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreatingGoal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goal Summary */}
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Goal Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {customGoals.filter(g => g.selected).length}
                    </div>
                    <div className="text-sm text-gray-600">Selected Goals</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {customGoals.filter(g => g.selected).reduce((sum, goal) => sum + goal.milestones.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Milestones</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Categories:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['technical', 'tactical', 'physical', 'mental'].map(category => {
                      const count = customGoals.filter(g => g.selected && g.category === category).length;
                      return count > 0 ? (
                        <Badge key={category} variant="outline" className="capitalize">
                          {category}: {count}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}