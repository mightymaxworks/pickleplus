/**
 * PKL-278651-CONN-0004-PASS-REG-UI-PHASE2
 * PKL-278651-CONN-0008-UX - PicklePass™ UI/UX Enhancement Sprint
 * 
 * My Events Tab Component with enhanced UI/UX
 * Displays events that the current user has registered for but not yet attended
 * with improved visual hierarchy, animations, and mobile experience
 */

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  TicketIcon, 
  CheckIcon, 
  XCircleIcon, 
  CalendarDaysIcon,
  ClockIcon,
  AlertCircleIcon,
  FilterIcon,
  Star as StarIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { 
  isDefaultCommunityEvent, 
  ensureDefaultCommunityEvent 
} from '@/lib/defaultCommunityEvent';

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

  // PKL-278651-PASS-0014-DEFT - Fetch registered events
  const { data: apiEvents, isLoading, error } = useQuery({
    queryKey: ['/api/events/my/registered'],
    queryFn: () => getMyRegisteredEvents(),
  });
  
  // PKL-278651-PASS-0014-DEFT - Always ensure the default community event is included
  const events = useMemo(() => {
    return ensureDefaultCommunityEvent(apiEvents || []);
  }, [apiEvents]);

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  /* PKL-278651-PASS-0014-DEFT - Add Default Community Event handling */
  const openCancelDialog = (event: Event) => {
    // Prevent cancellation of the default community event
    if (isDefaultCommunityEvent(event)) {
      toast({
        title: "Community Event",
        description: "You cannot cancel registration for community events as they're available to all members.",
        variant: "default"
      });
      return;
    }
    
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

  /* PKL-278651-PASS-0014-DEFT - Ensure empty state includes default community event */
  // This commented-out section is kept as a reference since we'll never reach this code path now
  // Default community event is added in processedEvents via ensureDefaultCommunityEvent
  // 
  // if (!events || events.length === 0) {
  //   return (
  //     <Card className={cn("bg-gradient-to-b from-muted/20 to-muted/5 border-primary/10 shadow-md", className)}>
  //       <CardHeader className="pb-2">
  //         <CardTitle className="flex items-center">
  //           <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary" />
  //           No Registered Events
  //         </CardTitle>
  //         <CardDescription>
  //           You haven't registered for any upcoming PicklePass™ events yet.
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="text-center py-8">
  //           <div className="rounded-full bg-primary/5 w-20 h-20 mx-auto mb-5 flex items-center justify-center border border-primary/10 shadow-inner">
  //             <TicketIcon className="w-9 h-9 text-primary/70" />
  //           </div>
  //           <p className="text-muted-foreground mb-7 max-w-xs mx-auto">
  //             Register for events from the Events tab and they'll appear here.
  //           </p>
  //           <Button 
  //             onClick={onPassportClick} 
  //             className="bg-primary/90 hover:bg-primary transition-colors duration-300 py-6 px-8 rounded-lg shadow-md"
  //             disabled={!onPassportClick}
  //           >
  //             <TicketIcon className="mr-2 h-5 w-5" />
  //             View My Passport
  //           </Button>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

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

  /* PKL-278651-PASS-0014-DEFT - Process events and ensure default community event is included */
  const processedEvents = useMemo(() => {
    // Always start with the default community event and add other events
    // This approach ensures the default community event is always included,
    // even if the API returns null, undefined, or an empty array
    const eventsWithDefault = ensureDefaultCommunityEvent(events || []);
    
    // Group events by date
    const grouped: Record<string, typeof eventsWithDefault> = {};
    
    eventsWithDefault.forEach(event => {
      if (!event.startDateTime) {
        if (!grouped['Date TBD']) grouped['Date TBD'] = [];
        grouped['Date TBD'].push(event);
        return;
      }
      
      // Use simple formatDate without extra options
      const dateKey = formatDate(new Date(event.startDateTime));
      
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    
    // Convert to array format for rendering
    return Object.entries(grouped).map(([date, dateEvents]) => ({
      date,
      events: dateEvents
    })).sort((a, b) => {
      // Sort TBD dates to the end
      if (a.date === 'Date TBD') return 1;
      if (b.date === 'Date TBD') return -1;
      
      // Compare dates for the rest
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [events]);
  
  // Function to determine attendance fill level
  const getAttendanceLevel = (current: number | null = 0, max: number | null = 0) => {
    const currentValue = current ?? 0;
    const maxValue = max ?? 0;
    if (!maxValue) return 'low';
    const percentage = (currentValue / maxValue) * 100;
    if (percentage >= 85) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };
  
  // Determine if an event is happening soon (next 24 hours)
  const isEventSoon = (event: Event) => {
    if (!event.startDateTime) return false;
    
    const eventDate = new Date(event.startDateTime);
    const now = new Date();
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  // Render events list with enhanced UI
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary/70" />
            My Registered Events
          </h3>
          <p className="text-sm text-muted-foreground">
            Events you've registered for through PicklePass™
          </p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button 
            variant="default" 
            className="bg-primary/90 hover:bg-primary transition-all duration-300 w-full sm:w-auto"
            onClick={onPassportClick}
            disabled={!onPassportClick}
          >
            <TicketIcon className="mr-2 h-4 w-4" />
            View My Passport
          </Button>
        </motion.div>
      </div>
      
      <ScrollArea className="h-[450px] pr-4">
        <AnimatePresence>
          <div className="space-y-6 pr-2">
            {processedEvents.map((group, groupIndex) => (
              <motion.div 
                key={group.date} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1, duration: 0.4 }}
                className="space-y-3"
              >
                {/* Date heading with subtle separator */}
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-primary/70" />
                  <h3 className="text-sm font-medium text-primary/80">{group.date}</h3>
                  <Separator className="ml-3 flex-1" />
                </div>
                
                {/* Events for this date */}
                <div className="space-y-3 pl-1">
                  {group.events.map((event, eventIndex) => {
                    const soon = isEventSoon(event);
                    const attendanceLevel = getAttendanceLevel(event.currentAttendees, event.maxAttendees);
                    
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: (groupIndex * 0.1) + (eventIndex * 0.05),
                          duration: 0.3 
                        }}
                        className="origin-top"
                      >
                        <Card 
                          className={cn(
                            "overflow-hidden border-l-4 transition-all",
                            onEventClick && "hover:shadow-md cursor-pointer",
                            isDefaultCommunityEvent(event) ? 
                              "border-l-emerald-500 bg-gradient-to-r from-emerald-50/30 to-transparent" :
                              soon ? "border-l-amber-500 bg-gradient-to-r from-amber-50/40 to-transparent" : 
                                "border-l-primary/70 bg-gradient-to-r from-primary/5 to-transparent"
                          )}
                          onClick={() => handleEventClick(event)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {/* PKL-278651-PASS-0014-DEFT - Show indicators for special event states */}
                                {soon && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <AlertCircleIcon className="h-4 w-4 text-amber-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Happening in less than 24 hours!</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {isDefaultCommunityEvent(event) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <StarIcon className="h-4 w-4 text-emerald-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Community Event - Always Available</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {event.name}
                              </CardTitle>
                              {getEventStatusBadge(event)}
                            </div>
                            <CardDescription>
                              <div className="flex items-center mt-1">
                                <ClockIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>
                                  {event.startDateTime ? formatTime(new Date(event.startDateTime)) : 'Time TBD'}
                                  {event.endDateTime && ` - ${formatTime(new Date(event.endDateTime))}`}
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
                                    {event.currentAttendees || 0} / {event.maxAttendees} attending
                                    {attendanceLevel === 'high' && (
                                      <span className="ml-2 text-amber-600 text-xs">Almost full</span>
                                    )}
                                  </span>
                                </div>
                                
                                {/* Attendance progress bar */}
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
                              </div>
                            ) : (
                              <div className="flex items-center text-muted-foreground">
                                <AlertCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                                <span>Unlimited attendance</span>
                              </div>
                            )}
                            
                            {/* Enhanced Registration Status Badges */}
                            <motion.div 
                              className="flex flex-wrap gap-2 mt-3"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              {/* PKL-278651-PASS-0014-DEFT - Add special badge for default community event */}
                              {isDefaultCommunityEvent(event) ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  <StarIcon className="h-3 w-3 mr-1" />
                                  Community Event
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckIcon className="h-3 w-3 mr-1" />
                                  Registered
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <TicketIcon className="h-3 w-3 mr-1" />
                                Pass Ready
                              </Badge>
                              {soon && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  Upcoming Soon
                                </Badge>
                              )}
                            </motion.div>
                          </CardContent>
                          
                          <CardFooter className="pt-0">
                            {/* PKL-278651-PASS-0014-DEFT - Only show cancel button for non-default events */}
                            {!isDefaultCommunityEvent(event) ? (
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                              </motion.div>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                <CheckIcon className="h-3 w-3 mr-1" />
                                Always Registered
                              </Badge>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
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