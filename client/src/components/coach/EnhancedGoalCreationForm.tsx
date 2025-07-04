/**
 * PKL-278651-SPRINT4-ENHANCED-GOAL-FORM - Enhanced Goal Creation Form
 * 
 * Sprint 4 Phase 4.1: Pre-filled goal creation form with assessment integration
 * Features: Auto-population from suggestions, milestone management, bulk selection
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-04
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Target, 
  Plus, 
  Minus, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Sparkles,
  Save,
  Users
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Enhanced Goal Creation Schema
const goalCreationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['technical', 'tactical', 'physical', 'mental']),
  priority: z.enum(['high', 'medium', 'low']),
  targetDate: z.string().min(1, 'Target date is required'),
  targetRating: z.number().min(1).max(10),
  currentRating: z.number().min(0).max(10),
  sourceAssessmentId: z.number().optional(),
  targetSkill: z.string().optional(),
  milestones: z.array(z.object({
    title: z.string().min(3, 'Milestone title required'),
    description: z.string().min(5, 'Milestone description required'),
    targetRating: z.number().min(1).max(10),
    orderIndex: z.number(),
    requiresCoachValidation: z.boolean(),
    dueDate: z.string(),
  })),
});

type GoalCreationFormData = z.infer<typeof goalCreationSchema>;

interface GoalSuggestion {
  title: string;
  description: string;
  category: 'technical' | 'tactical' | 'physical' | 'mental';
  priority: 'high' | 'medium' | 'low';
  sourceAssessmentId?: number;
  targetSkill?: string;
  currentRating: number;
  targetRating: number;
  milestones: Array<{
    title: string;
    description: string;
    targetRating: number;
    orderIndex: number;
    requiresCoachValidation: boolean;
    dueDate: string;
  }>;
}

interface Player {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

interface EnhancedGoalCreationFormProps {
  suggestion?: GoalSuggestion;
  players?: Player[];
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: 'single' | 'bulk';
}

export default function EnhancedGoalCreationForm({
  suggestion,
  players = [],
  onSuccess,
  onCancel,
  mode = 'single'
}: EnhancedGoalCreationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Initialize form with suggestion data
  const form = useForm<GoalCreationFormData>({
    resolver: zodResolver(goalCreationSchema),
    defaultValues: {
      title: suggestion?.title || '',
      description: suggestion?.description || '',
      category: suggestion?.category || 'technical',
      priority: suggestion?.priority || 'medium',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetRating: suggestion?.targetRating || 7,
      currentRating: suggestion?.currentRating || 5,
      sourceAssessmentId: suggestion?.sourceAssessmentId,
      targetSkill: suggestion?.targetSkill,
      milestones: suggestion?.milestones || [
        {
          title: 'Foundation Phase',
          description: 'Build basic skills and understanding',
          targetRating: 6,
          orderIndex: 0,
          requiresCoachValidation: true,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }
      ],
    },
  });

  // Auto-populate template name from suggestion
  useEffect(() => {
    if (suggestion && !templateName) {
      setTemplateName(`${suggestion.category} - ${suggestion.title.slice(0, 30)}`);
    }
  }, [suggestion, templateName]);

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: { goalData: GoalCreationFormData; playerIds: number[] }) => {
      if (mode === 'single' && data.playerIds.length === 1) {
        const response = await apiRequest('POST', '/api/coach/goals/assign', {
          ...data.goalData,
          playerId: data.playerIds[0],
        });
        return response.json();
      } else {
        // Bulk assignment
        const response = await apiRequest('POST', '/api/coach/goals/bulk-assign', {
          goalTemplate: data.goalData,
          playerIds: data.playerIds,
          saveAsTemplate,
          templateName: saveAsTemplate ? templateName : undefined,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Goal Created Successfully",
        description: mode === 'bulk' 
          ? `Goal assigned to ${selectedPlayers.length} players`
          : "Goal has been assigned to the player",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/goals'] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Goal Creation Failed",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  // Add milestone function
  const addMilestone = () => {
    const milestones = form.getValues('milestones');
    const newMilestone = {
      title: `Milestone ${milestones.length + 1}`,
      description: 'Description for this milestone',
      targetRating: Math.min(10, (milestones[milestones.length - 1]?.targetRating || 5) + 1),
      orderIndex: milestones.length,
      requiresCoachValidation: true,
      dueDate: new Date(Date.now() + (milestones.length + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    form.setValue('milestones', [...milestones, newMilestone]);
  };

  // Remove milestone function
  const removeMilestone = (index: number) => {
    const milestones = form.getValues('milestones');
    if (milestones.length > 1) {
      form.setValue('milestones', milestones.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const onSubmit = async (data: GoalCreationFormData) => {
    if (mode === 'bulk' && selectedPlayers.length === 0) {
      toast({
        title: "No Players Selected",
        description: "Please select at least one player for bulk assignment",
        variant: "destructive",
      });
      return;
    }

    const playerIds = mode === 'bulk' ? selectedPlayers : [1]; // Default to test player for single mode
    createGoalMutation.mutate({ goalData: data, playerIds });
  };

  // Handle player selection for bulk mode
  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const isLoading = createGoalMutation.isPending;
  const milestones = form.watch('milestones');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {suggestion ? (
              <>
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Enhanced Goal Creation
                <Badge variant="outline" className="ml-2">Sprint 4</Badge>
              </>
            ) : (
              <>
                <Target className="h-5 w-5 text-blue-600" />
                Create New Goal
              </>
            )}
          </CardTitle>
          {suggestion && (
            <p className="text-sm text-muted-foreground">
              Pre-filled from assessment suggestion • {suggestion.category} • {suggestion.priority} priority
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Player Selection for Bulk Mode */}
      {mode === 'bulk' && players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Players ({selectedPlayers.length} selected)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlayers.includes(player.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => togglePlayerSelection(player.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayerSelection(player.id)}
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{player.firstName} {player.lastName}</p>
                        <p className="text-xs text-muted-foreground">@{player.username}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Creation Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Goal Title */}
            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="Enter goal title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            {/* Goal Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Detailed description of the goal"
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={form.watch('category')} 
                  onValueChange={(value) => form.setValue('category', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="tactical">Tactical</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="mental">Mental</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={form.watch('priority')} 
                  onValueChange={(value) => form.setValue('priority', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  {...form.register('targetDate')}
                />
              </div>
            </div>

            {/* Rating Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentRating">Current Rating</Label>
                <Input
                  id="currentRating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  {...form.register('currentRating', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="targetRating">Target Rating</Label>
                <Input
                  id="targetRating"
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  {...form.register('targetRating', { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Milestones ({milestones.length})
              </CardTitle>
              <Button type="button" onClick={addMilestone} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Milestone {index + 1}</Badge>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) => {
                          const updatedMilestones = [...milestones];
                          updatedMilestones[index].title = e.target.value;
                          form.setValue('milestones', updatedMilestones);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Target Rating</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={milestone.targetRating}
                        onChange={(e) => {
                          const updatedMilestones = [...milestones];
                          updatedMilestones[index].targetRating = parseFloat(e.target.value);
                          form.setValue('milestones', updatedMilestones);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) => {
                        const updatedMilestones = [...milestones];
                        updatedMilestones[index].description = e.target.value;
                        form.setValue('milestones', updatedMilestones);
                      }}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={milestone.dueDate}
                        onChange={(e) => {
                          const updatedMilestones = [...milestones];
                          updatedMilestones[index].dueDate = e.target.value;
                          form.setValue('milestones', updatedMilestones);
                        }}
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <Checkbox
                        checked={milestone.requiresCoachValidation}
                        onCheckedChange={(checked) => {
                          const updatedMilestones = [...milestones];
                          updatedMilestones[index].requiresCoachValidation = !!checked;
                          form.setValue('milestones', updatedMilestones);
                        }}
                      />
                      <Label className="text-sm">Requires coach validation</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Options */}
        {mode === 'bulk' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Template Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={saveAsTemplate}
                    onCheckedChange={setSaveAsTemplate}
                  />
                  <Label>Save as reusable template</Label>
                </div>
                {saveAsTemplate && (
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Enter template name"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : mode === 'bulk' ? (
              <>
                <Users className="h-4 w-4 mr-2" />
                Assign to {selectedPlayers.length} Players
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Create Goal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}