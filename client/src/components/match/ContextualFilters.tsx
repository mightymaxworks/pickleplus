import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PlayerSearchInput, { UserSearchResult } from './PlayerSearchInput';
import { RecordedMatch } from '@/lib/sdk/matchSDK';
import { CalendarIcon, FilterIcon, X, Activity, User2, MapPin, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ContextualFiltersState {
  dateRange: [Date | null, Date | null];
  matchType: string;
  formatType: string;
  opponent: { id: number; displayName: string } | null;
  location?: string | null;
}

interface ContextualFiltersProps {
  matches: RecordedMatch[];
  filters: ContextualFiltersState;
  onFilterChange: (filters: ContextualFiltersState) => void;
  className?: string;
}

/**
 * ContextualFilters Component
 * 
 * An enhanced filtering system that suggests relevant filter options
 * based on the current match data set, with modern interactive animations
 * and a more intuitive UI.
 * 
 * Part of the MATCH-UI-278651[ENHANCE] implementation.
 */
export function ContextualFilters({ 
  matches,
  filters, 
  onFilterChange,
  className = '' 
}: ContextualFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<ContextualFiltersState>(filters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Extract suggested filter options from the dataset
  const [suggestions, setSuggestions] = useState<{
    formatTypes: string[];
    matchTypes: string[];
    locations: string[];
    opponents: { id: number; displayName: string }[];
  }>({
    formatTypes: [],
    matchTypes: [],
    locations: [],
    opponents: []
  });
  
  // Determine active filter count for badge
  useEffect(() => {
    let count = 0;
    if (filters.dateRange[0] || filters.dateRange[1]) count++;
    if (filters.matchType !== 'all') count++;
    if (filters.formatType !== 'all') count++;
    if (filters.opponent) count++;
    if (filters.location) count++;
    setActiveFilterCount(count);
  }, [filters]);
  
  // Generate suggestions based on current matches
  useEffect(() => {
    if (!matches || matches.length === 0) return;
    
    const formatTypes = new Set<string>();
    const matchTypes = new Set<string>();
    const locations = new Set<string>();
    const opponents = new Map<number, string>();
    
    matches.forEach(match => {
      // Format types
      if (match.formatType) formatTypes.add(match.formatType);
      
      // Match types
      if (match.matchType) matchTypes.add(match.matchType);
      
      // Locations
      if (match.location) locations.add(match.location);
      
      // Opponents (all unique players except current user)
      match.players.forEach(player => {
        if (player.displayName && !opponents.has(player.userId)) {
          opponents.set(player.userId, player.displayName);
        }
      });
    });
    
    setSuggestions({
      formatTypes: Array.from(formatTypes),
      matchTypes: Array.from(matchTypes),
      locations: Array.from(locations),
      opponents: Array.from(opponents).map(([id, displayName]) => ({ id, displayName }))
    });
  }, [matches]);
  
  // Handle filter changes
  const handleFilterChange = <K extends keyof ContextualFiltersState>(
    key: K,
    value: ContextualFiltersState[K]
  ) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  };
  
  // Reset all filters
  const resetFilters = () => {
    const defaultFilters: ContextualFiltersState = {
      dateRange: [null, null],
      matchType: 'all',
      formatType: 'all',
      opponent: null,
      location: null
    };
    setTempFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setIsOpen(false);
  };
  
  // Check if there are any active filters
  const hasActiveFilters = 
    tempFilters.dateRange[0] !== null || 
    tempFilters.dateRange[1] !== null || 
    tempFilters.matchType !== 'all' || 
    tempFilters.formatType !== 'all' || 
    tempFilters.opponent !== null ||
    tempFilters.location !== null;
  
  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return format(date, 'MMM d, yyyy');
  };
  
  // Display for active filters
  const getActiveFiltersDisplay = () => {
    const activeFilters = [];
    
    if (filters.dateRange[0] || filters.dateRange[1]) {
      const fromDate = filters.dateRange[0] ? formatDate(filters.dateRange[0]) : 'Any';
      const toDate = filters.dateRange[1] ? formatDate(filters.dateRange[1]) : 'Any';
      activeFilters.push(`${fromDate} to ${toDate}`);
    }
    
    if (filters.matchType !== 'all') {
      activeFilters.push(filters.matchType);
    }
    
    if (filters.formatType !== 'all') {
      activeFilters.push(filters.formatType);
    }
    
    if (filters.opponent) {
      activeFilters.push(`vs ${filters.opponent.displayName}`);
    }
    
    if (filters.location) {
      activeFilters.push(filters.location);
    }
    
    return activeFilters;
  };
  
  // Quick filter selection that directly applies a filter
  const quickFilter = (type: keyof ContextualFiltersState, value: any) => {
    const newFilters = { ...filters, [type]: value };
    onFilterChange(newFilters);
    setTempFilters(newFilters);
  };

  return (
    <div className={`${className}`}>
      {/* Contextual Quick Filters */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {/* Always show these base filters */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "gap-1.5",
                  activeFilterCount > 0 && "border-primary"
                )}
              >
                <FilterIcon className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="h-4 min-w-4 rounded-full px-1 text-[10px]"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[320px] p-3" 
              align="start"
              sideOffset={8}
            >
              <div className="space-y-4">
                {/* Date Range */}
                <div>
                  <h3 className="font-medium text-sm mb-2">Date Range</h3>
                  <div className="grid gap-2">
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !tempFilters.dateRange[0] && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {tempFilters.dateRange[0] ? (
                              formatDate(tempFilters.dateRange[0])
                            ) : (
                              "Start date"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={tempFilters.dateRange[0] || undefined}
                            onSelect={(date) => 
                              handleFilterChange('dateRange', [date, tempFilters.dateRange[1]])
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !tempFilters.dateRange[1] && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {tempFilters.dateRange[1] ? (
                              formatDate(tempFilters.dateRange[1])
                            ) : (
                              "End date"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={tempFilters.dateRange[1] || undefined}
                            onSelect={(date) => 
                              handleFilterChange('dateRange', [tempFilters.dateRange[0], date])
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                {/* Match Format */}
                <div>
                  <h3 className="font-medium text-sm mb-2">Match Format</h3>
                  <Select
                    value={tempFilters.formatType}
                    onValueChange={(value) => handleFilterChange('formatType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All formats" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All formats</SelectItem>
                      {suggestions.formatTypes.map(format => (
                        <SelectItem key={format} value={format} className="capitalize">
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Match Type */}
                <div>
                  <h3 className="font-medium text-sm mb-2">Match Type</h3>
                  <Select
                    value={tempFilters.matchType}
                    onValueChange={(value) => handleFilterChange('matchType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {suggestions.matchTypes.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Location */}
                <div>
                  <h3 className="font-medium text-sm mb-2">Location</h3>
                  <Select
                    value={tempFilters.location || 'all'}
                    onValueChange={(value) => 
                      handleFilterChange('location', value === 'all' ? null : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {suggestions.locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Opponent */}
                <div>
                  <h3 className="font-medium text-sm mb-2">Opponent</h3>
                  <div>
                    {tempFilters.opponent ? (
                      <div className="flex items-center border rounded-md px-3 py-1 w-full justify-between">
                        <span>{tempFilters.opponent.displayName}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0" 
                          onClick={() => handleFilterChange('opponent', null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full">
                        <PlayerSearchInput
                          onPlayerSelected={(player: UserSearchResult | null) => {
                            if (player) {
                              handleFilterChange('opponent', {
                                id: player.id,
                                displayName: player.displayName
                              });
                            }
                          }}
                          placeholder="Search for player"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                  >
                    Reset
                  </Button>
                  <Button size="sm" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Contextual, dynamically generated quick filters */}
          <AnimatePresence>
            {getActiveFiltersDisplay().map((filter, index) => (
              <motion.div
                key={filter}
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Badge 
                  variant="outline"
                  className="cursor-pointer flex items-center gap-1 hover:border-primary border-primary/40"
                >
                  {filter}
                  <X className="h-3 w-3 ml-1" onClick={() => {
                    // Handle removing this specific filter
                    const newFilters = { ...filters };
                    // Determine which filter type this is by the content
                    if (filter.includes('to')) {
                      newFilters.dateRange = [null, null];
                    } else if (suggestions.matchTypes.includes(filter)) {
                      newFilters.matchType = 'all';
                    } else if (suggestions.formatTypes.includes(filter)) {
                      newFilters.formatType = 'all';
                    } else if (filter.startsWith('vs ')) {
                      newFilters.opponent = null;
                    } else if (suggestions.locations.includes(filter)) {
                      newFilters.location = null;
                    }
                    onFilterChange(newFilters);
                    setTempFilters(newFilters);
                  }} />
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Suggested Quick Filters - animated entry */}
          {getActiveFiltersDisplay().length === 0 && (
            <AnimatePresence>
              {suggestions.formatTypes.slice(0, 2).map(format => (
                <motion.div
                  key={`format-${format}`}
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:border-primary/60"
                    onClick={() => quickFilter('formatType', format)}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    {format}
                  </Badge>
                </motion.div>
              ))}
              
              {suggestions.opponents.slice(0, 2).map(opponent => (
                <motion.div
                  key={`opponent-${opponent.id}`}
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:border-primary/60"
                    onClick={() => quickFilter('opponent', opponent)}
                  >
                    <User2 className="h-3 w-3 mr-1" />
                    vs {opponent.displayName}
                  </Badge>
                </motion.div>
              ))}
              
              {suggestions.locations.slice(0, 1).map(location => (
                <motion.div
                  key={`location-${location}`}
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:border-primary/60"
                    onClick={() => quickFilter('location', location)}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {location}
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContextualFilters;