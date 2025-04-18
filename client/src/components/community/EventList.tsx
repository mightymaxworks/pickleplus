/**
 * PKL-278651-COMM-0014-EVLIST
 * Enhanced Event List Component - Framework 5.1 Implementation
 * 
 * Simplified structure of the component to resolve hooks order issues
 * 
 * @version 3.0.0
 * @lastModified 2025-04-18
 */

import React, { useState } from "react";
import { useCommunityEvents } from "@/lib/hooks/useCommunity";
import { EventCard } from "./EventCard";
import { EventFilterCard, EventFilters } from "./EventFilterCard";
import { EventCreationModal } from "./EventCreationModal";
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
  Filter,
  CalendarDays,
  CalendarClock,
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
  Clock,
  Users,
  ChevronDown,
  RefreshCw,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  format, 
  compareAsc, 
  isBefore, 
  isAfter, 
  isSameDay,
  isToday
} from "date-fns";

interface EventListProps {
  communityId: number;
  layout?: "grid" | "list" | "calendar";
  showFilter?: boolean;
  limit?: number;
  compact?: boolean;
  defaultView?: string;
  initialFilters?: EventFilters;
  showActions?: boolean;
}

export function EventList({ 
  communityId, 
  layout: initialLayout = "list", 
  showFilter = true,
  limit = 20,
  compact = false,
  defaultView = "all",
  initialFilters,
  showActions = true
}: EventListProps) {
  // All state declarations first to maintain consistent hooks order
  const [currentView, setCurrentView] = useState(defaultView);
  const [layout, setLayout] = useState<"grid" | "list" | "calendar">(initialLayout);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [filters, setFilters] = useState<EventFilters>(initialFilters || {});
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<"date" | "popularity" | "recent" | "alphabetical">("date");

  // Then the query hook
  const {
    data: allEvents = [],
    isLoading,
    isError,
    refetch
  } = useCommunityEvents(communityId, {
    limit: layout === "calendar" ? 100 : limit,
    enabled: true,
  });

  // Helper functions defined outside of component rendering logic
  const toggleMobileFilter = () => {
    setMobileFilterOpen(!mobileFilterOpen);
  };
  
  const handleLayoutChange = (newLayout: "grid" | "list" | "calendar") => {
    setLayout(newLayout);
  };
  
  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
  };

  // Filter and sort events outside of hooks
  const getFilteredAndSortedEvents = () => {
    let filteredEvents = [...allEvents];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(queryLower) || 
        (event.description && event.description.toLowerCase().includes(queryLower)) ||
        (event.location && event.location.toLowerCase().includes(queryLower))
      );
    }
    
    // Filter by tab view
    switch (currentView) {
      case "upcoming":
        filteredEvents = filteredEvents.filter(event => event.status === CommunityEventStatus.UPCOMING);
        break;
      case "ongoing":
        filteredEvents = filteredEvents.filter(event => event.status === CommunityEventStatus.ONGOING);
        break;
      case "past":
        filteredEvents = filteredEvents.filter(event => 
          event.status === CommunityEventStatus.COMPLETED || 
          event.status === CommunityEventStatus.CANCELLED
        );
        break;
      // "all" view - no filtering needed
    }
    
    // Calendar date filter
    if (layout === "calendar" && selectedDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.eventDate);
        return isSameDay(eventDate, selectedDate);
      });
    }
    
    // Apply additional filters
    if (filters.types && filters.types.length > 0) {
      filteredEvents = filteredEvents.filter(event => filters.types?.includes(event.eventType));
    }
    
    if (filters.statuses && filters.statuses.length > 0) {
      filteredEvents = filteredEvents.filter(event => filters.statuses?.includes(event.status));
    }
    
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.eventDate);
        
        if (filters.dateRange?.from && filters.dateRange?.to) {
          return (
            (isAfter(eventDate, filters.dateRange.from) || isSameDay(eventDate, filters.dateRange.from)) && 
            (isBefore(eventDate, filters.dateRange.to) || isSameDay(eventDate, filters.dateRange.to))
          );
        } else if (filters.dateRange?.from) {
          return isAfter(eventDate, filters.dateRange.from) || isSameDay(eventDate, filters.dateRange.from);
        } else if (filters.dateRange?.to) {
          return isBefore(eventDate, filters.dateRange.to) || isSameDay(eventDate, filters.dateRange.to);
        }
        
        return true;
      });
    }
    
    if (filters.userAttending) {
      filteredEvents = filteredEvents.filter(event => event.isRegistered);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "date":
        // Sort events by date with intelligent ordering
        filteredEvents.sort((a, b) => {
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
          
          // Then by date
          const dateA = new Date(a.eventDate);
          const dateB = new Date(b.eventDate);
          
          if (a.status === CommunityEventStatus.UPCOMING || a.status === CommunityEventStatus.ONGOING) {
            return compareAsc(dateA, dateB);
          } else {
            return compareAsc(dateB, dateA); // Newest past events first
          }
        });
        break;
        
      case "popularity":
        // Sort by attendance count (highest first)
        filteredEvents.sort((a, b) => (b.currentAttendees || 0) - (a.currentAttendees || 0));
        break;
        
      case "recent":
        // Sort by created date (newest first)
        filteredEvents.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return compareAsc(dateB, dateA);
        });
        break;
        
      case "alphabetical":
        // Sort alphabetically by title
        filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    return filteredEvents;
  };

  // Helper functions for event calendar view
  const getEventsByDate = () => {
    const eventsByDate: Record<string, CommunityEvent[]> = {};
    
    allEvents.forEach(event => {
      const date = format(new Date(event.eventDate), 'yyyy-MM-dd');
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(event);
    });
    
    return eventsByDate;
  };

  // Non-reactive counts
  const upcomingCount = allEvents.filter(e => e.status === CommunityEventStatus.UPCOMING).length;
  const ongoingCount = allEvents.filter(e => e.status === CommunityEventStatus.ONGOING).length;
  const pastCount = allEvents.filter(e => 
    e.status === CommunityEventStatus.COMPLETED || 
    e.status === CommunityEventStatus.CANCELLED
  ).length;

  // Get filtered events only when rendering
  const filteredEvents = getFilteredAndSortedEvents();
  const eventsByDate = getEventsByDate();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={cn("space-y-4", showFilter ? "md:col-span-2" : "md:col-span-3")}>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          
          {showFilter && (
            <div className="hidden md:block md:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
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

  // Empty state
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
          <EventCreationModal 
            communityId={communityId}
            onEventCreated={refetch}
          />
        </CardFooter>
      </Card>
    );
  }

  // This is now redundant since we added a default value in the function parameter
  // const showEventActions = showActions;

  // Main UI render
  return (
    <div className="space-y-6">
      {/* Enhanced toolbar */}
      <div className="flex flex-col space-y-4">
        {/* Main toolbar with tabs and layout options */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Tabs 
            value={currentView} 
            onValueChange={setCurrentView}
            className="flex-1"
          >
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all" className="relative">
                All
                <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                  {allEvents.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="relative">
                Upcoming
                {upcomingCount > 0 && (
                  <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                    {upcomingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="relative">
                Ongoing
                {ongoingCount > 0 && (
                  <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                    {ongoingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="relative">
                Past
                {pastCount > 0 && (
                  <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
                    {pastCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            {/* View layout selectors */}
            <TooltipProvider>
              <div className="border rounded-md flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={layout === "list" ? "default" : "ghost"} 
                      size="sm"
                      className="rounded-r-none"
                      onClick={() => handleLayoutChange("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>List View</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={layout === "grid" ? "default" : "ghost"} 
                      size="sm"
                      className="rounded-none border-l border-r"
                      onClick={() => handleLayoutChange("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Grid View</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={layout === "calendar" ? "default" : "ghost"} 
                      size="sm"
                      className="rounded-l-none"
                      onClick={() => handleLayoutChange("calendar")}
                    >
                      <CalendarDays className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Calendar View</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            
            {/* Mobile filter button */}
            <div className="md:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleMobileFilter}
                className="gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                <Badge className="ml-1">{Object.keys(filters).length}</Badge>
              </Button>
            </div>
            
            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1 hidden sm:flex"
                >
                  <span>Sort</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort Events</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("date")}
                    className={sortBy === "date" ? "bg-accent" : ""}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>Date (Default)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("popularity")}
                    className={sortBy === "popularity" ? "bg-accent" : ""}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span>Popularity</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("recent")}
                    className={sortBy === "recent" ? "bg-accent" : ""}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Recently Added</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy("alphabetical")}
                    className={sortBy === "alphabetical" ? "bg-accent" : ""}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <span>Alphabetical</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Refresh button */}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => refetch()}
              className="hidden sm:inline-flex"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {/* Create event button */}
            <EventCreationModal 
              communityId={communityId}
              onEventCreated={refetch}
            />
          </div>
        </div>
        
        {/* Search bar and filter toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Desktop filter toggle */}
          {showFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="gap-1 hidden md:flex"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {Object.keys(filters).filter(k => 
                    Array.isArray(filters[k as keyof EventFilters]) 
                      ? (filters[k as keyof EventFilters] as any[]).length > 0
                      : Boolean(filters[k as keyof EventFilters])
                  ).length}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile filter drawer */}
      <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Event Filters</DrawerTitle>
            <DrawerDescription>
              Filter events by type, status, and date
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <EventFilterCard
              filters={filters}
              onChange={handleFilterChange}
              onClose={() => setMobileFilterOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Main content area with filter sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Events list/grid */}
        <div className={cn(
          "space-y-6", 
          showFilter && showSidebar ? "md:col-span-2" : "md:col-span-3"
        )}>
          {/* No results state */}
          {filteredEvents.length === 0 && (
            <Card className="border-dashed bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Filter className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">No matching events found</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button variant="outline" onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}>
                    Clear all filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Grid layout */}
          {layout === "grid" && filteredEvents.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  communityId={communityId}
                  compact={compact}
                  showActions={showActions}
                />
              ))}
            </div>
          )}
          
          {/* List layout */}
          {layout === "list" && filteredEvents.length > 0 && (
            <div className="flex flex-col gap-4">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  communityId={communityId}
                  compact={true}
                  showActions={showActions}
                />
              ))}
            </div>
          )}
          
          {/* Calendar layout */}
          {layout === "calendar" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Event Calendar</CardTitle>
                  <div className="flex items-center gap-2">
                    {selectedDate && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDate(undefined)}
                        className="text-xs h-8 px-2"
                      >
                        Clear Selection
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedDate(new Date())}
                      className="text-xs h-8 px-2"
                    >
                      Today
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date to view events'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-[300px] rounded-md border">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      className="rounded-md"
                      modifiers={{
                        hasEvent: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return Boolean(eventsByDate[dateStr] && eventsByDate[dateStr].length > 0);
                        },
                        today: (date) => isToday(date)
                      }}
                      modifiersClassNames={{
                        hasEvent: "bg-primary/10 font-bold",
                        today: "bg-accent text-accent-foreground"
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {selectedDate ? (
                      <>
                        <h3 className="text-lg font-semibold mb-4">
                          Events on {format(selectedDate, 'MMMM d, yyyy')}
                        </h3>
                        
                        {filteredEvents.length > 0 ? (
                          <div className="flex flex-col gap-4">
                            {filteredEvents.map((event) => (
                              <EventCard
                                key={event.id}
                                event={event}
                                communityId={communityId}
                                compact={true}
                                showActions={showActions}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No events scheduled for this day.</p>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <CalendarDays className="h-12 w-12 text-muted-foreground mb-3" />
                        <h3 className="text-lg font-medium mb-2">Select a date</h3>
                        <p className="text-muted-foreground text-sm">
                          Choose a date from the calendar to view events
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Filter sidebar (desktop only) */}
        {showFilter && showSidebar && (
          <div className="hidden md:block">
            <EventFilterCard
              filters={filters}
              onChange={handleFilterChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}