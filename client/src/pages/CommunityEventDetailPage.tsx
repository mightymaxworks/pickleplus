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
import {
  useCommunityEvent,
  useCancelEventRegistration,
  useCommunity,
} from "@/lib/hooks/useCommunity";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import { MapPin } from "lucide-react";
import { Users } from "lucide-react";
import { Info } from "lucide-react";
import { Clock } from "lucide-react";
import { Loader2 } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import {
  CommunityEvent,
  CommunityEventStatus,
  CommunityEventType,
  EventAttendeeStatus,
} from "@/types/community";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EventRegistrationForm from "@/components/community/EventRegistrationForm";
import { Skeleton } from "@/components/ui/skeleton";

// Function to get human-readable event type display name
function getEventTypeDisplay(type: CommunityEventType): string {
  const displayMap: Record<string, string> = {
    [CommunityEventType.MATCH_PLAY]: "Match Play",
    [CommunityEventType.CLINIC]: "Training Clinic",
    [CommunityEventType.TOURNAMENT]: "Tournament",
    [CommunityEventType.SOCIAL]: "Social Event",
    [CommunityEventType.WORKSHOP]: "Workshop",
    [CommunityEventType.LEAGUE]: "League Play",
  };
  return displayMap[type] || type;
}

// Function to get status badge variant based on event status
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

  // Initialize cancellation mutation
  const cancelRegistrationMutation = useCancelEventRegistration();

  // Check if the current user is registered for this event
  const isUserRegistered = event?.attendees?.some(
    (attendee) => attendee.status === EventAttendeeStatus.REGISTERED
  );

  // Determine if registration is possible based on capacity and event status
  const isEventFull = event?.attendeeCount >= (event?.capacity || 0);
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
      <div className="container max-w-4xl py-8">
        <div className="flex items-center mb-6 space-x-2">
          <Button variant="outline" onClick={handleBackToCommunity} className="mb-4">
            ← Back to Community
          </Button>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Skeleton className="h-24 w-full" />
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error state if event not found
  if (!event) {
    return (
      <div className="container max-w-4xl py-8">
        <Button variant="outline" onClick={handleBackToCommunity} className="mb-4">
          ← Back to Community
        </Button>
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Event not found</AlertTitle>
          <AlertDescription>
            The event you're looking for doesn't exist or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main render
  return (
    <div className="container max-w-4xl py-8">
      <Button variant="outline" onClick={handleBackToCommunity} className="mb-4">
        ← Back to {community?.name || "Community"}
      </Button>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <CardDescription className="text-base mt-1">
                {event.description}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(event.status)}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{formatTime(event.eventDate)} - {event.duration ? `${event.duration} minutes` : "TBD"}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{event.location || "Location TBD"}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{event.attendeeCount || 0} / {event.capacity || "Unlimited"} Participants</span>
                </div>
                <div className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Type: {getEventTypeDisplay(event.eventType)}</span>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
              <h3 className="text-lg font-semibold mb-4">Registration Status</h3>
              {isUserRegistered ? (
                <>
                  <Alert className="bg-primary/10 border-primary mb-4">
                    <AlertTitle>You're Registered!</AlertTitle>
                    <AlertDescription>
                      You have successfully registered for this event.
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsCancellationDialogOpen(true)}
                    disabled={event.status !== CommunityEventStatus.UPCOMING}
                  >
                    Cancel Registration
                  </Button>
                </>
              ) : event.status === CommunityEventStatus.CANCELLED ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Event Cancelled</AlertTitle>
                  <AlertDescription>
                    This event has been cancelled and is no longer accepting registrations.
                  </AlertDescription>
                </Alert>
              ) : event.status === CommunityEventStatus.COMPLETED ? (
                <Alert variant="default" className="mb-4">
                  <AlertTitle>Event Completed</AlertTitle>
                  <AlertDescription>
                    This event has already taken place.
                  </AlertDescription>
                </Alert>
              ) : isEventFull ? (
                <Alert variant="default" className="mb-4">
                  <AlertTitle>Event Full</AlertTitle>
                  <AlertDescription>
                    This event has reached its capacity. Please check back later as spots may open up.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert className="mb-4">
                    <AlertTitle>Registration Open</AlertTitle>
                    <AlertDescription>
                      Spots are available! Register now to secure your place.
                    </AlertDescription>
                  </Alert>
                  <Button
                    className="w-full"
                    onClick={() => setIsRegistrationDialogOpen(true)}
                  >
                    Register Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information - Tabs */}
      <Tabs defaultValue="attendees" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="details">Additional Details</TabsTrigger>
        </TabsList>
        <TabsContent value="attendees" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendees ({event.attendeeCount || 0})</CardTitle>
              <CardDescription>
                People who have registered for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              {event.attendees && event.attendees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.attendees.map((attendee) => (
                    <div key={attendee.userId} className="flex items-center space-x-3 p-2 border rounded-md">
                      <Avatar>
                        <AvatarImage src={attendee.user?.profileImageUrl} />
                        <AvatarFallback>
                          {attendee.user?.username.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{attendee.user?.username || "Anonymous User"}</div>
                        <div className="text-xs text-muted-foreground">
                          {attendee.status === EventAttendeeStatus.REGISTERED ? "Registered" : 
                           attendee.status === EventAttendeeStatus.WAITLISTED ? "Waitlisted" : 
                           attendee.status === EventAttendeeStatus.ATTENDED ? "Attended" : "Cancelled"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No attendees yet. Be the first to register!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Additional information about this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Organizer</h4>
                  <p className="text-muted-foreground">
                    {event.createdByUser?.username || community?.name || "Unknown"}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium">Full Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description || "No additional description provided."}
                  </p>
                </div>
                {event.additionalInformation && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium">Additional Information</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {event.additionalInformation}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Registration Dialog */}
      <Dialog open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              Complete your registration for this event
            </DialogDescription>
          </DialogHeader>
          <EventRegistrationForm
            onSubmit={handleRegistrationSubmit}
            onCancel={() => setIsRegistrationDialogOpen(false)}
            communityId={communityId}
            eventId={eventId}
          />
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={isCancellationDialogOpen} onOpenChange={setIsCancellationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your registration for this event?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsCancellationDialogOpen(false)}
              disabled={cancelRegistrationMutation.isPending}
            >
              Keep Registration
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelRegistration}
              disabled={cancelRegistrationMutation.isPending}
            >
              {cancelRegistrationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}