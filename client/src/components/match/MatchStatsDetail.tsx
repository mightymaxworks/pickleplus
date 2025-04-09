/**
 * PKL-278651-MATCH-0003-DS: Match Stats Detail Component
 * This component displays detailed match statistics for a specific match
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  Award,
  Calendar,
  Clock,
  Edit,
  FilePlus,
  Lightbulb,
  Loader2,
  Star,
  Trophy,
  X,
} from "lucide-react";

import { BasicStatsRecorder } from "./BasicStatsRecorder";
import { StatsVisualization } from "./StatsVisualization";
import { MatchIdentifier } from "./MatchIdentifier";

// Match data interface
interface MatchData {
  id: number;
  date: string;
  formatType: 'singles' | 'doubles' | 'mixed';
  scoringSystem: 'traditional' | 'rally';
  pointsToWin: number;
  players: Array<{
    userId: number;
    score: string | number;
    isWinner: boolean;
    displayName?: string;
    username?: string;
  }>;
  playerNames?: {
    [userId: number]: {
      displayName: string;
      username: string;
      avatarInitials?: string;
      avatarUrl?: string;
    }
  };
  location?: string;
  notes?: string;
  gameScores?: Array<{
    playerOneScore: number;
    playerTwoScore: number;
  }>;
}

// Match statistics interface
interface MatchStatistics {
  id: number;
  matchId: number;
  totalPoints?: number;
  rallyLengthAvg?: number;
  longestRally?: number;
  unforcedErrors?: number;
  winners?: number;
  netPointsWon?: number;
  netPointsTotal?: number;
  dinkPointsWon?: number;
  dinkPointsTotal?: number;
  servePointsWon?: number;
  servePointsTotal?: number;
  returnPointsWon?: number;
  returnPointsTotal?: number;
  thirdShotSuccessRate?: number;
  timeAtNetPct?: number;
  distanceCoveredMeters?: number;
  avgShotSpeedKph?: number;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
}

// Performance impact interface
interface PerformanceImpact {
  id: number;
  matchId: number;
  userId: number;
  dimension: string;
  impactValue: number;
  reason?: string;
  metadata?: any;
}

// Match highlight interface
interface MatchHighlight {
  id: number;
  matchId: number;
  userId: number;
  highlightType: string;
  description: string;
  timestampSeconds?: number;
  metadata?: any;
}

interface MatchStatsDetailProps {
  matchId: number;
  onClose?: () => void;
}

/**
 * Component to display comprehensive match statistics for a specific match
 */
