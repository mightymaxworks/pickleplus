/**
 * PKL-278651-COMM-0014-UI
 * Event Card Component
 * 
 * This component displays a community event with details about the event,
 * including date, location, attendees, and registration options.
 */

import React from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useCommunityContext } from "@/lib/providers/CommunityProvider";
import { useRegisterForEvent, useCancelEventRegistration } from "@/lib/hooks/useCommunity";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Video, 
  Trophy, 
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { 
  CommunityEvent, 
  CommunityEventStatus, 
  CommunityEventType,
  EventAttendeeStatus
} from "@/types/community";
import { 
  format, 
  formatDistanceToNow, 
  isSameDay, 
  isAfter,
  addMinutes, 
  isPast, 
  parseISO
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: CommunityEvent;
  communityId?: number;
  compact?: boolean;
  showActions?: boolean;
}

export function EventCard({ 
  event, 
  communityId,
  compact = false, 
  showActions = true 
}: EventCardProps) {
  const { toast } = useToast();
  
  // Mutations for event registration
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelEventRegistration();
  
  // Calculate status and display properties
  const isUpcoming = event.status === CommunityEventStatus.UPCOMING;
  const isOngoing = event.status === CommunityEventStatus.ONGOING;
  const isCancelled = event.status === CommunityEventStatus.CANCELLED;
  const isCompleted = event.status === CommunityEventStatus.COMPLETED;
  
  const isRegistered = event.isRegistered || false;
  const isWaitlisted = event.registrationStatus === EventAttendeeStatus.WAITLISTED;
  const eventIsFull = event.maxAttendees !== null && event.currentAttendees >= event.maxAttendees;
  const canRegister = isUpcoming && !isRegistered && !isPast(new Date(event.registrationDeadline || event.eventDate));
  
  // Get formatted dates and times
  const formattedDate = format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy');
  const formattedTime = format(new Date(event.eventDate), 'h:mm a');
  const formattedEndTime = event.endDate ? format(new Date(event.endDate), 'h:mm a') : '';
  const timeUntilEvent = formatDistanceToNow(new Date(event.eventDate), { addSuffix: true });
  
  // Handle registration and cancellation
  const handleRegister = () => {
    registerMutation.mutate({ eventId: event.id });
  };
  
  const handleCancelRegistration = () => {
    cancelMutation.mutate(event.id);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md border-l-4",
      isUpcoming && "border-l-blue-500",
      isOngoing && "border-l-green-500",
      isCompleted && "border-l-gray-500",
      isCancelled && "border-l-red-500 opacity-75"
    )}>
      <div className="relative">
        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={event.status} />
        </div>
        
        {/* Header content */}
        <CardHeader className={compact ? "p-4" : "p-6"}>
          <div className="space-y-1">
            {/* Event type badge */}
            <Badge 
              variant="secondary" 
              className={cn(
                "mb-1",
                getEventTypeBadgeClass(event.eventType)
              )}
            >
              {formatEventType(event.eventType)}
            </Badge>
            
            {/* Event title */}
            <CardTitle className={`${compact ? "text-lg" : "text-xl"}`}>
              {event.title}
              {isCancelled && <span className="text-destructive"> (Cancelled)</span>}
            </CardTitle>
            
            {/* Event date and countdown */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
              {!compact && <span className="text-sm">({timeUntilEvent})</span>}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={compact ? "p-4 pt-0" : "p-6 pt-0"}>
          {/* Event time */}
          <div className="flex items-center mb-3 text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {formattedTime}
              {formattedEndTime && ` - ${formattedEndTime}`}
            </span>
          </div>
          
          {/* Short description (if not compact) */}
          {!compact && event.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {event.description}
            </p>
          )}
          
          {/* Location info */}
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm">
            {event.isVirtual ? (
              <div className="flex items-center">
                <Video className="h-4 w-4 mr-2 text-blue-500" />
                <span>Virtual Event</span>
              </div>
            ) : event.location ? (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-red-500" />
                <span>{event.location}</span>
              </div>
            ) : null}
            
            {/* Attendee count */}
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-violet-500" />
              <span>
                {event.currentAttendees} 
                {event.maxAttendees !== null && ` / ${event.maxAttendees}`} attendees
              </span>
            </div>
            
            {/* Skill level if specified */}
            {event.skillLevelRequired && (
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                <span>{event.skillLevelRequired}</span>
              </div>
            )}
          </div>
          
          {/* Tags or special indicators */}
          {!compact && (
            <div className="flex flex-wrap gap-2 mt-4">
              {event.isPrivate && (
                <Badge variant="outline" className="text-xs">
                  Private
                </Badge>
              )}
              
              {event.isRecurring && (
                <Badge variant="outline" className="text-xs">
                  Recurring Event
                </Badge>
              )}
              
              {/* Show registration status badges */}
              {isRegistered && !isWaitlisted && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Registered
                </Badge>
              )}
              
              {isWaitlisted && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Waitlisted
                </Badge>
              )}
              
              {eventIsFull && !isRegistered && !isCancelled && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs">
                  Full
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        
        {/* Action buttons */}
        {showActions && (
          <CardFooter className={cn(
            "flex justify-between gap-2",
            compact ? "p-4 pt-0" : "p-6 pt-0"
          )}>
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              asChild
            >
              <Link href={`/communities/${communityId || event.communityId}/events/${event.id}`}>
                <span className="flex items-center">
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </Link>
            </Button>
            
            {isRegistered ? (
              <Button
                variant="destructive"
                size={compact ? "sm" : "default"}
                onClick={handleCancelRegistration}
                disabled={cancelMutation.isPending || isCompleted || isCancelled}
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Registration"}
              </Button>
            ) : canRegister ? (
              <Button
                variant={eventIsFull ? "outline" : "default"}
                size={compact ? "sm" : "default"}
                onClick={handleRegister}
                disabled={registerMutation.isPending || (eventIsFull && !event.isPrivate)}
              >
                {registerMutation.isPending 
                  ? "Registering..." 
                  : eventIsFull 
                    ? "Join Waitlist" 
                    : "Register"
                }
              </Button>
            ) : null}
          </CardFooter>
        )}
      </div>
    </Card>
  );
}

