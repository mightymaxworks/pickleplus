/**
 * PKL-278651-COMPLETE-FLOW-DEMO - Complete Coach-Student Flow Demo
 * 
 * Comprehensive demonstration of the entire coach-student relationship journey:
 * 1. Coach Discovery → Finding the right coach
 * 2. Session Request → Player initiates contact
 * 3. Coach Review → Coach evaluates and accepts/declines
 * 4. Session Scheduling → Automatic scheduling when accepted
 * 5. Session Completion → Coach provides assessment and feedback
 * 6. Student Feedback Access → Student views their progress and feedback
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-12
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight,
  MessageSquare,
  Star,
  UserCheck,
  ClipboardCheck,
  Target,
  TrendingUp,
  BookOpen,
  Eye
} from 'lucide-react';

import { StandardLayout } from '@/components/layout/StandardLayout';

// Mock data for demonstration
const mockCoachProfiles = [
  {
    id: 1,
    name: 'Coach Max Williams',
    username: 'mightymax',
    level: 5.0,
    specialties: ['Technical Skills', 'Tournament Prep', 'Mental Game'],
    rating: 4.9,
    experience: '8+ years',
    hourlyRate: '$60-80',
    bio: 'Former professional player with expertise in developing players from 2.0 to 4.5+ levels.',
    profileImage: '/uploads/profiles/avatar-1-1748944092712.jpg'
  },
  {
    id: 2,
    name: 'Coach Sarah Chen',
    username: 'sarahcoach',
    level: 4.8,
    specialties: ['Beginner Fundamentals', 'Strategy', 'Doubles Play'],
    rating: 4.8,
    experience: '5+ years',
    hourlyRate: '$45-65',
    bio: 'Certified instructor specializing in beginner development and doubles strategy.',
    profileImage: null
  }
];

const mockSessionRequest = {
  id: 5001,
  playerId: 2,
  coachId: 1,
  requestType: 'assessment',
  preferredSchedule: [
    '2025-07-15T14:00:00Z',
    '2025-07-16T10:00:00Z',
    '2025-07-17T16:00:00Z'
  ],
  message: 'Hi Coach Max! I\'d love to get a comprehensive skill assessment to understand my current level and create a development plan. I\'m available weekday afternoons.',
  requestStatus: 'pending',
  createdAt: new Date().toISOString(),
  playerName: 'Sarah Chen',
  playerLevel: 3.5
};

const mockScheduledSession = {
  id: 7001,
  coachId: 1,
  studentId: 2,
  sessionType: 'assessment',
  sessionStatus: 'confirmed',
  scheduledAt: '2025-07-16T10:00:00Z',
  durationMinutes: 90,
  locationType: 'court',
  locationDetails: 'Central Park Pickleball Courts - Court 3',
  priceAmount: '75.00',
  currency: 'USD',
  paymentStatus: 'paid',
  coachName: 'Coach Max',
  studentName: 'Sarah Chen',
  studentLevel: 3.5
};

const mockCompletedSession = {
  id: 7001,
  sessionStatus: 'completed',
  sessionNotes: 'Comprehensive skill assessment completed. Sarah shows strong potential with excellent court awareness and good fundamental stroke mechanics.',
  feedbackForStudent: `Great session today, Sarah! Here's your comprehensive assessment:

**Technical Skills (Rating: 3.2/5.0)**
- Forehand: Solid mechanics, good consistency
- Backhand: Needs work on preparation and follow-through
- Serve: Good power, work on placement accuracy
- Volley: Strong at net, improve reaction time

**Tactical Skills (Rating: 3.5/5.0)**
- Court positioning: Excellent awareness
- Shot selection: Good decision making under pressure
- Strategy: Understands doubles play well

**Physical Skills (Rating: 3.0/5.0)**
- Movement: Good lateral movement, improve forward/back transitions
- Endurance: Good stamina for recreational play
- Balance: Solid foundation

**Mental Skills (Rating: 3.8/5.0)**
- Focus: Excellent concentration during rallies
- Confidence: Good self-belief, room to grow
- Adaptability: Quick to adjust to different opponents

**Priority Areas for Development:**
1. Backhand preparation and consistency
2. Serve placement accuracy
3. Net approach footwork
4. Transition shot selection

**Recommended Training Plan:**
- Weekly technical sessions focusing on backhand mechanics
- Drill work on serve placement
- Live ball practice for transition shots
- Match play to build confidence

You have excellent potential to reach 4.0+ level with focused practice. I recommend 2 sessions per month plus regular drill practice.`,
  sessionSummary: 'Initial comprehensive assessment revealing strong foundation with clear development pathway to 4.0+ level.',
  studentProgress: {
    currentLevel: 3.2,
    targetLevel: 4.0,
    areasOfStrength: ['Court Awareness', 'Mental Game', 'Doubles Strategy'],
    areasForImprovement: ['Backhand Consistency', 'Serve Placement', 'Net Approach'],
    nextSessionGoals: ['Backhand Mechanics', 'Serve Practice', 'Transition Drills']
  },
  completedAt: new Date().toISOString()
};

export default function CompleteFlowDemoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);

  const steps = [
    { id: 1, title: 'Coach Discovery', description: 'Player searches and finds coaches', icon: Search },
    { id: 2, title: 'Session Request', description: 'Player requests session with coach', icon: Calendar },
    { id: 3, title: 'Coach Review', description: 'Coach reviews and responds to request', icon: UserCheck },
    { id: 4, title: 'Session Scheduling', description: 'Session automatically scheduled when accepted', icon: Clock },
    { id: 5, title: 'Session Completion', description: 'Coach conducts session and provides assessment', icon: ClipboardCheck },
    { id: 6, title: 'Student Feedback', description: 'Student accesses their feedback and progress', icon: BookOpen }
  ];

  return (
    <StandardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Hero Section */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Target className="h-8 w-8 text-purple-600" />
              Complete Coach-Student Flow
              <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                End-to-End Demonstration
              </Badge>
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              Complete journey from coach discovery to student feedback access - the entire coaching ecosystem in action
            </p>
          </CardHeader>
        </Card>

        {/* Flow Steps Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Flow Steps</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click on any step to jump to that part of the workflow
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : isCompleted
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-2 rounded-full ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(Number(value))}>
          {/* Step 1: Coach Discovery */}
          <TabsContent value="1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Step 1: Coach Discovery
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Players browse available coaches and view their profiles, specialties, and ratings
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockCoachProfiles.map((coach) => (
                    <div
                      key={coach.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedCoach?.id === coach.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCoach(coach)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          {coach.profileImage ? (
                            <img src={coach.profileImage} alt={coach.name} className="w-16 h-16 rounded-full object-cover" />
                          ) : (
                            <Users className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{coach.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">Level {coach.level}</Badge>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm ml-1">{coach.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{coach.bio}</p>
                          <div className="mt-2">
                            <p className="text-sm"><strong>Experience:</strong> {coach.experience}</p>
                            <p className="text-sm"><strong>Rate:</strong> {coach.hourlyRate}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {coach.specialties.map((specialty) => (
                                <Badge key={specialty} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setCurrentStep(2)} 
                    disabled={!selectedCoach}
                    className="flex items-center gap-2"
                  >
                    Request Session <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Session Request */}
          <TabsContent value="2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Step 2: Session Request
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Player creates a session request with preferred schedule and specific goals
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCoach && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800">Requesting Session With:</h3>
                    <p className="text-blue-700">{selectedCoach.name} ({selectedCoach.username})</p>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Session Request Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Session Type</label>
                      <Badge className="bg-purple-100 text-purple-800">{mockSessionRequest.requestType}</Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Preferred Schedule</label>
                      <div className="space-y-1">
                        {mockSessionRequest.preferredSchedule.map((time, index) => (
                          <Badge key={index} variant="outline" className="mr-2">
                            {new Date(time).toLocaleDateString()} at {new Date(time).toLocaleTimeString()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Message to Coach</label>
                      <p className="text-sm bg-white p-3 rounded border">{mockSessionRequest.message}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Request Sent Successfully!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Coach {selectedCoach?.name} will review your request and respond within 24 hours.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back to Discovery
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex items-center gap-2">
                    View Coach Review <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Coach Review */}
          <TabsContent value="3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                  Step 3: Coach Review & Response
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Coach reviews the session request and decides to accept or decline
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Pending Request Review</h4>
                  <div className="space-y-2">
                    <p><strong>From:</strong> {mockSessionRequest.playerName}</p>
                    <p><strong>Type:</strong> {mockSessionRequest.requestType}</p>
                    <p><strong>Message:</strong> {mockSessionRequest.message}</p>
                    <p><strong>Preferred Times:</strong></p>
                    <div className="ml-4">
                      {mockSessionRequest.preferredSchedule.map((time, index) => (
                        <div key={index} className="text-sm">
                          • {new Date(time).toLocaleDateString()} at {new Date(time).toLocaleTimeString()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h5 className="font-semibold text-red-800 mb-2">Option 1: Decline</h5>
                    <p className="text-sm text-red-700 mb-3">
                      Coach can decline if schedule doesn't work or if not the right fit.
                    </p>
                    <Button variant="outline" className="w-full text-red-600 border-red-300">
                      Decline Request
                    </Button>
                  </div>
                  
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h5 className="font-semibold text-green-800 mb-2">Option 2: Accept</h5>
                    <p className="text-sm text-green-700 mb-3">
                      Coach accepts and session gets automatically scheduled.
                    </p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Accept & Schedule
                    </Button>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Request Accepted!</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Session automatically scheduled for July 16, 2025 at 10:00 AM
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back to Request
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} className="flex items-center gap-2">
                    View Scheduled Session <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Session Scheduling */}
          <TabsContent value="4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Step 4: Session Scheduling
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Session automatically scheduled when coach accepts the request
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">📅 Session Confirmed</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Date & Time</label>
                        <p className="text-blue-900">
                          {new Date(mockScheduledSession.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(mockScheduledSession.scheduledAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Duration</label>
                        <p className="text-blue-900">{mockScheduledSession.durationMinutes} minutes</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Session Type</label>
                        <Badge className="bg-purple-100 text-purple-800">{mockScheduledSession.sessionType}</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Location</label>
                        <p className="text-blue-900">{mockScheduledSession.locationDetails}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Price</label>
                        <p className="text-blue-900">${mockScheduledSession.priceAmount} {mockScheduledSession.currency}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Payment Status</label>
                        <Badge className="bg-green-100 text-green-800">{mockScheduledSession.paymentStatus}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2">Participants</h5>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <p><strong>Coach:</strong> {mockScheduledSession.coachName}</p>
                      </div>
                      <div className="text-sm">
                        <p><strong>Student:</strong> {mockScheduledSession.studentName} (Level {mockScheduledSession.studentLevel})</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">📧 Notifications Sent</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Calendar invite sent to both coach and student</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Email confirmation with location details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>24-hour reminder notifications scheduled</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back to Review
                  </Button>
                  <Button onClick={() => setCurrentStep(5)} className="flex items-center gap-2">
                    View Session Completion <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Session Completion */}
          <TabsContent value="5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                  Step 5: Session Completion & Assessment
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Coach conducts the session and provides comprehensive assessment and feedback
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Session Completed Successfully!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Assessment session completed on {new Date(mockCompletedSession.completedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* PCP Assessment Tool Integration */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    🏓 PCP 4-Dimensional Assessment Tool Used
                  </h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Coach Max used the integrated PCP assessment tool during the session to evaluate Sarah's performance across all four dimensions:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded border border-blue-200 text-center">
                      <div className="text-lg font-bold text-blue-600">3.2/5.0</div>
                      <div className="text-xs text-blue-700">Technical (40%)</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200 text-center">
                      <div className="text-lg font-bold text-purple-600">3.5/5.0</div>
                      <div className="text-xs text-purple-700">Tactical (25%)</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200 text-center">
                      <div className="text-lg font-bold text-orange-600">3.0/5.0</div>
                      <div className="text-xs text-orange-700">Physical (20%)</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-200 text-center">
                      <div className="text-lg font-bold text-green-600">3.8/5.0</div>
                      <div className="text-xs text-green-700">Mental (15%)</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-sm text-blue-700">
                      <strong>Overall PCP Rating:</strong> <span className="font-bold">3.3/5.0</span>
                    </div>
                  </div>
                </div>

                {/* Assessment Tool Workflow */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold mb-3">📋 Assessment Tool Workflow</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Coach accessed the PCP assessment tool during session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Real-time evaluation across 4 dimensions with weighted scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Automatic calculation of overall PCP rating and recommendations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Detailed feedback generated and saved to student's profile</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Coach's Session Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm">{mockCompletedSession.sessionNotes}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Student Progress Summary</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-blue-700">Current Level</label>
                          <Badge className="bg-blue-100 text-blue-800">
                            {mockCompletedSession.studentProgress.currentLevel}/5.0
                          </Badge>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700">Target Level</label>
                          <Badge className="bg-purple-100 text-purple-800">
                            {mockCompletedSession.studentProgress.targetLevel}/5.0
                          </Badge>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">Areas of Strength</label>
                          <div className="space-y-1">
                            {mockCompletedSession.studentProgress.areasOfStrength.map((area) => (
                              <Badge key={area} className="bg-green-100 text-green-800 mr-1 mb-1">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-1">Areas for Improvement</label>
                          <div className="space-y-1">
                            {mockCompletedSession.studentProgress.areasForImprovement.map((area) => (
                              <Badge key={area} className="bg-orange-100 text-orange-800 mr-1 mb-1">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Comprehensive Assessment Feedback</h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm whitespace-pre-wrap">{mockCompletedSession.feedbackForStudent}</div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-800 mb-2">🚀 Next Steps Generated</h5>
                  <div className="space-y-2 text-sm text-purple-700">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Personalized training plan created based on assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Follow-up session recommendations generated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Drill library access provided for independent practice</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(4)}>
                    Back to Scheduling
                  </Button>
                  <Button onClick={() => setCurrentStep(6)} className="flex items-center gap-2">
                    View Student Feedback Access <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 6: Student Feedback Access */}
          <TabsContent value="6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-indigo-600" />
                  Step 6: Student Feedback Access
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Student can access their assessment feedback, progress tracking, and development recommendations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2">🎯 Your Personal Development Dashboard</h4>
                  <p className="text-indigo-700 text-sm">
                    All your assessment feedback and progress tracking is now available in your personal player dashboard.
                  </p>
                </div>

                <Tabs defaultValue="feedback" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="feedback">Assessment Feedback</TabsTrigger>
                    <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="feedback" className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                        🏓 Your PCP Assessment Results
                      </h5>
                      <p className="text-blue-700 text-sm mb-3">
                        Your coach used the PCP 4-dimensional assessment tool to evaluate your skills. Here are your detailed results:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-white p-3 rounded border border-blue-200 text-center">
                          <div className="text-lg font-bold text-blue-600">3.2/5.0</div>
                          <div className="text-xs text-blue-700">Technical (40%)</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-blue-200 text-center">
                          <div className="text-lg font-bold text-purple-600">3.5/5.0</div>
                          <div className="text-xs text-purple-700">Tactical (25%)</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-blue-200 text-center">
                          <div className="text-lg font-bold text-orange-600">3.0/5.0</div>
                          <div className="text-xs text-orange-700">Physical (20%)</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-blue-200 text-center">
                          <div className="text-lg font-bold text-green-600">3.8/5.0</div>
                          <div className="text-xs text-green-700">Mental (15%)</div>
                        </div>
                      </div>
                      <div className="text-center bg-white p-3 rounded border border-blue-200">
                        <div className="text-sm text-blue-700">
                          <strong>Your Overall PCP Rating:</strong> <span className="text-lg font-bold">3.3/5.0</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        Coach's Detailed Feedback
                      </h5>
                      <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                        {mockCompletedSession.feedbackForStudent}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="progress" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          Current Skill Levels
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Technical Skills</span>
                            <Badge className="bg-blue-100 text-blue-800">3.2/5.0</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Tactical Skills</span>
                            <Badge className="bg-blue-100 text-blue-800">3.5/5.0</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Physical Skills</span>
                            <Badge className="bg-blue-100 text-blue-800">3.0/5.0</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Mental Skills</span>
                            <Badge className="bg-blue-100 text-blue-800">3.8/5.0</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          Development Targets
                        </h5>
                        <div className="space-y-2">
                          <div className="p-2 bg-orange-50 rounded text-sm">
                            <strong>Priority:</strong> Backhand Consistency
                          </div>
                          <div className="p-2 bg-orange-50 rounded text-sm">
                            <strong>Next:</strong> Serve Placement
                          </div>
                          <div className="p-2 bg-orange-50 rounded text-sm">
                            <strong>Focus:</strong> Net Approach
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recommendations" className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />
                        Personalized Training Plan
                      </h5>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h6 className="font-semibold text-blue-800">Weekly Sessions</h6>
                          <p className="text-sm text-blue-700">2 technical sessions per month focusing on backhand mechanics</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h6 className="font-semibold text-green-800">Independent Practice</h6>
                          <p className="text-sm text-green-700">Daily drill work on serve placement and consistency</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h6 className="font-semibold text-purple-800">Match Play</h6>
                          <p className="text-sm text-purple-700">Weekly competitive play to build confidence and apply skills</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h5 className="font-semibold text-yellow-800 mb-2">🎯 Goal Timeline</h5>
                      <p className="text-sm text-yellow-700 mb-2">
                        <strong>3-Month Target:</strong> Achieve 3.5 overall rating
                      </p>
                      <p className="text-sm text-yellow-700">
                        <strong>6-Month Target:</strong> Reach 4.0 level and tournament readiness
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    🔄 Assessment Tool Integration Flow
                  </h5>
                  <div className="space-y-2 text-sm text-purple-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Coach uses PCP assessment tool during session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Assessment data automatically saved to student profile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Student can access their assessment results anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Progress tracking and development recommendations generated</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                  <h4 className="font-semibold text-center mb-4">🎉 Complete Coach-Student Ecosystem with PCP Assessment Integration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-green-100 rounded-full mb-2">
                        <Search className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="font-semibold text-green-800">Discovered</p>
                      <p className="text-sm text-green-700">Found the right coach</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-blue-100 rounded-full mb-2">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="font-semibold text-blue-800">Connected</p>
                      <p className="text-sm text-blue-700">Built coaching relationship</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-purple-100 rounded-full mb-2">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="font-semibold text-purple-800">Improved</p>
                      <p className="text-sm text-purple-700">Received personalized feedback</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(5)}>
                    Back to Completion
                  </Button>
                  <Button onClick={() => setCurrentStep(1)} className="flex items-center gap-2">
                    Start New Flow <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
}