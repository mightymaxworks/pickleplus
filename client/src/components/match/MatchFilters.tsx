import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PlayerSearchInput } from '@/components/match/PlayerSearchInput';
import { CalendarIcon, FilterIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export interface MatchFiltersState {
  dateRange: [Date | null, Date | null];
  matchType: string;
  formatType: string;
  opponent: { id: number; displayName: string } | null;
}

interface MatchFiltersProps {
  filters: MatchFiltersState;
  onFilterChange: (filters: MatchFiltersState) => void;
}

export function MatchFilters({ filters, onFilterChange }: MatchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<MatchFiltersState>(filters);
  
  // Handle filter changes
  const handleFilterChange = <K extends keyof MatchFiltersState>(
    key: K,
    value: MatchFiltersState[K]
  ) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    const defaultFilters: MatchFiltersState = {
      dateRange: [null, null],
      matchType: 'all',
      formatType: 'all',
      opponent: null
    };
    
    setTempFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    tempFilters.dateRange[0] !== null || 
    tempFilters.dateRange[1] !== null ||
    tempFilters.matchType !== 'all' ||
    tempFilters.formatType !== 'all' ||
    tempFilters.opponent !== null;
  
  // Create filter badge text
  const getFilterDescription = () => {
    const parts = [];
    
    if (tempFilters.dateRange[0] && tempFilters.dateRange[1]) {
      parts.push(`${format(tempFilters.dateRange[0], 'MMM d')} - ${format(tempFilters.dateRange[1], 'MMM d')}`);
    } else if (tempFilters.dateRange[0]) {
      parts.push(`After ${format(tempFilters.dateRange[0], 'MMM d')}`);
    } else if (tempFilters.dateRange[1]) {
      parts.push(`Before ${format(tempFilters.dateRange[1], 'MMM d')}`);
    }
    
    if (tempFilters.matchType !== 'all') {
      parts.push(tempFilters.matchType.charAt(0).toUpperCase() + tempFilters.matchType.slice(1));
    }
    
    if (tempFilters.formatType !== 'all') {
      parts.push(tempFilters.formatType.charAt(0).toUpperCase() + tempFilters.formatType.slice(1));
    }
    
    if (tempFilters.opponent) {
      parts.push(`vs ${tempFilters.opponent.displayName}`);
    }
    
    return parts.join(', ');
  };
  
  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={hasActiveFilters ? 'border-primary' : ''}
          >
            <FilterIcon className="h-4 w-4 mr-1" />
            Filter
            {hasActiveFilters && (
              <Badge 
                variant="secondary" 
                className="ml-2 rounded-sm px-1 font-normal"
              >
                {getFilterDescription()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <h4 className="font-medium">Filter Matches</h4>
            
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                      size="sm"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempFilters.dateRange[0] ? (
                        format(tempFilters.dateRange[0], 'PPP')
                      ) : (
                        <span>Start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempFilters.dateRange[0] || undefined}
                      onSelect={(date) => handleFilterChange('dateRange', [date, tempFilters.dateRange[1]])}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-left font-normal"
                      size="sm"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempFilters.dateRange[1] ? (
                        format(tempFilters.dateRange[1], 'PPP')
                      ) : (
                        <span>End date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempFilters.dateRange[1] || undefined}
                      onSelect={(date) => handleFilterChange('dateRange', [tempFilters.dateRange[0], date])}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Match Type */}
            <div className="space-y-2">
              <Label>Match Type</Label>
              <Select 
                value={tempFilters.matchType} 
                onValueChange={(value) => handleFilterChange('matchType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Match Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="league">League</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Format Type */}
            <div className="space-y-2">
              <Label>Format</Label>
              <Select 
                value={tempFilters.formatType} 
                onValueChange={(value) => handleFilterChange('formatType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="singles">Singles</SelectItem>
                  <SelectItem value="doubles">Doubles</SelectItem>
                  <SelectItem value="mixed">Mixed Doubles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Opponent */}
            <div className="space-y-2">
              <Label>Opponent</Label>
              <div className="flex gap-2">
                {tempFilters.opponent ? (
                  <div className="flex items-center border rounded-md px-3 py-1 w-full justify-between">
                    <span>{tempFilters.opponent.displayName}</span>
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className="h-5 w-5 p-0" 
                      onClick={() => handleFilterChange('opponent', null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full">
                    <PlayerSearchInput
                      onPlayerSelected={(player) => {
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
    </div>
  );
}

export default MatchFilters;