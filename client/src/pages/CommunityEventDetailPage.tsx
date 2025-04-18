/**
 * PKL-278651-COMM-0016-RSVP
 * Community Event Detail Page
 * 
 * This page displays the details of a community event and allows users to RSVP.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-18
 */

import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { Calendar, Clock, MapPin, Users, Video, User, ArrowLeft, ExternalLink } from "lucide-react";
import { 
  useCommunity, 
  useCommunityEvent, 
  useCancelEventRegistration,
  useEventAttendees,
} from "@/lib/hooks/useCommunity";
import { 
  CommunityEventType, 
  CommunityEventStatus, 
  EventAttendeeStatus 
} from "@/types/community";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import EventRegistrationForm from "@/components/community/EventRegistrationForm";

// Helper functions for displaying event data
function getEventTypeDisplay(type: CommunityEventType): string {
  const displayMap: Record<string, string> = {
    [CommunityEventType.MATCH_PLAY]: "Match Play",
    [CommunityEventType.CLINIC]: "Clinic",
    [CommunityEventType.TOURNAMENT]: "Tournament",
    [CommunityEventType.SOCIAL]: "Social Event",
    [CommunityEventType.WORKSHOP]: "Workshop",
    [CommunityEventType.LEAGUE]: "League",
  };
  return displayMap[type] || "Event";
}

function getStatusBadgeVariant(status: CommunityEventStatus): "default" | "secondary" | "destructive" | "outline" {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    [CommunityEventStatus.UPCOMING]: "default",
    [CommunityEventStatus.ONGOING]: "secondary",
    [CommunityEventStatus.COMPLETED]: "outline",
    [CommunityEventStatus.CANCELLED]: "destructive",
  };
  return variantMap[status] || "default";
}

export default function CommunityEventDetailPage() {
  // Extract communityId and eventId from the URL params
  const params = useParams<{ communityId: string; eventId: string }>();
  const communityId = parseInt(params.communityId);
  const eventId = parseInt(params.eventId);
  const [, navigate] = useLocation();

  // State for managing the registration dialog
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);

  // Fetch community and event data
  const { data: community, isLoading: isLoadingCommunity } = useCommunity(communityId);
  const {
    data: event,
    isLoading: isLoadingEvent,
    refetch: refetchEvent,
  } = useCommunityEvent(communityId, eventId);

  // Fetch attendees for the event
  const { 
    data: attendeesList, 
    isLoading: isLoadingAttendees 
  } = useEventAttendees(communityId, eventId);

  // Initialize cancellation mutation
  const cancelRegistrationMutation = useCancelEventRegistration();

  // Check if the current user is registered for this event
  const isUserRegistered = event?.isRegistered || false;

  // Determine if registration is possible based on capacity and event status
  const isEventFull = event?.maxAttendees !== null && (event?.currentAttendees || 0) >= (event?.maxAttendees || 0);
  const isRegistrationOpen = 
    event?.status === CommunityEventStatus.UPCOMING && 
    !isEventFull &&
    !isUserRegistered;

  // Handle registration form submission
  const handleRegistrationSubmit = (notes?: string) => {
    setIsRegistrationDialogOpen(false);
    toast({
      title: "Registration successful",
      description: "You have been registered for this event.",
    });
    // Refetch event data to update the UI
    refetchEvent();
  };

  // Handle registration cancellation
  const handleCancelRegistration = () => {
    cancelRegistrationMutation.mutate(
      { communityId, eventId },
      {
        onSuccess: () => {
          setIsCancellationDialogOpen(false);
          toast({
            title: "Registration cancelled",
            description: "Your registration has been cancelled successfully.",
          });
          // Refetch event data to update the UI
          refetchEvent();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  // Handle back navigation
  const handleBackToCommunity = () => {
    navigate(`/communities/${communityId}`);
  };

  // Loading state
  if (isLoadingEvent || isLoadingCommunity) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={handleBackToCommunity} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!event || !community) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load event details. The event may have been removed or you don't have permission to view it.
            <Button variant="link" onClick={handleBackToCommunity} className="ml-2 p-0">
              Return to community
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format dates
  const eventDate = new Date(event.eventDate);
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(eventDate, "h:mm a");
  const timeFromNow = formatDistanceToNow(eventDate, { addSuffix: true });
  
  // Format end date if available
  let endTimeDisplay = "";
  if (event.endDate) {
    const endDate = new Date(event.endDate);
    endTimeDisplay = ` - ${format(endDate, "h:mm a")}`;
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Back button and header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button variant="ghost" onClick={handleBackToCommunity} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {community.name}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(event.status)}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
          <Badge variant="outline">{getEventTypeDisplay(event.eventType)}</Badge>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription>
                    Hosted by {event.createdBy?.displayName || "Community Admin"}
                  </CardDescription>
                </div>
                {event.imageUrl && (
                  <div className="mt-4 md:mt-0">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full md:w-32 h-auto rounded-md object-cover"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">About this event</h3>
                <p className="text-muted-foreground">
                  {event.description || "No description provided."}
                </p>
              </div>

              {/* Event details */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{timeFromNow}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{formattedTime}{endTimeDisplay}</p>
                    {event.isRecurring && (
                      <p className="text-sm text-muted-foreground">
                        Recurring: {event.recurringPattern || "Weekly"}
                      </p>
                    )}
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                )}
                {event.isVirtual && event.virtualMeetingUrl && (
                  <div className="flex items-start">
                    <Video className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Virtual Meeting</p>
                      <a
                        href={event.virtualMeetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center"
                      >
                        Join meeting <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Skill level requirements if defined */}
              {(event.minSkillLevel || event.maxSkillLevel) && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Skill Level</h3>
                  <p className="text-muted-foreground">
                    {event.minSkillLevel && event.maxSkillLevel
                      ? `${event.minSkillLevel} to ${event.maxSkillLevel}`
                      : event.minSkillLevel
                      ? `Minimum: ${event.minSkillLevel}`
                      : `Maximum: ${event.maxSkillLevel}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Registration card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              {event.registrationDeadline && (
                <CardDescription>
                  Register by{" "}
                  {format(new Date(event.registrationDeadline), "MMMM d, yyyy")}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Capacity</span>
                  <span>
                    {event.maxAttendees
                      ? `${event.currentAttendees || 0} / ${event.maxAttendees}`
                      : "Unlimited"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={isEventFull ? "destructive" : "outline"}>
                    {isEventFull ? "Full" : "Open"}
                  </Badge>
                </div>
                {isUserRegistered && (
                  <Alert className="bg-secondary/50 border-secondary text-secondary-foreground">
                    <AlertTitle>You're registered!</AlertTitle>
                    <AlertDescription>
                      You've already registered for this event.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {isRegistrationOpen ? (
                <Button
                  className="w-full"
                  onClick={() => setIsRegistrationDialogOpen(true)}
                >
                  Register Now
                </Button>
              ) : isUserRegistered ? (
                <Button
                  variant="outline"
                  className="w-full text-destructive"
                  onClick={() => setIsCancellationDialogOpen(true)}
                >
                  Cancel Registration
                </Button>
              ) : (
                <Button disabled className="w-full">
                  {event.status === CommunityEventStatus.CANCELLED
                    ? "Event Cancelled"
                    : event.status === CommunityEventStatus.COMPLETED
                    ? "Event Completed"
                    : "Registration Closed"}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Attendees list */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Attendees</CardTitle>
                <Badge variant="outline">
                  {event.currentAttendees || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingAttendees ? (
                  // Loading state for attendees
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : attendeesList && attendeesList.length > 0 ? (
                  // Render attendees list
                  attendeesList.map((attendee) => (
                    <div key={attendee.id} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={attendee.user?.avatarUrl || undefined}
                          alt={attendee.user?.displayName || "Attendee"}
                        />
                        <AvatarFallback>
                          {attendee.user?.displayName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendee.user?.displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {attendee.user?.skillLevel || "Skill level not specified"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-2">
                    No attendees yet. Be the first to register!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration dialog */}
      <Dialog open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              Fill out the form below to register for this event.
            </DialogDescription>
          </DialogHeader>
          <EventRegistrationForm
            communityId={communityId}
            eventId={eventId}
            onSuccess={handleRegistrationSubmit}
            onCancel={() => setIsRegistrationDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Cancellation confirmation dialog */}
      <Dialog open={isCancellationDialogOpen} onOpenChange={setIsCancellationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your registration for this event?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancellationDialogOpen(false)}
              disabled={cancelRegistrationMutation.isPending}
            >
              No, Keep Registration
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelRegistration}
              disabled={cancelRegistrationMutation.isPending}
            >
              {cancelRegistrationMutation.isPending ? (
                <>
                  <span className="mr-2">Cancelling...</span>
                  <span className="animate-spin">⋯</span>
                </>
              ) : (
                "Yes, Cancel Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}