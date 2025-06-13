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
  Star
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

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

export default function PCPPlayerProgress() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const playerId = params.id;

  // Fetch player progress data
  const { data: playerData, isLoading } = useQuery<PlayerProgress>({
    queryKey: [`/api/pcp/profile/${playerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/pcp/profile/${playerId}`);
      if (!response.ok) throw new Error('Failed to fetch player progress');
      const result = await response.json();
      
      // Handle the nested structure from the API
      if (result.data && result.data.profile) {
        const profile = result.data.profile;
        return {
          id: profile.id,
          name: profile.name || `Player ${profile.player_id}`,
          overall_rating: parseFloat(profile.overall_rating) || 0,
          technical_rating: parseFloat(profile.technical_rating) || 0,
          tactical_rating: parseFloat(profile.tactical_rating) || 0,
          physical_rating: parseFloat(profile.physical_rating) || 0,
          mental_rating: parseFloat(profile.mental_rating) || 0,
          total_assessments: profile.total_assessments || 0,
          last_assessment_date: profile.last_assessment_date,
          current_focus_areas: profile.current_focus_areas || [],
          assessmentHistory: result.data.recentAssessments || [],
          goals: result.data.currentGoals || [],
          achievements: result.data.recentAchievements || []
        };
      }
      return result.data;
    },
    enabled: !!playerId
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/coach/pcp')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{playerData.name}</h1>
                <p className="text-gray-600">Player Progress Report</p>
              </div>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.open(`/coach/pcp-assessment?playerId=${playerId}`, '_blank')}
            >
              <Target className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>

          {/* Current Ratings Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Overall Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {playerData.overall_rating.toFixed(1)}
                </div>
                <Progress value={playerData.overall_rating * 10} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">{playerData.total_assessments} assessments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Technical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {playerData.technical_rating.toFixed(1)}
                </div>
                <Progress value={playerData.technical_rating * 10} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">40% weight</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tactical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {playerData.tactical_rating.toFixed(1)}
                </div>
                <Progress value={playerData.tactical_rating * 10} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">25% weight</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Physical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {playerData.physical_rating.toFixed(1)}
                </div>
                <Progress value={playerData.physical_rating * 10} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">20% weight</p>
              </CardContent>
            </Card>
          </div>

          {/* Mental Rating and Focus Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mental Rating</CardTitle>
                <CardDescription>Psychological aspects of performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600 mb-4">
                  {playerData.mental_rating.toFixed(1)}
                </div>
                <Progress value={playerData.mental_rating * 10} className="h-3" />
                <p className="text-sm text-gray-600 mt-2">15% weight in overall rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Focus Areas</CardTitle>
                <CardDescription>Areas requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                {playerData.current_focus_areas && playerData.current_focus_areas.length > 0 ? (
                  <div className="space-y-2">
                    {playerData.current_focus_areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {area}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No specific focus areas identified</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Assessment History and Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Assessment History
                </CardTitle>
                <CardDescription>Recent evaluation timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Assessment history visualization</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Last assessment: {playerData.last_assessment_date || 'Never'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Goals & Achievements
                </CardTitle>
                <CardDescription>Development milestones and targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Goal tracking system</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Coming soon: Personalized development goals
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Progress Analytics
              </CardTitle>
              <CardDescription>Performance trends and improvement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Advanced Analytics Dashboard</p>
                <p className="text-sm text-gray-500 mt-2">
                  Comprehensive progress tracking, skill development trends, and performance predictions
                </p>
                <Button className="mt-4" variant="outline">
                  Generate Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}