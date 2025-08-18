import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Icons
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Minus,
  Plus,
  RotateCcw,
  Trophy,
  UserCircle,
  Users,
  Zap
} from "lucide-react";

// Form schema
const matchFormSchema = z.object({
  playerOneId: z.number().int().positive().optional(),
  playerTwoId: z.number().int().positive(),
  playerOnePartnerId: z.number().int().positive().optional(),
  playerTwoPartnerId: z.number().int().positive().optional(),
  formatType: z.enum(["singles", "doubles"]).default("singles"),
  matchType: z.enum(["tournament", "league", "casual"]).default("casual"),
  notes: z.string().optional(),
  tournamentId: z.number().optional(),
  scheduledDate: z.string().optional(),
  pointsOverride: z.object({
    enabled: z.boolean().default(false),
    winnerPoints: z.number().optional(),
    loserPoints: z.number().optional(),
  }).optional(),
});

type MatchFormValues = z.infer<typeof matchFormSchema>;

interface UserSearchResult {
  id: number;
  displayName: string | null;
  username: string;
  passportId?: string | null;
  avatarUrl?: string | undefined;
  avatarInitials?: string | undefined;
  dateOfBirth?: string | null;
  gender?: string | null;
  currentRating?: number;
}

interface QuickMatchRecorderStreamlinedProps {
  onSuccess?: (data?: any) => void;
  prefilledPlayer?: {
    id: number;
    displayName: string;
    username: string;
    rating?: number;
  } | null;
  isAdminMode?: boolean;
}

export function QuickMatchRecorderStreamlined({ onSuccess, prefilledPlayer, isAdminMode = false }: QuickMatchRecorderStreamlinedProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // Match state - Streamlined contextual approach
  const [formatType, setFormatType] = useState<"singles" | "doubles">("singles");
  const matchType = "casual"; // Players can only record casual matches unless admin
  const [games, setGames] = useState<Array<{playerOneScore: number; playerTwoScore: number}>>([
    { playerOneScore: 0, playerTwoScore: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Score validation state
  const [showScoreValidation, setShowScoreValidation] = useState(false);
  const [pendingScore, setPendingScore] = useState<{
    gameIndex: number;
    playerOneScore: number;
    playerTwoScore: number;
    isUnusualScore: boolean;
  } | null>(null);

  // Player selection state
  const [playerOneData, setPlayerOneData] = useState<UserSearchResult | null>(null);
  const [playerTwoData, setPlayerTwoData] = useState<UserSearchResult | null>(null);
  const [playerOnePartnerData, setPlayerOnePartnerData] = useState<UserSearchResult | null>(null);
  const [playerTwoPartnerData, setPlayerTwoPartnerData] = useState<UserSearchResult | null>(null);

  // Player search state
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerSearchResults, setPlayerSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentOpponents, setRecentOpponents] = useState<UserSearchResult[]>([]);
  
  // Partner search states
  const [partnerOneSearch, setPartnerOneSearch] = useState("");
  const [partnerOneSearchResults, setPartnerOneSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingPartnerOne, setIsSearchingPartnerOne] = useState(false);
  
  const [partnerTwoSearch, setPartnerTwoSearch] = useState("");
  const [partnerTwoSearchResults, setPartnerTwoSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingPartnerTwo, setIsSearchingPartnerTwo] = useState(false);

  // Check if user is admin
  const isAdmin = user?.isAdmin;

  // Fetch competitions/tournaments for admin users
  const { data: tournamentsResponse } = useQuery({
    queryKey: ['/api/admin/match-management/competitions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/match-management/competitions', {
        credentials: 'include',
      });
      return response.json();
    },
    enabled: !!(isAdminMode && isAdmin),
  });
  
  const tournaments = tournamentsResponse?.data || [];

  // Admin-specific state
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [useManualPointsOverride, setUseManualPointsOverride] = useState(false);
  const [manualPointsWinner, setManualPointsWinner] = useState<number>(0);
  const [manualPointsLoser, setManualPointsLoser] = useState<number>(0);
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form setup
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      formatType: "singles",
      matchType: isAdminMode ? "tournament" : "casual",
      notes: "",
      scheduledDate: new Date().toISOString().split('T')[0],
      tournamentId: undefined,
      pointsOverride: {
        enabled: false,
        winnerPoints: undefined,
        loserPoints: undefined,
      },
    },
  });

  // Initialize player one as current user (only for non-admin users)
  useEffect(() => {
    if (user && !playerOneData && !isAdmin) {
      setPlayerOneData({
        id: user.id,
        displayName: user.displayName || null,
        username: user.username,
        passportId: user.passportCode || undefined,
        avatarUrl: user.avatarUrl || undefined,
        avatarInitials: user.avatarInitials || undefined,
        dateOfBirth: user.dateOfBirth || null,
        gender: user.gender || null,
        currentRating: user.rankingPoints || 0,
      });
    }
  }, [user, playerOneData, isAdmin]);

  // Player search function
  const searchPlayers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setPlayerSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/players/search?q=${encodeURIComponent(searchTerm)}&limit=10`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both formats: array directly or { users: [] }
        const rawResults = Array.isArray(data) ? data : (data.users || []);
        
        // Map the results to the expected format for the UI
        const results = rawResults.map((player: any) => ({
          id: player.id,
          username: player.username,
          displayName: player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim(),
          firstName: player.firstName,
          lastName: player.lastName,
          avatarInitials: player.avatarInitials || 
                         player.displayName?.substring(0, 2) || 
                         `${player.firstName?.[0] || ''}${player.lastName?.[0] || ''}` || 
                         player.username.substring(0, 2).toUpperCase(),
          passportId: player.passportCode || player.passportId,
          currentRating: player.rankingPoints || player.currentRating || 0,
          gender: player.gender,
          dateOfBirth: player.dateOfBirth,
          avatarUrl: player.profileImageUrl || player.avatarUrl
        }));
        
        setPlayerSearchResults(results);
      } else {
        console.error('Search failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Player search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Partner search functions
  const searchPartners = async (searchTerm: string, setResults: (results: UserSearchResult[]) => void, setLoading: (loading: boolean) => void) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/players/search?q=${encodeURIComponent(searchTerm)}&limit=10`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setResults(data.users || []);
      }
    } catch (error) {
      console.error('Partner search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced searches
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlayers(playerSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [playerSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPartners(partnerOneSearch, setPartnerOneSearchResults, setIsSearchingPartnerOne);
    }, 300);
    return () => clearTimeout(timer);
  }, [partnerOneSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPartners(partnerTwoSearch, setPartnerTwoSearchResults, setIsSearchingPartnerTwo);
    }, 300);
    return () => clearTimeout(timer);
  }, [partnerTwoSearch]);

  // Smart score validation - detect standard endpoints and validate unusual scores
  const isStandardEndpoint = (score1: number, score2: number): boolean => {
    const winningScore = Math.max(score1, score2);
    const losingScore = Math.min(score1, score2);
    
    // Allow any score during game play (under 11)
    if (winningScore < 11) return true;
    
    // For completed games (11+), check basic pickleball rules
    if (winningScore >= 11) {
      const scoreDifference = winningScore - losingScore;
      
      // Standard pickleball: win by 2, minimum 11 points
      // Valid: 11-0, 11-1, ..., 11-9, 12-10, 13-11, 14-12, etc.
      if (scoreDifference >= 2) return true;
      
      // Special case: 11-10 is invalid (must win by 2)
      // But we'll be very permissive and only flag truly odd scores
      // Like when winner has less than 11, or very close high scores
      if (winningScore >= 11 && scoreDifference >= 1) return true;
    }
    
    return false;
  };

  const validateAndUpdateScore = (gameIndex: number, playerOneScore: number, playerTwoScore: number) => {
    // For now, allow all scores without validation to avoid interrupting gameplay
    // Only prevent truly invalid scores (negative numbers, extreme values)
    if (playerOneScore < 0 || playerTwoScore < 0 || playerOneScore > 50 || playerTwoScore > 50) {
      return; // Don't update invalid scores
    }
    
    // Update the score immediately for all valid scenarios
    applyScoreUpdate(gameIndex, playerOneScore, playerTwoScore);
  };

  const applyScoreUpdate = (gameIndex: number, playerOneScore: number, playerTwoScore: number) => {
    const newGames = [...games];
    newGames[gameIndex] = { playerOneScore, playerTwoScore };
    setGames(newGames);
  };

  const confirmUnusualScore = () => {
    if (pendingScore) {
      applyScoreUpdate(pendingScore.gameIndex, pendingScore.playerOneScore, pendingScore.playerTwoScore);
    }
    setShowScoreValidation(false);
    setPendingScore(null);
  };

  const cancelUnusualScore = () => {
    setShowScoreValidation(false);
    setPendingScore(null);
  };

  // Add new game dynamically
  const addNewGame = () => {
    setGames([...games, { playerOneScore: 0, playerTwoScore: 0 }]);
  };

  // Remove last game
  const removeLastGame = () => {
    if (games.length > 1) {
      setGames(games.slice(0, -1));
    }
  };

  // Calculate match winner
  const calculateMatchWinner = () => {
    const playerOneWins = games.filter(game => game.playerOneScore > game.playerTwoScore).length;
    const playerTwoWins = games.filter(game => game.playerTwoScore > game.playerOneScore).length;
    
    if (playerOneWins > playerTwoWins) return 1;
    if (playerTwoWins > playerOneWins) return 2;
    return null;
  };

  // Reset form
  const resetForm = () => {
    setPlayerTwoData(null);
    setPlayerOnePartnerData(null);
    setPlayerTwoPartnerData(null);
    setFormatType("singles");
    setGames([{ playerOneScore: 0, playerTwoScore: 0 }]);
    
    // Admin users can select any players, so reset player one as well
    if (isAdmin) {
      setPlayerOneData(null);
      setSelectedTournamentId(null);
      setUseManualPointsOverride(false);
      setManualPointsWinner(0);
      setManualPointsLoser(0);
    }
    
    form.reset({
      playerTwoId: 0,
      formatType: "singles",
      notes: "",
    });
  };

  // Submit match
  const handleSubmit = async (data: MatchFormValues) => {
    if (!playerOneData) {
      toast({
        title: "Missing Player 1",
        description: isAdmin ? "Please select Player 1 for this match." : "Player 1 selection is required.",
        variant: "destructive",
      });
      return;
    }

    if (!playerTwoData) {
      toast({
        title: isAdmin ? "Missing Player 2" : "Missing Opponent",
        description: isAdmin ? "Please select Player 2 for this match." : "Please select an opponent to play against.",
        variant: "destructive",
      });
      return;
    }

    const winner = calculateMatchWinner();
    if (!winner) {
      toast({
        title: "Match Incomplete",
        description: "Please complete the match before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          playerOneId: playerOneData.id,
          playerTwoId: playerTwoData.id,
          playerOnePartnerId: playerOnePartnerData?.id,
          playerTwoPartnerId: playerTwoPartnerData?.id,
          formatType,
          matchType,
          games,
          winnerId: winner === 1 ? playerOneData.id : playerTwoData.id,
          scheduledDate: isAdminMode ? matchDate : new Date().toISOString().split('T')[0],
          // Admin-specific fields
          ...(isAdminMode && isAdmin && {
            tournamentId: selectedTournamentId,
            matchType: selectedTournamentId ? "tournament" : "casual",
            useManualPointsOverride,
            manualPointsWinner: useManualPointsOverride ? manualPointsWinner : undefined,
            manualPointsLoser: useManualPointsOverride ? manualPointsLoser : undefined,
          }),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "Match Recorded Successfully! 🏆",
        description: `Winner: ${winner === 1 ? playerOneData.displayName || playerOneData.username : playerTwoData.displayName || playerTwoData.username}`,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      
      resetForm();
      onSuccess?.(result);
      
    } catch (error) {
      console.error('Error submitting match:', error);
      toast({
        title: "Error Recording Match",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Streamlined Match Setup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Match Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Streamlined Format Selection Only */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">Match Format</Label>
            </div>
            <ToggleGroup 
              type="single" 
              value={formatType} 
              onValueChange={(value) => value && setFormatType(value as "singles" | "doubles")}
              className="justify-start w-full"
            >
              <ToggleGroupItem value="singles" className="flex items-center gap-2 px-6 py-3 flex-1">
                <UserCircle className="h-4 w-4" />
                Singles (1v1)
              </ToggleGroupItem>
              <ToggleGroupItem value="doubles" className="flex items-center gap-2 px-6 py-3 flex-1">
                <Users className="h-4 w-4" />
                Doubles (2v2)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Admin Tournament Selection */}
          {isAdminMode && isAdmin && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Tournament/Competition</Label>
                <Select 
                  value={selectedTournamentId?.toString() || "none"} 
                  onValueChange={(value) => {
                    setSelectedTournamentId(value === "none" ? null : parseInt(value));
                    // Set tournament date as default when tournament is selected
                    if (value !== "none") {
                      const tournament = tournaments.find((t: any) => t.id === parseInt(value));
                      if (tournament && tournament.startDate) {
                        setMatchDate(tournament.startDate);
                      }
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament/competition (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No tournament (casual match)</SelectItem>
                    {tournaments.map((tournament: any) => (
                      <SelectItem key={tournament.id} value={tournament.id.toString()}>
                        {tournament.name} - {tournament.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Match Date</Label>
                <Input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pointsOverride"
                    checked={useManualPointsOverride}
                    onChange={(e) => setUseManualPointsOverride(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="pointsOverride" className="text-base font-medium">
                    Override Ranking Points
                  </Label>
                </div>
                
                {useManualPointsOverride && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Winner Points</Label>
                      <Input
                        type="number"
                        placeholder="Winner points"
                        value={manualPointsWinner}
                        onChange={(e) => setManualPointsWinner(parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Loser Points</Label>
                      <Input
                        type="number"
                        placeholder="Loser points"
                        value={manualPointsLoser}
                        onChange={(e) => setManualPointsLoser(parseInt(e.target.value) || 0)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Match Type Information */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              {isAdminMode ? "Admin can record tournament matches and override points" : "Players can record casual matches only"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Unified Player Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Add Players
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatType === "singles" ? "Add 2 players for singles match" : "Add 4 players for doubles match"}
          </p>
          {formatType === "doubles" && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">📝 Doubles Pairing:</p>
              <p className="text-xs text-blue-700 mt-1">
                • <strong>Team 1:</strong> 1st and 2nd players you add<br/>
                • <strong>Team 2:</strong> 3rd and 4th players you add<br/>
                • Order matters for team assignment!
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Unified Search Interface */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Search and Add Players</Label>
              <Input
                placeholder="Search by name, username, or passport code to add players..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full"
              />
              
              {/* Add Myself Button for Admin */}
              {isAdmin && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (user) {
                      const myPlayerData = {
                        id: user.id,
                        displayName: user.displayName || null,
                        username: user.username,
                        passportId: user.passportCode || undefined,
                        avatarUrl: user.avatarUrl || undefined,
                        avatarInitials: user.avatarInitials || undefined,
                        dateOfBirth: user.dateOfBirth || null,
                        gender: user.gender || null,
                        currentRating: user.rankingPoints || 0,
                      };
                      
                      // Add myself to the first available slot
                      if (!playerOneData) {
                        setPlayerOneData(myPlayerData);
                      } else if (!playerTwoData) {
                        setPlayerTwoData(myPlayerData);
                      } else if (formatType === "doubles" && !playerOnePartnerData) {
                        setPlayerOnePartnerData(myPlayerData);
                      } else if (formatType === "doubles" && !playerTwoPartnerData) {
                        setPlayerTwoPartnerData(myPlayerData);
                      }
                    }
                  }}
                  className="w-full justify-start"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Add Myself
                </Button>
              )}
            </div>
            
            {/* Search Results */}
            {playerSearch && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-muted-foreground">
                    Searching players...
                  </div>
                ) : playerSearchResults.length > 0 ? (
                  playerSearchResults.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        // Add player to the first available slot
                        if (!playerOneData) {
                          setPlayerOneData(player);
                        } else if (!playerTwoData) {
                          setPlayerTwoData(player);
                        } else if (formatType === "doubles" && !playerOnePartnerData) {
                          setPlayerOnePartnerData(player);
                        } else if (formatType === "doubles" && !playerTwoPartnerData) {
                          setPlayerTwoPartnerData(player);
                        }
                        
                        setPlayerSearch("");
                        setPlayerSearchResults([]);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {player.avatarInitials || player.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {player.displayName || player.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{player.username} • {player.currentRating || 0} pts
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted-foreground">
                    No players found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Players Display */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Selected Players</Label>
            
            {/* Player Grid */}
            <div className="grid gap-3">
              {/* Team 1 - Player 1 (Blue) */}
              {playerOneData && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {playerOneData.avatarInitials || playerOneData.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{playerOneData.displayName || playerOneData.username}</p>
                    <p className="text-sm text-muted-foreground">
                      @{playerOneData.username} • {playerOneData.currentRating || 0} pts
                      {formatType === "doubles" && <span className="ml-2 font-semibold text-blue-600">Team 1</span>}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPlayerOneData(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              
              {/* Team 1 - Player 2 (Blue - same as Player 1) */}
              {playerTwoData && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {playerTwoData.avatarInitials || playerTwoData.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{playerTwoData.displayName || playerTwoData.username}</p>
                    <p className="text-sm text-muted-foreground">
                      @{playerTwoData.username} • {playerTwoData.currentRating || 0} pts
                      {formatType === "doubles" && <span className="ml-2 font-semibold text-blue-600">Team 1</span>}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPlayerTwoData(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}

              {/* Team 2 - Player 3 (Green - same color for team) */}
              {formatType === "doubles" && playerOnePartnerData && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {playerOnePartnerData.avatarInitials || playerOnePartnerData.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{playerOnePartnerData.displayName || playerOnePartnerData.username}</p>
                    <p className="text-sm text-muted-foreground">
                      @{playerOnePartnerData.username} • {playerOnePartnerData.currentRating || 0} pts
                      <span className="ml-2 font-semibold text-green-600">Team 2</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPlayerOnePartnerData(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}

              {/* Team 2 - Player 4 (Green - same as Player 3) */}
              {formatType === "doubles" && playerTwoPartnerData && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {playerTwoPartnerData.avatarInitials || playerTwoPartnerData.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{playerTwoPartnerData.displayName || playerTwoPartnerData.username}</p>
                    <p className="text-sm text-muted-foreground">
                      @{playerTwoPartnerData.username} • {playerTwoPartnerData.currentRating || 0} pts
                      <span className="ml-2 font-semibold text-green-600">Team 2</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPlayerTwoPartnerData(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {formatType === "singles" 
                  ? `${(playerOneData && playerTwoData) ? "Ready to play!" : `Need ${!playerOneData && !playerTwoData ? "2" : "1"} more player(s)`}`
                  : `${(playerOneData && playerTwoData && playerOnePartnerData && playerTwoPartnerData) ? "Ready to play!" : `Need ${4 - [playerOneData, playerTwoData, playerOnePartnerData, playerTwoPartnerData].filter(Boolean).length} more player(s)`}`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Score Input Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              Game Scores
            </CardTitle>
            <div className="flex items-center gap-2">
              {games.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeLastGame}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                  Remove Game
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewGame}
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
                Add Game
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Games: {games.length} • Completed: {games.filter(g => g.playerOneScore > 0 || g.playerTwoScore > 0).length}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {games.map((game, gameIndex) => {
            const isCompleted = game.playerOneScore > 0 || game.playerTwoScore > 0;
            const winner = game.playerOneScore > game.playerTwoScore ? 1 : 
                          game.playerTwoScore > game.playerOneScore ? 2 : null;
            const isStandardScore = isStandardEndpoint(game.playerOneScore, game.playerTwoScore);
            
            return (
              <div key={gameIndex} className={`border rounded-lg p-4 transition-all duration-300 ${
                isCompleted && winner ? 'bg-green-50 border-green-200' : 'border-border'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    Game {gameIndex + 1}
                    {isCompleted && winner && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {isCompleted && !isStandardScore && (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </h4>
                  {isCompleted && (
                    <span className="text-sm text-green-600 font-medium">
                      Winner: {winner === 1 ? "Player 1" : "Player 2"}
                    </span>
                  )}
                </div>
                
                {/* Score Display with Inline Editing */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${
                    winner === 1 ? 'border-green-400 bg-green-100' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="text-sm text-muted-foreground mb-1">Player 1</div>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={game.playerOneScore}
                      onChange={(e) => {
                        const newScore = parseInt(e.target.value) || 0;
                        validateAndUpdateScore(gameIndex, newScore, game.playerTwoScore);
                      }}
                      className={`text-4xl font-bold text-center border-0 bg-transparent p-0 h-auto ${
                        winner === 1 ? 'text-green-700' : 'text-foreground'
                      }`}
                      style={{ fontSize: '2.25rem', lineHeight: '2.5rem' }}
                    />
                  </div>
                  <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${
                    winner === 2 ? 'border-green-400 bg-green-100' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="text-sm text-muted-foreground mb-1">Player 2</div>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={game.playerTwoScore}
                      onChange={(e) => {
                        const newScore = parseInt(e.target.value) || 0;
                        validateAndUpdateScore(gameIndex, game.playerOneScore, newScore);
                      }}
                      className={`text-4xl font-bold text-center border-0 bg-transparent p-0 h-auto ${
                        winner === 2 ? 'text-green-700' : 'text-foreground'
                      }`}
                      style={{ fontSize: '2.25rem', lineHeight: '2.5rem' }}
                    />
                  </div>
                </div>

                {/* Score Control Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Player 1 Score</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-full"
                        onClick={() => {
                          const newScore = Math.max(0, game.playerOneScore - 1);
                          validateAndUpdateScore(gameIndex, newScore, game.playerTwoScore);
                        }}
                        disabled={game.playerOneScore <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-full"
                        onClick={() => {
                          const newScore = game.playerOneScore + 1;
                          validateAndUpdateScore(gameIndex, newScore, game.playerTwoScore);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Player 2 Score</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-full"
                        onClick={() => {
                          const newScore = Math.max(0, game.playerTwoScore - 1);
                          validateAndUpdateScore(gameIndex, game.playerOneScore, newScore);
                        }}
                        disabled={game.playerTwoScore <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-full"
                        onClick={() => {
                          const newScore = game.playerTwoScore + 1;
                          validateAndUpdateScore(gameIndex, game.playerOneScore, newScore);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Score Buttons */}
                <div className="mt-4 space-y-2">
                  <Label className="text-xs">Quick Score Entry</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { p1: 11, p2: 0, label: "11-0" },
                      { p1: 11, p2: 9, label: "11-9" },
                      { p1: 0, p2: 11, label: "0-11" },
                      { p1: 9, p2: 11, label: "9-11" },
                    ].map((score, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          validateAndUpdateScore(gameIndex, score.p1, score.p2);
                        }}
                      >
                        {score.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button 
          onClick={() => handleSubmit(form.getValues())}
          disabled={isSubmitting || !calculateMatchWinner()}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Recording Match...
            </>
          ) : (
            <>
              <Trophy className="h-4 w-4 mr-2" />
              Record Match
            </>
          )}
        </Button>
        
        <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Score Validation Dialog */}
      <Dialog open={showScoreValidation} onOpenChange={setShowScoreValidation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Unusual Score Detected
            </DialogTitle>
            <DialogDescription>
              The score {pendingScore?.playerOneScore}-{pendingScore?.playerTwoScore} doesn't match standard pickleball scoring patterns.
              Standard games typically end at 11, 15, or 21 points with a 2-point lead.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Would you like to confirm this score or go back to change it?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelUnusualScore}>
              Go Back & Change
            </Button>
            <Button onClick={confirmUnusualScore}>
              Confirm Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}