/**
 * PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
 * Component for displaying a list of events
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, CheckIcon, MapPinIcon, UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatTime } from '@/lib/utils';
import { getUpcomingEvents } from '@/lib/sdk/eventSDK';
import type { Event } from '@shared/schema/events';
import { cn } from '@/lib/utils';

interface EventListProps {
  limit?: number;
  showViewButton?: boolean;
  onEventClick?: (event: Event) => void;
  className?: string;
}

export function EventList({ 
  limit = 5, 
  showViewButton = true,
  onEventClick,
  className = ''
}: EventListProps) {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['/api/events/upcoming', limit], 
    queryFn: () => getUpcomingEvents(limit)
  });

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Function to get event status badge
  const getEventStatusBadge = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

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
          <CardTitle>Error Loading Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to load upcoming events. Please try again later.
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
          <CardTitle>No Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There are no upcoming events scheduled at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render events list
  return (
    <div className={cn("space-y-4", className)}>
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
                  {formatDate(new Date(event.startDateTime), { month: 'short', day: 'numeric' })} at {formatTime(new Date(event.startDateTime))}
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
          </CardContent>
          {showViewButton && (
            <CardFooter className="pt-0">
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
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}

export default EventList;