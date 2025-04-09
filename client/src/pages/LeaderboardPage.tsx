import React from 'react';
import { useLocation, useSearch } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Medal, 
  Trophy, 
  Filter, 
  Search, 
  SlidersHorizontal, 
  Crown, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  Download,
  Share2,
  Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/ui/pagination";

import { 
  AgeDivision, 
  PlayFormat, 
  LeaderboardEntry 
} from "@shared/multi-dimensional-rankings";
import { usePCPGlobalLeaderboard } from "@/hooks/use-pcp-global-rankings";
import { useRatingTiers } from "@/hooks/use-multi-dimensional-rankings";

export function LeaderboardPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  // Get URL parameters or use defaults
  const [format, setFormat] = React.useState<PlayFormat>(
    (params.get('format') as PlayFormat) || 'singles'
  );
  const [ageDivision, setAgeDivision] = React.useState<AgeDivision>(
    (params.get('division') as AgeDivision) || '19plus'
  );
  const [page, setPage] = React.useState(parseInt(params.get('page') || '1', 10));
  const [searchTerm, setSearchTerm] = React.useState(params.get('search') || '');
  const [itemsPerPage, setItemsPerPage] = React.useState(20);
  const [sortField, setSortField] = React.useState<string>('rank');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
  // Fetch rating tiers
  const { data: tiers, isLoading: tiersLoading } = useRatingTiers();
  
  // Fetch leaderboard data
  const { 
    data: leaderboardResponse,
    isLoading,
    isError,
    refetch
  } = usePCPGlobalLeaderboard(
    format, 
    ageDivision, 
    undefined, 
    itemsPerPage, 
    (page - 1) * itemsPerPage
  );
  
  // Extract the leaderboard array from the response
  const leaderboard = leaderboardResponse?.leaderboard || [];
  
  // Calculate total pages
  const totalPlayers = leaderboard.length > 0 ? 200 : 0; // Default to 200 until we get real count from API
  const totalPages = Math.ceil(totalPlayers / itemsPerPage);
  
  // Update URL when filters change
  React.useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set('format', format);
    newParams.set('division', ageDivision);
    newParams.set('page', page.toString());
    if (searchTerm) newParams.set('search', searchTerm);
    
    // Replace the URL without triggering a page load
    window.history.replaceState(
      null, 
      '', 
      window.location.pathname + '?' + newParams.toString()
    );
  }, [format, ageDivision, page, searchTerm]);
  
  // Handle format change
  const handleFormatChange = (value: string) => {
    setFormat(value as PlayFormat);
    setPage(1); // Reset to first page on filter change
  };
  
  // Handle division change
  const handleDivisionChange = (value: string) => {
    setAgeDivision(value as AgeDivision);
    setPage(1); // Reset to first page on filter change
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to search would be implemented here
    setPage(1); // Reset to first page on search
  };
  
  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and reset to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get tier color for a player based on CourtIQ™ rating
  const getTierColor = (player: LeaderboardEntry) => {
    if (!tiers || tiersLoading) return undefined;
    
    // Use the player's overall CourtIQ rating if available
    // Fall back to 4.0 if no rating is available
    const rating = player.ratings?.overall || 4.0;
    
    const tier = tiers.find(t => 
      rating >= t.minRating && 
      rating <= (t.maxRating || 5.0)
    );
    
    return tier?.colorCode || undefined;
  };
  
  // Format division name for display
  const formatDivisionName = (division: string) => {
    if (division === '19plus') return 'Open (19+)';
    if (division.startsWith('U')) return `Junior ${division}`;
    return `${division}`;
  };
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center text-gray-900 dark:text-gray-100">
            <Trophy className="w-6 h-6 mr-2 text-[#FF5722]" />
            Global PCP Rankings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and filter the Pickle+ Competitive Points (PCP) global leaderboard. 
            Players are ranked by PCP points, with skill ratings shown from the CourtIQ™ system.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this leaderboard view</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export leaderboard data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Filters */}
      <motion.div 
        className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex w-full space-x-2">
              <Input
                type="text"
                placeholder="Search by player name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
            </form>
          </div>
          
          <div className="flex flex-1 space-x-2">
            <div className="flex-1">
              <Select
                value={format}
                onValueChange={handleFormatChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="singles">Singles</SelectItem>
                  <SelectItem value="doubles">Doubles</SelectItem>
                  <SelectItem value="mixed">Mixed Doubles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select
                value={ageDivision}
                onValueChange={handleDivisionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="19plus">Open (19+)</SelectItem>
                  <SelectItem value="35plus">35+</SelectItem>
                  <SelectItem value="50plus">50+</SelectItem>
                  <SelectItem value="60plus">60+</SelectItem>
                  <SelectItem value="70plus">70+</SelectItem>
                  <SelectItem value="U19">Junior U19</SelectItem>
                  <SelectItem value="U16">Junior U16</SelectItem>
                  <SelectItem value="U14">Junior U14</SelectItem>
                  <SelectItem value="U12">Junior U12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active Filters:
            </span>
            <Badge variant="secondary" className="text-xs">
              {format.charAt(0).toUpperCase() + format.slice(1)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {formatDivisionName(ageDivision)}
            </Badge>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: {searchTerm}
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            <span>Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, totalPlayers)} of {totalPlayers}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Leaderboard Table */}
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">
              Failed to load leaderboard data. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="secondary">
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]" onClick={() => handleSort('rank')}>
                      <div className="flex items-center cursor-pointer">
                        <span>Rank</span>
                        {sortField === 'rank' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('name')}>
                      <div className="flex items-center cursor-pointer">
                        <span>Player</span>
                        {sortField === 'name' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-center" onClick={() => handleSort('points')}>
                      <div className="flex items-center justify-center cursor-pointer">
                        <span>PCP Score</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="ml-1 h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs">Pickle+ Competitive Points determine your ranking position on the leaderboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {sortField === 'points' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-center">
                      <div className="flex items-center justify-center">
                        <span>CourtIQ™</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="ml-1 h-3 w-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs">CourtIQ™ skill rating determines your tier color and is separate from PCP points</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell text-center">Country</TableHead>
                    <TableHead className="hidden lg:table-cell">Specialty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard && leaderboard.map((player: LeaderboardEntry, index: number) => {
                    const rank = player.rank || player.position || index + 1 + (page - 1) * itemsPerPage;
                    const name = player.displayName || player.username;
                    const points = player.pointsTotal || player.rankingPoints || 0;
                    const tierColor = getTierColor(player);
                    const specialty = player.specialty || 'All-Around';
                    
                    let rankBadgeClass = "h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold text-white";
                    if (rank === 1) {
                      rankBadgeClass += " bg-gradient-to-br from-yellow-400 to-yellow-600";
                    } else if (rank === 2) {
                      rankBadgeClass += " bg-gradient-to-br from-gray-300 to-gray-500";
                    } else if (rank === 3) {
                      rankBadgeClass += " bg-gradient-to-br from-amber-700 to-amber-900";
                    } else {
                      rankBadgeClass += " bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
                    }
                    
                    return (
                      <TableRow key={player.userId}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={rankBadgeClass}>
                              {rank <= 3 ? (
                                <Crown className="h-3 w-3" />
                              ) : (
                                rank
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                              {player.avatarUrl ? (
                                <img
                                  src={player.avatarUrl}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium">
                                  {player.avatarInitials || name.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{name}</div>
                              <div className="text-xs text-gray-500">
                                @{player.username}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-[#FF5722]">
                          {points.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Badge 
                            style={{ 
                              backgroundColor: tierColor || "#6b7280",
                              color: "white" 
                            }} 
                            className="text-xs font-normal"
                          >
                            {player.ratings?.overall || "4.5"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded overflow-hidden">
                              {player.countryCode && (
                                <img 
                                  src={`https://flagcdn.com/w20/${player.countryCode.toLowerCase()}.png`} 
                                  alt={player.countryCode} 
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          </>
        )}
      </motion.div>
      
      {/* Rating Tiers Legend */}
      <motion.div 
        className="mt-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Medal className="w-4 h-4 mr-1 text-blue-500" />
          CourtIQ™ Rating Tiers
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Player ratings are based on the CourtIQ™ multi-dimensional skill rating system
        </p>
        <div className="flex flex-wrap gap-3">
          {tiersLoading ? (
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          ) : (
            tiers?.map((tier) => (
              <Badge
                key={tier.id}
                style={{
                  backgroundColor: tier.colorCode || undefined,
                  color: "white"
                }}
                className="text-xs"
              >
                {tier.name}: {tier.minRating.toFixed(1)}
                {tier.maxRating ? ` - ${tier.maxRating.toFixed(1)}` : "+"}
              </Badge>
            ))
          )}
        </div>
      </motion.div>
      
      {/* Back to Dashboard Button */}
      <div className="mt-6">
        <Button variant="ghost" size="sm" asChild>
          <a href="/dashboard" className="flex items-center">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
}