/**
 * PKL-278651-BOUNCE-0006-MOBILE - Bounce Mobile Optimization
 * Mobile Test Execution Component
 * 
 * This component provides a touch-optimized interface for executing Bounce automated tests
 * on mobile devices, with simplified controls and step-by-step guidance.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import React, { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Camera, 
  Smartphone, 
  Check, 
  CheckCircle2,
  X, 
  AlertCircle, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { BounceFindingSeverity, BounceFindingStatus } from '@shared/schema/bounce';
import { useCachedQuery, useNetworkStatus } from '@/lib/services/offlineCache';
import OfflineIndicator from './OfflineIndicator';

interface BounceTest {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // in seconds
  steps: number;
  priority: number;
  lastRun?: string;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  category: string;
  tags: string[];
}

interface TestStep {
  id: number;
  description: string;
  isManual: boolean;
  expectedResult: string;
  screenshotRequired: boolean;
}

interface TestRunState {
  testId: string;
  currentStep: number;
  totalSteps: number;
  startTime: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
  findings: {
    id: number;
    title: string;
    description: string;
    severity: BounceFindingSeverity;
    elementSelector?: string;
    screenshotId?: string;
  }[];
}

const MobileTestExecution: React.FC = () => {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isOnline, wasOffline } = useNetworkStatus();
  
  // State
  const [selectedTest, setSelectedTest] = useState<BounceTest | null>(null);
  const [testRunState, setTestRunState] = useState<TestRunState | null>(null);
  const [newFindingDrawerOpen, setNewFindingDrawerOpen] = useState(false);
  const [findingTitle, setFindingTitle] = useState('');
  const [findingDescription, setFindingDescription] = useState('');
  const [findingSeverity, setFindingSeverity] = useState<BounceFindingSeverity>(BounceFindingSeverity.MEDIUM);
  const [capturedScreenshot, setCapturedScreenshot] = useState<string | null>(null);
  
  // Fetch available tests
  const { 
    data: availableTests,
    isLoading: isTestsLoading,
    error: testsError,
    isStale: isTestsStale
  } = useCachedQuery(
    ['/api/admin/bounce/tests'],
    async () => apiRequest('/api/admin/bounce/tests'),
    { refetchOnReconnect: true }
  );

  // Fetch test steps when a test is selected
  const {
    data: testSteps,
    isLoading: isStepsLoading,
    error: stepsError,
    isStale: isStepsStale
  } = useCachedQuery(
    ['/api/admin/bounce/tests', selectedTest?.id, 'steps'],
    async () => {
      if (!selectedTest) return null;
      return apiRequest(`/api/admin/bounce/tests/${selectedTest.id}/steps`);
    },
    { 
      enabled: !!selectedTest,
      refetchOnReconnect: true
    }
  );
  
  // Start test run mutation
  const startTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      return apiRequest(`/api/admin/bounce/tests/${testId}/start`, {
        method: 'POST'
      });
    },
    onSuccess: (data, testId) => {
      // Initialize test run state
      if (!selectedTest) return;
      
      setTestRunState({
        testId,
        currentStep: 1,
        totalSteps: selectedTest.steps,
        startTime: Date.now(),
        status: 'running',
        findings: []
      });
      
      toast({
        title: 'Test started',
        description: `Running test: ${selectedTest.name}`,
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error starting test',
        description: 'Failed to start the test. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Report finding mutation
  const reportFindingMutation = useMutation({
    mutationFn: async (finding: {
      testId: string;
      title: string;
      description: string;
      severity: BounceFindingSeverity;
      screenshot?: string;
      stepNumber: number;
    }) => {
      return apiRequest('/api/admin/bounce/findings/report', {
        method: 'POST',
        body: JSON.stringify(finding)
      });
    },
    onSuccess: (data) => {
      // Add finding to local state
      if (testRunState) {
        setTestRunState({
          ...testRunState,
          findings: [
            ...testRunState.findings,
            {
              id: data.id,
              title: findingTitle,
              description: findingDescription,
              severity: findingSeverity,
              screenshotId: data.screenshotId
            }
          ]
        });
      }
      
      // Reset form and close drawer
      setFindingTitle('');
      setFindingDescription('');
      setFindingSeverity(BounceFindingSeverity.MEDIUM);
      setCapturedScreenshot(null);
      setNewFindingDrawerOpen(false);
      
      toast({
        title: 'Finding reported',
        description: 'Your finding has been reported successfully.',
        variant: 'default'
      });
    },
    onError: (error) => {
      // Cache the finding locally if offline
      if (!isOnline && testRunState) {
        const newFinding = {
          id: Math.floor(Math.random() * 10000), // Temp ID for offline mode
          title: findingTitle,
          description: findingDescription,
          severity: findingSeverity,
          screenshotId: null
        };
        
        setTestRunState({
          ...testRunState,
          findings: [...testRunState.findings, newFinding]
        });
        
        // Save to localStorage for sync later
        const offlineFindings = JSON.parse(localStorage.getItem('bounce_offline_findings') || '[]');
        offlineFindings.push({
          testId: testRunState.testId,
          title: findingTitle,
          description: findingDescription,
          severity: findingSeverity,
          screenshot: capturedScreenshot,
          stepNumber: testRunState.currentStep,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('bounce_offline_findings', JSON.stringify(offlineFindings));
        
        // Reset form and close drawer
        setFindingTitle('');
        setFindingDescription('');
        setFindingSeverity(BounceFindingSeverity.MEDIUM);
        setCapturedScreenshot(null);
        setNewFindingDrawerOpen(false);
        
        toast({
          title: 'Finding saved offline',
          description: 'Your finding has been saved locally and will sync when you reconnect.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Error reporting finding',
          description: 'Failed to report the finding. Please try again.',
          variant: 'destructive'
        });
      }
    }
  });
  
  // Complete test run mutation
  const completeTestMutation = useMutation({
    mutationFn: async (data: { testId: string; status: 'completed' | 'failed' }) => {
      return apiRequest(`/api/admin/bounce/tests/${data.testId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ status: data.status })
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/tests'] });
      
      if (testRunState) {
        setTestRunState({
          ...testRunState,
          status: variables.status
        });
      }
      
      toast({
        title: `Test ${variables.status}`,
        description: `Test has been marked as ${variables.status}.`,
        variant: variables.status === 'completed' ? 'default' : 'destructive'
      });
      
      // Reset after a delay
      setTimeout(() => {
        setTestRunState(null);
        setSelectedTest(null);
      }, 3000);
    },
    onError: (error) => {
      // Handle offline mode
      if (!isOnline && testRunState) {
        // Save test result locally
        const offlineTestResults = JSON.parse(localStorage.getItem('bounce_offline_test_results') || '[]');
        offlineTestResults.push({
          testId: testRunState.testId,
          status: 'completed',
          duration: Math.floor((Date.now() - testRunState.startTime) / 1000),
          findingsCount: testRunState.findings.length,
          completedAt: new Date().toISOString()
        });
        localStorage.setItem('bounce_offline_test_results', JSON.stringify(offlineTestResults));
        
        // Update UI
        setTestRunState({
          ...testRunState,
          status: 'completed'
        });
        
        toast({
          title: 'Test completed offline',
          description: 'Test result saved locally and will sync when you reconnect.',
          variant: 'default'
        });
        
        // Reset after a delay
        setTimeout(() => {
          setTestRunState(null);
          setSelectedTest(null);
        }, 3000);
      } else {
        toast({
          title: 'Error completing test',
          description: 'Failed to complete the test. Please try again.',
          variant: 'destructive'
        });
      }
    }
  });
  
  // Handler functions
  const handleStartTest = (test: BounceTest) => {
    setSelectedTest(test);
    startTestMutation.mutate(test.id);
  };
  
  const handlePauseTest = () => {
    if (testRunState) {
      setTestRunState({
        ...testRunState,
        status: 'paused'
      });
    }
  };
  
  const handleResumeTest = () => {
    if (testRunState) {
      setTestRunState({
        ...testRunState,
        status: 'running'
      });
    }
  };
  
  const handleNextStep = () => {
    if (testRunState && testRunState.currentStep < testRunState.totalSteps) {
      setTestRunState({
        ...testRunState,
        currentStep: testRunState.currentStep + 1
      });
    } else if (testRunState && testRunState.currentStep === testRunState.totalSteps) {
      // Auto-complete when reaching the last step
      completeTestMutation.mutate({
        testId: testRunState.testId,
        status: 'completed'
      });
    }
  };
  
  const handleStopTest = () => {
    if (testRunState) {
      completeTestMutation.mutate({
        testId: testRunState.testId,
        status: 'failed'
      });
    }
  };
  
  const handleCompleteTest = () => {
    if (testRunState) {
      completeTestMutation.mutate({
        testId: testRunState.testId,
        status: 'completed'
      });
    }
  };
  
  const handleReportFinding = () => {
    setNewFindingDrawerOpen(true);
  };
  
  const handleSubmitFinding = () => {
    if (!testRunState) return;
    
    reportFindingMutation.mutate({
      testId: testRunState.testId,
      title: findingTitle,
      description: findingDescription,
      severity: findingSeverity,
      screenshot: capturedScreenshot || undefined,
      stepNumber: testRunState.currentStep
    });
  };
  
  const handleCaptureScreenshot = () => {
    // In a real implementation, this would use a device camera or screenshot API
    // For this demo, we'll just simulate it
    setCapturedScreenshot('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    
    toast({
      title: 'Screenshot captured',
      description: 'Screenshot has been captured and will be attached to the finding.',
      variant: 'default'
    });
  };
  
  // Refresh handler
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/tests'] });
    if (selectedTest) {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bounce/tests', selectedTest.id, 'steps'] });
    }
  }, [queryClient, selectedTest]);
  
  // Render test selection screen
  const renderTestSelection = () => (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Run Mobile Test</CardTitle>
        <CardDescription>
          Select a test to run on your mobile device
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isTestsLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : testsError ? (
          <div className="text-center py-10">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Error loading tests</h3>
            <p className="text-muted-foreground mb-4">
              Could not load available tests.
            </p>
            <Button onClick={handleRefresh}>Retry</Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {availableTests?.tests?.map((test: BounceTest) => (
                <Card key={test.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{test.name}</h3>
                      <Badge variant="outline">{test.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {test.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground space-x-4 mb-3">
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {test.steps} steps
                      </span>
                      <span>
                        Est. {Math.floor(test.estimatedDuration / 60)}m {test.estimatedDuration % 60}s
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleStartTest(test)}
                      className="w-full"
                      disabled={!isOnline && !availableTests?.offlineAvailable?.includes(test.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </div>
  );
  
  // Render test execution screen
  const renderTestExecution = () => {
    if (!testRunState || !selectedTest) return null;
    
    const currentStepData = testSteps?.steps?.[testRunState.currentStep - 1] || {
      description: 'Loading step details...',
      expectedResult: '',
      isManual: true
    };
    
    const progress = Math.round((testRunState.currentStep / testRunState.totalSteps) * 100);
    
    return (
      <>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedTest.name}</CardTitle>
              <CardDescription>
                Step {testRunState.currentStep} of {testRunState.totalSteps}
              </CardDescription>
            </div>
            <Badge 
              variant={testRunState.status === 'running' ? 'default' : 'outline'}
              className={
                testRunState.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                testRunState.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                testRunState.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                ''
              }
            >
              {testRunState.status.charAt(0).toUpperCase() + testRunState.status.slice(1)}
            </Badge>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Current step:</h3>
              <div className="bg-muted p-3 rounded-md">
                {currentStepData.description}
              </div>
            </div>
            
            {currentStepData.expectedResult && (
              <div>
                <h3 className="text-sm font-medium mb-2">Expected result:</h3>
                <div className="bg-muted p-3 rounded-md">
                  {currentStepData.expectedResult}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium mb-2">Findings in this test:</h3>
              {testRunState.findings.length === 0 ? (
                <div className="text-center py-4 bg-muted rounded-md">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No findings reported yet</p>
                </div>
              ) : (
                <ScrollArea className="h-24">
                  <div className="space-y-2">
                    {testRunState.findings.map((finding) => (
                      <div key={finding.id} className="flex items-start space-x-2 p-2 bg-muted rounded-md">
                        {finding.severity === BounceFindingSeverity.CRITICAL ? (
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        ) : finding.severity === BounceFindingSeverity.HIGH ? (
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{finding.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {finding.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {testRunState.status === 'running' ? (
              <Button variant="outline" size="lg" onClick={handlePauseTest} className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : testRunState.status === 'paused' ? (
              <Button variant="outline" size="lg" onClick={handleResumeTest} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            ) : null}
            
            {(testRunState.status === 'running' || testRunState.status === 'paused') && (
              <>
                <Button 
                  variant="default" 
                  size="lg" 
                  onClick={handleNextStep}
                  className="flex-1"
                  disabled={testRunState.status === 'paused'}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Next Step
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={handleStopTest}
                >
                  <Square className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex-col space-y-2">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleReportFinding}
            disabled={testRunState.status !== 'running'}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Finding
          </Button>
          
          <Button 
            variant="default" 
            className="w-full" 
            onClick={handleCompleteTest}
            disabled={testRunState.status !== 'running' && testRunState.status !== 'paused'}
          >
            <Check className="h-4 w-4 mr-2" />
            Complete Test
          </Button>
        </CardFooter>
      </>
    );
  };
  
  // Render test completed screen
  const renderTestCompleted = () => {
    if (!testRunState || !selectedTest || 
        (testRunState.status !== 'completed' && testRunState.status !== 'failed')) {
      return null;
    }
    
    return (
      <>
        <CardHeader className="text-center">
          {testRunState.status === 'completed' ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <CardTitle>Test Completed</CardTitle>
            </>
          ) : (
            <>
              <X className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <CardTitle>Test Stopped</CardTitle>
            </>
          )}
          <CardDescription>
            {testRunState.findings.length} findings reported
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="mb-6">
              {testRunState.status === 'completed' 
                ? 'Great job! You have successfully completed the test.' 
                : 'Test was stopped before completion.'}
            </p>
            <Button onClick={() => {
              setSelectedTest(null);
              setTestRunState(null);
            }}>
              Return to Test Selection
            </Button>
          </div>
        </CardContent>
      </>
    );
  };
  
  return (
    <div className="space-y-4">
      <OfflineIndicator 
        isOnline={isOnline} 
        wasOffline={wasOffline} 
        isStale={isTestsStale || isStepsStale}
        onRefresh={handleRefresh}
      />
      
      <Card className="min-h-[500px]">
        {!selectedTest ? (
          renderTestSelection()
        ) : testRunState?.status === 'completed' || testRunState?.status === 'failed' ? (
          renderTestCompleted()
        ) : (
          renderTestExecution()
        )}
      </Card>
      
      <Drawer open={newFindingDrawerOpen} onOpenChange={setNewFindingDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Report Finding</DrawerTitle>
            <DrawerDescription>
              Report a finding or issue discovered during testing
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 py-2">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  id="title"
                  className="w-full p-2 border rounded-md"
                  placeholder="Brief description of the issue"
                  value={findingTitle}
                  onChange={(e) => setFindingTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md min-h-20"
                  placeholder="Detailed explanation of what happened"
                  value={findingDescription}
                  onChange={(e) => setFindingDescription(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="severity" className="text-sm font-medium">
                  Severity
                </label>
                <select
                  id="severity"
                  className="w-full p-2 border rounded-md"
                  value={findingSeverity}
                  onChange={(e) => setFindingSeverity(e.target.value as BounceFindingSeverity)}
                >
                  <option value={BounceFindingSeverity.LOW}>Low</option>
                  <option value={BounceFindingSeverity.MEDIUM}>Medium</option>
                  <option value={BounceFindingSeverity.HIGH}>High</option>
                  <option value={BounceFindingSeverity.CRITICAL}>Critical</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Screenshot</label>
                {capturedScreenshot ? (
                  <div className="border rounded-md p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-500">Screenshot captured</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => setCapturedScreenshot(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-gray-100 h-24 rounded flex items-center justify-center">
                      <Smartphone className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleCaptureScreenshot}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture Screenshot
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <DrawerFooter>
            <Button 
              onClick={handleSubmitFinding}
              disabled={!findingTitle || !findingDescription}
            >
              Submit Finding
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobileTestExecution;