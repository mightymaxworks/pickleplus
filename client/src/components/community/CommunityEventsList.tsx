/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Events List Component
 * 
 * This component displays a list of events for a community with registration functionality.
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  CalendarDays,
  Loader2,
  AlertCircle 
} from "lucide-react";
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/lib/hooks/useUser";

interface CommunityEventsListProps {
  communityId: number;
  isMember: boolean;
}

interface CommunityEvent {
  id: number;
  communityId: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  currentAttendees: number;
  createdAt: string;
  updatedAt: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  userIsAttending?: boolean;
}

export const CommunityEventsList = ({ communityId, isMember }: CommunityEventsListProps) => {
  const [registrationNotes, setRegistrationNotes] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  
  // Fetch community events
  const { 
    data: events = [], 
    isLoading 
  } = useQuery({
    queryKey: [`/api/communities/${communityId}/events`],
    queryFn: async () => {
      const response = await apiRequest(`/api/communities/${communityId}/events`);
      return response as CommunityEvent[];
    },
    enabled: !!communityId,
  });
  
  // Register for event mutation
  const registerForEvent = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest(`/api/communities/events/${eventId}/register`, {
        method: 'POST',
        body: { 
          notes: registrationNotes 
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] });
      setRegistrationNotes('');
      setSelectedEventId(null);
      
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for the event.",
      });
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Unregister from event mutation
  const unregisterFromEvent = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest(`/api/communities/events/${eventId}/unregister`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/events`] });
      
      toast({
        title: "Unregistered",
        description: "You have been removed from the event attendance list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unregister from the event. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Open registration dialog
  const openRegistrationDialog = (eventId: number) => {
    setSelectedEventId(eventId);
    setRegistrationNotes('');
  };
  
  // Handle registration
  const handleRegister = () => {
    if (!selectedEventId) return;
    registerForEvent.mutate(selectedEventId);
  };
  
  // Handle unregistration
  const handleUnregister = (eventId: number) => {
    unregisterFromEvent.mutate(eventId);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex gap-4 mt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDays className="h-16 w-16 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Events Scheduled</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            There are no upcoming events for this community. Check back later or subscribe for notifications.
          </p>
          
          {!isMember && (
            <Button>Join Community to Get Notified</Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Get the appropriate status badge for an event
  const getStatusBadge = (event: CommunityEvent) => {
    const status = event.status;
    
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  // Format the event date and time
  const formatEventDateTime = (event: CommunityEvent) => {
    try {
      const startDateObj = new Date(event.startDate);
      const dateFormatted = format(startDateObj, 'EEEE, MMMM d, yyyy');
      const timeFormatParts = [];
      
      if (event.startTime) {
        const [startHours, startMinutes] = event.startTime.split(':');
        const startTimeObj = new Date();
        startTimeObj.setHours(parseInt(startHours), parseInt(startMinutes));
        timeFormatParts.push(format(startTimeObj, 'h:mm a'));
      }
      
      if (event.endTime) {
        const [endHours, endMinutes] = event.endTime.split(':');
        const endTimeObj = new Date();
        endTimeObj.setHours(parseInt(endHours), parseInt(endMinutes));
        timeFormatParts.push(format(endTimeObj, 'h:mm a'));
      }
      
      const timeFormatted = timeFormatParts.join(' - ');
      
      return { dateFormatted, timeFormatted };
    } catch (error) {
      return { 
        dateFormatted: 'Date not available', 
        timeFormatted: 'Time not available' 
      };
    }
  };
  
  return (
    <div className="space-y-6">
      {events.map((event) => {
        const { dateFormatted, timeFormatted } = formatEventDateTime(event);
        const isEventFull = event.currentAttendees >= event.maxAttendees;
        const isCancelled = event.status === 'cancelled';
        const isCompleted = event.status === 'completed';
        const isUserRegistered = event.userIsAttending;
        
        return (
          <Card key={event.id} className={isCancelled ? "border-red-200" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </div>
                {getStatusBadge(event)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{dateFormatted}</span>
                  </div>
                  
                  {timeFormatted && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{timeFormatted}</span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {event.currentAttendees} / {event.maxAttendees} attendees
                      {isEventFull && " (Full)"}
                    </span>
                  </div>
                </div>
                
                {isUserRegistered && (
                  <div className="flex items-center p-2 bg-green-50 rounded border border-green-100 text-green-800">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">You're registered for this event</span>
                  </div>
                )}
                
                {isCancelled && (
                  <div className="flex items-center p-2 bg-red-50 rounded border border-red-100 text-red-800">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">This event has been cancelled</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {isMember && !isCancelled && !isCompleted && (
                <>
                  {isUserRegistered ? (
                    <Button 
                      variant="outline" 
                      onClick={() => handleUnregister(event.id)}
                      disabled={unregisterFromEvent.isPending}
                    >
                      {unregisterFromEvent.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cancel Registration
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => openRegistrationDialog(event.id)}
                          disabled={isEventFull}
                        >
                          {isEventFull ? "Event Full" : "Register"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Register for {event.title}</DialogTitle>
                          <DialogDescription>
                            Fill out the following information to register for this event.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Event Details:</h4>
                            <p className="text-sm">{event.description}</p>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{dateFormatted}</span>
                            </div>
                            {timeFormatted && (
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{timeFormatted}</span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <label 
                              htmlFor="notes" 
                              className="text-sm font-medium"
                            >
                              Additional Notes (Optional)
                            </label>
                            <Textarea
                              id="notes"
                              placeholder="Any dietary restrictions, accessibility needs, or questions?"
                              value={registrationNotes}
                              onChange={(e) => setRegistrationNotes(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            onClick={handleRegister}
                            disabled={registerForEvent.isPending}
                          >
                            {registerForEvent.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Confirm Registration
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
              
              {/* Non-members see different button */}
              {!isMember && !isCancelled && !isCompleted && (
                <Button disabled>Join Community to Register</Button>
              )}
              
              {/* Completed event */}
              {isCompleted && (
                <Button variant="outline" disabled>Event Completed</Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};