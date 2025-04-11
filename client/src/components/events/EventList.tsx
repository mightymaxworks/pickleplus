/**
 * PKL-278651-CONN-0003-EVENT - PicklePass™ System
 * PKL-278651-CONN-0004-PASS-REG - Enhanced PicklePass™ with Registration
 * Component for displaying a list of events with registration functionality
 */

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CheckIcon, MapPinIcon, UsersIcon, TicketIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatTime } from '@/lib/utils';
import { 
  getUpcomingEvents, 
  getEventRegistrationStatus, 
  registerForEvent, 
  cancelEventRegistration 
} from '@/lib/sdk/eventSDK';
import type { Event } from '@shared/schema/events';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Helper function to safely format dates
const safeFormatDate = (dateString: any, options: any = {}) => {
  try {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date TBD';
    return formatDate(date, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date TBD';
  }
};

// Helper function to safely format times
const safeFormatTime = (dateString: any) => {
  try {
    if (!dateString) return 'Time TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Time TBD';
    return formatTime(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Time TBD';
  }
};

interface EventListProps {
  limit?: number;
  showViewButton?: boolean;
  onEventClick?: (event: Event) => void;
  className?: string;
}

export function EventList({ 
  limit = 5, 
  showViewButton = true,
  onEventClick,
  className = ''
}: EventListProps) {
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationNotes, setRegistrationNotes] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['/api/events/upcoming', limit], 
    queryFn: () => getUpcomingEvents(limit)
  });
  
  // Use a single query for all events registration status
  const { data: registrationStatusData, isLoading: isLoadingRegistrationStatus } = useQuery({
    queryKey: ['/api/events/registration-status', events?.map(e => e.id).join(',')],
    queryFn: async () => {
      if (!events || events.length === 0) return {};
      
      // Create an object to store registration status for each event
      const statuses: Record<number, boolean> = {};
      
      // Fetch registration status for each event
      await Promise.all(
        events.map(async (event) => {
          try {
            const status = await getEventRegistrationStatus(event.id);
            statuses[event.id] = status;
          } catch (error) {
            console.error(`Failed to fetch registration status for event ${event.id}:`, error);
            statuses[event.id] = false;
          }
        })
      );
      
      return statuses;
    },
    enabled: !!events && events.length > 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Map events to their registration status
  const eventsWithRegistrationStatus = events?.map(event => {
    return {
      ...event,
      isRegistered: registrationStatusData?.[event.id] || false,
      isLoadingStatus: isLoadingRegistrationStatus
    };
  }) || [];

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
    setRegistrationNotes('');
    setRegisterDialogOpen(true);
  };
  
  const handleRegisterSubmit = async () => {
    if (!selectedEvent) return;
    
    setIsRegistering(true);
    try {
      await registerForEvent(selectedEvent.id, registrationNotes);
      
      // Invalidate registration status query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/events/registration-status'] });
      
      // Show success toast
      toast({
        title: "Registration Successful",
        description: `You've been registered for ${selectedEvent.name}.`,
        variant: "success"
      });
      
      // Close dialog
      setRegisterDialogOpen(false);
    } catch (error) {
      // Show error toast
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register for event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  const handleCancelRegistration = async (event: Event) => {
    setIsCancelling(true);
    try {
      await cancelEventRegistration(event.id);
      
      // Invalidate registration status query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/events/registration-status'] });
      
      // Show success toast
      toast({
        title: "Registration Cancelled",
        description: `Your registration for ${event.name} has been cancelled.`,
        variant: "success"
      });
    } catch (error) {
      // Show error toast
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Function to get event status badge
  const getEventStatusBadge = (event: Event) => {
    const now = new Date();
    // Ensure we have valid date strings before creating Date objects
    const startDateTime = event.startDateTime || Date.now();
    const endDateTime = event.endDateTime || Date.now();
    
    // Create valid date objects with fallbacks
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return <Badge variant="secondary">Upcoming</Badge>;
    }

    if (now > endDate) {
      return <Badge variant="outline" className="text-muted-foreground">Completed</Badge>;
    } else if (now >= startDate && now <= endDate) {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>;
    } else {
      return <Badge variant="secondary">Upcoming</Badge>;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className={cn("bg-muted/50", className)}>
        <CardHeader>
          <CardTitle>Error Loading PicklePass™ Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to load upcoming PicklePass™ events. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (!events || events.length === 0) {
    return (
      <Card className={cn("bg-muted/50", className)}>
        <CardHeader>
          <CardTitle>No PicklePass™ Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There are no upcoming PicklePass™ events scheduled at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render events list
  return (
    <div className={cn("space-y-4", className)}>
      {eventsWithRegistrationStatus.map((event) => (
        <Card 
          key={event.id} 
          className={cn(
            "overflow-hidden transition-all", 
            onEventClick && "hover:shadow-md cursor-pointer"
          )}
          onClick={() => handleEventClick(event)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{event.name}</CardTitle>
              {getEventStatusBadge(event)}
            </div>
            <CardDescription>
              <div className="flex items-center mt-1">
                <CalendarIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>
                  {safeFormatDate(event.startDateTime, { month: 'short', day: 'numeric' })} at {safeFormatTime(event.startDateTime)}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3 text-sm">
            {event.location && (
              <div className="flex items-center text-muted-foreground mb-1.5">
                <MapPinIcon className="h-3.5 w-3.5 mr-1.5" />
                <span>{event.location}</span>
              </div>
            )}
            {event.maxAttendees && (
              <div className="flex items-center text-muted-foreground">
                <UsersIcon className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  {event.currentAttendees || 0} / {event.maxAttendees} attending
                </span>
              </div>
            )}
            
            {/* Registration status badge */}
            {event.isRegistered && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Registered
                </Badge>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 flex gap-2 flex-wrap">
            {/* View Details Button */}
            {showViewButton && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventClick(event);
                }}
              >
                View Details
              </Button>
            )}
            
            {/* Registration Buttons */}
            {event.isLoadingStatus ? (
              <Button 
                variant="outline"
                size="sm"
                className="text-xs"
                disabled
              >
                <Skeleton className="h-4 w-16" />
              </Button>
            ) : event.isRegistered ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelRegistration(event);
                }}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel Registration"}
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="text-xs bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegisterClick(event);
                }}
              >
                <TicketIcon className="h-3 w-3 mr-1" />
                Register
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
      
      {/* Registration Dialog */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.name}</DialogTitle>
            <DialogDescription>
              Complete your registration for this PicklePass™ event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Event Details</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span>
                    {selectedEvent && safeFormatDate(selectedEvent.startDateTime, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 opacity-0" />
                  <span>
                    {selectedEvent && `${safeFormatTime(selectedEvent.startDateTime)} - ${safeFormatTime(selectedEvent.endDateTime)}`}
                  </span>
                </div>
                {selectedEvent?.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-3.5 w-3.5 mr-1.5" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Special Requests or Notes (Optional)</h4>
              <Textarea
                placeholder="Any special requests or accommodations..."
                value={registrationNotes}
                onChange={(e) => setRegistrationNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-row items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button 
              variant="default" 
              size="sm"
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleRegisterSubmit}
              disabled={isRegistering}
            >
              {isRegistering ? "Registering..." : "Confirm Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventList;