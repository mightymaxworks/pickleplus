/**
 * PKL-278651-PROF-0029-COMP - Player Comparison Tool
 * 
 * Component for comparing player statistics and performance metrics.
 * Part of Sprint 4 enhancement for profile comparison features.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, BarChart3, RefreshCw, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnhancedUser } from "@/types/enhanced-user";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

interface PlayerComparisonToolProps {
  currentUser: EnhancedUser;
}

export default function PlayerComparisonTool({ currentUser }: PlayerComparisonToolProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Search for players
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await apiRequest("GET", `/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      return data.filter((user: EnhancedUser) => user.id !== currentUser.id); // Filter out current user
    },
    enabled: searchQuery.length >= 2
  });
  
  // Get comparison user data
  const { data: comparisonUser, isLoading: isLoadingComparison } = useQuery({
    queryKey: ["/api/users/detail", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const res = await apiRequest("GET", `/api/users/detail/${selectedUserId}`);
      return await res.json();
    },
    enabled: !!selectedUserId
  });
  
  // CourtIQ value comparisons - memoized to avoid recalculation
  const courtIQComparisons = useMemo(() => {
    if (!comparisonUser) return null;
    
    // Type-safe metrics array as tuple of literal types
    const metrics = ["technical", "tactical", "physical", "mental", "consistency"] as const;
    const dimensionCodes = ["TECH", "TACT", "PHYS", "MENT", "CONS"];
    
    return metrics.map((metric, index) => {
      const code = dimensionCodes[index];
      const currentUserValue = currentUser.courtIQ?.[metric] || 0;
      const comparisonUserValue = comparisonUser.courtIQ?.[metric] || 0;
      const difference = currentUserValue - comparisonUserValue;
      
      return {
        name: metric.charAt(0).toUpperCase() + metric.slice(1),
        code,
        currentUserValue,
        comparisonUserValue,
        difference,
        currentUserIsHigher: difference > 0,
        equal: difference === 0
      };
    });
  }, [currentUser, comparisonUser]);
  
  // Overall stats comparison
  const overallComparison = useMemo(() => {
    if (!comparisonUser) return null;
    
    const currentUserOverall = currentUser.courtIQ?.overall || 0;
    const comparisonUserOverall = comparisonUser.courtIQ?.overall || 0;
    const difference = currentUserOverall - comparisonUserOverall;
    
    return {
      currentUserValue: currentUserOverall,
      comparisonUserValue: comparisonUserOverall,
      difference,
      currentUserIsHigher: difference > 0,
      equal: difference === 0
    };
  }, [currentUser, comparisonUser]);
  
  // Experience and level comparison
  const experienceComparison = useMemo(() => {
    if (!comparisonUser) return null;
    
    return {
      level: {
        currentUserValue: currentUser.level || 1,
        comparisonUserValue: comparisonUser.level || 1,
        difference: (currentUser.level || 1) - (comparisonUser.level || 1),
        currentUserIsHigher: (currentUser.level || 1) > (comparisonUser.level || 1),
        equal: (currentUser.level || 1) === (comparisonUser.level || 1)
      },
      xp: {
        currentUserValue: currentUser.xp || 0,
        comparisonUserValue: comparisonUser.xp || 0,
        difference: (currentUser.xp || 0) - (comparisonUser.xp || 0),
        currentUserIsHigher: (currentUser.xp || 0) > (comparisonUser.xp || 0),
        equal: (currentUser.xp || 0) === (comparisonUser.xp || 0)
      },
      matches: {
        currentUserValue: currentUser.matchesPlayed || 0,
        comparisonUserValue: comparisonUser.matchesPlayed || 0,
        difference: (currentUser.matchesPlayed || 0) - (comparisonUser.matchesPlayed || 0),
        currentUserIsHigher: (currentUser.matchesPlayed || 0) > (comparisonUser.matchesPlayed || 0),
        equal: (currentUser.matchesPlayed || 0) === (comparisonUser.matchesPlayed || 0)
      },
      tournaments: {
        currentUserValue: currentUser.tournamentsPlayed || 0,
        comparisonUserValue: comparisonUser.tournamentsPlayed || 0,
        difference: (currentUser.tournamentsPlayed || 0) - (comparisonUser.tournamentsPlayed || 0),
        currentUserIsHigher: (currentUser.tournamentsPlayed || 0) > (comparisonUser.tournamentsPlayed || 0),
        equal: (currentUser.tournamentsPlayed || 0) === (comparisonUser.tournamentsPlayed || 0)
      }
    };
  }, [currentUser, comparisonUser]);
  
  // Win rates comparison
  const winRateComparison = useMemo(() => {
    if (!comparisonUser) return null;
    
    const currentUserWinRate = currentUser.winRate || 0;
    const comparisonUserWinRate = comparisonUser.winRate || 0;
    const difference = currentUserWinRate - comparisonUserWinRate;
    
    return {
      currentUserValue: currentUserWinRate,
      comparisonUserValue: comparisonUserWinRate,
      difference,
      currentUserIsHigher: difference > 0,
      equal: difference === 0
    };
  }, [currentUser, comparisonUser]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Player Comparison Tool</span>
            </CardTitle>
            <CardDescription>
              Compare your stats with other players to track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for a player to compare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              {isSearching && searchQuery.length >= 2 && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md border animate-pulse">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults?.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto space-y-2 rounded-md border p-2">
                  {searchResults.map((user: EnhancedUser) => (
                    <div 
                      key={user.id} 
                      className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-muted ${selectedUserId === user.id ? 'bg-muted border-primary' : ''}`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <Avatar>
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                        <AvatarFallback>{user.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          Level {user.level || 1} • {user.location || 'No location'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 2 && searchResults?.length === 0 && !isSearching && (
                <div className="text-center py-4 text-muted-foreground">
                  No players found matching your search
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {selectedUserId && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Comparison Results</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span>New Comparison</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingComparison ? (
                <div className="space-y-4 py-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : comparisonUser ? (
                <Tabs defaultValue="courtiq" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="courtiq">CourtIQ™</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="stats">Performance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="courtiq" className="space-y-4 pt-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="flex flex-col items-center md:items-start">
                        <Avatar className="h-16 w-16 md:h-20 md:w-20 mb-2">
                          <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.username} />
                          <AvatarFallback>{currentUser.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-lg font-semibold">{currentUser.username}</div>
                        <div className="text-sm text-muted-foreground">Your Profile</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="text-2xl font-bold">{overallComparison?.currentUserValue.toFixed(1)} vs {overallComparison?.comparisonUserValue.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Overall CourtIQ Rating</div>
                        <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                          overallComparison?.currentUserIsHigher 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                            : overallComparison?.equal 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                        }`}>
                          {overallComparison?.currentUserIsHigher 
                            ? `+${overallComparison.difference.toFixed(1)} higher` 
                            : overallComparison?.equal 
                              ? 'Equal ratings'
                              : `${Math.abs(overallComparison?.difference || 0).toFixed(1)} lower`}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center md:items-end">
                        <Avatar className="h-16 w-16 md:h-20 md:w-20 mb-2">
                          <AvatarImage src={comparisonUser.avatarUrl || undefined} alt={comparisonUser.username} />
                          <AvatarFallback>{comparisonUser.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-lg font-semibold">{comparisonUser.username}</div>
                        <div className="text-sm text-muted-foreground">Comparison Profile</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courtIQComparisons?.map((comparison) => (
                        <div key={comparison.code} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{comparison.name}</div>
                            <div className="text-2xl font-bold">{comparison.currentUserValue.toFixed(1)}</div>
                            <div className={`text-sm font-medium ${
                              comparison.currentUserIsHigher 
                                ? 'text-green-600 dark:text-green-400' 
                                : comparison.equal 
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {comparison.currentUserIsHigher 
                                ? `+${comparison.difference.toFixed(1)}` 
                                : comparison.equal 
                                  ? 'Equal'
                                  : `-${Math.abs(comparison.difference).toFixed(1)}`}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground mb-1" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>This is your {comparison.name} rating compared to {comparisonUser.username}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="text-2xl font-bold">{comparison.comparisonUserValue.toFixed(1)}</div>
                            <div className="text-sm text-muted-foreground">{comparisonUser.username}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="experience" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border space-y-2">
                        <div className="text-sm font-medium">Player Level</div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">Level {experienceComparison?.level.currentUserValue}</div>
                          <div className="text-sm text-muted-foreground">vs</div>
                          <div className="text-2xl font-bold">Level {experienceComparison?.level.comparisonUserValue}</div>
                        </div>
                        <div className="flex justify-center">
                          <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                            experienceComparison?.level.currentUserIsHigher 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : experienceComparison?.level.equal 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                          }`}>
                            {experienceComparison?.level.currentUserIsHigher 
                              ? `${experienceComparison.level.difference} levels higher` 
                              : experienceComparison?.level.equal 
                                ? 'Equal levels'
                                : `${Math.abs(experienceComparison?.level.difference || 0)} levels lower`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border space-y-2">
                        <div className="text-sm font-medium">Total XP</div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">{experienceComparison?.xp.currentUserValue.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">vs</div>
                          <div className="text-2xl font-bold">{experienceComparison?.xp.comparisonUserValue.toLocaleString()}</div>
                        </div>
                        <div className="flex justify-center">
                          <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                            experienceComparison?.xp.currentUserIsHigher 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : experienceComparison?.xp.equal 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                          }`}>
                            {experienceComparison?.xp.currentUserIsHigher 
                              ? `+${experienceComparison.xp.difference.toLocaleString()} XP` 
                              : experienceComparison?.xp.equal 
                                ? 'Equal XP'
                                : `${Math.abs(experienceComparison?.xp.difference || 0).toLocaleString()} XP less`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border space-y-2">
                        <div className="text-sm font-medium">Matches Played</div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">{experienceComparison?.matches.currentUserValue}</div>
                          <div className="text-sm text-muted-foreground">vs</div>
                          <div className="text-2xl font-bold">{experienceComparison?.matches.comparisonUserValue}</div>
                        </div>
                        <div className="flex justify-center">
                          <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                            experienceComparison?.matches.currentUserIsHigher 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : experienceComparison?.matches.equal 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                          }`}>
                            {experienceComparison?.matches.currentUserIsHigher 
                              ? `+${experienceComparison.matches.difference} matches` 
                              : experienceComparison?.matches.equal 
                                ? 'Equal matches'
                                : `${Math.abs(experienceComparison?.matches.difference || 0)} matches less`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border space-y-2">
                        <div className="text-sm font-medium">Tournaments Played</div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">{experienceComparison?.tournaments.currentUserValue}</div>
                          <div className="text-sm text-muted-foreground">vs</div>
                          <div className="text-2xl font-bold">{experienceComparison?.tournaments.comparisonUserValue}</div>
                        </div>
                        <div className="flex justify-center">
                          <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                            experienceComparison?.tournaments.currentUserIsHigher 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                              : experienceComparison?.tournaments.equal 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                          }`}>
                            {experienceComparison?.tournaments.currentUserIsHigher 
                              ? `+${experienceComparison.tournaments.difference} tournaments` 
                              : experienceComparison?.tournaments.equal 
                                ? 'Equal tournaments'
                                : `${Math.abs(experienceComparison?.tournaments.difference || 0)} tournaments less`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="space-y-4 pt-4">
                    <div className="p-4 rounded-lg border space-y-2">
                      <div className="text-sm font-medium">Win Rate</div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{(winRateComparison?.currentUserValue || 0).toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">vs</div>
                        <div className="text-2xl font-bold">{(winRateComparison?.comparisonUserValue || 0).toFixed(1)}%</div>
                      </div>
                      <div className="flex justify-center">
                        <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                          winRateComparison?.currentUserIsHigher 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                            : winRateComparison?.equal 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                        }`}>
                          {winRateComparison?.currentUserIsHigher 
                            ? `+${winRateComparison.difference.toFixed(1)}% higher win rate` 
                            : winRateComparison?.equal 
                              ? 'Equal win rates'
                              : `${Math.abs(winRateComparison?.difference || 0).toFixed(1)}% lower win rate`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Placeholder for additional stats comparisons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border space-y-2 opacity-70">
                        <div className="text-sm font-medium">Points Per Game</div>
                        <div className="text-center text-muted-foreground py-4">
                          Detailed statistics coming soon
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border space-y-2 opacity-70">
                        <div className="text-sm font-medium">Average Match Duration</div>
                        <div className="text-center text-muted-foreground py-4">
                          Detailed statistics coming soon
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Failed to load comparison data. Please try again.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <div>Last updated: {new Date().toLocaleDateString()}</div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Comparisons are based on current player data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}