/**
 * PKL-278651-CONN-0004-PASS-REG-UI-PHASE2
 * My Events Tab Component
 * 
 * Displays events that the current user has registered for but not yet attended
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, MapPinIcon, UsersIcon, TicketIcon, CheckIcon, XCircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { getMyRegisteredEvents, cancelEventRegistration } from '@/lib/sdk/eventSDK';
import type { Event } from '@shared/schema/events';
import { cn, formatDate, formatTime } from '@/lib/utils';

interface MyEventsTabProps {
  className?: string;
  onEventClick?: (event: Event) => void;
  onPassportClick?: () => void;
}

export function MyEventsTab({ className, onEventClick, onPassportClick }: MyEventsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<Event | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch registered events
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['/api/events/my/registered'],
    queryFn: () => getMyRegisteredEvents(),
  });

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const openCancelDialog = (event: Event) => {
    setEventToCancel(event);
    setShowCancelDialog(true);
  };

  const handleCancelRegistration = async () => {
    if (!eventToCancel) return;
    
    setIsCancelling(true);
    try {
      await cancelEventRegistration(eventToCancel.id);
      
      // Invalidate registration status query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/events/registration-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/my/registered'] });
      
      // Show success toast
      toast({
        title: "Registration Cancelled",
        description: `Your registration for ${eventToCancel.name} has been cancelled.`,
        variant: "success"
      });
      
      // Close dialog
      setShowCancelDialog(false);
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
        {Array.from({ length: 2 }).map((_, index) => (
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

  // Render empty state with link to passport
  if (!events || events.length === 0) {
    return (
      <Card className={cn("bg-muted/30", className)}>
        <CardHeader>
          <CardTitle>No Registered Events</CardTitle>
          <CardDescription>
            You haven't registered for any upcoming PicklePass™ events yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="rounded-full bg-muted w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TicketIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-6">
              Register for events from the Events tab and they'll appear here.
            </p>
            <Button 
              onClick={onPassportClick} 
              className="bg-primary hover:bg-primary/90"
              disabled={!onPassportClick}
            >
              <TicketIcon className="mr-2 h-4 w-4" />
              View My Passport
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertDescription>
          Unable to load your registered events. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Render events list
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">My Registered Events</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={onPassportClick}
          disabled={!onPassportClick}
        >
          <TicketIcon className="mr-1 h-3.5 w-3.5" />
          View Passport
        </Button>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4 pr-2">
          {events.map((event) => (
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
                      {event.startDateTime ? `${formatDate(new Date(event.startDateTime), { month: 'short', day: 'numeric' })} at ${formatTime(new Date(event.startDateTime))}` : 'Date TBD'}
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
                
                <div className="mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Registered
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCancelDialog(event);
                  }}
                >
                  <XCircleIcon className="h-3 w-3 mr-1" />
                  Cancel Registration
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {/* Cancel Registration Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your registration for {eventToCancel?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Never Mind</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelRegistration}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600"
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Registration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default MyEventsTab;