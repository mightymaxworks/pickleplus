import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Users, UserCircle, Plus, Minus, ChevronRight, ChevronLeft } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

// Game schema for a single game in a match
const gameSchema = z.object({
  playerOneScore: z.coerce.number().int().min(0).max(99),
  playerTwoScore: z.coerce.number().int().min(0).max(99),
});

// Form schema for match recording
const matchFormSchema = z.object({
  // Basic information
  playerOneId: z.number().int().positive(),
  playerTwoId: z.coerce.number().int().positive(),
  playerOnePartnerId: z.coerce.number().int().optional(),
  playerTwoPartnerId: z.coerce.number().int().optional(),
  
  // Match format
  formatType: z.enum(["singles", "doubles"]).default("singles"),
  scoringSystem: z.enum(["traditional", "rally"]).default("traditional"),
  pointsToWin: z.coerce.number().int().refine(value => [11, 15, 21].includes(value), {
    message: "Points to win must be 11, 15, or 21",
  }),
  
  // Scores
  scorePlayerOne: z.string().min(1),
  scorePlayerTwo: z.string().min(1),
  gameScores: z.array(gameSchema).optional(),
  
  // Match metadata
  location: z.string().optional(),
  notes: z.string().optional(),
  matchType: z.literal("casual"), // For now, only casual is allowed
});

type MatchFormValues = z.infer<typeof matchFormSchema>;
type GameValues = z.infer<typeof gameSchema>;

interface MatchRecordingFormProps {
  onSuccess?: () => void;
}

