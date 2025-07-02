/**
 * Enhanced Goal Creation Form with Assessment Integration
 * Sprint 3: Pre-fills goal suggestions based on PCP assessment weak points
 * 
 * Features:
 * - Assessment-driven goal recommendations
 * - Smart form pre-filling with recommended content
 * - Category auto-selection based on assessment gaps
 * - Intelligent milestone suggestions
 * - Success criteria recommendations
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, Calendar, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Enhanced goal creation schema with assessment integration
const enhancedGoalSchema = z.object({
  title: z.string().min(3, 'Goal title must be at least 3 characters'),
  description: z.string().min(10, 'Goal description must be at least 10 characters'),
  category: z.enum(['technical', 'competitive', 'social', 'fitness', 'mental']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  targetDate: z.string().optional(),
  successCriteria: z.string().min(5, 'Success criteria must be at least 5 characters'),
  milestones: z.string().optional(),
  coachNotes: z.string().optional(),
  assessmentBased: z.boolean().default(false),
  assessmentId: z.number().optional(),
});

type EnhancedGoalFormData = z.infer<typeof enhancedGoalSchema>;

interface AssessmentRecommendation {
  category: string;
  dimension: string;
  score: number;
  goalSuggestions: {
    title: string;
    description: string;
    successCriteria: string;
    milestones: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

interface Props {
  onSuccess?: () => void;
  recommendationId?: string; // For pre-filling from assessment recommendations
}

export default function EnhancedGoalCreationForm({ onSuccess, recommendationId }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecommendation, setSelectedRecommendation] = useState<AssessmentRecommendation | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Fetch assessment data for recommendations
  const { data: assessments } = useQuery({
    queryKey: ['/api/pcp/assessments'],
    select: (data) => data || []
  });

  const form = useForm<EnhancedGoalFormData>({
    resolver: zodResolver(enhancedGoalSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'technical',
      priority: 'medium',
      targetDate: '',
      successCriteria: '',
      milestones: '',
      coachNotes: '',
      assessmentBased: false,
    },
  });

  // Generate assessment-based recommendations
  const generateRecommendations = (): AssessmentRecommendation[] => {
    if (!assessments || assessments.length === 0) return [];

    const latestAssessment = assessments[0]; // Most recent assessment
    const recommendations: AssessmentRecommendation[] = [];

    // Technical Skills (lowest scores first)
    if (latestAssessment.technicalScore < 70) {
      recommendations.push({
        category: 'technical',
        dimension: 'Technical Skills',
        score: latestAssessment.technicalScore,
        goalSuggestions: [
          {
            title: 'Master Third Shot Drop Technique',
            description: 'Improve consistency and accuracy of third shot drops from baseline to kitchen line, focusing on soft placement and arc control.',
            successCriteria: 'Land 8 out of 10 third shot drops in the kitchen during practice sessions',
            milestones: ['Practice 50 drops daily for 2 weeks', 'Achieve 60% accuracy in first week', 'Reach 80% accuracy by end of month'],
            priority: 'high'
          },
          {
            title: 'Develop Consistent Serve Placement',
            description: 'Focus on deep serve placement to baseline corners with consistent spin and pace to set up advantageous rally starts.',
            successCriteria: 'Hit target zones on 7 out of 10 serves during practice',
            milestones: ['Master basic deep serve', 'Add spin variation', 'Develop corner placement accuracy'],
            priority: 'medium'
          }
        ]
      });
    }

    // Tactical Awareness
    if (latestAssessment.tacticalScore < 70) {
      recommendations.push({
        category: 'competitive',
        dimension: 'Tactical Awareness',
        score: latestAssessment.tacticalScore,
        goalSuggestions: [
          {
            title: 'Improve Court Positioning Strategy',
            description: 'Develop better understanding of optimal court positioning during different phases of play, especially transition from baseline to kitchen.',
            successCriteria: 'Maintain advantageous court position 80% of the time during matches',
            milestones: ['Study positioning fundamentals', 'Practice transition drills', 'Apply in match situations'],
            priority: 'high'
          }
        ]
      });
    }

    // Physical Fitness
    if (latestAssessment.physicalScore < 70) {
      recommendations.push({
        category: 'fitness',
        dimension: 'Physical Fitness',
        score: latestAssessment.physicalScore,
        goalSuggestions: [
          {
            title: 'Enhance Lateral Movement and Agility',
            description: 'Improve quick lateral movements and change of direction to better cover the court and reach difficult shots.',
            successCriteria: 'Complete agility ladder drills 20% faster than baseline time',
            milestones: ['Establish baseline times', 'Improve by 5% weekly', 'Add sport-specific movements'],
            priority: 'medium'
          }
        ]
      });
    }

    // Mental Game
    if (latestAssessment.mentalScore < 70) {
      recommendations.push({
        category: 'mental',
        dimension: 'Mental Game',
        score: latestAssessment.mentalScore,
        goalSuggestions: [
          {
            title: 'Develop Match Focus and Concentration',
            description: 'Build mental resilience and maintain concentration during high-pressure points and extended rallies.',
            successCriteria: 'Maintain focus for entire match without mental lapses',
            milestones: ['Practice mindfulness techniques', 'Develop pre-point routines', 'Apply mental strategies in matches'],
            priority: 'medium'
          }
        ]
      });
    }

    return recommendations.sort((a, b) => a.score - b.score); // Lowest scores first
  };

  const recommendations = generateRecommendations();

  // Apply recommendation to form
  const applyRecommendation = (recommendation: AssessmentRecommendation, suggestionIndex: number = 0) => {
    const suggestion = recommendation.goalSuggestions[suggestionIndex];
    
    form.setValue('title', suggestion.title);
    form.setValue('description', suggestion.description);
    form.setValue('category', recommendation.category as any);
    form.setValue('priority', suggestion.priority);
    form.setValue('successCriteria', suggestion.successCriteria);
    form.setValue('milestones', suggestion.milestones.join('\n• '));
    form.setValue('assessmentBased', true);
    
    if (assessments && assessments.length > 0) {
      form.setValue('assessmentId', assessments[0].id);
    }

    // Set target date to 30 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    form.setValue('targetDate', targetDate.toISOString().split('T')[0]);

    setSelectedRecommendation(recommendation);
    setShowRecommendations(false);

    toast({
      title: "Goal Pre-filled",
      description: `Applied ${recommendation.dimension} improvement recommendation`,
    });
  };

  const createGoalMutation = useMutation({
    mutationFn: async (data: EnhancedGoalFormData) => {
      const response = await apiRequest('POST', '/api/goals', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal Created Successfully",
        description: "Your personalized development goal has been created and added to your dashboard.",
      });
      form.reset();
      setSelectedRecommendation(null);
      setShowRecommendations(true);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Goal Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EnhancedGoalFormData) => {
    createGoalMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Assessment-Based Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lightbulb className="h-5 w-5" />
              Smart Goal Recommendations
            </CardTitle>
            <CardDescription className="text-blue-700">
              Based on your recent PCP assessment, here are personalized goals to improve your weakest areas:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-300 text-blue-800">
                      {rec.dimension}
                    </Badge>
                    <span className="text-sm text-blue-600">Score: {rec.score}%</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Needs Improvement
                  </Badge>
                </div>
                
                <div className="grid gap-3">
                  {rec.goalSuggestions.map((suggestion, suggestionIndex) => (
                    <Card key={suggestionIndex} className="border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900 mb-1">{suggestion.title}</h4>
                            <p className="text-sm text-blue-700 mb-2">{suggestion.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={
                                suggestion.priority === 'high' ? 'border-red-300 text-red-800' :
                                suggestion.priority === 'medium' ? 'border-yellow-300 text-yellow-800' :
                                'border-green-300 text-green-800'
                              }>
                                {suggestion.priority.toUpperCase()} Priority
                              </Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => applyRecommendation(rec, suggestionIndex)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Use This Goal
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Manual Goal Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {selectedRecommendation ? 'Customize Your Assessment-Based Goal' : 'Create Custom Goal'}
          </CardTitle>
          <CardDescription>
            {selectedRecommendation 
              ? `Customizing goal for ${selectedRecommendation.dimension} improvement`
              : 'Create a personalized development goal to track your pickleball progress'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {selectedRecommendation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Assessment-Based Goal Applied</span>
                  </div>
                  <p className="text-sm text-green-700">
                    This goal targets your {selectedRecommendation.dimension} skills (Current Score: {selectedRecommendation.score}%).
                    You can customize all fields below before creating the goal.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      form.reset();
                      setSelectedRecommendation(null);
                      setShowRecommendations(true);
                    }}
                  >
                    Start Over
                  </Button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your goal title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technical">Technical Skills</SelectItem>
                          <SelectItem value="competitive">Competitive Play</SelectItem>
                          <SelectItem value="fitness">Physical Fitness</SelectItem>
                          <SelectItem value="mental">Mental Game</SelectItem>
                          <SelectItem value="social">Social/Community</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your goal in detail..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="critical">Critical Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Target Completion Date
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="successCriteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Success Criteria
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How will you measure success? Be specific..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="milestones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Key Milestones
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List important milestones or steps (one per line)..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coachNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coach Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes for your coach..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedRecommendation(null);
                    setShowRecommendations(true);
                  }}
                >
                  Reset Form
                </Button>
                <Button 
                  type="submit" 
                  disabled={createGoalMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}