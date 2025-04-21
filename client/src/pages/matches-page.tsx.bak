import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Plus, Clock, Trophy, AlertCircle, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getRecentMatches, RecordedMatch } from "@/lib/sdk/matchSDK";
import { useAuth } from "@/hooks/useAuth";
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

export function MatchesPage() {
  return (
    <div className="w-full">
      <MatchesContent />
    </div>
  );
}
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
                                <div className="flex gap-x-3 gap-y-1 text-xs text-muted-foreground justify-center">
                                  <div className="flex items-center gap-1">
                                    <Trophy className="h-3 w-3" />
                                    <span>{match.formatType === 'singles' ? 'Singles' : 'Doubles'} Match</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {match.validationStatus === 'validated' ? (
                                      <>
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>Validated</span>
                                      </>
                                    ) : match.validationStatus === 'disputed' ? (
                                      <>
                                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                                        <span>Disputed</span>
                                      </>
                                    ) : match.validationStatus === 'confirmed' ? (
                                      <>
                                        <CheckCircle className="h-3 w-3 text-blue-500" />
                                        <span>Confirmed</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-3 w-3 text-amber-500" />
                                        <span>Pending</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                {/* PKL-278651-HIST-0002-UI-01-A: XP and Ranking Rewards Section */}
                                {(match.xpAwarded || match.pointsAwarded || (match.rewards && user?.id && match.rewards[user.id])) && (
                                  <div className="border-t border-dashed border-muted pt-2 mt-1">
                                    <div className="flex gap-x-4 justify-center text-xs">
                                      {/* XP rewards */}
                                      {(match.xpAwarded || (match.rewards && user?.id && match.rewards[user.id]?.xp)) && (
                                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                          <span className="font-medium">+{match.rewards?.[user?.id || 0]?.xp?.amount || match.xpAwarded || 0} XP</span>
                                        </div>
                                      )}
                                      
                                      {/* Ranking rewards */}
                                      {(match.pointsAwarded || (match.rewards && user?.id && match.rewards[user.id]?.ranking)) && (
                                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                          <span className="font-medium">+{match.rewards?.[user?.id || 0]?.ranking?.points || match.pointsAwarded || 0} CP</span>
                                          {match.rewards?.[user?.id || 0]?.ranking?.tierChanged && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 h-4 px-1 text-[10px]">
                                              Tier Up!
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Empty state
                      <div className="p-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Trophy className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No matches recorded yet</h3>
                        <p className="text-muted-foreground mt-1 mb-4">
                          Start recording your matches to track your progress
                        </p>
                        <Button asChild>
                          <Link href="/record-match">
                            <Plus className="h-4 w-4 mr-1" />
                            Record First Match
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="history">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isLoaded && activeTab === 'history' ? 1 : 0, y: isLoaded && activeTab === 'history' ? 0 : 10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Match History</CardTitle>
                    <CardDescription>
                      View your complete match history with advanced filters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MatchHistoryTab />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="stats">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isLoaded && activeTab === 'stats' ? 1 : 0, y: isLoaded && activeTab === 'stats' ? 0 : 10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Match Statistics</CardTitle>
                    <CardDescription>
                      Visualize your performance and progress over time with comprehensive statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MatchStatsTab />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default MatchesPage;