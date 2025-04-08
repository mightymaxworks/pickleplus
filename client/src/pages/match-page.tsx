import { useState, useEffect } from "react";
import { QuickMatchRecorder } from "@/components/match/QuickMatchRecorder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertTriangle, Calendar, TrophyIcon, CheckCircle2, BarChart4, PlusCircle, Loader2, AlertCircle, Award, ThumbsUp, Zap as ZapIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { matchSDK, type RecordedMatch } from "@/lib/sdk/matchSDK";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import DailyMatchLimits from "@/components/match/DailyMatchLimits";
import MatchValidation from "@/components/match/MatchValidation";
import { Badge } from "@/components/ui/badge";

export default function MatchPage() {
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
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Center</h1>
          <p className="text-muted-foreground">Track your performance and match history</p>
        </div>
        
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => setMatchDialogOpen(true)}
        >
          <PlusCircle className="h-5 w-5" />
          Record Match
        </Button>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
          <TabsTrigger value="validations">Pending Validations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Matches */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {statsLoading ? "..." : matchStats?.totalMatches || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Matches Won */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Matches Won
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrophyIcon className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {statsLoading ? "..." : matchStats?.matchesWon || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Win Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {statsLoading ? "..." : `${matchStats?.winRate || 0}%`}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Daily Match Limits */}
            <DailyMatchLimits />
          </div>

          {/* Recent Matches Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Matches</h2>
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
            ) : recentMatches && recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.slice(0, 5).map((match: RecordedMatch) => {
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
                
                {recentMatches.length > 5 && (
                  <Card className="p-4 border-dashed text-center bg-muted/30">
                    <p className="text-muted-foreground">
                      See all {recentMatches.length} matches in the history tab
                    </p>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <CardTitle className="mb-2">No Matches Yet</CardTitle>
                <CardDescription>
                  Record your first match to see your history here.
                </CardDescription>
                <CardFooter className="pt-6 pb-2 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setMatchDialogOpen(true)}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Record Match
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6 space-y-8">
          {/* Comprehensive Match History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">All Matches</h2>
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
            ) : recentMatches && recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match: RecordedMatch) => {
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
                            {match.notes && (
                              <div className="mt-2 text-sm border-t pt-2">
                                <span className="text-muted-foreground">Notes: </span> 
                                {match.notes}
                              </div>
                            )}
                            
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
                <CardTitle className="mb-2">No Match History</CardTitle>
                <CardDescription>
                  Your match history will appear here once you start recording matches.
                </CardDescription>
                <CardFooter className="pt-6 pb-2 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setMatchDialogOpen(true)}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Record Match
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
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
                    const validationStatus = match.validationStatus || 'pending';
                    
                    return (
                      <Card key={match.id} className={`border-l-4 ${isWinner ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div className="flex-1">
                              <div className="font-medium flex items-center">
                                {isWinner ? 'Victory against ' : 'Loss to '} {opponent}
                                <Badge variant={validationStatus === 'disputed' ? 'destructive' : 'outline'} className="ml-2">
                                  {validationStatus === 'disputed' ? 'Disputed' : 'Pending Validation'}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {match.formatType === 'singles' ? 'Singles' : 'Doubles'} • {formatDate(match.date)}
                              </div>
                              
                              <Card className="mt-3 border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">This match requires validation to earn full XP and rating points.</span>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <div className="mt-3">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="default" size="sm">
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
                            <div className="text-lg font-semibold mt-2 md:mt-0 flex flex-col items-end">
                              <div>{match.players[0].score} - {match.players[1].score}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {match.validationStatus === 'disputed' 
                                  ? 'Match disputed' 
                                  : 'Awaiting validation'}
                              </div>
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
              </Card>
            )}
          </div>
          
          {/* Match Validation Information */}
          <Card>
            <CardHeader>
              <CardTitle>How VALMAT™ Works</CardTitle>
              <CardDescription>
                The VALMAT™ (Match Validation System) helps ensure fair play and accurately track progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Match Validation</h3>
                  <p className="text-sm text-muted-foreground">
                    All participants must validate matches to confirm the results were recorded correctly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ThumbsUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Feedback Collection</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide feedback on match enjoyment and skill level matching to help improve the CourtIQ™ system.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ZapIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Daily Match Limits</h3>
                  <p className="text-sm text-muted-foreground">
                    Points awarded decrease after certain match counts to prevent system abuse and encourage rest.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Match Recording Dialog */}
      {/* Main Record Match Dialog */}
      <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Match Results</DialogTitle>
          </DialogHeader>
          <QuickMatchRecorder onSuccess={handleMatchRecorded} />
        </DialogContent>
      </Dialog>
    </div>
  );
}