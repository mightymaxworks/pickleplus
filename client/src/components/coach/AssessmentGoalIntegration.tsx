/**
 * PKL-278651-SPRINT3-ASSESSMENT-GOAL-INTEGRATION - Assessment Goal Integration Component
 * 
 * Demonstrates Sprint 3 complete workflow: PCP Assessment → Analysis → Goal Suggestions → Goal Creation
 * This component bridges the existing PCP assessment system with the Phase 2 goal management system.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Target, 
  Brain, 
  Zap, 
  Heart, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  Award
} from 'lucide-react';

interface WeakArea {
  skill: string;
  skillLabel: string;
  currentRating: number;
  category: 'technical' | 'tactical' | 'physical' | 'mental';
  priority: 'high' | 'medium' | 'low';
  targetImprovement: number;
  suggestedGoal: string;
  suggestedDescription: string;
  milestoneTemplate: Array<{
    title: string;
    description: string;
    targetRating: number;
    orderIndex: number;
  }>;
}

interface AssessmentAnalysis {
  assessmentId: number;
  playerId: number;
  overallRating: number;
  dimensionalRatings: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
  };
  weakAreas: WeakArea[];
  improvementPotential: number;
  recommendedFocus: string;
}

interface GoalSuggestion {
  title: string;
  description: string;
  category: string;
  priority: string;
  sourceAssessmentId: number;
  targetSkill: string;
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

interface AssessmentGoalIntegrationProps {
  playerId?: number;
  showDemo?: boolean;
}

export default function AssessmentGoalIntegration({ playerId = 1, showDemo = true }: AssessmentGoalIntegrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<GoalSuggestion[]>([]);

  // Mock recent PCP assessments (in real implementation, this would fetch from /api/pcp/assessments)
  const recentAssessments = [
    {
      id: 1,
      date: '2025-07-01',
      type: 'comprehensive',
      overallRating: 6.3,
      playerName: 'Mighty Max',
      hasWeakAreas: true
    },
    {
      id: 2,
      date: '2025-06-15',
      type: 'progress',
      overallRating: 5.8,
      playerName: 'Mighty Max',
      hasWeakAreas: true
    }
  ];

  // Fetch assessment analysis
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/pcp/assessment', selectedAssessmentId, 'weak-areas'],
    queryFn: async () => {
      if (!selectedAssessmentId) return null;
      const response = await apiRequest('GET', `/api/pcp/assessment/${selectedAssessmentId}/weak-areas`);
      return response.json();
    },
    enabled: !!selectedAssessmentId
  });

  // Fetch goal suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['/api/coach/goals/suggestions-from-assessment', selectedAssessmentId],
    queryFn: async () => {
      if (!selectedAssessmentId) return null;
      const response = await apiRequest('GET', `/api/coach/goals/suggestions-from-assessment/${selectedAssessmentId}`);
      return response.json();
    },
    enabled: !!selectedAssessmentId
  });

  // Create goals from suggestions
  const createGoalsMutation = useMutation({
    mutationFn: async (goalSuggestions: GoalSuggestion[]) => {
      const responses = await Promise.all(
        goalSuggestions.map(suggestion =>
          apiRequest('POST', '/api/coach/goals/assign', {
            playerId,
            title: suggestion.title,
            description: suggestion.description,
            category: suggestion.category,
            priority: suggestion.priority,
            milestones: suggestion.milestones
          }).then(res => res.json())
        )
      );
      return responses;
    },
    onSuccess: (data) => {
      toast({
        title: "Goals Created Successfully",
        description: `Created ${selectedSuggestions.length} assessment-driven goals`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/coach/goals'] });
      setSelectedSuggestions([]);
      setSelectedAssessmentId(null);
    },
    onError: (error) => {
      toast({
        title: "Goal Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssessmentSelect = (assessmentId: number) => {
    setSelectedAssessmentId(assessmentId);
    setSelectedSuggestions([]);
  };

  const toggleSuggestionSelection = (suggestion: GoalSuggestion) => {
    setSelectedSuggestions(prev => {
      const exists = prev.find(s => s.targetSkill === suggestion.targetSkill);
      if (exists) {
        return prev.filter(s => s.targetSkill !== suggestion.targetSkill);
      } else {
        return [...prev, suggestion];
      }
    });
  };

  const createSelectedGoals = () => {
    if (selectedSuggestions.length === 0) {
      toast({
        title: "No Goals Selected",
        description: "Please select at least one goal suggestion to create",
        variant: "destructive",
      });
      return;
    }
    createGoalsMutation.mutate(selectedSuggestions);
  };

  const getDimensionalIcon = (dimension: string) => {
    switch (dimension) {
      case 'technical': return <Target className="h-4 w-4" />;
      case 'tactical': return <Brain className="h-4 w-4" />;
      case 'physical': return <Zap className="h-4 w-4" />;
      case 'mental': return <Heart className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sprint 3 Integration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Assessment-Goal Integration System
            <Badge variant="outline" className="ml-2">Sprint 3</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect PCP assessments to intelligent goal recommendations and automated milestone creation
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessments">Recent Assessments</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!selectedAssessmentId}>Analysis & Weak Areas</TabsTrigger>
          <TabsTrigger value="goals" disabled={!suggestions?.success}>Goal Suggestions</TabsTrigger>
        </TabsList>

        {/* Step 1: Assessment Selection */}
        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Step 1: Select PCP Assessment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a recent assessment to analyze for improvement opportunities
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAssessments.map(assessment => (
                <Card 
                  key={assessment.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAssessmentId === assessment.id ? 'border-primary bg-primary/10' : ''
                  }`}
                  onClick={() => handleAssessmentSelect(assessment.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{assessment.playerName} - {assessment.type} Assessment</h4>
                        <p className="text-sm text-muted-foreground">{assessment.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-bold">{assessment.overallRating}/10</div>
                          <div className="text-xs text-muted-foreground">Overall PCP</div>
                        </div>
                        {assessment.hasWeakAreas && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Improvement Areas
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Analysis & Weak Areas */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Step 2: Assessment Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered analysis identifies weak areas and improvement opportunities
              </p>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Analyzing assessment data...</p>
                </div>
              ) : analysis?.success ? (
                <div className="space-y-6">
                  {/* Dimensional Ratings */}
                  <div>
                    <h3 className="font-medium mb-4">4-Dimensional Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(analysis.analysis.dimensionalRatings).map(([dimension, rating]) => (
                        <div key={dimension} className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {getDimensionalIcon(dimension)}
                            <span className="text-sm font-medium capitalize">{dimension}</span>
                          </div>
                          <div className="text-2xl font-bold">{rating.toFixed(1)}</div>
                          <Progress value={rating * 10} className="h-2 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Weak Areas */}
                  <div>
                    <h3 className="font-medium mb-4">Identified Weak Areas (< 6.0)</h3>
                    <div className="space-y-3">
                      {analysis.analysis.weakAreas.map((area, index) => (
                        <Card key={area.skill}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge variant={getPriorityColor(area.priority)}>
                                  {area.priority} priority
                                </Badge>
                                <div>
                                  <h4 className="font-medium">{area.skillLabel}</h4>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {area.category} skill
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-red-500">
                                    {area.currentRating.toFixed(1)}
                                  </span>
                                  <ArrowRight className="h-4 w-4" />
                                  <span className="text-lg font-bold text-green-500">
                                    {(area.currentRating + area.targetImprovement).toFixed(1)}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  +{area.targetImprovement.toFixed(1)} improvement target
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Recommended Focus</h4>
                      <p className="text-blue-800">{analysis.analysis.recommendedFocus}</p>
                      <div className="mt-2 text-sm text-blue-700">
                        Improvement Potential: +{analysis.analysis.improvementPotential.toFixed(1)} points average
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select an assessment to view analysis
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Goal Suggestions */}
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Step 3: Smart Goal Suggestions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-generated goals based on assessment weak areas with progressive milestones
              </p>
            </CardHeader>
            <CardContent>
              {suggestionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Generating goal suggestions...</p>
                </div>
              ) : suggestions?.success ? (
                <div className="space-y-6">
                  {/* Goal Suggestions */}
                  <div className="space-y-4">
                    {suggestions.suggestions.map((suggestion, index) => (
                      <Card 
                        key={suggestion.targetSkill}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedSuggestions.find(s => s.targetSkill === suggestion.targetSkill) 
                            ? 'border-primary bg-primary/10' : ''
                        }`}
                        onClick={() => toggleSuggestionSelection(suggestion)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{suggestion.title}</h4>
                                <Badge variant={getPriorityColor(suggestion.priority)}>
                                  {suggestion.priority}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {suggestion.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {suggestion.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  Current: {suggestion.currentRating.toFixed(1)}
                                </div>
                                <ArrowRight className="h-3 w-3" />
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  Target: {suggestion.targetRating.toFixed(1)}
                                </div>
                                <div className="flex items-center gap-1 ml-auto">
                                  <Clock className="h-3 w-3" />
                                  {suggestion.milestones.length} milestones
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              {selectedSuggestions.find(s => s.targetSkill === suggestion.targetSkill) ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Plus className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {/* Milestones Preview */}
                          <div className="border-t pt-3">
                            <h5 className="text-sm font-medium mb-2">Progressive Milestones:</h5>
                            <div className="space-y-1">
                              {suggestion.milestones.map((milestone, mIndex) => (
                                <div key={mIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-medium">
                                    {mIndex + 1}
                                  </div>
                                  <span>{milestone.title}</span>
                                  <span className="ml-auto">Target: {milestone.targetRating.toFixed(1)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Create Goals Action */}
                  {selectedSuggestions.length > 0 && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-900">
                              Ready to Create {selectedSuggestions.length} Assessment-Driven Goals
                            </h4>
                            <p className="text-sm text-green-700">
                              Goals will be automatically assigned with progressive milestones and coach validation requirements
                            </p>
                          </div>
                          <Button 
                            onClick={createSelectedGoals}
                            disabled={createGoalsMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {createGoalsMutation.isPending ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                Creating...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Goals
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Complete assessment analysis to view goal suggestions
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}