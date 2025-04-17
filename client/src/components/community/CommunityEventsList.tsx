/**
 * PKL-278651-COMM-0007-ENGAGE-UI
 * Community Events List Component
 * 
 * This component displays a list of events for a community with registration functionality.
 */
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  useCommunityEvents, 
  useRegisterForEvent, 
  useCancelEventRegistration 
} from "@/lib/hooks/useCommunity";
import { useToast } from "@/hooks/use-toast";
import { CommunityEvent } from "@/types/community";
import { Calendar, MapPin, Clock, Users, UserPlus, UserMinus } from "lucide-react";
import { format, isPast, isFuture } from "date-fns";
import { useUser } from "@/lib/hooks/useUser";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommunityEventsListProps {
  communityId: number;
  isMember: boolean;
}

export const CommunityEventsList = ({ communityId, isMember }: CommunityEventsListProps) => {
  const { toast } = useToast();
  const { data: user } = useUser();
  
  const { 
    data: events = [], 
    isLoading,
    error,
  } = useCommunityEvents(communityId);
  
  const registerForEvent = useRegisterForEvent();
  const cancelRegistration = useCancelEventRegistration();
  
  const handleRegister = async (eventId: number) => {
    if (!isMember) {
      toast({
        title: "Join Required",
        description: "Join this community to register for events.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await registerForEvent.mutateAsync(eventId);
      toast({
        title: "Registered",
        description: "You have successfully registered for this event.",
      });
    } catch (error) {
      console.error("Failed to register for event", error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for this event. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelRegistration = async (eventId: number) => {
    try {
      await cancelRegistration.mutateAsync(eventId);
      toast({
        title: "Registration Cancelled",
        description: "You have cancelled your registration for this event.",
      });
    } catch (error) {
      console.error("Failed to cancel registration", error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel your registration. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Group events into upcoming and past
  const upcomingEvents = events.filter(event => isFuture(new Date(event.eventDate)));
  const pastEvents = events.filter(event => isPast(new Date(event.eventDate)));
  
  // Sort upcoming events by date (soonest first)
  upcomingEvents.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  
  // Sort past events by date (most recent first)
  pastEvents.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  
  const isUserRegistered = (event: CommunityEvent) => {
    return event.userIsAttending; // Assuming this comes from the API
  };
  
  const renderEventCard = (event: CommunityEvent) => {
    const isPastEvent = isPast(new Date(event.eventDate));
    const userRegistered = isUserRegistered(event);
    const isAtCapacity = event.maxAttendees && event.currentAttendees >= event.maxAttendees;
    
    return (
      <Card key={event.id} className="mb-4">
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <span>
                {format(new Date(event.eventDate), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            
            {event.startTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-muted-foreground" />
                <span>
                  {format(new Date(event.startTime), "h:mm a")}
                  {event.endTime && ` - ${format(new Date(event.endTime), "h:mm a")}`}
                </span>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Users size={16} className="text-muted-foreground" />
              <span>
                {event.currentAttendees} {event.currentAttendees === 1 ? 'attendee' : 'attendees'}
                {event.maxAttendees && ` / ${event.maxAttendees} max`}
              </span>
              
              {isAtCapacity && !userRegistered && !isPastEvent && (
                <Badge variant="outline" className="ml-2">At Capacity</Badge>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          {isPastEvent ? (
            <Badge variant="secondary">Event Completed</Badge>
          ) : userRegistered ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <UserMinus size={16} /> Cancel Registration
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your registration for "{event.title}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Registration</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleCancelRegistration(event.id)}>
                    Cancel Registration
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button 
              disabled={isAtCapacity || !isMember || registerForEvent.isPending}
              onClick={() => handleRegister(event.id)}
              className="flex items-center gap-1"
            >
              <UserPlus size={16} /> Register
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  const renderSkeletons = (count: number) => {
    return Array(count).fill(0).map((_, i) => (
      <Card key={i} className="mb-4">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-24" />
        </CardFooter>
      </Card>
    ));
  };
  
  if (isLoading) {
    return <div>{renderSkeletons(2)}</div>;
  }
  
  if (error) {
    return (
      <Card className="text-center p-6">
        <div className="py-6">
          <h3 className="text-lg font-semibold mb-2">Error Loading Events</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading community events. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    );
  }
  
  if (events.length === 0) {
    return (
      <Card className="text-center p-6">
        <div className="py-10">
          <h3 className="text-xl font-semibold mb-2">No Events</h3>
          <p className="text-muted-foreground">
            There are no events scheduled for this community yet.
          </p>
          {user && isMember && user.role === 'admin' && (
            <Button className="mt-4">
              Create Event
            </Button>
          )}
        </div>
      </Card>
    );
  }
  
  return (
    <div>
      {upcomingEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar size={18} /> Upcoming Events
          </h3>
          {upcomingEvents.map(renderEventCard)}
        </div>
      )}
      
      {pastEvents.length > 0 && (
        <div>
          {upcomingEvents.length > 0 && <Separator className="my-6" />}
          
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
            <Calendar size={18} /> Past Events
          </h3>
          
          {pastEvents.slice(0, 3).map(renderEventCard)}
          
          {pastEvents.length > 3 && (
            <Button variant="outline" className="w-full mt-2">
              Show More Past Events
            </Button>
          )}
        </div>
      )}
    </div>
  );
};