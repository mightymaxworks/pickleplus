/**
 * Session Booking Page - PKL-278651-SESSION-BOOKING
 * Complete session booking interface for students and coaches
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, DollarSign, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SessionRequest {
  id: number;
  coachId: number;
  studentId: number;
  sessionType: string;
  preferredDate: string;
  preferredTime: string;
  durationMinutes: number;
  locationType: string;
  locationDetails?: string;
  specialRequests?: string;
  maxPrice?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  coachResponse?: string;
  proposedPrice?: number;
  requestedAt: string;
  coach?: {
    id: number;
    firstName: string;
    lastName: string;
    specializations: string[];
    hourlyRate: number;
  };
  student?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const SessionBookingPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'book' | 'requests' | 'sessions'>('book');
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
  const [bookingData, setBookingData] = useState({
    sessionType: '',
    preferredDate: '',
    preferredTime: '',
    durationMinutes: 60,
    locationType: 'online',
    locationDetails: '',
    specialRequests: '',
    maxPrice: 95
  });

  // Fetch available coaches
  const { data: coaches, isLoading: coachesLoading } = useQuery({
    queryKey: ['/api/coaches/available'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/coaches/available');
      return response.json();
    }
  });

  // Fetch user's session requests
  const { data: sessionRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/session-booking/student/requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/session-booking/student/requests');
      return response.json();
    }
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/session-booking/upcoming'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/session-booking/upcoming');
      return response.json();
    }
  });

  // Create session request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/session-booking/request', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/session-booking/student/requests'] });
      toast({
        title: "Session Request Sent",
        description: "Your coach will respond within 24 hours."
      });
      setBookingData({
        sessionType: '',
        preferredDate: '',
        preferredTime: '',
        durationMinutes: 60,
        locationType: 'online',
        locationDetails: '',
        specialRequests: '',
        maxPrice: 95
      });
      setSelectedCoach(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Cancel session mutation
  const cancelSessionMutation = useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: number; reason: string }) => {
      const response = await apiRequest('PATCH', `/api/session-booking/session/${sessionId}/cancel`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/session-booking/upcoming'] });
      toast({
        title: "Session Cancelled",
        description: "The session has been cancelled successfully."
      });
    }
  });

  const handleBookSession = () => {
    if (!selectedCoach || !bookingData.sessionType || !bookingData.preferredDate || !bookingData.preferredTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    createRequestMutation.mutate({
      coachId: selectedCoach,
      ...bookingData
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Session Booking</h1>
        <p className="text-gray-600">Book coaching sessions with certified PCP coaches</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'book' ? 'default' : 'outline'}
          onClick={() => setActiveTab('book')}
        >
          Book Session
        </Button>
        <Button
          variant={activeTab === 'requests' ? 'default' : 'outline'}
          onClick={() => setActiveTab('requests')}
        >
          My Requests
        </Button>
        <Button
          variant={activeTab === 'sessions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sessions')}
        >
          Upcoming Sessions
        </Button>
      </div>

      {/* Book Session Tab */}
      {activeTab === 'book' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coach Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Coach</CardTitle>
              <CardDescription>Choose from our certified PCP coaches</CardDescription>
            </CardHeader>
            <CardContent>
              {coachesLoading ? (
                <div className="text-center py-4">Loading coaches...</div>
              ) : (
                <div className="space-y-3">
                  {coaches?.map((coach: any) => (
                    <div
                      key={coach.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCoach === coach.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCoach(coach.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{coach.firstName} {coach.lastName}</h4>
                          <p className="text-sm text-gray-600">PCP Level {coach.pcpLevel || 1}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {coach.specializations?.slice(0, 2).map((spec: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{spec}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${coach.hourlyRate || 95}/hr</p>
                          <p className="text-xs text-gray-600">⭐ {coach.rating || '4.8'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Specify your session preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Session Type</label>
                <Select value={bookingData.sessionType} onValueChange={(value) => setBookingData({...bookingData, sessionType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Coaching</SelectItem>
                    <SelectItem value="technique">Technique Focus</SelectItem>
                    <SelectItem value="strategy">Strategy Session</SelectItem>
                    <SelectItem value="assessment">Skills Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Date</label>
                  <Input
                    type="date"
                    value={bookingData.preferredDate}
                    onChange={(e) => setBookingData({...bookingData, preferredDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Time</label>
                  <Input
                    type="time"
                    value={bookingData.preferredTime}
                    onChange={(e) => setBookingData({...bookingData, preferredTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <Select value={bookingData.durationMinutes.toString()} onValueChange={(value) => setBookingData({...bookingData, durationMinutes: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location Type</label>
                <Select value={bookingData.locationType} onValueChange={(value) => setBookingData({...bookingData, locationType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Session</SelectItem>
                    <SelectItem value="coach_location">Coach's Location</SelectItem>
                    <SelectItem value="student_location">My Location</SelectItem>
                    <SelectItem value="neutral">Neutral Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Special Requests</label>
                <Textarea
                  placeholder="Any specific focus areas or requirements..."
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                />
              </div>

              <Button
                onClick={handleBookSession}
                disabled={createRequestMutation.isPending}
                className="w-full"
              >
                {createRequestMutation.isPending ? 'Sending Request...' : 'Send Session Request'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requestsLoading ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : sessionRequests?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No session requests found.</p>
                <Button onClick={() => setActiveTab('book')} className="mt-4">
                  Book Your First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            sessionRequests?.map((request: SessionRequest) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {request.sessionType} Session
                    </CardTitle>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    Requested on {new Date(request.requestedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Coach: {request.coach?.firstName} {request.coach?.lastName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{request.preferredDate}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{request.preferredTime} ({request.durationMinutes}min)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="capitalize">{request.locationType.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  {request.coachResponse && (
                    <Alert className="mt-4">
                      <AlertDescription>
                        <strong>Coach Response:</strong> {request.coachResponse}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessionsLoading ? (
            <div className="text-center py-8">Loading sessions...</div>
          ) : upcomingSessions?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No upcoming sessions.</p>
              </CardContent>
            </Card>
          ) : (
            upcomingSessions?.map((session: any) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {session.sessionType} Session
                    </CardTitle>
                    <Badge className={getStatusColor(session.sessionStatus)}>
                      {getStatusIcon(session.sessionStatus)}
                      <span className="ml-1 capitalize">{session.sessionStatus}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Coach: {session.coach?.firstName} {session.coach?.lastName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{new Date(session.scheduledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{new Date(session.scheduledAt).toLocaleTimeString()} ({session.durationMinutes}min)</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      <span>${session.priceAmount}</span>
                    </div>
                  </div>
                  
                  {session.sessionStatus === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelSessionMutation.mutate({ sessionId: session.id, reason: 'Cancelled by student' })}
                      disabled={cancelSessionMutation.isPending}
                    >
                      Cancel Session
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SessionBookingPage;