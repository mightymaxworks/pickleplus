/**
 * PCP Learning Dashboard
 * Comprehensive learning management interface for PCP certification participants
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileCheck, Clock, Award, Target, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

interface LearningDashboardData {
  application: {
    id: number;
    certificationLevelId: number;
    applicationStatus: string;
  };
  moduleProgress: Array<{
    module: {
      id: number;
      moduleName: string;
      description: string;
      estimatedHours: number;
      isRequired: boolean;
    };
    progress: {
      status: string;
      progressPercentage: number;
      timeSpent: number;
    } | null;
  }>;
  assessmentProgress: Array<{
    assessment: {
      id: number;
      assessmentName: string;
      assessmentType: string;
      passingScore: number;
      maxAttempts: number;
    };
    bestSubmission: {
      score: number;
      status: string;
      submittedAt: string;
    } | null;
    totalAttempts: number;
  }>;
  overallProgress: {
    moduleCompletionRate: number;
    assessmentPassRate: number;
    overallProgress: number;
    completedModules: number;
    totalModules: number;
    passedAssessments: number;
    totalAssessments: number;
  };
}

export default function PCPLearningDashboard() {
  const [selectedCertification, setSelectedCertification] = useState<number>(1);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/pcp-learning/dashboard', selectedCertification],
    queryFn: async () => {
      const response = await fetch(`/api/pcp-learning/dashboard/${selectedCertification}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch learning dashboard');
      const result = await response.json();
      return result.dashboard as LearningDashboardData[];
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Active Certifications</CardTitle>
            <CardDescription>
              You don't have any active PCP certification applications. Apply for a certification to access learning materials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pcp-certification">
              <Button>Browse Certification Levels</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDashboard = dashboardData[0]; // For now, show first certification

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600">
          Track your progress through PCP certification learning materials and assessments
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentDashboard.overallProgress.overallProgress}%
            </div>
            <Progress 
              value={currentDashboard.overallProgress.overallProgress} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentDashboard.overallProgress.completedModules}/{currentDashboard.overallProgress.totalModules}
            </div>
            <Progress 
              value={currentDashboard.overallProgress.moduleCompletionRate} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments Passed</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentDashboard.overallProgress.passedAssessments}/{currentDashboard.overallProgress.totalAssessments}
            </div>
            <Progress 
              value={currentDashboard.overallProgress.assessmentPassRate} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={currentDashboard.application.applicationStatus === 'approved' ? 'default' : 'secondary'}>
              {currentDashboard.application.applicationStatus.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Learning Content */}
      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="assessments">Knowledge Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentDashboard.moduleProgress.map(({ module, progress }) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.moduleName}</CardTitle>
                      <CardDescription className="mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                    {module.isRequired && (
                      <Badge variant="outline">Required</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {module.estimatedHours}h estimated
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {progress?.progressPercentage || 0}% complete
                      </div>
                    </div>
                    
                    <Progress value={progress?.progressPercentage || 0} />
                    
                    <div className="flex justify-between items-center">
                      <Badge 
                        variant={
                          progress?.status === 'completed' ? 'default' : 
                          progress?.status === 'in_progress' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {progress?.status?.replace('_', ' ') || 'Not Started'}
                      </Badge>
                      
                      <Link href={`/pcp-learning/module/${module.id}`}>
                        <Button variant="outline" size="sm">
                          {progress?.status === 'completed' ? 'Review' : 'Continue'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentDashboard.assessmentProgress.map(({ assessment, bestSubmission, totalAttempts }) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{assessment.assessmentName}</CardTitle>
                  <CardDescription>
                    {assessment.assessmentType.replace('_', ' ').toUpperCase()} • {assessment.passingScore}% to pass
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Attempts: {totalAttempts}/{assessment.maxAttempts}
                      </div>
                      {bestSubmission && (
                        <div className="text-sm">
                          Best Score: <span className="font-semibold">{bestSubmission.score}%</span>
                        </div>
                      )}
                    </div>
                    
                    {bestSubmission && (
                      <Progress value={bestSubmission.score} />
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Badge 
                        variant={
                          bestSubmission?.status === 'passed' ? 'default' : 
                          bestSubmission?.status === 'failed' ? 'destructive' : 
                          'outline'
                        }
                      >
                        {bestSubmission?.status || 'Not Attempted'}
                      </Badge>
                      
                      {totalAttempts < assessment.maxAttempts && (
                        <Link href={`/pcp-learning/assessment/${assessment.id}`}>
                          <Button 
                            variant={bestSubmission?.status === 'passed' ? 'outline' : 'default'} 
                            size="sm"
                          >
                            {bestSubmission ? 'Retake' : 'Start Test'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}