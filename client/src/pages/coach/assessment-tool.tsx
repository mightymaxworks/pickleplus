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
import { DetailedSkillAssessment } from '@/components/coach-match-integration/DetailedSkillAssessment';

interface DetailedSkills {
  // Technical Skills (22 micro-skills)
  serve_execution: number;
  return_technique: number;
  third_shot: number;
  overhead_defense: number;
  shot_creativity: number;
  court_movement: number;
  forehand_topspin: number;
  forehand_slice: number;
  backhand_topspin: number;
  backhand_slice: number;
  forehand_dead_dink: number;
  forehand_topspin_dink: number;
  forehand_slice_dink: number;
  backhand_dead_dink: number;
  backhand_topspin_dink: number;
  backhand_slice_dink: number;
  forehand_block_volley: number;
  forehand_drive_volley: number;
  forehand_dink_volley: number;
  backhand_block_volley: number;
  backhand_drive_volley: number;
  backhand_dink_volley: number;
  // Tactical Skills (5 skills)
  shot_selection: number;
  court_positioning: number;
  pattern_recognition: number;
  risk_management: number;
  communication: number;
  // Physical Skills (4 skills)
  footwork: number;
  balance_stability: number;
  reaction_time: number;
  endurance: number;
  // Mental Skills (4 skills)
  focus_concentration: number;
  pressure_performance: number;
  adaptability: number;
  sportsmanship: number;
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

  const [dimensionalScores, setDimensionalScores] = useState({ technical: 50, tactical: 50, physical: 50, mental: 50 });

  // Handle assessment completion
  const handleAssessmentComplete = (skills: DetailedSkills) => {
    console.log('Detailed skills assessment completed:', skills);
    
    // Calculate transparent points from dimensional scores
    const basePoints = 10;
    const technicalScore = (dimensionalScores.technical / 100) * 0.4;
    const tacticalScore = (dimensionalScores.tactical / 100) * 0.25;
    const physicalScore = (dimensionalScores.physical / 100) * 0.2;
    const mentalScore = (dimensionalScores.mental / 100) * 0.15;
    
    const overallScore = technicalScore + tacticalScore + physicalScore + mentalScore;
    const coachingMultiplier = 1.2; // Enhanced coaching session
    const improvementBonus = 2.0; // Detailed assessment bonus
    
    const totalPoints = (basePoints * overallScore * coachingMultiplier) + improvementBonus;
    
    const pointsData: TransparentPointsData = {
      basePoints,
      coachingMultiplier,
      improvementBonus,
      technicalContribution: basePoints * technicalScore,
      tacticalContribution: basePoints * tacticalScore,  
      physicalContribution: basePoints * physicalScore,
      mentalContribution: basePoints * mentalScore,
      totalPoints,
      calculationDetails: [
        `Base Points: ${basePoints}`,
        `Technical (40%): ${technicalScore.toFixed(2)} → ${(basePoints * technicalScore).toFixed(1)} points`,
        `Tactical (25%): ${tacticalScore.toFixed(2)} → ${(basePoints * tacticalScore).toFixed(1)} points`,
        `Physical (20%): ${physicalScore.toFixed(2)} → ${(basePoints * physicalScore).toFixed(1)} points`,
        `Mental (15%): ${mentalScore.toFixed(2)} → ${(basePoints * mentalScore).toFixed(1)} points`,
        `Coaching Multiplier: ${coachingMultiplier}x`,
        `Detailed Assessment Bonus: +${improvementBonus} points`,
        `Total: ${totalPoints.toFixed(1)} points`
      ]
    };
    
    setTransparentPoints(pointsData);
    setAssessmentComplete(true);
    setActiveTab('results');
  };

  // Handle dimensional scores update
  const handleDimensionalScores = (scores: { technical: number; tactical: number; physical: number; mental: number }) => {
    setDimensionalScores(scores);
  };

  // Ensure availableStudents is an array and get selected student details
  const studentsArray = Array.isArray(availableStudents) ? availableStudents : [];
  const selectedStudentDetails = studentsArray.find((s: any) => s.id === selectedStudent);

