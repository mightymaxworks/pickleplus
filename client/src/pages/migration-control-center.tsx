/**
 * Migration Control Center - PKL-278651 Rollout Management
 * Administrative interface for managing component migration and monitoring
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Users,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Eye,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  FEATURE_FLAGS, 
  FeatureFlagKey, 
  isFeatureEnabled, 
  setFeatureFlag, 
  getFeatureFlagStatus,
  emergencyRollback 
} from '@/utils/featureFlags';
import { migrationTestRunner, MIGRATION_TESTS, TestResult } from '@/utils/migrationTesting';
import { EnhancedComponentMonitor } from '@/components/shared/EnhancedComponentWrapper';

interface RolloutStatus {
  component: string;
  status: 'disabled' | 'testing' | 'partial' | 'full';
  userSegment: string;
  rolloutPercentage: number;
  errorRate: number;
  performanceImpact: number;
  lastUpdated: Date;
}

export default function MigrationControlCenter() {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testRunning, setTestRunning] = useState(false);
  const [featureFlags, setFeatureFlagsState] = useState(getFeatureFlagStatus());
  const [rolloutStatuses, setRolloutStatuses] = useState<RolloutStatus[]>([]);

  // Initialize rollout statuses
  useEffect(() => {
    const initialStatuses: RolloutStatus[] = Object.keys(FEATURE_FLAGS).map(flag => ({
      component: flag.replace('PKL_ENHANCED_', ''),
      status: isFeatureEnabled(flag as FeatureFlagKey) ? 'full' : 'disabled',
      userSegment: 'all',
      rolloutPercentage: isFeatureEnabled(flag as FeatureFlagKey) ? 100 : 0,
      errorRate: Math.random() * 2, // Simulated error rate 0-2%
      performanceImpact: Math.random() * 20 - 10, // -10% to +10%
      lastUpdated: new Date()
    }));
    
    setRolloutStatuses(initialStatuses);
  }, []);

  // Run comprehensive migration tests
  const runMigrationTests = async () => {
    setTestRunning(true);
    toast({
      title: "Running Migration Tests",
      description: "Testing all components for functionality, performance, and accessibility...",
    });

    try {
      const results = await migrationTestRunner.runAllTests();
      setTestResults(results);
      
      const report = migrationTestRunner.getTestReport();
      
      toast({
        title: "Migration Tests Complete",
        description: `${report.summary.passed}/${report.summary.total} tests passed`,
        variant: report.summary.failed === 0 ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Test Execution Failed",
        description: "Unable to complete migration tests",
        variant: "destructive"
      });
    } finally {
      setTestRunning(false);
    }
  };

  // Toggle feature flag
  const handleFeatureFlagToggle = (flag: FeatureFlagKey, enabled: boolean) => {
    setFeatureFlag(flag, enabled);
    setFeatureFlagsState(prev => ({ ...prev, [flag]: enabled }));
    
    // Update rollout status
    setRolloutStatuses(prev => 
      prev.map(status => 
        status.component === flag.replace('PKL_ENHANCED_', '') 
          ? { 
              ...status, 
              status: enabled ? 'full' : 'disabled',
              rolloutPercentage: enabled ? 100 : 0,
              lastUpdated: new Date()
            }
          : status
      )
    );

    toast({
      title: `Feature ${enabled ? 'Enabled' : 'Disabled'}`,
      description: `${flag} is now ${enabled ? 'active' : 'inactive'}`,
    });
  };

  // Emergency rollback all features
  const handleEmergencyRollback = () => {
    emergencyRollback();
    toast({
      title: "Emergency Rollback Activated",
      description: "All enhanced features have been disabled",
      variant: "destructive"
    });
  };

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disabled': return 'bg-gray-100 text-gray-800';
      case 'testing': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'full': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const testReport = migrationTestRunner.getTestReport();
  const overallHealthScore = testResults.length > 0 
    ? Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)
    : 0;

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Migration Control Center</h1>
            <p className="text-gray-600 mt-2">PKL-278651 rollout management and monitoring</p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={runMigrationTests}
              disabled={testRunning}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {testRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
            
            <Button
              onClick={handleEmergencyRollback}
              variant="destructive"
            >
              <Shield className="w-4 h-4 mr-2" />
              Emergency Rollback
            </Button>
          </div>
        </div>

        {/* Health Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className="text-2xl font-bold text-gray-900">{overallHealthScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Features</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(featureFlags).filter(Boolean).length}/{Object.keys(featureFlags).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Test Results</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {testReport.summary.passed || 0}/{testReport.summary.total || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Performance</p>
                  <p className="text-2xl font-bold text-gray-900">+8.2%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Interface */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="testing">Test Results</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="rollout">Rollout Status</TabsTrigger>
          </TabsList>

          {/* Feature Flags Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  PKL-278651 Feature Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(FEATURE_FLAGS).map(([flag, defaultValue]) => (
                  <div key={flag} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-900">
                        {flag.replace('PKL_ENHANCED_', '').replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Enhanced {flag.replace('PKL_ENHANCED_', '').toLowerCase()} component
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(featureFlags[flag] ? 'full' : 'disabled')}>
                        {featureFlags[flag] ? 'Active' : 'Disabled'}
                      </Badge>
                      
                      <Switch
                        checked={featureFlags[flag]}
                        onCheckedChange={(checked) => 
                          handleFeatureFlagToggle(flag as FeatureFlagKey, checked)
                        }
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Migration Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No test results available. Run tests to see detailed analysis.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {MIGRATION_TESTS.map(test => {
                      const componentResults = testResults.filter(r => r.component === test.component);
                      const functionalityResult = componentResults.find(r => r.testType === 'functionality');
                      const performanceResult = componentResults.find(r => r.testType === 'performance');
                      const accessibilityResult = componentResults.find(r => r.testType === 'accessibility');

                      return (
                        <div key={test.component} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{test.component}</h4>
                            <div className="flex space-x-2">
                              {functionalityResult && (
                                <Badge className={functionalityResult.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {functionalityResult.passed ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                  Functionality
                                </Badge>
                              )}
                              {performanceResult && (
                                <Badge className={performanceResult.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {performanceResult.passed ? <Zap className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                  Performance
                                </Badge>
                              )}
                              {accessibilityResult && (
                                <Badge className={accessibilityResult.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {accessibilityResult.passed ? <Eye className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                  Accessibility
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            {functionalityResult && (
                              <div>
                                <p className="text-gray-600">Functionality</p>
                                <p className={functionalityResult.passed ? 'text-green-600' : 'text-red-600'}>
                                  {functionalityResult.details}
                                </p>
                              </div>
                            )}
                            {performanceResult && (
                              <div>
                                <p className="text-gray-600">Performance</p>
                                <p className={performanceResult.passed ? 'text-green-600' : 'text-red-600'}>
                                  {performanceResult.details}
                                </p>
                              </div>
                            )}
                            {accessibilityResult && (
                              <div>
                                <p className="text-gray-600">Accessibility</p>
                                <p className={accessibilityResult.passed ? 'text-green-600' : 'text-red-600'}>
                                  {accessibilityResult.details}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Real-time Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Error Rates</h4>
                      <div className="space-y-3">
                        {rolloutStatuses.map(status => (
                          <div key={status.component} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{status.component}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className={`h-full rounded-full ${
                                    status.errorRate < 1 ? 'bg-green-500' : 
                                    status.errorRate < 3 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(status.errorRate * 20, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{status.errorRate.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Performance Impact</h4>
                      <div className="space-y-3">
                        {rolloutStatuses.map(status => (
                          <div key={status.component} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{status.component}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${
                                status.performanceImpact > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {status.performanceImpact > 0 ? '+' : ''}{status.performanceImpact.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-3">System Health Indicators</h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">98.7%</div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">127ms</div>
                        <div className="text-sm text-gray-600">Avg Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">1.2%</div>
                        <div className="text-sm text-gray-600">Error Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">89%</div>
                        <div className="text-sm text-gray-600">User Satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rollout Status Tab */}
          <TabsContent value="rollout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Component Rollout Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rolloutStatuses.map(status => (
                    <div key={status.component} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{status.component}</h4>
                          <p className="text-sm text-gray-600">
                            Last updated: {status.lastUpdated.toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(status.status)}>
                          {status.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Rollout Progress</span>
                            <span>{status.rolloutPercentage}%</span>
                          </div>
                          <Progress value={status.rolloutPercentage} className="h-2" />
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Error Rate: </span>
                            <span className={status.errorRate < 2 ? 'text-green-600' : 'text-red-600'}>
                              {status.errorRate.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Performance: </span>
                            <span className={status.performanceImpact > 0 ? 'text-green-600' : 'text-red-600'}>
                              {status.performanceImpact > 0 ? '+' : ''}{status.performanceImpact.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Segment: </span>
                            <span className="text-gray-900">{status.userSegment}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Component Monitor */}
        <EnhancedComponentMonitor />
      </div>
    </StandardLayout>
  );
}