/**
 * PKL-278651-FACILITY-MGMT-003 - Priority 2: Event Hosting System
 * Facility Event Management and Tournament Hosting
 * 
 * Allows facility managers to create, manage, and host tournaments and events
 * with integrated registration, payment processing, and revenue sharing
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Trophy,
  MapPin,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Star,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { format } from 'date-fns';

interface FacilityEvent {
  id: number;
  title: string;
  description: string;
  eventType: 'tournament' | 'clinic' | 'social' | 'league';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentRegistrations: number;
  entryFee: number;
  facilityCut: number;
  platformCut: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  skillLevel: string;
  ageGroup: string;
  format: string;
  prizes: {
    first: number;
    second: number;
    third: number;
  };
  organizer: {
    name: string;
    email: string;
    phone: string;
  };
  revenue: {
    totalRevenue: number;
    facilityShare: number;
    organizerShare: number;
    platformShare: number;
  };
}

interface EventRegistration {
  id: number;
  playerName: string;
  playerEmail: string;
  registrationDate: string;
  paymentStatus: 'pending' | 'completed' | 'refunded';
  skillLevel: string;
  emergencyContact: string;
}

export default function FacilityEvents() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('events');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<FacilityEvent | null>(null);
  const [createEventDialog, setCreateEventDialog] = useState(false);

  // Form state for creating new events
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'tournament',
    startDate: '',
    endDate: '',
    maxParticipants: 16,
    entryFee: 50,
    facilityCut: 30,
    skillLevel: 'Open',
    ageGroup: 'Adult',
    format: 'Singles'
  });

  // Get facility events  
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/facility-events/facilities/1/events', { status: filterStatus, type: filterType }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      
      // TODO: Get actual facility ID from context or route params
      const facilityId = 1; // Temporary hardcoded facility ID
      const response = await fetch(`/api/facility-events/facilities/${facilityId}/events?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      return response.json();
    }
  });

  // Get event analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/facility-events/analytics'],
    queryFn: async () => {
      const response = await fetch('/api/facility-events/analytics', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      return response.json();
    }
  });

  // Get event registrations
  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['/api/facility-events', selectedEvent?.id, 'registrations'],
    queryFn: async () => {
      if (!selectedEvent?.id) return [];
      
      const response = await fetch(`/api/facility-events/${selectedEvent.id}/registrations`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }
      
      return response.json();
    },
    enabled: !!selectedEvent?.id
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await fetch('/api/facility-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Event Created Successfully!',
        description: 'Your event has been created and is ready for registration.'
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/facility-events'] });
      setCreateEventDialog(false);
      setNewEvent({
        title: '',
        description: '',
        eventType: 'tournament',
        startDate: '',
        endDate: '',
        maxParticipants: 16,
        entryFee: 50,
        facilityCut: 30,
        skillLevel: 'Open',
        ageGroup: 'Adult',
        format: 'Singles'
      });
    },
    onError: () => {
      toast({
        title: 'Failed to Create Event',
        description: 'Please check your information and try again.',
        variant: 'destructive'
      });
    }
  });

  const handleCreateEvent = () => {
    createEventMutation.mutate(newEvent);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'gray' },
      published: { label: 'Open', color: 'green' },
      ongoing: { label: 'In Progress', color: 'blue' },
      completed: { label: 'Completed', color: 'purple' },
      cancelled: { label: 'Cancelled', color: 'red' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant="secondary" className={`bg-${config.color}-100 text-${config.color}-800`}>{config.label}</Badge>;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament': return <Trophy className="w-4 h-4" />;
      case 'clinic': return <Star className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'league': return <Calendar className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <StandardLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-gray-600">Create and manage tournaments, clinics, and events at your facility</p>
          </div>
          
          <Dialog open={createEventDialog} onOpenChange={setCreateEventDialog}>
            <DialogTrigger asChild>
              <Button data-testid="create-event-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g., Summer Singles Tournament"
                      data-testid="event-title-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={newEvent.eventType} onValueChange={(value) => setNewEvent({ ...newEvent, eventType: value })}>
                      <SelectTrigger data-testid="event-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tournament">Tournament</SelectItem>
                        <SelectItem value="clinic">Clinic</SelectItem>
                        <SelectItem value="social">Social Event</SelectItem>
                        <SelectItem value="league">League</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={3}
                    data-testid="event-description-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                      data-testid="event-start-date"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      data-testid="event-end-date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="4"
                      max="128"
                      value={newEvent.maxParticipants}
                      onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: parseInt(e.target.value) })}
                      data-testid="max-participants-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee ($)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      min="0"
                      step="5"
                      value={newEvent.entryFee}
                      onChange={(e) => setNewEvent({ ...newEvent, entryFee: parseFloat(e.target.value) })}
                      data-testid="entry-fee-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facilityCut">Facility Cut (%)</Label>
                    <Input
                      id="facilityCut"
                      type="number"
                      min="0"
                      max="50"
                      value={newEvent.facilityCut}
                      onChange={(e) => setNewEvent({ ...newEvent, facilityCut: parseInt(e.target.value) })}
                      data-testid="facility-cut-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skillLevel">Skill Level</Label>
                    <Select value={newEvent.skillLevel} onValueChange={(value) => setNewEvent({ ...newEvent, skillLevel: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ageGroup">Age Group</Label>
                    <Select value={newEvent.ageGroup} onValueChange={(value) => setNewEvent({ ...newEvent, ageGroup: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Youth">Youth (U18)</SelectItem>
                        <SelectItem value="Adult">Adult (18-49)</SelectItem>
                        <SelectItem value="Senior">Senior (50+)</SelectItem>
                        <SelectItem value="Open">All Ages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select value={newEvent.format} onValueChange={(value) => setNewEvent({ ...newEvent, format: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Singles">Singles</SelectItem>
                        <SelectItem value="Doubles">Doubles</SelectItem>
                        <SelectItem value="Mixed Doubles">Mixed Doubles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setCreateEventDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEvent} 
                  disabled={createEventMutation.isPending}
                  data-testid="submit-event-button"
                >
                  {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="social">Social Event</SelectItem>
                      <SelectItem value="league">League</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Events List */}
            {eventsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event: FacilityEvent) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`event-card-${event.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.eventType)}
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <p className="text-sm text-gray-600 capitalize">{event.eventType}</p>
                          </div>
                        </div>
                        {getStatusBadge(event.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                      
                      {/* Event Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{format(new Date(event.startDate), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{format(new Date(event.startDate), 'HH:mm')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{event.currentRegistrations}/{event.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">${event.entryFee}</span>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Info */}
                      {event.status === 'completed' && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Facility Revenue: ${event.revenue.facilityShare}</span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                          className="flex-1"
                          data-testid={`view-event-${event.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/facility-events/${event.id}/edit`)}
                          data-testid={`edit-event-${event.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first event or tournament.
                  </p>
                  <Button onClick={() => setCreateEventDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : analytics ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
                    <div className="text-2xl font-bold">{analytics.totalEvents}</div>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                    <div className="text-2xl font-bold text-green-600">${analytics.totalRevenue}</div>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Avg Participants</CardTitle>
                    <div className="text-2xl font-bold">{analytics.avgParticipants}</div>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                    <div className="text-2xl font-bold text-blue-600">{analytics.successRate}%</div>
                  </CardHeader>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-6">
            {selectedEvent ? (
              <Card>
                <CardHeader>
                  <CardTitle>Registrations for "{selectedEvent.title}"</CardTitle>
                </CardHeader>
                <CardContent>
                  {registrationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 animate-pulse">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : registrations && registrations.length > 0 ? (
                    <div className="space-y-4">
                      {registrations.map((registration: EventRegistration) => (
                        <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{registration.playerName}</h4>
                            <p className="text-sm text-gray-600">{registration.playerEmail}</p>
                            <p className="text-xs text-gray-500">
                              Registered: {format(new Date(registration.registrationDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Badge 
                            variant={registration.paymentStatus === 'completed' ? 'default' : 'secondary'}
                            className={registration.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {registration.paymentStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No registrations yet.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Event</h3>
                  <p className="text-gray-600">
                    Choose an event from the Events tab to view its registrations.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StandardLayout>
  );
}