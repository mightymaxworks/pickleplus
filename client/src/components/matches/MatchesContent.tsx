/**
 * @component MatchesContent
 * @layer UI
 * @module Match
 * @version 1.0.0
 * @lastModified 2025-04-21
 * 
 * @description
 * Content component for the Match Center feature.
 * Extracted from MatchesPage to fix double header issue.
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Plus, Clock, Trophy, AlertCircle, AlertTriangle, CheckCircle, Users, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getRecentMatches, RecordedMatch } from "@/lib/sdk/matchSDK";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import MatchHistoryTab from "@/components/match/MatchHistoryTab";
import MatchStatsTab from "@/components/match/MatchStatsTab";

/**
 * Helper function to get opponent ID based on user ID and match data
 */
function getOpponentId(match: RecordedMatch, currentUserId: number | undefined): number | undefined {
  if (!currentUserId) return undefined;
  
  // If match has the players array, use that
  if (match.players?.length === 2) {
    const opponent = match.players.find(p => p.userId !== currentUserId);
    return opponent?.userId;
  }
  
  // Otherwise, use the database fields
  if (match.playerOneId === currentUserId) {
    return match.playerTwoId;
  } else if (match.playerTwoId === currentUserId) {
    return match.playerOneId;
  }
  
  return undefined;
}

/**
 * Helper function to get opponent display name
 */
function getOpponentName(match: RecordedMatch, currentUserId: number | undefined): string {
  if (!currentUserId) return "Unknown Opponent";
  
  // Try to get from playerNames object
  if (match.playerNames) {
    const opponentId = getOpponentId(match, currentUserId);
    if (opponentId && match.playerNames[opponentId]) {
      return match.playerNames[opponentId].displayName || match.playerNames[opponentId].username;
    }
    
    // Fallback to filtering by username if we have user data
    const opponent = Object.values(match.playerNames)
      .filter(p => p.username !== "mightymax") // Default username
      .map(p => p.displayName || p.username)[0];
      
    if (opponent) return opponent;
  }
  
  // Default display based on opponent ID
  const opponentId = getOpponentId(match, currentUserId);
  return opponentId ? `Player ${opponentId}` : "Unknown Opponent";
}

/**
 * Helper function to get opponent username
 */
function getOpponentUsername(match: RecordedMatch, currentUserId: number | undefined): string {
  if (!currentUserId) return "unknown_player";
  
  // Try to get from playerNames object
  if (match.playerNames) {
    const opponentId = getOpponentId(match, currentUserId);
    if (opponentId && match.playerNames[opponentId]) {
      return match.playerNames[opponentId].username;
    }
    
    // Fallback to filtering by username if we have user data
    const opponent = Object.values(match.playerNames)
      .filter(p => p.username !== "mightymax") // Default username
      .map(p => p.username)[0];
      
    if (opponent) return opponent;
  }
  
  // Default display based on opponent ID
  const opponentId = getOpponentId(match, currentUserId);
  return opponentId ? `player${opponentId}` : "unknown_player";
}

/**
 * Helper function to get opponent avatar initials
 */
function getOpponentAvatarInitials(match: RecordedMatch, currentUserId: number | undefined): string {
  if (!currentUserId) return "??";
  
  // Try to get from playerNames object
  if (match.playerNames) {
    const opponentId = getOpponentId(match, currentUserId);
    if (opponentId && match.playerNames[opponentId]) {
      if (match.playerNames[opponentId].avatarInitials) {
        return match.playerNames[opponentId].avatarInitials;
      }
      
      // Generate from display name or username
      const name = match.playerNames[opponentId].displayName || match.playerNames[opponentId].username;
      if (name) {
        if (name.includes(' ')) {
          return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        }
        return name.substring(0, 2).toUpperCase();
      }
    }
    
    // Fallback to filtering by username if we have user data
    const opponent = Object.values(match.playerNames)
      .filter(p => p.username !== "mightymax") // Default username
      .map(p => p.avatarInitials || p.displayName?.charAt(0) || p.username.charAt(0))[0];
      
    if (opponent) return opponent.toUpperCase();
  }
  
  // Default display based on opponent ID
  const opponentId = getOpponentId(match, currentUserId);
  return opponentId ? `P${opponentId}` : "??";
}

export default function MatchesContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("recent");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Animate elements in sequence after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch recent matches
  const { data: recentMatches, isLoading } = useQuery({
    queryKey: ["/api/match/recent"],
    queryFn: async () => {
      const matches = await getRecentMatches();
      console.log("Fetched recent matches:", matches);
      return matches || [];
    }
  });
  
  return (
    <div className="container max-w-5xl py-4 px-4 md:py-8 md:px-0">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute top-0 -right-40 w-80 h-80 bg-[#FF5722]/5 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ filter: 'blur(100px)' }}
        />
        <motion.div 
          className="absolute -top-20 -left-20 w-80 h-80 bg-[#2196F3]/5 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ filter: 'blur(100px)' }}
        />
      </div>
    
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Match Center</h1>
        <Button asChild size="sm" className="bg-gradient-to-r from-[#FF5722] to-[#FF8A65] hover:from-[#FF5722] hover:to-[#FF7043]">
          <Link href="/record-match" className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-1 md:inline-block hidden" />
            Record Match
          </Link>
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-gradient-to-r from-background/80 to-background border">
            <TabsTrigger value="recent">Recent Matches</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
        
          <TabsContent value="recent" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isLoaded && activeTab === 'recent' ? 1 : 0, y: isLoaded && activeTab === 'recent' ? 0 : 10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Recent Matches</CardTitle>
                  <CardDescription>
                    Your most recently recorded matches
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    // Loading state
                    <div className="space-y-4 p-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-28" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentMatches && recentMatches.length > 0 ? (
                    // Match list
                    <div className="space-y-4 p-4">
                      {recentMatches.map((match) => (
                        <div key={match.id} className="p-6 hover:bg-muted/50 transition-colors rounded-md bg-background shadow-sm border">
                          <div className="flex-1">
                            {/* Match header with match type badges and date */}
                            <div className="flex gap-2 mb-3">
                              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                                {match.matchType === 'tournament' ? 'Tournament' : 'Casual'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {match.formatType === 'singles' ? 'Singles' : 'Doubles'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                              <Clock className="h-3 w-3" />
                              {match.matchDate ? format(parseISO(match.matchDate), 'MMM d, yyyy') : 
                               match.date ? format(parseISO(match.date), 'MMM d, yyyy') : 
                               match.createdAt ? format(parseISO(match.createdAt), 'MMM d, yyyy') : 'Unknown date'}
                            </div>
                            
                            {/* Players section with avatars */}
                            <div className="flex mb-6 gap-2 justify-between">
                              {/* Your side */}
                              <div className="flex flex-col items-center">
                                <div className="h-14 w-14 rounded-full bg-primary/10 mb-2 flex items-center justify-center text-primary font-bold text-lg">
                                  {user?.id && match.playerNames && match.playerNames[user.id] 
                                    ? match.playerNames[user.id].avatarInitials || user.displayName?.charAt(0) || "YP"
                                    : "YP"}
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">
                                    {user?.displayName || 'You'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    @{user?.username || 'you'}
                                  </div>
                                </div>
                              </div>
                              
                              {/* VS indicator */}
                              <div className="flex items-center">
                                <span className="text-base text-muted-foreground font-medium">VS</span>
                              </div>
                              
                              {/* Opponent side */}
                              <div className="flex flex-col items-center">
                                <div className="h-14 w-14 rounded-full bg-muted mb-2 flex items-center justify-center font-bold text-lg">
                                  {getOpponentAvatarInitials(match, user?.id)}
                                </div>
                                <div className="text-center">
                                  <div className="font-medium">
                                    {getOpponentName(match, user?.id)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    @{getOpponentUsername(match, user?.id)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Score display with Win badge */}
                            <div className="flex flex-col items-center mb-4">
                              <div className="w-44 flex mb-2">
                                <div className="flex-1 bg-primary/10 rounded-l-md py-3 flex justify-center">
                                  <span className="text-3xl font-bold text-primary">
                                    {/* Handle both data formats: players array or direct scorePlayerOne */}
                                    {match.players?.find(p => p.userId === user?.id)?.score || 
                                     (user?.id === match.playerOneId ? match.scorePlayerOne : match.scorePlayerTwo) || 
                                     '11'}
                                  </span>
                                </div>
                                <div className="flex-1 bg-muted rounded-r-md py-3 flex justify-center">
                                  <span className="text-3xl font-bold">
                                    {/* Handle both data formats: players array or direct scorePlayerTwo */}
                                    {match.players?.find(p => p.userId !== user?.id)?.score || 
                                     (user?.id === match.playerOneId ? match.scorePlayerTwo : match.scorePlayerOne) || 
                                     '4'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Win/Loss indicator */}
                              {(match.players?.find(p => p.userId === user?.id)?.isWinner || 
                                (user?.id === match.winnerId)) ? (
                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 px-4">
                                  Win
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800/40 px-4">
                                  Loss
                                </Badge>
                              )}
                            </div>
                            
                            {/* Details about the match */}
                            {/* PKL-278651-HIST-0002-UI-01: Match Rewards Display */}
                            <div className="flex flex-col gap-2 mt-1">
                              {/* CourtIQ gained */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-4 w-4 text-amber-500" />
                                  <span className="text-muted-foreground">CourtIQ Rating</span>
                                </div>
                                <div className="flex items-center">
                                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${(match.pointsAwarded || 0) > 0 ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'}`}>
                                    {(match.pointsAwarded || 0) > 0 ? '+' : ''}{match.pointsAwarded || '0'} pts
                                  </div>
                                </div>
                              </div>
                              
                              {/* Points/XP gained */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-purple-500" />
                                  <span className="text-muted-foreground">XP Earned</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-medium">
                                    +{match.xpAwarded || match.pointsAwarded || 25} XP
                                  </div>
                                </div>
                              </div>
                              
                              {/* PKL-278651-HIST-0002-UI-02: Match Validation Status */}
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-muted-foreground">Match Status</span>
                                </div>
                                <div className="flex items-center">
                                  {match.isVerified || match.validationStatus === 'validated' ? (
                                    <div className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      Verified
                                    </div>
                                  ) : (
                                    <div className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Pending
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Empty state
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No matches recorded yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start recording your pickleball matches to see them here.</p>
                      <Button asChild>
                        <Link href="/record-match">
                          <Plus className="h-4 w-4 mr-1" />
                          Record Your First Match
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="history">
            <MatchHistoryTab />
          </TabsContent>
          
          <TabsContent value="stats">
            <MatchStatsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}