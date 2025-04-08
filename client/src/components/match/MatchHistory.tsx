import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchSDK, RecordedMatch } from '@/lib/sdk/matchSDK';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, MapPinIcon, Trophy, XCircle, CheckCircle, ClockIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { MatchFilters, MatchFiltersState } from './MatchFilters';
import MatchTrends from './MatchTrends';
import MatchDetails from './MatchDetails';

/**
 * MatchHistory Component
 * 
 * Displays a user's match history with filtering and trend visualization capabilities.
 * 
 * UI Integration Points:
 * - Main match history display (Navigation: Match Center → History tab)
 * - Player profile match history (Navigation: Profile → Match History)
 * 
 * Mobile Considerations:
 * - Match cards stack vertically
 * - Filters collapse into a dropdown
 * - Trends show simplified visualizations
 */
interface MatchHistoryProps {
  matches?: RecordedMatch[];
  userId?: number;
  limit?: number;
  showFilters?: boolean;
  showTrends?: boolean;
  className?: string;
  onMatchesRefresh?: () => void;
  formatDate?: (dateString: string) => string;
}

export function MatchHistory({ 
  matches: providedMatches,
  userId: providedUserId,
  limit = 10, 
  showFilters = true,
  showTrends = true,
  className = '',
  onMatchesRefresh,
  formatDate: customFormatDate
}: MatchHistoryProps) {
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<RecordedMatch | null>(null);
  const [filters, setFilters] = useState<MatchFiltersState>({
    dateRange: [null, null],
    matchType: 'all',
    formatType: 'all',
    opponent: null
  });
  
  // Determine whether to use provided matches or fetch from API
  const { data: fetchedMatches, isLoading, isError } = useQuery({
    queryKey: ['/api/match/recent', providedUserId || (user?.id), limit],
    queryFn: async () => {
      return await matchSDK.getRecentMatches(providedUserId || undefined, limit);
    },
    enabled: !providedMatches && !!(providedUserId || user?.id),
  });
  
  // Use provided matches if available, otherwise use fetched matches
  const matches = providedMatches || fetchedMatches;
  
  // Apply filters to matches
  const filteredMatches = React.useMemo(() => {
    if (!matches) return [];
    
    return matches.filter(match => {
      // Date range filter
      if (filters.dateRange[0] || filters.dateRange[1]) {
        const matchDate = parseISO(match.date);
        
        if (filters.dateRange[0] && matchDate < filters.dateRange[0]) {
          return false;
        }
        
        if (filters.dateRange[1]) {
          // Set time to end of day
          const endDate = new Date(filters.dateRange[1]);
          endDate.setHours(23, 59, 59, 999);
          
          if (matchDate > endDate) {
            return false;
          }
        }
      }
      
      // Match type filter
      if (filters.matchType !== 'all' && match.matchType !== filters.matchType) {
        return false;
      }
      
      // Format type filter
      if (filters.formatType !== 'all' && match.formatType !== filters.formatType) {
        return false;
      }
      
      // Opponent filter
      if (filters.opponent) {
        const opponentFound = match.players.some(p => 
          p.userId === filters.opponent?.id && p.userId !== user?.id
        );
        
        if (!opponentFound) {
          return false;
        }
      }
      
      return true;
    });
  }, [matches, filters, user]);
  
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-6 w-[100px]" />
              </div>
              <div className="flex justify-between mt-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="p-5 text-center">
          <XCircle className="h-10 w-10 mx-auto text-destructive mb-2" />
          <h3 className="font-medium text-lg">Failed to load matches</h3>
          <p className="text-muted-foreground mb-4">There was an error loading your match history.</p>
          <Button 
            variant="outline" 
            onClick={() => onMatchesRefresh ? onMatchesRefresh() : window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!matches || matches.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-5 text-center">
          <Trophy className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
          <h3 className="font-medium text-lg">No Matches Yet</h3>
          <p className="text-muted-foreground mb-4">Record your first match to start building your history.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {showFilters && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Match History</h3>
          <MatchFilters 
            filters={filters} 
            onFilterChange={setFilters} 
          />
        </div>
      )}
      
      {showTrends && filteredMatches.length > 0 && (
        <MatchTrends matches={filteredMatches} />
      )}
      
      <div className="space-y-3">
        {filteredMatches.map(match => (
          <MatchCard 
            key={match.id} 
            match={match} 
            currentUserId={providedUserId || user?.id}
            onClick={() => setSelectedMatch(match)}
            formatDate={customFormatDate}
          />
        ))}
        
        {filteredMatches.length === 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">No matches match your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {selectedMatch && (
        <MatchDetails 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
}

interface MatchCardProps {
  match: RecordedMatch;
  currentUserId?: number;
  onClick?: () => void;
  formatDate?: (dateString: string) => string;
}

function MatchCard({ match, currentUserId, onClick, formatDate }: MatchCardProps) {
  const { 
    date, 
    players, 
    formatType,
    location,
    validationStatus
  } = match;
  
  const matchDate = parseISO(date);
  const formattedDate = formatDate ? formatDate(date) : format(matchDate, 'MMM d, yyyy');
  const formattedTime = format(matchDate, 'h:mm a');
  
  // Find the current user's player data
  const currentUserPlayer = players.find(p => p.userId === currentUserId);
  const opponentPlayer = players.find(p => p.userId !== currentUserId);
  
  if (!currentUserPlayer || !opponentPlayer) {
    return null; // Should not happen, but just in case
  }
  
  const userWon = currentUserPlayer.isWinner;
  
  return (
    <Card 
      className="hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              {opponentPlayer.avatarUrl ? (
                <AvatarImage src={opponentPlayer.avatarUrl} alt={opponentPlayer.displayName} />
              ) : (
                <AvatarFallback>
                  {opponentPlayer.avatarInitials || opponentPlayer.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="font-medium">
                vs {opponentPlayer.displayName || 'Unknown Player'}
              </div>
              <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-x-3">
                <span className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" /> {formattedDate}
                </span>
                {location && (
                  <span className="flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1" /> {location}
                  </span>
                )}
                <span className="capitalize">
                  {formatType}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end">
              <span className="font-bold mr-2">
                {currentUserPlayer.score} - {opponentPlayer.score}
              </span>
              <Badge variant={userWon ? "success" : "destructive"}>
                {userWon ? "Won" : "Lost"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center justify-end">
              <ClockIcon className="h-3 w-3 mr-1" />
              {formattedTime}
              
              {validationStatus !== "validated" && (
                <Badge variant="outline" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" /> 
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MatchHistory;