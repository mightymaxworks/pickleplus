/**
 * PKL-278651-COMM-0014-EVLIST
 * Enhanced Event List Component
 * 
 * This component displays a filterable list of community events with advanced 
 * filtering, calendar view, responsive design, and optimized UX.
 * 
 * @version 2.0.0
 * @lastModified 2025-04-17
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  addDays, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval, 
  isSameMonth, 
  compareAsc, 
  parseISO, 
  isBefore, 
  isAfter, 
  isSameDay,
  isToday,
  isWithinInterval,
  startOfDay,
  endOfDay,
  formatISO
} from "date-fns";

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
  layout: initialLayout = "list", 
  showFilter = true,
  limit = 20,
  compact = false,
  defaultView = "all",
  initialFilters
}: EventListProps) {
  // View and layout states
  const [currentView, setCurrentView] = useState(defaultView);
  const [layout, setLayout] = useState<"grid" | "list" | "calendar">(initialLayout);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected date for calendar view
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  
  // Filters state
  const [filters, setFilters] = useState<EventFilters>(initialFilters || {});
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  
  // Sorting options
  const [sortBy, setSortBy] = useState<"date" | "popularity" | "recent" | "alphabetical">("date");
  
  // Fetch all events for the community with increased limit for calendar view
  const {
    data: allEvents = [],
    isLoading,
    isError,
    refetch
  } = useCommunityEvents(communityId, {
    limit: layout === "calendar" ? 100 : limit, // Fetch more events for calendar view
    enabled: true,
  });
  
  // Apply client-side filtering
  const filteredEvents = useMemo(() => {
    let events = [...allEvents];
    
    // Filter by search query (if any)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      events = events.filter(event => 
        event.title.toLowerCase().includes(query) || 
        (event.description && event.description.toLowerCase().includes(query)) ||
        (event.location && event.location.toLowerCase().includes(query))
      );
    }
    
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
    
    // Filter for calendar view - if we have a selected date in calendar view
    if (layout === "calendar" && selectedDate) {
      events = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return isSameDay(eventDate, selectedDate);
      });
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
    
    // Apply sorting
    switch (sortBy) {
      case "date":
        // Sort events by date with intelligent ordering
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
        break;
        
      case "popularity":
        // Sort by attendance count (highest first)
        events.sort((a, b) => (b.currentAttendees || 0) - (a.currentAttendees || 0));
        break;
        
      case "recent":
        // Sort by created date (newest first)
        events.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return compareAsc(dateB, dateA);
        });
        break;
        
      case "alphabetical":
        // Sort alphabetically by title
        events.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    return events;
  }, [allEvents, currentView, filters, searchQuery, layout, selectedDate, sortBy]);
  
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

  // Helpers for calendar view
  const eventsForCalendarView = useMemo(() => {
    // Group events by date for the calendar view
    const eventsByDate: Record<string, CommunityEvent[]> = {};
    
    allEvents.forEach(event => {
      const date = format(new Date(event.eventDate), 'yyyy-MM-dd');
      if (!eventsByDate[date]) {
        eventsByDate[date] = [];
      }
      eventsByDate[date].push(event);
    });
    
    return eventsByDate;
  }, [allEvents]);
  
  // Toggle filter drawer for mobile
  const toggleMobileFilter = () => {
    setMobileFilterOpen(!mobileFilterOpen);
  };
  
  // Handle layout changes
  const handleLayoutChange = (newLayout: "grid" | "list" | "calendar") => {
    setLayout(newLayout);
  };
  
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
            
            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Sort
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className={sortBy === "date" ? "bg-secondary" : ""} 
                    onClick={() => setSortBy("date")}
                  >
                    Date (Default)
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={sortBy === "popularity" ? "bg-secondary" : ""} 
                    onClick={() => setSortBy("popularity")}
                  >
                    Popularity
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={sortBy === "recent" ? "bg-secondary" : ""} 
                    onClick={() => setSortBy("recent")}
                  >
                    Recently Added
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={sortBy === "alphabetical" ? "bg-secondary" : ""} 
                    onClick={() => setSortBy("alphabetical")}
                  >
                    Alphabetical
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile filter button */}
            <Drawer open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="md:hidden gap-1"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Event Filters</DrawerTitle>
                  <DrawerDescription>
                    Find events that match your interests
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <EventFilterCard 
                    onFilterChange={(newFilters) => {
                      handleFilterChange(newFilters);
                      setMobileFilterOpen(false);
                    }}
                    initialFilters={filters}
                    communityId={communityId}
                  />
                </div>
              </DrawerContent>
            </Drawer>
            
            {/* Reset filters */}
            {Object.keys(filters).length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-1"
                onClick={() => {
                  setFilters({});
                  setSearchQuery("");
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
        
        {/* Search bar */}
        <div className="flex gap-2">
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
          
          {/* Filter button for desktop */}
          {showFilter && (
            <Button 
              variant="outline" 
              className="hidden md:flex items-center gap-1"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className={cn("space-y-4", showFilter ? "md:col-span-2" : "md:col-span-3")}>
          {/* CALENDAR VIEW */}
          {layout === "calendar" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Events Calendar
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCalendarMonth(new Date())}
                  >
                    Today
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Calendar component */}
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    defaultMonth={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    className="rounded-md border mx-auto"
                    modifiersStyles={{
                      today: { fontWeight: 'bold' },
                    }}
                    modifiers={{
                      event: Object.keys(eventsForCalendarView).map(dateStr => new Date(dateStr)),
                    }}
                    classNames={{
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day: "hover:bg-muted rounded-md",
                      day_disabled: "opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                      cell: "text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
                      day_event: "relative bg-primary/10 font-medium text-primary hover:bg-primary/20",
                    }}
                  />
                  
                  {/* Events for selected date */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-md">
                        Events for {format(selectedDate, 'MMMM d, yyyy')}
                      </h3>
                      
                      {renderSelectedDateEvents(filteredEvents, selectedDate, communityId, true)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* LIST/GRID VIEW */}
          {layout !== "calendar" && (
            <Tabs 
              value={currentView} 
              className="w-full"
            >
              <TabsContent value="all" className="m-0">
                {layout === "grid" 
                  ? renderEventGrid(filteredEvents, communityId, compact)
                  : renderEventList(filteredEvents, communityId, compact)
                }
              </TabsContent>
              
              <TabsContent value="upcoming" className="m-0">
                {layout === "grid" 
                  ? renderEventGrid(filteredEvents, communityId, compact)
                  : renderEventList(filteredEvents, communityId, compact)
                }
              </TabsContent>
              
              <TabsContent value="ongoing" className="m-0">
                {layout === "grid" 
                  ? renderEventGrid(filteredEvents, communityId, compact)
                  : renderEventList(filteredEvents, communityId, compact)
                }
              </TabsContent>
              
              <TabsContent value="past" className="m-0">
                {layout === "grid" 
                  ? renderEventGrid(filteredEvents, communityId, compact)
                  : renderEventList(filteredEvents, communityId, compact)
                }
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        {/* Filter sidebar for desktop */}
        {showFilter && showSidebar && (
          <div className="hidden md:block md:col-span-1">
            <EventFilterCard 
              onFilterChange={handleFilterChange}
              initialFilters={filters}
              communityId={communityId}
            />
          </div>
        )}
      </div>
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
    <motion.div className="space-y-4">
      <AnimatePresence>
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <EventCard
              event={event}
              communityId={communityId}
              compact={compact}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper function to render events in a grid layout
function renderEventGrid(events: CommunityEvent[], communityId: number, compact: boolean) {
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
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <EventCard
              event={event}
              communityId={communityId}
              compact={true}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper function to render events for a selected date in calendar view
function renderSelectedDateEvents(
  events: CommunityEvent[], 
  selectedDate: Date, 
  communityId: number, 
  compact: boolean
) {
  // Filter events for the selected date
  const eventsOnDate = events.filter(event => {
    const eventDate = new Date(event.eventDate);
    return isSameDay(eventDate, selectedDate);
  });
  
  if (eventsOnDate.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No events scheduled for this date
      </div>
    );
  }
  
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {eventsOnDate.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.2 }}
        >
          <EventCard
            event={event}
            communityId={communityId}
            compact={true}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}