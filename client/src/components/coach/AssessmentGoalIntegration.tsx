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

// Error Boundary Component
class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Assessment Goal Integration Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-medium">Assessment Analysis Error</h3>
          <p className="text-red-600 text-sm mt-2">
            There was an error displaying the assessment analysis. Please try refreshing the page.
          </p>
          <details className="mt-2 text-xs text-red-500">
            <summary>Error Details</summary>
            <pre>{this.state.error && this.state.error.toString()}</pre>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
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
import CoachGoalAssignmentForm from './CoachGoalAssignmentForm';

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

function AssessmentGoalIntegrationInner({ playerId = 1, showDemo = true }: AssessmentGoalIntegrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<GoalSuggestion[]>([]);
  const [showGoalCreationForm, setShowGoalCreationForm] = useState(false);
  const [selectedGoalData, setSelectedGoalData] = useState<any>(null);

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

  const openGoalCreationForm = (suggestion: GoalSuggestion) => {
    try {
      const assessmentData = {
        assessmentId: selectedAssessmentId!,
        playerId,
        suggestedGoal: {
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          priority: suggestion.priority,
          targetSkill: suggestion.targetSkill,
          currentRating: typeof suggestion.currentRating === 'string' ? parseFloat(suggestion.currentRating) : suggestion.currentRating,
          targetRating: typeof suggestion.targetRating === 'string' ? parseFloat(suggestion.targetRating) : suggestion.targetRating,
        },
        suggestedMilestones: suggestion.milestones.map(m => ({
          title: m.title,
          description: m.description,
          targetRating: typeof m.targetRating === 'string' ? parseFloat(m.targetRating) : m.targetRating,
        }))
      };
      setSelectedGoalData(assessmentData);
      setShowGoalCreationForm(true);
    } catch (error) {
      console.error('Error opening goal creation form:', error);
      toast({
        title: "Error",
        description: "Failed to open goal creation form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGoalCreationSuccess = () => {
    setShowGoalCreationForm(false);
    setSelectedGoalData(null);
    queryClient.invalidateQueries({ queryKey: ['/api/coach/goals'] });
    toast({
      title: "Goal Created Successfully",
      description: "Assessment-driven goal with milestones has been assigned",
    });
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
        <TabsList className="grid w-full grid-cols-3 h-12 md:h-10">
          <TabsTrigger value="assessments" className="flex items-center gap-2 text-xs md:text-sm px-2 py-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Recent Assessments</span>
            <span className="sm:hidden">Assessments</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            disabled={!selectedAssessmentId}
            className="flex items-center gap-2 text-xs md:text-sm px-2 py-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analysis & Weak Areas</span>
            <span className="sm:hidden">Analysis</span>
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            disabled={!suggestions?.success}
            className="flex items-center gap-2 text-xs md:text-sm px-2 py-2"
          >
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Goal Suggestions</span>
            <span className="sm:hidden">Goals</span>
          </TabsTrigger>
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
                  className={`cursor-pointer transition-colors hover:bg-muted/50 touch-manipulation ${
                    selectedAssessmentId === assessment.id ? 'border-primary bg-primary/10' : ''
                  }`}
                  onClick={() => handleAssessmentSelect(assessment.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm md:text-base truncate">{assessment.playerName} - {assessment.type} Assessment</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">{assessment.date}</p>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-base md:text-lg font-bold">{assessment.overallRating}/10</div>
                          <div className="text-xs text-muted-foreground">Overall PCP</div>
                        </div>
                        {assessment.hasWeakAreas && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs px-2 py-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Improvement Areas</span>
                            <span className="sm:hidden">Areas</span>
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                      {Object.entries(analysis.analysis.dimensionalRatings || {}).map(([dimension, rating]: [string, any]) => {
                        // Additional safety check
                        console.log('Processing rating for dimension:', dimension, 'rating:', rating, 'type:', typeof rating);
                        return (
                          <div key={dimension} className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {getDimensionalIcon(dimension)}
                              <span className="text-sm font-medium capitalize">{dimension}</span>
                            </div>
                            <div className="text-2xl font-bold">
                              {(() => {
                                try {
                                  // Handle string numbers too
                                  if (rating === null || rating === undefined) {
                                    return 'N/A';
                                  }
                                  const numRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
                                  if (isNaN(numRating)) {
                                    return 'N/A';
                                  }
                                  return numRating.toFixed(1);
                                } catch (e) {
                                  console.error('Error formatting rating:', rating, 'type:', typeof rating, e);
                                  return 'N/A';
                                }
                              })()}
                            </div>
                            <Progress value={(() => {
                              try {
                                if (rating === null || rating === undefined) return 0;
                                const numRating = typeof rating === 'string' ? parseFloat(rating) : Number(rating);
                                return isNaN(numRating) ? 0 : numRating * 10;
                              } catch (e) {
                                return 0;
                              }
                            })()} className="h-2 mt-1" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Weak Areas */}
                  <div>
                    <h3 className="font-medium mb-4">Identified Weak Areas (&lt; 6.0)</h3>
                    <div className="space-y-3">
                      {(analysis.analysis.weakAreas || []).map((area: WeakArea, index: number) => (
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
                                    {(() => {
                                      const rating = typeof area.currentRating === 'string' ? parseFloat(area.currentRating) : area.currentRating;
                                      return !isNaN(rating) ? rating.toFixed(1) : 'N/A';
                                    })()}
                                  </span>
                                  <ArrowRight className="h-4 w-4" />
                                  <span className="text-lg font-bold text-green-500">
                                    {(() => {
                                      const current = typeof area.currentRating === 'string' ? parseFloat(area.currentRating) : area.currentRating;
                                      const target = typeof area.targetImprovement === 'string' ? parseFloat(area.targetImprovement) : area.targetImprovement;
                                      return !isNaN(current) && !isNaN(target) ? (current + target).toFixed(1) : 'N/A';
                                    })()}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  +{(() => {
                                    const improvement = typeof area.targetImprovement === 'string' ? parseFloat(area.targetImprovement) : area.targetImprovement;
                                    return !isNaN(improvement) ? improvement.toFixed(1) : 'N/A';
                                  })()} improvement target
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
                        Improvement Potential: +{(() => {
                          try {
                            const potential = analysis.analysis.improvementPotential;
                            if (potential !== null && potential !== undefined && typeof potential === 'number') {
                              return potential.toFixed(1);
                            }
                            return '0.0';
                          } catch (e) {
                            console.error('Error formatting improvement potential:', analysis.analysis.improvementPotential, e);
                            return '0.0';
                          }
                        })()} points average
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
                    {suggestions.suggestions.map((suggestion: GoalSuggestion, index: number) => (
                      <Card key={suggestion.targetSkill} className="transition-colors hover:bg-muted/50">
                        <CardContent className="p-3 md:p-4">
                          <div className="flex items-start justify-between mb-3 gap-3">
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
                                  Current: {(() => {
                                    const rating = typeof suggestion.currentRating === 'string' ? parseFloat(suggestion.currentRating) : suggestion.currentRating;
                                    return !isNaN(rating) ? rating.toFixed(1) : 'N/A';
                                  })()}
                                </div>
                                <ArrowRight className="h-3 w-3" />
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  Target: {(() => {
                                    const rating = typeof suggestion.targetRating === 'string' ? parseFloat(suggestion.targetRating) : suggestion.targetRating;
                                    return !isNaN(rating) ? rating.toFixed(1) : 'N/A';
                                  })()}
                                </div>
                                <div className="flex items-center gap-1 ml-auto">
                                  <Clock className="h-3 w-3" />
                                  {suggestion.milestones.length} milestones
                                </div>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openGoalCreationForm(suggestion);
                                }}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 h-10 px-3 text-xs md:text-sm min-w-[100px] touch-manipulation"
                              >
                                <Plus className="h-4 w-4 md:mr-1" />
                                <span className="hidden md:inline ml-1">Create Goal</span>
                                <span className="md:hidden sr-only">Create</span>
                              </Button>
                            </div>
                          </div>

                          {/* Milestones Preview */}
                          <div className="border-t pt-3">
                            <h5 className="text-sm font-medium mb-2">Progressive Milestones:</h5>
                            <div className="space-y-1">
                              {suggestion.milestones.map((milestone: any, mIndex: number) => (
                                <div key={mIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-medium">
                                    {mIndex + 1}
                                  </div>
                                  <span>{milestone.title}</span>
                                  <span className="ml-auto">
                                    Target: {(() => {
                                      if (milestone.targetRating === null || milestone.targetRating === undefined) {
                                        return 'N/A';
                                      }
                                      const rating = typeof milestone.targetRating === 'string' ? parseFloat(milestone.targetRating) : milestone.targetRating;
                                      return !isNaN(rating) && rating !== null ? rating.toFixed(1) : 'N/A';
                                    })()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Sprint 3 Phase 3.2 Complete</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Each goal suggestion now includes a "Create Goal" button that opens the enhanced form 
                      with pre-populated assessment data and intelligent milestone suggestions.
                    </p>
                  </div>
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

      {/* Goal Creation Form Modal */}
      {showGoalCreationForm && selectedGoalData && (
        <CoachGoalAssignmentForm
          onSuccess={handleGoalCreationSuccess}
          onCancel={() => {
            setShowGoalCreationForm(false);
            setSelectedGoalData(null);
          }}
          assessmentData={selectedGoalData}
        />
      )}
    </div>
  );
}

// Export wrapped with error boundary
export default function AssessmentGoalIntegration(props: AssessmentGoalIntegrationProps) {
  return (
    <ErrorBoundary>
      <AssessmentGoalIntegrationInner {...props} />
    </ErrorBoundary>
  );
}