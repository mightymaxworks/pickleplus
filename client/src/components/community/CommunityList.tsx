/**
 * PKL-278651-COMM-0014-UI
 * Community List Component
 * 
 * This component displays a list or grid of community cards with advanced filtering, sorting,
 * and pagination capabilities.
 */

import React, { useState, useEffect } from "react";
import { useFilteredCommunities, useCommunities } from "@/lib/hooks/useCommunity";
import { CommunityCard } from "./CommunityCard";
import { 
  CommunityFilterOptions, 
  CommunitySortOptions, 
  PaginationOptions 
} from "@/types/community";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, List, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommunityListProps {
  initialFilter?: CommunityFilterOptions;
  initialSort?: CommunitySortOptions;
  showFilters?: boolean;
  showSorting?: boolean;
  isCompact?: boolean;
  limit?: number;
}

export function CommunityList({
  initialFilter,
  initialSort,
  showFilters = true,
  showSorting = true,
  isCompact = false,
  limit,
}: CommunityListProps) {
  // State for view type (grid or list)
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  
  // State for filters and sorting
  const [filterOptions, setFilterOptions] = useState<CommunityFilterOptions | null>(initialFilter || null);
  const [sortOptions, setSortOptions] = useState<CommunitySortOptions | null>(
    initialSort || { sortBy: 'memberCount', sortOrder: 'desc' }
  );
  
  // State for pagination
  const [paginationOptions, setPaginationOptions] = useState<PaginationOptions>({
    limit: limit || 12,
    offset: 0,
  });
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Temporary filter state for filter drawer
  const [tempFilter, setTempFilter] = useState<CommunityFilterOptions>(initialFilter || {});
  
  // Fetch communities with filters
  const {
    data: communities,
    isLoading,
    isError,
    isFiltered,
    isSorted,
    refetch
  } = useFilteredCommunities(filterOptions, sortOptions, paginationOptions);
  
  // Apply search query to filter
  useEffect(() => {
    if (searchQuery) {
      setFilterOptions(prev => ({
        ...prev || {},
        query: searchQuery
      }));
    } else if (filterOptions?.query) {
      // Remove query from filters if search box is empty
      const newFilters = { ...filterOptions };
      delete newFilters.query;
      setFilterOptions(Object.keys(newFilters).length > 0 ? newFilters : null);
    }
  }, [searchQuery]);
  
  // Handle filter changes
  const applyFilters = () => {
    setFilterOptions(tempFilter);
  };
  
  // Handle clearing all filters
  const clearAllFilters = () => {
    setFilterOptions(null);
    setTempFilter({});
    setSearchQuery('');
  };
  
  // Handle sorting change
  const handleSortChange = (sortBy: string) => {
    const newSortOptions: CommunitySortOptions = {
      sortBy: sortBy as 'name' | 'memberCount' | 'eventCount' | 'postCount' | 'createdAt',
      sortOrder: sortOptions?.sortOrder || 'desc'
    };
    setSortOptions(newSortOptions);
  };
  
  // Handle sort order change
  const toggleSortOrder = () => {
    setSortOptions({
      sortBy: sortOptions?.sortBy || 'memberCount',
      sortOrder: sortOptions?.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };
  
  // Handle pagination
  const loadMore = () => {
    setPaginationOptions(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 12)
    }));
  };
  
  // Check if any filters are applied
  const hasActiveFilters = !!filterOptions && Object.keys(filterOptions).length > 0;

  // Render skeleton loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 w-full sm:w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        {/* Skeleton for community cards */}
        <div className={`
          grid gap-6 
          ${viewType === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
          }
        `}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className={`
              ${viewType === 'list' ? 'h-32' : 'h-80'}
            `}>
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error loading the communities. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search input */}
        <div className="relative flex-grow">
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
            data-testid="community-search-input"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Filter button */}
        {showFilters && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:w-auto w-full flex gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 py-0">
                    {Object.keys(filterOptions).length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Communities</SheetTitle>
                <SheetDescription>
                  Apply filters to find the perfect community for you
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-4">
                {/* Skill Level */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Skill Level</h4>
                  <Select 
                    value={tempFilter.skillLevel || ''} 
                    onValueChange={(value) => setTempFilter({...tempFilter, skillLevel: value || undefined})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any skill level</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Location */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Location</h4>
                  <Input 
                    placeholder="Any location" 
                    value={tempFilter.location || ''} 
                    onChange={(e) => setTempFilter({...tempFilter, location: e.target.value || undefined})}
                  />
                </div>
                
                {/* Member Count Range */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Member Count</h4>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={tempFilter.memberCountMin || ''} 
                      onChange={(e) => setTempFilter({
                        ...tempFilter, 
                        memberCountMin: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={tempFilter.memberCountMax || ''} 
                      onChange={(e) => setTempFilter({
                        ...tempFilter, 
                        memberCountMax: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                  </div>
                </div>
                
                {/* Has Events */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Has Upcoming Events</span>
                  <Button 
                    size="sm" 
                    variant={tempFilter.hasEvents ? "default" : "outline"}
                    onClick={() => setTempFilter({
                      ...tempFilter, 
                      hasEvents: tempFilter.hasEvents ? undefined : true
                    })}
                  >
                    {tempFilter.hasEvents ? "Yes" : "Any"}
                  </Button>
                </div>
                
                {/* Only show communities I'm a member of */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">My Communities</span>
                  <Button 
                    size="sm" 
                    variant={tempFilter.isMember ? "default" : "outline"}
                    onClick={() => setTempFilter({
                      ...tempFilter, 
                      isMember: tempFilter.isMember ? undefined : true
                    })}
                  >
                    {tempFilter.isMember ? "Yes" : "Any"}
                  </Button>
                </div>
              </div>
              
              <SheetFooter>
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="mb-2 sm:mb-0"
                >
                  Clear All
                </Button>
                <SheetClose asChild>
                  <Button onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Sorting control */}
        {showSorting && (
          <div className="flex">
            <Select
              value={sortOptions?.sortBy || 'memberCount'}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="rounded-r-none border-r-0 min-w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="memberCount">Members</SelectItem>
                <SelectItem value="eventCount">Events</SelectItem>
                <SelectItem value="postCount">Posts</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-l-none"
                    onClick={toggleSortOrder}
                  >
                    <ArrowUpDown className={`h-4 w-4 ${sortOptions?.sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{sortOptions?.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
          
        {/* View type toggle */}
        <div className="flex border rounded-md">
          <Button 
            variant={viewType === 'grid' ? "secondary" : "ghost"} 
            className="rounded-r-none" 
            onClick={() => setViewType('grid')}
            data-testid="community-grid-button"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewType === 'list' ? "secondary" : "ghost"} 
            className="rounded-l-none border-l"
            onClick={() => setViewType('list')}
            data-testid="community-list-button"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Active filter display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filterOptions).map(([key, value]) => {
            if (value === undefined || value === null) return null;
            let displayLabel = `${key}: ${value}`;
            
            // Format special filter types
            if (key === 'query') displayLabel = `Search: ${value}`;
            if (key === 'skillLevel') displayLabel = `Skill: ${value}`;
            if (key === 'location') displayLabel = `Location: ${value}`;
            if (key === 'memberCountMin') displayLabel = `Min Members: ${value}`;
            if (key === 'memberCountMax') displayLabel = `Max Members: ${value}`;
            if (key === 'hasEvents' && value === true) displayLabel = 'Has Events';
            if (key === 'isMember' && value === true) displayLabel = 'My Communities';
            
            return (
              <Badge 
                key={key} 
                variant="secondary" 
                className="px-2 py-1 gap-1"
              >
                <span>{displayLabel}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    const newFilters = { ...filterOptions };
                    delete newFilters[key as keyof CommunityFilterOptions];
                    setFilterOptions(Object.keys(newFilters).length > 0 ? newFilters : null);
                    
                    // Update temp filters too
                    const newTempFilters = { ...tempFilter };
                    delete newTempFilters[key as keyof CommunityFilterOptions];
                    setTempFilter(newTempFilters);
                    
                    // Update search query too if clearing query filter
                    if (key === 'query') setSearchQuery('');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
          
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 text-xs"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </div>
      )}
      
      {/* No results message */}
      {communities.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No Communities Found</CardTitle>
            <CardDescription>
              {hasActiveFilters 
                ? "Try adjusting your filters to see more communities" 
                : "There are no communities available at this time"}
            </CardDescription>
          </CardHeader>
          {hasActiveFilters && (
            <CardFooter>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
      
      {/* Communities grid/list view */}
      {communities.length > 0 && (
        <div className={`
          grid gap-6 
          ${viewType === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
          }
        `}>
          {communities.map((community) => (
            <CommunityCard 
              key={community.id} 
              community={community} 
              compact={isCompact || viewType === 'list'}
            />
          ))}
        </div>
      )}
      
      {/* Load more button */}
      {communities.length > 0 && communities.length % (paginationOptions.limit || 12) === 0 && (
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline" 
            onClick={loadMore}
            className="min-w-[150px]"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}