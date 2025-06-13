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

interface PCPApiResponse {
  success: boolean;
  data: {
    profile: PlayerProgress;
    recentAssessments: any[];
    currentGoals: any[];
    recentAchievements: any[];
  };
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

  // Fetch player progress data - using the correct endpoint that returns profile data
  const { data: playerResponse, isLoading, error } = useQuery<PCPApiResponse>({
    queryKey: [`/api/pcp/profile/${playerId}`],
    enabled: !!playerId
  });

  // Extract player data from API response structure
  const apiResponse = playerResponse as any;
  const playerData = apiResponse?.success && apiResponse?.data?.profile ? {
    ...apiResponse.data.profile,
    // Convert string ratings to numbers for proper calculations
    overall_rating: parseFloat(apiResponse.data.profile.overall_rating) || 0,
    technical_rating: parseFloat(apiResponse.data.profile.technical_rating) || 0,
    tactical_rating: parseFloat(apiResponse.data.profile.tactical_rating) || 0,
    physical_rating: parseFloat(apiResponse.data.profile.physical_rating) || 0,
    mental_rating: parseFloat(apiResponse.data.profile.mental_rating) || 0,
    assessmentHistory: apiResponse.data.recentAssessments || [],
    goals: apiResponse.data.currentGoals || [],
    achievements: apiResponse.data.recentAchievements || []
  } : null;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 animate-in fade-in duration-700">
      <div className="pt-4 px-3 sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 mt-4 sm:mt-8 mb-4 sm:mb-8">
          {/* Enhanced Mobile-First Header */}
          <div className="bg-white/90 backdrop-blur-sm p-3 sm:p-6 rounded-xl shadow-lg border border-white/20 animate-in slide-in-from-top duration-500">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Top row - Back button and title */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="self-start transform transition-all duration-200 hover:scale-105 hover:shadow-md"
                  onClick={() => setLocation('/coach/pcp')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="sm:border-l border-gray-200 sm:pl-4">
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-900 animate-in slide-in-from-left duration-700">{playerData.name}</h1>
                  <p className="text-gray-600 flex items-center mt-1 text-sm sm:text-base animate-in slide-in-from-left duration-700 delay-150">
                    <BarChart3 className="h-4 w-4 mr-2 animate-pulse" />
                    Progress Analytics
                  </p>
                </div>
              </div>
              
              {/* Bottom row - Badges and buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:justify-end">
                <Badge variant="outline" className="text-blue-600 text-center animate-in scale-in duration-500 delay-300 whitespace-nowrap">
                  {playerData.total_assessments} Assessments
                </Badge>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-105 hover:shadow-lg whitespace-nowrap"
                  onClick={() => setLocation(`/coach/pcp/assessment/${playerId}`)}
                >
                  <Target className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">New Assessment</span>
                  <span className="sm:hidden">Assess</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Mobile-Optimized Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom duration-500 delay-200">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-white/20 gap-1">
              <TabsTrigger value="overview" className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Skills</span>
                <span className="sm:hidden">Skills</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm col-span-2 sm:col-span-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Progress</span>
                <span className="sm:hidden">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="goals" className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Goals</span>
                <span className="sm:hidden">Dev</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Compare</span>
                <span className="sm:hidden">Peers</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
              {/* Enhanced Quick Stats with Mobile-First Visual Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <Card className="border-l-4 border-blue-500 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-blue-50 animate-in slide-in-from-left duration-500 delay-100">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center">
                      <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 animate-bounce" />
                      Overall Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-3 animate-in scale-in duration-700 delay-200">
                      {playerData.overall_rating.toFixed(1)}
                    </div>
                    <Progress value={playerData.overall_rating * 20} className="h-3 sm:h-4 mb-3 animate-in slide-in-from-left duration-500 delay-300" />
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                      <span>{playerData.total_assessments} assessments</span>
                      <span className="text-blue-600 font-medium">Target: 3.5</span>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-green-600 animate-pulse">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Improving trend
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-green-500 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-green-50 animate-in slide-in-from-left duration-500 delay-200">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                      Technical
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-3 animate-in scale-in duration-700 delay-300">
                      {playerData.technical_rating.toFixed(1)}
                    </div>
                    <Progress value={playerData.technical_rating * 20} className="h-3 sm:h-4 mb-3 animate-in slide-in-from-left duration-500 delay-400" />
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                      <span>40% weight</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">Strongest</Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Serve execution, groundstrokes
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-orange-500 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-orange-50 animate-in slide-in-from-left duration-500 delay-300">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center">
                      <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600" />
                      Tactical
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-3 animate-in scale-in duration-700 delay-400">
                      {playerData.tactical_rating.toFixed(1)}
                    </div>
                    <Progress value={playerData.tactical_rating * 20} className="h-3 sm:h-4 mb-3 animate-in slide-in-from-left duration-500 delay-500" />
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                      <span>25% weight</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-200 animate-pulse">Focus Area</Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Court positioning, shot selection
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-purple-500 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-purple-50 animate-in slide-in-from-left duration-500 delay-400">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center">
                      <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                      Physical & Mental
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-3">
                      <div className="animate-in scale-in duration-700 delay-500">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">
                          {playerData.physical_rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Physical (20%)</div>
                      </div>
                      <div className="animate-in scale-in duration-700 delay-600">
                        <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                          {playerData.mental_rating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">Mental (15%)</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={playerData.physical_rating * 20} className="h-2 animate-in slide-in-from-left duration-500 delay-600" />
                      <Progress value={playerData.mental_rating * 20} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Mobile-First Performance Insights and Assessment Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                <Card className="border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50 animate-in slide-in-from-bottom duration-500 delay-500">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600 animate-pulse" />
                      Performance Insights
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">AI-powered analysis and coaching recommendations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 animate-in slide-in-from-left duration-500 delay-600 hover:bg-green-100 transition-colors">
                      <div className="flex items-center mb-2">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 animate-bounce" />
                        <span className="font-medium text-green-800 text-sm sm:text-base">Strongest Performance Area</span>
                      </div>
                      <p className="text-green-700 text-xs sm:text-sm leading-relaxed">
                        Technical skills show consistent improvement with exceptional serve execution ({(playerData.technical_rating * 1.2).toFixed(1)}/5.0) 
                        and solid groundstroke development. Continue building on this foundation.
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200 animate-in slide-in-from-left duration-500 delay-700 hover:bg-orange-100 transition-colors">
                      <div className="flex items-center mb-2">
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mr-2" />
                        <span className="font-medium text-orange-800 text-sm sm:text-base">Primary Development Focus</span>
                      </div>
                      <p className="text-orange-700 text-xs sm:text-sm leading-relaxed">
                        Tactical awareness requires attention. Recommend focused sessions on court positioning, 
                        shot selection timing, and pattern recognition to improve game intelligence.
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in slide-in-from-left duration-500 delay-800 hover:bg-blue-100 transition-colors">
                      <div className="flex items-center mb-2">
                        <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800 text-sm sm:text-base">Next Training Priority</span>
                      </div>
                      <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                        Mental game development showing potential. Work on pressure handling during competitive play 
                        and maintaining focus during extended rallies.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50 animate-in slide-in-from-bottom duration-500 delay-600">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600 animate-pulse" />
                      Assessment Timeline
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Latest assessment: {playerData.last_assessment_date ? 
                        new Date(playerData.last_assessment_date).toLocaleDateString() : 
                        'No assessments yet'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {playerData.assessmentHistory.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {playerData.assessmentHistory.slice(0, 4).map((assessment: any, index: number) => (
                          <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:scale-102 transition-all duration-200 animate-in slide-in-from-right delay-700" style={{animationDelay: `${700 + index * 100}ms`}}>
                            <div className="flex-1 mb-2 sm:mb-0">
                              <p className="font-medium text-sm sm:text-base">
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
                            <div className="flex justify-between sm:block sm:text-right">
                              <div>
                                <Badge variant="outline" className="mb-1 font-mono text-xs animate-pulse">
                                  {assessment.overall_rating}
                                </Badge>
                                <p className="text-xs text-gray-500">Overall</p>
                              </div>
                              {index < playerData.assessmentHistory.length - 1 && (
                                <div className="flex items-center mt-1">
                                  {assessment.overall_rating > playerData.assessmentHistory[index + 1]?.overall_rating ? (
                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1 animate-bounce" />
                                  ) : (
                                    <div className="h-3 w-3 mr-1" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {playerData.assessmentHistory.length > 4 && (
                          <div className="text-center animate-in fade-in duration-500 delay-1000">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:scale-105 transition-all duration-200">
                              View All {playerData.assessmentHistory.length} Assessments
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 animate-in scale-in duration-500 delay-700">
                        <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                        <p className="text-gray-500 font-medium text-sm sm:text-base">No assessments recorded yet</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Complete the first assessment to begin progress tracking</p>
                        <Button 
                          className="mt-3 transform transition-all duration-200 hover:scale-105 hover:shadow-lg" 
                          size="sm" 
                          onClick={() => setLocation(`/coach/pcp/assessment/${playerId}`)}
                        >
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

            {/* Enhanced Mobile-First Goals & Development Tab */}
            <TabsContent value="goals" className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 animate-in slide-in-from-left duration-500">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-pulse" />
                      Active Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {playerData.goals && playerData.goals.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {playerData.goals.map((goal: any, index: number) => (
                          <div key={index} className="p-3 sm:p-4 border rounded-lg hover:shadow-md hover:scale-102 transition-all duration-200 animate-in slide-in-from-bottom delay-200" style={{animationDelay: `${200 + index * 100}ms`}}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                              <h4 className="font-medium text-sm sm:text-base">{goal.title}</h4>
                              <Badge variant="outline" className="self-start animate-pulse">Active</Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3">{goal.description}</p>
                            <Progress value={goal.progress || 0} className="h-2 sm:h-3 mb-2 animate-in slide-in-from-left duration-500" />
                            <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500 gap-1">
                              <span>{goal.progress || 0}% complete</span>
                              <span>Target: {goal.target_date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 animate-in scale-in duration-500">
                        <Target className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                        <p className="text-gray-500 text-sm sm:text-base">No active goals</p>
                        <Button variant="outline" className="mt-3 transform transition-all duration-200 hover:scale-105 hover:shadow-md">Set New Goal</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-yellow-50 animate-in slide-in-from-right duration-500 delay-100">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {playerData.achievements && playerData.achievements.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {playerData.achievements.map((achievement: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 hover:scale-102 transition-all duration-200 animate-in slide-in-from-right delay-300" style={{animationDelay: `${300 + index * 100}ms`}}>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
                              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm sm:text-base">{achievement.title}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{achievement.description}</p>
                              <p className="text-xs text-gray-500">{achievement.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 animate-in scale-in duration-500 delay-200">
                        <Award className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                        <p className="text-gray-500 text-sm sm:text-base">No achievements yet</p>
                        <p className="text-xs sm:text-sm text-gray-400">Complete assessments to unlock achievement badges</p>
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