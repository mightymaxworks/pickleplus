/**
 * Coach Students Management Page
 * Allows coaches to view and manage their active students
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Eye,
  Plus,
  Clock,
  Target
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function CoachStudentsPage() {
  const [, setLocation] = useLocation();

  // Fetch coach's students
  const { data: students, isLoading } = useQuery({
    queryKey: ['/api/coach/students'],
    staleTime: 30000,
  });

  // Mock data for demonstration
  const mockStudents = [
    {
      id: 1,
      name: 'Sarah Johnson',
      level: '3.5',
      avatar: '/uploads/profiles/avatar-1-1748944092712.jpg',
      sessionsCompleted: 8,
      upcomingSessions: 2,
      lastSession: '2025-07-10',
      nextSession: '2025-07-14 15:00',
      progress: 78,
      goals: 3,
      status: 'active',
      improvements: ['Serve consistency', 'Net play positioning']
    },
    {
      id: 2,
      name: 'Mike Chen',
      level: '4.0',
      avatar: null,
      sessionsCompleted: 12,
      upcomingSessions: 1,
      lastSession: '2025-07-11',
      nextSession: '2025-07-15 10:00',
      progress: 85,
      goals: 2,
      status: 'active',
      improvements: ['Backhand power', 'Court positioning']
    },
    {
      id: 3,
      name: 'Emma Wilson',
      level: '3.0',
      avatar: null,
      sessionsCompleted: 4,
      upcomingSessions: 1,
      nextSession: '2025-07-16 14:00',
      lastSession: '2025-07-09',
      progress: 45,
      goals: 4,
      status: 'new',
      improvements: ['Basic stroke mechanics', 'Game understanding']
    }
  ];

  const activeStudents = mockStudents || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600">Manage your active coaching relationships</p>
        </div>
        <Button onClick={() => setLocation('/coach/requests')}>
          <Plus className="h-4 w-4 mr-2" />
          Review New Requests
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeStudents.length}</div>
            <div className="text-sm text-gray-600">Active Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {activeStudents.reduce((sum, s) => sum + s.upcomingSessions, 0)}
            </div>
            <div className="text-sm text-gray-600">Upcoming Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {activeStudents.reduce((sum, s) => sum + s.sessionsCompleted, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(activeStudents.reduce((sum, s) => sum + s.progress, 0) / activeStudents.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {activeStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Student Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {student.avatar ? (
                      <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <Users className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <Badge variant={student.status === 'new' ? 'default' : 'secondary'}>
                        Level {student.level}
                      </Badge>
                      {student.status === 'new' && (
                        <Badge className="bg-green-100 text-green-800">New Student</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.sessionsCompleted} sessions completed • {student.goals} active goals
                    </div>
                  </div>
                </div>

                {/* Progress & Stats */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Progress</div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{student.progress}%</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600">Next Session</div>
                    <div className="text-sm font-medium">
                      {student.nextSession ? (
                        <>
                          {new Date(student.nextSession).toLocaleDateString()} at{' '}
                          {new Date(student.nextSession).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : (
                        'Not scheduled'
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setLocation(`/coach/assessment-tool?student=${student.id}`)}
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Assess
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setLocation(`/coach/student/${student.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setLocation(`/sessions/schedule?student=${student.id}`)}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>

              {/* Recent Improvements */}
              {student.improvements.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">Recent Focus Areas:</div>
                  <div className="flex flex-wrap gap-2">
                    {student.improvements.map((improvement, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {improvement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {activeStudents.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Students</h3>
              <p className="text-gray-600 mb-4">
                You don't have any active students yet. Students can discover and request sessions with you.
              </p>
              <Button onClick={() => setLocation('/coach/requests')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Check for New Requests
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}