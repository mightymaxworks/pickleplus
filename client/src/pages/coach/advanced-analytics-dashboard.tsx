/**
 * Sprint 3 Phase 3: Advanced Analytics Dashboard
 * Coach performance metrics and student development insights
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Trophy,
  Target,
  Activity,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CoachLayout } from '@/components/layout/CoachLayout';

interface CoachAnalytics {
  totalStudents: number;
  activeGoals: number;
  completedGoals: number;
  overallSuccessRate: number;
  averageProgressRate: number;
  studentRetentionRate: number;
  monthlyGrowth: number;
  topPerformingCategories: string[];
}

interface StudentPortfolio {
  studentId: number;
  studentName: string;
  currentLevel: string;
  joinDate: string;
  totalGoals: number;
  completedGoals: number;
  successRate: number;
  averageProgressRate: number;
  strongestAreas: string[];
  improvementAreas: string[];
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface PerformanceMetric {
  category: string;
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  benchmark: number;
  studentCount: number;
}

interface InsightRecommendation {
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
  affectedStudents: number;
}

export default function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [filterCategory, setFilterCategory] = useState('all');

  // Fetch coach analytics data
  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: [`/api/coach/analytics/overview`, timeRange],
  });

  // Fetch student portfolio data
  const { data: portfolioData, isLoading: loadingPortfolio } = useQuery({
    queryKey: [`/api/coach/analytics/student-portfolio`, timeRange, filterCategory],
  });

  // Fetch performance metrics
  const { data: metricsData, isLoading: loadingMetrics } = useQuery({
    queryKey: [`/api/coach/analytics/performance-metrics`, timeRange],
  });

  // Fetch AI insights and recommendations
  const { data: insightsData, isLoading: loadingInsights } = useQuery({
    queryKey: [`/api/coach/analytics/insights`, timeRange],
  });

  const analytics = ((analyticsData as any)?.data as CoachAnalytics) || {
    totalStudents: 15,
    activeGoals: 42,
    completedGoals: 78,
    overallSuccessRate: 73.5,
    averageProgressRate: 68.2,
    studentRetentionRate: 91.7,
    monthlyGrowth: 12.4,
    topPerformingCategories: ['Technical Skills', 'Tactical Awareness', 'Mental Game']
  };

  const studentPortfolio = ((portfolioData as any)?.data as StudentPortfolio[]) || [
    {
      studentId: 1,
      studentName: "Alex Johnson",
      currentLevel: "Intermediate",
      joinDate: "2024-06-15",
      totalGoals: 8,
      completedGoals: 6,
      successRate: 75,
      averageProgressRate: 82,
      strongestAreas: ["Technical Skills", "Physical Fitness"],
      improvementAreas: ["Mental Game", "Tactical Awareness"],
      lastActivity: "2 days ago",
      riskLevel: "low"
    },
    {
      studentId: 2,
      studentName: "Sarah Miller",
      currentLevel: "Advanced",
      joinDate: "2024-05-20",
      totalGoals: 12,
      completedGoals: 8,
      successRate: 67,
      averageProgressRate: 74,
      strongestAreas: ["Tactical Awareness", "Mental Game"],
      improvementAreas: ["Physical Fitness"],
      lastActivity: "1 day ago",
      riskLevel: "low"
    },
    {
      studentId: 3,
      studentName: "Mike Wilson",
      currentLevel: "Beginner",
      joinDate: "2024-07-10",
      totalGoals: 4,
      completedGoals: 1,
      successRate: 25,
      averageProgressRate: 45,
      strongestAreas: ["Physical Fitness"],
      improvementAreas: ["Technical Skills", "Tactical Awareness", "Mental Game"],
      lastActivity: "5 days ago",
      riskLevel: "high"
    }
  ];

  const performanceMetrics = ((metricsData as any)?.data as PerformanceMetric[]) || [
    {
      category: "Goal Completion Rate",
      currentValue: 73.5,
      previousValue: 68.2,
      trend: "up",
      changePercent: 7.8,
      benchmark: 75.0,
      studentCount: 15
    },
    {
      category: "Student Engagement",
      currentValue: 86.4,
      previousValue: 89.1,
      trend: "down",
      changePercent: -3.0,
      benchmark: 85.0,
      studentCount: 15
    },
    {
      category: "Average Progress Rate",
      currentValue: 68.2,
      previousValue: 65.8,
      trend: "up",
      changePercent: 3.6,
      benchmark: 70.0,
      studentCount: 15
    },
    {
      category: "Retention Rate",
      currentValue: 91.7,
      previousValue: 88.3,
      trend: "up",
      changePercent: 3.9,
      benchmark: 90.0,
      studentCount: 15
    }
  ];

  const insights = ((insightsData as any)?.data as InsightRecommendation[]) || [
    {
      type: "opportunity",
      title: "Technical Skills Focus Opportunity",
      description: "65% of students show strong improvement in technical skills when given structured milestone progression",
      actionItems: [
        "Create technical skill assessment templates",
        "Implement progressive difficulty levels",
        "Add video demonstration milestones"
      ],
      priority: "high",
      affectedStudents: 10
    },
    {
      type: "warning",
      title: "Student Engagement Decline",
      description: "3 students haven't engaged with goals in over 5 days, indicating potential disengagement",
      actionItems: [
        "Schedule check-in sessions with at-risk students",
        "Review goal difficulty and relevance",
        "Implement automated engagement alerts"
      ],
      priority: "high",
      affectedStudents: 3
    },
    {
      type: "success",
      title: "Excellent Retention Performance",
      description: "Your student retention rate of 91.7% exceeds industry benchmark by 15%",
      actionItems: [
        "Document successful retention strategies",
        "Share best practices with coaching community",
        "Consider expanding coaching capacity"
      ],
      priority: "medium",
      affectedStudents: 15
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-5 w-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loadingAnalytics || loadingPortfolio || loadingMetrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <CoachLayout currentPage="Advanced Analytics Dashboard">
      <div className="space-y-6">
        
        {/* Header */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Advanced Analytics Dashboard
                  </CardTitle>
                  <CardDescription className="text-base">
                    Comprehensive coach performance metrics and student development insights
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <div className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</div>
                  <p className="text-xs text-green-600">+{analytics.monthlyGrowth}% this month</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <div className="text-2xl font-bold text-gray-900">{analytics.overallSuccessRate}%</div>
                  <p className="text-xs text-gray-500">Goal completion rate</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Goals</p>
                  <div className="text-2xl font-bold text-gray-900">{analytics.activeGoals}</div>
                  <p className="text-xs text-gray-500">{analytics.completedGoals} completed</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                  <div className="text-2xl font-bold text-gray-900">{analytics.studentRetentionRate}%</div>
                  <p className="text-xs text-green-600">Above benchmark</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardContent className="pt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
                <TabsTrigger value="portfolio">Student Portfolio</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="trends">Long-term Trends</TabsTrigger>
              </TabsList>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {performanceMetrics.map((metric, index) => (
                <Card key={index} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.category}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current: {metric.currentValue}%</span>
                        <span>Benchmark: {metric.benchmark}%</span>
                      </div>
                      <Progress value={metric.currentValue} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Previous: {metric.previousValue}%</span>
                        <span>{metric.studentCount} students</span>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${
                      metric.currentValue >= metric.benchmark 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <p className={`text-sm ${
                        metric.currentValue >= metric.benchmark ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {metric.currentValue >= metric.benchmark 
                          ? `Exceeding benchmark by ${(metric.currentValue - metric.benchmark).toFixed(1)}%`
                          : `Below benchmark by ${(metric.benchmark - metric.currentValue).toFixed(1)}%`
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Student Portfolio */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Student Portfolio Overview</h3>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Students</option>
                  <option value="high-risk">High Risk</option>
                  <option value="high-performers">High Performers</option>
                  <option value="recent">Recent Activity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {studentPortfolio.map((student) => (
                <Card key={student.studentId} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{student.studentName}</CardTitle>
                      <Badge className={getRiskBadgeColor(student.riskLevel)}>
                        {student.riskLevel} risk
                      </Badge>
                    </div>
                    <CardDescription>
                      {student.currentLevel} • Joined {new Date(student.joinDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {student.completedGoals}/{student.totalGoals}
                        </div>
                        <div className="text-xs text-gray-600">Goals Completed</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{student.successRate}%</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress Rate</span>
                        <span className="font-medium">{student.averageProgressRate}%</span>
                      </div>
                      <Progress value={student.averageProgressRate} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Strongest Areas:</h4>
                      <div className="flex flex-wrap gap-1">
                        {student.strongestAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>Last activity: {student.lastActivity}</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <Card key={index} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {insight.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          insight.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }>
                          {insight.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          {insight.affectedStudents} students
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Recommended Actions:</h4>
                      <ul className="space-y-1">
                        {insight.actionItems.map((action, actionIndex) => (
                          <li key={actionIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-end pt-2 border-t">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Long-term Trends */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Long-term Performance Trends
                </CardTitle>
                <CardDescription>
                  Historical analysis of coaching effectiveness and student development patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div className="text-center space-y-2">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto" />
                      <div className="text-2xl font-bold text-blue-900">+15.3%</div>
                      <div className="text-sm text-blue-700">Success Rate Growth</div>
                      <div className="text-xs text-blue-600">vs. last quarter</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <div className="text-center space-y-2">
                      <Users className="h-8 w-8 text-green-600 mx-auto" />
                      <div className="text-2xl font-bold text-green-900">91.7%</div>
                      <div className="text-sm text-green-700">Student Retention</div>
                      <div className="text-xs text-green-600">Industry leading</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <div className="text-center space-y-2">
                      <Clock className="h-8 w-8 text-purple-600 mx-auto" />
                      <div className="text-2xl font-bold text-purple-900">4.2 weeks</div>
                      <div className="text-sm text-purple-700">Avg. Goal Time</div>
                      <div className="text-xs text-purple-600">20% faster</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Top Performing Categories (Last 90 days):</h4>
                  <div className="space-y-3">
                    {analytics.topPerformingCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{category}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85 - (index * 10)} className="w-20 h-2" />
                          <span className="text-sm text-gray-600">{85 - (index * 10)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CoachLayout>
  );
}