// Helper component for status badges
function StatusBadge({ status }: { status: CommunityEventStatus }) {
  switch (status) {
    case CommunityEventStatus.UPCOMING:
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          Upcoming
        </Badge>
      );
    case CommunityEventStatus.ONGOING:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <Sparkles className="h-3 w-3 mr-1" />
          Happening Now
        </Badge>
      );
    case CommunityEventStatus.COMPLETED:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          Completed
        </Badge>
      );
    case CommunityEventStatus.CANCELLED:
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return null;
  }
}

// Helper functions to format enum values
function formatEventType(type: CommunityEventType): string {
  switch (type) {
    case CommunityEventType.MATCH_PLAY:
      return "Match Play";
    case CommunityEventType.CLINIC:
      return "Clinic";
    case CommunityEventType.TOURNAMENT:
      return "Tournament";
    case CommunityEventType.SOCIAL:
      return "Social";
    case CommunityEventType.WORKSHOP:
      return "Workshop";
    case CommunityEventType.LEAGUE:
      return "League";
    default:
      return type;
  }
}

// Get appropriate badge styling for event type
function getEventTypeBadgeClass(type: CommunityEventType): string {
  switch (type) {
    case CommunityEventType.MATCH_PLAY:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case CommunityEventType.CLINIC:
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case CommunityEventType.TOURNAMENT:
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case CommunityEventType.SOCIAL:
      return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    case CommunityEventType.WORKSHOP:
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
    case CommunityEventType.LEAGUE:
      return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
    default:
      return "";
  }
}