/**
 * PKL-278651-PROF-0009.5-SECT - Profile History Section
 * 
 * This component displays user match and tournament history with
 * virtualized rendering for performance optimization.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FixedSizeList } from "react-window";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Trophy, Users, UserCheck } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";
import { formatDistanceToNow } from "date-fns";

interface ProfileHistorySectionProps {
  user: EnhancedUser;
}

export function ProfileHistorySection({ user }: ProfileHistorySectionProps) {
  const [historyType, setHistoryType] = useState<"matches" | "tournaments">("matches");
  
  // Query for match history with pagination
  const {
    data: matchHistory,
    isLoading: matchesLoading,
    fetchNextPage: fetchNextMatches,
    hasNextPage: hasMoreMatches,
    isFetchingNextPage: loadingMoreMatches,
  } = useQuery({
    queryKey: ["/api/match/history", { userId: user.id }],
    staleTime: 60000, // 1 minute
  });
  
  // Query for tournament history with pagination
  const {
    data: tournamentHistory,
    isLoading: tournamentsLoading,
    fetchNextPage: fetchNextTournaments,
    hasNextPage: hasMoreTournaments,
    isFetchingNextPage: loadingMoreTournaments,
  } = useQuery({
    queryKey: ["/api/tournament/history", { userId: user.id }],
    staleTime: 60000, // 1 minute
    enabled: historyType === "tournaments", // Only load when tab is active
  });
  
  // Flatten paginated results for virtualization
  const flattenedMatches = useMemo(() => {
    if (!matchHistory?.pages) return [];
    return matchHistory.pages.flatMap(page => page.items || []);
  }, [matchHistory]);
  
  const flattenedTournaments = useMemo(() => {
    if (!tournamentHistory?.pages) return [];
    return tournamentHistory.pages.flatMap(page => page.items || []);
  }, [tournamentHistory]);
  
  // Handle infinite scrolling
  const handleLoadMore = useCallback(() => {
    if (historyType === "matches" && hasMoreMatches && !loadingMoreMatches) {
      fetchNextMatches();
    } else if (historyType === "tournaments" && hasMoreTournaments && !loadingMoreTournaments) {
      fetchNextTournaments();
    }
  }, [
    historyType, 
    hasMoreMatches, 
    hasMoreTournaments, 
    loadingMoreMatches, 
    loadingMoreTournaments,
    fetchNextMatches,
    fetchNextTournaments
  ]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>Your matches and tournaments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={historyType} 
          onValueChange={(value) => setHistoryType(value as "matches" | "tournaments")}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="matches">
              <Users className="h-4 w-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="tournaments">
              <Trophy className="h-4 w-4 mr-2" />
              Tournaments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="space-y-4">
            {matchesLoading ? (
              <MatchesSkeleton />
            ) : flattenedMatches.length === 0 ? (
              <EmptyState 
                title="No matches found" 
                description="You haven't played any recorded matches yet."
              />
            ) : (
              <div className="h-[500px] w-full">
                <FixedSizeList
                  height={500}
                  width="100%"
                  itemCount={flattenedMatches.length}
                  itemSize={100}
                  overscanCount={5}
                  onItemsRendered={({ visibleStopIndex }) => {
                    if (visibleStopIndex >= flattenedMatches.length - 5) {
                      handleLoadMore();
                    }
                  }}
                >
                  {({ index, style }) => (
                    <div style={style} className="py-2 px-1">
                      <MatchItem match={flattenedMatches[index]} />
                    </div>
                  )}
                </FixedSizeList>
              </div>
            )}
            
            {hasMoreMatches && (
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchNextMatches()}
                  disabled={loadingMoreMatches}
                >
                  {loadingMoreMatches ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tournaments" className="space-y-4">
            {tournamentsLoading ? (
              <TournamentsSkeleton />
            ) : flattenedTournaments.length === 0 ? (
              <EmptyState 
                title="No tournaments found" 
                description="You haven't participated in any tournaments yet."
              />
            ) : (
              <div className="h-[500px] w-full">
                <FixedSizeList
                  height={500}
                  width="100%"
                  itemCount={flattenedTournaments.length}
                  itemSize={120}
                  overscanCount={5}
                  onItemsRendered={({ visibleStopIndex }) => {
                    if (visibleStopIndex >= flattenedTournaments.length - 5) {
                      handleLoadMore();
                    }
                  }}
                >
                  {({ index, style }) => (
                    <div style={style} className="py-2 px-1">
                      <TournamentItem tournament={flattenedTournaments[index]} />
                    </div>
                  )}
                </FixedSizeList>
              </div>
            )}
            
            {hasMoreTournaments && (
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchNextTournaments()}
                  disabled={loadingMoreTournaments}
                >
                  {loadingMoreTournaments ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface MatchItemProps {
  match: any;
}

function MatchItem({ match }: MatchItemProps) {
  // Format the match date
  const formattedDate = match?.date 
    ? formatDistanceToNow(new Date(match.date), { addSuffix: true })
    : "Unknown date";
  
  return (
    <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center">
            <Badge variant={match?.result === "win" ? "success" : "destructive"} className="mr-2">
              {match?.result === "win" ? "Win" : "Loss"}
            </Badge>
            <span className="font-medium">{match?.format || "Singles"}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {match?.location || "Unknown location"}
          </div>
          <div className="flex items-center mt-2 text-sm">
            <UserCheck className="h-3 w-3 mr-1" />
            <span>vs. {match?.opponent || "Unknown opponent"}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm">{formattedDate}</div>
          <div className="font-medium mt-1">
            {match?.score || "No score recorded"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {match?.pointsEarned ? `+${match.pointsEarned} pts` : ""}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

interface TournamentItemProps {
  tournament: any;
}

function TournamentItem({ tournament }: TournamentItemProps) {
  // Format the tournament date
  const formattedDate = tournament?.date 
    ? formatDistanceToNow(new Date(tournament.date), { addSuffix: true })
    : "Unknown date";
  
  return (
    <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="font-medium">{tournament?.name || "Unnamed Tournament"}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {tournament?.location || "Unknown location"}
          </div>
          <div className="flex flex-col mt-2">
            <div className="flex items-center text-sm">
              <Trophy className="h-3 w-3 mr-1" />
              <span>
                Placed: {tournament?.placement ? `${tournament.placement}${getOrdinalSuffix(tournament.placement)}` : "Unknown"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Division: {tournament?.division || "Unknown division"}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm">{formattedDate}</div>
          <div className="font-medium mt-1">
            {tournament?.matches ? `${tournament.matches} Matches` : ""}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {tournament?.pointsEarned ? `+${tournament.pointsEarned} pts` : ""}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return "st";
  }
  if (j === 2 && k !== 12) {
    return "nd";
  }
  if (j === 3 && k !== 13) {
    return "rd";
  }
  return "th";
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <Button variant="outline" size="sm">
        Record New Match
      </Button>
    </div>
  );
}

function MatchesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center">
                <Skeleton className="h-5 w-12 mr-2" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-32 mt-1" />
              <Skeleton className="h-4 w-40 mt-2" />
            </div>
            <div className="flex flex-col items-end">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 mt-1" />
              <Skeleton className="h-4 w-12 mt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TournamentsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32 mt-1" />
              <div className="flex flex-col mt-2">
                <Skeleton className="h-4 w-24 mt-1" />
                <Skeleton className="h-4 w-36 mt-1" />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-20 mt-1" />
              <Skeleton className="h-4 w-12 mt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}