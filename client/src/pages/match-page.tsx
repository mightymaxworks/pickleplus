import { useState } from "react";
import { QuickMatchRecorder } from "@/components/match/QuickMatchRecorder";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar, TrophyIcon, CheckCircle2, BarChart4 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { matchSDK } from "@/lib/sdk/matchSDK";
import { useAuth } from "@/hooks/useAuth";

export default function MatchPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showRecorder, setShowRecorder] = useState(false);
  
  // Fetch match stats
  const { data: matchStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/match/stats"],
    queryFn: async () => {
      try {
        return await matchSDK.getMatchStats();
      } catch (error) {
        console.error("Error fetching match stats:", error);
        return null;
      }
    },
    enabled: !!user,
  });
  
  // Fetch recent matches
  const { data: recentMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/match/recent"],
    queryFn: async () => {
      try {
        return await matchSDK.getRecentMatches(undefined, 5);
      } catch (error) {
        console.error("Error fetching recent matches:", error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Handle match recorded successfully
  const handleMatchRecorded = () => {
    toast({
      title: "Match recorded successfully!",
      description: "Your match has been recorded and your stats have been updated.",
    });
    setShowRecorder(false);
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
    const playerTwoId = match.players.find((p: any) => p.userId !== currentUserId)?.userId;
    if (!playerTwoId || !match.playerNames) return "Opponent";
    return match.playerNames[playerTwoId]?.displayName || match.playerNames[playerTwoId]?.username || "Opponent";
  };

  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Center</h1>
          <p className="text-muted-foreground">Record and track your pickleball matches</p>
        </div>
        
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => setShowRecorder(!showRecorder)}
        >
          {showRecorder ? (
            <>Cancel</>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Record a Match
            </>
          )}
        </Button>
      </div>
      
      {showRecorder ? (
        <QuickMatchRecorder onSuccess={handleMatchRecorded} />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
          
          {/* Recent Matches */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
            
            {matchesLoading ? (
              <Card className="p-8 text-center">
                <div className="animate-pulse">Loading recent matches...</div>
              </Card>
            ) : recentMatches && recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match: any) => {
                  const isWinner = match.players.find((p: any) => p.userId === user?.id)?.isWinner;
                  const opponent = getOpponentName(match, user?.id || 0);
                  
                  return (
                    <Card key={match.id} className={`border-l-4 ${isWinner ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="font-medium">
                              {isWinner ? 'Victory against ' : 'Loss to '} {opponent}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {match.formatType === 'singles' ? 'Singles' : 'Doubles'} • {formatDate(match.date)}
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
                <CardTitle className="mb-2">No Matches Yet</CardTitle>
                <CardDescription>
                  Record your first match to see your history here.
                </CardDescription>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}