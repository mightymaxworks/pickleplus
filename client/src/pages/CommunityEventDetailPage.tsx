/**
 * PKL-278651-COMM-0016-RSVP
 * Community Event Detail Page
 * 
 * This page displays the details of a community event and allows users to RSVP.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-18
 */

import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format, isPast, formatDistanceToNow } from 'date-fns';

// ShadCN Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Icons
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  User,
  CalendarCheck,
  Info,
  Loader2,
  Sparkles
} from 'lucide-react';

// Custom Components
import EventRegistrationForm from '@/components/community/EventRegistrationForm';

// Hooks
import { useCommunityEvent, useRegisterForEvent, useCancelEventRegistration } from '@/lib/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';

// Types & Utils
import { CommunityEventStatus, CommunityEventType, EventAttendeeStatus } from '@/types/community';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { getEventTypeLabel, getRegistrationStatusLabel, hasAvailableSpots } from '@/lib/utils/communityUtils';
import { AppHeader } from '@/components/layout/AppHeader';

const CommunityEventDetailPage: React.FC = () => {
  const { communityId: communityIdString, eventId: eventIdString } = useParams();
  const communityId = Number(communityIdString);
  const eventId = Number(eventIdString);
  const { toast } = useToast();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Get event details
  const { 
    data: event, 
    isLoading: isLoadingEvent, 
    isError: isErrorEvent,
    error: eventError
  } = useCommunityEvent(communityId, eventId);
  
  // Register/Cancel mutations
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelEventRegistration();
  
  // Handle registration and cancellation
  const handleRegister = (notes?: string) => {
    registerMutation.mutate({ 
      communityId,
      eventId,
      notes 
    }, {
      onSuccess: () => {
        setShowRegisterDialog(false);
        toast({
          title: "Registration successful",
          description: "You are now registered for this event.",
        });
      }
    });
  };
  
  const handleCancelRegistration = () => {
    cancelMutation.mutate({
      communityId,
      eventId
    }, {
      onSuccess: () => {
        setShowCancelDialog(false);
        toast({
          title: "Registration cancelled",
          description: "Your registration has been cancelled.",
        });
      }
    });
  };
  
  // Loading state
  if (isLoadingEvent) {
    return (
      <div className="container py-6">
        <AppHeader title="Event Details" />
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-36 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isErrorEvent || !event) {
    const errorMessage = eventError instanceof Error ? eventError.message : "Failed to load event details";
    return (
      <div className="container py-6">
        <AppHeader title="Event Details" />
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={`/communities/${communityId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Link>
        </Button>
      </div>
    );
  }
  
  // Calculate various event properties
  const isUpcoming = event.status === CommunityEventStatus.UPCOMING;
  const isOngoing = event.status === CommunityEventStatus.ONGOING;
  const isCancelled = event.status === CommunityEventStatus.CANCELLED;
  const isCompleted = event.status === CommunityEventStatus.COMPLETED;
  
  const isRegistered = event.isRegistered || false;
  const isWaitlisted = event.registrationStatus === EventAttendeeStatus.WAITLISTED;
  const eventIsFull = event.maxAttendees !== null && event.currentAttendees >= event.maxAttendees;
  
  // Registration is possible if: event is upcoming, user isn't registered, event isn't full
  const canRegister = isUpcoming && !isRegistered && !isPast(new Date(event.registrationDeadline || event.eventDate));
  
  // Format dates and times
  const formattedDate = formatDate(new Date(event.eventDate), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = formatTime(new Date(event.eventDate));
  const formattedEndTime = event.endDate ? formatTime(new Date(event.endDate)) : '';
  const timeUntilEvent = formatDistanceToNow(new Date(event.eventDate), { addSuffix: true });
  
  // Get attendee status information
  const attendanceStatusInfo = (() => {
    if (isRegistered) {
      return {
        color: 'text-green-600',
        label: 'Registered',
        icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />,
      };
    }
    if (isWaitlisted) {
      return {
        color: 'text-amber-600',
        label: 'Waitlisted',
        icon: <AlertCircle className="h-4 w-4 mr-1.5" />,
      };
    }
    if (eventIsFull) {
      return {
        color: 'text-rose-600',
        label: 'Event is full',
        icon: <XCircle className="h-4 w-4 mr-1.5" />,
      };
    }
    
    return {
      color: 'text-muted-foreground',
      label: 'Not registered',
      icon: <CalendarCheck className="h-4 w-4 mr-1.5" />,
    };
  })();
  
  return (
    <div className="container py-6">
      <AppHeader title={event.title} subtitle={getEventTypeLabel(event.eventType)} />
      
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/communities/${communityId}`}>
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Community
          </Link>
        </Button>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Event details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {/* Status badge */}
                {isUpcoming && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Upcoming
                  </Badge>
                )}
                {isOngoing && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Happening Now
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                    Completed
                  </Badge>
                )}
                {isCancelled && (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                    <XCircle className="mr-1 h-3 w-3" />
                    Cancelled
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center">
                <Calendar className="h-4 w-4 mr-1.5" />
                {formattedDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Event Description */}
                {event.description && (
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}
                
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date and time */}
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-primary/70" />
                      Time
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formattedTime} {formattedEndTime ? `- ${formattedEndTime}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timeUntilEvent}
                    </p>
                  </div>
                  
                  {/* Location */}
                  {(event.location || event.isVirtual) && (
                    <div className="p-4 rounded-lg border bg-card">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        {event.isVirtual ? (
                          <>
                            <svg className="h-4 w-4 mr-1.5 text-primary/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                            </svg>
                            Virtual Meeting
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-1.5 text-primary/70" />
                            Location
                          </>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {event.isVirtual ? 'Online' : event.location}
                      </p>
                      {event.isVirtual && event.virtualMeetingUrl && isRegistered && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => window.open(event.virtualMeetingUrl as string, '_blank')}
                        >
                          Join Meeting
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Attendance and registration deadlines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Attendance */}
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-1.5 text-primary/70" />
                      Attendance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {event.currentAttendees} / {event.maxAttendees || 'Unlimited'} registered
                    </p>
                    
                    {event.maxAttendees && (
                      <div className="h-1.5 rounded-full bg-muted/30 w-full mt-2 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            event.currentAttendees / event.maxAttendees >= 0.9 ? "bg-amber-500" :
                            event.currentAttendees / event.maxAttendees >= 0.6 ? "bg-blue-500" :
                            "bg-green-500"
                          )}
                          style={{ 
                            width: `${Math.min(100, event.maxAttendees ? (event.currentAttendees / event.maxAttendees * 100) : 0)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Registration Deadline */}
                  {event.registrationDeadline && (
                    <div className="p-4 rounded-lg border bg-card">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <CalendarCheck className="h-4 w-4 mr-1.5 text-primary/70" />
                        Registration Deadline
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date(event.registrationDeadline), { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(event.registrationDeadline), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Skill level requirements */}
                {(event.minSkillLevel || event.maxSkillLevel) && (
                  <div className="p-4 rounded-lg border bg-card">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-1.5 text-primary/70" />
                      Skill Level Requirements
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {event.minSkillLevel && event.maxSkillLevel 
                        ? `${event.minSkillLevel} - ${event.maxSkillLevel}`
                        : event.minSkillLevel 
                          ? `Minimum: ${event.minSkillLevel}` 
                          : `Maximum: ${event.maxSkillLevel}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Attendees list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendees</CardTitle>
              <CardDescription>
                People registered for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would be replaced with actual attendees data */}
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/uploads/avatar-1744175244601-552366553.jpg" />
                      <AvatarFallback>MM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Mighty Max</p>
                      <p className="text-xs text-muted-foreground">@mightymax</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Host</Badge>
                </div>
                
                {/* Empty state */}
                {event.currentAttendees <= 1 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No other attendees yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Registration/Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Registration status */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Your Status</h3>
                  <div className={cn("flex items-center", attendanceStatusInfo.color)}>
                    {attendanceStatusInfo.icon}
                    <span>{attendanceStatusInfo.label}</span>
                  </div>
                </div>
                
                {/* Registration/Cancellation actions */}
                <div className="space-y-3">
                  {/* Register button - show if can register */}
                  {canRegister && (
                    <Button 
                      className="w-full"
                      onClick={() => setShowRegisterDialog(true)}
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Register for Event
                    </Button>
                  )}
                  
                  {/* Cancel registration button - show if registered */}
                  {isRegistered && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Cancel Registration
                    </Button>
                  )}
                  
                  {/* Cannot register - show reason */}
                  {!canRegister && !isRegistered && (
                    <Alert className="bg-muted/30 text-foreground border-muted">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Registration Unavailable</AlertTitle>
                      <AlertDescription>
                        {isCancelled && "This event has been cancelled."}
                        {isCompleted && "This event has already taken place."}
                        {eventIsFull && !isCompleted && !isCancelled && "This event has reached maximum capacity."}
                        {!eventIsFull && isPast(new Date(event.registrationDeadline || event.eventDate)) && "The registration deadline has passed."}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Registration dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              Fill out the form below to register for this event.
            </DialogDescription>
          </DialogHeader>
          <EventRegistrationForm 
            onSubmit={handleRegister} 
            onCancel={() => setShowRegisterDialog(false)}
            isPending={registerMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Cancel registration dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your registration for this event?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Registration
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelRegistration}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Cancel Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityEventDetailPage;