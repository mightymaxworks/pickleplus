import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  ClipboardCheck, 
  TrendingUp, 
  MessageSquare,
  Target,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Settings,
  Eye,
  PlusCircle,
  Search
} from 'lucide-react';

/**
 * PKL-278651-COACH-WORKFLOW-GUIDE - Complete Coach User Journey
 * 
 * Demonstrates the complete workflow for coaches using the assessment system:
 * 1. Coach Dashboard Access
 * 2. Student Management
 * 3. Assessment Workflow
 * 4. Transparent Points Generation
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

interface CoachWorkflowGuidePageProps {}

const CoachWorkflowGuidePage: React.FC<CoachWorkflowGuidePageProps> = () => {
  const [, setLocation] = useLocation();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Mock coach data for demonstration
  const mockCoachData = {
    coach: {
      id: 1,
      name: "Sarah Chen",
      title: "PCP Certified Coach",
      specialties: ["Technical Development", "Mental Toughness", "Competition Prep"],
      activeStudents: 8,
      pendingRequests: 3,
      todaySessions: 2
    },
    students: [
      {
        id: 1,
        name: "Alex Rivera",
        level: "Intermediate",
        lastSession: "2025-07-15",
        needsAssessment: true,
        upcomingSession: "2025-07-18 3:00 PM"
      },
      {
        id: 2,
        name: "Jordan Kim", 
        level: "Advanced",
        lastSession: "2025-07-16",
        needsAssessment: false,
        upcomingSession: "2025-07-19 10:00 AM"
      },
      {
        id: 3,
        name: "Taylor Martinez",
        level: "Beginner",
        lastSession: "2025-07-14",
        needsAssessment: true,
        upcomingSession: "2025-07-17 5:00 PM"
      }
    ]
  };

  const workflowSteps = [
    {
      id: 'dashboard',
      title: '1. Coach Dashboard Access',
      description: 'Coaches access the system through their personalized dashboard',
      route: '/coach-match-dashboard',
      icon: Users,
      details: [
        'Login to Pickle+ platform',
        'Navigate to Coach Dashboard from main menu',
        'View active students and pending sessions',
        'Monitor coaching effectiveness metrics'
      ]
    },
    {
      id: 'students',
      title: '2. Student Management',
      description: 'Manage active students and review session requests',
      route: '/coach/students',
      icon: UserPlus,
      details: [
        'Review pending session requests from students',
        'Accept or decline coaching requests',
        'View student profiles and skill levels',
        'Schedule upcoming coaching sessions'
      ]
    },
    {
      id: 'assessment',
      title: '3. Assessment Workflow',
      description: 'Conduct real-time 4-dimensional PCP assessments',
      route: '/coach-assessment-workflow',
      icon: ClipboardCheck,
      details: [
        'Select student for assessment session',
        'Use 4-dimensional PCP methodology (Technical, Tactical, Physical, Mental)',
        'Capture real-time observations during coaching',
        'Generate coaching multipliers and improvement tracking'
      ]
    },
    {
      id: 'points',
      title: '4. Transparent Points Generation',
      description: 'Automatic points calculation based on assessments',
      route: '/transparent-points-allocation',
      icon: TrendingUp,
      details: [
        'System automatically calculates transparent points',
        'Coaching multipliers applied (1.0x - 1.5x based on improvement)',
        'Breakdown shows Technical 40%, Tactical 25%, Physical 20%, Mental 15%',
        'Students receive detailed point allocation explanations'
      ]
    }
  ];

  const StudentSelectionDemo = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Selection Process
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          When conducting assessments, coaches select from their active students:
        </p>
        
        {mockCoachData.students.map((student) => (
          <div key={student.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">{student.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h4 className="font-medium">{student.name}</h4>
                  <p className="text-sm text-muted-foreground">{student.level} Player</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {student.needsAssessment && (
                  <Badge variant="destructive" className="text-xs">
                    Assessment Due
                  </Badge>
                )}
                <Button 
                  size="sm" 
                  onClick={() => {
                    setActiveDemo('assessment-' + student.id);
                    setLocation('/coach-assessment-workflow');
                  }}
                >
                  <ClipboardCheck className="h-4 w-4 mr-1" />
                  Assess
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
              <span>Last Session: {student.lastSession}</span>
              <span>Next Session: {student.upcomingSession}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const AssessmentFlowDemo = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Assessment Flow Example
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Selected Student: Alex Rivera</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Intermediate player focusing on technical development and consistency
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">75</div>
              <div className="text-xs text-gray-600">Technical (40%)</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">68</div>
              <div className="text-xs text-gray-600">Tactical (25%)</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">72</div>
              <div className="text-xs text-gray-600">Physical (20%)</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">80</div>
              <div className="text-xs text-gray-600">Mental (15%)</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Coaching Multiplier:</span>
              <span className="text-lg font-bold text-green-600">1.25x</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Improvement Bonus:</span>
              <span className="text-lg font-bold text-blue-600">+2.5 pts</span>
            </div>
            <div className="flex items-center justify-between border-t pt-2 mt-2">
              <span className="text-sm font-medium">Total Points Awarded:</span>
              <span className="text-xl font-bold text-primary">15.0 pts</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Coach Assessment Workflow Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete guide to using the PCP 4-dimensional assessment system for transparent points allocation
          </p>
          <Badge className="bg-green-100 text-green-800 px-4 py-2">
            Phase 3 Complete - Fully Operational
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{mockCoachData.coach.activeStudents}</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{mockCoachData.coach.pendingRequests}</div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{mockCoachData.coach.todaySessions}</div>
              <div className="text-sm text-muted-foreground">Today's Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-muted-foreground">Effectiveness Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="workflow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflow">Complete Workflow</TabsTrigger>
            <TabsTrigger value="student-mgmt">Student Management</TabsTrigger>
            <TabsTrigger value="assessment">Assessment Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>4-Step Coach Workflow</CardTitle>
                <p className="text-muted-foreground">
                  From dashboard access to transparent points generation
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                          <p className="text-muted-foreground mb-3">{step.description}</p>
                          <ul className="space-y-1 mb-4">
                            {step.details.map((detail, i) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            variant="outline" 
                            onClick={() => setLocation(step.route)}
                            className="w-full md:w-auto"
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Try {step.title.split(' ').slice(-1)[0]}
                          </Button>
                        </div>
                        {index < workflowSteps.length - 1 && (
                          <div className="hidden md:flex items-center">
                            <ArrowRight className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="student-mgmt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Assignment & Management</CardTitle>
                <p className="text-muted-foreground">
                  How coaches manage their students and assign assessments
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">How Students Are Assigned to Coaches:</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        Student browses available coaches in the platform
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        Student submits a session request to their chosen coach
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        Coach reviews request and accepts/declines
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        Once accepted, student appears in coach's active student list
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                        Coach can now assign assessments and track progress
                      </li>
                    </ol>
                  </div>
                  
                  <StudentSelectionDemo />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Assessment Demonstration</CardTitle>
                <p className="text-muted-foreground">
                  See how coaches use the 4-dimensional PCP assessment tool
                </p>
              </CardHeader>
              <CardContent>
                <AssessmentFlowDemo />
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Transparent Points Breakdown
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Calculation Method:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Base Points: 10</li>
                        <li>• Technical (40%): 3.0 pts</li>
                        <li>• Tactical (25%): 1.7 pts</li>
                        <li>• Physical (20%): 1.4 pts</li>
                        <li>• Mental (15%): 1.2 pts</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Coaching Impact:</p>
                      <ul className="space-y-1 mt-1">
                        <li>• Coaching Multiplier: 1.25x</li>
                        <li>• Improvement Bonus: +2.5</li>
                        <li>• Total Points: 15.0</li>
                        <li>• Student sees full breakdown</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Try the Assessment Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Experience the complete assessment workflow with realistic student data and live calculations.
              </p>
              <Button 
                className="w-full" 
                onClick={() => setLocation('/coach-assessment-workflow')}
              >
                Launch Assessment Tool
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                View Coach Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                See the coach's unified dashboard with student management and performance analytics.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation('/coach-match-dashboard')}
              >
                Open Coach Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Technical Implementation Notes */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Technical Implementation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Backend Infrastructure:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Complete API routes in /api/coach-match-integration</li>
                  <li>• Storage methods for assessments and points</li>
                  <li>• Real-time assessment capture and calculation</li>
                  <li>• Transparent points breakdown generation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Frontend Features:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• CoachAssessmentCapture component</li>
                  <li>• 4-dimensional PCP evaluation interface</li>
                  <li>• Real-time coaching multiplier calculation</li>
                  <li>• Complete navigation flow integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachWorkflowGuidePage;