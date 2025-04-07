import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Users, UserCircle, Plus, Minus, ChevronRight, ChevronLeft, Search, X } from "lucide-react";

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
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

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
  division: z.enum(["open", "19+", "35+", "50+", "60+", "70+"]).default("open"),
  
  // Scores
  scorePlayerOne: z.string().min(1),
  scorePlayerTwo: z.string().min(1),
  gameScores: z.array(gameSchema).optional(),
  
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
});

type MatchFormValues = z.infer<typeof matchFormSchema>;
type GameValues = z.infer<typeof gameSchema>;

interface MatchRecordingFormProps {
  onSuccess?: () => void;
}

// Define a type for user search results
interface UserSearchResult {
  id: number;
  displayName: string;
  username: string;
  passportId?: string | null;
}

export function MatchRecordingForm({ onSuccess }: MatchRecordingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State for the multi-step wizard form
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [subStep, setSubStep] = useState<1 | 2 | 3 | 4>(1); // For breaking down steps into smaller parts
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGame, setCurrentGame] = useState(1);
  const [totalGames, setTotalGames] = useState(1);
  const [games, setGames] = useState<GameValues[]>([{ playerOneScore: 0, playerTwoScore: 0 }]);
  const [showWinByTwoAlert, setShowWinByTwoAlert] = useState(false);
  const [submittingData, setSubmittingData] = useState<MatchFormValues | null>(null);
  
  // State for player search
  const [searchQuery, setSearchQuery] = useState("");
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [searchingField, setSearchingField] = useState<"playerTwoId" | "playerOnePartnerId" | "playerTwoPartnerId" | null>(null);
  
  // User search query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const res = await apiRequest("GET", `/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      return data as UserSearchResult[];
    },
    enabled: searchQuery.length >= 2,
  });

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.yearOfBirth, form.watch("matchType")]);
  
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
      setSubStep(1);
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
    console.log("Form submission started with data:", data);
    
    // Validate that player IDs are not duplicated
    const players = [
      data.playerOneId, 
      data.playerTwoId, 
      data.playerOnePartnerId, 
      data.playerTwoPartnerId
    ].filter(Boolean);
    
    console.log("Players in match:", players);
    
    const uniquePlayers = new Set(players);
    if (uniquePlayers.size !== players.length) {
      console.log("Duplicate players detected");
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
    console.log("Proceeding with match submission", data);
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

  // Handlers for the wizard with sub-steps
  const goToNextStep = () => {
    if (step === 1) {
      if (subStep === 1) {
        // Validate format type 
        form.trigger("formatType").then(valid => {
          if (valid) setSubStep(2);
        });
      } else if (subStep === 2) {
        // Validate scoring system 
        form.trigger("scoringSystem").then(valid => {
          if (valid) setSubStep(3);
        });
      } else if (subStep === 3) {
        // Validate points to win
        form.trigger("pointsToWin").then(valid => {
          if (valid) setSubStep(4);
        });
      } else if (subStep === 4) {
        // Game format selection doesn't need validation
        // Move to the next main step
        setStep(2);
        setSubStep(1);
      }
    } else if (step === 2) {
      // Validate players fields
      const step2Fields = ["playerOneId", "playerTwoId"];
      
      if (formatType === "doubles") {
        step2Fields.push("playerOnePartnerId", "playerTwoPartnerId");
      }
      
      const step2Promises = step2Fields.map(field => form.trigger(field as any));
      Promise.all(step2Promises).then(results => {
        if (results.every(Boolean)) {
          setStep(3);
          setSubStep(1);
        }
      });
    } else if (step === 3 && totalGames > 1) {
      if (subStep < totalGames) {
        // Move to the next game in multi-game format
        setSubStep(subStep + 1 as 1 | 2 | 3);
        setCurrentGame(subStep + 1);
      } else {
        // Move to the match details step
        setStep(4);
        setSubStep(1);
      }
    } else if (step === 3 && totalGames === 1) {
      // Single game - move to match details
      setStep(4);
      setSubStep(1);
    }
  };

  const goToPrevStep = () => {
    if (step === 1) {
      if (subStep > 1) {
        setSubStep(subStep - 1 as 1 | 2 | 3);
      }
    } else if (step === 2) {
      setStep(1);
      setSubStep(4); // Go back to game format selection
    } else if (step === 3) {
      if (totalGames > 1 && subStep > 1) {
        // Navigate between games in multi-game format
        setSubStep(subStep - 1 as 1 | 2 | 3);
        setCurrentGame(subStep - 1);
      } else {
        setStep(2);
        setSubStep(1);
      }
    } else if (step === 4) {
      setStep(3);
      if (totalGames > 1) {
        setSubStep(totalGames as 1 | 2 | 3);
        setCurrentGame(totalGames);
      } else {
        setSubStep(1);
      }
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

  const setGameFormat = (format: "single" | "best-of-3" | "best-of-5" | "best-of-7") => {
    if (format === "single") {
      setTotalGames(1);
      setGames([games[0] || { playerOneScore: 0, playerTwoScore: 0 }]);
      setCurrentGame(1);
    } else {
      // Set the total games based on format
      const maxGames = format === "best-of-3" ? 3 : format === "best-of-5" ? 5 : 7;
      setTotalGames(maxGames);
      
      // Initialize or keep existing games
      const newGames = [...games];
      while (newGames.length < maxGames) {
        newGames.push({ playerOneScore: 0, playerTwoScore: 0 });
      }
      setGames(newGames.slice(0, maxGames));
    }
  };

  // Render the appropriate step content based on main step and sub-step
  // Handler for opening player search dialog
  const openPlayerSearch = (fieldName: "playerTwoId" | "playerOnePartnerId" | "playerTwoPartnerId") => {
    setSearchingField(fieldName);
    setSearchQuery(""); // Clear previous search
    setOpenSearchDialog(true);
  };
  
  // State to keep track of selected player information
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, UserSearchResult>>({});
  
  // Input field state variables for player search
  const [playerTwoIdInput, setPlayerTwoIdInput] = useState("");
  const [playerOnePartnerIdInput, setPlayerOnePartnerIdInput] = useState("");
  const [playerTwoPartnerIdInput, setPlayerTwoPartnerIdInput] = useState("");

  // Handler for selecting a player from search results
  const selectPlayer = (player: UserSearchResult) => {
    if (searchingField) {
      // Store the player ID in the form
      form.setValue(searchingField, player.id);
      
      // Store the player information for display purposes
      setSelectedPlayers(prev => ({
        ...prev,
        [searchingField]: player
      }));
      
      // Close the dialog and reset search state
      setOpenSearchDialog(false);
      setSearchingField(null);
      setSearchQuery("");
    }
  };
  
  const renderStepContent = () => {
    // Step 1: Match Format (broken into sub-steps)
    if (step === 1) {
      return (
        <div className="space-y-3">
          <div className="text-center mb-1">
            <h3 className="text-base font-semibold">Step 1: Match Format</h3>
            <p className="text-xs text-muted-foreground">
              {subStep === 1 && "Select singles or doubles format"}
              {subStep === 2 && "Choose scoring system"}
              {subStep === 3 && "Select points needed to win"}
              {subStep === 4 && "Choose game format"}
            </p>
          </div>
          
          {/* Step 1a - Match Format Type */}
          {subStep === 1 && (
            <FormField
              control={form.control}
              name="formatType"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm">Match Format</FormLabel>
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
                      <ToggleGroupItem value="singles" className="flex items-center justify-center gap-2 h-20">
                        <UserCircle className="h-5 w-5" />
                        <span>Singles</span>
                      </ToggleGroupItem>
                      <ToggleGroupItem value="doubles" className="flex items-center justify-center gap-2 h-20">
                        <Users className="h-5 w-5" />
                        <span>Doubles</span>
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Step 1b - Scoring System */}
          {subStep === 2 && (
            <FormField
              control={form.control}
              name="scoringSystem"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm">Scoring System</FormLabel>
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
                      <ToggleGroupItem value="traditional" className="h-20">
                        <div className="flex flex-col items-center justify-center">
                          <span>Traditional</span>
                          <span className="text-xs text-muted-foreground">Server scores only</span>
                        </div>
                      </ToggleGroupItem>
                      <ToggleGroupItem value="rally" className="h-20">
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
          )}
          
          {/* Step 1c - Points to Win */}
          {subStep === 3 && (
            <FormField
              control={form.control}
              name="pointsToWin"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm">Points to Win</FormLabel>
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
                      <ToggleGroupItem value="11" className="h-20">11</ToggleGroupItem>
                      <ToggleGroupItem value="15" className="h-20">15</ToggleGroupItem>
                      <ToggleGroupItem value="21" className="h-20">21</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* Step 1d - Game Format */}
          {subStep === 4 && (
            <div className="space-y-1">
              <FormLabel className="text-sm">Game Format</FormLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                className="grid grid-cols-2 gap-1 justify-stretch"
                value={
                  totalGames === 1 ? "single" : 
                  totalGames === 3 ? "best-of-3" : 
                  totalGames === 5 ? "best-of-5" : "best-of-7"
                }
                onValueChange={(value) => {
                  if (value) setGameFormat(value as "single" | "best-of-3" | "best-of-5" | "best-of-7");
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
                <ToggleGroupItem value="best-of-5" className="h-16">
                  <div className="flex flex-col items-center justify-center">
                    <span>Best of 5</span>
                    <span className="text-xs text-muted-foreground">First to 3 wins</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem value="best-of-7" className="h-16">
                  <div className="flex flex-col items-center justify-center">
                    <span>Best of 7</span>
                    <span className="text-xs text-muted-foreground">First to 4 wins</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
        </div>
      );
    }
    
    // Step 2: Players
    else if (step === 2) {
      return (
        <div className="space-y-3">
          <div className="text-center mb-2">
            <h3 className="text-base font-semibold">Step 2: Players</h3>
            <p className="text-xs text-muted-foreground">
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
                <FormLabel className="text-sm">Your Player Information</FormLabel>
                <FormControl>
                  <div className="flex items-center border rounded-md bg-muted/20 p-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                      {user?.avatarInitials || user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user?.displayName || user?.username}</div>
                      <div className="text-xs text-muted-foreground">ID: #{user?.id} {user?.passportId && `• Passport: ${user?.passportId}`}</div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Player One Partner ID (Doubles only) - Simplified Implementation */}
          {formatType === "doubles" && (
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">
                  Your Partner's Information
                </label>
              </div>
              
              <div className="flex space-x-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your partner's ID or name"
                  value={playerOnePartnerIdInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPlayerOnePartnerIdInput(value);
                    if (value === "") {
                      form.setValue("playerOnePartnerId", 0);
                      // Clear selected player when field is emptied
                      if (selectedPlayers.playerOnePartnerId) {
                        setSelectedPlayers(prev => {
                          const newState = {...prev};
                          delete newState.playerOnePartnerId;
                          return newState;
                        });
                      }
                    } else if (!isNaN(Number(value))) {
                      form.setValue("playerOnePartnerId", parseInt(value));
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openPlayerSearch("playerOnePartnerId")}
                  className="px-3"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedPlayers.playerOnePartnerId && (
                <div className="flex items-center border rounded-md bg-muted/20 p-2 relative">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                    {selectedPlayers.playerOnePartnerId.displayName?.charAt(0) || selectedPlayers.playerOnePartnerId.username?.charAt(0) || 'P'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{selectedPlayers.playerOnePartnerId.displayName || selectedPlayers.playerOnePartnerId.username}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: #{selectedPlayers.playerOnePartnerId.id} 
                      {selectedPlayers.playerOnePartnerId.passportId && ` • Passport: ${selectedPlayers.playerOnePartnerId.passportId}`}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setPlayerOnePartnerIdInput("");
                      form.setValue("playerOnePartnerId", 0);
                      setSelectedPlayers(prev => {
                        const newState = {...prev};
                        delete newState.playerOnePartnerId;
                        return newState;
                      });
                    }}
                    className="h-6 w-6 p-0 absolute top-1 right-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Enter player ID or search by name/passport ID
              </div>
              {form.formState.errors.playerOnePartnerId && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.playerOnePartnerId.message}</p>
              )}
            </div>
          )}
          
          {/* Player Two ID (Opponent) - Simplified Implementation */}
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">
                {formatType === "singles" ? "Opponent Information" : "Opponent 1 Information"}
              </label>
            </div>
            
            <div className="flex space-x-2">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={`Enter ${formatType === "singles" ? "opponent's" : "opponent 1's"} ID or name`}
                value={playerTwoIdInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlayerTwoIdInput(value);
                  if (value === "") {
                    form.setValue("playerTwoId", 0);
                    // Clear selected player when field is emptied
                    if (selectedPlayers.playerTwoId) {
                      setSelectedPlayers(prev => {
                        const newState = {...prev};
                        delete newState.playerTwoId;
                        return newState;
                      });
                    }
                  } else if (!isNaN(Number(value))) {
                    form.setValue("playerTwoId", parseInt(value));
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => openPlayerSearch("playerTwoId")}
                className="px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedPlayers.playerTwoId && (
              <div className="flex items-center border rounded-md bg-muted/20 p-2 relative">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                  {selectedPlayers.playerTwoId.displayName?.charAt(0) || selectedPlayers.playerTwoId.username?.charAt(0) || 'O'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{selectedPlayers.playerTwoId.displayName || selectedPlayers.playerTwoId.username}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: #{selectedPlayers.playerTwoId.id} 
                    {selectedPlayers.playerTwoId.passportId && ` • Passport: ${selectedPlayers.playerTwoId.passportId}`}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPlayerTwoIdInput("");
                    form.setValue("playerTwoId", 0);
                    setSelectedPlayers(prev => {
                      const newState = {...prev};
                      delete newState.playerTwoId;
                      return newState;
                    });
                  }}
                  className="h-6 w-6 p-0 absolute top-1 right-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Enter player ID or search by name/passport ID
            </div>
            {form.formState.errors.playerTwoId && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.playerTwoId.message}</p>
            )}
          </div>
          
          {/* Player Two Partner ID (Doubles only) - Simplified Implementation */}
          {formatType === "doubles" && (
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">
                  Opponent 2 Information
                </label>
              </div>
              
              <div className="flex space-x-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter opponent 2's ID or name"
                  value={playerTwoPartnerIdInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPlayerTwoPartnerIdInput(value);
                    if (value === "") {
                      form.setValue("playerTwoPartnerId", 0);
                      // Clear selected player when field is emptied
                      if (selectedPlayers.playerTwoPartnerId) {
                        setSelectedPlayers(prev => {
                          const newState = {...prev};
                          delete newState.playerTwoPartnerId;
                          return newState;
                        });
                      }
                    } else if (!isNaN(Number(value))) {
                      form.setValue("playerTwoPartnerId", parseInt(value));
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openPlayerSearch("playerTwoPartnerId")}
                  className="px-3"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedPlayers.playerTwoPartnerId && (
                <div className="flex items-center border rounded-md bg-muted/20 p-2 relative">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                    {selectedPlayers.playerTwoPartnerId.displayName?.charAt(0) || selectedPlayers.playerTwoPartnerId.username?.charAt(0) || 'O'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{selectedPlayers.playerTwoPartnerId.displayName || selectedPlayers.playerTwoPartnerId.username}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: #{selectedPlayers.playerTwoPartnerId.id} 
                      {selectedPlayers.playerTwoPartnerId.passportId && ` • Passport: ${selectedPlayers.playerTwoPartnerId.passportId}`}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setPlayerTwoPartnerIdInput("");
                      form.setValue("playerTwoPartnerId", 0);
                      setSelectedPlayers(prev => {
                        const newState = {...prev};
                        delete newState.playerTwoPartnerId;
                        return newState;
                      });
                    }}
                    className="h-6 w-6 p-0 absolute top-1 right-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Enter player ID or search by name/passport ID
              </div>
              {form.formState.errors.playerTwoPartnerId && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.playerTwoPartnerId.message}</p>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Step 3: Scores
    else if (step === 3) {
      return (
        <div className="space-y-3">
          <div className="text-center mb-2">
            <h3 className="text-base font-semibold">Step 3: Score</h3>
            <p className="text-xs text-muted-foreground">
              Record the final score
            </p>
          </div>
          
          {/* For multi-game matches, display current game based on subStep */}
          {totalGames > 1 ? (
            <div>
              <div className="text-center mb-2">
                <h4 className="text-sm font-medium">Game {subStep} of {totalGames}</h4>
              </div>
              <ScoreCard
                gameNumber={subStep}
                playerOneName={user?.displayName || "You"}
                playerTwoName="Opponent"
                playerOneScore={games[subStep - 1]?.playerOneScore || 0}
                playerTwoScore={games[subStep - 1]?.playerTwoScore || 0}
                onScoreChange={(player, operation) => updateGameScore(player, operation)}
                pointsToWin={pointsToWin}
              />
            </div>
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
        </div>
      );
    }
    
    // Step 4: Match Details 
    else if (step === 4) {
      return (
        <div className="space-y-3">
          <div className="text-center mb-2">
            <h3 className="text-base font-semibold">Step 4: Match Details</h3>
            <p className="text-xs text-muted-foreground">
              Add match information
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Match Type */}
            <FormField
              control={form.control}
              name="matchType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Match Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select match type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">Casual Match</SelectItem>
                        {user?.isAdmin && (
                          <>
                            <SelectItem value="league">League Match</SelectItem>
                            <SelectItem value="tournament">Tournament Match</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Tier - Always visible as the event context matters */}
            <FormField
              control={form.control}
              name="eventTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Event Level</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Higher level events earn more points
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Tournament fields - Only shown for tournament match type */}
            {form.watch("matchType") === "tournament" && (
              <>
                <FormField
                  control={form.control}
                  name="tournamentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Tournament ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tournament ID"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="roundNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Round Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter round number (1=final, 2=semis, etc.)"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          type="number"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Lower numbers are later rounds (1=final, 2=semis, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Bracket Stage</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bracket stage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qualifying">Qualifying</SelectItem>
                            <SelectItem value="main">Main Bracket</SelectItem>
                            <SelectItem value="consolation">Consolation Bracket</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {/* Age Division */}
            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Age Division</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age division" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open (All Ages)</SelectItem>
                        <SelectItem value="19+">19+</SelectItem>
                        <SelectItem value="35+">35+</SelectItem>
                        <SelectItem value="50+">50+</SelectItem>
                        <SelectItem value="60+">60+</SelectItem>
                        <SelectItem value="70+">70+</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Location (Optional)</FormLabel>
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
                  <FormLabel className="text-sm">Notes (Optional)</FormLabel>
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
    
    return null;
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {renderStepContent()}
          
          {/* Player Search Dialog */}
          <Dialog open={openSearchDialog} onOpenChange={setOpenSearchDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Search Player</DialogTitle>
                <DialogDescription>
                  Search for a player by name or passport ID
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Input
                    className="pr-10"
                    placeholder="Search by name or passport ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {isSearching ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {searchResults.map((player) => (
                            <CommandItem 
                              key={player.id}
                              onSelect={() => selectPlayer(player)}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{player.displayName}</p>
                                <p className="text-xs text-muted-foreground">
                                  #{player.id} {player.passportId && `• Passport: ${player.passportId}`}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  ) : searchQuery.length >= 2 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      No players found
                    </div>
                  ) : (
                    <div className="py-6 text-center text-muted-foreground">
                      Enter at least 2 characters to search
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenSearchDialog(false)}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="flex justify-between pt-2 mt-2">
            {/* Back Button - Show when not on first sub-step */}
            {(step > 1 || subStep > 1) ? (
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
            
            {/* Next Button - Hide on final step */}
            {step < 4 ? (
              <Button 
                type="button" 
                onClick={goToNextStep}
                className="flex items-center h-10 px-3 sm:px-4"
                size="sm"
              >
                {step === 3 && (totalGames === 1 || subStep === totalGames) 
                  ? "Continue" 
                  : "Next"} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={() => console.log("Submit button clicked")}
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