export function MatchStatsDetail({ matchId, onClose }: MatchStatsDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRecordingStats, setIsRecordingStats] = useState(false);
  const [isAddingImpacts, setIsAddingImpacts] = useState(false);
  const [isAddingHighlights, setIsAddingHighlights] = useState(false);

  // Fetch match data
  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: [`/api/match/${matchId}`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/match/${matchId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch match: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching match:", error);
        return null;
      }
    },
    enabled: !!matchId,
  });

  // Fetch match statistics
  const { data: statistics, isLoading: isLoadingStats } = useQuery({
    queryKey: [`/api/match/${matchId}/statistics`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/match/${matchId}/statistics`);
        if (!response.ok) {
          throw new Error(`Failed to fetch statistics: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching statistics:", error);
        return null;
      }
    },
    enabled: !!matchId,
  });

  // Fetch performance impacts
  const { data: impacts, isLoading: isLoadingImpacts } = useQuery({
    queryKey: [`/api/match/${matchId}/impacts`, user?.id],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/match/${matchId}/impacts?userId=${user?.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch performance impacts: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching performance impacts:", error);
        return [];
      }
    },
    enabled: !!matchId && !!user?.id,
  });

  // Fetch match highlights
  const { data: highlights, isLoading: isLoadingHighlights } = useQuery({
    queryKey: [`/api/match/${matchId}/highlights`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/match/${matchId}/highlights`);
        if (!response.ok) {
          throw new Error(`Failed to fetch match highlights: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching match highlights:", error);
        return [];
      }
    },
    enabled: !!matchId,
  });

  // Check if the current user participated in this match
  const userParticipated = match?.players?.some((p: { userId: number }) => p.userId === user?.id);

  // Handle successful stat recording
  const handleStatsRecorded = () => {
    setIsRecordingStats(false);
    toast({
      title: "Success",
      description: "Match statistics have been recorded.",
    });
  };

  // Loading state
  if (isLoadingMatch) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state - match not found
  if (!match) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <X className="h-5 w-5 text-destructive" />
            Match Not Found
          </CardTitle>
          <CardDescription>
            The requested match could not be found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We couldn't find a match with ID {matchId}. It may have been deleted or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Display content with match data
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Match {match.id}: {match.formatType} Match
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              {match.date ? format(parseISO(match.date), "MMM d, yyyy") : "Unknown date"}
              {match.location && (
                <>
                  <span className="px-1 text-muted-foreground">•</span>
                  <span>{match.location}</span>
                </>
              )}
            </CardDescription>
          </div>
          
          {/* Close button if provided */}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Match result summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          {/* Score display */}
          <div className="flex gap-6 items-center">
            {/* Player 1 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 mb-2 mx-auto flex items-center justify-center">
                {match.playerNames?.[match.players[0].userId]?.avatarInitials || 
                 match.playerNames?.[match.players[0].userId]?.displayName?.charAt(0) || "P1"}
              </div>
              <div className="font-medium text-sm">
                {match.playerNames?.[match.players[0].userId]?.displayName || 
                 match.playerNames?.[match.players[0].userId]?.username || "Player 1"}
              </div>
              <Badge 
                className={match.players[0].isWinner ? 
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 mt-1" : 
                  "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 mt-1"
                }
                variant={match.players[0].isWinner ? "default" : "outline"}
              >
                {match.players[0].isWinner ? "Winner" : "Lost"}
              </Badge>
            </div>
            
            {/* Score */}
            <div className="text-center">
              <div className="text-2xl font-bold">
                {match.players[0].score} - {match.players[1].score}
              </div>
              <div className="text-xs text-muted-foreground">
                {match.scoringSystem === "traditional" ? "Traditional" : "Rally"} to {match.pointsToWin}
              </div>
            </div>
            
            {/* Player 2 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-muted mb-2 mx-auto flex items-center justify-center">
                {match.playerNames?.[match.players[1].userId]?.avatarInitials || 
                 match.playerNames?.[match.players[1].userId]?.displayName?.charAt(0) || "P2"}
              </div>
              <div className="font-medium text-sm">
                {match.playerNames?.[match.players[1].userId]?.displayName || 
                 match.playerNames?.[match.players[1].userId]?.username || "Player 2"}
              </div>
              <Badge 
                className={match.players[1].isWinner ? 
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 mt-1" : 
                  "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 mt-1"
                }
                variant={match.players[1].isWinner ? "default" : "outline"}
              >
                {match.players[1].isWinner ? "Winner" : "Lost"}
              </Badge>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {!statistics && userParticipated && (
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setIsRecordingStats(true)}
              >
                <FilePlus className="h-4 w-4" />
                Record Stats
              </Button>
            )}
            {statistics && userParticipated && (
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setIsRecordingStats(true)}
              >
                <Edit className="h-4 w-4" />
                Edit Stats
              </Button>
            )}
            {!userParticipated && (
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => {}}
                disabled
              >
                <Activity className="h-4 w-4" />
                Observer Mode
              </Button>
            )}
          </div>
        </div>

        {/* Stats recording mode */}
        {isRecordingStats ? (
          <BasicStatsRecorder
            matchId={matchId}
            initialData={statistics || {}}
            onSuccess={handleStatsRecorded}
            onCancel={() => setIsRecordingStats(false)}
          />
        ) : (
          <>
            {/* Stats tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="impacts">Performance Impacts</TabsTrigger>
                <TabsTrigger value="highlights">Highlights</TabsTrigger>
                <TabsTrigger value="share">Share</TabsTrigger>
              </TabsList>
              
              {/* Overview tab - visualizations and statistics */}
              <TabsContent value="overview">
                {isLoadingStats ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="ml-2">Loading statistics...</span>
                  </div>
                ) : statistics ? (
                  <StatsVisualization 
                    statistics={statistics}
                    match={match}
                    userId={user?.id}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Match Statistics</CardTitle>
                      <CardDescription>
                        No statistics have been recorded for this match
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex flex-col items-center justify-center">
                      <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground mb-4">
                        Add detailed statistics to track your performance in this match
                      </p>
                      {userParticipated && (
                        <Button 
                          onClick={() => setIsRecordingStats(true)}
                          className="gap-1"
                        >
                          <FilePlus className="h-4 w-4" />
                          Record Statistics
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Performance Impacts tab */}
              <TabsContent value="impacts">
                {isLoadingImpacts ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="ml-2">Loading performance impacts...</span>
                  </div>
                ) : impacts && impacts.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Performance Impacts
                      </CardTitle>
                      <CardDescription>
                        How this match affected your skill progression
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {impacts.map((impact: PerformanceImpact) => (
                          <div key={impact.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              impact.impactValue > 0 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>
                              {impact.impactValue > 0 ? "+" : ""}{impact.impactValue}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{impact.dimension}</h4>
                              {impact.reason && (
                                <p className="text-sm text-muted-foreground mt-1">{impact.reason}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Impacts</CardTitle>
                      <CardDescription>
                        No performance impacts recorded for this match
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex flex-col items-center justify-center">
                      <Award className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground">
                        Your skill progression impacts will be shown here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Highlights tab */}
              <TabsContent value="highlights">
                {isLoadingHighlights ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <span className="ml-2">Loading match highlights...</span>
                  </div>
                ) : highlights && highlights.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Match Highlights
                      </CardTitle>
                      <CardDescription>
                        Notable moments from this match
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {highlights.map((highlight: MatchHighlight) => (
                          <div key={highlight.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                            <div className="bg-primary/10 text-primary p-2 rounded-md">
                              {highlight.timestampSeconds ? (
                                <Clock className="h-5 w-5" />
                              ) : (
                                <Lightbulb className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{highlight.highlightType}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{highlight.description}</p>
                              {highlight.timestampSeconds && (
                                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {Math.floor(highlight.timestampSeconds / 60)}:{(highlight.timestampSeconds % 60).toString().padStart(2, '0')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Match Highlights</CardTitle>
                      <CardDescription>
                        No highlights recorded for this match
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex flex-col items-center justify-center">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground">
                        Match highlights and notable moments will be shown here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Share tab */}
              <TabsContent value="share">
                <Card>
                  <CardHeader>
                    <CardTitle>Share Match Statistics</CardTitle>
                    <CardDescription>
                      Generate a QR code or share a link to this match
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center py-6">
                    <MatchIdentifier
                      matchId={matchId}
                      generationMode={true}
                      onMatchIdentified={() => {}}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
        
        {/* Match notes if available */}
        {match.notes && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Match Notes</h4>
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              {match.notes}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}