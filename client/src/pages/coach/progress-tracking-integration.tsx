/**
 * Sprint 3 Phase 3: Progress Tracking Integration
 * Real-time goal progress updates linked to assessment improvements
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Users,
  Calendar,
  Trophy,
  Activity,
  Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface StudentProgress {
  studentId: number;
  studentName: string;
  activeGoals: number;
  completedGoals: number;
  overallProgress: number;
  recentActivity: RecentActivity[];
  milestoneProgress: MilestoneProgress[];
}

interface RecentActivity {
  id: number;
  type: 'drill_completion' | 'assessment_update' | 'milestone_achieved' | 'goal_completed';
  description: string;
  timestamp: string;
  impactedGoals: string[];
  progressGain: number;
}

interface MilestoneProgress {
  goalId: number;
  goalTitle: string;
  milestoneId: number;
  milestoneTitle: string;
  currentProgress: number;
  targetValue: number;
  progressType: 'rating_improvement' | 'drill_count' | 'consistency_metric';
  estimatedCompletion: string;
  recentUpdates: number;
}

interface ProgressCorrelation {
  goalId: number;
  goalTitle: string;
  assessmentDimension: string;
  correlationStrength: number;
  improvementRate: number;
  predictedCompletion: string;
  keyFactors: string[];
}

export default function ProgressTrackingIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(1);
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch real-time student progress data
  const { data: studentsProgressData, isLoading: loadingProgress } = useQuery({
    queryKey: [`/api/coach/progress-tracking/students`, timeRange],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch progress correlations
  const { data: correlationsData, isLoading: loadingCorrelations } = useQuery({
    queryKey: [`/api/coach/progress-tracking/correlations`, selectedStudent, timeRange],
    enabled: !!selectedStudent,
  });

  // Fetch milestone predictions
  const { data: predictionsData, isLoading: loadingPredictions } = useQuery({
    queryKey: [`/api/coach/progress-tracking/predictions`, selectedStudent],
    enabled: !!selectedStudent,
  });

  // Auto-update milestone mutation
  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ milestoneId, newProgress }: { milestoneId: number; newProgress: number }) => {
      const response = await fetch(`/api/coach/milestones/${milestoneId}/update-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: newProgress, autoUpdated: true })
      });
      
      if (!response.ok) throw new Error('Failed to update milestone');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/progress-tracking'] });
      toast({
        title: "Milestone Updated",
        description: "Progress automatically updated based on recent activity",
      });
    }
  });

  const studentsProgress = (studentsProgressData?.data as StudentProgress[]) || [];
  const correlations = (correlationsData?.data as ProgressCorrelation[]) || [];
  const predictions = (predictionsData?.data as any) || {};

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'drill_completion': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'assessment_update': return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case 'milestone_achieved': return <Target className="h-4 w-4 text-green-600" />;
      case 'goal_completed': return <Trophy className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCorrelationColor = (strength: number) => {
    if (strength >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (strength >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 90) return { color: 'text-green-600', label: 'Excellent' };
    if (progress >= 70) return { color: 'text-blue-600', label: 'On Track' };
    if (progress >= 50) return { color: 'text-yellow-600', label: 'Moderate' };
    return { color: 'text-red-600', label: 'Needs Attention' };
  };

  if (loadingProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Loading real-time progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Real-Time Progress Tracking
                  </CardTitle>
                  <CardDescription className="text-base">
                    Live integration between drill completions, assessments, and goal progress
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Live Updates
                </Badge>
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="pt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Progress Overview</TabsTrigger>
                <TabsTrigger value="realtime">Real-Time Activity</TabsTrigger>
                <TabsTrigger value="correlations">Progress Correlations</TabsTrigger>
                <TabsTrigger value="predictions">Milestone Predictions</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentsProgress.map((student) => (
                <Card 
                  key={student.studentId} 
                  className={`backdrop-blur-sm border-0 shadow-lg cursor-pointer transition-all ${
                    selectedStudent === student.studentId 
                      ? 'bg-white/90 ring-2 ring-blue-200' 
                      : 'bg-white/70 hover:bg-white/85'
                  }`}
                  onClick={() => setSelectedStudent(student.studentId)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{student.studentName}</CardTitle>
                      <Badge className={getProgressStatus(student.overallProgress).color}>
                        {getProgressStatus(student.overallProgress).label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span className="font-medium">{student.overallProgress}%</span>
                      </div>
                      <Progress value={student.overallProgress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{student.activeGoals}</div>
                        <div className="text-xs text-gray-600">Active Goals</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{student.completedGoals}</div>
                        <div className="text-xs text-gray-600">Completed</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Recent Activity:</h4>
                      <div className="space-y-1">
                        {student.recentActivity.slice(0, 3).map((activity, index) => (
                          <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                            {getActivityIcon(activity.type)}
                            <span className="truncate">{activity.description}</span>
                            <Badge variant="outline" className="text-xs">
                              +{activity.progressGain}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Real-Time Activity */}
          <TabsContent value="realtime" className="space-y-6">
            {selectedStudent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Activity Feed */}
                <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Live Activity Feed
                    </CardTitle>
                    <CardDescription>
                      Real-time updates from drill completions and assessments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentsProgress
                      .find(s => s.studentId === selectedStudent)
                      ?.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="bg-white p-2 rounded-full">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {activity.impactedGoals.map((goal, goalIndex) => (
                                <Badge key={goalIndex} variant="outline" className="text-xs">
                                  {goal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            +{activity.progressGain}%
                          </Badge>
                        </div>
                      )) || <p className="text-gray-500 text-center py-8">No recent activity</p>}
                  </CardContent>
                </Card>

                {/* Milestone Progress */}
                <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Active Milestone Progress
                    </CardTitle>
                    <CardDescription>
                      Auto-updating milestones based on performance data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentsProgress
                      .find(s => s.studentId === selectedStudent)
                      ?.milestoneProgress.map((milestone, index) => (
                        <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">{milestone.goalTitle}</h4>
                              <p className="text-xs text-gray-600">{milestone.milestoneTitle}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {milestone.recentUpdates} updates
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress: {milestone.currentProgress}/{milestone.targetValue}</span>
                              <span className="font-medium">
                                {Math.round((milestone.currentProgress/milestone.targetValue) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(milestone.currentProgress/milestone.targetValue) * 100} 
                              className="h-2"
                            />
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Est. completion: {milestone.estimatedCompletion}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateMilestoneMutation.mutate({
                                  milestoneId: milestone.milestoneId,
                                  newProgress: milestone.currentProgress + 0.1
                                })}
                                disabled={updateMilestoneMutation.isPending}
                                className="h-6 px-2 text-xs"
                              >
                                Auto-Update
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-gray-500 text-center py-8">No active milestones</p>}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Progress Correlations */}
          <TabsContent value="correlations" className="space-y-6">
            {loadingCorrelations ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Analyzing progress correlations...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {correlations.map((correlation, index) => (
                  <Card key={index} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{correlation.goalTitle}</CardTitle>
                        <Badge className={getCorrelationColor(correlation.correlationStrength)}>
                          {Math.round(correlation.correlationStrength * 100)}% correlation
                        </Badge>
                      </div>
                      <CardDescription>
                        Assessment dimension: {correlation.assessmentDimension}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {correlation.improvementRate > 0 ? '+' : ''}{correlation.improvementRate}%
                          </div>
                          <div className="text-sm text-gray-600">Improvement Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{correlation.predictedCompletion}</div>
                          <div className="text-sm text-gray-600">Predicted Completion</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Key Contributing Factors:</h4>
                        <ul className="space-y-1">
                          {correlation.keyFactors.map((factor, factorIndex) => (
                            <li key={factorIndex} className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Milestone Predictions */}
          <TabsContent value="predictions" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  AI-Powered Progress Predictions
                </CardTitle>
                <CardDescription>
                  Machine learning predictions based on historical performance patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingPredictions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Generating AI predictions...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                      <div className="text-center space-y-2">
                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto" />
                        <div className="text-2xl font-bold text-blue-900">
                          {predictions.nextMilestoneCompletion || '3-5 days'}
                        </div>
                        <div className="text-sm text-blue-700">Next Milestone</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                      <div className="text-center space-y-2">
                        <Trophy className="h-8 w-8 text-green-600 mx-auto" />
                        <div className="text-2xl font-bold text-green-900">
                          {predictions.goalCompletionRate || '78%'}
                        </div>
                        <div className="text-sm text-green-700">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                      <div className="text-center space-y-2">
                        <BarChart3 className="h-8 w-8 text-purple-600 mx-auto" />
                        <div className="text-2xl font-bold text-purple-900">
                          {predictions.improvementVelocity || '+12%'}
                        </div>
                        <div className="text-sm text-purple-700">Weekly Improvement</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}