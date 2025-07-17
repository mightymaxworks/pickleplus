/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 3: Coach Assessment Workflow Demo
 * 
 * Comprehensive demo showing how coaches generate transparent points through real-time assessment
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CoachAssessmentCapture } from '@/components/coach-match-integration/CoachAssessmentCapture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  GraduationCap, 
  Target, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Eye,
  BarChart3,
  Zap,
  Users,
  Brain,
  Award,
  ListChecks
} from 'lucide-react';
import { useLocation } from 'wouter';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  icon: React.ComponentType<{ className?: string }>;
}

export default function CoachAssessmentWorkflowPage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [transparentPoints, setTransparentPoints] = useState<any>(null);
  
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'setup',
      title: 'Match Setup',
      description: 'Coach selects match and student to assess',
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending',
      icon: ListChecks
    },
    {
      id: 'assessment',
      title: 'Live Assessment',
      description: 'Coach evaluates 4-dimensional PCP performance',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending',
      icon: Target
    },
    {
      id: 'calculation',
      title: 'Points Calculation',
      description: 'System generates transparent points breakdown',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending',
      icon: BarChart3
    },
    {
      id: 'transparency',
      title: 'Transparent Display',
      description: 'Points breakdown shown to student with full details',
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending',
      icon: Eye
    }
  ];
  
  const handleAssessmentComplete = (assessment: any) => {
    setAssessmentData(assessment);
    setCurrentStep(2);
  };
  
  const handlePointsGenerated = (points: any) => {
    setTransparentPoints(points);
    setCurrentStep(3);
  };
  
  const handleStepComplete = () => {
    if (currentStep < workflowSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const resetWorkflow = () => {
    setCurrentStep(0);
    setAssessmentData(null);
    setTransparentPoints(null);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  Coach Assessment Workflow
                  <Badge variant="secondary" className="text-xs">
                    Phase 3
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  How coaches generate transparent points through real-time assessment
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/coach-match-dashboard')}
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={resetWorkflow}
                size="sm"
              >
                Reset Demo
              </Button>
            </div>
          </div>
          
          {/* Workflow Progress */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Assessment Workflow Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={(currentStep / (workflowSteps.length - 1)) * 100} className="w-full" />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.id}
                        className={`p-4 rounded-lg border ${
                          step.status === 'active' 
                            ? 'border-primary bg-primary/5' 
                            : step.status === 'completed'
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-5 w-5 ${
                            step.status === 'active' 
                              ? 'text-primary' 
                              : step.status === 'completed'
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`} />
                          <Badge variant={
                            step.status === 'active' 
                              ? 'default' 
                              : step.status === 'completed'
                              ? 'secondary'
                              : 'outline'
                          }>
                            {step.status === 'active' ? 'In Progress' : 
                             step.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm">{step.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflow">Assessment Workflow</TabsTrigger>
            <TabsTrigger value="explanation">How It Works</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
          </TabsList>
          
          {/* Assessment Workflow Tab */}
          <TabsContent value="workflow" className="space-y-6">
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Step 1: Match Setup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Demo Setup:</strong> This workflow demonstrates how a coach would assess a student during a match.
                        In production, this would be integrated with the match recording system.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Demo Match Details</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <div><strong>Match:</strong> Practice Session #123</div>
                          <div><strong>Student:</strong> Alex Player (ID: 2)</div>
                          <div><strong>Coach:</strong> Coach Wilson (ID: 1)</div>
                          <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Assessment Context</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          <div><strong>Session Type:</strong> Individual Coaching</div>
                          <div><strong>Duration:</strong> 60 minutes</div>
                          <div><strong>Focus Areas:</strong> Technical & Tactical</div>
                          <div><strong>Baseline Rating:</strong> 3.5 DUPR</div>
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleStepComplete} className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      Begin Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {currentStep === 1 && (
              <CoachAssessmentCapture
                matchId={123}
                playerId={2}
                coachId={1}
                onAssessmentComplete={handleAssessmentComplete}
                onPointsGenerated={handlePointsGenerated}
              />
            )}
            
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Step 3: Points Calculation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Assessment submitted successfully! The system has calculated transparent points based on your evaluation.
                      </AlertDescription>
                    </Alert>
                    
                    {transparentPoints && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted p-4 rounded">
                            <div className="text-sm text-muted-foreground">Base Points</div>
                            <div className="text-2xl font-bold">{transparentPoints.basePoints}</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded">
                            <div className="text-sm text-muted-foreground">Final Points</div>
                            <div className="text-2xl font-bold text-green-600">
                              {transparentPoints.totalPoints.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-4 rounded">
                          <h4 className="font-medium mb-2">Calculation Details</h4>
                          <div className="space-y-1 text-sm font-mono">
                            {transparentPoints.calculationDetails.map((detail: string, index: number) => (
                              <div key={index}>{detail}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button onClick={handleStepComplete} className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Show Transparent Display
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Step 4: Transparent Display
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Workflow Complete!</strong> The student can now see exactly how their points were calculated.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg mb-4">Student View: Transparent Points Breakdown</h4>
                      
                      {transparentPoints && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                              {transparentPoints.totalPoints.toFixed(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Points Earned
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-xl font-bold">{transparentPoints.technicalContribution.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">Technical (40%)</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold">{transparentPoints.tacticalContribution.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">Tactical (25%)</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold">{transparentPoints.physicalContribution.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">Physical (20%)</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold">{transparentPoints.mentalContribution.toFixed(1)}</div>
                              <div className="text-xs text-muted-foreground">Mental (15%)</div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">
                              Coaching multiplier: {transparentPoints.coachingMultiplier.toFixed(2)}x • 
                              Improvement bonus: +{transparentPoints.improvementBonus.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/transparent-points-allocation')}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Transparent System
                      </Button>
                      <Button onClick={resetWorkflow} className="flex-1">
                        <Activity className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* How It Works Tab */}
          <TabsContent value="explanation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  How Coach Assessment Generates Transparent Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        4-Dimensional Assessment
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Technical (40%):</strong> Shot technique, consistency, form</div>
                        <div><strong>Tactical (25%):</strong> Strategy, positioning, decision-making</div>
                        <div><strong>Physical (20%):</strong> Endurance, movement, agility</div>
                        <div><strong>Mental (15%):</strong> Focus, composure, resilience</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Points Calculation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Base Points:</strong> 10 points per match</div>
                        <div><strong>Dimensional Weighting:</strong> Applied to assessment scores</div>
                        <div><strong>Coaching Multiplier:</strong> 1.0x to 1.5x based on improvement</div>
                        <div><strong>Improvement Bonus:</strong> 0 to 3 additional points</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded">
                    <h4 className="font-medium mb-2">Example Calculation</h4>
                    <div className="text-sm font-mono space-y-1">
                      <div>Base Points: 10</div>
                      <div>Technical (40%): 0.70 → 2.8 points</div>
                      <div>Tactical (25%): 0.60 → 1.5 points</div>
                      <div>Physical (20%): 0.65 → 1.3 points</div>
                      <div>Mental (15%): 0.55 → 0.8 points</div>
                      <div>Coaching Multiplier: 1.25x</div>
                      <div>Improvement Bonus: +1.5 points</div>
                      <div className="border-t pt-1 mt-1">
                        <strong>Total: 13.8 points</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Beginner Student Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Technical:</span>
                      <span className="font-medium">45% (1.8 pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tactical:</span>
                      <span className="font-medium">40% (1.0 pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Physical:</span>
                      <span className="font-medium">60% (1.2 pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mental:</span>
                      <span className="font-medium">50% (0.8 pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Improvement:</span>
                      <span className="font-medium">80% (1.4x multiplier)</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Points:</span>
                      <span className="text-green-600">8.9</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Student Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Technical:</span>
                      <span className="font-medium">85% (3.4 pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tactical:</span>
                      <span className="font-medium">75% (1.9 pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Physical:</span>
                      <span className="font-medium">80% (1.6 pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mental:</span>
                      <span className="font-medium">90% (1.4 pts)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Improvement:</span>
                      <span className="font-medium">30% (1.15x multiplier)</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Points:</span>
                      <span className="text-green-600">12.6</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  System Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded">
                      <ListChecks className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">Match Recording</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Integrated with existing match recording system
                      </p>
                    </div>
                    
                    <div className="text-center p-4 border rounded">
                      <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">Coach Dashboard</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Accessible from coach management interface
                      </p>
                    </div>
                    
                    <div className="text-center p-4 border rounded">
                      <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">Student Profile</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Points automatically added to student records
                      </p>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Next Steps:</strong> This assessment workflow will be integrated into the main match recording system, 
                      allowing coaches to seamlessly assess students during actual matches and generate transparent points in real-time.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}