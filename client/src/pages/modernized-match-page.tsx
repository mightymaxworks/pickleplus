import { useState, useEffect } from "react";
import { QuickMatchRecorder } from "@/components/match/QuickMatchRecorder";
import { QuickValidationButton } from "@/components/match/QuickValidationButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { matchSDK, type RecordedMatch } from "@/lib/sdk/matchSDK";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import MatchDashboard from "@/components/match/MatchDashboard";
import MatchTimeline from "@/components/match/MatchTimeline";
import MatchTrends from "@/components/match/MatchTrends";
import ContextualFilters from "@/components/match/ContextualFilters";
import MatchValidation from "@/components/match/MatchValidation";
import MatchHistoryTab from "@/components/match/MatchHistoryTab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TiltCard } from "@/components/ui/tilt-card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  Loader2, 
  PlusCircle, 
  CheckCircle2, 
  Trophy,
  Calendar,
  Users,
  Activity,
  BarChart4,
  Zap,
  Filter,
  XCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle
} from "lucide-react";

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
    const opponent = match.players?.find((p: any) => p.userId !== currentUserId);
    if (!opponent?.userId || !match.playerNames) return "Opponent";
    return match.playerNames[opponent.userId]?.displayName || match.playerNames[opponent.userId]?.username || "Opponent";
  };

  return (
    <DashboardLayout>
      {/* PKL-278651-UIFIX-0001-NAV - Adding DashboardLayout for consistent navigation */}
      <div className="container max-w-6xl py-6 md:py-10 space-y-10">
        {/* MATCH-UI-278653[ENHANCE] - Improved header styling and alignment */}
        <div className="flex flex-col justify-center items-center text-center mb-4 md:mb-6">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">Match Center</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Track your performance, analyze your stats, and review your match history</p>
          <div className="w-24 h-1 bg-primary/60 rounded-full mt-5 mb-2"></div>
        </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-auto mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
          <TabsTrigger value="validations">Validations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-8">
          {/* MATCH-UI-278653[ENHANCE] - Enhanced Overview Dashboard focused on stats & insights */}
          <div className="space-y-8 mx-auto max-w-5xl">
            {/* Performance Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TiltCard 
                className="border-2 border-primary/20 p-3 overflow-visible bg-gradient-to-br from-background to-muted shadow-md" 
                tiltAmount={8}
                glowOnHover={true}
                glowAlways={true}
                hoverScale={1.03}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-muted-foreground font-medium">
                      <Trophy className="h-5 w-5 mr-2 text-primary" />
                      <span>Matches Won</span>
                    </div>
                    <Badge variant="outline" className="font-bold">Lifetime</Badge>
                  </div>
                  <div className="text-4xl font-bold text-primary">{matchStats?.matchesWon || 0}</div>
                  <div className="w-full h-2 bg-primary/10 rounded-full mt-3">
                    <div 
                      className="h-full bg-primary rounded-full shadow-sm" 
                      style={{ width: `${matchStats?.winRate || 0}%` }}
                    ></div>
                  </div>
                </CardContent>
              </TiltCard>
              
              <TiltCard 
                className="border-2 border-green-500/20 p-3 bg-gradient-to-br from-background to-muted shadow-md" 
                tiltAmount={8}
                glowOnHover={true}
                glowAlways={true}
                hoverScale={1.03}
                glowColor="rgba(132, 204, 22, 0.4)"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-muted-foreground font-medium">
                      <BarChart4 className="h-5 w-5 mr-2 text-green-500" />
                      <span>Win Rate</span>
                    </div>
                    <Badge variant="outline" className="font-bold text-green-500 border-green-500/50">Performance</Badge>
                  </div>
                  <div className="text-4xl font-bold text-green-500">{matchStats?.winRate || 0}%</div>
                  <div className="w-full h-2 bg-primary/10 rounded-full mt-3">
                    <div 
                      className="h-full bg-green-500 rounded-full shadow-sm" 
                      style={{ width: `${matchStats?.winRate || 0}%` }}
                    ></div>
                  </div>
                </CardContent>
              </TiltCard>
              
              <TiltCard 
                className="border-2 border-blue-500/20 p-3 bg-gradient-to-br from-background to-muted shadow-md" 
                tiltAmount={8}
                glowOnHover={true}
                glowAlways={true}
                hoverScale={1.03}
                glowColor="rgba(59, 130, 246, 0.4)"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-muted-foreground font-medium">
                      <Users className="h-5 w-5 mr-2 text-blue-500" />
                      <span>Format Ratio</span>
                    </div>
                    <Badge variant="outline" className="font-bold text-blue-500 border-blue-500/50">Breakdown</Badge>
                  </div>
                  <div className="flex items-center justify-between text-2xl mt-2">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Singles</div>
                      <div className="font-bold text-blue-500 text-3xl">{(matchStats as any)?.singlesMatches || 0}</div>
                    </div>
                    <Separator orientation="vertical" className="mx-2 h-10 bg-blue-500/20" />
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Doubles</div>
                      <div className="font-bold text-blue-500 text-3xl">{(matchStats as any)?.doublesMatches || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </TiltCard>
              
              <TiltCard 
                className="border-2 border-orange-500/20 p-3 bg-gradient-to-br from-background to-muted shadow-md" 
                tiltAmount={8}
                glowOnHover={true}
                glowAlways={true}
                hoverScale={1.03}
                glowColor="rgba(249, 115, 22, 0.4)"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-muted-foreground font-medium">
                      <Zap className="h-5 w-5 mr-2 text-orange-500" />
                      <span>Total XP</span>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-orange-500">
                    {user?.xp || 0}
                    <span className="text-sm font-normal text-muted-foreground ml-2">points</span>
                  </div>
                  <div className="flex items-center mt-3 text-sm text-muted-foreground">
                    <span className="text-orange-500 font-medium">+{Math.floor((user?.xp || 0) * 0.12)}</span> 
                    <span className="ml-1">earned from recent matches</span>
                  </div>
                </CardContent>
              </TiltCard>
            </div>
            
            {/* Performance Trends Chart */}
            <Card className="border shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-4 border-b">
                <CardTitle className="flex items-center text-xl">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Performance Trends
                </CardTitle>
              </div>
              <CardContent className="p-6">
                <MatchTrends matches={recentMatches?.slice(0, 10) || []} />
              </CardContent>
            </Card>
            
            {/* Recent Activity Section - Limited to 3 most recent matches */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Recent Activity
                </h3>
                <Badge variant="outline" className="text-xs">Last 3 matches</Badge>
              </div>
              
              {matchesLoading ? (
                <Card className="p-6 text-center border-dashed">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </Card>
              ) : recentMatches && recentMatches.length > 0 ? (
                <div className="space-y-3">
                  {recentMatches.slice(0, 3).map((match: RecordedMatch) => {
                    const userPlayer = match.players?.find((p) => p.userId === user?.id);
                    const isWinner = userPlayer?.isWinner;
                    const opponent = getOpponentName(match, user?.id || 0);
                    
                    return (
                      <Card key={match.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                        <div className={`h-1.5 w-full ${isWinner ? 'bg-green-500' : 'bg-red-300'}`}></div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-full ${isWinner ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                                {isWinner ? 
                                  <Trophy className="h-5 w-5" /> : 
                                  <XCircle className="h-5 w-5" />
                                }
                              </div>
                              <div>
                                <div className="font-medium">
                                  {isWinner ? 'Victory against ' : 'Loss to '} {opponent}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {match.formatType === 'singles' ? 'Singles' : 'Doubles'} • {formatDate(match.date || new Date().toISOString())}
                                </div>
                              </div>
                            </div>
                            <div className={`text-lg font-semibold px-3 py-1 rounded-full ${
                              isWinner ? 'bg-green-500/10 text-green-600' : 'bg-red-100 text-red-500'
                            }`}>
                              {match.players?.[0]?.score || 0} - {match.players?.[1]?.score || 0}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {recentMatches.length > 3 && (
                    <div className="text-center mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const historyTab = document.querySelector('[data-state="inactive"][value="history"]') as HTMLElement;
                          if (historyTab) historyTab.click();
                        }}
                      >
                        View All Matches
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="p-6 text-center border-dashed">
                  <CardTitle className="text-base mb-2">No Matches Recorded</CardTitle>
                  <CardDescription>
                    Start recording your matches to see your performance trends.
                  </CardDescription>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setMatchDialogOpen(true)}
                      className="gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Record First Match
                    </Button>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => setMatchDialogOpen(true)}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Record Match
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-8">
          {/* PKL-278651-MATCH-0004-UIX: Modernized Match History using EnhancedMatchCard */}
          <div className="space-y-8 mx-auto max-w-5xl">
            {/* History Header with Stats Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-4 rounded-lg mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Match History
                </h2>
                <p className="text-muted-foreground text-sm">
                  Complete chronological record of all your matches
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    refetchStats();
                    refetchMatches();
                  }}
                  className="gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                  Refresh
                </Button>
                
                <Button 
                  onClick={() => setMatchDialogOpen(true)}
                  className="gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Record Match
                </Button>
              </div>
            </div>
            
            {/* Advanced Filtering Section */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary" />
                  Advanced Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContextualFilters 
                  matches={recentMatches || []}
                  filters={{
                    dateRange: [null, null],
                    matchType: 'all',
                    formatType: 'all',
                    opponent: null,
                    location: null
                  }}
                  onFilterChange={() => {}}
                />
              </CardContent>
            </Card>
            
            {/* PKL-278651-MATCH-0004-UIX: Enhanced Match Cards */}
            <Card className="border shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-4 border-b">
                <CardTitle className="flex items-center text-xl">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Match History
                </CardTitle>
              </div>
              <CardContent className="pb-6">
                {matchesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <MatchHistoryTab />
                )}
              </CardContent>
            </Card>
            
            {/* Export Options */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Export History
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="validations" className="mt-8">
          {/* PKL-278651-VALMAT-0002-UI: Enhanced Match Validation UI */}
          <div className="space-y-8 mx-auto max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Validation info */}
              <div className="lg:col-span-1">
                <Card className="shadow-md border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      VALMAT™ System
                    </CardTitle>
                    <CardDescription>
                      Match Validation System
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="border-b pb-2">
                        <p className="text-sm text-muted-foreground">
                          The VALMAT™ system ensures fairness by requiring match participants to validate results. 
                          This prevents inaccurate match records and maintains integrity in the rankings.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Confirmed</span>: Match details verified by player
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-1.5">
                            <Clock className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Pending</span>: Awaiting validation by one or more players
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Disputed</span>: One or more players have reported an issue
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-amber-600 dark:text-amber-400 flex items-center pt-2">
                        <AlertCircle className="h-4 w-4 mr-1.5" />
                        <span>Unvalidated matches earn reduced XP and rating points.</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full gap-1.5"
                      onClick={() => refetchMatches()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                      Refresh Validation Status
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Right column: Pending validations list */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Pending Validations</h2>
                  <Badge variant="outline" className="bg-background">
                    {recentMatches ? recentMatches.filter(m => m.validationStatus === 'pending').length : 0} Matches
                  </Badge>
                </div>
                
                {matchesLoading ? (
                  <Card className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </Card>
                ) : recentMatches && recentMatches.filter(m => m.validationStatus === 'pending').length > 0 ? (
                  <div className="space-y-4">
                    {recentMatches
                      .filter(m => m.validationStatus === 'pending')
                      .map((match: RecordedMatch) => {
                        const userPlayer = match.players?.find((p) => p.userId === user?.id);
                        const isWinner = userPlayer?.isWinner;
                        const opponent = getOpponentName(match, user?.id || 0);
                        
                        return (
                          <Card key={match.id} className={`border-l-4 ${isWinner ? 'border-l-green-500' : 'border-l-gray-300'} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div className="flex-1">
                                  <div className="font-medium flex items-center">
                                    {isWinner ? 'Victory against ' : 'Loss to '} {opponent}
                                    <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Pending
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground mb-2">
                                    {match.formatType === 'singles' ? 'Singles' : 'Doubles'} • {formatDate(match.date || new Date().toISOString())}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mt-3 mb-1">
                                    {/* PKL-278651-VALMAT-0002-UI: Add QuickValidationButton */}
                                    <QuickValidationButton 
                                      match={match}
                                      onValidationComplete={() => {
                                        refetchMatches();
                                      }}
                                    />
                                    
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <CheckCircle2 className="h-4 w-4 mr-1" />
                                          View Details
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Match Details</DialogTitle>
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
                                  <div className={`px-3 py-1 rounded-full ${
                                    isWinner ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  }`}>
                                    {match.players?.[0]?.score || 0} - {match.players?.[1]?.score || 0}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {match.validationRequiredBy ? (
                                      <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1 text-amber-500" />
                                        Validate by {formatDate(match.validationRequiredBy)}
                                      </span>
                                    ) : (
                                      <span className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Awaiting validation
                                      </span>
                                    )}
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
                
                {/* Additional section for recent validations */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Recently Validated</h2>
                    <Badge variant="outline" className="bg-background">
                      {recentMatches ? recentMatches.filter(m => m.validationStatus === 'confirmed' || m.validationStatus === 'validated').length : 0} Matches
                    </Badge>
                  </div>
                  
                  {recentMatches && recentMatches.filter(m => m.validationStatus === 'confirmed' || m.validationStatus === 'validated').length > 0 ? (
                    <div className="space-y-3">
                      {recentMatches
                        .filter(m => m.validationStatus === 'confirmed' || m.validationStatus === 'validated')
                        .slice(0, 3) // Show only the 3 most recent
                        .map((match: RecordedMatch) => {
                          const userPlayer = match.players?.find((p) => p.userId === user?.id);
                          const isWinner = userPlayer?.isWinner;
                          const opponent = getOpponentName(match, user?.id || 0);
                          
                          return (
                            <Card key={match.id} className="border-l-4 border-l-green-500 shadow-sm bg-green-50/30 dark:bg-green-900/10">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">{isWinner ? 'Victory vs. ' : 'Loss vs. '} {opponent}</span>
                                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200">
                                      Validated
                                    </Badge>
                                  </div>
                                  <div className="text-sm font-medium">
                                    {match.players?.[0]?.score || 0} - {match.players?.[1]?.score || 0}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  ) : (
                    <Card className="p-4 text-center border-dashed">
                      <CardDescription>
                        No matches have been validated yet.
                      </CardDescription>
                    </Card>
                  )}
                </div>
                
                {/* Disputed matches section */}
                {recentMatches && recentMatches.filter(m => m.validationStatus === 'disputed').length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Disputed Matches
                      </h2>
                      <Badge variant="destructive">
                        {recentMatches.filter(m => m.validationStatus === 'disputed').length} Issues
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {recentMatches
                        .filter(m => m.validationStatus === 'disputed')
                        .map((match: RecordedMatch) => {
                          const userPlayer = match.players?.find((p) => p.userId === user?.id);
                          const isWinner = userPlayer?.isWinner;
                          const opponent = getOpponentName(match, user?.id || 0);
                          
                          return (
                            <Card key={match.id} className="border-l-4 border-l-red-500 shadow-sm bg-red-50/30 dark:bg-red-900/10">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="font-medium">{isWinner ? 'Victory vs. ' : 'Loss vs. '} {opponent}</span>
                                    <Badge variant="destructive">
                                      Disputed
                                    </Badge>
                                  </div>
                                  <div className="text-sm font-medium">
                                    {match.players?.[0]?.score || 0} - {match.players?.[1]?.score || 0}
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                                  An administrator will review this match. Check back later for updates.
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
    </DashboardLayout>
  );
}