import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, Calendar, Target, Zap } from 'lucide-react';

export default function AdvancedCoachAnalyticsTest() {
  const [testResults, setTestResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const testAPI = async (endpoint: string, title: string) => {
    setLoading(true);
    try {
      console.log(`Testing ${title}: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log(`${title} Response:`, data);
      
      setTestResults(prev => [...prev, {
        title,
        endpoint,
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error(`${title} Error:`, error);
      setTestResults(prev => [...prev, {
        title,
        endpoint,
        status: 'error',
        success: false,
        error: String(error),
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const advancedAnalyticsTests = [
    { endpoint: '/api/coach/advanced/predictive/revenue-forecast', title: 'AI Revenue Forecasting', icon: TrendingUp },
    { endpoint: '/api/coach/advanced/predictive/demand-patterns', title: 'Demand Pattern Analysis', icon: Target },
    { endpoint: '/api/coach/advanced/scheduling/optimization', title: 'Smart Scheduling', icon: Calendar },
    { endpoint: '/api/coach/advanced/retention/risk-analysis', title: 'Client Retention Analytics', icon: Users },
    { endpoint: '/api/coach/advanced/retention/client-lifetime-value', title: 'Client Lifetime Value', icon: DollarSign },
    { endpoint: '/api/coach/advanced/marketing/performance', title: 'Marketing ROI Dashboard', icon: Zap },
    { endpoint: '/api/coach/advanced/marketing/attribution', title: 'Marketing Attribution', icon: Zap },
    { endpoint: '/api/coach/advanced/intelligence/competitive-analysis', title: 'Competitive Intelligence', icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Phase 3: Advanced Coach Analytics
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            AI-Powered Business Intelligence & Predictive Analytics Testing Suite
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              onClick={() => setTestResults([])}
              variant="outline"
              className="flex items-center gap-2"
            >
              Clear Results
            </Button>
            <Button
              onClick={() => {
                advancedAnalyticsTests.forEach(test => {
                  testAPI(test.endpoint, test.title);
                });
              }}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Test All Advanced Analytics
            </Button>
          </div>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {advancedAnalyticsTests.map((test, index) => {
            const Icon = test.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4 text-purple-600" />
                    {test.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => testAPI(test.endpoint, test.title)}
                    disabled={loading}
                    size="sm"
                    className="w-full"
                  >
                    Test API
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    {test.endpoint}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Results Panel */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Advanced Analytics Test Results ({testResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{result.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.endpoint}</p>
                    
                    {result.data && (
                      <div className="mt-3">
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium">View Response Data</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(r => r.success).length}
              </div>
              <div className="text-sm text-gray-600">Successful Tests</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter(r => !r.success).length}
              </div>
              <div className="text-sm text-gray-600">Failed Tests</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {testResults.length}
              </div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}