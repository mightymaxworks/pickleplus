/**
 * PKL-278651-COACHING-WORKFLOW-DASHBOARD
 * Coaching Workflow Dashboard Component
 * 
 * Mobile-optimized primary entry point for the complete coaching workflow.
 * Provides clear status-driven navigation based on current user state and role.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-12
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  Eye, 
  MessageSquare, 
  ArrowRight,
  Users,
  Calendar,
  TrendingUp,
  Bell,
  Zap
} from 'lucide-react';
import { useNavigate } from 'wouter';

interface CoachingWorkflowDashboardProps {
  userRole: 'player' | 'coach' | 'both';
  userId: number;
}

export function CoachingWorkflowDashboard({ userRole, userId }: CoachingWorkflowDashboardProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'player' | 'coach'>(
    userRole === 'both' ? 'player' : userRole
  );

  // Fetch user's coaching workflow status
  const { data: workflowStatus } = useQuery({
    queryKey: ['/api/coaching/workflow-status', userId],
    staleTime: 30000, // 30 seconds
  });

  // Mock data for demonstration - replace with real API data
  const mockStatus = {
    player: {
      hasCoach: false,
      pendingRequests: 1,
      upcomingSessions: 1,
      completedSessions: 2,
      newFeedback: 1,
      currentStep: 'session_scheduled', // none, browsing, request_pending, session_scheduled, feedback_available
      nextAction: 'Join your session with Coach Max tomorrow at 3:00 PM',
      urgentCount: 1
    },
    coach: {
      pendingRequests: 2,
      todaySessions: 1,
      studentsNeedingFeedback: 1,
      activeStudents: 5,
      currentStep: 'pending_requests', // none, pending_requests, session_today, needs_assessment
      nextAction: 'Review 2 new session requests from students',
      urgentCount: 2
    }
  };

  const status = workflowStatus || mockStatus;

  const PlayerDashboard = () => (
    <div className="space-y-4">
      {/* Primary Action Card */}
      <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-blue-900">
              Your Coaching Journey
            </CardTitle>
            {status.player.urgentCount > 0 && (
              <Badge className="bg-red-500 text-white flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {status.player.urgentCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-2">Next Action:</p>
            <p className="font-medium text-blue-900">{status.player.nextAction}</p>
          </div>
          
          {status.player.currentStep === 'none' && (
            <Button 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/coaches')}
            >
              <Search className="h-5 w-5 mr-2" />
              Find Your Coach
            </Button>
          )}
          
          {status.player.currentStep === 'session_scheduled' && (
            <Button 
              size="lg" 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/sessions/upcoming')}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Join Upcoming Session
            </Button>
          )}
          
          {status.player.currentStep === 'feedback_available' && (
            <Button 
              size="lg" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/feedback/latest')}
            >
              <Eye className="h-5 w-5 mr-2" />
              View Your Assessment Results
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{status.player.completedSessions}</div>
            <div className="text-xs text-gray-600">Sessions Completed</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-xs"
              onClick={() => navigate('/sessions/history')}
            >
              View History
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{status.player.newFeedback}</div>
            <div className="text-xs text-gray-600">New Feedback</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-xs"
              onClick={() => navigate('/feedback')}
            >
              View All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/coaches')}
          >
            <Search className="h-4 w-4 mr-2" />
            Browse All Coaches
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/sessions/request')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Request New Session
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/progress')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View My Progress
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const CoachDashboard = () => (
    <div className="space-y-4">
      {/* Primary Action Card */}
      <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-green-900">
              Coach Dashboard
            </CardTitle>
            {status.coach.urgentCount > 0 && (
              <Badge className="bg-red-500 text-white flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {status.coach.urgentCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 mb-2">Next Action:</p>
            <p className="font-medium text-green-900">{status.coach.nextAction}</p>
          </div>
          
          {status.coach.currentStep === 'pending_requests' && (
            <Button 
              size="lg" 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/coach/requests')}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Review Student Requests ({status.coach.pendingRequests})
            </Button>
          )}
          
          {status.coach.currentStep === 'session_today' && (
            <Button 
              size="lg" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/coach/assessment-tool')}
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Assessment Tool
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{status.coach.activeStudents}</div>
            <div className="text-xs text-gray-600">Active Students</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-xs"
              onClick={() => navigate('/coach/students')}
            >
              Manage
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{status.coach.todaySessions}</div>
            <div className="text-xs text-gray-600">Today's Sessions</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-xs"
              onClick={() => navigate('/coach/sessions/today')}
            >
              View Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Coach Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/coach/assessment-tool')}
          >
            <Zap className="h-4 w-4 mr-2" />
            PCP Assessment Tool
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/coach/students')}
          >
            <Users className="h-4 w-4 mr-2" />
            My Students
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/coach/schedule')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            My Schedule
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Role Toggle for dual-role users */}
      {userRole === 'both' && (
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={currentView === 'player' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setCurrentView('player')}
          >
            Player View
          </Button>
          <Button
            variant={currentView === 'coach' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setCurrentView('coach')}
          >
            Coach View
          </Button>
        </div>
      )}

      {/* Workflow Progress Indicator */}
      <Card className="bg-gray-50">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Workflow Status:</span>
            <Badge variant="outline" className="bg-white">
              {currentView === 'player' ? 
                status.player.currentStep.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                status.coach.currentStep.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
              }
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      {currentView === 'player' ? <PlayerDashboard /> : <CoachDashboard />}

      {/* Demo Link */}
      <Card className="border-dashed border-purple-300 bg-purple-50">
        <CardContent className="p-3 text-center">
          <p className="text-sm text-purple-700 mb-2">Want to see the complete workflow?</p>
          <Button 
            variant="outline" 
            size="sm"
            className="border-purple-300 text-purple-700"
            onClick={() => navigate('/complete-flow-demo')}
          >
            View Complete Flow Demo <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}