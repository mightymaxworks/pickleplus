import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Brain, Zap, Heart, Users, TrendingUp, Award, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

export default function PCPDashboard() {
  // Mock data for demonstration - in production this would come from API
  const playerProfiles = [
    {
      id: 1,
      name: "Player 1",
      overallRating: 2.3,
      technicalRating: 2.5,
      tacticalRating: 2.0,
      physicalRating: 2.8,
      mentalRating: 2.1,
      totalAssessments: 3,
      lastAssessment: "2025-06-10"
    },
    {
      id: 2,
      name: "Player 2", 
      overallRating: 2.8,
      technicalRating: 2.9,
      tacticalRating: 2.5,
      physicalRating: 3.0,
      mentalRating: 2.6,
      totalAssessments: 5,
      lastAssessment: "2025-06-08"
    },
    {
      id: 3,
      name: "Player 3",
      overallRating: 3.2,
      technicalRating: 3.1,
      tacticalRating: 3.0,
      physicalRating: 3.5,
      mentalRating: 3.2,
      totalAssessments: 8,
      lastAssessment: "2025-06-05"
    }
  ];

  const getDimensionColor = (dimension: string) => {
    switch (dimension) {
      case 'technical': return 'text-blue-600';
      case 'tactical': return 'text-green-600';
      case 'physical': return 'text-orange-600';
      case 'mental': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'technical': return <Target className="h-4 w-4" />;
      case 'tactical': return <Brain className="h-4 w-4" />;
      case 'physical': return <Zap className="h-4 w-4" />;
      case 'mental': return <Heart className="h-4 w-4" />;
      default: return null;
    }
  };

  const getRatingLabel = (rating: number): string => {
    if (rating < 1.5) return "Beginner";
    if (rating < 2.5) return "Learning";
    if (rating < 3.5) return "Developing";
    if (rating < 4.5) return "Competent";
    return "Advanced";
  };

  const getRatingColor = (rating: number): string => {
    if (rating < 2.0) return "bg-red-100 text-red-800";
    if (rating < 3.0) return "bg-yellow-100 text-yellow-800";
    if (rating < 4.0) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">PCP Coaching Dashboard</h1>
        </div>
        <Link href="/coach/pcp-assessment">
          <Button className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerProfiles.length}</div>
            <p className="text-xs text-muted-foreground">Currently coaching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(playerProfiles.reduce((sum, p) => sum + p.overallRating, 0) / playerProfiles.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playerProfiles.reduce((sum, p) => sum + p.totalAssessments, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">Avg progress this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Profiles */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Student Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          <TabsTrigger value="drills">Drill Library</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {playerProfiles.map((player) => (
              <Card key={player.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <Badge className={getRatingColor(player.overallRating)}>
                      {getRatingLabel(player.overallRating)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{player.overallRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">Overall PCP Rating</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dimensional Ratings */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'technical', label: 'Technical', value: player.technicalRating },
                      { key: 'tactical', label: 'Tactical', value: player.tacticalRating },
                      { key: 'physical', label: 'Physical', value: player.physicalRating },
                      { key: 'mental', label: 'Mental', value: player.mentalRating }
                    ].map(({ key, label, value }) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={getDimensionColor(key)}>
                          {getDimensionIcon(key)}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground">{label}</div>
                          <div className="font-semibold">{value.toFixed(1)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Assessment Info */}
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Assessments: {player.totalAssessments}</span>
                      <span>Last: {player.lastAssessment}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/coach/pcp-assessment?player=${player.id}`}>
                      <Button size="sm" className="flex-1">
                        Assess
                      </Button>
                    </Link>
                    <Link href={`/coach/player/${player.id}`}>
                      <Button size="sm" variant="outline" className="flex-1">
                        Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playerProfiles.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{player.name}</div>
                      <Badge variant="outline">{player.totalAssessments} assessments</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{player.overallRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Current Rating</div>
                      </div>
                      <div className="text-green-600 text-sm font-medium">+0.3 this month</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drills">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Drills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Serve Accuracy Challenge",
                    category: "Technical",
                    difficulty: 2,
                    duration: "15 min",
                    description: "Practice serving to specific targets to improve placement"
                  },
                  {
                    name: "Dinking Control Drill",
                    category: "Technical", 
                    difficulty: 3,
                    duration: "20 min",
                    description: "Develop soft touch and control at the net"
                  },
                  {
                    name: "Third Shot Drop Practice",
                    category: "Tactical",
                    difficulty: 4,
                    duration: "25 min",
                    description: "Master the most important shot in pickleball"
                  }
                ].map((drill, index) => (
                  <Card key={index} className="hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{drill.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          Level {drill.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{drill.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{drill.category}</span>
                        <span className="font-medium">{drill.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}