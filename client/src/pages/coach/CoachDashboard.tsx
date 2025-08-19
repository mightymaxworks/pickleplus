import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  BookOpen, 
  Star, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  User,
  Award,
  Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CoachingAssessmentValidator } from '@/components/coaching/CoachingAssessmentValidator';

interface CurrentUser {
  id: number;
  username: string;
  displayName?: string;
  coachLevel?: number;
}

interface AssignedStudent {
  id: number;
  displayName: string;
  currentRanking: number | null;
  lastAssessment: string | null;
}

interface RecentAssessment {
  id: number;
  studentName: string;
  overallRating: number;
  assessmentType: string;
  createdAt: string;
}

/**
 * Coach Dashboard - Real User Interface Integration
 * 
 * This replaces the demo page with actual coach workflow integration:
 * - View assigned students
 * - Access assessment tools with security validation
 * - Track coaching progress and sessions
 * - Direct integration with the 35-skill assessment system
 */
export default function CoachDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // Fetch coach's current user data
  const { data: currentUser } = useQuery<CurrentUser>({
    queryKey: ['/api/auth/current-user'],
    refetchInterval: 30000
  });

  // Fetch coach's assigned students
  const { data: assignedStudents = [] } = useQuery<AssignedStudent[]>({
    queryKey: ['/api/coach/assigned-students'],
    enabled: !!currentUser?.id
  });

  // Fetch recent assessments
  const { data: recentAssessments = [] } = useQuery<RecentAssessment[]>({
    queryKey: ['/api/coach/recent-assessments'],
    enabled: !!currentUser?.id
  });

  const getCoachLevelInfo = (level: number) => {
    const info = {
      1: { name: "L1 Coach", desc: "Basic Skills", color: "bg-green-500", focus: "Fundamentals, beginner instruction" },
      2: { name: "L2 Coach", desc: "Intermediate", color: "bg-blue-500", focus: "Strategy development, technique refinement" },
      3: { name: "L3 Coach", desc: "Advanced", color: "bg-purple-500", focus: "Competitive training, advanced tactics" },
      4: { name: "L4 Coach", desc: "Elite", color: "bg-orange-500", focus: "Tournament preparation, elite performance" },
      5: { name: "L5 Coach", desc: "Master", color: "bg-red-500", focus: "Certification, mentor training, system mastery" }
    };
    return info[level as keyof typeof info] || { name: `L${level}`, desc: "Coach", color: "bg-gray-500", focus: "Coaching" };
  };

  const coachLevel = currentUser?.coachLevel || 0;
  const coachInfo = getCoachLevelInfo(coachLevel);

  if (coachLevel === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <User className="w-4 h-4" />
          <AlertDescription>
            You are not currently assigned as a coach. Contact an admin to get coach credentials and student assignments.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Coach Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
          <div className="flex items-center gap-3">
            <Badge className={`${coachInfo.color} text-white`}>
              {coachInfo.name}
            </Badge>
            <span className="text-gray-600">{coachInfo.focus}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{assignedStudents.length} Active Students</span>
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">My Students</TabsTrigger>
          <TabsTrigger value="assessments">Recent Assessments</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Assigned Students ({assignedStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No students assigned yet.</p>
                  <p className="text-sm">Contact an admin to get student assignments.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedStudents.map((student) => (
                    <Card key={student.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{student.displayName}</h3>
                              <p className="text-sm text-gray-600">
                                {student.currentRanking ? `Ranking: ${student.currentRanking}` : 'Unranked'}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {student.lastAssessment ? 'Assessed' : 'New'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            onClick={() => setSelectedStudent(student.id)}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Conduct Assessment
                          </Button>
                          
                          {student.lastAssessment && (
                            <div className="text-xs text-gray-500 text-center">
                              Last assessed: {new Date(student.lastAssessment).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment Validation Section */}
          {selectedStudent && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Assessment Access Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CoachingAssessmentValidator 
                  coachId={currentUser?.id}
                  studentId={selectedStudent}
                  onValidationSuccess={(validationResult) => {
                    // Redirect to actual assessment page when validation passes
                    window.location.href = `/pcp-assessment/${selectedStudent}`;
                  }}
                />
                
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedStudent(null)}
                    className="w-full"
                  >
                    Cancel Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recent Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Recent Assessment Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAssessments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No assessments completed yet.</p>
                  <p className="text-sm">Start by assessing your assigned students above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAssessments.map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{assessment.studentName}</h3>
                          <p className="text-sm text-gray-600">
                            Overall Rating: {assessment.overallRating}/10
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </div>
                        <Badge variant="outline">
                          {assessment.assessmentType}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tracking Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Student Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Progress tracking coming soon.</p>
                <p className="text-sm">Complete more assessments to see student progress charts.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}