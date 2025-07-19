/**
 * Enhanced PCP Assessment Tool Page
 * Comprehensive 4-dimensional assessment system with real-time transparent points calculation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Users,
  ArrowLeft,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { useLocation } from 'wouter';
import { CoachAssessmentCapture } from '@/components/coach-match-integration/CoachAssessmentCapture';

interface PcpAssessment {
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  overallImprovement: number;
  sessionNotes: string;
  keyObservations: string[];
  recommendedFocus: string[];
}

interface TransparentPointsData {
  basePoints: number;
  coachingMultiplier: number;
  improvementBonus: number;
  technicalContribution: number;
  tacticalContribution: number;
  physicalContribution: number;
  mentalContribution: number;
  totalPoints: number;
  calculationDetails: string[];
}

export default function CoachAssessmentToolPage() {
  const [, setLocation] = useLocation();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('select-student');
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [transparentPoints, setTransparentPoints] = useState<TransparentPointsData | null>(null);

  // Get student ID from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const studentIdFromUrl = urlParams.get('student');

  // Fetch coach's students
  const { data: students } = useQuery({
    queryKey: ['/api/coach/students'],
    staleTime: 30000,
  });

  // Mock students data with more comprehensive details
  const mockStudents = [
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      level: '3.5',
      lastAssessment: '2025-07-10',
      totalSessions: 12,
      currentRating: 72
    },
    { 
      id: 2, 
      name: 'Mike Chen', 
      level: '4.0',
      lastAssessment: '2025-07-12',
      totalSessions: 18,
      currentRating: 78
    },
    { 
      id: 3, 
      name: 'Emma Wilson', 
      level: '3.0',
      lastAssessment: '2025-07-08',
      totalSessions: 8,
      currentRating: 65
    },
    { 
      id: 4, 
      name: 'David Rodriguez', 
      level: '3.5',
      lastAssessment: '2025-07-15',
      totalSessions: 15,
      currentRating: 69
    },
    { 
      id: 5, 
      name: 'Lisa Park', 
      level: '4.0',
      lastAssessment: '2025-07-14',
      totalSessions: 22,
      currentRating: 81
    }
  ];

  const availableStudents = students || mockStudents;

  // Handle assessment completion
  const handleAssessmentComplete = (assessment: PcpAssessment) => {
    console.log('Assessment completed:', assessment);
    setAssessmentComplete(true);
    setActiveTab('results');
  };

  // Handle points generation
  const handlePointsGenerated = (points: TransparentPointsData) => {
    setTransparentPoints(points);
  };

  // Get selected student details
  const selectedStudentDetails = availableStudents.find(s => s.id === selectedStudent);

  // Set student from URL if provided
  React.useEffect(() => {
    if (studentIdFromUrl && !selectedStudent) {
      setSelectedStudent(parseInt(studentIdFromUrl));
      setActiveTab('assessment');
    }
  }, [studentIdFromUrl, selectedStudent]);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation('/coach/students')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced PCP Assessment Tool</h1>
          <p className="text-gray-600">Comprehensive 4-Dimensional Player Evaluation with Real-Time Transparent Points</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="select-student">
            <Users className="h-4 w-4 mr-2" />
            Select Student
          </TabsTrigger>
          <TabsTrigger value="assessment" disabled={!selectedStudent}>
            <Target className="h-4 w-4 mr-2" />
            PCP Assessment
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!assessmentComplete}>
            <Activity className="h-4 w-4 mr-2" />
            Results
          </TabsTrigger>
        </TabsList>

        {/* Student Selection Tab */}
        <TabsContent value="select-student">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Student to Assess
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableStudents.map((student: any) => (
                  <Card
                    key={student.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedStudent === student.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedStudent(student.id);
                      setActiveTab('assessment');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-lg">{student.name}</div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Level {student.level}</span>
                          <Badge variant="outline">Rating: {student.currentRating}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Last Assessment: {student.lastAssessment}</div>
                          <div>Total Sessions: {student.totalSessions}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment">
          {selectedStudent && selectedStudentDetails && (
            <div className="space-y-6">
              {/* Selected Student Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-bold text-primary">
                        {selectedStudentDetails.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedStudentDetails.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Level {selectedStudentDetails.level}</span>
                        <span>Current Rating: {selectedStudentDetails.currentRating}</span>
                        <span>Sessions: {selectedStudentDetails.totalSessions}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comprehensive Assessment Component */}
              <CoachAssessmentCapture
                playerId={selectedStudent}
                coachId={1} // This would come from auth context
                onAssessmentComplete={handleAssessmentComplete}
                onPointsGenerated={handlePointsGenerated}
              />
            </div>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {assessmentComplete && transparentPoints && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Assessment Complete - Transparent Points Generated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Final Transparent Points</div>
                      <div className="text-3xl font-bold text-green-600">
                        {transparentPoints.totalPoints.toFixed(1)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Coaching Multiplier</div>
                      <div className="text-2xl font-bold">
                        {transparentPoints.coachingMultiplier.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">Calculation Details</div>
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-1 font-mono">
                      {transparentPoints.calculationDetails.map((detail, index) => (
                        <div key={index}>{detail}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}