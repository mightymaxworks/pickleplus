/**
 * PKL-278651-COACH-GOALS-001 - Goal Setting Foundation Form
 * 
 * Comprehensive goal creation form for the coach-player ecosystem.
 * Integrates with journal system and milestone tracking.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon, Target, Plus, Users } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  insertPlayerGoalSchema,
  GoalCategories,
  GoalStatus,
  GoalPriority,
  type InsertPlayerGoal,
  type GoalCategory,
  type GoalStatusType,
  type GoalPriorityType
} from "@shared/schema";

interface GoalSettingFormProps {
  onSuccess?: () => void;
  coachId?: number;
  isCoachView?: boolean;
}

interface MilestoneInput {
  title: string;
  description: string;
  targetDate: Date;
}

const goalCategoryOptions = Object.entries(GoalCategories).map(([key, value]) => ({
  value,
  label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));

const goalPriorityOptions = Object.entries(GoalPriority).map(([key, value]) => ({
  value,
  label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}));

export default function GoalSettingForm({ onSuccess, coachId, isCoachView = false }: GoalSettingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [showMilestones, setShowMilestones] = useState(false);

  const form = useForm<InsertPlayerGoal>({
    resolver: zodResolver(insertPlayerGoalSchema),
    defaultValues: {
      title: "",
      description: "",
      category: GoalCategories.TECHNICAL,
      priority: GoalPriority.MEDIUM,
      status: GoalStatus.ACTIVE,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      coachId: coachId || undefined,
      userId: 1 // This will be set by the backend from session
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: InsertPlayerGoal & { milestones?: MilestoneInput[] }) => {
      console.log('Creating goal with data:', data);
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Goal Created Successfully!",
        description: `Your goal "${data.title}" has been set up with ${milestones.length} milestones.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      form.reset();
      setMilestones([]);
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error('Goal creation error:', error);
      toast({
        title: "Goal Creation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPlayerGoal) => {
    const goalData = {
      ...data,
      milestones: showMilestones ? milestones : []
    };
    createGoalMutation.mutate(goalData);
  };

  const addMilestone = () => {
    setMilestones([...milestones, {
      title: "",
      description: "",
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string | Date) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          {isCoachView ? "Set Player Goal" : "Create New Goal"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Improve backhand consistency"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Goal Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your goal in detail..."
              rows={3}
              {...form.register("description")}
            />
          </div>

          {/* Category and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value: GoalCategory) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {goalCategoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value: GoalPriorityType) => form.setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {goalPriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge variant={
                        option.value === GoalPriority.HIGH ? "destructive" :
                        option.value === GoalPriority.MEDIUM ? "default" : "secondary"
                      }>
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label>Target Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("targetDate") ? (
                    format(new Date(form.watch("targetDate")), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("targetDate") ? new Date(form.watch("targetDate")) : undefined}
                  onSelect={(date) => date && form.setValue("targetDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Coach Assignment */}
          {isCoachView && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Coach-Assigned Goal
              </Label>
              <p className="text-sm text-muted-foreground">
                This goal will be assigned to the selected player.
              </p>
            </div>
          )}

          <Separator />

          {/* Milestones Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="add-milestones"
                checked={showMilestones}
                onCheckedChange={setShowMilestones}
              />
              <Label htmlFor="add-milestones">Add milestones</Label>
            </div>
            {showMilestones && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Milestone
              </Button>
            )}
          </div>

          {/* Milestones List */}
          {showMilestones && milestones.length > 0 && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Milestones ({milestones.length})</h4>
              {milestones.map((milestone, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Milestone {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    <Input
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, "title", e.target.value)}
                    />
                    <Textarea
                      placeholder="Milestone description"
                      rows={2}
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, "description", e.target.value)}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {milestone.targetDate ? (
                            format(milestone.targetDate, "PPP")
                          ) : (
                            <span>Pick target date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={milestone.targetDate}
                          onSelect={(date) => date && updateMilestone(index, "targetDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={createGoalMutation.isPending}
            >
              {createGoalMutation.isPending ? "Creating Goal..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}