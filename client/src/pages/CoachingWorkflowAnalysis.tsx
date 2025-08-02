import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Clock, PlayCircle } from 'lucide-react';

const CoachingWorkflowAnalysis: React.FC = () => {
  const [apiTests, setApiTests] = useState([
    {
      category: 'Authentication System',
      tests: [
        { name: 'User Registration', endpoint: '/api/auth/register', status: 'idle', responseTime: null },
        { name: 'User Login', endpoint: '/api/auth/login', status: 'idle', responseTime: null },
        { name: 'Current User', endpoint: '/api/auth/current-user', status: 'idle', responseTime: null },
        { name: 'Logout', endpoint: '/api/auth/logout', status: 'idle', responseTime: null }
      ]
    },
    {
      category: 'PCP Certification',
      tests: [
        { name: 'Certification Status', endpoint: '/api/pcp-cert/status', status: 'idle', responseTime: null },
        { name: 'Level Validation', endpoint: '/api/pcp-cert/level-validation', status: 'idle', responseTime: null },
        { name: 'Coach Onboarding', endpoint: '/api/pcp-coach/onboard', status: 'idle', responseTime: null },
        { name: 'Profile Setup', endpoint: '/api/pcp-coach/profile', status: 'idle', responseTime: null }
      ]
    },
    {
      category: 'Session Booking',
      tests: [
        { name: 'Request Session', endpoint: '/api/sessions/request', status: 'idle', responseTime: null },
        { name: 'Coach Response', endpoint: '/api/sessions/respond', status: 'idle', responseTime: null },
        { name: 'Session History', endpoint: '/api/sessions/history', status: 'idle', responseTime: null },
        { name: 'Booking Status', endpoint: '/api/sessions/status', status: 'idle', responseTime: null }
      ]
    },
    {
      category: 'WISE Payment',
      tests: [
        { name: 'Create Transfer', endpoint: '/api/wise/create-transfer', status: 'idle', responseTime: null },
        { name: 'Transfer Status', endpoint: '/api/wise/transfer-status', status: 'idle', responseTime: null },
        { name: 'Account Balance', endpoint: '/api/wise/account-balance', status: 'idle', responseTime: null },
        { name: 'Transaction History', endpoint: '/api/wise/transactions', status: 'idle', responseTime: null }
      ]
    },
    {
      category: 'Admin Approval',
      tests: [
        { name: 'Pending Approvals', endpoint: '/api/admin/pending-approvals', status: 'idle', responseTime: null },
        { name: 'Approve Coach', endpoint: '/api/admin/approve-coach', status: 'idle', responseTime: null },
        { name: 'Rejection Workflow', endpoint: '/api/admin/reject-application', status: 'idle', responseTime: null },
        { name: 'Approval History', endpoint: '/api/admin/approval-history', status: 'idle', responseTime: null }
      ]
    }
  ]);

  const testRoutes = [
    { name: 'Landing Page', path: '/', status: 'operational', description: 'Main entry point' },
    { name: 'Authentication', path: '/auth', status: 'operational', description: 'Login/Register flow' },
    { name: 'Coach Hub', path: '/coach', status: 'operational', description: 'Coach dashboard' },
    { name: 'Training Centers', path: '/training-centers', status: 'operational', description: 'Facility access' },
    { name: 'Session Booking', path: '/session-booking', status: 'operational', description: 'Book coaching sessions' },
    { name: 'Player Dashboard', path: '/dashboard', status: 'operational', description: 'Player main view' },
    { name: 'Admin Panel', path: '/admin', status: 'operational', description: 'Admin tools' },
    { name: 'Profile Settings', path: '/settings', status: 'operational', description: 'User settings' }
  ];

  const runSingleTest = async (categoryIndex: number, testIndex: number) => {
    const newTests = [...apiTests];
    newTests[categoryIndex].tests[testIndex].status = 'running';
    setApiTests(newTests);

    const startTime = Date.now();
    
    try {
      const endpoint = newTests[categoryIndex].tests[testIndex].endpoint;
      const response = await fetch(endpoint, { method: 'GET' });
      const responseTime = Date.now() - startTime;
      
      newTests[categoryIndex].tests[testIndex] = {
        ...newTests[categoryIndex].tests[testIndex],
        status: response.ok ? 'passed' : 'failed',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      newTests[categoryIndex].tests[testIndex] = {
        ...newTests[categoryIndex].tests[testIndex],
        status: 'failed',
        responseTime
      };
    }
    
    setApiTests(newTests);
  };

  const runAllTests = async () => {
    for (let categoryIndex = 0; categoryIndex < apiTests.length; categoryIndex++) {
      for (let testIndex = 0; testIndex < apiTests[categoryIndex].tests.length; testIndex++) {
        await runSingleTest(categoryIndex, testIndex);
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between tests
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'failed': return <XCircle className="w-3 h-3 text-red-600" />;
      case 'running': return <Clock className="w-3 h-3 text-blue-600 animate-spin" />;
      default: return <PlayCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTotalStats = () => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    
    apiTests.forEach(category => {
      category.tests.forEach(test => {
        total++;
        if (test.status === 'passed') passed++;
        if (test.status === 'failed') failed++;
      });
    });
    
    return { total, passed, failed, completion: Math.round((passed + failed) / total * 100) };
  };

  const stats = getTotalStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Phase 1 Development Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive testing and validation for all Phase 1 systems
        </p>
      </div>

      <Tabs defaultValue="api-testing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api-testing">Phase 1 API Testing</TabsTrigger>
          <TabsTrigger value="route-testing">Route Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="api-testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Phase 1 API Testing Suite
                <div className="flex gap-2">
                  <Badge variant="outline">{stats.total} Total Tests</Badge>
                  <Badge className="bg-green-100 text-green-800">{stats.passed} Passed</Badge>
                  <Badge className="bg-red-100 text-red-800">{stats.failed} Failed</Badge>
                  <Badge variant="outline">{stats.completion}% Complete</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <Button onClick={runAllTests} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
                  Run All Phase 1 Tests
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {apiTests.map((category, categoryIndex) => (
                  <Card key={categoryIndex} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.tests.map((test, testIndex) => (
                          <div key={testIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(test.status)}
                              <div>
                                <p className="font-medium text-sm">{test.name}</p>
                                <code className="text-xs text-gray-500">{test.endpoint}</code>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {test.responseTime && (
                                <span className="text-xs text-gray-500">{test.responseTime}ms</span>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runSingleTest(categoryIndex, testIndex)}
                                disabled={test.status === 'running'}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="route-testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Testing Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testRoutes.map((route, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm">{route.name}</h3>
                      <Badge className={`text-xs ${getStatusColor(route.status)} flex items-center gap-1`}>
                        {getStatusIcon(route.status)}
                        {route.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{route.description}</p>
                    <div className="flex gap-2">
                      {route.status === 'operational' || route.status === 'partial' ? (
                        <a 
                          href={route.path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          Test Route
                        </a>
                      ) : (
                        <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded cursor-not-allowed">
                          Not Available
                        </span>
                      )}
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono ml-2">
                        {route.path}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Universal Development Workflow:</strong> This dashboard serves all development modules (coaching, franchise, retail, facilities). 
                  After completing ANY feature in ANY module, the system should automatically redirect here for verification.
                  Test all routes marked as "operational" to ensure no regressions have been introduced.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachingWorkflowAnalysis;