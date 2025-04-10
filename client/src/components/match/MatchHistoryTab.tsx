/**
 * PKL-278651-HIST-0001-UI: Match History Tab Component
 * This component provides a filterable, sortable match history with pagination
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, subMonths } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getMatchHistory, RecordedMatch } from '@/lib/sdk/matchSDK';
import { ChevronDown, Calendar as CalendarIcon, Trophy, CheckCircle, Clock, Filter, SlidersHorizontal, ArrowDown, ArrowUp, AlertTriangle, History, Plus } from 'lucide-react';
import { QuickValidationButton } from '@/components/match/QuickValidationButton';
import { EnhancedMatchCard } from '@/components/match/EnhancedMatchCard';
import { Link } from 'wouter';

/**
 * PKL-278651-HIST-0001-UI-01: FilterBar component
 */
interface FilterBarProps {
  filters: {
    startDate: Date | undefined;
    endDate: Date | undefined;
    matchType: string;
    formatType: string;
    validationStatus: string;
    location: string;
    sortBy: string;
    sortDirection: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onResetFilters: () => void;
}

function FilterBar({ filters, onFilterChange, onResetFilters }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filters</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onResetFilters}
        >
          Reset
        </Button>
      </div>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <div className="bg-background rounded-md shadow-sm border p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Date range */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Date range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 justify-start text-left font-normal text-xs sm:text-sm">
                      <CalendarIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      {filters.startDate ? format(filters.startDate, 'PP') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => onFilterChange('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 justify-start text-left font-normal text-xs sm:text-sm">
                      <CalendarIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      {filters.endDate ? format(filters.endDate, 'PP') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => onFilterChange('endDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Match type */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Match type</Label>
              <Select 
                value={filters.matchType} 
                onValueChange={(value) => onFilterChange('matchType', value)}
              >
                <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue placeholder="All match types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All match types</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="league">League</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Format type */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Format</Label>
              <Select 
                value={filters.formatType} 
                onValueChange={(value) => onFilterChange('formatType', value)}
              >
                <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue placeholder="All formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All formats</SelectItem>
                  <SelectItem value="singles">Singles</SelectItem>
                  <SelectItem value="doubles">Doubles</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Validation status */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Validation status</Label>
              <Select 
                value={filters.validationStatus} 
                onValueChange={(value) => onFilterChange('validationStatus', value)}
              >
                <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Location</Label>
              <Input 
                className="text-xs sm:text-sm h-8 sm:h-9"
                placeholder="Any location" 
                value={filters.location} 
                onChange={(e) => onFilterChange('location', e.target.value)}
              />
            </div>
            
            {/* Sort options */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Sort by</Label>
              <div className="flex gap-2">
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => onFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="flex-1 text-xs sm:text-sm h-8 sm:h-9">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="opponent">Opponent</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => onFilterChange('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                >
                  {filters.sortDirection === 'asc' ? (
                    <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * PKL-278651-HIST-0001-UI-02: MatchList component
 */
interface MatchListProps {
  matches: RecordedMatch[];
  isLoading: boolean;
}

function MatchList({ matches, isLoading }: MatchListProps) {
  const { user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-md p-6">
            <div className="flex justify-between mb-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-14 w-14 rounded-full mb-2" />
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-6 w-6" />
              <div className="flex flex-col items-center">
                <Skeleton className="h-14 w-14 rounded-full mb-2" />
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <Skeleton className="h-10 w-44" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (matches.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
          <Trophy className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">No matches found</h3>
        <p className="text-muted-foreground mt-1">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 pb-4">
      <ScrollArea className="max-h-[550px]">
        {matches.map((match) => (
          <EnhancedMatchCard 
            key={match.id} 
            match={match} 
            onValidationComplete={() => {
              // This will refresh the data through query invalidation
            }}
          />
        ))}
      </ScrollArea>
    </div>
  );
}

/**
 * PKL-278651-HIST-0001-UI-03: Pagination component
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, totalCount, onPageChange }: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4 pb-8">
      <div className="text-xs sm:text-sm text-muted-foreground">
        Showing <span className="font-medium">{totalCount > 0 ? (currentPage - 1) * 10 + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * 10, totalCount)}</span> of <span className="font-medium">{totalCount}</span> matches
      </div>
      <div className="flex gap-1 w-full sm:w-auto justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8"
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/**
 * PKL-278651-HIST-0001: Main MatchHistoryTab component
 */
export default function MatchHistoryTab() {
  const { user } = useAuth();
  
  // Default filter state - 3 months of history
  const defaultStartDate = subMonths(new Date(), 3);
  
  // State for filters
  const [filters, setFilters] = useState({
    startDate: defaultStartDate,
    endDate: undefined as Date | undefined,
    matchType: 'all',
    formatType: 'all',
    validationStatus: 'all',
    location: '',
    sortBy: 'date',
    sortDirection: 'desc',
    page: 1,
    limit: 10,
  });
  
  // Handler for filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when filters change
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };
  
  // Reset filters to default
  const handleResetFilters = () => {
    setFilters({
      startDate: defaultStartDate,
      endDate: undefined,
      matchType: 'all',
      formatType: 'all',
      validationStatus: 'all',
      location: '',
      sortBy: 'date',
      sortDirection: 'desc',
      page: 1,
      limit: 10,
    });
  };
  
  // Fetch match history data with filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ['matchHistory', user?.id, filters],
    queryFn: () => getMatchHistory({
      userId: user?.id,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      matchType: filters.matchType as any,
      formatType: filters.formatType as any,
      validationStatus: filters.validationStatus as any,
      location: filters.location || undefined,
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy as any,
      sortDirection: filters.sortDirection as any,
    }),
    staleTime: 60000, // 1 minute
  });
  
  return (
    <div>
      {/* PKL-278651-HIST-0001-UI-01: FilterBar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
      
      {/* Display error state if any */}
      {isError && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md mb-4">
          <p className="text-sm">There was an error loading your match history. Please try again later.</p>
        </div>
      )}
      
      {/* PKL-278651-HIST-0001-UI-02: MatchList */}
      <MatchList
        matches={data?.matches || []}
        isLoading={isLoading}
      />
      
      {/* PKL-278651-HIST-0001-UI-03: Pagination */}
      <Pagination
        currentPage={filters.page}
        totalPages={data?.totalPages || 0}
        totalCount={data?.totalCount || 0}
        onPageChange={(page) => handleFilterChange('page', page)}
      />
    </div>
  );
}