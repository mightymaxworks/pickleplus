/**
 * PKL-278651-ADMIN-0015-USER
 * User Match History Component
 * 
 * Displays a user's recent matches
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

interface Match {
  id: number;
  date: string;
  playerOne: {
    id: number;
    username: string;
    displayName?: string;
  };
  playerTwo: {
    id: number;
    username: string;
    displayName?: string;
  };
  playerOnePartner?: {
    id: number;
    username: string;
    displayName?: string;
  };
  playerTwoPartner?: {
    id: number;
    username: string;
    displayName?: string;
  };
  score: string;
  format: string;
  winnerId: number;
  pointsAwarded: number;
  status: string;
}

interface UserMatchHistoryProps {
  userId: number;
}

export const UserMatchHistory = ({ userId }: UserMatchHistoryProps) => {
  const [page, setPage] = useState(1);
  
  // Fetch user's match history
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/match/history', userId, page],
    queryFn: async () => {
      const response = await apiRequest(`/api/match/history?userId=${userId}&page=${page}&limit=5`);
      return response;
    }
  });
  
  // Get display name for a player
  const getDisplayName = (player: { username: string; displayName?: string }) => {
    return player.displayName || player.username;
  };
  
  // Format the match score
  const formatScore = (score: string) => {
    try {
      // Handle different score formats
      if (score.includes('-')) {
        const [scoreOne, scoreTwo] = score.split('-');
        return `${scoreOne.trim()} - ${scoreTwo.trim()}`;
      }
      
      if (score.includes(',')) {
        const sets = score.split(',').map(set => set.trim());
        return sets.join(', ');
      }
      
      return score;
    } catch (e) {
      return score;
    }
  };
  
  // Handle page change
  const handleNextPage = () => {
    if (data?.pagination?.hasMore) {
      setPage(prev => prev + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };
  
  // Check if a match is a singles or doubles match
  const isDoublesMatch = (match: Match) => {
    return !!match.playerOnePartner || !!match.playerTwoPartner;
  };
  
  // Generate match description
  const getMatchDescription = (match: Match) => {
    if (isDoublesMatch(match)) {
      const teamOneNames = match.playerOnePartner 
        ? `${getDisplayName(match.playerOne)} / ${getDisplayName(match.playerOnePartner)}` 
        : getDisplayName(match.playerOne);
      
      const teamTwoNames = match.playerTwoPartner 
        ? `${getDisplayName(match.playerTwo)} / ${getDisplayName(match.playerTwoPartner)}` 
        : getDisplayName(match.playerTwo);
      
      return `${teamOneNames} vs ${teamTwoNames}`;
    }
    
    return `${getDisplayName(match.playerOne)} vs ${getDisplayName(match.playerTwo)}`;
  };
  
  // Determine if the user was a winner
  const userWasWinner = (match: Match) => {
    return match.winnerId === userId;
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p>Failed to load match history</p>
        <Button 
          variant="outline"
          className="mt-2"
          onClick={() => setPage(1)}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  if (!data || !data.matches || data.matches.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No match history available for this user.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.matches.map((match: Match) => (
              <TableRow key={match.id}>
                <TableCell>
                  {format(new Date(match.date), 'MMM d, yyyy')}
                </TableCell>
                
                <TableCell>
                  <div>
                    <div>{getMatchDescription(match)}</div>
                    <Badge variant="outline" className="mt-1">
                      {match.format}
                    </Badge>
                  </div>
                </TableCell>
                
                <TableCell>
                  {formatScore(match.score)}
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant={userWasWinner(match) ? 'default' : 'secondary'}
                    className="font-medium"
                  >
                    {userWasWinner(match) ? 'Won' : 'Lost'}
                    {match.pointsAwarded > 0 && ` (+${match.pointsAwarded})`}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {(page > 1 || data.pagination?.hasMore) && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevPage}
            disabled={page === 1}
          >
            Previous
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={!data.pagination?.hasMore}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};