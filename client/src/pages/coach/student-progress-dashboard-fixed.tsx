import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Activity,
  MessageSquare,
  BarChart3
} from 'lucide-react';

// PKL-278651 Design System
const gradientBg = "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50";
const gradientText = "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent";
const glassCard = "bg-white/60 backdrop-blur-md border border-white/20 shadow-xl";

// Safe validation schema
const drillCompletionSchema = z.object({
  studentId: z.number().min(1),
  drillId: z.number().min(1).default(1),
  performanceRating: z.number().min(0).max(8).default(6.0),
  technicalRating: z.number().min(0).max(8).default(6.0),
  tacticalRating: z.number().min(0).max(8).default(6.0),
  physicalRating: z.number().min(0).max(8).default(6.0),
  mentalRating: z.number().min(0).max(8).default(6.0),
  coachNotes: z.string().optional(),
  improvementAreas: z.array(z.string()).default([])
});

type DrillCompletionForm = z.infer<typeof drillCompletionSchema>;

// Safe data types
interface SafeStudent {
  id: number;
  name: string;
  email: string;
  totalDrillsCompleted: number;
  avgPerformanceRating: number;
  improvementTrend: string;
}

interface SafeStudentProgress {
  studentId: number;
  studentName: string;
  totalDrillsCompleted: number;
  totalSessionMinutes: number;
  avgPerformanceRating: number;
  avgTechnicalRating: number;
  avgTacticalRating: number;
  avgPhysicalRating: number;
  avgMentalRating: number;
}

interface SafeDrillCompletion {
  drillTitle: string;
  drillCategory: string;
  performanceRating: number;
  technicalRating: number;
  tacticalRating: number;
  physicalRating: number;
  mentalRating: number;
  completionDate: string;
  coachNotes?: string;
}

interface StudentProgressDashboardProps {
  coachId?: number;
}

