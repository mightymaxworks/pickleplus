/**
 * PKL-278651-SESSION-MGMT - Session Management Dashboard
 * 
 * Complete session management interface for coaches and players
 * Handles pending requests, upcoming sessions, and session history
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-04
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Settings,
  Star,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionRequest {
  id: number;
  playerId: number;
  coachId: number;
  requestType: string;
  preferredSchedule: Array<{ day: string; time: string }>;
  message: string;
  requestStatus: string;
  createdAt: string;
  playerName: string;
  playerUsername: string;
  playerLevel: number;
}

interface Session {
  id: number;
  coachId: number;
  studentId: number;
  sessionType: string;
  sessionStatus: string;
  scheduledAt: string;
  durationMinutes: number;
  locationType: string;
  locationDetails: string;
  priceAmount: string;
  currency: string;
  paymentStatus: string;
  coachName: string;
  coachUsername: string;
  studentName: string;
  studentUsername: string;
  studentLevel: number;
  sessionNotes?: string;
  feedbackForStudent?: string;
}

export default function SessionManagementDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<SessionRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [sessionDetails, setSessionDetails] = useState({
    scheduledAt: '',
    durationMinutes: 60,
    locationType: 'court',
    locationDetails: '',
    priceAmount: '60.00'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending session requests
  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/sessions/requests/pending'],
    retry: false
  });

  // Fetch upcoming sessions
  const { data: upcomingSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/sessions/upcoming'],
    retry: false
  });

  // Fetch session history
  const { data: sessionHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/sessions/history'],
    retry: false
  });

  // Mutation for responding to session requests
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, responseMessage, sessionDetails }: {
      requestId: number;
      action: 'accept' | 'decline';
      responseMessage: string;
      sessionDetails?: any;
    }) => {
      const response = await fetch(`/api/sessions/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, responseMessage, sessionDetails }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to respond to request');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request Response Sent",
        description: `Session request ${data.response.action}ed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/requests/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions/upcoming'] });
      setSelectedRequest(null);
      setResponseMessage('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to respond to session request",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatSessionType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAcceptRequest = (request: SessionRequest) => {
    const sessionData = {
      ...sessionDetails,
      playerId: request.playerId,
      sessionType: request.requestType,
      scheduledAt: sessionDetails.scheduledAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    respondToRequestMutation.mutate({
      requestId: request.id,
      action: 'accept',
      responseMessage,
      sessionDetails: sessionData
    });
  };

  const handleDeclineRequest = (request: SessionRequest) => {
    respondToRequestMutation.mutate({
      requestId: request.id,
      action: 'decline',
      responseMessage
    });
  };

  if (requestsLoading || sessionsLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">Manage your coaching sessions and requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50">
            {pendingRequests?.totalPending || 0} Pending
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            {upcomingSessions?.totalUpcoming || 0} Upcoming
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Pending Requests
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Sessions
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Session History
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Pending Session Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests?.requests?.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.requests.map((request: SessionRequest) => (
                    <Card key={request.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {request.playerName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{request.playerName}</h4>
                              <p className="text-sm text-muted-foreground">
                                Level {request.playerLevel} • {formatSessionType(request.requestType)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Requested {formatDate(request.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Session Request from {request.playerName}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">Message</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {request.message || 'No message provided'}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Preferred Schedule</Label>
                                    <div className="mt-1 space-y-1">
                                      {request.preferredSchedule.map((slot, index) => (
                                        <p key={index} className="text-sm text-muted-foreground">
                                          {slot.day} at {slot.time}
                                        </p>
                                      ))}
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className="space-y-3">
                                    <Label className="text-sm font-medium">Response Message</Label>
                                    <Textarea
                                      placeholder="Add a personal message..."
                                      value={responseMessage}
                                      onChange={(e) => setResponseMessage(e.target.value)}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-sm font-medium">Duration (min)</Label>
                                      <Input
                                        type="number"
                                        value={sessionDetails.durationMinutes}
                                        onChange={(e) => setSessionDetails(prev => ({
                                          ...prev,
                                          durationMinutes: Number(e.target.value)
                                        }))}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Price ($)</Label>
                                      <Input
                                        value={sessionDetails.priceAmount}
                                        onChange={(e) => setSessionDetails(prev => ({
                                          ...prev,
                                          priceAmount: e.target.value
                                        }))}
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Location Details</Label>
                                    <Input
                                      placeholder="Court location, address, etc."
                                      value={sessionDetails.locationDetails}
                                      onChange={(e) => setSessionDetails(prev => ({
                                        ...prev,
                                        locationDetails: e.target.value
                                      }))}
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Scheduled Date & Time</Label>
                                    <Input
                                      type="datetime-local"
                                      value={sessionDetails.scheduledAt}
                                      onChange={(e) => setSessionDetails(prev => ({
                                        ...prev,
                                        scheduledAt: e.target.value
                                      }))}
                                    />
                                  </div>

                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      onClick={() => selectedRequest && handleAcceptRequest(selectedRequest)}
                                      className="flex-1"
                                      disabled={respondToRequestMutation.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Accept & Schedule
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => selectedRequest && handleDeclineRequest(selectedRequest)}
                                      disabled={respondToRequestMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        
                        {request.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm">{request.message}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900">No pending requests</h3>
                  <p className="text-gray-500">New session requests will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Sessions Tab */}
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions?.sessions?.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.sessions.map((session: Session) => (
                    <Card key={session.id} className="border-l-4 border-l-blue-400">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {session.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{session.studentName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatSessionType(session.sessionType)} • {session.durationMinutes} min
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(session.scheduledAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.locationDetails || 'TBD'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${session.priceAmount}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(session.sessionStatus)}>
                              {session.sessionStatus}
                            </Badge>
                            <Badge className={session.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {session.paymentStatus}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900">No upcoming sessions</h3>
                  <p className="text-gray-500">Scheduled sessions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionHistory?.sessions?.length > 0 ? (
                <div className="space-y-4">
                  {sessionHistory.sessions.map((session: Session) => (
                    <Card key={session.id} className="border-l-4 border-l-gray-400">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {session.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{session.studentName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatSessionType(session.sessionType)} • {formatDate(session.scheduledAt)}
                              </p>
                              {session.sessionNotes && (
                                <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                                  <strong>Notes:</strong> {session.sessionNotes}
                                </p>
                              )}
                              {session.feedbackForStudent && (
                                <p className="text-sm mt-1 p-2 bg-blue-50 rounded">
                                  <strong>Feedback:</strong> {session.feedbackForStudent}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(session.sessionStatus)}>
                              {session.sessionStatus}
                            </Badge>
                            <span className="text-sm font-medium">${session.priceAmount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900">No session history</h3>
                  <p className="text-gray-500">Completed sessions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}