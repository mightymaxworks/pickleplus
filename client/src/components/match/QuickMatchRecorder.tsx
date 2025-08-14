import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { matchSDK } from "@/lib/sdk/matchSDK";
import { useLocation } from "wouter";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Users, 
  UserCircle, 
  Trophy, 
  Clock, 
  MapPin, 
  Settings, 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Target,
  Award,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Info,
  Search,
  CheckCircle2,
  Loader2,
  Timer,
  TrendingUp
} from "lucide-react";

// Import existing components
import { Form } from "@/components/ui/form";
import { SmartPlayerSearch } from "./SmartPlayerSearch";

// Age multiplier constants - FINALIZED ALGORITHM (Option B - Open Age Group)
const AGE_MULTIPLIERS = {
  '18-34': 1.0,
  '35-49': 1.2,
  '50-59': 1.3,
  '60-69': 1.5,
  '70+': 1.6
};

// Automatic age group detection - FINALIZED ALGORITHM 
const getAgeGroup = (dateOfBirth: string): string => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust for birthday not yet passed this year
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
  
  if (actualAge >= 70) return '70+';
  if (actualAge >= 60) return '60-69';
  if (actualAge >= 50) return '50-59';
  if (actualAge >= 35) return '35-49';
  return '18-34';
};

// Calculate age multiplier automatically from player data
// FINALIZED ALGORITHM - Age multiplier calculation (Option B - Open Age Group)
const calculateAgeMultiplier = (playerOneData: any, playerTwoData: any): number => {
  const ages = [];
  
  if (playerOneData?.dateOfBirth) {
    const ageGroup = getAgeGroup(playerOneData.dateOfBirth);
    ages.push(AGE_MULTIPLIERS[ageGroup as keyof typeof AGE_MULTIPLIERS]);
  }
  
  if (playerTwoData?.dateOfBirth) {
    const ageGroup = getAgeGroup(playerTwoData.dateOfBirth);
    ages.push(AGE_MULTIPLIERS[ageGroup as keyof typeof AGE_MULTIPLIERS]);
  }
  
  // Use average multiplier of all players for dual ranking system
  return ages.length > 0 ? ages.reduce((sum, mult) => sum + mult, 0) / ages.length : 1.0;
};

