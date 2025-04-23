/**
 * PKL-278651-CONN-0003-EVENT - PicklePass™ System
 * PKL-278651-CONN-0004-PASS-REG - Enhanced PicklePass™ with Registration
 * PKL-278651-CONN-0008-UX - PicklePass™ UI/UX Enhancement Sprint
 * 
 * Component for displaying a list of events with registration functionality
 * Enhanced with improved visual hierarchy, animations, and mobile experience
 */

import React, { useState, useMemo, useEffect } from 'react';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useEventStatusSync from '@/lib/hooks/useEventStatusSync';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  CheckIcon, 
  MapPinIcon, 
  UsersIcon, 
  TicketIcon, 
  AlertCircleIcon,
  TrendingUpIcon,
  ClockIcon,
  LockIcon,
  Star as StarIcon
} from 'lucide-react';
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
import { 
  defaultCommunityEvent, 
  ensureDefaultCommunityEvent, 
  isDefaultCommunityEvent, 
  DEFAULT_COMMUNITY_EVENT_ID 
} from '@/lib/defaultCommunityEvent';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { useLocation } from 'wouter';

// Helper function to safely format dates
const safeFormatDate = (dateString: any) => {
  try {
    if (!dateString) return 'Date TBD';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date TBD';
    
    // Format with default options
    return formatDate(date);
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
  /** Show enhanced registration status */
  showEnhancedStatus?: boolean;
}

export function EventList({ 
  limit = 5, 
  showViewButton = true,
  onEventClick,
  className = '',
  showEnhancedStatus = false
}: EventListProps) {
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationNotes, setRegistrationNotes] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  /**
   * PKL-278651-PASS-0011-LOOP - Fix infinite loading by adding timeout and retry limits
   * Enhanced query with timeout, retry configuration and proper error handling
   */
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['/api/events/upcoming', limit], 
    queryFn: () => getUpcomingEvents(limit),
    retry: 2, // Limit retries to prevent infinite loop
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false // Prevent unnecessary refetches
  });
  
  /**
   * PKL-278651-PASS-0011-LOOP - Fix infinite loading by adding timeout and retry limits
   * PKL-278651-CONN-0011-FIX - Event Registration Flow Error Handling
   * Framework5.2 compliant null-safety implementation for event registration status
   * with proper error handling, timeouts and retry logic
   */
  const { data: registrationStatusData, isLoading: isLoadingRegistrationStatus } = useQuery({
    queryKey: ['/api/events/registration-status', Array.isArray(events) ? events.map(e => e.id).join(',') : ''],
    queryFn: async () => {
      if (!events || !Array.isArray(events) || events.length === 0) return {};
      
      // Create an object to store registration status for each event
      const statuses: Record<number, boolean> = {};
      
      // Set timeout for the entire operation
      const timeout = setTimeout(() => {
        console.warn('[EventList] Registration status fetch timed out after 10 seconds');
        throw new Error('Registration status fetch timed out');
      }, 10000); // 10 second timeout
      
      try {
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
        
        // Clear timeout after successful completion
        clearTimeout(timeout);
        return statuses;
      } catch (error) {
        // Clear timeout if there's an error
        clearTimeout(timeout);
        console.error('[EventList] Error fetching registration statuses:', error);
        
        // Return partial results if available or empty object as fallback
        return Object.keys(statuses).length > 0 ? statuses : {};
      }
    },
    enabled: !!events && events.length > 0,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 1000, // 1 second delay before retry
    gcTime: 300000 // 5 minutes
  });
  
  /**
   * PKL-278651-CONN-0011-FIX - Event Registration Flow Data Processing
   * Framework5.2 compliant handling for events data with defensive programming
   */
  // Extract the event IDs for WebSocket subscriptions
  const eventIds = Array.isArray(events) ? events.map(event => event.id) : [];

  /**
   * PKL-278651-CONN-0012-SYNC - Event Status Synchronization
   * Set up real-time WebSocket connection for event status updates
   * with graceful fallback to polling when WebSockets aren't available
   */
  const { isConnected, isEnabled } = useEventStatusSync({
    eventIds,
    onStatusChange: (update) => {
      console.log(`[WebSocket] Received update for event ${update.eventId}:`, update);
      
      // No need to manually update state, the queryClient.invalidateQueries in the hook
      // will automatically trigger a refetch of the relevant queries
      
      // Show a toast notification for important updates
      if (update.type === 'cancelled') {
        toast({
          title: "Event Cancelled",
          description: "An event you're interested in has been cancelled.",
          variant: "destructive"
        });
      } else if (update.type === 'rescheduled') {
        toast({
          title: "Event Rescheduled",
          description: "An event you're registered for has been rescheduled.",
          variant: "default"
        });
      }
    }
  });
  
  // Add fallback polling mechanism when WebSockets are disabled or not working
  useEffect(() => {
    // Only set up polling if we have events and WebSockets aren't working properly
    if (!isEnabled && eventIds.length > 0) {
      console.log("[EventList] WebSockets disabled, setting up fallback polling mechanism");
      
      // Set up a 30-second polling interval for registration status updates
      const interval = setInterval(() => {
        // Refetch registration status
        queryClient.invalidateQueries({ 
          queryKey: ['/api/events/registration-status', eventIds.join(',')]
        });
      }, 30000); // 30 seconds
      
      return () => {
        console.log("[EventList] Cleaning up fallback polling mechanism");
        clearInterval(interval);
      };
    }
  }, [isEnabled, eventIds, queryClient]);

  /**
   * PKL-278651-PASS-0014-DEFT - Add default community event
   * Ensure the default community event is included in the events list
   */
  const eventsWithDefaultCommunity = useMemo(() => {
    // If events is an array, add the default community event; otherwise return default event only
    return ensureDefaultCommunityEvent(events);
  }, [events]);
  
  const eventsWithRegistrationStatus = Array.isArray(eventsWithDefaultCommunity) 
    ? eventsWithDefaultCommunity.map(event => {
        // Handle registration status - default community event is always registered
        const isDefaultEvent = isDefaultCommunityEvent(event);
        return {
          ...event,
          isRegistered: isDefaultEvent || registrationStatusData?.[event.id] || false,
          isLoadingStatus: isDefaultEvent ? false : isLoadingRegistrationStatus,
          isDefaultCommunityEvent: isDefaultEvent,
          // Add formatting for grouping
          dateForGrouping: event.startDateTime ? 
            safeFormatDate(event.startDateTime) : 
            'Date TBD'
        };
      }) 
    : [];
  
  // Group events by date for better organization
  const groupedEvents = useMemo(() => {
    const groups: Record<string, typeof eventsWithRegistrationStatus> = {};
    
    eventsWithRegistrationStatus.forEach(event => {
      const dateGroup = event.dateForGrouping;
      if (!groups[dateGroup]) {
        groups[dateGroup] = [];
      }
      groups[dateGroup].push(event);
    });
    
    // Convert to array format for rendering
    return Object.entries(groups).map(([date, events]) => ({
      date,
      events
    })).sort((a, b) => {
      // Sort TBD dates to the end
      if (a.date === 'Date TBD') return 1;
      if (b.date === 'Date TBD') return -1;
      
      // Compare dates for the rest
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [eventsWithRegistrationStatus]);

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  /**
   * PKL-278651-PASS-0012-BUTN - Fix Register Button Functionality
   * Enhanced event registration click handler with authentication check
   * and proper error handling
   */
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const handleRegisterClick = (event: Event) => {
    // Check if user is authenticated
    if (!user) {
      console.log('[EventList] User not authenticated for registration');
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events",
        variant: "default"
      });
      navigate('/login');
      return;
    }
    
    // Validate event capacity
    if (event.maxAttendees && event.currentAttendees && event.currentAttendees >= event.maxAttendees) {
      console.log('[EventList] Event is at full capacity');
      toast({
        title: "Event Full",
        description: "This event has reached its maximum capacity",
        variant: "destructive"
      });
      return;
    }
    
    // Proceed with registration flow
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

  // Function to determine attendance fill level for visual indicator
  const getAttendanceLevel = (current: number | null = 0, max: number | null = 0) => {
    const currentValue = current ?? 0;
    const maxValue = max ?? 0;
    if (!maxValue) return 'low';
    const percentage = (currentValue / maxValue) * 100;
    if (percentage >= 85) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };
  
  // Determine if an event is "featured" (for visual highlighting)
  const isEventFeatured = (event: Event & {isRegistered?: boolean}) => {
    // Events are featured if they're happening soon, have special status, etc.
    if (event.isRegistered) return true;
    
    // Check if event is happening in the next 48 hours
    if (event.startDateTime) {
      const eventDate = new Date(event.startDateTime);
      const now = new Date();
      const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours > 0 && diffHours <= 48) return true;
    }
    
    return false;
  };

  // Render events list grouped by date
  return (
    <div className={cn("space-y-8", className)}>
      {/* PKL-278651-CONN-0012-SYNC - Enhanced WebSocket connection indicator */}
      {showEnhancedStatus && (
        <div className="flex items-center justify-end text-xs mb-1">
          <ConnectionStatusIndicator 
            isConnected={isConnected} 
            isEnabled={isEnabled}
            showLabel={true}
          />
        </div>
      )}
      
      <ScrollArea className="pr-4 h-[600px]">
        <div className="pr-4">
          <AnimatePresence>
            {groupedEvents.map((group, groupIndex) => (
              <motion.div 
                key={group.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05, duration: 0.3 }}
                className="mb-8 last:mb-2"
              >
                {/* Date heading with subtle separator */}
                <div className="flex items-center mb-3">
                  <CalendarIcon className="h-4 w-4 mr-2 text-primary/70" />
                  <h3 className="text-sm font-medium text-primary/90">{group.date}</h3>
                  <Separator className="ml-3 flex-1" />
                </div>
                
                {/* Events for this date */}
                <div className="space-y-4">
                  {group.events.map((event, eventIndex) => {
                    const attendanceLevel = getAttendanceLevel(event.currentAttendees, event.maxAttendees);
                    const featured = isEventFeatured(event);
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.97, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ 
                          delay: (groupIndex * 0.05) + (eventIndex * 0.03),
                          duration: 0.25
                        }}
                        whileHover={{ scale: 1.01 }}
                        className="origin-top"
                      >
                        <Card 
                          className={cn(
                            "overflow-hidden transition-all border-l-4",
                            onEventClick && "hover:shadow-md cursor-pointer",
                            // PKL-278651-PASS-0014-DEFT - Special styling for default community event
                            event.isDefaultCommunityEvent 
                              ? "border-l-emerald-500 bg-gradient-to-r from-emerald-50/70 to-transparent" 
                              : featured 
                                ? "border-l-primary" 
                                : "border-l-transparent",
                            !event.isDefaultCommunityEvent && (
                              attendanceLevel === 'high' ? "bg-gradient-to-r from-amber-50/70 to-transparent" :
                              attendanceLevel === 'medium' ? "bg-gradient-to-r from-blue-50/40 to-transparent" :
                              "bg-gradient-to-r from-muted/25 to-transparent"
                            )
                          )}
                          onClick={() => handleEventClick(event)}
                        >
                          {/* Event card content with enhanced visual hierarchy */}
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className={cn(
                                "text-lg flex items-center gap-2",
                                featured && !event.isDefaultCommunityEvent && "text-primary/90",
                                event.isDefaultCommunityEvent && "text-emerald-700"
                              )}>
                                {featured && !event.isDefaultCommunityEvent && <TrendingUpIcon className="h-4 w-4 text-primary/70" />}
                                {event.isDefaultCommunityEvent && <UsersIcon className="h-4 w-4 text-emerald-500" />}
                                {event.name}
                              </CardTitle>
                              <div className="flex items-center gap-1.5">
                                {/* PKL-278651-PASS-0014-DEFT - Special badge for default community event */}
                                {event.isDefaultCommunityEvent && (
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <StarIcon className="h-3 w-3 mr-1" />
                                    Community
                                  </Badge>
                                )}
                                {getEventStatusBadge(event)}
                              </div>
                            </div>
                            <CardDescription>
                              <div className="flex items-center mt-1">
                                <ClockIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>
                                  {event.startDateTime ? safeFormatTime(event.startDateTime) : 'Time TBD'}
                                  {event.endDateTime && ` - ${safeFormatTime(event.endDateTime)}`}
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
                            
                            {event.maxAttendees ? (
                              <div className="text-muted-foreground">
                                <div className="flex items-center mb-1">
                                  <UsersIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                  <span>
                                    {event.hideParticipantCount ? 'Registration open' : `${event.currentAttendees || 0} / ${event.maxAttendees} attending`}
                                    {attendanceLevel === 'high' && (
                                      <span className="ml-2 text-amber-600 text-xs">Almost full</span>
                                    )}
                                  </span>
                                </div>
                                
                                {/* Attendance progress bar - hide detailed progress for sensitive events */}
                                {!event.hideParticipantCount ? (
                                  <div className="h-1.5 rounded-full bg-muted/50 w-full mt-1 overflow-hidden">
                                    <div 
                                      className={cn(
                                        "h-full rounded-full",
                                        attendanceLevel === 'high' ? "bg-amber-500" : 
                                        attendanceLevel === 'medium' ? "bg-blue-500" : 
                                        "bg-green-500"
                                      )}
                                      style={{ 
                                        width: `${Math.min(100, event.maxAttendees ? (event.currentAttendees || 0) / event.maxAttendees * 100 : 0)}%` 
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-1.5 rounded-full bg-muted/50 w-full mt-1 overflow-hidden">
                                    <div className="h-full rounded-full bg-primary/60" style={{ width: '40%' }} />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center text-muted-foreground">
                                <AlertCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                                <span>Unlimited attendance</span>
                              </div>
                            )}
                            
                            {/* Registration status badge with enhanced animations */}
                            <AnimatePresence>
                              {event.isRegistered && (
                                <motion.div 
                                  className="mt-2"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                >
                                  {showEnhancedStatus ? (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckIcon className="h-3 w-3 mr-1" />
                                        Registered
                                      </Badge>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        <TicketIcon className="h-3 w-3 mr-1" />
                                        Pass Ready
                                      </Badge>
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      <CheckIcon className="h-3 w-3 mr-1" />
                                      Registered
                                    </Badge>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
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
                            
                            {/* Registration Buttons with enhanced animations */}
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
                              /* PKL-278651-PASS-0014-DEFT - Prevent cancellation of default community event */
                              event.isDefaultCommunityEvent ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  <CheckIcon className="h-3 w-3 mr-1" />
                                  Always Registered
                                </Badge>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelRegistration(event);
                                  }}
                                  disabled={isCancelling}
                                >
                                  {isCancelling ? "Cancelling..." : "Cancel Registration"}
                                </Button>
                              )
                            ) : (
                              {/* PKL-278651-PASS-0012-BUTN - Enhanced Registration Button */}
                              <Button 
                                variant="default" 
                                size="sm" 
                                className={cn(
                                  "text-xs transition-all duration-200",
                                  user ? "bg-green-600 hover:bg-green-700" : "bg-muted-foreground/70 hover:bg-muted-foreground/80"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRegisterClick(event);
                                }}
                                disabled={
                                  (event.maxAttendees && event.currentAttendees && event.currentAttendees >= event.maxAttendees) || 
                                  isRegistering || 
                                  isLoadingRegistrationStatus
                                }
                                title={!user ? "Log in to register" : (
                                  (event.maxAttendees && event.currentAttendees && event.currentAttendees >= event.maxAttendees) 
                                    ? "Event is at full capacity" 
                                    : "Register for this event"
                                )}
                              >
                                {!user && <LockIcon className="h-3 w-3 mr-1" />}
                                {(event.maxAttendees && event.currentAttendees && event.currentAttendees >= event.maxAttendees) ? (
                                  <>
                                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                                    Full
                                  </>
                                ) : (
                                  <>
                                    <TicketIcon className="h-3 w-3 mr-1" />
                                    Register
                                  </>
                                )}
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
      
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
                    {selectedEvent && safeFormatDate(selectedEvent.startDateTime)}
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