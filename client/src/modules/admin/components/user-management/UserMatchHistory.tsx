/**
 * PKL-278651-ADMIN-0015-USER
 * User Match History Component
 * 
 * This component displays the match history for a user
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trophy,
  X,
  Users,
  Calendar,
  Flag
} from 'lucide-react';
import { getUserMatches } from '@/lib/api/admin/user-management';
import { formatDate } from '@/lib/utils';

interface UserMatchHistoryProps {
  userId: number;
}

export function UserMatchHistory({ userId }: UserMatchHistoryProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Fetch user matches
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', userId, 'matches', page],
    queryFn: async () => await getUserMatches(userId, page, pageSize),
    refetchOnWindowFocus: false
  });
  
  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match History</CardTitle>
        <CardDescription>
          Record of matches played by this user
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive font-medium">Failed to load match history.</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </div>
        ) : data?.matches && data.matches.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>XP/Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatDate(match.playedAt || match.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {match.type || 'Casual'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {match.playerCount || (
                            match.team1Players && match.team2Players 
                              ? match.team1Players.length + match.team2Players.length
                              : '?'
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {match.userWon ? (
                        <Badge variant="success" className="gap-1">
                          <Trophy className="h-3.5 w-3.5" />
                          <span>Win</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <X className="h-3.5 w-3.5" />
                          <span>Loss</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {match.team1Score !== undefined && match.team2Score !== undefined ? (
                          `${match.userTeam === 1 ? match.team1Score : match.team2Score} - ${match.userTeam === 1 ? match.team2Score : match.team1Score}`
                        ) : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                          +{match.xpEarned || 0} XP
                        </span>
                        {match.ratingChange && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            match.ratingChange > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {data.pagination && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.pagination.totalItems)} of {data.pagination.totalItems} matches
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page >= data.pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Flag className="h-10 w-10 mb-2 opacity-20" />
            <p>No matches recorded for this user yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}