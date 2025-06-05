import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Users, UserCircle, ChevronRight, ChevronLeft } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { DialogPlayerSelect } from "../player-search/DialogPlayerSelect";
import { MultiGameScoreInput } from "./MultiGameScoreInput";

// Game schema for a single game in a match with comprehensive pickleball scoring validation
const createGameSchema = (pointsToWin: number) => z.object({
  playerOneScore: z.number().int().min(0).max(99),
  playerTwoScore: z.number().int().min(0).max(99),
}).refine(data => {
  // No tied scores allowed - one player must win
  return data.playerOneScore !== data.playerTwoScore;
}, {
  message: "Scores cannot be tied - one player must win the game",
  path: ["playerTwoScore"]
}).refine(data => {
  const winnerScore = Math.max(data.playerOneScore, data.playerTwoScore);
  const loserScore = Math.min(data.playerOneScore, data.playerTwoScore);
  
  // Winner must reach minimum points to win
  if (winnerScore < pointsToWin) {
    return false;
  }
  
  // If loser has reached pointsToWin-1 or more, winner must win by 2
  if (loserScore >= pointsToWin - 1) {
    return winnerScore - loserScore >= 2;
  }
  
  return true;
}, (data) => {
  const winnerScore = Math.max(data.playerOneScore, data.playerTwoScore);
  const loserScore = Math.min(data.playerOneScore, data.playerTwoScore);
  
  if (winnerScore < pointsToWin) {
    return {
      message: `Winner must score at least ${pointsToWin} points`,
      path: ["playerTwoScore"]
    };
  }
  
  if (loserScore >= pointsToWin - 1 && winnerScore - loserScore < 2) {
    return {
      message: `Must win by 2 points when opponent reaches ${pointsToWin - 1} or more`,
      path: ["playerTwoScore"]
    };
  }
  
  return { message: "Invalid score", path: ["playerTwoScore"] };
});

// Base game schema for form initialization
const gameSchema = z.object({
  playerOneScore: z.number().int().min(0).max(99),
  playerTwoScore: z.number().int().min(0).max(99),
});

// Form schema for match recording
const matchFormSchema = z.object({
  // Basic information
  playerOneId: z.number().int().positive(),
  playerTwoId: z.number().int().positive(),
  playerOnePartnerId: z.number().int().optional(),
  playerTwoPartnerId: z.number().int().optional(),
  
  // Match format
  formatType: z.enum(["singles", "doubles"]).default("singles"),
  scoringSystem: z.enum(["traditional", "rally"]).default("traditional"),
  pointsToWin: z.number().int().refine(value => [11, 15, 21].includes(value), {
    message: "Points to win must be 11, 15, or 21",
  }),
  division: z.enum(["open", "19+", "35+", "50+", "60+", "70+"]).default("open"),
  
  // Scores
  scorePlayerOne: z.string().min(1),
  scorePlayerTwo: z.string().min(1),
  gameScores: z.array(gameSchema),
  
  // Match metadata
  location: z.string().optional(),
  notes: z.string().optional(),
  matchType: z.enum(["casual", "league", "tournament"]).default("casual"),
  eventTier: z.enum(["local", "regional", "national", "international"]).default("local"),
  
  // Tournament context (only used when matchType is "tournament")
  tournamentId: z.number().int().positive().optional(),
  roundNumber: z.number().int().optional(),
  stageType: z.enum(["qualifying", "main", "consolation"]).optional(),
}).refine(data => {
  // If it's a tournament match, ensure tournamentId is provided
  return data.matchType !== "tournament" || (data.matchType === "tournament" && !!data.tournamentId);
}, {
  message: "Tournament ID is required for tournament matches",
  path: ["tournamentId"]
}).refine(data => {
  // For doubles matches, ensure partners are specified
  return data.formatType !== "doubles" || (
    data.formatType === "doubles" && 
    typeof data.playerOnePartnerId === "number" && 
    typeof data.playerTwoPartnerId === "number"
  );
}, {
  message: "Partner IDs are required for doubles matches",
  path: ["playerOnePartnerId"]
}).refine(data => {
  // Validate each game score based on points-to-win setting
  const pointsToWin = data.pointsToWin;
  
  for (let i = 0; i < data.gameScores.length; i++) {
    const game = data.gameScores[i];
    const winnerScore = Math.max(game.playerOneScore, game.playerTwoScore);
    const loserScore = Math.min(game.playerOneScore, game.playerTwoScore);
    
    // No tied scores
    if (game.playerOneScore === game.playerTwoScore) {
      return false;
    }
    
    // Winner must reach minimum points
    if (winnerScore < pointsToWin) {
      return false;
    }
    
    // Win by 2 rule when opponent reaches pointsToWin-1 or more
    if (loserScore >= pointsToWin - 1 && winnerScore - loserScore < 2) {
      return false;
    }
  }
  
  return true;
}, {
  message: "Invalid game scores - check pickleball scoring rules",
  path: ["gameScores"]
});