export function MatchRecordingForm({ onSuccess }: MatchRecordingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for the multi-step form
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGame, setCurrentGame] = useState(1);
  const [totalGames, setTotalGames] = useState(1);
  const [games, setGames] = useState<GameValues[]>([{ playerOneScore: 0, playerTwoScore: 0 }]);
  const [showWinByTwoAlert, setShowWinByTwoAlert] = useState(false);
  const [submittingData, setSubmittingData] = useState<MatchFormValues | null>(null);

  // Initialize form with default values
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      playerOneId: user?.id || 0,
      playerTwoId: 0,
      formatType: "singles",
      scoringSystem: "traditional",
      pointsToWin: 11,
      scorePlayerOne: "0",
      scorePlayerTwo: "0",
      matchType: "casual",
      location: "",
      notes: "",
      gameScores: [{ playerOneScore: 0, playerTwoScore: 0 }],
    },
  });

  // Watch form values for conditional rendering
  const formatType = form.watch("formatType");
  const scoringSystem = form.watch("scoringSystem");
  const pointsToWin = form.watch("pointsToWin");
  
  // Effect to update game scores when games change
  useEffect(() => {
    const gameScoresString = games.map(game => 
      `${game.playerOneScore}-${game.playerTwoScore}`
    ).join(", ");
    
    // Determine the final score based on the first game or best of multiple games
    let finalScorePlayerOne = "";
    let finalScorePlayerTwo = "";
    
    if (totalGames === 1) {
      finalScorePlayerOne = String(games[0].playerOneScore);
      finalScorePlayerTwo = String(games[0].playerTwoScore);
    } else {
      // Count wins for player one and two
      const playerOneWins = games.filter(g => g.playerOneScore > g.playerTwoScore).length;
      const playerTwoWins = games.filter(g => g.playerOneScore < g.playerTwoScore).length;
      
      finalScorePlayerOne = `${playerOneWins}`;
      finalScorePlayerTwo = `${playerTwoWins}`;
    }
    
    form.setValue("scorePlayerOne", finalScorePlayerOne);
    form.setValue("scorePlayerTwo", finalScorePlayerTwo);
    form.setValue("gameScores", games);
  }, [games, totalGames, form]);

  // Create a mutation for recording a match
  const recordMatchMutation = useMutation({
    mutationFn: async (data: MatchFormValues) => {
      // Determine winner
      let winnerId = data.playerOneId;
      if (totalGames === 1) {
        // Single game - compare scores directly
        if (parseInt(data.scorePlayerTwo) > parseInt(data.scorePlayerOne)) {
          winnerId = data.playerTwoId;
        }
      } else {
        // Best of multiple games - compare game wins
        const playerOneWins = games.filter(g => g.playerOneScore > g.playerTwoScore).length;
        const playerTwoWins = games.filter(g => g.playerOneScore < g.playerTwoScore).length;
        if (playerTwoWins > playerOneWins) {
          winnerId = data.playerTwoId;
        }
      }
      
      // Add calculated fields
      const finalData = {
        ...data,
        winnerId,
        // Points and XP award would normally be calculated on the server
        pointsAwarded: 10,
        xpAwarded: 50,
      };
      
      const res = await apiRequest("POST", "/api/matches", finalData);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/user/ranking-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ranking-leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      
      // Show success toast
      toast({
        title: "Match recorded!",
        description: "Your match has been successfully recorded.",
      });
      
      // Reset form and state
      form.reset({
        playerOneId: user?.id || 0,
        playerTwoId: 0,
        formatType: "singles",
        scoringSystem: "traditional",
        pointsToWin: 11,
        scorePlayerOne: "0",
        scorePlayerTwo: "0",
        matchType: "casual",
        location: "",
        notes: "",
        gameScores: [{ playerOneScore: 0, playerTwoScore: 0 }],
      });
      
      setStep(1);
      setGames([{ playerOneScore: 0, playerTwoScore: 0 }]);
      setCurrentGame(1);
      setTotalGames(1);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error recording match:", error);
      
      toast({
        title: "Error recording match",
        description: "There was an error recording your match. Please try again.",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: MatchFormValues) => {
    // Validate that player IDs are not duplicated
    const players = [
      data.playerOneId, 
      data.playerTwoId, 
      data.playerOnePartnerId, 
      data.playerTwoPartnerId
    ].filter(Boolean);
    
    const uniquePlayers = new Set(players);
    if (uniquePlayers.size !== players.length) {
      toast({
        title: "Invalid players",
        description: "Each player can only appear once in a match",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the win by 2 rule should be enforced
    let shouldShowWinByTwoAlert = false;
    
    // For single game format
    if (totalGames === 1) {
      const playerOneScore = games[0].playerOneScore;
      const playerTwoScore = games[0].playerTwoScore;
      const maxScore = Math.max(playerOneScore, playerTwoScore);
      const minScore = Math.min(playerOneScore, playerTwoScore);
      
      // Check if max score meets the win threshold
      if (maxScore >= pointsToWin && (maxScore - minScore) < 2) {
        shouldShowWinByTwoAlert = true;
      }
    }
    
    // For multi-game format, check each game
    if (totalGames > 1) {
      games.forEach(game => {
        const maxScore = Math.max(game.playerOneScore, game.playerTwoScore);
        const minScore = Math.min(game.playerOneScore, game.playerTwoScore);
        
        if (maxScore >= pointsToWin && (maxScore - minScore) < 2) {
          shouldShowWinByTwoAlert = true;
        }
      });
    }
    
    if (shouldShowWinByTwoAlert) {
      setSubmittingData(data);
      setShowWinByTwoAlert(true);
      return;
    }
    
    // No win by 2 issues, proceed with submission
    setIsSubmitting(true);
    recordMatchMutation.mutate(data);
  };

  // Confirm submission after win by 2 alert
  const confirmSubmission = () => {
    if (submittingData) {
      setIsSubmitting(true);
      recordMatchMutation.mutate(submittingData);
      setShowWinByTwoAlert(false);
    }
  };

  // Cancel submission after win by 2 alert
  const cancelSubmission = () => {
    setShowWinByTwoAlert(false);
    setSubmittingData(null);
  };

  // Handlers for the stepper
  const goToNextStep = () => {
    if (step === 1) {
      // Validate step 1 fields
      const step1Valid = [
        form.trigger("formatType"),
        form.trigger("scoringSystem"),
        form.trigger("pointsToWin"),
      ];
      
      if (step1Valid.every(Boolean)) {
        setStep(2);
      }
    } else if (step === 2) {
      // Validate step 2 fields
      const step2Fields = ["playerOneId", "playerTwoId"];
      
      if (formatType === "doubles") {
        step2Fields.push("playerOnePartnerId", "playerTwoPartnerId");
      }
      
      const step2Promises = step2Fields.map(field => form.trigger(field as any));
      Promise.all(step2Promises).then(results => {
        if (results.every(Boolean)) {
          setStep(3);
        }
      });
    }
  };

  const goToPrevStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // Handlers for game scores
  const updateGameScore = (player: "playerOne" | "playerTwo", operation: "add" | "subtract") => {
    const newGames = [...games];
    const currentGameObj = newGames[currentGame - 1];
    
    if (operation === "add") {
      if (player === "playerOne") {
        currentGameObj.playerOneScore += 1;
      } else {
        currentGameObj.playerTwoScore += 1;
      }
    } else {
      if (player === "playerOne") {
        currentGameObj.playerOneScore = Math.max(0, currentGameObj.playerOneScore - 1);
      } else {
        currentGameObj.playerTwoScore = Math.max(0, currentGameObj.playerTwoScore - 1);
      }
    }
    
    newGames[currentGame - 1] = currentGameObj;
    setGames(newGames);
  };

  const setGameFormat = (format: "single" | "best-of-3") => {
    if (format === "single") {
      setTotalGames(1);
      setGames([games[0] || { playerOneScore: 0, playerTwoScore: 0 }]);
      setCurrentGame(1);
    } else {
      setTotalGames(3);
      // Initialize or keep existing games
      const newGames = [...games];
      while (newGames.length < 3) {
        newGames.push({ playerOneScore: 0, playerTwoScore: 0 });
      }
      setGames(newGames);
    }
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-3">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold">Step 1: Match Format</h3>
              <p className="text-sm text-muted-foreground">Select the format and scoring system</p>
            </div>
            
            {/* Match Format Type */}
            <FormField
              control={form.control}
              name="formatType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-base">Match Format</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="grid grid-cols-2 justify-stretch"
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value);
                      }}
                    >
                      <ToggleGroupItem value="singles" className="flex items-center justify-center gap-2 h-16">
                        <UserCircle className="h-5 w-5" />
                        <span>Singles</span>
                      </ToggleGroupItem>
                      <ToggleGroupItem value="doubles" className="flex items-center justify-center gap-2 h-16">
                        <Users className="h-5 w-5" />
                        <span>Doubles</span>
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Scoring System */}
            <FormField
              control={form.control}
              name="scoringSystem"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-base">Scoring System</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="grid grid-cols-2 justify-stretch"
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value);
                      }}
                    >
                      <ToggleGroupItem value="traditional" className="h-16">
                        <div className="flex flex-col items-center justify-center">
                          <span>Traditional</span>
                          <span className="text-xs text-muted-foreground">Server scores only</span>
                        </div>
                      </ToggleGroupItem>
                      <ToggleGroupItem value="rally" className="h-16">
                        <div className="flex flex-col items-center justify-center">
                          <span>Rally</span>
                          <span className="text-xs text-muted-foreground">Every rally scores</span>
                        </div>
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Points to Win */}
            <FormField
              control={form.control}
              name="pointsToWin"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-base">Points to Win</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      className="grid grid-cols-3 justify-stretch"
                      value={String(field.value)}
                      onValueChange={(value) => {
                        if (value) field.onChange(parseInt(value));
                      }}
                    >
                      <ToggleGroupItem value="11" className="h-14">11</ToggleGroupItem>
                      <ToggleGroupItem value="15" className="h-14">15</ToggleGroupItem>
                      <ToggleGroupItem value="21" className="h-14">21</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Game Format */}
            <div className="space-y-1">
              <FormLabel className="text-base">Game Format</FormLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                className="grid grid-cols-2 justify-stretch"
                value={totalGames === 1 ? "single" : "best-of-3"}
                onValueChange={(value) => {
                  if (value) setGameFormat(value as "single" | "best-of-3");
                }}
              >
                <ToggleGroupItem value="single" className="h-16">
                  <div className="flex flex-col items-center justify-center">
                    <span>Single Game</span>
                    <span className="text-xs text-muted-foreground">Just one game</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem value="best-of-3" className="h-16">
                  <div className="flex flex-col items-center justify-center">
                    <span>Best of 3</span>
                    <span className="text-xs text-muted-foreground">First to 2 wins</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-3">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold">Step 2: Players</h3>
              <p className="text-sm text-muted-foreground">
                {formatType === "singles" 
                  ? "Enter your opponent's ID"
                  : "Enter your partner and opponents' IDs"
                }
              </p>
            </div>
            
            {/* Player One ID (Current User) */}
            <FormField
              control={form.control}
              name="playerOneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Player ID</FormLabel>
                  <FormControl>
                    <Input disabled {...field} value={user?.id || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Player One Partner ID (Doubles only) */}
            {formatType === "doubles" && (
              <FormField
                control={form.control}
                name="playerOnePartnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Partner's ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your partner's ID"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Player Two ID (Opponent) */}
            <FormField
              control={form.control}
              name="playerTwoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {formatType === "singles" ? "Opponent's ID" : "Opponent 1 ID"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Enter ${formatType === "singles" ? "opponent's" : "opponent 1's"} ID`}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Player Two Partner ID (Doubles only) */}
            {formatType === "doubles" && (
              <FormField
                control={form.control}
                name="playerTwoPartnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opponent 2 ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter opponent 2's ID"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-3">
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold">Step 3: Score</h3>
              <p className="text-sm text-muted-foreground">
                Record the final game score{totalGames > 1 ? "s" : ""}
              </p>
            </div>
            
            {/* For multi-game matches, display tabs for each game */}
            {totalGames > 1 ? (
              <Tabs
                defaultValue="1"
                value={String(currentGame)}
                onValueChange={(value) => setCurrentGame(parseInt(value))}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="1">Game 1</TabsTrigger>
                  <TabsTrigger value="2">Game 2</TabsTrigger>
                  <TabsTrigger value="3">Game 3</TabsTrigger>
                </TabsList>
                
                {[1, 2, 3].map((gameNumber) => (
                  <TabsContent key={gameNumber} value={String(gameNumber)} className="mt-0">
                    <ScoreCard
                      gameNumber={gameNumber}
                      playerOneName={user?.displayName || "You"}
                      playerTwoName="Opponent"
                      playerOneScore={games[gameNumber - 1]?.playerOneScore || 0}
                      playerTwoScore={games[gameNumber - 1]?.playerTwoScore || 0}
                      onScoreChange={(player, operation) => updateGameScore(player, operation)}
                      pointsToWin={pointsToWin}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              // Single game display
              <ScoreCard
                gameNumber={1}
                playerOneName={user?.displayName || "You"}
                playerTwoName="Opponent"
                playerOneScore={games[0]?.playerOneScore || 0}
                playerTwoScore={games[0]?.playerTwoScore || 0}
                onScoreChange={(player, operation) => updateGameScore(player, operation)}
                pointsToWin={pointsToWin}
              />
            )}
            
            {/* Optional Match Details */}
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 gap-4">
              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter match location"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Any additional notes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {renderStepContent()}
          
          <div className="flex justify-between pt-2 mt-2">
            {step > 1 ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={goToPrevStep}
                className="flex items-center h-10 px-3 sm:px-4"
                size="sm"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            ) : (
              <div></div> // Spacer for flex layout
            )}
            
            {step < 3 ? (
              <Button 
                type="button" 
                onClick={goToNextStep}
                className="flex items-center h-10 px-3 sm:px-4"
                size="sm"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center h-10 px-3 sm:px-4"
                size="sm"
              >
                {isSubmitting ? "Recording..." : "Record Match"}
              </Button>
            )}
          </div>
        </form>
      </Form>
      
      {/* Alert Dialog for Win by 2 Rule */}
      <AlertDialog open={showWinByTwoAlert} onOpenChange={setShowWinByTwoAlert}>
        <AlertDialogContent className="max-w-[350px] sm:max-w-[425px] p-4 sm:p-6">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="flex items-center text-base sm:text-lg">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" />
              <span>Non-standard Score</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              In pickleball, games are typically won by a 2-point margin.
              The score you've entered doesn't follow this rule. Do you want to proceed anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-2 flex-col sm:flex-row gap-2 sm:gap-0 mt-4 sm:mt-6">
            <AlertDialogCancel 
              onClick={cancelSubmission}
              className="mt-0 text-sm h-9 px-3"
            >
              No, let me fix the score
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSubmission}
              className="text-sm h-9 px-3"
            >
              Yes, record as entered
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Score card component for visual score entry
interface ScoreCardProps {
  gameNumber: number;
  playerOneName: string;
  playerTwoName: string;
  playerOneScore: number;
  playerTwoScore: number;
  onScoreChange: (player: "playerOne" | "playerTwo", operation: "add" | "subtract") => void;
  pointsToWin: number;
}

function ScoreCard({
  gameNumber,
  playerOneName,
  playerTwoName,
  playerOneScore,
  playerTwoScore,
  onScoreChange,
  pointsToWin
}: ScoreCardProps) {
  // Determine if a player has won based on the scores
  const playerOneWon = playerOneScore >= pointsToWin && playerOneScore >= playerTwoScore + 2;
  const playerTwoWon = playerTwoScore >= pointsToWin && playerTwoScore >= playerOneScore + 2;
  
  // Determine if scores are valid but don't meet the win by 2 rule
  const scoresMeetThreshold = playerOneScore >= pointsToWin || playerTwoScore >= pointsToWin;
  const scoresNeedWinByTwo = scoresMeetThreshold && Math.abs(playerOneScore - playerTwoScore) < 2;
  
  return (
    <div>
      {gameNumber > 1 && (
        <div className="mb-3 text-center">
          <h4 className="text-sm font-medium">Game {gameNumber}</h4>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {/* Player One Score Card */}
        <Card className={`border-2 ${playerOneWon ? "border-green-500" : ""}`}>
          <CardContent className="p-3 sm:pt-6 text-center">
            <p className="font-medium mb-1 sm:mb-2 text-sm sm:text-base truncate">{playerOneName}</p>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => onScoreChange("playerOne", "subtract")}
                disabled={playerOneScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="text-3xl sm:text-4xl font-bold w-10 sm:w-12 text-center">
                {playerOneScore}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => onScoreChange("playerOne", "add")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Player Two Score Card */}
        <Card className={`border-2 ${playerTwoWon ? "border-green-500" : ""}`}>
          <CardContent className="p-3 sm:pt-6 text-center">
            <p className="font-medium mb-1 sm:mb-2 text-sm sm:text-base truncate">{playerTwoName}</p>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => onScoreChange("playerTwo", "subtract")}
                disabled={playerTwoScore <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="text-3xl sm:text-4xl font-bold w-10 sm:w-12 text-center">
                {playerTwoScore}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => onScoreChange("playerTwo", "add")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Warning about win by 2 rule if needed */}
      {scoresNeedWinByTwo && (
        <div className="mt-2 p-2 text-xs text-yellow-600 bg-yellow-50 rounded-md flex items-start">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
          <span>In pickleball, games are typically won by a 2-point margin.</span>
        </div>
      )}
    </div>
  );
}