import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Clock, RefreshCw, Play } from "lucide-react";

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  endpoint: string;
  response?: any;
  error?: string;
  duration?: number;
}

interface TestCategory {
  category: string;
  description: string;
  tests: TestResult[];
}

const PHASE_1_TESTS: TestCategory[] = [
  {
    category: "Authentication System",
    description: "Core user authentication and session management",
    tests: [
      { name: "User Registration", status: 'pending', endpoint: '/api/auth/register' },
      { name: "User Login", status: 'pending', endpoint: '/api/auth/login' },
      { name: "Session Validation", status: 'pending', endpoint: '/api/auth/user' },
      { name: "Password Reset", status: 'pending', endpoint: '/api/auth/reset-password' }
    ]
  },
  {
    category: "PCP Certification System",
    description: "Sequential Level 1→5 certification with validation",
    tests: [
      { name: "PCP Levels List", status: 'pending', endpoint: '/api/pcp-certification/levels' },
      { name: "Coach Profiles", status: 'pending', endpoint: '/api/pcp-coach/profiles' },
      { name: "Level Validation", status: 'pending', endpoint: '/api/pcp-cert/validate-level' },
      { name: "Certification Progress", status: 'pending', endpoint: '/api/pcp-coach/progress' }
    ]
  },
  {
    category: "Session Booking System", 
    description: "Complete request → response → schedule → payment workflow",
    tests: [
      { name: "Session Requests", status: 'pending', endpoint: '/api/session-booking/requests' },
      { name: "Coach Responses", status: 'pending', endpoint: '/api/session-booking/responses' },
      { name: "Schedule Management", status: 'pending', endpoint: '/api/session-booking/schedule' },
      { name: "Booking Status", status: 'pending', endpoint: '/api/session-booking/status' }
    ]
  },
  {
    category: "WISE Payment Integration",
    description: "International payment processing and coach payouts",
    tests: [
      { name: "Account Balance", status: 'pending', endpoint: '/api/wise/business/balance' },
      { name: "Payment Simulation", status: 'pending', endpoint: '/api/wise/diagnostic/simulate-payment' },
      { name: "Payout Processing", status: 'pending', endpoint: '/api/wise/business/transfers' },
      { name: "Transaction History", status: 'pending', endpoint: '/api/wise/business/transactions' }
    ]
  },
  {
    category: "Admin Approval Workflow",
    description: "Coach application and certification management",
    tests: [
      { name: "Approval Status", status: 'pending', endpoint: '/api/admin-approval/status' },
      { name: "Pending Applications", status: 'pending', endpoint: '/api/admin-approval/pending' },
      { name: "Approval Actions", status: 'pending', endpoint: '/api/admin-approval/approve' },
      { name: "Rejection Workflow", status: 'pending', endpoint: '/api/admin-approval/reject' }
    ]
  },
  {
    category: "Coach Discovery & Profiles",
    description: "Coach listings, search, and profile management",
    tests: [
      { name: "Available Coaches", status: 'pending', endpoint: '/api/coaches/available' },
      { name: "Coach Search", status: 'pending', endpoint: '/api/coaches/search' },
      { name: "Profile Details", status: 'pending', endpoint: '/api/coaches/profile' },
      { name: "Ratings & Reviews", status: 'pending', endpoint: '/api/coaches/reviews' }
    ]
  }
];

export default function Phase1TestingSuite() {
  const [testCategories, setTestCategories] = useState<TestCategory[]>(PHASE_1_TESTS);
  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  const runSingleTest = async (categoryIndex: number, testIndex: number): Promise<void> => {
    const test = testCategories[categoryIndex].tests[testIndex];
    
    // Update test status to running
    setTestCategories(prev => {
      const updated = [...prev];
      updated[categoryIndex].tests[testIndex].status = 'running';
      return updated;
    });

    const startTime = Date.now();
    
    try {
      const response = await fetch(test.endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const duration = Date.now() - startTime;
      let responseData;
      
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      // Update test result
      setTestCategories(prev => {
        const updated = [...prev];
        updated[categoryIndex].tests[testIndex] = {
          ...test,
          status: response.ok ? 'passed' : 'failed',
          response: responseData,
          error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
          duration
        };
        return updated;
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update test with error
      setTestCategories(prev => {
        const updated = [...prev];
        updated[categoryIndex].tests[testIndex] = {
          ...test,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Network error',
          duration
        };
        return updated;
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (let categoryIndex = 0; categoryIndex < testCategories.length; categoryIndex++) {
      for (let testIndex = 0; testIndex < testCategories[categoryIndex].tests.length; testIndex++) {
        await runSingleTest(categoryIndex, testIndex);
        // Brief delay between tests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    setIsRunning(false);
  };

  const resetTests = () => {
    setTestCategories(prev => prev.map(category => ({
      ...category,
      tests: category.tests.map(test => ({
        ...test,
        status: 'pending',
        response: undefined,
        error: undefined,
        duration: undefined
      }))
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Calculate overall statistics
  const allTests = testCategories.flatMap(cat => cat.tests);
  const passedTests = allTests.filter(test => test.status === 'passed').length;
  const failedTests = allTests.filter(test => test.status === 'failed').length;
  const totalTests = allTests.length;
  const completionPercentage = Math.round(((passedTests + failedTests) / totalTests) * 100);

  useEffect(() => {
    setOverallProgress(completionPercentage);
  }, [completionPercentage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Phase 1 Testing Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive operational validation for Core Coaching Marketplace infrastructure
          </p>
        </div>

        {/* Control Panel */}
        <div className="mb-8 flex gap-4 justify-center">
          <Button onClick={runAllTests} disabled={isRunning} size="lg">
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
          <Button onClick={resetTests} variant="outline" size="lg">
            Reset Tests
          </Button>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Test Progress</span>
              <Badge variant="outline">{overallProgress}% Complete</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{totalTests - passedTests - failedTests}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(passedTests / totalTests) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Categories */}
        <div className="grid gap-6">
          {testCategories.map((category, categoryIndex) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{category.category}</h3>
                    <p className="text-sm text-gray-600 font-normal">{category.description}</p>
                  </div>
                  <Badge variant="outline">
                    {category.tests.filter(t => t.status === 'passed').length}/{category.tests.length} Passed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.tests.map((test, testIndex) => (
                    <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-sm text-gray-500">{test.endpoint}</div>
                          {test.duration && (
                            <div className="text-xs text-gray-400">{test.duration}ms</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSingleTest(categoryIndex, testIndex)}
                          disabled={isRunning}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Results */}
        {allTests.some(test => test.response || test.error) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Test Results Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allTests.filter(test => test.response || test.error).map((test, index) => (
                  <div key={index} className="border-l-4 border-gray-200 pl-4">
                    <div className="font-medium text-sm">{test.name} - {test.endpoint}</div>
                    {test.error && (
                      <div className="text-red-600 text-sm mt-1">
                        Error: {test.error}
                      </div>
                    )}
                    {test.response && (
                      <div className="text-gray-600 text-sm mt-1">
                        <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                          {typeof test.response === 'string' 
                            ? test.response 
                            : JSON.stringify(test.response, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}