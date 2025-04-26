/**
 * PKL-278651-PROF-0023-COMP - Tournament Showcase
 * 
 * A component to display tournament participation history and achievements.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Users, 
  Medal, 
  ChevronRight, 
  Info, 
  GripVertical, 
  X,
  CalendarDays
} from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { formatDate } from "@/lib/stringUtils";
import { Tournament } from "@/types/tournament";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface TournamentShowcaseProps {
  user: EnhancedUser;
  className?: string;
}

type SortOption = 'recent' | 'performance';
type FilterOption = 'all' | 'wins' | 'podium';

export default function TournamentShowcase({
  user,
  className = ""
}: TournamentShowcaseProps) {
  // State for sort and filter options
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  // Get tournament history
  const { 
    data: tournaments = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/tournaments/history', user.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/tournaments/history?userId=${user.id}`);
      return response.json();
    }
  });
  
  // Filter and sort tournaments
  const processedTournaments = useMemo(() => {
    let filtered = [...tournaments];
    
    // Apply filter
    if (filterBy === 'wins') {
      filtered = filtered.filter((t: Tournament) => t.placement === 1);
    } else if (filterBy === 'podium') {
      filtered = filtered.filter((t: Tournament) => t.placement <= 3);
    }
    
    // Apply sorting
    if (sortBy === 'recent') {
      filtered.sort((a: Tournament, b: Tournament) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortBy === 'performance') {
      filtered.sort((a: Tournament, b: Tournament) => {
        // First by placement (lower is better)
        if (a.placement !== b.placement) {
          return a.placement - b.placement;
        }
        // Then by date (newer is better)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
    
    return filtered;
  }, [tournaments, sortBy, filterBy]);
  
  // Tournament statistics
  const stats = useMemo(() => {
    const total = tournaments.length;
    const wins = tournaments.filter((t: Tournament) => t.placement === 1).length;
    const podiums = tournaments.filter((t: Tournament) => t.placement <= 3).length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    return { total, wins, podiums, winRate };
  }, [tournaments]);
  
  // Get medal emoji based on placement
  const getMedalEmoji = (placement: number): string => {
    switch (placement) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Tournament Showcase</CardTitle>
            <CardDescription>Your tournament participation history</CardDescription>
          </div>
          
          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <Select 
              value={filterBy} 
              onValueChange={(value) => setFilterBy(value as FilterOption)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                <SelectItem value="wins">Wins only</SelectItem>
                <SelectItem value="podium">Podium only</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={sortBy} 
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[140px]">
                <GripVertical className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="performance">Best performance</SelectItem>
              </SelectContent>
            </Select>
            
            {(filterBy !== 'all' || sortBy !== 'recent') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFilterBy('all');
                  setSortBy('recent');
                }}
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Wins</div>
            <div className="text-2xl font-bold flex items-center justify-center">
              {stats.wins}
              <span className="ml-1 text-base">🥇</span>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Podiums</div>
            <div className="text-2xl font-bold flex items-center justify-center">
              {stats.podiums}
              <span className="ml-1 text-sm">🏆</span>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-2xl font-bold">{stats.winRate}%</div>
          </div>
        </div>
        
        {/* Tournament Grid */}
        <div className="mt-4">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading tournaments...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Error loading tournaments</p>
              <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
            </div>
          ) : processedTournaments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No tournaments found</p>
              {filterBy !== 'all' && (
                <Button 
                  variant="link" 
                  onClick={() => setFilterBy('all')}
                  className="mt-2"
                >
                  View all tournaments
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedTournaments.map((tournament: Tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <div className={`h-2 w-full ${getTournamentColorClass(tournament.placement)}`} />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium line-clamp-1">{tournament.name}</h3>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                            {formatDate(tournament.date, 'medium')}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge 
                            variant="outline" 
                            className={`${getTournamentBadgeClass(tournament.placement)}`}
                          >
                            <span className="mr-1">{getMedalEmoji(tournament.placement)}</span>
                            {getPlacementText(tournament.placement)}
                          </Badge>
                          {tournament.division && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {tournament.division}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {tournament.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            <span className="truncate">{tournament.location}</span>
                          </div>
                        )}
                        
                        {tournament.participants && (
                          <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            <span>{tournament.participants} participants</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <span>View All Tournaments</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper functions for tournament styling
function getTournamentColorClass(placement: number): string {
  switch (placement) {
    case 1: return 'bg-amber-500';
    case 2: return 'bg-slate-400';
    case 3: return 'bg-amber-800';
    default: return 'bg-primary/30';
  }
}

function getTournamentBadgeClass(placement: number): string {
  switch (placement) {
    case 1:
      return 'bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300';
    case 2:
      return 'bg-slate-100 text-slate-900 dark:bg-slate-900/20 dark:text-slate-300';
    case 3:
      return 'bg-amber-100/50 text-amber-900 dark:bg-amber-900/10 dark:text-amber-300';
    default:
      return '';
  }
}

function getPlacementText(placement: number): string {
  if (placement === 1) return '1st Place';
  if (placement === 2) return '2nd Place';
  if (placement === 3) return '3rd Place';
  
  // Handle 4th, 5th, etc.
  if (placement === 21 || placement === 31) return `${placement}st Place`;
  if (placement === 22 || placement === 32) return `${placement}nd Place`;
  if (placement === 23 || placement === 33) return `${placement}rd Place`;
  
  return `${placement}th Place`;
}