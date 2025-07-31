/**
 * PCP Assessment Page
 * Individual assessment interface for knowledge testing
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Target, Users } from 'lucide-react';
import { Link } from 'wouter';
import QuizInterface from '@/components/pcp/QuizInterface';

export default function PCPAssessmentPage() {
  const [match, params] = useRoute('/pcp-learning/assessment/:assessmentId');
  const [showQuiz, setShowQuiz] = useState(false);
  const assessmentId = params?.assessmentId;

  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ['/api/pcp-learning/assessment', assessmentId],
    queryFn: async () => {
      const response = await fetch(`/api/pcp-learning/assessment/${assessmentId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch assessment');
      const result = await response.json();
      return result.assessment;
    },
    enabled: !!assessmentId
  });

  if (!match) {
    return <div>Assessment not found</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Not Found</CardTitle>
            <CardDescription>
              The requested assessment could not be found or you may not have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pcp-learning-dashboard">
              <Button>Return to Learning Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizInterface 
          assessment={assessment}
          onComplete={() => setShowQuiz(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/pcp-learning-dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {assessment.assessmentName}
        </h1>
        <p className="text-gray-600">
          {assessment.description}
        </p>
      </div>

      {/* Assessment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{assessment.instructions}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Important Guidelines:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Read each question carefully before selecting your answer</li>
                  <li>• You can navigate between questions during the assessment</li>
                  <li>• Make sure to answer all questions before submitting</li>
                  <li>• Once submitted, you cannot change your answers</li>
                  {assessment.timeLimit && (
                    <li>• The assessment will auto-submit when time expires</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Previous Attempts */}
          {assessment.previousSubmissions && assessment.previousSubmissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Attempts</CardTitle>
                <CardDescription>
                  Review your past performance on this assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessment.previousSubmissions.map((submission: any) => (
                    <div key={submission.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          Attempt #{submission.attemptNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{submission.score}%</div>
                        <Badge variant={submission.status === 'passed' ? 'default' : 'destructive'}>
                          {submission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assessment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type</span>
                <Badge variant="outline">
                  {assessment.assessmentType.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Questions</span>
                <span className="font-medium">{assessment.questions?.length || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Passing Score</span>
                <span className="font-medium">{assessment.passingScore}%</span>
              </div>
              
              {assessment.timeLimit && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Time Limit
                  </span>
                  <span className="font-medium">{assessment.timeLimit} minutes</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Attempts Remaining
                </span>
                <span className="font-medium">{assessment.attemptsRemaining}</span>
              </div>
            </CardContent>
          </Card>

          {/* Start Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Begin?</CardTitle>
              <CardDescription>
                Make sure you have enough time to complete the assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowQuiz(true)}
                className="w-full"
                disabled={assessment.attemptsRemaining <= 0}
              >
                {assessment.previousSubmissions?.length > 0 ? 'Retake Assessment' : 'Start Assessment'}
              </Button>
              
              {assessment.attemptsRemaining <= 0 && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  No attempts remaining
                </p>
              )}
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <p>
                If you're experiencing technical issues or have questions about the assessment content, 
                please contact your PCP certification coordinator.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}