export default function StudentProgressDashboardFixed({ coachId = 1 }: StudentProgressDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // Helper functions with safe defaults
  const getTrendIcon = (trend?: string) => {
    if (!trend) return <Activity className="h-4 w-4 text-yellow-500" />;
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    if (!trend) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50 border-green-200';
      case 'declining': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string' && !isNaN(parseFloat(value))) return parseFloat(value);
    return defaultValue;
  };

  const safeString = (value: any, defaultValue: string = ''): string => {
    if (typeof value === 'string') return value;
    if (value != null) return String(value);
    return defaultValue;
  };

  const safeArray = <T>(value: any, defaultValue: T[] = []): T[] => {
    if (Array.isArray(value)) return value;
    return defaultValue;
  };

  // Fetch coach students from analytics data with comprehensive error handling
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ['/api/coach/progress-analytics', { coachId }],
    queryFn: async (): Promise<SafeStudent[]> => {
      try {
        const response = await fetch(`/api/coach/progress-analytics?coachId=${coachId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Network error' }));
          throw new Error(errorData.error || 'Failed to fetch analytics');
        }
        
        const result = await response.json();
        
        // Safe data transformation
        if (!result || !result.data || !result.data.studentProgressTrends) {
          return [];
        }
        
        const trends = safeArray(result.data.studentProgressTrends);
        
        return trends.map((student: any): SafeStudent => ({
          id: safeNumber(student.studentId, 0),
          name: safeString(student.studentName, 'Unknown Student'),
          email: `${safeString(student.studentName, 'unknown').toLowerCase().replace(/\s+/g, '')}@pickleplus.com`,
          totalDrillsCompleted: Math.floor(safeNumber(student.recentProgress, 0) * 10),
          avgPerformanceRating: safeNumber(student.recentProgress, 0) * 8,
          improvementTrend: safeString(student.trend, 'stable')
        })).filter(student => student.id > 0);
        
      } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
    }
  });

  // Fetch selected student progress with safe handling
  const { data: studentProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/coach/students/progress', selectedStudent, coachId],
    queryFn: async (): Promise<SafeStudentProgress | null> => {
      if (!selectedStudent) return null;
      
      try {
        const response = await fetch(`/api/coach/students/${selectedStudent}/progress?coachId=${coachId}`);
        if (!response.ok) throw new Error('Failed to fetch student progress');
        
        const result = await response.json();
        const data = result.data;
        
        if (!data) return null;
        
        return {
          studentId: safeNumber(data.studentId, selectedStudent),
          studentName: safeString(data.studentName, 'Unknown Student'),
          totalDrillsCompleted: safeNumber(data.totalDrillsCompleted, 0),
          totalSessionMinutes: safeNumber(data.totalSessionMinutes, 0),
          avgPerformanceRating: safeNumber(data.avgPerformanceRating, 0),
          avgTechnicalRating: safeNumber(data.avgTechnicalRating, 0),
          avgTacticalRating: safeNumber(data.avgTacticalRating, 0),
          avgPhysicalRating: safeNumber(data.avgPhysicalRating, 0),
          avgMentalRating: safeNumber(data.avgMentalRating, 0)
        };
      } catch (error) {
        console.error('Error fetching student progress:', error);
        return null;
      }
    },
    enabled: !!selectedStudent
  });

  // Fetch student drill history with safe handling
  const { data: drillHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['/api/coach/students/drill-history', selectedStudent, coachId],
    queryFn: async (): Promise<SafeDrillCompletion[]> => {
      if (!selectedStudent) return [];
      
      try {
        const response = await fetch(`/api/coach/students/${selectedStudent}/drill-history?coachId=${coachId}&limit=20`);
        if (!response.ok) throw new Error('Failed to fetch drill history');
        
        const result = await response.json();
        const history = safeArray(result.data);
        
        return history.map((completion: any): SafeDrillCompletion => ({
          drillTitle: safeString(completion.drillTitle, 'Unknown Drill'),
          drillCategory: safeString(completion.drillCategory, 'General'),
          performanceRating: safeNumber(completion.performanceRating, 0),
          technicalRating: safeNumber(completion.technicalRating, 0),
          tacticalRating: safeNumber(completion.tacticalRating, 0),
          physicalRating: safeNumber(completion.physicalRating, 0),
          mentalRating: safeNumber(completion.mentalRating, 0),
          completionDate: safeString(completion.completionDate, new Date().toISOString()),
          coachNotes: completion.coachNotes ? safeString(completion.coachNotes) : undefined
        }));
      } catch (error) {
        console.error('Error fetching drill history:', error);
        return [];
      }
    },
    enabled: !!selectedStudent
  });

  const form = useForm<DrillCompletionForm>({
    resolver: zodResolver(drillCompletionSchema),
    defaultValues: {
      studentId: selectedStudent || 0,
      performanceRating: 6.0,
      improvementAreas: []
    }
  });

  if (studentsLoading) {
    return (
      <div className={`min-h-screen ${gradientBg} p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/20 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={`${glassCard} h-32 rounded-xl`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${gradientBg} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${gradientText}`}>
              Student Progress Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Track student development and drill completion progress
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <Card className={glassCard}>
            <CardHeader>
              <CardTitle>Your Students</CardTitle>
              <CardDescription>Select a student to view their progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentsError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">
                    Unable to load students: {studentsError.message}
                  </p>
                </div>
              )}
              {students.length === 0 && !studentsError && (
                <div className="p-6 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No students found. Students will appear here when they complete drills under your coaching.</p>
                </div>
              )}
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedStudent === student.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-white/50 border border-gray-200 hover:bg-white/70'
                  }`}
                  onClick={() => {
                    if (student && student.id) {
                      setSelectedStudent(student.id);
                      form.setValue('studentId', student.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.totalDrillsCompleted} drills completed</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(student.improvementTrend)}
                      <Badge className={getTrendColor(student.improvementTrend)}>
                        {student.improvementTrend}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Avg Performance</span>
                      <span>{student.avgPerformanceRating ? student.avgPerformanceRating.toFixed(1) : 'N/A'}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, Math.max(0, (student.avgPerformanceRating || 0) / 8.0 * 100))} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Student Progress Details */}
          <div className="lg:col-span-2">
            {selectedStudent && studentProgress ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="history">Drill History</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card className={glassCard}>
                    <CardHeader>
                      <CardTitle>{studentProgress.studentName} - Progress Overview</CardTitle>
                      <CardDescription>Comprehensive PCP 4-dimensional assessment tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* PCP Ratings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">PCP Performance Analysis</h3>
                        
                        <div>
                          <div className="flex items-center gap-3 mt-1">
                            <Progress value={(studentProgress.avgTechnicalRating / 8.0) * 100} className="flex-1" />
                            <span className="text-sm font-semibold text-gray-900">
                              {studentProgress.avgTechnicalRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mt-1">
                            <Progress value={(studentProgress.avgTacticalRating / 8.0) * 100} className="flex-1" />
                            <span className="text-sm font-semibold text-gray-900">
                              {studentProgress.avgTacticalRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mt-1">
                            <Progress value={(studentProgress.avgPhysicalRating / 8.0) * 100} className="flex-1" />
                            <span className="text-sm font-semibold text-gray-900">
                              {studentProgress.avgPhysicalRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mt-1">
                            <Progress value={(studentProgress.avgMentalRating / 8.0) * 100} className="flex-1" />
                            <span className="text-sm font-semibold text-gray-900">
                              {studentProgress.avgMentalRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{studentProgress.totalDrillsCompleted}</div>
                          <div className="text-sm text-gray-600">Drills Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{studentProgress.totalSessionMinutes}min</div>
                          <div className="text-sm text-gray-600">Total Practice</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {studentProgress.avgPerformanceRating.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Avg Performance</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <Card className={glassCard}>
                    <CardHeader>
                      <CardTitle>Drill Completion History</CardTitle>
                      <CardDescription>Recent drill performances and progress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {historyLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse h-16 bg-white/20 rounded-lg"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {drillHistory.length > 0 ? drillHistory.map((completion, index) => (
                            <div key={index} className="p-4 bg-white/50 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{completion.drillTitle}</h4>
                                  <p className="text-sm text-gray-600">{completion.drillCategory}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-blue-600">
                                    {completion.performanceRating.toFixed(1)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(completion.completionDate).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                <div className="text-center">
                                  <div className="text-sm font-medium text-gray-700">Tech</div>
                                  <div className="text-sm text-blue-600">{completion.technicalRating.toFixed(1)}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-medium text-gray-700">Tact</div>
                                  <div className="text-sm text-green-600">{completion.tacticalRating.toFixed(1)}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-medium text-gray-700">Phys</div>
                                  <div className="text-sm text-orange-600">{completion.physicalRating.toFixed(1)}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-medium text-gray-700">Ment</div>
                                  <div className="text-sm text-purple-600">{completion.mentalRating.toFixed(1)}</div>
                                </div>
                              </div>

                              {completion.coachNotes && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  <MessageSquare className="h-3 w-3 inline mr-1" />
                                  {completion.coachNotes}
                                </div>
                              )}
                            </div>
                          )) : (
                            <div className="text-center py-8 text-gray-500">
                              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>No drill history available</p>
                              <p className="text-sm">Drill completions will appear here once recorded</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card className={glassCard}>
                    <CardHeader>
                      <CardTitle>Progress Analytics</CardTitle>
                      <CardDescription>Detailed performance analysis and trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Advanced analytics coming soon</p>
                        <p className="text-sm">Performance trends, skill development, and comparative analysis</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className={glassCard}>
                <CardContent className="py-12 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">Select a Student</p>
                  <p>Choose a student from the list to view their progress details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}