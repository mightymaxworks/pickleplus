/**
 * Sprint 3 Phase 2: Assessment Analysis Dashboard
 * Enhanced visualization and analysis of student assessments with trend tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain, 
  Activity,
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AssessmentData {
  id: number;
  technicalRating: number;
  tacticalRating: number;
  physicalRating: number;
  mentalRating: number;
  overallRating: number;
  notes: string;
  createdAt: string;
}

interface TrendData {
  dimension: string;
  trend_direction: 'improving' | 'declining' | 'stable';
  starting_rating: number;
  ending_rating: number;
  average_improvement: number;
  assessment_count: number;
}

interface WeakAreaData {
  weak_areas: Array<{
    area: string;
    rating: number;
    severity: 'high' | 'medium' | 'low';
    specific_issues: string[];
  }>;
  improvement_suggestions: Array<{
    area: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    estimated_improvement_time: string;
  }>;
  overall_priority_focus: string;
}

export default function AssessmentAnalysisDashboard() {
  const { toast } = useToast();
  const [selectedStudent] = useState(1);
  const [selectedAssessment] = useState(123);

  // Fetch latest assessment data
  const { data: latestAssessment, isLoading: loadingAssessment } = useQuery({
    queryKey: [`/api/coach/assessments/${selectedStudent}/latest`],
    refetchOnWindowFocus: false,
  });

  // Fetch assessment trends
  const { data: trendsData, isLoading: loadingTrends } = useQuery({
    queryKey: [`/api/coach/assessments/${selectedStudent}/trends`],
    refetchOnWindowFocus: false,
  });

  // Fetch weak areas analysis
  const { data: weakAreasData, isLoading: loadingWeakAreas } = useQuery({
    queryKey: [`/api/coach/assessments/${selectedAssessment}/weak-areas`],
    refetchOnWindowFocus: false,
  });

  const getDimensionIcon = (dimension: string) => {
    switch (dimension.toLowerCase()) {
      case 'technical': return <Activity className="h-5 w-5" />;
      case 'tactical': return <Brain className="h-5 w-5" />;
      case 'physical': return <TrendingUp className="h-5 w-5" />;
      case 'mental': return <Target className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCreateGoals = () => {
    toast({
      title: "Creating Intelligent Goals",
      description: "Generating personalized goals based on assessment analysis...",
    });
    // Navigate to goal creation interface
    window.location.href = '/coach/intelligent-goal-creation';
  };

  if (loadingAssessment || loadingTrends || loadingWeakAreas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Analyzing assessment data...</p>
        </div>
      </div>
    );
  }

  const assessment = latestAssessment?.data as AssessmentData;
  const trends = trendsData?.data as TrendData[];
  const weakAreas = weakAreasData?.data as WeakAreaData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Assessment Analysis Dashboard
                  </CardTitle>
                  <CardDescription className="text-base">
                    Comprehensive student performance analysis and improvement tracking
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleCreateGoals}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white whitespace-nowrap"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Create Goals
                </Button>
                <div className="hidden sm:block text-xs text-gray-500 self-center">
                  AI-powered recommendations
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="pt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Assessment Overview</TabsTrigger>
                <TabsTrigger value="trends">Progress Trends</TabsTrigger>
                <TabsTrigger value="weaknesses">Weak Areas</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Assessment Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Technical Rating */}
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-sm font-medium">Technical</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-gray-900">
                      {assessment?.technicalRating || 6.5}/10
                    </div>
                    <Progress value={(assessment?.technicalRating || 6.5) * 10} className="h-2" />
                    <p className="text-sm text-gray-600">Shot execution & form</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tactical Rating */}
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-sm font-medium">Tactical</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-gray-900">
                      {assessment?.tacticalRating || 7.2}/10
                    </div>
                    <Progress value={(assessment?.tacticalRating || 7.2) * 10} className="h-2" />
                    <p className="text-sm text-gray-600">Strategy & positioning</p>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Rating */}
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-sm font-medium">Physical</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-gray-900">
                      {assessment?.physicalRating || 6.8}/10
                    </div>
                    <Progress value={(assessment?.physicalRating || 6.8) * 10} className="h-2" />
                    <p className="text-sm text-gray-600">Movement & endurance</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mental Rating */}
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-sm font-medium">Mental</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-gray-900">
                      {assessment?.mentalRating || 7.0}/10
                    </div>
                    <Progress value={(assessment?.mentalRating || 7.0) * 10} className="h-2" />
                    <p className="text-sm text-gray-600">Focus & composure</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Assessment Summary */}
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Overall Assessment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {assessment?.overallRating || 6.9}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">Overall PCP Rating</div>
                    <Progress value={(assessment?.overallRating || 6.9) * 10} className="h-3 mt-2" />
                    <p className="text-sm text-gray-600 mt-2">Based on 4-dimensional PCP assessment methodology</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-gray-700">
                    <strong>Coach Notes:</strong> {assessment?.notes || "Strong tactical awareness, needs work on technical consistency"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Trends */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trends?.map((trend, index) => (
                <Card key={index} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDimensionIcon(trend.dimension)}
                        <CardTitle className="capitalize">{trend.dimension} Progress</CardTitle>
                      </div>
                      {getTrendIcon(trend.trend_direction)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Starting: {trend.starting_rating}/10</span>
                      <span>Current: {trend.ending_rating}/10</span>
                    </div>
                    <Progress 
                      value={trend.ending_rating * 10} 
                      className="h-3"
                    />
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={trend.trend_direction === 'improving' ? 'default' : trend.trend_direction === 'declining' ? 'destructive' : 'secondary'}
                        className="capitalize"
                      >
                        {trend.trend_direction}
                      </Badge>
                      <span className="text-sm font-medium">
                        {trend.average_improvement > 0 ? '+' : ''}{trend.average_improvement} avg improvement
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Based on {trend.assessment_count} assessments
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Weak Areas */}
          <TabsContent value="weaknesses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {weakAreas?.weak_areas?.map((area, index) => (
                <Card key={index} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        {area.area} Issues
                      </CardTitle>
                      <Badge className={getSeverityColor(area.severity)}>
                        {area.severity} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{area.rating}/10</span>
                      <Progress value={area.rating * 10} className="flex-1 h-2" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Specific Issues:</h4>
                      <ul className="space-y-1">
                        {area.specific_issues.map((issue, issueIndex) => (
                          <li key={issueIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Priority Focus Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                  <p className="text-lg font-medium text-gray-900">
                    {weakAreas?.overall_priority_focus || "Technical consistency should be the primary focus area"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {weakAreas?.improvement_suggestions?.map((suggestion, index) => (
                <Card key={index} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{suggestion.area} Improvement</CardTitle>
                      <Badge className={getSeverityColor(suggestion.priority)}>
                        {suggestion.priority} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{suggestion.suggestion}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Timeline:</span>
                      <span className="font-medium">{suggestion.estimated_improvement_time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ready to Create Targeted Goals?</h3>
                  <p className="text-gray-600">
                    Use this analysis to generate intelligent, personalized goals for your student
                  </p>
                  <Button 
                    onClick={handleCreateGoals}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    <span className="whitespace-nowrap">Generate Goals</span>
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}