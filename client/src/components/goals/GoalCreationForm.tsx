import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Target, Trophy, Users, Heart, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Goal creation schema
const goalCreationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  category: z.enum(["technical", "competitive", "social", "fitness", "mental"], {
    required_error: "Please select a category",
  }),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Please select a priority",
  }),
  targetDate: z.string().optional(),
  difficultyLevel: z.number().min(1).max(5).default(1),
  estimatedDurationDays: z.number().min(1).max(365).optional(),
  motivationNote: z.string().max(200, "Motivation note too long").optional(),
  successCriteria: z.string().max(300, "Success criteria too long").optional(),
  isPublic: z.boolean().default(false),
  shareWithCommunity: z.boolean().default(false),
});

type GoalCreationData = z.infer<typeof goalCreationSchema>;

interface GoalCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const categoryConfig = {
  technical: { icon: Target, label: "Technical Skills", color: "bg-blue-100 text-blue-800", description: "Improve shots, technique, and fundamentals" },
  competitive: { icon: Trophy, label: "Competitive", color: "bg-yellow-100 text-yellow-800", description: "Tournament performance and rankings" },
  social: { icon: Users, label: "Social", color: "bg-green-100 text-green-800", description: "Community engagement and networking" },
  fitness: { icon: Heart, label: "Fitness", color: "bg-red-100 text-red-800", description: "Physical conditioning and health" },
  mental: { icon: Brain, label: "Mental Game", color: "bg-purple-100 text-purple-800", description: "Focus, strategy, and mindset" },
};

const priorityConfig = {
  low: { label: "Low Priority", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium Priority", color: "bg-blue-100 text-blue-800" },
  high: { label: "High Priority", color: "bg-orange-100 text-orange-800" },
  critical: { label: "Critical", color: "bg-red-100 text-red-800" },
};

export function GoalCreationForm({ onSuccess, onCancel }: GoalCreationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");

  const form = useForm<GoalCreationData>({
    resolver: zodResolver(goalCreationSchema),
    defaultValues: {
      title: "",
      description: "",
      difficultyLevel: 1,
      isPublic: false,
      shareWithCommunity: false,
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalCreationData) => {
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Goal Created!",
        description: "Your goal has been successfully created and added to your journey.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Goal",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GoalCreationData) => {
    createGoalMutation.mutate(data);
  };

  const CategoryIcon = selectedCategory ? categoryConfig[selectedCategory as keyof typeof categoryConfig]?.icon : Target;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CategoryIcon className="h-5 w-5" />
          Create New Goal
        </CardTitle>
        <CardDescription>
          Set a meaningful goal to track your pickleball development journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Master the third shot drop" {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a clear, specific title for your goal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you want to achieve and why it's important to you..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategory(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => {
                          const Icon = config.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
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
                    <FormLabel>Priority *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedPriority(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <Badge variant="secondary" className={config.color}>
                              {config.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Target Date and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      When do you want to achieve this goal?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">⭐ Beginner</SelectItem>
                        <SelectItem value="2">⭐⭐ Easy</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Moderate</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Challenging</SelectItem>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Success Criteria */}
            <FormField
              control={form.control}
              name="successCriteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How will you know when you've achieved this goal? Be specific..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Define measurable criteria for success
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Motivation Note */}
            <FormField
              control={form.control}
              name="motivationNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Motivation</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What motivates you to achieve this goal? Personal note for inspiration..."
                      className="min-h-[60px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Section */}
            {(selectedCategory || selectedPriority) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Goal Preview</h4>
                <div className="flex gap-2">
                  {selectedCategory && (
                    <Badge className={categoryConfig[selectedCategory as keyof typeof categoryConfig]?.color}>
                      {categoryConfig[selectedCategory as keyof typeof categoryConfig]?.label}
                    </Badge>
                  )}
                  {selectedPriority && (
                    <Badge className={priorityConfig[selectedPriority as keyof typeof priorityConfig]?.color}>
                      {priorityConfig[selectedPriority as keyof typeof priorityConfig]?.label}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createGoalMutation.isPending}
                className="flex-1"
              >
                {createGoalMutation.isPending ? "Creating Goal..." : "Create Goal"}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={createGoalMutation.isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}