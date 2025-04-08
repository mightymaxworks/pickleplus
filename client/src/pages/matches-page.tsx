import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Plus, Clock, Trophy, ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import MainLayout from "@/components/layout/MainLayout";
import { getRecentMatches } from "@/lib/sdk/matchSDK";
import { useAuthContext } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function MatchesPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("recent");
  
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
    <MainLayout>
      <div className="container max-w-5xl py-4 px-4 md:py-8 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Match Center</h1>
          <Button asChild size="sm">
            <Link href="/record-match">
              <Plus className="h-4 w-4 mr-1" />
              Record Match
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="recent">Recent Matches</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-6">
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
                  <div className="divide-y">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="flex items-start p-4 hover:bg-muted/50">
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center mb-2 gap-1 md:gap-3">
                            <div className="font-medium">
                              {match.matchType === 'tournament' ? 'Tournament Match' : 'Casual Match'}
                            </div>
                            <span className="hidden md:inline text-muted-foreground">•</span>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {match.matchDate ? format(parseISO(match.matchDate), 'MMM d, yyyy') : 'Unknown date'}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            {/* Score display */}
                            <div className="flex items-center">
                              <div className="flex flex-col items-center bg-primary/10 rounded-l-md px-3 py-2">
                                <span className="text-xs font-medium">You</span>
                                <span className="text-2xl font-bold text-primary">
                                  {match.players.find(p => p.userId === user?.id)?.score || '?'}
                                </span>
                              </div>
                              <div className="flex flex-col items-center bg-muted rounded-r-md px-3 py-2">
                                <span className="text-xs font-medium">Opponent</span>
                                <span className="text-2xl font-bold">
                                  {match.players.find(p => p.userId !== user?.id)?.score || '?'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Win/Loss indicator */}
                            {match.players.find(p => p.userId === user?.id)?.isWinner ? (
                              <Badge variant="success" className="ml-2">Win</Badge>
                            ) : (
                              <Badge variant="secondary" className="ml-2">Loss</Badge>
                            )}
                          </div>
                          
                          {/* Players */}
                          <div className="flex flex-wrap gap-2 text-sm">
                            <div className="text-muted-foreground">Played against:</div>
                            <div className="font-medium">
                              {match.playerNames && Object.values(match.playerNames)
                                .filter(p => p.username !== user?.username)
                                .map(p => p.displayName || p.username)
                                .join(', ') || 'Unknown opponent'}
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="icon" className="ml-auto">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
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
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Match History</CardTitle>
                <CardDescription>
                  View your complete match history with advanced filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  The complete match history is not yet implemented in this version.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Match Statistics</CardTitle>
                <CardDescription>
                  Visualize your performance and progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Match statistics are not yet implemented in this version.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default MatchesPage;