/**
 * PKL-278651-COMM-0016-RSVP
 * Community Event Detail Page
 * 
 * This page displays detailed information about a community event 
 * and allows users to register or cancel registration.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-18
 */

import React, { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCommunity, useCommunityEvent, useEventAttendees, useCancelEventRegistration } from "@/lib/hooks/useCommunity";
import { format } from "date-fns";
import { MapPin, Calendar, Users, Clock, ArrowLeft, Loader2 } from "lucide-react";
import EventRegistrationForm from "@/components/community/EventRegistrationForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function CommunityEventDetailPage() {
  const [, setLocation] = useLocation();
  const { communityId, eventId } = useParams<{ communityId: string; eventId: string }>();
  const parsedCommunityId = parseInt(communityId);
  const parsedEventId = parseInt(eventId);
  
  // State for registration dialog
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  // Fetch event and community data
  const { data: community, isLoading: isLoadingCommunity } = useCommunity(parsedCommunityId);
  const { data: event, isLoading: isLoadingEvent, refetch: refetchEvent } = useCommunityEvent(parsedCommunityId, parsedEventId);
  const { data: attendees, isLoading: isLoadingAttendees } = useEventAttendees(parsedCommunityId, parsedEventId);
  
  // Registration cancellation mutation
  const cancelRegistration = useCancelEventRegistration();
  const { toast } = useToast();
  
  // Loading state
  if (isLoadingCommunity || isLoadingEvent) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-4">
          <Skeleton className="h-6 w-24 mr-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (!event || !community) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button variant="outline" onClick={() => setLocation(`/communities/${communityId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Community
          </Button>
        </div>
      </div>
    );
  }
  
  // Format event date and time
  const eventDate = new Date(event.eventDate);
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(eventDate, "h:mm a");
  
  // Format end date if available
  let formattedEndDate = "";
  let formattedEndTime = "";
  if (event.endDate) {
    const endDate = new Date(event.endDate);
    formattedEndDate = format(endDate, "EEEE, MMMM d, yyyy");
    formattedEndTime = format(endDate, "h:mm a");
  }
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming": return "bg-blue-500";
      case "ongoing": return "bg-green-500";
      case "completed": return "bg-gray-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };
  
  // Event type display name
  const getEventTypeName = (type: string) => {
    switch (type.toLowerCase()) {
      case "match_play": return "Match Play";
      case "clinic": return "Clinic";
      case "tournament": return "Tournament";
      case "social": return "Social";
      case "workshop": return "Workshop";
      case "league": return "League";
      default: return type;
    }
  };
  
  // Handle registration success
  const handleRegistrationSuccess = () => {
    setIsRegistrationFormOpen(false);
    refetchEvent();
    toast({
      title: "Successfully registered",
      description: "You have been registered for this event",
    });
  };
  
  // Handle registration cancellation
  const handleCancellation = () => {
    cancelRegistration.mutate(
      { communityId: parsedCommunityId, eventId: parsedEventId },
      {
        onSuccess: () => {
          setIsCancelDialogOpen(false);
          refetchEvent();
        }
      }
    );
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={() => setLocation(`/communities/${communityId}`)}
          className="mr-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Link href={`/communities/${communityId}`} className="text-blue-600 hover:underline">
          {community.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-muted-foreground">Events</span>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
              <CardDescription>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)} text-white`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold border border-gray-200">
                    {getEventTypeName(event.eventType)}
                  </span>
                  {event.isVirtual && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100">Virtual</span>
                  )}
                </div>
              </CardDescription>
            </div>
            <div className="mt-2 sm:mt-0">
              {event.createdByUserId === community.createdByUserId ? (
                <Button variant="outline" disabled>
                  Event Creator
                </Button>
              ) : event.isRegistered ? (
                <Button 
                  variant="destructive"
                  onClick={() => setIsCancelDialogOpen(true)}
                  disabled={cancelRegistration.isPending}
                >
                  {cancelRegistration.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Registration"
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => setIsRegistrationFormOpen(true)}
                  disabled={
                    event.status !== "upcoming" || 
                    (!!event.maxAttendees && (event.currentAttendees || 0) >= event.maxAttendees)
                  }
                >
                  Register Now
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event details */}
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{formattedDate}</p>
                <p className="text-sm text-muted-foreground">
                  {formattedTime}
                  {event.endDate && formattedDate === formattedEndDate && (
                    <> - {formattedEndTime}</>
                  )}
                </p>
                {event.endDate && formattedDate !== formattedEndDate && (
                  <p className="text-sm text-muted-foreground">
                    Until {formattedEndDate} at {formattedEndTime}
                  </p>
                )}
              </div>
            </div>
            
            {event.location && !event.isVirtual && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}
            
            {event.isVirtual && event.virtualMeetingUrl && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Virtual Event</p>
                  <a 
                    href={event.virtualMeetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {event.virtualMeetingUrl}
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <Users className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Attendees</p>
                <p className="text-sm text-muted-foreground">
                  {event.currentAttendees || 0} 
                  {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
                  {event.maxAttendees && (event.currentAttendees || 0) >= event.maxAttendees && (
                    <span className="text-red-500 ml-2">(Full)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Event description */}
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {event.description || "No description provided."}
            </p>
          </div>
          
          {/* Skill level requirements if specified */}
          {(event.minSkillLevel || event.maxSkillLevel) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Skill Level Requirements</h3>
                <p className="text-muted-foreground">
                  {event.minSkillLevel && event.maxSkillLevel 
                    ? `${event.minSkillLevel} - ${event.maxSkillLevel}`
                    : event.minSkillLevel 
                      ? `Minimum: ${event.minSkillLevel}` 
                      : `Maximum: ${event.maxSkillLevel}`}
                </p>
              </div>
            </>
          )}
          
          {/* Attendees list */}
          {attendees && attendees.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-2">Attendees</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center p-2 border rounded">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                        {attendee.user && (
                          (attendee.user.displayName?.[0] || attendee.user.username?.[0] || '?').toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {attendee.user ? (attendee.user.displayName || attendee.user.username || 'Anonymous') : 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attendee.registeredAt ? format(new Date(attendee.registeredAt), "MMM d, yyyy") : 'Recently registered'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Created by community admin • Last updated {event.updatedAt || event.createdAt ? format(new Date(event.updatedAt || event.createdAt), "MMM d, yyyy") : "recently"}
          </p>
        </CardFooter>
      </Card>
      
      {/* Registration form dialog */}
      <Dialog open={isRegistrationFormOpen} onOpenChange={setIsRegistrationFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
          </DialogHeader>
          <EventRegistrationForm 
            communityId={parsedCommunityId}
            eventId={parsedEventId}
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setIsRegistrationFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Cancellation confirmation dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel registration?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your registration for {event.title}? 
              You can register again later if spots are available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep My Registration</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancellation} disabled={cancelRegistration.isPending}>
              {cancelRegistration.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Registration"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}