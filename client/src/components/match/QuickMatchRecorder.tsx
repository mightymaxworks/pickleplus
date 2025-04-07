import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { matchSDK } from "@/lib/sdk/matchSDK";
import { useLocation } from "wouter";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogPlayerSelect } from "../player-search/DialogPlayerSelect";
import { VisualScoreInput } from "./VisualScoreInput";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, UserCircle, CheckCircle2, Info } from "lucide-react";

// Match form schema with only essential fields
const matchFormSchema = z.object({
  playerTwoId: z.number().int().positive(),
  playerOnePartnerId: z.number().int().positive().optional(),
  playerTwoPartnerId: z.number().int().positive().optional(),
  formatType: z.enum(["singles", "doubles"]).default("singles"),
  notes: z.string().optional(),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

// Define a type for user search results
interface UserSearchResult {
  id: number;
  displayName: string | null;
  username: string;
  passportId?: string | null;
  avatarUrl?: string | undefined;
  avatarInitials?: string | undefined;
}

interface QuickMatchRecorderProps {
  onSuccess?: () => void;
}

export function QuickMatchRecorder({ onSuccess }: QuickMatchRecorderProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Match state
  const [formatType, setFormatType] = useState<"singles" | "doubles">("singles");
  const [scoringSystem, setScoringSystem] = useState<"traditional" | "rally">("traditional");
  const [pointsToWin, setPointsToWin] = useState<11 | 15 | 21>(11);
  const [totalGames, setTotalGames] = useState(1);
  const [games, setGames] = useState<Array<{playerOneScore: number; playerTwoScore: number}>>([
    { playerOneScore: 0, playerTwoScore: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Player selection state
  const [playerTwoData, setPlayerTwoData] = useState<UserSearchResult | null>(null);
  const [playerOnePartnerData, setPlayerOnePartnerData] = useState<UserSearchResult | null>(null);
  const [playerTwoPartnerData, setPlayerTwoPartnerData] = useState<UserSearchResult | null>(null);
  
  // Current user as player one
  const playerOneData = user ? {
    id: user.id,
    displayName: user.displayName || user.username,
    username: user.username,
    avatarInitials: user.avatarInitials || undefined,
  } : null;
  
  // Initialize form
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      playerTwoId: 0,
      formatType: "singles",
    },
  });
  
  // Listen for player selection events from DialogPlayerSelect
  useEffect(() => {
    const handlePlayerSelected = (event: CustomEvent) => {
      const { field, player } = event.detail;
      console.log("Player selected event received:", field, player);
      
      if (field === "playerTwoData") {
        setPlayerTwoData(player);
        form.setValue("playerTwoId", player.id);
      } else if (field === "playerOnePartnerData") {
        setPlayerOnePartnerData(player);
        form.setValue("playerOnePartnerId", player.id);
      } else if (field === "playerTwoPartnerData") {
        setPlayerTwoPartnerData(player);
        form.setValue("playerTwoPartnerId", player.id);
      }
    };
    
    window.addEventListener('player-selected', handlePlayerSelected as EventListener);
    
    return () => {
      window.removeEventListener('player-selected', handlePlayerSelected as EventListener);
    };
  }, [form]);
  
  // Update game format type
  const handleFormatTypeChange = (value: string) => {
    if (value === "singles" || value === "doubles") {
      setFormatType(value);
      form.setValue("formatType", value);
      
      // Clear partner selections when switching to singles
      if (value === "singles") {
        setPlayerOnePartnerData(null);
        setPlayerTwoPartnerData(null);
        form.setValue("playerOnePartnerId", undefined);
        form.setValue("playerTwoPartnerId", undefined);
      }
    }
  };
  
  // Update total games and initialize game scores
  const handleTotalGamesChange = (newTotalGames: number) => {
    setTotalGames(newTotalGames);
    
    // Ensure we have enough game objects
    const newGames = [...games];
    while (newGames.length < newTotalGames) {
      newGames.push({ playerOneScore: 0, playerTwoScore: 0 });
    }
    
    setGames(newGames);
  };
  
  // Calculate match winner based on game scores
  const calculateWinner = () => {
    if (totalGames === 1) {
      // Single game - compare scores directly
      return games[0].playerOneScore > games[0].playerTwoScore 
        ? user?.id 
        : playerTwoData?.id;
    } else {
      // Multi-game - count wins
      const playerOneWins = games.filter(g => g.playerOneScore > g.playerTwoScore).length;
      const playerTwoWins = games.filter(g => g.playerTwoScore > g.playerOneScore).length;
      
      return playerOneWins > playerTwoWins 
        ? user?.id 
        : playerTwoData?.id;
    }
  };
  
  // Form submission handler
  const handleSubmit = async () => {
    if (!user || !playerTwoData) {
      toast({
        title: "Missing players",
        description: "Please select all required players",
        variant: "destructive",
      });
      return;
    }
    
    // For doubles, validate partner selections
    if (formatType === "doubles" && (!playerOnePartnerData || !playerTwoPartnerData)) {
      toast({
        title: "Missing players",
        description: "Please select all required partner players for doubles",
        variant: "destructive",
      });
      return;
    }
    
    // Check if scores are entered
    const hasScores = games.some(game => game.playerOneScore > 0 || game.playerTwoScore > 0);
    if (!hasScores) {
      toast({
        title: "No scores entered",
        description: "Please enter the match scores",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Determine winner
    const winnerId = calculateWinner();
    console.log("Calculated winner ID:", winnerId);
    
    // Prepare players array
    const players = [
      {
        userId: user.id,
        partnerId: formatType === "doubles" ? playerOnePartnerData?.id : undefined,
        score: totalGames === 1 ? games[0].playerOneScore : games.filter(g => g.playerOneScore > g.playerTwoScore).length,
        isWinner: winnerId === user.id
      },
      {
        userId: playerTwoData.id,
        partnerId: formatType === "doubles" ? playerTwoPartnerData?.id : undefined,
        score: totalGames === 1 ? games[0].playerTwoScore : games.filter(g => g.playerTwoScore > g.playerOneScore).length,
        isWinner: winnerId === playerTwoData.id
      }
    ];
    
    console.log("Match players:", players);
    console.log("Game scores:", games);
    
    try {
      // Calculate age division based on user birthyear
      let division = "open";
      if (user.yearOfBirth) {
        const today = new Date();
        const age = today.getFullYear() - user.yearOfBirth;
        
        if (age >= 70) division = "70+";
        else if (age >= 60) division = "60+";
        else if (age >= 50) division = "50+";
        else if (age >= 35) division = "35+";
        else if (age >= 19) division = "19+";
      }
      
      // Create match data object
      const matchData = {
        formatType,
        scoringSystem,
        pointsToWin,
        division,
        matchType: "casual",
        eventTier: "local",
        players,
        gameScores: games,
        notes: form.getValues("notes"),
      };
      
      console.log("Submitting match data:", JSON.stringify(matchData, null, 2));
      
      // Record match via SDK
      console.log("Calling matchSDK.recordMatch...");
      const response = await matchSDK.recordMatch(matchData);
      console.log("Match recorded successfully:", response);
      
      // Invalidate relevant queries
      console.log("Invalidating related queries...");
      queryClient.invalidateQueries({ queryKey: ["/api/user/ranking-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ranking-leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/xp-tier"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/match/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/match/stats"] });
      
      // Show success toast
      toast({
        title: "Match recorded!",
        description: "Your match has been successfully recorded.",
      });
      
      // Reset form
      resetForm();
      
      // Navigate to the match page
      navigate("/match");
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error recording match:", error);
      
      // Try to extract more error details
      let errorMessage = "There was an error recording your match.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      toast({
        title: "Error recording match",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setPlayerTwoData(null);
    setPlayerOnePartnerData(null);
    setPlayerTwoPartnerData(null);
    setFormatType("singles");
    setScoringSystem("traditional");
    setPointsToWin(11);
    setTotalGames(1);
    setGames([{ playerOneScore: 0, playerTwoScore: 0 }]);
    form.reset({
      playerTwoId: 0,
      formatType: "singles",
      notes: "",
    });
  };
  
  // Calculate if match is complete and ready to submit
  const isMatchComplete = () => {
    // First, check if all players are selected
    if (!playerTwoData) return false;
    if (formatType === "doubles" && (!playerOnePartnerData || !playerTwoPartnerData)) return false;
    
    // Then check if scores are entered
    if (totalGames === 1) {
      const game = games[0];
      if (!game) return false;
      
      // Just check if any score was entered
      const maxScore = Math.max(game.playerOneScore, game.playerTwoScore);
      return maxScore > 0;
    } else {
      // In multi-game format, just verify that some games have scores
      const gamesWithScores = games.filter(g => 
        g && (g.playerOneScore > 0 || g.playerTwoScore > 0)
      ).length;
      return gamesWithScores > 0;
    }
  };
  
  // Calculate games needed to win
  const gamesToWin = Math.ceil(totalGames / 2);
  
  // Calculate wins for each player
  const playerOneWins = games.filter(g => g.playerOneScore > g.playerTwoScore).length;
  const playerTwoWins = games.filter(g => g.playerTwoScore > g.playerOneScore).length;
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="md:flex-row md:items-center px-4 sm:px-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
          <span>Quick Match Recorder</span>
          <div className="text-sm font-normal text-muted-foreground mt-1 sm:mt-0">
            Record a casual match in just a few clicks
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 px-4 sm:px-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Match Format</div>
          <ToggleGroup 
            type="single" 
            value={formatType}
            onValueChange={handleFormatTypeChange}
            className="justify-start flex flex-wrap"
          >
            <ToggleGroupItem value="singles" className="gap-2">
              <UserCircle className="h-4 w-4" />
              Singles
            </ToggleGroupItem>
            <ToggleGroupItem value="doubles" className="gap-2">
              <Users className="h-4 w-4" />
              Doubles
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <Separator />
        
        {/* Player Selection */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Players</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Your Side */}
            <Card className="border-dashed">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Your Side</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                {/* Current User (You) */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {playerOneData?.avatarInitials || playerOneData?.displayName?.charAt(0) || "Y"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {playerOneData?.displayName || "You"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      @{playerOneData?.username || "you"}
                    </div>
                  </div>
                </div>
                
                {/* Partner Selection (Doubles Only) */}
                {formatType === "doubles" && (
                  <div className="mt-3">
                    <DialogPlayerSelect
                      buttonLabel={playerOnePartnerData 
                        ? playerOnePartnerData.displayName || playerOnePartnerData.username
                        : "Select Your Partner"
                      }
                      buttonVariant="outline"
                      selectedUserId={playerOnePartnerData?.id}
                      onSelect={(player) => {
                        const event = new CustomEvent('player-selected', {
                          detail: { field: 'playerOnePartnerData', player }
                        });
                        window.dispatchEvent(event);
                      }}
                      excludeUserIds={[user?.id, playerTwoData?.id, playerTwoPartnerData?.id].filter(Boolean) as number[]}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Opponent Side */}
            <Card className="border-dashed">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">Opponent Side</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                {/* Opponent Selection */}
                <div className="mb-3">
                  <DialogPlayerSelect
                    buttonLabel={playerTwoData 
                      ? playerTwoData.displayName || playerTwoData.username
                      : "Select Opponent"
                    }
                    buttonVariant={playerTwoData ? "default" : "outline"}
                    selectedUserId={playerTwoData?.id}
                    onSelect={(player) => {
                      const event = new CustomEvent('player-selected', {
                        detail: { field: 'playerTwoData', player }
                      });
                      window.dispatchEvent(event);
                    }}
                    excludeUserIds={[user?.id, playerOnePartnerData?.id, playerTwoPartnerData?.id].filter(Boolean) as number[]}
                  />
                </div>
                
                {/* Partner Selection (Doubles Only) */}
                {formatType === "doubles" && playerTwoData && (
                  <div className="mt-3">
                    <DialogPlayerSelect
                      buttonLabel={playerTwoPartnerData 
                        ? playerTwoPartnerData.displayName || playerTwoPartnerData.username
                        : "Select Opponent's Partner"
                      }
                      buttonVariant="outline"
                      selectedUserId={playerTwoPartnerData?.id}
                      onSelect={(player) => {
                        const event = new CustomEvent('player-selected', {
                          detail: { field: 'playerTwoPartnerData', player }
                        });
                        window.dispatchEvent(event);
                      }}
                      excludeUserIds={[user?.id, playerTwoData?.id, playerOnePartnerData?.id].filter(Boolean) as number[]}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator />
        
        {/* Game Format */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Game Format</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Games</div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={totalGames === 1 ? "default" : "outline"} 
                  onClick={() => handleTotalGamesChange(1)}
                  size="sm"
                >
                  Single Game
                </Button>
                <Button 
                  variant={totalGames === 3 ? "default" : "outline"} 
                  onClick={() => handleTotalGamesChange(3)}
                  size="sm"
                >
                  Best of 3
                </Button>
                <Button 
                  variant={totalGames === 5 ? "default" : "outline"} 
                  onClick={() => handleTotalGamesChange(5)}
                  size="sm"
                >
                  Best of 5
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Scoring System</div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={scoringSystem === "traditional" ? "default" : "outline"} 
                  onClick={() => setScoringSystem("traditional")}
                  size="sm"
                >
                  Traditional
                </Button>
                <Button 
                  variant={scoringSystem === "rally" ? "default" : "outline"} 
                  onClick={() => setScoringSystem("rally")}
                  size="sm"
                >
                  Rally
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {scoringSystem === "traditional" 
                  ? "Points only on serve (side-out scoring)"
                  : "Points scored on every rally"}
              </div>
              
              {/* Points to Win */}
              <div className="mt-3">
                <div className="text-xs text-muted-foreground">Points to Win</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Button 
                    variant={pointsToWin === 11 ? "default" : "outline"} 
                    onClick={() => setPointsToWin(11)}
                    size="sm"
                  >
                    11
                  </Button>
                  <Button 
                    variant={pointsToWin === 15 ? "default" : "outline"} 
                    onClick={() => setPointsToWin(15)}
                    size="sm"
                  >
                    15
                  </Button>
                  <Button 
                    variant={pointsToWin === 21 ? "default" : "outline"} 
                    onClick={() => setPointsToWin(21)}
                    size="sm"
                  >
                    21
                  </Button>
                  <div className="flex items-center ml-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">The number of points needed to win a game. Traditional scoring typically uses 11 points, while rally scoring commonly uses 15 or 21 points.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Match status for multiple games */}
          {totalGames > 1 && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-3">
                <Badge variant={playerOneWins >= gamesToWin ? "default" : "outline"}>
                  Your side: {playerOneWins}
                </Badge>
                <Badge variant={playerTwoWins >= gamesToWin ? "default" : "outline"}>
                  Opponent: {playerTwoWins}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                First to {gamesToWin} games wins
              </div>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Score Entry */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Score</div>
          
          {/* Single Game Score Entry */}
          {totalGames === 1 ? (
            <VisualScoreInput
              value={games[0]}
              onChange={(newScore) => {
                const updatedGames = [...games];
                updatedGames[0] = newScore;
                setGames(updatedGames);
              }}
              playerOneName={playerOneData?.displayName || "You"}
              playerTwoName={playerTwoData?.displayName || "Opponent"}
              playerOneInitials={playerOneData?.avatarInitials}
              playerTwoInitials={playerTwoData?.avatarInitials}
              pointsToWin={pointsToWin}
            />
          ) : (
            /* Multi-game score entry */
            <Tabs defaultValue="1" className="space-y-4">
              <TabsList className="grid grid-cols-5 h-auto p-1">
                {Array.from({ length: totalGames }).map((_, i) => (
                  <TabsTrigger
                    key={i + 1}
                    value={(i + 1).toString()}
                    className="text-xs py-1"
                  >
                    Game {i + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Array.from({ length: totalGames }).map((_, i) => (
                <TabsContent key={i + 1} value={(i + 1).toString()}>
                  <VisualScoreInput
                    value={games[i] || { playerOneScore: 0, playerTwoScore: 0 }}
                    onChange={(newScore) => {
                      const updatedGames = [...games];
                      updatedGames[i] = newScore;
                      setGames(updatedGames);
                    }}
                    playerOneName={playerOneData?.displayName || "You"}
                    playerTwoName={playerTwoData?.displayName || "Opponent"}
                    playerOneInitials={playerOneData?.avatarInitials}
                    playerTwoInitials={playerTwoData?.avatarInitials}
                    pointsToWin={pointsToWin}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetForm}
          disabled={isSubmitting}
        >
          Reset
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !isMatchComplete() || !playerTwoData}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Record Match
        </Button>
      </CardFooter>
    </Card>
  );
}