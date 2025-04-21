/**
 * PKL-278651-BOUNCE-0002-RUNNER
 * Bounce Test Runner Component
 * 
 * This component provides the interface for running automated tests in the Bounce system.
 * It allows administrators to configure, start, and monitor test runs.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Play, Pause, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

// Test runner status and types
enum TestRunStatus {
  IDLE = 'idle',
  RUNNING = 'running', 
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Test configuration interface
interface TestConfig {
  name: string;
  description: string;
  flows: string[];
  browsers: string[];
  isNonDestructive: boolean;
  captureVideo: boolean;
  captureNetwork: boolean;
  stopOnFirstFailure: boolean;
}

// Test result interface
interface TestResult {
  id: number;
  status: string;
  progress: number;
  findingsCount: number;
  criticalCount: number;
  testsCompleted: number;
  testsTotal: number;
  startedAt: string;
  completedAt?: string;
}

/**
 * Bounce Test Runner Component
 */
export const BounceTestRunner: React.FC = () => {
  // State for selected test configuration
  const [selectedConfig, setSelectedConfig] = useState<string>('default');
  
  // State for custom test configuration
  const [customConfig, setCustomConfig] = useState<TestConfig>({
    name: 'Custom Test Run',
    description: 'Custom test configuration',
    flows: ['login', 'profile', 'match-recording'],
    browsers: ['chrome'],
    isNonDestructive: true,
    captureVideo: true,
    captureNetwork: true,
    stopOnFirstFailure: false
  });
  
  // State for current test run
  const [testRunStatus, setTestRunStatus] = useState<TestRunStatus>(TestRunStatus.IDLE);
  const [currentTestRun, setCurrentTestRun] = useState<TestResult | null>(null);
  
  // Default test configs
  const defaultTestConfigs = [
    {
      id: 'default',
      name: 'Standard Regression Test',
      description: 'Tests all critical user flows and UI components',
      flows: ['login', 'profile', 'matches', 'events', 'communities'],
      browsers: ['chrome', 'firefox'],
      isNonDestructive: true,
      captureVideo: true,
      captureNetwork: true,
      stopOnFirstFailure: false
    },
    {
      id: 'quick',
      name: 'Quick Check',
      description: 'Performs fast basic validation of core functionality',
      flows: ['login', 'profile'],
      browsers: ['chrome'],
      isNonDestructive: true,
      captureVideo: false,
      captureNetwork: false,
      stopOnFirstFailure: true
    }
  ];
  
  // Query for test configurations
  const { data: testConfigs = defaultTestConfigs, isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['/api/admin/bounce/configs'],
    retry: false,
    enabled: testRunStatus !== TestRunStatus.RUNNING,
    throwOnError: false
  });
  
  // Default test runs
  const defaultRecentRuns = [
    {
      id: 1,
      status: 'completed',
      progress: 100,
      findingsCount: 3,
      criticalCount: 1,
      testsCompleted: 15,
      testsTotal: 15,
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3540000).toISOString()
    },
    {
      id: 2,
      status: 'failed',
      progress: 42,
      findingsCount: 2,
      criticalCount: 1,
      testsCompleted: 5,
      testsTotal: 12,
      startedAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  
  // Query for previous test runs
  const { data: recentRuns = defaultRecentRuns, isLoading: isLoadingRuns } = useQuery({
    queryKey: ['/api/admin/bounce/runs'],
    retry: false,
    enabled: true,
    throwOnError: false
  });
  
  // Mutation for starting a test run
  const startTestRunMutation = useMutation({
    mutationFn: async (config: TestConfig) => {
      return fetch('/api/admin/bounce/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      }).then(res => res.json());
    },
    onSuccess: (data) => {
      setTestRunStatus(TestRunStatus.RUNNING);
      setCurrentTestRun(data);
      toast({
        title: 'Test Run Started',
        description: `Started test run "${data.name}" successfully`,
        variant: 'default'
      });
    },
    onError: (error) => {
      setTestRunStatus(TestRunStatus.FAILED);
      toast({
        title: 'Failed to start test run',
        description: 'An error occurred while starting the test run',
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for stopping a test run
  const stopTestRunMutation = useMutation({
    mutationFn: async (testRunId: number) => {
      return fetch('/api/admin/bounce/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testRunId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      setTestRunStatus(TestRunStatus.IDLE);
      toast({
        title: 'Test Run Stopped',
        description: 'The test run was stopped successfully',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to stop test run',
        description: 'An error occurred while stopping the test run',
        variant: 'destructive'
      });
    }
  });
  
  // Function to start a test run with enhanced error handling
  const startTestRun = () => {
    try {
      // Validate selected config exists before starting
      if (!selectedConfig) {
        toast({
          title: "Configuration Required",
          description: "Please select a test configuration before starting the test run.",
          variant: "destructive"
        });
        return;
      }
    
      // Use selected config or custom config
      const config = selectedConfig === 'custom' 
        ? customConfig 
        : testConfigs?.find(c => c.id === selectedConfig);
      
      // Validate config was found
      if (!config) {
        toast({
          title: "Invalid Configuration",
          description: "The selected test configuration could not be found.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate minimum requirements for custom config
      if (selectedConfig === 'custom' && 
          (!customConfig.flows.length || !customConfig.browsers.length)) {
        toast({
          title: "Invalid Configuration",
          description: "Please select at least one flow and browser for testing.",
          variant: "destructive"
        });
        return;
      }
    
      console.log(`[Bounce] Starting test run with config: ${config.name}`);
      startTestRunMutation.mutate(config);
      
      // Track test start in analytics
      try {
        // Sample analytics event
        console.log(`[Analytics] Test run started: ${config.name}`);
      } catch (analyticsError) {
        // Non-critical error, just log it
        console.error("Failed to track test run analytics", analyticsError);
      }
    } catch (error) {
      console.error("Error starting test run:", error);
      toast({
        title: "Test Run Error",
        description: "An unexpected error occurred while starting the test run.",
        variant: "destructive"
      });
    }
  };
  
  // Function to stop a test run with enhanced error handling
  const stopTestRun = () => {
    try {
      // Verify we have a current test run
      if (!currentTestRun) {
        toast({
          title: "No Active Test Run",
          description: "There is no active test run to stop.",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`[Bounce] Stopping test run #${currentTestRun.id}`);
      stopTestRunMutation.mutate(currentTestRun.id);
      
      // Track test stop in analytics (non-blocking)
      try {
        console.log(`[Analytics] Test run stopped: #${currentTestRun.id}`);
      } catch (analyticsError) {
        console.error("Failed to track test stop analytics", analyticsError);
      }
    } catch (error) {
      console.error("Error stopping test run:", error);
      toast({
        title: "Stop Test Error",
        description: "An unexpected error occurred while stopping the test run.",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle flow selection
  const handleFlowSelection = (flow: string, checked: boolean) => {
    if (checked) {
      setCustomConfig({
        ...customConfig,
        flows: [...customConfig.flows, flow]
      });
    } else {
      setCustomConfig({
        ...customConfig,
        flows: customConfig.flows.filter(f => f !== flow)
      });
    }
  };
  
  // Function to handle browser selection
  const handleBrowserSelection = (browserId: string) => {
    setCustomConfig({
      ...customConfig,
      browsers: [browserId] // Currently only supporting one browser at a time
    });
  };
  
  // Effect to poll for test run status updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (testRunStatus === TestRunStatus.RUNNING && currentTestRun) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/admin/bounce/status/${currentTestRun.id}`);
          const data = await response.json();
          
          setCurrentTestRun(data);
          
          if (data.status === 'completed') {
            setTestRunStatus(TestRunStatus.COMPLETED);
            clearInterval(interval);
            toast({
              title: 'Test Run Completed',
              description: `Completed with ${data.findingsCount} findings`,
              variant: 'default'
            });
          } else if (data.status === 'failed') {
            setTestRunStatus(TestRunStatus.FAILED);
            clearInterval(interval);
            toast({
              title: 'Test Run Failed',
              description: 'An error occurred during the test run',
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Failed to fetch test run status', error);
        }
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testRunStatus, currentTestRun]);
  
  // Available flows for testing
  const availableFlows = [
    { id: 'login', name: 'User Login' },
    { id: 'profile', name: 'Profile Management' },
    { id: 'match-recording', name: 'Match Recording' },
    { id: 'tournament-registration', name: 'Tournament Registration' },
    { id: 'event-management', name: 'Event Management' },
    { id: 'community-interaction', name: 'Community Interaction' },
    { id: 'passport', name: 'PicklePass™ Verification' },
    { id: 'achievements', name: 'Achievements & Rewards' }
  ];
  
  // Available browsers for testing
  const availableBrowsers = [
    { id: 'chrome', name: 'Chrome' },
    { id: 'firefox', name: 'Firefox' },
    { id: 'safari', name: 'Safari' },
    { id: 'edge', name: 'Edge' }
  ];
  
  // Function to render test run status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600">Running</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-600">Failed</Badge>;
      case 'paused':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600">Paused</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Render
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" /> Bounce Test Runner
          </CardTitle>
          <CardDescription>
            Run automated tests to detect issues and gather metrics on system stability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configure">
            <TabsList className="mb-4">
              <TabsTrigger value="configure">Configure Tests</TabsTrigger>
              <TabsTrigger value="monitor">Monitor Tests</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            {/* Configure Tab */}
            <TabsContent value="configure">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Test Configuration Selection */}
                  <div>
                    <Label htmlFor="test-config">Test Configuration</Label>
                    <Select
                      value={selectedConfig}
                      onValueChange={setSelectedConfig}
                      disabled={testRunStatus === TestRunStatus.RUNNING}
                    >
                      <SelectTrigger id="test-config">
                        <SelectValue placeholder="Select a test configuration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Configuration</SelectItem>
                        <SelectItem value="full">Full System Test</SelectItem>
                        <SelectItem value="critical-paths">Critical Paths Only</SelectItem>
                        <SelectItem value="performance">Performance Test</SelectItem>
                        <SelectItem value="custom">Custom Configuration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Browser Selection */}
                  <div>
                    <Label htmlFor="browser-select">Browser</Label>
                    <Select
                      value={customConfig.browsers[0]}
                      onValueChange={handleBrowserSelection}
                      disabled={testRunStatus === TestRunStatus.RUNNING || selectedConfig !== 'custom'}
                    >
                      <SelectTrigger id="browser-select">
                        <SelectValue placeholder="Select browser" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBrowsers.map(browser => (
                          <SelectItem key={browser.id} value={browser.id}>
                            {browser.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Test Flow Selection */}
                {selectedConfig === 'custom' && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Select test flows to run</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      {availableFlows.map(flow => (
                        <div key={flow.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`flow-${flow.id}`}
                            checked={customConfig.flows.includes(flow.id)}
                            onCheckedChange={(checked) => 
                              handleFlowSelection(flow.id, checked as boolean)
                            }
                            disabled={testRunStatus === TestRunStatus.RUNNING}
                          />
                          <Label htmlFor={`flow-${flow.id}`}>{flow.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Test Options */}
                {selectedConfig === 'custom' && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="non-destructive"
                        checked={customConfig.isNonDestructive}
                        onCheckedChange={(checked) => 
                          setCustomConfig({...customConfig, isNonDestructive: checked})
                        }
                        disabled={testRunStatus === TestRunStatus.RUNNING}
                      />
                      <Label htmlFor="non-destructive">Non-destructive testing</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="capture-video"
                        checked={customConfig.captureVideo}
                        onCheckedChange={(checked) => 
                          setCustomConfig({...customConfig, captureVideo: checked})
                        }
                        disabled={testRunStatus === TestRunStatus.RUNNING}
                      />
                      <Label htmlFor="capture-video">Capture video evidence</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="capture-network"
                        checked={customConfig.captureNetwork}
                        onCheckedChange={(checked) => 
                          setCustomConfig({...customConfig, captureNetwork: checked})
                        }
                        disabled={testRunStatus === TestRunStatus.RUNNING}
                      />
                      <Label htmlFor="capture-network">Capture network activity</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="stop-on-failure"
                        checked={customConfig.stopOnFirstFailure}
                        onCheckedChange={(checked) => 
                          setCustomConfig({...customConfig, stopOnFirstFailure: checked})
                        }
                        disabled={testRunStatus === TestRunStatus.RUNNING}
                      />
                      <Label htmlFor="stop-on-failure">Stop on first failure</Label>
                    </div>
                  </div>
                )}
                
                {/* Start/Stop Test Button */}
                <div className="mt-6 flex justify-end">
                  {testRunStatus !== TestRunStatus.RUNNING ? (
                    <Button
                      onClick={startTestRun}
                      disabled={isLoadingConfigs || selectedConfig === ''}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Start Test Run
                    </Button>
                  ) : (
                    <Button
                      onClick={stopTestRun}
                      variant="destructive"
                      className="gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Stop Test Run
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Monitor Tab */}
            <TabsContent value="monitor">
              {testRunStatus === TestRunStatus.IDLE ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <RefreshCw className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Active Test Runs</h3>
                  <p className="text-muted-foreground mt-2">
                    Configure and start a test run to monitor progress and results
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Current Test Run Status */}
                  {currentTestRun && (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">{currentTestRun.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Started at {new Date(currentTestRun.startedAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          {renderStatusBadge(testRunStatus)}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Test Progress</span>
                          <span>{currentTestRun.progress}%</span>
                        </div>
                        <Progress value={currentTestRun.progress} />
                      </div>
                      
                      {/* Test Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {currentTestRun.testsCompleted}/{currentTestRun.testsTotal}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Tests Completed
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {currentTestRun.findingsCount}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Total Findings
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {currentTestRun.criticalCount}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Critical Findings
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {Math.floor((Date.now() - new Date(currentTestRun.startedAt).getTime()) / 60000)} min
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Test Duration
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history">
              <div className="space-y-4">
                <div className="rounded-md border">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4">
                      <h3 className="font-medium mb-4">Recent Test Runs</h3>
                      
                      {isLoadingRuns ? (
                        <div className="flex justify-center p-4">
                          <RefreshCw className="h-6 w-6 animate-spin" />
                        </div>
                      ) : recentRuns && recentRuns.length > 0 ? (
                        <div className="space-y-4">
                          {recentRuns.map((run: TestResult) => (
                            <Card key={run.id} className="overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-base">Test Run #{run.id}</CardTitle>
                                  {renderStatusBadge(run.status)}
                                </div>
                                <CardDescription className="text-xs">
                                  {new Date(run.startedAt).toLocaleString()}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Findings</p>
                                    <p className="font-medium">{run.findingsCount}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Critical</p>
                                    <p className="font-medium">{run.criticalCount}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Progress</p>
                                    <p className="font-medium">{run.progress}%</p>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="pb-4 pt-2">
                                <Button variant="ghost" size="sm" className="ml-auto">
                                  View Details
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <p className="text-muted-foreground">
                            No test runs found
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BounceTestRunner;