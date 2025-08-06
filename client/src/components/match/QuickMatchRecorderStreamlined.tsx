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
}

export function QuickMatchRecorderStreamlined({ onSuccess, prefilledPlayer }: QuickMatchRecorderStreamlinedProps) {
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

  // Check if user is admin
  const isAdmin = user?.isAdmin;

  // Admin-specific state
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null);
  const [useManualPointsOverride, setUseManualPointsOverride] = useState(false);
  const [manualPointsWinner, setManualPointsWinner] = useState<number>(0);
  const [manualPointsLoser, setManualPointsLoser] = useState<number>(0);

  // Form setup
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      formatType: "singles",
      matchType: "casual",
      notes: "",
    },
  });

  // Initialize player one as current user (only for non-admin users)
  useEffect(() => {
    if (user && !playerOneData && !isAdmin) {
      setPlayerOneData({
        id: user.id,
        displayName: user.displayName || undefined,
        username: user.username,
        passportId: user.passportCode || undefined,
        avatarUrl: user.avatarUrl,
        avatarInitials: user.avatarInitials,
        dateOfBirth: user.yearOfBirth ? `${user.yearOfBirth}-01-01` : null,
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
        setPlayerSearchResults(data.players || []);
      }
    } catch (error) {
      console.error('Player search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlayers(playerSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [playerSearch]);

  // Smart score validation - detect standard endpoints and validate unusual scores
  const isStandardEndpoint = (score1: number, score2: number): boolean => {
    const winningScore = Math.max(score1, score2);
    const losingScore = Math.min(score1, score2);
    
    // Standard endpoints: 11-x, 15-x, 21-x (where winner has 2+ point lead or special cases)
    if (winningScore === 11 && losingScore <= 9) return true;
    if (winningScore === 15 && losingScore <= 13) return true;
    if (winningScore === 21 && losingScore <= 19) return true;
    
    // Deuce scenarios (must win by 2)
    if (winningScore > 11 && winningScore - losingScore === 2 && losingScore >= 10) return true;
    if (winningScore > 15 && winningScore - losingScore === 2 && losingScore >= 14) return true;
    if (winningScore > 21 && winningScore - losingScore === 2 && losingScore >= 20) return true;
    
    return false;
  };

  const validateAndUpdateScore = (gameIndex: number, playerOneScore: number, playerTwoScore: number) => {
    const isUnusual = !isStandardEndpoint(playerOneScore, playerTwoScore);
    
    if (isUnusual && (playerOneScore > 0 || playerTwoScore > 0)) {
      // Show validation dialog for unusual scores
      setPendingScore({
        gameIndex,
        playerOneScore,
        playerTwoScore,
        isUnusualScore: true
      });
      setShowScoreValidation(true);
    } else {
      // Standard score - update immediately
      applyScoreUpdate(gameIndex, playerOneScore, playerTwoScore);
    }
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
      setSelectedCompetitionId(null);
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
          scheduledDate: new Date().toISOString(),
          // Admin-specific fields
          ...(isAdmin && {
            competitionId: selectedCompetitionId,
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
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-orange-500" />
            Smart Match Recorder
          </CardTitle>
          <p className="text-muted-foreground">
            {isAdmin ? "Admin Match Recording System - Smart & Contextual" : "Smart Match Recording - Add Games as You Play"}
          </p>
        </CardHeader>
      </Card>

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

          {/* Smart Scoring Information */}
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-green-600" />
              <span className="text-base font-semibold text-green-900">Smart Match Recording</span>
            </div>
            <div className="text-sm text-green-800 space-y-1">
              <div>• <strong>Dynamic Length:</strong> Add games as you play - no need to pre-select match length</div>
              <div>• <strong>Smart Scoring:</strong> Automatically detects standard endpoints (11, 15, 21 points)</div>
              <div>• <strong>Score Validation:</strong> Warns about unusual scores and asks for confirmation</div>
            </div>
          </div>

          {/* Match Type Information */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              {isAdmin ? "Admin can record tournament and casual matches" : "Players can record casual matches only"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Player Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-purple-500" />
            Player Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player One */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>
                {isAdmin ? "Player 1" : "Player 1 (You)"}
              </Label>
              {isAdmin && !playerOneData ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Search for Player 1 by name or username..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="w-full"
                  />
                  
                  {/* Player 1 Search Results */}
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
                              setPlayerOneData(player);
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
                  
                  {/* Quick Self-Select for Admin */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      if (user) {
                        setPlayerOneData({
                          id: user.id,
                          displayName: user.displayName || undefined,
                          username: user.username,
                          passportId: user.passportCode || undefined,
                          avatarUrl: user.avatarUrl,
                          avatarInitials: user.avatarInitials,
                          dateOfBirth: user.yearOfBirth ? `${user.yearOfBirth}-01-01` : null,
                          gender: user.gender || null,
                          currentRating: user.rankingPoints || 0,
                        });
                      }
                    }}
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Select Myself
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {playerOneData?.avatarInitials || user?.avatarInitials || 'P1'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {playerOneData?.displayName || user?.displayName || user?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{playerOneData?.username || user?.username} • {playerOneData?.currentRating || 0} pts
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlayerOneData(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Player 1 Partner (if doubles) */}
            {formatType === "doubles" && (
              <div className="space-y-2 ml-4 border-l-2 border-blue-200 pl-4">
                <Label className="text-sm text-muted-foreground">
                  {isAdmin ? "Player 1 Partner (Optional)" : "Your Partner (Optional)"}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Partner selection will be available soon",
                      variant: "default",
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Partner
                </Button>
              </div>
            )}
          </div>

          {/* Player Two Search */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>
                {formatType === "singles" ? (isAdmin ? "Player 2" : "Opponent") : (isAdmin ? "Player 2" : "Opponent Team Player 1")}
              </Label>
              <div className="space-y-2">
                <Input
                  placeholder={`Search for ${formatType === "singles" ? (isAdmin ? "Player 2" : "opponent") : (isAdmin ? "Player 2" : "opponent team player 1")} by name or username...`}
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full"
                />
                
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
                            setPlayerTwoData(player);
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

                {/* Selected Player Two */}
                {playerTwoData && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {playerTwoData.avatarInitials || playerTwoData.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {playerTwoData.displayName || playerTwoData.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{playerTwoData.username} • {playerTwoData.currentRating || 0} pts
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlayerTwoData(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Player 2 Partner (if doubles) */}
            {formatType === "doubles" && (
              <div className="space-y-2 ml-4 border-l-2 border-green-200 pl-4">
                <Label className="text-sm text-muted-foreground">
                  {isAdmin ? "Player 2 Partner (Optional)" : "Opponent Team Partner (Optional)"}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Partner selection will be available soon",
                      variant: "default",
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Select Partner
                </Button>
              </div>
            )}
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
                
                {/* Score Display */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${
                    winner === 1 ? 'border-green-400 bg-green-100' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="text-sm text-muted-foreground mb-1">Player 1</div>
                    <div className={`text-4xl font-bold ${winner === 1 ? 'text-green-700' : 'text-foreground'}`}>
                      {game.playerOneScore}
                    </div>
                  </div>
                  <div className={`text-center p-4 rounded-lg border-2 transition-all duration-300 ${
                    winner === 2 ? 'border-green-400 bg-green-100' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="text-sm text-muted-foreground mb-1">Player 2</div>
                    <div className={`text-4xl font-bold ${winner === 2 ? 'text-green-700' : 'text-foreground'}`}>
                      {game.playerTwoScore}
                    </div>
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