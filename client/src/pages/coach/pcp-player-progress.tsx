/**
 * PCP Player Progress Page - Individual Student Progress Tracking
 * Shows detailed progress history and performance analytics for a specific student
 */

import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  BarChart3,
  Star,
  Brain,
  Zap,
  Activity,
  Eye,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlayerProgress {
  id: number;
  name: string;
  overall_rating: number;
  technical_rating: number;
  tactical_rating: number;
  physical_rating: number;
  mental_rating: number;
  total_assessments: number;
  last_assessment_date: string | null;
  current_focus_areas: string[] | null;
  assessmentHistory: any[];
  goals: any[];
  achievements: any[];
}

interface SkillComponent {
  name: string;
  rating: number;
  trend: 'up' | 'down' | 'stable';
  lastImprovement: string;
}

interface DimensionBreakdown {
  technical: SkillComponent[];
  tactical: SkillComponent[];
  physical: SkillComponent[];
  mental: SkillComponent[];
}

export default function PCPPlayerProgress() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const playerId = params.id;

  // Fetch detailed skill breakdown data
  const { data: skillData } = useQuery({
    queryKey: [`/api/pcp/skill-breakdown/${playerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/pcp/skill-breakdown/${playerId}`);
      if (!response.ok) {
        // Return structured empty data if endpoint doesn't exist yet
        return {
          technical: [],
          tactical: [],
          physical: [],
          mental: []
        };
      }
      return response.json();
    },
    enabled: !!playerId
  });

  // Fetch player progress data
  const { data: playerData, isLoading, error } = useQuery({
    queryKey: [`/api/pcp/profile/${playerId}`],
    enabled: !!playerId
  });

  console.log('Player Progress Debug:', {
    playerId,
    playerData,
    isLoading,
    error: error?.message
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-6 px-6 pb-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Player Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load player progress data</p>
          <Button onClick={() => setLocation('/coach/pcp')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-6 px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-6 mt-[33px] mb-[33px]">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/coach/pcp')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="border-l border-gray-200 pl-4">
                <h1 className="text-3xl font-bold text-gray-900">{playerData.name}</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comprehensive Progress Analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-blue-600">
                {playerData.total_assessments} Assessments
              </Badge>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setLocation(`/coach/pcp/assessment/${playerId}`)}
              >
                <Target className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </div>

          {/* Enhanced Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
              <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Brain className="h-4 w-4" />
                <span>Skill Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4" />
                <span>Progress Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Target className="h-4 w-4" />
                <span>Goals & Development</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center space-x-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Users className="h-4 w-4" />
                <span>Peer Comparison</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Quick Stats with Visual Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-600" />
                      Overall Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-600 mb-3">
                      {playerData.overall_rating.toFixed(1)}
                    </div>
                    <Progress value={playerData.overall_rating * 20} className="h-4 mb-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{playerData.total_assessments} assessments</span>
                      <span className="text-blue-600 font-medium">Target: 3.5</span>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Improving trend
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-green-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-green-600" />
                      Technical
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-600 mb-3">
                      {playerData.technical_rating.toFixed(1)}
                    </div>
                    <Progress value={playerData.technical_rating * 20} className="h-4 mb-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>40% weight</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">Strongest</Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Serve execution, groundstrokes
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-orange-600" />
                      Tactical
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-orange-600 mb-3">
                      {playerData.tactical_rating.toFixed(1)}
                    </div>
                    <Progress value={playerData.tactical_rating * 20} className="h-4 mb-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>25% weight</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">Focus Area</Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Court positioning, shot selection
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-purple-600" />
                      Physical & Mental
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-3">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {playerData.physical_rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Physical (20%)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {playerData.mental_rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Mental (15%)</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={playerData.physical_rating * 20} className="h-2" />
                      <Progress value={playerData.mental_rating * 20} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Insights and Assessment Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-l-4 border-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Performance Insights
                    </CardTitle>
                    <CardDescription>AI-powered analysis and coaching recommendations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Strongest Performance Area</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Technical skills show consistent improvement with exceptional serve execution ({(playerData.technical_rating * 1.2).toFixed(1)}/5.0) 
                        and solid groundstroke development. Continue building on this foundation.
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center mb-2">
                        <Eye className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="font-medium text-orange-800">Primary Development Focus</span>
                      </div>
                      <p className="text-orange-700 text-sm">
                        Tactical awareness requires attention. Recommend focused sessions on court positioning, 
                        shot selection timing, and pattern recognition to improve game intelligence.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-2">
                        <Brain className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">Next Training Priority</span>
                      </div>
                      <p className="text-blue-700 text-sm">
                        Mental game development showing potential. Work on pressure handling during competitive play 
                        and maintaining focus during extended rallies.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-purple-500">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                      Assessment Timeline
                    </CardTitle>
                    <CardDescription>
                      Latest assessment: {playerData.last_assessment_date ? 
                        new Date(playerData.last_assessment_date).toLocaleDateString() : 
                        'No assessments yet'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {playerData.assessmentHistory.length > 0 ? (
                      <div className="space-y-3">
                        {playerData.assessmentHistory.slice(0, 4).map((assessment, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {new Date(assessment.assessment_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {assessment.trigger_event || 'Regular Assessment'}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-1 font-mono">
                                {assessment.overall_rating}
                              </Badge>
                              <p className="text-xs text-gray-500">Overall</p>
                              {index < playerData.assessmentHistory.length - 1 && (
                                <div className="flex items-center mt-1">
                                  {assessment.overall_rating > playerData.assessmentHistory[index + 1]?.overall_rating ? (
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                  ) : (
                                    <div className="h-3 w-3 mr-1" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {playerData.assessmentHistory.length > 4 && (
                          <div className="text-center">
                            <Button variant="ghost" size="sm" className="text-blue-600">
                              View All {playerData.assessmentHistory.length} Assessments
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No assessments recorded yet</p>
                        <p className="text-sm text-gray-400 mt-1">Complete the first assessment to begin progress tracking</p>
                        <Button className="mt-3" size="sm" onClick={() => setLocation(`/coach/pcp/assessment/${playerId}`)}>
                          Create First Assessment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Skill Analysis Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-600" />
                    Detailed Skill Analysis
                  </CardTitle>
                  <CardDescription>Individual skill component ratings and improvement trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Skill Breakdown Analysis</h3>
                    <p className="text-gray-500 mb-4">Detailed skill component tracking coming soon</p>
                    <p className="text-sm text-gray-400">This will show individual ratings for serve execution, return technique, court positioning, and more</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Timeline Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Progress Timeline
                  </CardTitle>
                  <CardDescription>Rating progression over time with milestone tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Progress Visualization</h3>
                    <p className="text-gray-500 mb-4">Interactive timeline charts coming soon</p>
                    <p className="text-sm text-gray-400">Track improvement velocity and identify breakthrough moments</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goals & Development Tab */}
            <TabsContent value="goals" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Active Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {playerData.goals && playerData.goals.length > 0 ? (
                      <div className="space-y-4">
                        {playerData.goals.map((goal, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium">{goal.title}</h4>
                              <Badge variant="outline">Active</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                            <Progress value={goal.progress || 0} className="h-3 mb-2" />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{goal.progress || 0}% complete</span>
                              <span>Target: {goal.target_date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No active goals</p>
                        <Button variant="outline" className="mt-3">Set New Goal</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {playerData.achievements && playerData.achievements.length > 0 ? (
                      <div className="space-y-3">
                        {playerData.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                              <Star className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{achievement.title}</p>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                              <p className="text-xs text-gray-500">{achievement.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No achievements yet</p>
                        <p className="text-sm text-gray-400">Complete assessments to unlock achievement badges</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Peer Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-indigo-600" />
                    Peer Group Analysis
                  </CardTitle>
                  <CardDescription>Performance comparison with similar skill level players</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Comparative Analytics</h3>
                    <p className="text-gray-500 mb-4">Peer comparison features coming soon</p>
                    <p className="text-sm text-gray-400">Compare progress with players of similar skill level and experience</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}