/**
 * Sprint 3 Phase 1: Assessment-Goal Integration Test Page
 * Comprehensive testing interface for all assessment-goal integration endpoints
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

export default function AssessmentGoalIntegrationTest() {
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('1');
  const [assessmentId, setAssessmentId] = useState('123');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const testEndpoints = [
    {
      name: 'Latest Assessment',
      endpoint: `/api/coach/assessments/${studentId}/latest`,
      method: 'GET',
      description: 'Retrieve most recent assessment for student'
    },
    {
      name: 'Assessment Trends',
      endpoint: `/api/coach/assessments/${studentId}/trends`,
      method: 'GET',
      description: 'Get assessment trends over time'
    },
    {
      name: 'Assessment Trends (3 months)',
      endpoint: `/api/coach/assessments/${studentId}/trends?timeframe=3months`,
      method: 'GET',
      description: 'Get 3-month assessment trends'
    },
    {
      name: 'Weak Areas Analysis',
      endpoint: `/api/coach/assessments/${assessmentId}/weak-areas`,
      method: 'GET',
      description: 'Analyze weak areas from assessment'
    },
    {
      name: 'Generate Goals',
      endpoint: `/api/coach/assessments/${assessmentId}/generate-goals`,
      method: 'POST',
      description: 'Generate goal recommendations'
    },
    {
      name: 'Complete Workflow',
      endpoint: `/api/coach/workflow/${studentId}`,
      method: 'GET',
      description: 'Get complete assessment-goal workflow'
    },
    {
      name: 'Coach Dashboard Metrics',
      endpoint: `/api/coach/dashboard/assessment-goal-metrics`,
      method: 'GET',
      description: 'Get coach dashboard metrics'
    }
  ];

  const runSingleTest = async (test: any) => {
    const startTime = Date.now();
    
    try {
      console.log(`[TEST] Running ${test.name}: ${test.method} ${test.endpoint}`);
      
      const response = await fetch(test.endpoint, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok) {
        console.log(`[TEST] ✅ ${test.name} passed (${duration}ms)`);
        return {
          endpoint: test.endpoint,
          status: 'success' as const,
          response: data,
          duration
        };
      } else {
        console.log(`[TEST] ❌ ${test.name} failed: ${data.error}`);
        return {
          endpoint: test.endpoint,
          status: 'error' as const,
          error: data.error || 'Unknown error',
          duration
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`[TEST] ❌ ${test.name} exception:`, error);
      return {
        endpoint: test.endpoint,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Network error',
        duration
      };
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    toast({
      title: "Running Sprint 3 Phase 1 Tests",
      description: `Testing ${testEndpoints.length} assessment-goal integration endpoints`,
    });

    const results: TestResult[] = [];
    
    for (const test of testEndpoints) {
      // Update UI with pending status
      const pendingResult: TestResult = {
        endpoint: test.endpoint,
        status: 'pending'
      };
      setTestResults(prev => [...prev.filter(r => r.endpoint !== test.endpoint), pendingResult]);
      
      // Run the test
      const result = await runSingleTest(test);
      
      // Update with final result
      results.push(result);
      setTestResults(prev => [...prev.filter(r => r.endpoint !== test.endpoint), result]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningTests(false);
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    toast({
      title: "Sprint 3 Phase 1 Testing Complete",
      description: `${successCount} passed, ${errorCount} failed`,
      variant: successCount === testEndpoints.length ? "default" : "destructive"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">PASS</Badge>;
      case 'error':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'pending':
        return <Badge variant="outline">TESTING...</Badge>;
      default:
        return <Badge variant="outline">READY</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sprint 3 Phase 1: Assessment-Goal Integration Testing
                </CardTitle>
                <CardDescription className="text-base">
                  Comprehensive validation of assessment-goal integration API endpoints
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Test Configuration */}
        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Test Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student ID for testing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessmentId">Assessment ID</Label>
                <Input
                  id="assessmentId"
                  value={assessmentId}
                  onChange={(e) => setAssessmentId(e.target.value)}
                  placeholder="Enter assessment ID for testing"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-3">
              <Button 
                onClick={runAllTests} 
                disabled={isRunningTests}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isRunningTests ? "Running Tests..." : "Run All Phase 1 Tests"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setTestResults([])}
                disabled={isRunningTests}
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid gap-4">
          {testEndpoints.map((test, index) => {
            const result = testResults.find(r => r.endpoint === test.endpoint);
            
            return (
              <Card key={index} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result?.status || 'ready')}
                      <div>
                        <h3 className="font-semibold">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {test.method} {test.endpoint}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {result?.duration && (
                        <span className="text-xs text-muted-foreground">
                          {result.duration}ms
                        </span>
                      )}
                      {getStatusBadge(result?.status || 'ready')}
                    </div>
                  </div>
                  
                  {result?.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-700 font-semibold">Error:</p>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </div>
                  )}
                  
                  {result?.response && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 font-semibold">Response:</p>
                      <pre className="text-xs text-green-600 mt-1 whitespace-pre-wrap">
                        {JSON.stringify(result.response, null, 2).substring(0, 500)}
                        {JSON.stringify(result.response, null, 2).length > 500 ? '...' : ''}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Test Summary */}
        {testResults.length > 0 && (
          <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((testResults.filter(r => r.status === 'success').length / testResults.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}