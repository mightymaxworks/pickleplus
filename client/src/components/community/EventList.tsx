/**
 * PKL-278651-COMM-0014-UI
 * Event List Component
 * 
 * This component displays a filterable list of community events with the ability
 * to filter by event type, status, and date range.
 */

import React, { useState, useEffect } from "react";
import { useCommunityEvents, useCommunityEventsByType, useCommunityEventsByStatus } from "@/lib/hooks/useCommunity";
import { EventCard } from "./EventCard";
import { EventFilterCard, EventFilters } from "./EventFilterCard";
import { 
  CommunityEventStatus, 
  CommunityEventType, 
  CommunityEvent 
} from "@/types/community";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  CalendarDays, 
  CalendarClock, 
  Users, 
  Calendar as CalendarIcon,
  ChevronDown
} from "lucide-react";
import { compareAsc, parseISO, isBefore, isAfter, isSameDay } from "date-fns";

interface EventListProps {
  communityId: number;
  layout?: "grid" | "list" | "calendar";
  showFilter?: boolean;
  limit?: number;
  compact?: boolean;
  defaultView?: string;
  initialFilters?: EventFilters;
}

export function EventList({ 
  communityId, 
  layout = "list", 
  showFilter = true,
  limit = 10,
  compact = false,
  defaultView = "all",
  initialFilters
}: EventListProps) {
  // Current view tab (all, upcoming, ongoing, past)
  const [currentView, setCurrentView] = useState(defaultView);
  
  // Filters state
  const [filters, setFilters] = useState<EventFilters>(initialFilters || {});
  
  // Fetch all events for the community
  const {
    data: allEvents = [],
    isLoading,
    isError,
    refetch
  } = useCommunityEvents(communityId, {
    limit,
    enabled: true,
  });
  
  // Apply client-side filtering
  const filteredEvents = React.useMemo(() => {
    let events = [...allEvents];
    
    // Filter by tab view
    if (currentView === "upcoming") {
      events = events.filter(event => event.status === CommunityEventStatus.UPCOMING);
    } else if (currentView === "ongoing") {
      events = events.filter(event => event.status === CommunityEventStatus.ONGOING);
    } else if (currentView === "past") {
      events = events.filter(event => 
        event.status === CommunityEventStatus.COMPLETED || 
        event.status === CommunityEventStatus.CANCELLED
      );
    }
    
    // Apply additional filters
    if (filters.types && filters.types.length > 0) {
      events = events.filter(event => filters.types?.includes(event.eventType));
    }
    
    if (filters.statuses && filters.statuses.length > 0) {
      events = events.filter(event => filters.statuses?.includes(event.status));
    }
    
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      events = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        
        if (filters.dateRange?.from && filters.dateRange?.to) {
          // Between from and to dates (inclusive)
          return (
            (isAfter(eventDate, filters.dateRange.from) || isSameDay(eventDate, filters.dateRange.from)) && 
            (isBefore(eventDate, filters.dateRange.to) || isSameDay(eventDate, filters.dateRange.to))
          );
        } else if (filters.dateRange?.from) {
          // On or after from date
          return isAfter(eventDate, filters.dateRange.from) || isSameDay(eventDate, filters.dateRange.from);
        } else if (filters.dateRange?.to) {
          // On or before to date
          return isBefore(eventDate, filters.dateRange.to) || isSameDay(eventDate, filters.dateRange.to);
        }
        
        return true;
      });
    }
    
    if (filters.userAttending) {
      events = events.filter(event => event.isRegistered);
    }
    
    // TODO: Add filter for events created by the user when that data is available
    if (filters.userOwned) {
      // This would require the current user ID to compare with event.createdByUserId
      // events = events.filter(event => event.createdByUserId === currentUserId);
    }
    
    // Sort events by date (upcoming first)
    events.sort((a, b) => {
      // First by status (upcoming > ongoing > completed > cancelled)
      const statusOrder = {
        [CommunityEventStatus.ONGOING]: 0,
        [CommunityEventStatus.UPCOMING]: 1,
        [CommunityEventStatus.COMPLETED]: 2,
        [CommunityEventStatus.CANCELLED]: 3,
      };
      
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Then by date (ascending for upcoming, descending for past)
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      
      if (a.status === CommunityEventStatus.UPCOMING || a.status === CommunityEventStatus.ONGOING) {
        return compareAsc(dateA, dateB);
      } else {
        return compareAsc(dateB, dateA); // Newest past events first
      }
    });
    
    return events;
  }, [allEvents, currentView, filters]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };
  
  // Count events by status
  const upcomingCount = allEvents.filter(e => e.status === CommunityEventStatus.UPCOMING).length;
  const ongoingCount = allEvents.filter(e => e.status === CommunityEventStatus.ONGOING).length;
  const pastCount = allEvents.filter(e => 
    e.status === CommunityEventStatus.COMPLETED || 
    e.status === CommunityEventStatus.CANCELLED
  ).length;

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          </div>
          
          {showFilter && (
            <div className="md:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error loading the community events. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Render empty state
  if (allEvents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No Events Found</CardTitle>
          <CardDescription>
            This community doesn't have any scheduled events yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-center">
              <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Check back later or create a new event.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="default">Create Event</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs for basic filtering */}
      <Tabs 
        value={currentView} 
        onValueChange={setCurrentView}
        className="w-full"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" className="relative">
              All
              <Badge variant="secondary" className="ml-1">
                {allEvents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="relative">
              Upcoming
              {upcomingCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {upcomingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="relative">
              Ongoing
              {ongoingCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {ongoingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="relative">
              Past
              {pastCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pastCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="hidden md:flex"
              onClick={() => setFilters({})}
              disabled={Object.keys(filters).length === 0}
            >
              Reset Filters
            </Button>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Events list */}
          <div className="md:col-span-2">
            <TabsContent value="all" className="m-0">
              {renderEventList(filteredEvents, communityId, compact)}
            </TabsContent>
            
            <TabsContent value="upcoming" className="m-0">
              {renderEventList(filteredEvents, communityId, compact)}
            </TabsContent>
            
            <TabsContent value="ongoing" className="m-0">
              {renderEventList(filteredEvents, communityId, compact)}
            </TabsContent>
            
            <TabsContent value="past" className="m-0">
              {renderEventList(filteredEvents, communityId, compact)}
            </TabsContent>
          </div>
          
          {/* Filter sidebar */}
          {showFilter && (
            <div className="md:col-span-1">
              <EventFilterCard 
                onFilterChange={handleFilterChange}
                initialFilters={filters}
                communityId={communityId}
              />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}

// Helper function to render event list with appropriate empty states
function renderEventList(events: CommunityEvent[], communityId: number, compact: boolean) {
  if (events.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex justify-center py-6">
            <div className="text-center">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No events match your current filters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          communityId={communityId}
          compact={compact}
        />
      ))}
    </div>
  );
}