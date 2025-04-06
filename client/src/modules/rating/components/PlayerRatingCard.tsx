/**
 * PlayerRatingCard Component
 * 
 * This component displays a player's CourtIQ ratings across
 * different divisions and formats.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Award, 
  Shield, 
  User,
  Info
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Player rating type from API
interface PlayerRating {
  id: number;
  rating: number;
  tier: string;
  division: string;
  format: string;
  matchesPlayed: number;
  confidenceLevel: number;
  isProvisional: boolean;
  seasonHighRating: number;
  allTimeHighRating: number;
  lastMatchDate: string;
  rank?: number; // Optional rank in leaderboard
}

// Component props
interface PlayerRatingCardProps {
  userId: number;
  showDetailedStats?: boolean;
  showRatingHistory?: boolean;
}

export default function PlayerRatingCard({
  userId,
  showDetailedStats = true,
  showRatingHistory = false
}: PlayerRatingCardProps) {
  // State to track selected division and format
  const [selectedDivision, setSelectedDivision] = useState('19+');
  const [selectedFormat, setSelectedFormat] = useState('singles');
  
  // Fetch player ratings
  const { 
    data: ratings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/user/ratings', userId],
    queryFn: async () => {
      const response = await fetch(`/api/user/ratings/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch player ratings');
      }
      
      return response.json();
    },
    enabled: !!userId,
  });
  
  // Format options
  const formatOptions = [
    { value: 'singles', label: 'Singles' },
    { value: 'mens_doubles', label: 'Men\'s Doubles' },
    { value: 'womens_doubles', label: 'Women\'s Doubles' },
    { value: 'mixed_doubles', label: 'Mixed Doubles' }
  ];
  
  // Division options - these will be filtered based on player eligibility
  const divisionOptions = ratings?.eligibleDivisions?.map((div: string) => ({
    value: div,
    label: div === '19+' ? 'Open (19+)' : div
  })) || [
    { value: '19+', label: 'Open (19+)' }
  ];
  
  // Get the selected rating
  const selectedRating = ratings?.ratings?.find(
    (r: PlayerRating) => r.division === selectedDivision && r.format === selectedFormat
  );
  
  // Format timestamp to relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };
  
  // Get tier color
  const getTierColor = (tier: string): string => {
    const tierColors: Record<string, string> = {
      'Dink Dabbler': '#6c757d',
      'Paddle Prospect': '#28a745',
      'Rally Ranger': '#17a2b8',
      'Volley Voyager': '#007bff',
      'Spin Specialist': '#6f42c1',
      'Kitchen Commander': '#fd7e14',
      'Smash Sovereign': '#e83e8c',
      'Court Crusader': '#dc3545',
      'Pickleball Prophet': '#f1c40f',
      'Tournament Titan': '#9b59b6'
    };
    
    return tierColors[tier] || '#6c757d';
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CourtIQ™ Rating</CardTitle>
          <CardDescription>Loading player ratings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
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
          <CardTitle className="text-red-500">Error Loading Ratings</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Could not load player ratings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later or contact support if the problem persists.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Handle no rating available for selected division/format
  if (!selectedRating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CourtIQ™ Rating</CardTitle>
          <CardDescription>
            No rating data available for {selectedDivision} {selectedFormat.replace('_', ' ')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Award className="h-16 w-16 mb-4 text-muted-foreground opacity-30" />
            <p className="text-center">
              This player doesn't have a rating for this division and format yet. 
              Ratings are established after playing matches.
            </p>
          </div>
          
          <div className="mt-4">
            <Tabs defaultValue={selectedFormat} onValueChange={setSelectedFormat}>
              <TabsList className="w-full">
                {formatOptions.map(format => (
                  <TabsTrigger key={format.value} value={format.value} className="flex-1">
                    {format.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <div className="mt-4">
              <Tabs defaultValue={selectedDivision} onValueChange={setSelectedDivision}>
                <TabsList className="w-full">
                  {divisionOptions.map(division => (
                    <TabsTrigger key={division.value} value={division.value} className="flex-1">
                      {division.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>CourtIQ™ Rating</CardTitle>
            <CardDescription>
              {selectedDivision} {selectedFormat.replace('_', ' ')}
            </CardDescription>
          </div>
          
          {selectedRating?.rank && (
            <Badge variant="outline" className="text-md px-3 py-1">
              #{selectedRating.rank}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Rating and Tier */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            <div 
              className="flex items-center justify-center h-28 w-28 rounded-full"
              style={{ 
                backgroundColor: `${getTierColor(selectedRating.tier)}20`, 
                border: `3px solid ${getTierColor(selectedRating.tier)}` 
              }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold">{selectedRating.rating}</div>
                <div className="text-xs text-muted-foreground">RATING</div>
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-2xl font-semibold">{selectedRating.tier}</h3>
              
              {/* Confidence bar */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Confidence Level</span>
                  <span className="text-sm font-semibold">{selectedRating.confidenceLevel}%</span>
                </div>
                <Progress value={selectedRating.confidenceLevel} className="h-2" />
              </div>
              
              {/* Provisional tag */}
              {selectedRating.isProvisional && (
                <Badge variant="secondary" className="mt-2">
                  Provisional Rating
                </Badge>
              )}
            </div>
          </div>
          
          {/* Format and Division selectors */}
          <div className="space-y-4">
            <Tabs defaultValue={selectedFormat} onValueChange={setSelectedFormat}>
              <TabsList className="w-full">
                {formatOptions.map(format => (
                  <TabsTrigger key={format.value} value={format.value} className="flex-1">
                    {format.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <Tabs defaultValue={selectedDivision} onValueChange={setSelectedDivision}>
              <TabsList className="w-full">
                {divisionOptions.map(division => (
                  <TabsTrigger key={division.value} value={division.value} className="flex-1">
                    {division.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Detailed stats */}
          {showDetailedStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Matches</span>
                </div>
                <div className="text-xl font-semibold">{selectedRating.matchesPlayed}</div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Season High</span>
                </div>
                <div className="text-xl font-semibold">{selectedRating.seasonHighRating}</div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-xs">All-Time High</span>
                </div>
                <div className="text-xl font-semibold">{selectedRating.allTimeHighRating}</div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Last Match</span>
                </div>
                <div className="text-md font-semibold">
                  {selectedRating.lastMatchDate 
                    ? formatRelativeTime(selectedRating.lastMatchDate)
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Info className="h-4 w-4" />
          <span>
            Ratings are calculated using the CourtIQ™ system based on match results.
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}