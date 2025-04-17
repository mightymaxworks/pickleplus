/**
 * PKL-278651-COMM-0014-UI
 * Event Filter Card Component
 * 
 * This component provides filtering options for community events
 * including event type, status, and date range.
 */

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, formatRelative, isToday, isYesterday, isTomorrow, addDays, isAfter, isBefore, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { CommunityEventStatus, CommunityEventType } from "@/types/community";
import { useDateRangePicker, SimpleDateRange } from "@/lib/hooks/useDateRangePicker";

interface EventFilterCardProps {
  onFilterChange: (filters: EventFilters) => void;
  initialFilters?: EventFilters;
  communityId?: number;
}

export interface EventFilters {
  types?: CommunityEventType[];
  statuses?: CommunityEventStatus[];
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  userAttending?: boolean;
  userOwned?: boolean;
}

export function EventFilterCard({ 
  onFilterChange, 
  initialFilters,
  communityId 
}: EventFilterCardProps) {
  
  // Local state for filters
  const [filters, setFilters] = useState<EventFilters>(initialFilters || {});
  
  // Use our custom date range picker hook
  const { dateRange: date, handleRangeChange, setDateRange } = useDateRangePicker({
    from: filters.dateRange?.from,
    to: filters.dateRange?.to
  });
  
  // Helper to format date labels
  const formatDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isTomorrow(date)) return 'Tomorrow';
    return formatRelative(date, new Date());
  };
  
  // Get formatted date range text
  const getDateRangeText = () => {
    if (!date.from) return 'Select dates';
    if (!date.to) return formatDateLabel(date.from);
    return `${formatDateLabel(date.from)} - ${formatDateLabel(date.to)}`;
  };
  
  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.types && filters.types.length > 0) count++;
    if (filters.statuses && filters.statuses.length > 0) count++;
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++;
    if (filters.userAttending) count++;
    if (filters.userOwned) count++;
    return count;
  };
  
  // Handle event type toggle
  const handleTypeToggle = (type: CommunityEventType) => {
    setFilters(prev => {
      const currentTypes = prev.types || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      
      return {
        ...prev,
        types: newTypes.length > 0 ? newTypes : undefined
      };
    });
  };
  
  // Handle status toggle
  const handleStatusToggle = (status: CommunityEventStatus) => {
    setFilters(prev => {
      const currentStatuses = prev.statuses || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status];
      
      return {
        ...prev,
        statuses: newStatuses.length > 0 ? newStatuses : undefined
      };
    });
  };
  
  // Custom date range change handler that updates filters
  const handleDateChange = (range: any) => {
    const newRange = handleRangeChange(range);
    
    // Only update filters if there's a real selection
    if (newRange.from) {
      setFilters(prev => ({
        ...prev,
        dateRange: newRange
      }));
    } else {
      // Remove date range if it's cleared
      setFilters(prev => {
        const { dateRange, ...rest } = prev;
        return rest;
      });
    }
  };
  
  // Handle checkbox toggles
  const handleCheckboxToggle = (field: 'userAttending' | 'userOwned') => {
    setFilters(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({});
    setDateRange({ from: undefined, to: undefined });
    onFilterChange({});
  };
  
  // Apply filters when button is clicked
  const applyFilters = () => {
    onFilterChange(filters);
  };
  
  // Count active filters
  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filter Events</CardTitle>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        <CardDescription>
          Find events that match your interests
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {/* Event Types */}
          <AccordionItem value="eventTypes">
            <AccordionTrigger className="py-2">Event Types</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CommunityEventType).map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`type-${type}`} 
                      checked={(filters.types || []).includes(type)}
                      onCheckedChange={() => handleTypeToggle(type)}
                    />
                    <Label 
                      htmlFor={`type-${type}`}
                      className="text-sm cursor-pointer"
                    >
                      {formatEventType(type)}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Event Status */}
          <AccordionItem value="eventStatus">
            <AccordionTrigger className="py-2">Event Status</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CommunityEventStatus).map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`status-${status}`} 
                      checked={(filters.statuses || []).includes(status)}
                      onCheckedChange={() => handleStatusToggle(status)}
                    />
                    <Label 
                      htmlFor={`status-${status}`}
                      className="text-sm cursor-pointer"
                    >
                      {formatEventStatus(status)}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Date Range */}
          <AccordionItem value="dateRange">
            <AccordionTrigger className="py-2">Date Range</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {getDateRangeText()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date.from}
                        selected={date}
                        onSelect={handleDateChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Quick date selectors */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      handleDateChange({ 
                        from: today, 
                        to: undefined 
                      });
                    }}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const nextWeek = addDays(today, 7);
                      handleDateChange({ 
                        from: today, 
                        to: nextWeek 
                      });
                    }}
                  >
                    Next 7 Days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const nextMonth = addDays(today, 30);
                      handleDateChange({ 
                        from: today, 
                        to: nextMonth 
                      });
                    }}
                  >
                    Next 30 Days
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Additional Filters */}
          <AccordionItem value="additionalFilters">
            <AccordionTrigger className="py-2">Additional Filters</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="my-events"
                    checked={!!filters.userOwned}
                    onCheckedChange={() => handleCheckboxToggle('userOwned')}
                  />
                  <Label 
                    htmlFor="my-events"
                    className="text-sm cursor-pointer"
                  >
                    Events I'm hosting
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="attending-events"
                    checked={!!filters.userAttending}
                    onCheckedChange={() => handleCheckboxToggle('userAttending')}
                  />
                  <Label 
                    htmlFor="attending-events"
                    className="text-sm cursor-pointer"
                  >
                    Events I'm attending
                  </Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={resetFilters}
          disabled={activeFilterCount === 0}
          className="gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </CardFooter>
    </Card>
  );
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

function formatEventStatus(status: CommunityEventStatus): string {
  switch (status) {
    case CommunityEventStatus.UPCOMING:
      return "Upcoming";
    case CommunityEventStatus.ONGOING:
      return "Ongoing";
    case CommunityEventStatus.COMPLETED:
      return "Completed";
    case CommunityEventStatus.CANCELLED:
      return "Cancelled";
    default:
      return status;
  }
}