type MatchFormValues = z.infer<typeof matchFormSchema>;
type GameValues = z.infer<typeof gameSchema>;

interface NewMatchRecordingFormProps {
  onSuccess?: () => void;
}

// Define a type for user search results
interface UserSearchResult {
  id: number;
  displayName: string;
  username: string;
  passportId?: string | null;
  avatarUrl?: string | undefined;
  avatarInitials?: string | undefined;
}

export function NewMatchRecordingForm({ onSuccess }: NewMatchRecordingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for the wizard (now with fewer steps!)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalGames, setTotalGames] = useState(1);
  const [games, setGames] = useState<GameValues[]>([{ playerOneScore: 0, playerTwoScore: 0 }]);
  const [showWinByTwoAlert, setShowWinByTwoAlert] = useState(false);
  const [submittingData, setSubmittingData] = useState<MatchFormValues | null>(null);
  
  // State for selected players
  const [playerOneData, setPlayerOneData] = useState<UserSearchResult | null>(null);
  const [playerTwoData, setPlayerTwoData] = useState<UserSearchResult | null>(null);
  const [playerOnePartnerData, setPlayerOnePartnerData] = useState<UserSearchResult | null>(null);
  const [playerTwoPartnerData, setPlayerTwoPartnerData] = useState<UserSearchResult | null>(null);
  
  // Listen for player selection events from DialogPlayerSelect
  useEffect(() => {
    const handlePlayerSelected = (event: CustomEvent) => {
      const { field, player } = event.detail;
      console.log("Player selected event received:", field, player);
      
      if (field === "playerOneData") {
        setPlayerOneData(player);
      } else if (field === "playerTwoData") {
        setPlayerTwoData(player);
      } else if (field === "playerOnePartnerData") {
        setPlayerOnePartnerData(player);
      } else if (field === "playerTwoPartnerData") {
        setPlayerTwoPartnerData(player);
      }
    };
    
    window.addEventListener('player-selected', handlePlayerSelected as EventListener);
    
    return () => {
      window.removeEventListener('player-selected', handlePlayerSelected as EventListener);
    };
  }, []);
  
  // Initialize form with default values
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      playerOneId: user?.id || 0,
      playerTwoId: 0,
      formatType: "singles",
      scoringSystem: "traditional",
      pointsToWin: 11,
      division: "open",
      scorePlayerOne: "0",
      scorePlayerTwo: "0",
      matchType: "casual",
      eventTier: "local",
      location: "",
      notes: "",
      gameScores: [{ playerOneScore: 0, playerTwoScore: 0 }],
    },
  });

  // Watch form values for conditional rendering
  const formatType = form.watch("formatType");
  const scoringSystem = form.watch("scoringSystem");
  const pointsToWin = form.watch("pointsToWin");
  
  // Set current user as player one
  useEffect(() => {
    if (user && !playerOneData) {
      setPlayerOneData({
        id: user.id,
        displayName: user.displayName || user.username,
        username: user.username,
        avatarUrl: user.avatarUrl || undefined,
        avatarInitials: user.avatarInitials || undefined,
      });
      form.setValue("playerOneId", user.id);
    }
  }, [user, form, playerOneData]);
  
  // Effect to set age division based on user's year of birth
  useEffect(() => {
    if (user?.yearOfBirth && form.watch("matchType") === "casual") {
      // Calculate age from birth year
      const today = new Date();
      const age = today.getFullYear() - user.yearOfBirth;
      
      // Determine proper age division based on user's age
      let division: "open" | "19+" | "35+" | "50+" | "60+" | "70+" = "open";
      if (age >= 70) {
        division = "70+";
      } else if (age >= 60) {
        division = "60+";
      } else if (age >= 50) {
        division = "50+";
      } else if (age >= 35) {
        division = "35+";
      } else if (age >= 19) {
        division = "19+";
      }
      
      // Update the division field
      form.setValue("division", division);
    }
  }, [user?.yearOfBirth, form.watch("matchType"), form]);
  
  // Get player data for player two when selected
  const { data: playerTwoUserData } = useQuery({
    queryKey: ["/api/users", form.watch("playerTwoId")],
    queryFn: async () => {
      const id = form.watch("playerTwoId");
      if (!id) return null;
      
      const res = await apiRequest("GET", `/api/users/${id}`);
      return res.json();
    },
    enabled: !!form.watch("playerTwoId"),
  });
  
  useEffect(() => {
    if (playerTwoUserData && !playerTwoData) {
      setPlayerTwoData({
        id: playerTwoUserData.id,
        displayName: playerTwoUserData.displayName || playerTwoUserData.username,
        username: playerTwoUserData.username,
        avatarUrl: playerTwoUserData.avatarUrl || undefined,
        avatarInitials: playerTwoUserData.avatarInitials || undefined,
      });
    }
  }, [playerTwoUserData, playerTwoData]);
  
  // Get player data for player one partner when selected
  const { data: playerOnePartnerUserData } = useQuery({
    queryKey: ["/api/users", form.watch("playerOnePartnerId")],
    queryFn: async () => {
      const id = form.watch("playerOnePartnerId");
      if (!id) return null;
      
      const res = await apiRequest("GET", `/api/users/${id}`);
      return res.json();
    },
    enabled: !!form.watch("playerOnePartnerId"),
  });
  
  useEffect(() => {
    if (playerOnePartnerUserData && !playerOnePartnerData) {
      setPlayerOnePartnerData({
        id: playerOnePartnerUserData.id,
        displayName: playerOnePartnerUserData.displayName || playerOnePartnerUserData.username,
        username: playerOnePartnerUserData.username,
        avatarUrl: playerOnePartnerUserData.avatarUrl || undefined,
        avatarInitials: playerOnePartnerUserData.avatarInitials || undefined,
      });
    }
  }, [playerOnePartnerUserData, playerOnePartnerData]);
  
  // Get player data for player two partner when selected
  const { data: playerTwoPartnerUserData } = useQuery({
    queryKey: ["/api/users", form.watch("playerTwoPartnerId")],
    queryFn: async () => {
      const id = form.watch("playerTwoPartnerId");
      if (!id) return null;
      
      const res = await apiRequest("GET", `/api/users/${id}`);
      return res.json();
    },
    enabled: !!form.watch("playerTwoPartnerId"),
  });
  
  useEffect(() => {
    if (playerTwoPartnerUserData && !playerTwoPartnerData) {
      setPlayerTwoPartnerData({
        id: playerTwoPartnerUserData.id,
        displayName: playerTwoPartnerUserData.displayName || playerTwoPartnerUserData.username,
        username: playerTwoPartnerUserData.username,
        avatarUrl: playerTwoPartnerUserData.avatarUrl || undefined,
        avatarInitials: playerTwoPartnerUserData.avatarInitials || undefined,
      });
    }
  }, [playerTwoPartnerUserData, playerTwoPartnerData]);
  
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
        if (games[0].playerTwoScore > games[0].playerOneScore) {
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
      queryClient.invalidateQueries({ queryKey: ["/api/user/xp-tier"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/current-user"] });
      
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
        division: "open",
        scorePlayerOne: "0",
        scorePlayerTwo: "0",
        matchType: "casual",
        eventTier: "local",
        location: "",
        notes: "",
        gameScores: [{ playerOneScore: 0, playerTwoScore: 0 }],
      });
      
      setStep(1);
      setGames([{ playerOneScore: 0, playerTwoScore: 0 }]);
      setTotalGames(1);
      setPlayerTwoData(null);
      setPlayerOnePartnerData(null);
      setPlayerTwoPartnerData(null);
      
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

  // Navigation functions
  const nextStep = () => {
    if (step === 1) {
      // Validate players before moving to match format
      const fieldsToValidate = ["playerOneId", "playerTwoId"];
      
      if (formatType === "doubles") {
        fieldsToValidate.push("playerOnePartnerId", "playerTwoPartnerId");
      }
      
      const validationPromises = fieldsToValidate.map(field => 
        form.trigger(field as any)
      );
      
      Promise.all(validationPromises).then(results => {
        if (results.every(Boolean)) {
          setStep(2);
        }
      });
    } else if (step === 2) {
      // Validate match format before moving to score
      const fieldsToValidate = ["formatType", "scoringSystem", "pointsToWin", "division"];
      
      const validationPromises = fieldsToValidate.map(field => 
        form.trigger(field as any)
      );
      
      Promise.all(validationPromises).then(results => {
        if (results.every(Boolean)) {
          setStep(3);
        }
      });
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  // Update games when total games changes
  const handleTotalGamesChange = (newTotalGames: number) => {
    setTotalGames(newTotalGames);
    
    // Ensure we have enough game objects
    const newGames = [...games];
    while (newGames.length < newTotalGames) {
      newGames.push({ playerOneScore: 0, playerTwoScore: 0 });
    }
    
    setGames(newGames);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Step indicator */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs text-muted-foreground">
            Step {step} of 3
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`h-2 w-8 rounded-full ${
                  stepNumber === step
                    ? "bg-primary"
                    : stepNumber < step
                    ? "bg-primary/40"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Player Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Players</CardTitle>
              <CardDescription>
                Choose the format and select all players involved in the match
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Type */}
              <FormField
                control={form.control}
                name="formatType"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Match Format</FormLabel>
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

              <Separator />

              {/* Player One (Current User) */}
              <DialogPlayerSelect
                form={form}
                fieldName="playerOneId"
                label="Player 1 (You)"
                placeholder="Select a player"
                selectedPlayer={playerOneData}
                hideRemoveButton={true}
                required
              />

              {/* Player Two */}
              <DialogPlayerSelect
                form={form}
                fieldName="playerTwoId"
                label="Player 2 (Opponent)"
                placeholder="Search for your opponent"
                selectedPlayer={playerTwoData}
                excludePlayerIds={[form.watch("playerOneId")]}
                onClear={() => setPlayerTwoData(null)}
                required
              />

              {/* For Doubles: Player One Partner */}
              {formatType === "doubles" && (
                <>
                  <Separator />
                  <div className="text-sm font-medium">Team Members</div>
                  
                  <DialogPlayerSelect
                    form={form}
                    fieldName="playerOnePartnerId"
                    label="Your Partner"
                    placeholder="Search for your partner"
                    selectedPlayer={playerOnePartnerData}
                    excludePlayerIds={[form.watch("playerOneId"), form.watch("playerTwoId")]}
                    onClear={() => setPlayerOnePartnerData(null)}
                    required
                  />

                  <DialogPlayerSelect
                    form={form}
                    fieldName="playerTwoPartnerId"
                    label="Opponent's Partner"
                    placeholder="Search for opponent's partner"
                    selectedPlayer={playerTwoPartnerData}
                    excludePlayerIds={[
                      form.watch("playerOneId"),
                      form.watch("playerTwoId"),
                      ...(form.watch("playerOnePartnerId") ? [form.watch("playerOnePartnerId")] : []),
                    ]}
                    onClear={() => setPlayerTwoPartnerData(null)}
                    required
                  />
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={!form.watch("playerTwoId") || (formatType === "doubles" && (!form.watch("playerOnePartnerId") || !form.watch("playerTwoPartnerId")))}
              >
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Match Format */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Match Format</CardTitle>
              <CardDescription>
                Set the scoring system and match details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scoring System */}
              <FormField
                control={form.control}
                name="scoringSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scoring System</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scoring system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="traditional">Traditional (Side-out scoring)</SelectItem>
                        <SelectItem value="rally">Rally (Point-per-rally)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Traditional: Only the serving team can score points<br/>
                      Rally: Every rally results in a point
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Points to Win */}
              <FormField
                control={form.control}
                name="pointsToWin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points to Win</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select points needed to win" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="11">11 Points</SelectItem>
                        <SelectItem value="15">15 Points</SelectItem>
                        <SelectItem value="21">21 Points</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Standard games are played to 11 points
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Division */}
              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Division</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="19+">19+</SelectItem>
                        <SelectItem value="35+">35+</SelectItem>
                        <SelectItem value="50+">50+</SelectItem>
                        <SelectItem value="60+">60+</SelectItem>
                        <SelectItem value="70+">70+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The match will be recorded in this age division
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Match Type */}
              <FormField
                control={form.control}
                name="matchType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select match type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="casual">Casual Play</SelectItem>
                        <SelectItem value="league">League Match</SelectItem>
                        <SelectItem value="tournament">Tournament Match</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Different match types may affect ratings and XP calculations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tournament ID (only if matchType is "tournament") */}
              {form.watch("matchType") === "tournament" && (
                <FormField
                  control={form.control}
                  name="tournamentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tournament" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* This would be populated with actual tournaments */}
                          <SelectItem value="1">Local Tournament #1</SelectItem>
                          <SelectItem value="2">Regional Championship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Event Tier */}
              <FormField
                control={form.control}
                name="eventTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Tier</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Higher tier events may provide more XP and ranking points
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button 
                type="button" 
                onClick={nextStep}
              >
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 3: Score Entry */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Game Scores</CardTitle>
              <CardDescription>
                Enter the scores for each game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiGameScoreInput
                games={games}
                onChange={setGames}
                totalGames={totalGames}
                onTotalGamesChange={handleTotalGamesChange}
                playerOneName={playerOneData?.displayName || "You"}
                playerTwoName={playerTwoData?.displayName || "Opponent"}
                playerOneInitials={playerOneData?.avatarInitials}
                playerTwoInitials={playerTwoData?.avatarInitials}
                pointsToWin={form.watch("pointsToWin")}
              />

              {/* Location and Notes */}
              <div className="space-y-4 mt-8">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. City Park Courts" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Any additional notes about the match" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                Record Match
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Win by 2 alert dialog */}
        <AlertDialog open={showWinByTwoAlert} onOpenChange={setShowWinByTwoAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Win by 2 Rule
              </AlertDialogTitle>
              <AlertDialogDescription>
                In pickleball, players must win by at least 2 points. Some of your scores don't follow this rule.
                Do you want to continue anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelSubmission}>
                Go Back & Fix
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmSubmission}>
                Continue Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </Form>
  );
}