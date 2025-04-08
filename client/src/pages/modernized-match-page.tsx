import { useState, useEffect } from "react";
import { QuickMatchRecorder } from "@/components/match/QuickMatchRecorder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { matchSDK, type RecordedMatch } from "@/lib/sdk/matchSDK";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import MatchDashboard from "@/components/match/MatchDashboard";
import MatchValidation from "@/components/match/MatchValidation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, CheckCircle2, Trophy } from "lucide-react";

/**
 * ModernizedMatchPage Component
 * 
 * A modern, futuristic redesign of the Match Center page using the enhanced UI components.
 * Implements MATCH-UI-278651[ENHANCE] from the Pickle+ Development Framework 2.0.
 */
export default function ModernizedMatchPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [location] = useLocation();
  
  // Check for query parameter to open dialog automatically
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('dialog') === 'open') {
      setMatchDialogOpen(true);
      
      // Remove the query parameter from URL without triggering a reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);
  
  // Fetch match stats
  const { data: matchStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/match/stats"],
    queryFn: async () => {
      try {
        return await matchSDK.getMatchStats();
      } catch (error) {
        console.error("Error fetching match stats:", error);
        return {
          totalMatches: 0,
          matchesWon: 0,
          winRate: 0,
          matchesLost: 0,
          singlesMatches: 0,
          doublesMatches: 0
        };
      }
    },
    enabled: !!user,
  });
  
  // Fetch recent matches
  const { data: recentMatches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery({
    queryKey: ["/api/match/recent"],
    queryFn: async () => {
      try {
        return await matchSDK.getRecentMatches(undefined, 10);
      } catch (error) {
        console.error("Error fetching recent matches:", error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Handle match recorded successfully
  const handleMatchRecorded = () => {
    // Close dialog
    setMatchDialogOpen(false);
    
    // Show success message
    toast({
      title: "Match recorded successfully!",
      description: "Your match has been recorded and your stats have been updated.",
    });
    
    // Refresh match data
    refetchStats();
    refetchMatches();
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get opposing player name
  const getOpponentName = (match: any, currentUserId: number) => {
    const opponent = match.players.find((p: any) => p.userId !== currentUserId);
    if (!opponent?.userId || !match.playerNames) return "Opponent";
    return match.playerNames[opponent.userId]?.displayName || match.playerNames[opponent.userId]?.username || "Opponent";
  };

  return (
    <div className="container max-w-7xl py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Center</h1>
          <p className="text-muted-foreground">Track your performance and match history</p>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
          <TabsTrigger value="validations">Validations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {/* Show match dashboard */}
          <MatchDashboard 
            matches={recentMatches || []}
            matchStats={matchStats || {
              totalMatches: 0,
              matchesWon: 0,
              winRate: 0,
              singlesMatches: 0,
              doublesMatches: 0
            }}
            isLoading={statsLoading || matchesLoading}
            onRecordMatch={() => setMatchDialogOpen(true)}
            onRefreshData={() => {
              refetchStats();
              refetchMatches();
            }}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          {/* Comprehensive Match History with Enhanced UI */}
          <MatchDashboard 
            matches={recentMatches || []}
            matchStats={matchStats || {
              totalMatches: 0,
              matchesWon: 0,
              winRate: 0,
              singlesMatches: 0,
              doublesMatches: 0
            }}
            isLoading={statsLoading || matchesLoading}
            onRecordMatch={() => setMatchDialogOpen(true)}
            onRefreshData={() => {
              refetchStats();
              refetchMatches();
            }}
          />
        </TabsContent>
        
        <TabsContent value="validations" className="mt-6 space-y-8">
          {/* Pending Validations */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pending Match Validations</h2>
              <Button variant="outline" size="sm" onClick={() => refetchMatches()}>
                Refresh
              </Button>
            </div>
            
            {matchesLoading ? (
              <Card className="p-8 text-center">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              </Card>
            ) : recentMatches && recentMatches.filter(m => m.validationStatus !== 'confirmed').length > 0 ? (
              <div className="space-y-4">
                {recentMatches
                  .filter(m => m.validationStatus !== 'confirmed')
                  .map((match: RecordedMatch) => {
                    const userPlayer = match.players.find((p) => p.userId === user?.id);
                    const isWinner = userPlayer?.isWinner;
                    const opponent = getOpponentName(match, user?.id || 0);
                    
                    return (
                      <Card key={match.id} className={`border-l-4 ${isWinner ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div className="flex-1">
                              <div className="font-medium flex items-center">
                                {isWinner ? 'Victory against ' : 'Loss to '} {opponent}
                                {match.validationStatus ? (
                                  <Badge variant={match.validationStatus === 'disputed' ? 'destructive' : match.validationStatus === 'confirmed' ? 'default' : 'outline'} className="ml-2">
                                    {match.validationStatus === 'disputed' ? 'Disputed' : match.validationStatus === 'confirmed' ? 'Confirmed' : 'Pending Validation'}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="ml-2">
                                    Pending Validation
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {match.formatType === 'singles' ? 'Singles' : 'Doubles'} • {formatDate(match.date)}
                              </div>
                              
                              <div className="mt-3">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <CheckCircle2 className="h-4 w-4 mr-1" />
                                      Validate Match
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Validate Match</DialogTitle>
                                    </DialogHeader>
                                    <MatchValidation 
                                      match={match} 
                                      onValidationComplete={() => {
                                        refetchMatches();
                                      }} 
                                    />
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                            <div className="text-lg font-semibold mt-2 md:mt-0">
                              {match.players[0].score} - {match.players[1].score}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <CardTitle className="mb-2">No Pending Validations</CardTitle>
                <CardDescription>
                  All your matches have been validated. Great job!
                </CardDescription>
                <CardFooter className="pt-6 pb-2 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setMatchDialogOpen(true)}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Record New Match
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Match Recording Dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Match</DialogTitle>
          </DialogHeader>
          <QuickMatchRecorder onSuccess={handleMatchRecorded} />
        </DialogContent>
      </Dialog>
    </div>
  );
}