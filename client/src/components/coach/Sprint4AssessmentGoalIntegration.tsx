/**
 * PKL-278651-SPRINT4-INTEGRATION - Sprint 4 Assessment-Goal Integration Component
 * 
 * Complete Sprint 4 workflow: Assessment → Suggestions → Enhanced Form → Bulk Assignment
 * Integrates Sprint 3 Phase 3.2 assessment system with Sprint 4 goal creation features
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-04
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Target, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Brain,
  Zap,
  Heart,
  CheckCircle,
  ArrowRight,
  Plus,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import EnhancedGoalCreationForm from './EnhancedGoalCreationForm';

// Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

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
  level: number;
  goals: { active: number; completed: number };
}

interface Sprint4AssessmentGoalIntegrationProps {
  assessmentId?: number;
  playerId?: number;
}

export default function Sprint4AssessmentGoalIntegration({ 
  assessmentId = 1, 
  playerId = 1 
}: Sprint4AssessmentGoalIntegrationProps) {
  const { toast } = useToast();
  const [selectedSuggestion, setSelectedSuggestion] = useState<GoalSuggestion | null>(null);
  const [showEnhancedForm, setShowEnhancedForm] = useState(false);
  const [formMode, setFormMode] = useState<'single' | 'bulk'>('single');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch assessment analysis
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['/api/pcp/assessment', assessmentId, 'weak-areas'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/pcp/assessment/${assessmentId}/weak-areas`);
      return response.json();
    },
  });

  // Fetch goal suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['/api/coach/goals/suggestions-from-assessment', assessmentId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/coach/goals/suggestions-from-assessment/${assessmentId}`);
      return response.json();
    },
  });

  // Fetch coach players for bulk assignment
  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/coach/players'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/coach/players');
      return response.json();
    },
  });

  const players: Player[] = playersData?.players || [];
  const goalSuggestions: GoalSuggestion[] = suggestions?.suggestions || [];
  const assessmentSummary = suggestions?.assessmentSummary || analysis?.analysis;

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return Target;
      case 'tactical': return Brain;
      case 'physical': return Zap;
      case 'mental': return Heart;
      default: return Target;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: GoalSuggestion, mode: 'single' | 'bulk') => {
    setSelectedSuggestion(suggestion);
    setFormMode(mode);
    setShowEnhancedForm(true);
  };

  if (showEnhancedForm && selectedSuggestion) {
    return (
      <EnhancedGoalCreationForm
        suggestion={selectedSuggestion}
        players={players}
        mode={formMode}
        onSuccess={() => {
          setShowEnhancedForm(false);
          setSelectedSuggestion(null);
          toast({
            title: "Success",
            description: `Goal ${formMode === 'bulk' ? 'assigned to multiple players' : 'created successfully'}`,
          });
        }}
        onCancel={() => {
          setShowEnhancedForm(false);
          setSelectedSuggestion(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Sprint 4 Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Sprint 4: Complete Assessment-Goal Workflow
            <Badge variant="outline" className="ml-2">Enhanced</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Assessment Analysis → Smart Suggestions → Enhanced Goal Creation → Bulk Assignment
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Assessment Overview</TabsTrigger>
          <TabsTrigger value="suggestions">Goal Suggestions</TabsTrigger>
          <TabsTrigger value="players">Player Selection</TabsTrigger>
        </TabsList>

        {/* Assessment Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Assessment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : assessmentSummary ? (
                <div className="space-y-4">
                  {/* Overall Rating */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-lg font-semibold text-blue-800">
                      Overall PCP Rating: {assessmentSummary.overallRating?.toFixed(1)}/10
                    </p>
                    <p className="text-sm text-blue-600">
                      Improvement Potential: +{assessmentSummary.improvementPotential} points
                    </p>
                  </div>

                  {/* Dimensional Breakdown */}
                  {assessmentSummary.dimensionalRatings && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(assessmentSummary.dimensionalRatings).map(([dimension, rating]: [string, any]) => {
                        const Icon = getCategoryIcon(dimension);
                        return (
                          <div key={dimension} className="text-center p-3 border rounded-lg">
                            <Icon className="h-6 w-6 mx-auto mb-2" />
                            <p className="text-sm font-medium capitalize">{dimension}</p>
                            <p className="text-xl font-bold">{rating.toFixed(1)}</p>
                            <Progress value={rating * 10} className="mt-2" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Recommended Focus */}
                  {assessmentSummary.recommendedFocus && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-medium text-yellow-800">Recommended Focus:</p>
                      <p className="text-sm text-yellow-700">{assessmentSummary.recommendedFocus}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No assessment data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goal Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Smart Goal Suggestions ({goalSuggestions.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-generated goals based on assessment weak areas
              </p>
            </CardHeader>
            <CardContent>
              {suggestionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : goalSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {goalSuggestions.map((suggestion, index) => {
                    const Icon = getCategoryIcon(suggestion.category);
                    return (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(suggestion.priority)}>
                                  {suggestion.priority} priority
                                </Badge>
                                <Badge variant="outline">{suggestion.category}</Badge>
                                <span className="text-xs text-gray-500">
                                  {suggestion.currentRating.toFixed(1)} → {suggestion.targetRating.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <CheckCircle className="h-3 w-3" />
                                {suggestion.milestones.length} milestones
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSuggestion(suggestion);
                              setActiveTab('players');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSuggestionSelect(suggestion, 'single')}
                          >
                            <Target className="h-4 w-4 mr-1" />
                            Create Goal
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSuggestionSelect(suggestion, 'bulk')}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Bulk Assign
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No goal suggestions available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Player Selection Tab */}
        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Players ({players.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select players for bulk goal assignment
              </p>
            </CardHeader>
            <CardContent>
              {playersLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : players.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map((player) => (
                      <div key={player.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {player.firstName[0]}{player.lastName[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{player.firstName} {player.lastName}</p>
                            <p className="text-xs text-gray-500">@{player.username}</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>Level: {player.level}</p>
                          <p>Active Goals: {player.goals.active}</p>
                          <p>Completed: {player.goals.completed}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedSuggestion && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Selected Goal for Bulk Assignment:</h4>
                      <p className="text-sm text-blue-700">{selectedSuggestion.title}</p>
                      <div className="flex justify-end mt-3">
                        <Button
                          onClick={() => handleSuggestionSelect(selectedSuggestion, 'bulk')}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Proceed to Assignment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No players available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}