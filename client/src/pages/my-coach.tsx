import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Award, Star, Calendar, MessageCircle, TrendingUp, Target, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CoachingSession {
  id: number;
  date: string;
  type: string;
  duration: number;
  notes: string;
  rating?: number;
}

interface Assessment {
  id: number;
  date: string;
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  overall: number;
  notes: string;
}

interface Coach {
  id: number;
  name: string;
  bio: string;
  profileImageUrl: string | null;
  specialties: string[];
  experienceYears: number;
  rating: number;
}

export default function MyCoachPage() {
  const { data: coachingData, isLoading } = useQuery({
    queryKey: ['/api/coaching/my-coach'],
    queryFn: () => apiRequest('GET', '/api/coaching/my-coach').then(res => res.json())
  });

  const { data: sessions } = useQuery({
    queryKey: ['/api/coaching/sessions'],
    queryFn: () => apiRequest('GET', '/api/coaching/sessions').then(res => res.json())
  });

  const { data: assessments } = useQuery({
    queryKey: ['/api/coaching/assessments'],
    queryFn: () => apiRequest('GET', '/api/coaching/assessments').then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="lg:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!coachingData?.coach) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                No Coach Assigned
              </h2>
              <p className="text-gray-500 mb-6">
                You haven't connected with a coach yet. Find a PCP Coaching Certification Programme certified coach to start your development journey.
              </p>
              <Button size="lg">
                <Users className="h-5 w-5 mr-2" />
                Find a Coach
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const coach: Coach = coachingData.coach;
  const recentSessions: CoachingSession[] = sessions?.slice(0, 3) || [];
  const latestAssessment: Assessment = assessments?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">My Coach Dashboard</h1>
          <p className="text-xl text-gray-600">
            Track your progress and connect with your coach
          </p>
        </div>

        {/* Coach Info & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coach Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={coach.profileImageUrl || ""} />
                  <AvatarFallback>{coach.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{coach.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{coach.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{coach.experienceYears} years experience</p>
                </div>
              </div>

              <p className="text-gray-600 text-sm">{coach.bio}</p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Specialties:</h4>
                <div className="flex flex-wrap gap-1">
                  {coach.specialties.map(specialty => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Coach
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestAssessment ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {latestAssessment.overall.toFixed(1)}
                    </div>
                    <p className="text-gray-600">Overall PCP Rating</p>
                    <p className="text-sm text-gray-500">Last assessed: {new Date(latestAssessment.date).toLocaleDateString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Technical (40%)</span>
                        <span className="font-medium">{latestAssessment.technical.toFixed(1)}</span>
                      </div>
                      <Progress value={latestAssessment.technical * 10} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tactical (25%)</span>
                        <span className="font-medium">{latestAssessment.tactical.toFixed(1)}</span>
                      </div>
                      <Progress value={latestAssessment.tactical * 10} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Physical (20%)</span>
                        <span className="font-medium">{latestAssessment.physical.toFixed(1)}</span>
                      </div>
                      <Progress value={latestAssessment.physical * 10} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mental (15%)</span>
                        <span className="font-medium">{latestAssessment.mental.toFixed(1)}</span>
                      </div>
                      <Progress value={latestAssessment.mental * 10} className="h-2" />
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Request New Assessment
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Assessment Yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Request your first PCP assessment to establish your baseline
                  </p>
                  <Button>
                    <Target className="h-4 w-4 mr-2" />
                    Request Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
            <TabsTrigger value="assessments">Assessment History</TabsTrigger>
            <TabsTrigger value="goals">Training Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Coaching Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSessions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSessions.map((session: CoachingSession) => (
                      <div key={session.id} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{session.type}</h4>
                            <Badge variant="outline" className="text-xs">
                              {session.duration} min
                            </Badge>
                            {session.rating && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {session.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{session.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No sessions recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  PCP Assessment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessments && assessments.length > 0 ? (
                  <div className="space-y-6">
                    {assessments.map((assessment: Assessment, index: number) => (
                      <div key={assessment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">
                            Assessment #{assessments.length - index}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(assessment.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {assessment.technical.toFixed(1)}
                            </div>
                            <p className="text-xs text-gray-600">Technical</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {assessment.tactical.toFixed(1)}
                            </div>
                            <p className="text-xs text-gray-600">Tactical</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {assessment.physical.toFixed(1)}
                            </div>
                            <p className="text-xs text-gray-600">Physical</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {assessment.mental.toFixed(1)}
                            </div>
                            <p className="text-xs text-gray-600">Mental</p>
                          </div>
                        </div>
                        
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-gray-900">
                            {assessment.overall.toFixed(1)}
                          </div>
                          <p className="text-sm text-gray-600">Overall PCP Rating</p>
                        </div>
                        
                        {assessment.notes && (
                          <div className="border-t pt-4">
                            <p className="text-sm text-gray-600">{assessment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No assessments completed yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Training Goals & Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Goals Coming Soon
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Work with your coach to set personalized training goals
                  </p>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Discuss Goals with Coach
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