/**
 * LeaderboardView Component
 * 
 * This component displays the CourtIQ leaderboard with filtering options
 * for division, format, and season.
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronUp, ChevronDown, Medal, User, Trophy } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Leaderboard entry type (from API)
interface LeaderboardEntry {
  userId: number;
  rank: number;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  rating?: number;
  points?: number;
  tier?: string;
  matchesPlayed: number;
  winPercentage: number;
  rankChange?: number; // Positive = improved, negative = dropped
  isCurrentUser: boolean;
}

// LeaderboardView props
interface LeaderboardViewProps {
  userId?: number; // Current user ID (optional)
  initialDivision?: string; // Initial division to show
  initialFormat?: string; // Initial format to show
  initialSeason?: string; // Initial season to show
  leaderboardType?: 'rating' | 'points'; // Which leaderboard to show
  showFilters?: boolean; // Whether to show filter options
  maxEntries?: number; // Maximum entries to display
  showPersonalHighlight?: boolean; // Highlight current user
}

export default function LeaderboardView({
  userId,
  initialDivision = 'all',
  initialFormat = 'all',
  initialSeason = 'current',
  leaderboardType = 'rating',
  showFilters = true,
  maxEntries = 100,
  showPersonalHighlight = true
}: LeaderboardViewProps) {
  // State for filters
  const [division, setDivision] = useState(initialDivision);
  const [format, setFormat] = useState(initialFormat);
  const [season, setSeason] = useState(initialSeason);
  const [type, setType] = useState<'rating' | 'points'>(leaderboardType);
  
  // Fetch leaderboard data
  const { 
    data: leaderboard, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/leaderboard', type, division, format, season],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?type=${type}&division=${division}&format=${format}&season=${season}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      return response.json();
    },
    enabled: true,
  });
  
  // Divisions options
  const divisionOptions = [
    { value: 'all', label: 'All Divisions' },
    { value: '19+', label: 'Open (19+)' },
    { value: '35+', label: '35+' },
    { value: '50+', label: '50+' },
    { value: '60+', label: '60+' },
    { value: '70+', label: '70+' }
  ];
  
  // Format options
  const formatOptions = [
    { value: 'all', label: 'All Formats' },
    { value: 'singles', label: 'Singles' },
    { value: 'mens_doubles', label: 'Men\'s Doubles' },
    { value: 'womens_doubles', label: 'Women\'s Doubles' },
    { value: 'mixed_doubles', label: 'Mixed Doubles' }
  ];
  
  // Season options - this would typically come from an API
  const seasonOptions = [
    { value: 'current', label: 'Current Season' },
    { value: 'all-time', label: 'All Time' }
  ];
  
  // Determine medal color for top ranks
  const getMedalColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-gray-500';
    }
  };
  
  // Handle change in ranking mode
  const handleModeChange = (value: string) => {
    setType(value as 'rating' | 'points');
  };
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CourtIQ™ Rankings</CardTitle>
          <CardDescription>Loading leaderboard data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Leaderboard</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Could not load leaderboard data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later or contact support if the problem persists.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>CourtIQ™ Rankings</CardTitle>
            <CardDescription>
              {type === 'rating' ? 'Player ratings based on match performance' : 'Seasonal points earned from matches and tournaments'}
            </CardDescription>
          </div>
          
          {showFilters && (
            <Tabs defaultValue={type} onValueChange={handleModeChange} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="rating">Rating</TabsTrigger>
                <TabsTrigger value="points">Points</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </CardHeader>
      
      {showFilters && (
        <div className="px-6 pb-2 flex flex-col sm:flex-row gap-4">
          <Select value={division} onValueChange={setDivision}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent>
              {divisionOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              {seasonOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <CardContent>
        <div className="rounded-md border">
          {/* Mobile-optimized card layout */}
          <div className="space-y-2">
            {leaderboard?.entries?.slice(0, maxEntries).map((entry: LeaderboardEntry) => (
              <div 
                key={entry.userId}
                className={`p-4 rounded-lg border transition-colors ${
                  entry.isCurrentUser && showPersonalHighlight 
                    ? 'bg-muted/50 border-primary border-opacity-30' 
                    : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {entry.rank <= 3 ? (
                        <Medal className={`h-5 w-5 ${getMedalColor(entry.rank)}`} />
                      ) : (
                        <span className="font-semibold text-sm">{entry.rank}</span>
                      )}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={entry.profileImageUrl} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="font-semibold truncate">
                        {entry.displayName || entry.username}
                      </div>
                      {entry.isCurrentUser && showPersonalHighlight && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    
                    {entry.tier && (
                      <div className="text-xs text-muted-foreground mb-2">{entry.tier}</div>
                    )}
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          {type === 'rating' ? 'Rating' : 'Points'}:
                        </span>
                        <span className="font-semibold ml-1">
                          {type === 'rating' ? entry.rating : entry.points}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Matches:</span>
                        <span className="font-medium ml-1">{entry.matchesPlayed}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Win %:</span>
                        <span className="font-medium ml-1">{entry.winPercentage}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Change:</span>
                        {entry.rankChange !== undefined && (
                          <span className="ml-1 flex items-center">
                            {entry.rankChange > 0 ? (
                              <>
                                <ChevronUp className="h-3 w-3 text-green-500" />
                                <span className="text-green-500 text-xs">{entry.rankChange}</span>
                              </>
                            ) : entry.rankChange < 0 ? (
                              <>
                                <ChevronDown className="h-3 w-3 text-red-500" />
                                <span className="text-red-500 text-xs">{Math.abs(entry.rankChange)}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* If no entries are found */}
            {(!leaderboard?.entries || leaderboard.entries.length === 0) && (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No leaderboard data available</p>
                  <p className="text-sm">Try adjusting your filters or check back later.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footnote with leaderboard info */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            {type === 'rating' 
              ? 'Ratings are calculated using the CourtIQ™ intelligence system based on match results.'
              : 'CourtIQ™ ranking points are earned from match wins, tournament participation, and achievements.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}