/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 1: Coach Match Dashboard
 * 
 * World-class coach dashboard with seamless match integration
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Target, 
  BarChart3, 
  Star, 
  Clock,
  Trophy,
  Brain,
  Zap,
  Activity,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';

interface CoachMatchDashboardProps {
  coachId?: number;
}

export const CoachMatchDashboard: React.FC<CoachMatchDashboardProps> = ({ coachId }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  
  // Fetch coach dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/coach-match/dashboard'],
    refetchInterval: 30000 // Update every 30 seconds
  });
  
  // Fetch student progress data
  const { data: studentProgressData } = useQuery({
    queryKey: ['/api/coach-match/student-progress']
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const students = studentProgressData?.progress || [];
  const recentSessions = dashboardData?.recentSessions || [];
  const coachingMetrics = dashboardData?.coachingMetrics || [];
  
  // Calculate coaching effectiveness score
  const calculateEffectivenessScore = () => {
    if (coachingMetrics.length === 0) return 0;
    const avgScore = coachingMetrics.reduce((sum, metric) => sum + (metric.coachingEffectiveness || 0), 0) / coachingMetrics.length;
    return Math.round(avgScore * 100);
  };
  
  // Calculate student improvement trends
  const calculateImprovementTrends = () => {
    return students.map(student => {
      const avgImprovement = (
        (student.technicalProgression || 0) +
        (student.tacticalProgression || 0) +
        (student.physicalProgression || 0) +
        (student.mentalProgression || 0)
      ) / 4;
      
      return {
        ...student,
        improvementScore: Math.round(avgImprovement * 10) / 10,
        trend: avgImprovement > 6 ? 'excellent' : avgImprovement > 4 ? 'good' : 'needs-attention'
      };
    });
  };
  
  const studentsWithTrends = calculateImprovementTrends();
  const effectivenessScore = calculateEffectivenessScore();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coach Dashboard</h1>
          <p className="text-muted-foreground">
            Integrated coaching analytics and match insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
            System Active
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                +2 this week
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coaching Effectiveness</p>
                <p className="text-2xl font-bold">{effectivenessScore}%</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Progress value={effectivenessScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Sessions</p>
                <p className="text-2xl font-bold">{recentSessions.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Last 7 days
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Improvement</p>
                <p className="text-2xl font-bold">+2.3</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                PCP Rating Points
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Student Progress</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Match Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>
        
        {/* Student Progress Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Development Overview
              </CardTitle>
              <CardDescription>
                Track individual student progress across all coaching dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentsWithTrends.length > 0 ? (
                <div className="space-y-4">
                  {studentsWithTrends.map((student, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student.studentName?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{student.studentName || 'Student'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {student.matchesPlayed || 0} matches played
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={student.trend === 'excellent' ? 'default' : 
                                   student.trend === 'good' ? 'secondary' : 'outline'}
                          >
                            {student.improvementScore}/10
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      {/* Progress Bars */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Technical
                            </span>
                            <span>{student.technicalProgression || 0}/10</span>
                          </div>
                          <Progress 
                            value={(student.technicalProgression || 0) * 10} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              Tactical
                            </span>
                            <span>{student.tacticalProgression || 0}/10</span>
                          </div>
                          <Progress 
                            value={(student.tacticalProgression || 0) * 10} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Physical
                            </span>
                            <span>{student.physicalProgression || 0}/10</span>
                          </div>
                          <Progress 
                            value={(student.physicalProgression || 0) * 10} 
                            className="h-2"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Mental
                            </span>
                            <span>{student.mentalProgression || 0}/10</span>
                          </div>
                          <Progress 
                            value={(student.mentalProgression || 0) * 10} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      
                      {/* Last Session Info */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Last session: {student.lastSession ? new Date(student.lastSession).toLocaleDateString() : 'Never'}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No student data available yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start coaching sessions to see progress tracking
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Recent Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Coaching Sessions
              </CardTitle>
              <CardDescription>
                Review recent sessions and match integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{session.sessionType || 'Coaching Session'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                        <Badge variant="outline">{session.duration || 'N/A'}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{session.coachInputs || 0} inputs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{session.assessmentScore || 'N/A'} rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          <span>{session.matchResults || 'No match'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent sessions</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sessions with match integration will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Match Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Match Integration Analytics
              </CardTitle>
              <CardDescription>
                Analyze coaching effectiveness through match performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coaching Impact Metrics */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Coaching Impact</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Win Rate Improvement</span>
                      <Badge variant="outline">+12%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Skill Growth</span>
                      <Badge variant="outline">+1.8 avg</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Match Preparation</span>
                      <Badge variant="outline">Excellent</Badge>
                    </div>
                  </div>
                </div>
                
                {/* PCP Assessment Trends */}
                <div className="space-y-4">
                  <h3 className="font-semibold">PCP Assessment Trends</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Technical Assessments</span>
                      <Badge variant="outline">{coachingMetrics.length} completed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Improvement Rate</span>
                      <Badge variant="outline">+0.3/session</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Student Satisfaction</span>
                      <Badge variant="outline">4.8/5</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Coaching Insights
              </CardTitle>
              <CardDescription>
                Intelligent recommendations based on match data and student progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Key Insights */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Strong Technical Foundation</p>
                        <p className="text-xs text-muted-foreground">
                          Your students show consistent improvement in technical skills
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Focus on Mental Toughness</p>
                        <p className="text-xs text-muted-foreground">
                          Consider incorporating more mental game training
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Excellent Progress Tracking</p>
                        <p className="text-xs text-muted-foreground">
                          Your match integration is yielding great results
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Recommended Actions
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Schedule Mental Game Session
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Create Drill Progression Plan
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Review Match Video Analysis
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};