  // Set student from URL if provided
  React.useEffect(() => {
    if (studentIdFromUrl && !selectedStudent) {
      setSelectedStudent(parseInt(studentIdFromUrl));
      setActiveTab('assessment');
    }
  }, [studentIdFromUrl, selectedStudent]);

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-4 pb-20 md:pb-4 space-y-4 md:space-y-6 mobile-overflow-safe coach-assessment-container">
      {/* Mobile-First Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation('/coach/students')}
          className="self-start"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground truncate">PCP Assessment Tool</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 line-clamp-2">
            55 detailed skills • Real-time transparent points • PCP methodology
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto bg-muted/50 overflow-hidden">
          <TabsTrigger value="select-student" className="flex-col py-2 sm:py-3 px-1 sm:px-2 text-xs md:text-sm data-[state=active]:bg-background min-w-0">
            <Users className="h-3 sm:h-4 w-3 sm:w-4 mb-1 shrink-0" />
            <span className="hidden sm:inline truncate">Select Student</span>
            <span className="sm:hidden text-xs truncate">Select</span>
          </TabsTrigger>
          <TabsTrigger value="assessment" disabled={!selectedStudent} className="flex-col py-2 sm:py-3 px-1 sm:px-2 text-xs md:text-sm data-[state=active]:bg-background min-w-0">
            <Target className="h-3 sm:h-4 w-3 sm:w-4 mb-1 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Assessment</span>
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!assessmentComplete} className="flex-col py-2 sm:py-3 px-1 sm:px-2 text-xs md:text-sm data-[state=active]:bg-background min-w-0">
            <Activity className="h-3 sm:h-4 w-3 sm:w-4 mb-1 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Results</span>
          </TabsTrigger>
        </TabsList>

        {/* Mobile-Optimized Student Selection */}
        <TabsContent value="select-student">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                Select Student
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                {studentsArray.map((student: any) => (
                  <Card 
                    key={student.id} 
                    className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
                      selectedStudent === student.id 
                        ? 'ring-2 ring-primary bg-primary/5 border-primary/20' 
                        : 'border hover:border-primary/30'
                    }`}
                    onClick={() => {
                      setSelectedStudent(student.id);
                      setActiveTab('assessment');
                    }}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center shrink-0">
                          <span className="font-bold text-primary text-sm">
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm md:text-base truncate">{student.name}</div>
                          <div className="text-xs text-muted-foreground">Level {student.level}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            Rating: {student.currentRating}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {student.totalSessions} sessions
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {student.lastAssessment}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile-Optimized Assessment Tab */}
        <TabsContent value="assessment">
          {selectedStudent && selectedStudentDetails && (
            <div className="space-y-4 md:space-y-6">
              {/* Mobile-Optimized Student Info */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-bold text-primary text-sm">
                        {selectedStudentDetails.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base md:text-lg truncate">{selectedStudentDetails.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mt-1">
                        <Badge variant="secondary" className="text-xs">Level {selectedStudentDetails.level}</Badge>
                        <span>Rating: {selectedStudentDetails.currentRating}</span>
                        <span>{selectedStudentDetails.totalSessions} sessions</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Skill Assessment Component */}
              <DetailedSkillAssessment
                playerId={selectedStudent}
                coachId={1} // This would come from auth context
                onAssessmentComplete={handleAssessmentComplete}
                onDimensionalScores={handleDimensionalScores}
              />
            </div>
          )}
        </TabsContent>

        {/* Mobile-Optimized Results Tab */}
        <TabsContent value="results">
          {assessmentComplete && transparentPoints && (
            <div className="space-y-4 md:space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Zap className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                    </div>
                    Assessment Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    <div className="text-center md:text-left">
                      <div className="text-xs md:text-sm text-muted-foreground mb-2">Transparent Points</div>
                      <div className="text-2xl md:text-3xl font-bold text-green-600">
                        {transparentPoints.totalPoints.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-xs md:text-sm text-muted-foreground mb-2">Coaching Multiplier</div>
                      <div className="text-xl md:text-2xl font-bold text-primary">
                        {transparentPoints.coachingMultiplier.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-6">
                    <div className="text-xs md:text-sm font-medium text-foreground mb-3">Calculation Breakdown</div>
                    <div className="bg-background/50 border p-3 rounded-lg text-xs md:text-sm space-y-2">
                      {transparentPoints.calculationDetails.map((detail, index) => (
                        <div key={index} className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
                          <span className="font-medium">{detail}</span>
                        </div>
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