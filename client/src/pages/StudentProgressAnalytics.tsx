/**
 * Student Progress Analytics - Phase 2A: Advanced Coaching Tools
 * Comprehensive student development tracking and assessment system
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Star, 
  Plus,
  BarChart3,
  FileText,
  Calendar,
  Award,
  Brain,
  Zap,
  Activity,
  Heart,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StudentProgressAnalytics: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [assessmentFormOpen, setAssessmentFormOpen] = useState(false);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    technical: 5,
    tactical: 5,
    physical: 5,
    mental: 5,
    notes: ''
  });
  const [goalData, setGoalData] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'skill',
    priority: 'medium'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students overview
  const { data: studentsOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/coach/students/progress-overview'],
    queryFn: async () => {
      const response = await fetch('/api/coach/students/progress-overview', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch students overview');
      return response.json();
    }
  });

  // Fetch individual student progress (when selected)
  const { data: studentProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/coach/students/progress', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return null;
      const response = await fetch(`/api/coach/students/${selectedStudent}/progress`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch student progress');
      return response.json();
    },
    enabled: !!selectedStudent
  });

  // Create assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/coach/students/${selectedStudent}/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create assessment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/students/progress', selectedStudent] });
      toast({ title: 'Assessment created successfully', variant: 'default' });
      setAssessmentFormOpen(false);
      setAssessmentData({ technical: 5, tactical: 5, physical: 5, mental: 5, notes: '' });
    },
    onError: () => {
      toast({ title: 'Failed to create assessment', variant: 'destructive' });
    }
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/coach/students/${selectedStudent}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create goal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/students/progress', selectedStudent] });
      toast({ title: 'Goal created successfully', variant: 'default' });
      setGoalFormOpen(false);
      setGoalData({ title: '', description: '', targetDate: '', category: 'skill', priority: 'medium' });
    },
    onError: () => {
      toast({ title: 'Failed to create goal', variant: 'destructive' });
    }
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (reportType: string) => {
      const response = await fetch(`/api/coach/students/${selectedStudent}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportType })
      });
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Progress report generated successfully', variant: 'default' });
      // Here you could open a modal or download the report
      console.log('Generated report:', data);
    }
  });

  const overview = studentsOverview?.data || {};
  const progress = studentProgress?.data || {};

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Progress Analytics</h1>
          <p className="text-muted-foreground">Advanced coaching tools for student development tracking</p>
        </div>
        {selectedStudent && (
          <div className="flex gap-2">
            <Dialog open={assessmentFormOpen} onOpenChange={setAssessmentFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Skill Assessment</DialogTitle>
                  <DialogDescription>
                    Evaluate student progress across all four skill dimensions
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createAssessmentMutation.mutate(assessmentData);
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="technical">Technical (1-10)</Label>
                      <Input
                        id="technical"
                        type="number"
                        min="1"
                        max="10"
                        value={assessmentData.technical}
                        onChange={(e) => setAssessmentData({...assessmentData, technical: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tactical">Tactical (1-10)</Label>
                      <Input
                        id="tactical"
                        type="number"
                        min="1"
                        max="10"
                        value={assessmentData.tactical}
                        onChange={(e) => setAssessmentData({...assessmentData, tactical: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="physical">Physical (1-10)</Label>
                      <Input
                        id="physical"
                        type="number"
                        min="1"
                        max="10"
                        value={assessmentData.physical}
                        onChange={(e) => setAssessmentData({...assessmentData, physical: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mental">Mental (1-10)</Label>
                      <Input
                        id="mental"
                        type="number"
                        min="1"
                        max="10"
                        value={assessmentData.mental}
                        onChange={(e) => setAssessmentData({...assessmentData, mental: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Assessment Notes</Label>
                    <Textarea
                      id="notes"
                      value={assessmentData.notes}
                      onChange={(e) => setAssessmentData({...assessmentData, notes: e.target.value})}
                      placeholder="Detailed observations and recommendations..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setAssessmentFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createAssessmentMutation.isPending}>
                      {createAssessmentMutation.isPending ? 'Creating...' : 'Create Assessment'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={goalFormOpen} onOpenChange={setGoalFormOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Set Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Student Goal</DialogTitle>
                  <DialogDescription>
                    Create specific, measurable goals for student development
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createGoalMutation.mutate(goalData);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input
                      id="goal-title"
                      value={goalData.title}
                      onChange={(e) => setGoalData({...goalData, title: e.target.value})}
                      placeholder="e.g., Improve backhand consistency"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea
                      id="goal-description"
                      value={goalData.description}
                      onChange={(e) => setGoalData({...goalData, description: e.target.value})}
                      placeholder="Detailed description of the goal and success metrics..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="target-date">Target Date</Label>
                      <Input
                        id="target-date"
                        type="date"
                        value={goalData.targetDate}
                        onChange={(e) => setGoalData({...goalData, targetDate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={goalData.priority}
                        onChange={(e) => setGoalData({...goalData, priority: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setGoalFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createGoalMutation.isPending}>
                      {createGoalMutation.isPending ? 'Creating...' : 'Set Goal'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button 
              size="sm" 
              onClick={() => generateReportMutation.mutate('monthly')}
              disabled={generateReportMutation.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {overview.activeStudents || 0} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.averageImprovement?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Across all skill areas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skill Distribution</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {overview.skillLevelDistribution && Object.entries(overview.skillLevelDistribution).map(([level, count]) => (
                <div key={level} className="flex justify-between text-sm">
                  <span className="capitalize">{level}</span>
                  <span>{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.topPerformers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Students with 35%+ improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students
            </CardTitle>
            <CardDescription>Select a student to view detailed progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overview.topPerformers?.map((student: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStudent === student.id ? 'bg-primary/10 border-primary' : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setSelectedStudent(student.id || index.toString())}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.sessions} sessions</p>
                    </div>
                    <Badge variant="default">+{student.improvement}%</Badge>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No students available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Details */}
        <div className="lg:col-span-2">
          {selectedStudent && progressLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading student progress...</p>
                </div>
              </CardContent>
            </Card>
          ) : selectedStudent && progress ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>Basic profile and progress summary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{progress.studentInfo?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Level</p>
                        <Badge variant="outline">{progress.studentInfo?.level || 'Beginner'}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                        <p className="font-medium">{progress.studentInfo?.totalSessions || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Rating</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (progress.studentInfo?.averageRating || 0) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm ml-1">{progress.studentInfo?.averageRating?.toFixed(1) || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Skill Assessments
                    </CardTitle>
                    <CardDescription>Progress tracking across all four skill dimensions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {progress.skillAssessments && Object.entries(progress.skillAssessments).map(([skill, data]: [string, any]) => {
                      const improvement = ((data.current - data.starting) / data.starting * 100).toFixed(1);
                      const skillIcons = {
                        technical: Zap,
                        tactical: Brain,
                        physical: Activity,
                        mental: Heart
                      };
                      const SkillIcon = skillIcons[skill as keyof typeof skillIcons] || BarChart3;
                      
                      return (
                        <div key={skill} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <SkillIcon className="h-4 w-4" />
                              <span className="font-medium capitalize">{skill}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{data.current}/10</span>
                              <Badge variant="default" className="ml-2">+{improvement}%</Badge>
                            </div>
                          </div>
                          <Progress value={(data.current / 10) * 100} />
                          <p className="text-xs text-muted-foreground">
                            Started at {data.starting}/10 • Improved by {improvement}%
                          </p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="goals" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Goal Progress
                    </CardTitle>
                    <CardDescription>Short-term and long-term development objectives</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {progress.goalProgress?.shortTerm?.map((goal: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{goal.goal}</p>
                          <Badge variant="outline">{goal.progress}%</Badge>
                        </div>
                        <Progress value={goal.progress} className="mb-2" />
                        <p className="text-xs text-muted-foreground">Target: {goal.target}</p>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No goals set yet</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Session History
                    </CardTitle>
                    <CardDescription>Recent coaching sessions and progress notes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {progress.sessionHistory?.map((session: any, index: number) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{session.focus}</p>
                              <p className="text-sm text-muted-foreground">{session.date}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{session.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm">{session.notes}</p>
                        </div>
                      )) || <p className="text-sm text-muted-foreground">No session history available</p>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">Select a Student</p>
                  <p className="text-sm text-muted-foreground">Choose a student from the list to view detailed progress analytics</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressAnalytics;