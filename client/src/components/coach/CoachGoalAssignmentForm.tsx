/**
 * PKL-278651-COACH-GOALS-PHASE2-FORM - Coach Goal Assignment Form
 * 
 * Frontend form component for coaches to assign goals to players with milestones.
 * Integrates with Phase 2 coach goal management backend endpoints.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-07-02
 */

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2, X, Target, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const milestoneSchema = z.object({
  title: z.string().min(1, "Milestone title is required"),
  description: z.string().optional(),
  orderIndex: z.number().min(0)
});

const goalAssignmentSchema = z.object({
  playerUserId: z.number().min(1, "Please select a player"),
  title: z.string().min(1, "Goal title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["technical", "competitive", "social", "fitness", "mental"]),
  priority: z.enum(["low", "medium", "high"]),
  targetDate: z.string().optional(),
  milestones: z.array(milestoneSchema).optional()
});

type GoalAssignmentForm = z.infer<typeof goalAssignmentSchema>;

interface CoachGoalAssignmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CoachGoalAssignmentForm({ 
  onSuccess, 
  onCancel 
}: CoachGoalAssignmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<GoalAssignmentForm>({
    resolver: zodResolver(goalAssignmentSchema),
    defaultValues: {
      playerUserId: 0,
      title: "",
      description: "",
      category: "technical",
      priority: "medium",
      targetDate: "",
      milestones: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestones"
  });

  const assignGoalMutation = useMutation({
    mutationFn: async (data: GoalAssignmentForm) => {
      const response = await apiRequest("POST", "/api/coach/goals/assign", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Goal Assigned Successfully",
        description: "The goal has been assigned to the player with milestones."
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign goal. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: GoalAssignmentForm) => {
    setIsSubmitting(true);
    try {
      // Since we're using mock data, let's assign to user ID 1
      const assignmentData = {
        ...data,
        playerUserId: 1, // Mock player ID
        milestones: data.milestones?.map((milestone, index) => ({
          ...milestone,
          orderIndex: index
        })) || []
      };
      
      await assignGoalMutation.mutateAsync(assignmentData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMilestone = () => {
    append({
      title: "",
      description: "",
      orderIndex: fields.length
    });
  };

  const removeMilestone = (index: number) => {
    remove(index);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Assign Goal to Player
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Player Selection */}
              <div className="space-y-2">
                <Label>Player</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Mighty Max (mightymax) - Demo Player
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Goal will be assigned to your demo player for testing
                </p>
              </div>

              {/* Goal Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Improve Forehand Consistency"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Goal Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of what the player should achieve..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="competitive">Competitive</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="mental">Mental</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Target Date */}
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Milestones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Milestones</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addMilestone}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>

                {fields.length === 0 && (
                  <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      No milestones added yet. Milestones help break down the goal into smaller, achievable steps.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addMilestone}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Milestone
                    </Button>
                  </div>
                )}

                {fields.map((field, index) => (
                  <Card key={field.id} className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-medium">Milestone {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name={`milestones.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g., Master Basic Forehand Form"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`milestones.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Detailed milestone description..."
                                  rows={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="min-w-32"
                >
                  {isSubmitting ? "Assigning..." : "Assign Goal"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}