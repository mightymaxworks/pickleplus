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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("assessments");

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

  // React to successful analysis completion
  React.useEffect(() => {
    if (analysis?.success && selectedAssessmentId) {
      toast({
        title: "Analysis Complete",
        description: `Found ${analysis.analysis?.weakAreas?.length || 0} areas for improvement with specific recommendations`,
        duration: 3000,
      });
      // Auto-switch to analysis tab
      setTimeout(() => setActiveTab("analysis"), 1000);
    }
  }, [analysis, selectedAssessmentId, toast]);

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
    setIsAnalyzing(true);
    setSelectedAssessmentId(assessmentId);
    setSelectedSuggestions([]);
    
    // Show immediate feedback
    toast({
      title: "Analyzing Assessment",
      description: "Processing PCP data and generating weak area analysis...",
    });
    
    // Reset analyzing state after a delay (the useQuery will handle the actual loading)
    setTimeout(() => setIsAnalyzing(false), 2000);
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
            {(analysis?.isLoading || isAnalyzing) ? (
              <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {(analysis?.isLoading || isAnalyzing) ? 'Analyzing...' : 'Analysis & Weak Areas'}
            </span>
            <span className="sm:hidden">
              {(analysis?.isLoading || isAnalyzing) ? 'Analyzing' : 'Analysis'}
            </span>
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
                  className={`cursor-pointer transition-all duration-200 hover:bg-muted/50 touch-manipulation ${
                    selectedAssessmentId === assessment.id ? 'border-primary bg-primary/10 shadow-md' : ''
                  } ${isAnalyzing && selectedAssessmentId === assessment.id ? 'animate-pulse border-blue-400' : ''}`}
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
                  {/* Success Indicator */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Analysis Complete</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Found {analysis.analysis.weakAreas?.length || 0} areas for improvement with specific recommendations
                    </p>
                  </div>

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
                  {/* Assessment-Based Insights Summary */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          Assessment Overview
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Overall PCP Rating:</span>
                            <span className="font-medium">{suggestions.assessmentSummary?.overallRating?.toFixed(1) || 'N/A'}/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Improvement Potential:</span>
                            <span className="font-medium text-green-600">+{suggestions.assessmentSummary?.improvementPotential?.toFixed(1) || 'N/A'} points</span>
                          </div>
                          <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                            <strong>Recommended Focus:</strong> {suggestions.assessmentSummary?.recommendedFocus || 'Continue balanced development'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4 text-green-600" />
                          Smart Suggestions
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Available Goals:</span>
                            <span className="font-medium">{suggestions.suggestions?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>High Priority:</span>
                            <span className="font-medium text-red-600">
                              {suggestions.suggestions?.filter((s: GoalSuggestion) => s.priority === 'high').length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Selected for Creation:</span>
                            <span className="font-medium text-blue-600">{selectedSuggestions.length}</span>
                          </div>
                          {selectedSuggestions.length > 0 && (
                            <Button 
                              onClick={createSelectedGoals}
                              disabled={createGoalsMutation.isPending}
                              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                              size="sm"
                            >
                              {createGoalsMutation.isPending ? (
                                <div className="h-3 w-3 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                              ) : (
                                <Plus className="h-3 w-3 mr-2" />
                              )}
                              Create {selectedSuggestions.length} Goal{selectedSuggestions.length !== 1 ? 's' : ''}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Goal Suggestions */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Assessment-Driven Goal Recommendations ({suggestions.suggestions?.length || 0})
                    </h4>
                    <div className="space-y-4">
                      {suggestions.suggestions.map((suggestion: GoalSuggestion, index: number) => {
                        const isSelected = selectedSuggestions.some(s => s.targetSkill === suggestion.targetSkill);
                        
                        return (
                          <Card 
                            key={suggestion.targetSkill} 
                            className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                              isSelected ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20' : 'hover:border-primary/30'
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className={`p-2 rounded-lg ${
                                    suggestion.category === 'technical' ? 'bg-blue-100 text-blue-600' :
                                    suggestion.category === 'tactical' ? 'bg-purple-100 text-purple-600' :
                                    suggestion.category === 'physical' ? 'bg-green-100 text-green-600' :
                                    'bg-orange-100 text-orange-600'
                                  }`}>
                                    {getDimensionalIcon(suggestion.category)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <h4 className="font-medium text-sm md:text-base leading-tight">{suggestion.title}</h4>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs px-2 py-1 capitalize">
                                        {suggestion.priority} Priority
                                      </Badge>
                                      <Badge variant="outline" className="text-xs px-2 py-1 capitalize">
                                        {suggestion.category}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs md:text-sm text-muted-foreground mb-3 leading-relaxed">
                                    {suggestion.description}
                                  </p>
                                  
                                  {/* Rating Improvement Visualization */}
                                  <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                      <span className="text-muted-foreground">Current Performance</span>
                                      <span className="text-muted-foreground">Target Performance</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                        <div 
                                          className="bg-red-400 h-2.5 rounded-full transition-all duration-300"
                                          style={{ width: `${(suggestion.currentRating / 10) * 100}%` }}
                                        />
                                      </div>
                                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                        <div 
                                          className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                          style={{ width: `${(suggestion.targetRating / 10) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs mt-2">
                                      <span className="font-medium">{suggestion.currentRating}/10</span>
                                      <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                        +{(suggestion.targetRating - suggestion.currentRating).toFixed(1)} improvement
                                      </span>
                                      <span className="font-medium">{suggestion.targetRating}/10</span>
                                    </div>
                                  </div>
                                  
                                  {/* Milestone Preview */}
                                  <div className="mb-4">
                                    <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Progressive Milestone Roadmap ({suggestion.milestones?.length || 0} steps)
                                    </h5>
                                    <div className="space-y-2">
                                      {(suggestion.milestones || []).slice(0, 3).map((milestone: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                                            idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-green-500'
                                          }`}>
                                            {idx + 1}
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-medium">{milestone.title}</div>
                                            <div className="text-muted-foreground">
                                              Target: {(() => {
                                                if (milestone.targetRating === null || milestone.targetRating === undefined) {
                                                  return 'N/A';
                                                }
                                                const rating = typeof milestone.targetRating === 'string' ? parseFloat(milestone.targetRating) : milestone.targetRating;
                                                return !isNaN(rating) && rating !== null ? rating.toFixed(1) : 'N/A';
                                              })()}/10 • {milestone.description}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      {(suggestion.milestones?.length || 0) > 3 && (
                                        <div className="text-xs text-muted-foreground pl-8">
                                          +{(suggestion.milestones?.length || 0) - 3} additional milestones...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={isSelected ? "default" : "outline"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSuggestionSelection(suggestion);
                                      }}
                                      className="text-xs px-3 py-1.5 h-auto"
                                    >
                                      {isSelected ? (
                                        <>
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Selected
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="h-3 w-3 mr-1" />
                                          Select Goal
                                        </>
                                      )}
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openGoalCreationForm(suggestion);
                                      }}
                                      className="text-xs px-3 py-1.5 h-auto text-muted-foreground hover:text-foreground"
                                    >
                                      <Target className="h-3 w-3 mr-1" />
                                      Customize
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
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