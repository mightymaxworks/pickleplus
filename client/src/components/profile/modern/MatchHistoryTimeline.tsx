/**
 * PKL-278651-PROF-0022-COMP - Match History Timeline
 * 
 * A timeline visualization of user match history with filtering options.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Trophy, 
  Clock, 
  Calendar, 
  User, 
  ArrowRight, 
  Filter, 
  X,
  ChevronRight
} from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { formatDate } from "@/lib/stringUtils";
import { Match } from "@/types/match";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface MatchHistoryTimelineProps {
  user: EnhancedUser;
  className?: string;
}

// Filter options for the match history
type FilterPeriod = 'all' | 'month' | 'quarter' | 'year';

export default function MatchHistoryTimeline({
  user,
  className = ""
}: MatchHistoryTimelineProps) {
  // Filter state
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  
  // Get match history
  const { 
    data: matches = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/matches/history', user.id],
    queryFn: async () => {
      try {
        // First try the specific endpoint
        const response = await apiRequest("GET", `/api/matches/history?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        
        // Fall back to SAGE API endpoint if available
        const sageResponse = await apiRequest("GET", `/api/sage/match-history?userId=${user.id}`);
        if (sageResponse.ok) {
          const sageData = await sageResponse.json();
          return Array.isArray(sageData.data) ? sageData.data : [];
        }
        
        // If both fail, return empty array
        console.error("Failed to fetch match history data from either endpoint");
        return [];
      } catch (e) {
        console.error("Error fetching match history:", e);
        return [];
      }
    }
  });
  
  // Filter matches based on selected period
  const filteredMatches = useMemo(() => {
    if (filterPeriod === 'all') return matches;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (filterPeriod) {
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return matches.filter((match: Match) => {
      const matchDate = new Date(match.date);
      return matchDate >= cutoffDate;
    });
  }, [matches, filterPeriod]);
  
  // Group matches by month for the timeline
  const groupedMatches = useMemo(() => {
    const groups: Record<string, Match[]> = {};
    
    filteredMatches.forEach((match: Match) => {
      const date = new Date(match.date);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      
      groups[monthYear].push(match);
    });
    
    // Sort groups by date (newest first)
    return Object.entries(groups)
      .sort(([monthYearA], [monthYearB]) => {
        const dateA = new Date(monthYearA);
        const dateB = new Date(monthYearB);
        return dateB.getTime() - dateA.getTime();
      })
      .map(([monthYear, matches]) => ({
        monthYear,
        matches: matches.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }));
  }, [filteredMatches]);
  
  // Calculate win/loss stats
  const stats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    
    filteredMatches.forEach((match: Match) => {
      if (match.winner === user.id) {
        wins++;
      } else {
        losses++;
      }
    });
    
    const total = wins + losses;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    return {
      total,
      wins,
      losses,
      winRate
    };
  }, [filteredMatches, user.id]);
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Match History</CardTitle>
            <CardDescription>Your recent matches and results</CardDescription>
          </div>
          
          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <Select 
              value={filterPeriod} 
              onValueChange={(value) => setFilterPeriod(value as FilterPeriod)}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="month">Last month</SelectItem>
                <SelectItem value="quarter">Last 3 months</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            {filterPeriod !== 'all' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFilterPeriod('all')}
                title="Clear filter"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Wins</div>
            <div className="text-2xl font-bold text-emerald-500">{stats.wins}</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Losses</div>
            <div className="text-2xl font-bold text-red-500">{stats.losses}</div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-2xl font-bold">{stats.winRate}%</div>
          </div>
        </div>
        
        {/* Match Timeline */}
        <div className="mt-6">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading match history...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Error loading match history</p>
              <p className="text-sm text-muted-foreground mt-2">Please try again later</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No matches found for this period</p>
              {filterPeriod !== 'all' && (
                <Button 
                  variant="link" 
                  onClick={() => setFilterPeriod('all')}
                  className="mt-2"
                >
                  View all matches
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedMatches.map((group, groupIndex) => (
                <div key={group.monthYear} className="relative">
                  {/* Month heading */}
                  <div className="sticky top-0 z-10 bg-background py-2 mb-3">
                    <h3 className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {group.monthYear}
                    </h3>
                    <Separator className="mt-2" />
                  </div>
                  
                  {/* Match list */}
                  <div className="pl-4 border-l-2 border-dashed border-muted-foreground/20 space-y-4">
                    {group.matches.map((match: Match, matchIndex) => {
                      const isWin = match.winner === user.id;
                      const isExpanded = expanded === match.id;
                      
                      return (
                        <motion.div 
                          key={match.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: groupIndex * 0.2 + matchIndex * 0.05 
                          }}
                          className="relative"
                        >
                          {/* Timeline dot */}
                          <div 
                            className={`absolute -left-[17px] top-[10px] h-3 w-3 rounded-full ${
                              isWin ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          
                          {/* Match card */}
                          <div 
                            className={`
                              rounded-lg p-3 cursor-pointer transition-colors
                              ${isExpanded ? 'bg-muted' : 'bg-card hover:bg-muted/50'} 
                              ${isWin ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'}
                            `}
                            onClick={() => setExpanded(isExpanded ? null : match.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium flex items-center gap-1">
                                  {match.tournamentName ? (
                                    <>
                                      <Trophy className="h-3.5 w-3.5 text-amber-500 mr-1" />
                                      {match.tournamentName}
                                    </>
                                  ) : (
                                    'Casual Match'
                                  )}
                                  
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-2 text-xs ${
                                      isWin ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                    }`}
                                  >
                                    {isWin ? 'Win' : 'Loss'}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm text-muted-foreground flex items-center mt-1">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {formatDate(match.date, 'medium')}
                                </div>
                              </div>
                              
                              <div className="text-sm font-medium">
                                {match.score || 'No score'}
                              </div>
                            </div>
                            
                            {/* Expanded details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <Separator className="my-3" />
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Opponents:</span>
                                      </div>
                                      <span>{match.opponents?.join(', ') || 'Unknown'}</span>
                                    </div>
                                    
                                    {match.location && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Location:</span>
                                        <span>{match.location}</span>
                                      </div>
                                    )}
                                    
                                    {match.duration && (
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Duration:</span>
                                        <span>{match.duration} min</span>
                                      </div>
                                    )}
                                    
                                    {match.notes && (
                                      <div className="text-sm mt-2">
                                        <div className="text-muted-foreground mb-1">Notes:</div>
                                        <div className="bg-background p-2 rounded text-sm">
                                          {match.notes}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <span>View Complete History</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}