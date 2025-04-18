/**
 * PKL-278651-COMM-0014-UI
 * Event Card Component
 * 
 * This component displays a community event with details about the event,
 * including date, location, attendees, and registration options.
 */

import React from "react";
import { Link, useLocation } from "wouter";
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
// Removed useCommunityContext to fix hook order issues
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
  const [, navigate] = useLocation();
  
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
  
  // Check if we're on a mobile device for ultra-compact view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  // Get formatted dates and times
  const formattedDate = format(new Date(event.eventDate), isMobile ? 'MMM d' : 'EEEE, MMMM d, yyyy');
  const formattedTime = format(new Date(event.eventDate), 'h:mm a');
  const formattedEndTime = event.endDate ? format(new Date(event.endDate), 'h:mm a') : '';
  const timeUntilEvent = formatDistanceToNow(new Date(event.eventDate), { addSuffix: true });
  const shortMonthDate = format(new Date(event.eventDate), 'MMM d');
  
  // Handle registration and cancellation
  const handleRegister = () => {
    // Redirect to the event detail page for registration
    navigate(`/communities/${event.communityId}/events/${event.id}`);
  };
  
  const handleCancelRegistration = () => {
    // Cancel registration with communityId
    cancelMutation.mutate({ 
      communityId: event.communityId,
      eventId: event.id 
    });
  };

  // For mobile devices, use a completely different horizontal card layout
  if (isMobile && compact) {
    return (
      <Card className={cn(
        "overflow-hidden transition-all hover:shadow-md border-l-4 mb-2 max-h-24",
        isUpcoming && "border-l-blue-500",
        isOngoing && "border-l-green-500",
        isCompleted && "border-l-gray-500",
        isCancelled && "border-l-red-500 opacity-75"
      )}>
        <div className="flex h-full">
          {/* Left date column */}
          <div className={cn(
            "w-16 flex-shrink-0 flex flex-col items-center justify-center",
            isUpcoming && "bg-blue-50",
            isOngoing && "bg-green-50",
            isCompleted && "bg-gray-50",
            isCancelled && "bg-red-50 opacity-75"
          )}>
            <div className="text-xs uppercase">{format(new Date(event.eventDate), 'MMM')}</div>
            <div className="text-xl font-bold">{format(new Date(event.eventDate), 'd')}</div>
            <div className="text-xs">{format(new Date(event.eventDate), 'h:mm a')}</div>
          </div>
          
          {/* Middle content */}
          <div className="flex-1 py-2 px-2 flex flex-col justify-between min-w-0">
            <div>
              {/* Status and type badges on one line */}
              <div className="flex justify-between items-center gap-1 mb-1">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs h-5 py-0 px-1.5",
                    getEventTypeBadgeClass(event.eventType)
                  )}
                >
                  {formatEventType(event.eventType)}
                </Badge>
                <StatusBadge status={event.status} />
              </div>
              
              {/* Event title */}
              <h4 className="text-xs font-semibold line-clamp-1 mb-1">{event.title}</h4>
            </div>
            
            {/* Bottom info row */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {event.location ? (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-0.5 text-red-500" />
                  <span className="truncate max-w-[80px]">{event.location}</span>
                </div>
              ) : event.isVirtual ? (
                <div className="flex items-center">
                  <Video className="h-3 w-3 mr-0.5 text-blue-500" />
                  <span>Virtual</span>
                </div>
              ) : null}
              
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-0.5 text-violet-500" />
                <span>{event.currentAttendees}{event.maxAttendees && `/${event.maxAttendees}`}</span>
              </div>
            </div>
          </div>
          
          {/* Right action column */}
          <div className="w-10 flex flex-col items-center justify-center border-l">
            <Link 
              href={`/communities/${communityId || event.communityId}/events/${event.id}`}
              className="p-2 text-muted-foreground hover:text-primary rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Regular card layout for non-mobile or when not in compact mode
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
        <div className="absolute top-2 right-2 z-10">
          <StatusBadge status={event.status} />
        </div>
        
        {/* Header content */}
        <CardHeader className={cn(
          compact ? "px-3 py-2 sm:p-4" : "p-4 sm:p-6",
          "md:min-h-[90px] md:flex md:flex-col md:justify-between"
        )}>
          <div className="space-y-1">
            {/* Event type badge */}
            <Badge 
              variant="secondary" 
              className={cn(
                "mb-1 text-xs",
                getEventTypeBadgeClass(event.eventType)
              )}
            >
              {formatEventType(event.eventType)}
            </Badge>
            
            {/* Event title */}
            <CardTitle className={cn(
              "line-clamp-1 sm:line-clamp-2",
              compact ? "text-sm sm:text-lg" : "text-base sm:text-xl"
            )}>
              {event.title}
              {isCancelled && <span className="text-destructive"> (Cancelled)</span>}
            </CardTitle>
            
            {/* Event date and countdown */}
            <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{formattedDate}</span>
              {!compact && <span className="hidden sm:inline text-xs">({timeUntilEvent})</span>}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={cn(
          compact ? "px-3 py-1 sm:p-4 sm:pt-0" : "p-4 pt-0 sm:p-6 sm:pt-0",
          "min-h-[80px]"
        )}>
          {/* Event time */}
          <div className="flex items-center mb-2 text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span>
              {formattedTime}
              {formattedEndTime && ` - ${formattedEndTime}`}
            </span>
          </div>
          
          {/* Short description (if not compact) */}
          {!compact && event.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-2">
              {event.description}
            </p>
          )}
          
          {/* Location info - more compact layout */}
          <div className="flex flex-wrap gap-y-1 gap-x-2 sm:gap-y-2 sm:gap-x-4 text-xs sm:text-sm">
            {event.isVirtual ? (
              <div className="flex items-center">
                <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-500" />
                <span className="truncate">Virtual</span>
              </div>
            ) : event.location ? (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-red-500" />
                <span className="truncate">{event.location}</span>
              </div>
            ) : null}
            
            {/* Attendee count */}
            <div className="flex items-center">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-violet-500" />
              <span>
                {event.currentAttendees} 
                {event.maxAttendees !== null && ` / ${event.maxAttendees}`}
              </span>
            </div>
            
            {/* Skill level if specified */}
            {event.minSkillLevel && (
              <div className="flex items-center">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-amber-500" />
                <span className="truncate">{event.minSkillLevel}</span>
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
            compact ? "px-3 py-2 sm:p-4 sm:pt-0" : "p-4 pt-0 sm:p-6 sm:pt-0"
          )}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm h-8 sm:h-10"
              asChild
            >
              <Link href={`/communities/${communityId || event.communityId}/events/${event.id}`}>
                <span className="flex items-center">
                  <span className="sm:inline">View</span> Details
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </span>
              </Link>
            </Button>
            
            {isRegistered ? (
              <Button
                variant="destructive"
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-10"
                onClick={handleCancelRegistration}
                disabled={cancelMutation.isPending || isCompleted || isCancelled}
              >
                {cancelMutation.isPending ? "Cancelling..." : 
                 <span className="flex items-center whitespace-nowrap">
                   <span className="hidden sm:inline">Cancel </span>Unregister
                 </span>}
              </Button>
            ) : canRegister ? (
              <Button
                variant={eventIsFull ? "outline" : "default"}
                size="sm"
                className="text-xs sm:text-sm h-8 sm:h-10"
                onClick={handleRegister}
                disabled={registerMutation.isPending || (eventIsFull && !event.isPrivate)}
              >
                {registerMutation.isPending 
                  ? "Registering..." 
                  : eventIsFull 
                    ? "Join Waitlist" 
                    : "Register"}
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
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs py-0 px-2 h-5">
          Upcoming
        </Badge>
      );
    case CommunityEventStatus.ONGOING:
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs py-0 px-2 h-5">
          <Sparkles className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">Happening </span>Now
        </Badge>
      );
    case CommunityEventStatus.COMPLETED:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs py-0 px-2 h-5">
          Completed
        </Badge>
      );
    case CommunityEventStatus.CANCELLED:
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-xs py-0 px-2 h-5">
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