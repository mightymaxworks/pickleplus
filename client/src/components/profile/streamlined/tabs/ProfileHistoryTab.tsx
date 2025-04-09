/**
 * PKL-278651-SPUI-0001: Profile Match History Tab
 * Displays the player's match history
 */
import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Users, Trophy, Calendar, ChevronDown,
  ChevronUp, Filter, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination-extended';

interface ProfileHistoryTabProps {
  user: any;
}

// Match type definition
interface Match {
  id: string;
  date: string;
  opponent: string;
  opponentId: string | number;
  format: string;
  score: string;
  result: 'win' | 'loss';
  location: string;
  courtIQChange: number;
  verified: boolean;
}

const ProfileHistoryTab: FC<ProfileHistoryTabProps> = ({ user }) => {
  // Filter and sorting states
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState('10');
  const [sortBy, setSortBy] = useState('date-desc');
  const [resultFilter, setResultFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  
  // Fetch match history (would normally come from API)
  const { data: matchHistory, isLoading } = useQuery({
    queryKey: ['/api/match/history', currentPage, resultsPerPage, sortBy, resultFilter, formatFilter],
    enabled: false, // Disabled for now until API is ready
  });
  
  // Sample match data (for now, would be replaced with actual data)
  const sampleMatches: Match[] = [
    // If user has no matches, this will be an empty array
    ...(user.totalMatches ? [
      {
        id: '12345',
        date: '2025-04-02',
        opponent: 'John Smith',
        opponentId: 2,
        format: 'Doubles',
        score: '11-7, 11-9',
        result: 'win',
        location: 'Central Park Courts',
        courtIQChange: 15,
        verified: true,
      },
      {
        id: '12346',
        date: '2025-03-28',
        opponent: 'Sarah Johnson',
        opponentId: 3,
        format: 'Mixed Doubles',
        score: '11-5, 9-11, 11-8',
        result: 'win',
        location: 'Downtown Recreation Center',
        courtIQChange: 18,
        verified: true,
      },
      {
        id: '12347',
        date: '2025-03-20',
        opponent: 'Mike Peters',
        opponentId: 4,
        format: 'Singles',
        score: '7-11, 5-11',
        result: 'loss',
        location: 'East Side Pickleball Club',
        courtIQChange: -10,
        verified: true,
      }
    ] : []),
  ];
  
  // Get matches based on current filters and pagination
  const getFilteredMatches = () => {
    let filtered = [...sampleMatches];
    
    // Apply result filter
    if (resultFilter === 'wins') {
      filtered = filtered.filter(match => match.result === 'win');
    } else if (resultFilter === 'losses') {
      filtered = filtered.filter(match => match.result === 'loss');
    }
    
    // Apply format filter
    if (formatFilter !== 'all') {
      filtered = filtered.filter(match => match.format.toLowerCase() === formatFilter.toLowerCase());
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'rating-change-desc') {
        return b.courtIQChange - a.courtIQChange;
      } else if (sortBy === 'rating-change-asc') {
        return a.courtIQChange - b.courtIQChange;
      }
      return 0;
    });
    
    return filtered;
  };
  
  const filteredMatches = getFilteredMatches();
  const totalPages = Math.ceil(filteredMatches.length / parseInt(resultsPerPage));
  
  // Get paginated matches
  const getPaginatedMatches = () => {
    const startIndex = (currentPage - 1) * parseInt(resultsPerPage);
    const endIndex = startIndex + parseInt(resultsPerPage);
    return filteredMatches.slice(startIndex, endIndex);
  };
  
  const paginatedMatches = getPaginatedMatches();
  
  // Format a date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Match Stats Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Match Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Matches</div>
              <div className="text-2xl font-bold">{user.totalMatches || 0}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Wins</div>
              <div className="text-2xl font-bold text-green-600">{user.matchesWon || 0}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Losses</div>
              <div className="text-2xl font-bold text-red-500">
                {(user.totalMatches || 0) - (user.matchesWon || 0)}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Win Rate</div>
              <div className="text-2xl font-bold">
                {user.totalMatches ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Match History Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Match History
            </CardTitle>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 p-4 rounded-lg border bg-muted/20">
              <div className="space-y-2">
                <label className="text-sm font-medium">Result</label>
                <Select 
                  value={resultFilter} 
                  onValueChange={setResultFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="wins">Wins Only</SelectItem>
                    <SelectItem value="losses">Losses Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select 
                  value={formatFilter} 
                  onValueChange={setFormatFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Formats</SelectItem>
                    <SelectItem value="singles">Singles</SelectItem>
                    <SelectItem value="doubles">Doubles</SelectItem>
                    <SelectItem value="mixed doubles">Mixed Doubles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select 
                  value={sortBy} 
                  onValueChange={setSortBy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort matches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                    <SelectItem value="rating-change-desc">Rating Change (Highest First)</SelectItem>
                    <SelectItem value="rating-change-asc">Rating Change (Lowest First)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Per Page</label>
                <Select 
                  value={resultsPerPage} 
                  onValueChange={setResultsPerPage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Results per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Match Table */}
          {paginatedMatches.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead className="hidden md:table-cell">Format</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="hidden sm:table-cell">Location</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">CourtIQ™</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMatches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(match.date)}
                      </TableCell>
                      <TableCell>{match.opponent}</TableCell>
                      <TableCell className="hidden md:table-cell">{match.format}</TableCell>
                      <TableCell className="whitespace-nowrap">{match.score}</TableCell>
                      <TableCell className="hidden sm:table-cell">{match.location}</TableCell>
                      <TableCell>
                        <Badge variant={match.result === 'win' ? 'success' : 'destructive'} className="w-16 justify-center">
                          {match.result === 'win' ? 'Win' : 'Loss'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={match.courtIQChange > 0 ? 'text-green-600' : 'text-red-500'}>
                          {match.courtIQChange > 0 ? '+' : ''}{match.courtIQChange}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
              {user.totalMatches ? (
                <p className="text-muted-foreground">
                  Try adjusting your filters to see different matches.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  You haven't recorded any matches yet. Start playing and recording matches to build your history.
                </p>
              )}
            </div>
          )}
          
          {/* Pagination */}
          {paginatedMatches.length > 0 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {/* Generate page numbers */}
                  {Array.from({ length: totalPages }).map((_, i) => {
                    // Show limited page numbers for better UI
                    if (
                      i + 1 === 1 || // First page
                      i + 1 === totalPages || // Last page
                      (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1) // Pages around current
                    ) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(i + 1);
                            }}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      (i + 1 === currentPage - 2 && currentPage > 3) ||
                      (i + 1 === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return <PaginationEllipsis key={i} />;
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileHistoryTab;