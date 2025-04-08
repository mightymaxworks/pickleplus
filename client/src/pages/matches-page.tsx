import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ChevronRight, Plus, Clock, Trophy, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getRecentMatches } from "@/lib/sdk/matchSDK";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function MatchesPage() {
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
    <DashboardLayout>
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
            <Link href="/record-match">
              <Plus className="h-4 w-4 mr-1" />
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
                                  {match.date ? format(parseISO(match.date), 'MMM d, yyyy') : 'Unknown date'}
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
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-center">
                        The complete match history is not yet implemented in this version.
                      </p>
                    </div>
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
                      Visualize your performance and progress over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-center">
                        Match statistics are not yet implemented in this version.
                      </p>
                    </div>
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