// Enhanced OpponentSelector Component with Real Database Integration
const OpponentSelector = ({ onSelectOpponent, recentOpponents, placeholder = "Search by username or passport code..." }: { 
  onSelectOpponent: (opponent: any) => void, 
  recentOpponents: any[],
  placeholder?: string
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRecent, setShowRecent] = useState(true);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 0) {
      setIsSearching(true);
      setShowRecent(false);
      
      try {
        // Enhanced search: username, display name, and passport code (not PKL prefixed)
        const response = await fetch(`/api/players/search?q=${encodeURIComponent(term)}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.users || []);
        } else {
          // Fallback to mock data for development
          const mockResults = [
            { id: 100, displayName: 'Test Player', username: 'testplayer', avatarInitials: 'TP', passportId: 'HVGN0BW0' },
            { id: 101, displayName: 'Demo User', username: 'demouser', avatarInitials: 'DU', passportId: 'KGLE38K4' }
          ].filter(user => 
            user.username.toLowerCase().includes(term.toLowerCase()) ||
            user.displayName.toLowerCase().includes(term.toLowerCase()) ||
            (user.passportId && user.passportId.toLowerCase().includes(term.toLowerCase()))
          );
          setSearchResults(mockResults);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
      
      setIsSearching(false);
    } else {
      setShowRecent(true);
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Search Results or Recent Opponents */}
      {showRecent ? (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Recent opponents:</p>
          <div className="grid gap-2">
            {recentOpponents.map((opponent) => (
              <Button
                key={opponent.id}
                variant="outline"
                onClick={() => onSelectOpponent(opponent)}
                className="justify-start h-auto p-3"
              >
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback>{opponent.avatarInitials}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">{opponent.displayName}</p>
                  <p className="text-xs text-muted-foreground">@{opponent.username}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {isSearching ? (
            <p className="text-sm text-muted-foreground p-4 text-center">Searching...</p>
          ) : searchResults.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Found {searchResults.length} player{searchResults.length !== 1 ? 's' : ''}:
              </p>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {searchResults.map((player) => (
                  <Button
                    key={player.id}
                    variant="outline"
                    onClick={() => onSelectOpponent(player)}
                    className="justify-start h-auto p-3"
                  >
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback>{player.avatarInitials || player.displayName?.substring(0, 2) || player.username.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{player.displayName || player.username}</p>
                      <p className="text-xs text-muted-foreground">
                        @{player.username}
                        {player.currentRating && ` • ${player.currentRating} pts`}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No players found. Try a different search term.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Match form schema
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

// User search result interface
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

interface QuickMatchRecorderProps {
  onSuccess?: (data?: any) => void;
  prefilledPlayer?: {
    id: number;
    displayName: string;
    username: string;
    rating?: number;
  } | null;
}

export function QuickMatchRecorder({ onSuccess, prefilledPlayer }: QuickMatchRecorderProps) {
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
  
  // Pickleball standard game scoring
  const pointsToWin = 11;
  const totalGames = formatType === "singles" ? 3 : 3; // Best of 3 games standard
  
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
  
  // Recent opponents state - loaded from API
  const [recentOpponents, setRecentOpponents] = useState<UserSearchResult[]>([]);
  
  // Check if user is admin
  const isAdmin = user?.isAdmin;

  // Admin-specific state for competition linking and manual points
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null);
  const [useManualPointsOverride, setUseManualPointsOverride] = useState(false);
  const [manualPointsWinner, setManualPointsWinner] = useState<number>(0);
  const [manualPointsLoser, setManualPointsLoser] = useState<number>(0);
  
  // Mock competitions data (in real app this would come from API)
  const [competitions] = useState([
    { id: 1, name: "Summer Championship 2025", type: "tournament", pointsMultiplier: 2.0, venue: "Central Courts" },
    { id: 2, name: "Weekly League", type: "league", pointsMultiplier: 1.5, venue: "Local Club" },
    { id: 3, name: "Masters Tournament", type: "tournament", pointsMultiplier: 3.0, venue: "Elite Center" }
  ]);

  // Load recent opponents from API
  useEffect(() => {
    const loadRecentOpponents = async () => {
      try {
        const response = await fetch('/api/players/recent-opponents', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setRecentOpponents(data.opponents || []);
        }
      } catch (error) {
        console.error('Failed to load recent opponents:', error);
        // Use empty array if API fails
        setRecentOpponents([]);
      }
    };

    if (user) {
      loadRecentOpponents();
    }
  }, [user]);

  // Initialize player one data based on admin status
  const initialPlayerOneData = user && !isAdmin ? {
    id: user.id,
    displayName: user.displayName || user.username,
    username: user.username,
    avatarInitials: user.avatarInitials || undefined,
  } : null;

  // Initialize player one data on component mount
  useEffect(() => {
    if (!isAdmin && user) {
      setPlayerOneData(initialPlayerOneData);
    }
    if (prefilledPlayer) {
      setPlayerTwoData(prefilledPlayer);
    }
  }, [user, isAdmin, prefilledPlayer]);
  
  // Initialize form
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchFormSchema),
    defaultValues: {
      playerTwoId: 0,
      formatType: "singles",
    },
  });

  // Game score management functions
  const updateGameScore = (gameIndex: number, player: 'playerOne' | 'playerTwo', newScore: number) => {
    setGames(prevGames => 
      prevGames.map((game, index) => 
        index === gameIndex 
          ? { ...game, [player === 'playerOne' ? 'playerOneScore' : 'playerTwoScore']: newScore }
          : game
      )
    );
  };

  // Check if all games are complete
  const isAllGamesComplete = games.every(game => 
    game.playerOneScore >= pointsToWin || game.playerTwoScore >= pointsToWin
  );

  // Handle match submission
  const handleSubmitMatch = () => {
    if (!isAllGamesComplete) {
      toast({
        title: "Match Incomplete",
        description: "Please complete all games before submitting",
        variant: "destructive",
      });
      return;
    }
    handleSubmit(form.getValues());
  };

  // Calculate match winner based on games
  const calculateMatchWinner = (): 1 | 2 | null => {
    const playerOneWins = games.filter(game => game.playerOneScore > game.playerTwoScore).length;
    const playerTwoWins = games.filter(game => game.playerTwoScore > game.playerOneScore).length;
    
    const requiredWins = Math.ceil(totalGames / 2);
    
    if (playerOneWins >= requiredWins) return 1;
    if (playerTwoWins >= requiredWins) return 2;
    return null;
  };

  // Submit match
  const handleSubmit = async (values: MatchFormValues) => {
    const winner = calculateMatchWinner();
    if (!winner) {
      toast({
        title: "Incomplete Match",
        description: "Please complete all games before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!playerOneData || !playerTwoData) {
      toast({
        title: "Missing Players",
        description: "Please select both players",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const matchData = {
        playerOneId: playerOneData.id,
        playerTwoId: playerTwoData.id,
        playerOnePartnerId: formatType === "doubles" ? playerOnePartnerData?.id : null,
        playerTwoPartnerId: formatType === "doubles" ? playerTwoPartnerData?.id : null,
        formatType,
        matchType: isAdmin ? (selectedCompetitionId ? "tournament" : "casual") : "casual",
        competitionId: selectedCompetitionId,
        winnerId: winner === 1 ? playerOneData.id : playerTwoData.id,
        scoringSystem: "traditional" as const,
        pointsToWin,
        players: [
          {
            userId: playerOneData.id,
            score: games.reduce((total, game) => total + game.playerOneScore, 0),
            isWinner: winner === 1
          },
          {
            userId: playerTwoData.id,
            score: games.reduce((total, game) => total + game.playerTwoScore, 0),
            isWinner: winner === 2
          }
        ],
        gameScores: games.map((game, index) => ({
          gameNumber: index + 1,
          playerOneScore: game.playerOneScore,
          playerTwoScore: game.playerTwoScore,
          winnerId: game.playerOneScore > game.playerTwoScore ? playerOneData.id : playerTwoData.id
        })),
        games: games.map((game, index) => ({
          gameNumber: index + 1,
          playerOneScore: game.playerOneScore,
          playerTwoScore: game.playerTwoScore,
          winnerId: game.playerOneScore > game.playerTwoScore ? playerOneData.id : playerTwoData.id
        })),
        ageMultiplier: calculateAgeMultiplier(playerOneData, playerTwoData),
        notes: values.notes,
        // Admin manual points override
        manualPoints: useManualPointsOverride ? {
          winnerId: winner === 1 ? playerOneData.id : playerTwoData.id,
          winnerPoints: winner === 1 ? manualPointsWinner : manualPointsLoser,
          loserPoints: winner === 1 ? manualPointsLoser : manualPointsWinner,
        } : undefined,
      };

      const result = await matchSDK.recordMatch(matchData);

      toast({
        title: "Match Recorded!",
        description: `Match between ${playerOneData.displayName || playerOneData.username} and ${playerTwoData.displayName || playerTwoData.username} recorded successfully`,
        variant: "default",
      });

      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players/recent-opponents'] });

      // Reset form
      resetForm();

      // Call success callback
      onSuccess?.(result);

    } catch (error) {
      console.error('Match submission error:', error);
      toast({
        title: "Error",
        description: "Failed to record match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Reset form to initial state
  const resetForm = () => {
    setPlayerTwoData(null);
    setPlayerOnePartnerData(null);
    setPlayerTwoPartnerData(null);
    setFormatType("singles");
    setGames([{ playerOneScore: 0, playerTwoScore: 0 }]);
    
    // Reset admin-specific fields
    if (isAdmin) {
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-orange-500" />
            Enhanced Match Recorder
          </CardTitle>
          <p className="text-muted-foreground">
            {isAdmin ? "Admin Match Recording System - Smart & Contextual" : "Smart Match Recording - Add Games as You Play"}
          </p>
        </CardHeader>
      </Card>

      {/* Match Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
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
            <UserCircle className="h-5 w-5 text-blue-500" />
            Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player One */}
          <div className="space-y-2">
            <Label>Player One {!isAdmin && "(You)"}</Label>
            {playerOneData ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{playerOneData.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{playerOneData.displayName || playerOneData.username}</p>
                    <p className="text-sm text-muted-foreground">@{playerOneData.username}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    toast({
                      title: "Feature Coming Soon",
                      description: "Admin player selection will be available soon",
                      variant: "default",
                    });
                  }}>
                    Change
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {isAdmin ? (
                  <SmartPlayerSearch
                    label=""
                    placeholder="Search for Player One by name or passport code..."
                    selectedPlayer={null}
                    onPlayerSelect={(player) => {
                      if (player) {
                        setPlayerOneData({
                          id: player.id,
                          username: player.username,
                          displayName: player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.username,
                          avatarInitials: (player.displayName || player.username).charAt(0).toUpperCase()
                        });
                      }
                    }}
                    excludePlayerIds={[playerTwoData?.id].filter(Boolean)}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground p-3 border rounded-lg">
                    Loading your profile...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Player Two (Opponent) */}
          <div className="space-y-2">
            <Label>Player Two (Opponent)</Label>
            {playerTwoData ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{playerTwoData.avatarInitials || playerTwoData.displayName?.substring(0, 2) || playerTwoData.username.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{playerTwoData.displayName || playerTwoData.username}</p>
                    <p className="text-sm text-muted-foreground">@{playerTwoData.username}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPlayerTwoData(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <SmartPlayerSearch
                label=""
                placeholder="Search for Player Two by name or passport code..."
                selectedPlayer={null}
                onPlayerSelect={(player) => {
                  if (player) {
                    setPlayerTwoData({
                      id: player.id,
                      username: player.username,
                      displayName: player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.username,
                      avatarInitials: (player.displayName || player.username).charAt(0).toUpperCase()
                    });
                  }
                }}
                excludePlayerIds={[playerOneData?.id].filter(Boolean)}
              />
            )}
          </div>

          {/* Enhanced Doubles Team Selection */}
          {formatType === "doubles" && (
            <>
              <Separator />
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <h4 className="font-medium text-lg">Team Setup</h4>
                  <Badge variant="secondary" className="ml-2">Doubles 2v2</Badge>
                </div>
                
                {/* Team 1 (Blue Team) */}
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <Label className="text-base font-semibold text-blue-900">Team 1 (Blue)</Label>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Team 1 Player 1 */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {playerOneData?.avatarInitials || 'P1'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{playerOneData?.displayName || playerOneData?.username || 'Player 1'}</p>
                        <p className="text-sm text-muted-foreground">
                          @{playerOneData?.username || 'Select player'}
                        </p>
                      </div>
                      <Badge variant="outline">Player</Badge>
                    </div>
                    
                    {/* Team 1 Partner */}
                    {playerOnePartnerData ? (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {playerOnePartnerData.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{playerOnePartnerData.displayName || playerOnePartnerData.username}</p>
                          <p className="text-sm text-muted-foreground">@{playerOnePartnerData.username}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setPlayerOnePartnerData(null)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <SmartPlayerSearch
                        label=""
                        placeholder="Search for Team 1 partner by name or passport code..."
                        selectedPlayer={null}
                        onPlayerSelect={(player) => {
                          if (player) {
                            setPlayerOnePartnerData({
                              id: player.id,
                              username: player.username,
                              displayName: player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.username,
                              avatarInitials: (player.displayName || player.username).charAt(0).toUpperCase()
                            });
                          }
                        }}
                        excludePlayerIds={[
                          playerOneData?.id,
                          playerTwoData?.id,
                          playerTwoPartnerData?.id
                        ].filter(Boolean)}
                      />
                    )}
                  </div>
                </div>

                {/* Team 2 (Purple Team) */}
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <Label className="text-base font-semibold text-purple-900">Team 2 (Purple)</Label>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Team 2 Player 1 */}
                    {playerTwoData ? (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {playerTwoData.avatarInitials || playerTwoData.displayName?.substring(0, 2) || playerTwoData.username.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{playerTwoData.displayName || playerTwoData.username}</p>
                          <p className="text-sm text-muted-foreground">@{playerTwoData.username}</p>
                        </div>
                        <Badge variant="outline">Player</Badge>
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-lg border border-purple-200 border-dashed">
                        <p className="text-sm text-muted-foreground text-center">
                          Please select Player Two first
                        </p>
                      </div>
                    )}
                    
                    {/* Team 2 Partner */}
                    {playerTwoData && (playerTwoPartnerData ? (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {playerTwoPartnerData.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{playerTwoPartnerData.displayName || playerTwoPartnerData.username}</p>
                          <p className="text-sm text-muted-foreground">@{playerTwoPartnerData.username}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setPlayerTwoPartnerData(null)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <SmartPlayerSearch
                        label=""
                        placeholder="Search for Team 2 partner by name or passport code..."
                        selectedPlayer={null}
                        onPlayerSelect={(player) => {
                          if (player) {
                            setPlayerTwoPartnerData({
                              id: player.id,
                              username: player.username,
                              displayName: player.displayName || `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.username,
                              avatarInitials: (player.displayName || player.username).charAt(0).toUpperCase()
                            });
                          }
                        }}
                        excludePlayerIds={[
                          playerOneData?.id,
                          playerTwoData?.id,
                          playerOnePartnerData?.id
                        ].filter(Boolean)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Competition Selection for Admin */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Competition Linking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Link to Competition (Optional)</Label>
              <Select 
                value={selectedCompetitionId?.toString() || ''} 
                onValueChange={(value) => setSelectedCompetitionId(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competition (casual match if none selected)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Competition (Casual Match)</SelectItem>
                  {competitions.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id.toString()}>
                      {comp.name} ({comp.type} • {comp.pointsMultiplier}x points)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Manual Points Override */}
            <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-yellow-600" />
                <Label className="text-sm font-medium">Admin Points Override</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manualPoints"
                  checked={useManualPointsOverride}
                  onChange={(e) => setUseManualPointsOverride(e.target.checked)}
                />
                <label htmlFor="manualPoints" className="text-sm text-yellow-800">
                  Use manual point allocation instead of automatic calculation
                </label>
              </div>

              {useManualPointsOverride && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-xs">Winner Points</Label>
                    <Input
                      type="number"
                      value={manualPointsWinner}
                      onChange={(e) => setManualPointsWinner(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Loser Points</Label>
                    <Input
                      type="number"
                      value={manualPointsLoser}
                      onChange={(e) => setManualPointsLoser(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Scores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Game Scores
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              {(() => {
                const completedGames = games.filter(game => 
                  game.playerOneScore >= pointsToWin || game.playerTwoScore >= pointsToWin
                ).length;
                return `${completedGames}/${totalGames} Games`;
              })()}
            </div>
          </CardTitle>
          {/* Match Progress Bar */}
          <Progress 
            value={(games.filter(game => 
              game.playerOneScore >= pointsToWin || game.playerTwoScore >= pointsToWin
            ).length / totalGames) * 100} 
            className="w-full h-2 mt-2"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {games.map((game, index) => {
            const isGameComplete = game.playerOneScore >= pointsToWin || game.playerTwoScore >= pointsToWin;
            const gameWinner = game.playerOneScore > game.playerTwoScore ? 1 : 
                             game.playerTwoScore > game.playerOneScore ? 2 : null;
            
            return (
              <div key={index} className={`space-y-4 p-4 rounded-xl border transition-all duration-200 ${
                isGameComplete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    Game {index + 1}
                    {isGameComplete && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </h4>
                  <Badge variant={isGameComplete ? "default" : "outline"} className="text-xs">
                    {formatType === "singles" ? (
                      gameWinner === 1 
                        ? `${playerOneData?.displayName || playerOneData?.username || 'Player 1'} wins`
                        : gameWinner === 2
                        ? `${playerTwoData?.displayName || playerTwoData?.username || 'Player 2'} wins`
                        : 'In Progress'
                    ) : (
                      gameWinner === 1 
                        ? 'Team 1 (Blue) wins'
                        : gameWinner === 2
                        ? 'Team 2 (Purple) wins'
                        : 'In Progress'
                    )}
                  </Badge>
                </div>
                {/* Score Input */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {formatType === "singles" ? 
                        `${playerOneData?.displayName || playerOneData?.username || 'Player 1'}` :
                        'Team 1 (Blue)'
                      } Score
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGameScore(index, 'playerOne', Math.max(0, game.playerOneScore - 1))}
                        disabled={game.playerOneScore <= 0 || isGameComplete}
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center font-mono text-lg font-bold bg-blue-50 py-2 rounded border">
                        {game.playerOneScore}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGameScore(index, 'playerOne', game.playerOneScore + 1)}
                        disabled={isGameComplete}
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {formatType === "singles" ? 
                        `${playerTwoData?.displayName || playerTwoData?.username || 'Player 2'}` :
                        'Team 2 (Purple)'
                      } Score
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGameScore(index, 'playerTwo', Math.max(0, game.playerTwoScore - 1))}
                        disabled={game.playerTwoScore <= 0 || isGameComplete}
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center font-mono text-lg font-bold bg-purple-50 py-2 rounded border">
                        {game.playerTwoScore}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGameScore(index, 'playerTwo', game.playerTwoScore + 1)}
                        disabled={isGameComplete}
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Match Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Match Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-2xl font-bold mb-2">
              Match {(() => {
                const gamesWonByPlayerOne = games.filter(game => game.playerOneScore > game.playerTwoScore).length;
                const gamesWonByPlayerTwo = games.filter(game => game.playerTwoScore > game.playerOneScore).length;
                return `${gamesWonByPlayerOne}-${gamesWonByPlayerTwo}`;
              })()}
            </div>
            <p className="text-muted-foreground">
              {(() => {
                const gamesWonByPlayerOne = games.filter(game => game.playerOneScore > game.playerTwoScore).length;
                const gamesWonByPlayerTwo = games.filter(game => game.playerTwoScore > game.playerOneScore).length;
                const winner = gamesWonByPlayerOne > gamesWonByPlayerTwo ? 
                  (playerOneData?.displayName || playerOneData?.username || 'Player 1') :
                  gamesWonByPlayerTwo > gamesWonByPlayerOne ?
                  (playerTwoData?.displayName || playerTwoData?.username || 'Player 2') :
                  null;
                return winner ? `${winner} wins the match!` : 'Match tied';
              })()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Match Button */}
      {(isAllGamesComplete || games.some(g => g.playerOneScore >= pointsToWin || g.playerTwoScore >= pointsToWin)) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-green-800">Match Complete!</h3>
              <p className="text-green-600 text-sm">Ready to submit your match results</p>
              <Button 
                onClick={handleSubmitMatch}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-base"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Match...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Submit Match
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
