/**
 * PCP Coach Dashboard - Main Interface
 * Comprehensive coaching dashboard for the PCP Coaching Certification Programme
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  Star,
  Award,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface PlayerProfile {
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
}

interface CoachDashboardData {
  myPlayers: PlayerProfile[];
  recentAssessments: any[];
  upcomingSessions: any[];
  drillLibrary: any[];
  myStats: {
    totalPlayers: number;
    assessmentsThisMonth: number;
    averageImprovement: number;
    hoursCoached: number;
  };
}

export default function PCPCoachDashboard() {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);

  // Fetch coach dashboard data
  const { data: dashboardData, isLoading } = useQuery<CoachDashboardData>({
    queryKey: ['/api/pcp/coach/dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/pcp/coach/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json().then(result => result.data);
    }
  });

  // Fetch drill library
  const { data: drillsData } = useQuery({
    queryKey: ['/api/pcp/drills'],
    queryFn: async () => {
      const response = await fetch('/api/pcp/drills');
      if (!response.ok) throw new Error('Failed to fetch drills');
      return response.json().then(result => result.data);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const mockDashboardData: CoachDashboardData = {
    myPlayers: [
      {
        id: 1,
        name: "Alex Rodriguez",
        overall_rating: 6.8,
        technical_rating: 7.2,
        tactical_rating: 6.5,
        physical_rating: 6.9,
        mental_rating: 6.6,
        total_assessments: 8,
        last_assessment_date: "2025-06-10",
        current_focus_areas: ["Net play", "Mental pressure"]
      },
      {
        id: 2,
        name: "Sarah Chen",
        overall_rating: 5.4,
        technical_rating: 5.8,
        tactical_rating: 5.2,
        physical_rating: 5.6,
        mental_rating: 5.0,
        total_assessments: 5,
        last_assessment_date: "2025-06-08",
        current_focus_areas: ["Third shot drop", "Court positioning"]
      }
    ],
    recentAssessments: [],
    upcomingSessions: [],
    drillLibrary: drillsData || [],
    myStats: {
      totalPlayers: 12,
      assessmentsThisMonth: 24,
      averageImprovement: 18,
      hoursCoached: 156
    }
  };

  // Ensure data structure with safe defaults
  const data = {
    myPlayers: dashboardData?.myPlayers || mockDashboardData.myPlayers || [],
    recentAssessments: dashboardData?.recentAssessments || [],
    upcomingSessions: dashboardData?.upcomingSessions || [],
    drillLibrary: drillsData || [],
    myStats: dashboardData?.myStats || mockDashboardData.myStats
  };
  
  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PCP Coach Dashboard</h1>
            <p className="text-gray-600 mt-1">Professional Coaching Certification Programme</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Players</p>
                  <p className="text-2xl font-bold text-gray-900">{data.myStats.totalPlayers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assessments This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{data.myStats.assessmentsThisMonth}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Improvement</p>
                  <p className="text-2xl font-bold text-gray-900">{data.myStats.averageImprovement}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hours Coached</p>
                  <p className="text-2xl font-bold text-gray-900">{data.myStats.hoursCoached}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="players">My Players</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="drills">Drill Library</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(data.myPlayers || []).map((player) => (
                <Card key={player.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedPlayer(player)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      <Badge variant="secondary">
                        {parseFloat(player.overall_rating.toString()).toFixed(1)} Overall
                      </Badge>
                    </div>
                    <CardDescription>
                      {player.total_assessments} assessments • Last: {player.last_assessment_date || 'Never'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Technical</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={parseFloat(player.technical_rating.toString()) * 10} className="flex-1" />
                            <span className="text-sm font-medium">{parseFloat(player.technical_rating.toString()).toFixed(1)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tactical</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={parseFloat(player.tactical_rating.toString()) * 10} className="flex-1" />
                            <span className="text-sm font-medium">{parseFloat(player.tactical_rating.toString()).toFixed(1)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Physical</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={parseFloat(player.physical_rating.toString()) * 10} className="flex-1" />
                            <span className="text-sm font-medium">{parseFloat(player.physical_rating.toString()).toFixed(1)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Mental</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={parseFloat(player.mental_rating.toString()) * 10} className="flex-1" />
                            <span className="text-sm font-medium">{parseFloat(player.mental_rating.toString()).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {player.current_focus_areas && player.current_focus_areas.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Focus Areas:</p>
                          <div className="flex flex-wrap gap-1">
                            {player.current_focus_areas.map((area, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm">
                        View Progress
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        New Assessment
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <CardTitle>Recent Assessments</CardTitle>
                <CardDescription>
                  Track player progress through comprehensive 4-dimensional evaluations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent assessments</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                    Conduct Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drill Library Tab */}
          <TabsContent value="drills">
            <Card>
              <CardHeader>
                <CardTitle>PCP Drill Library</CardTitle>
                <CardDescription>
                  Curated drills for technical, tactical, physical, and mental development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(data.drillLibrary || []).map((drill, index) => (
                    <Card key={drill.id || index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{drill.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {drill.difficulty_level}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {drill.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {drill.skill_focus}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 mb-3">{drill.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{drill.duration_minutes} min</span>
                          <span>{drill.player_count} players</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Coaching Analytics</CardTitle>
                <CardDescription>
                  Track player development and coaching effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analytics dashboard coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Comprehensive performance metrics and progress tracking
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}