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
  Timer,
  TrendingUp
} from "lucide-react";

// Import existing components
import { Form } from "@/components/ui/form";

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
const OpponentSelector = ({ onSelectOpponent, recentOpponents }: { 
  onSelectOpponent: (opponent: any) => void, 
  recentOpponents: any[] 
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
        // Use real API search - implement actual player search
        const response = await fetch(`/api/players/search?q=${encodeURIComponent(term)}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.players || []);
        } else {
          setSearchResults([]);
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
          placeholder="Search for any player..."
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
  
  // Match state
  const [formatType, setFormatType] = useState<"singles" | "doubles">("singles");
  const matchType = "casual"; // Players can only record casual matches unless admin
  const [scoringSystem, setScoringSystem] = useState<"traditional" | "rally">("traditional");
  const [pointsToWin, setPointsToWin] = useState<11 | 15 | 21>(11);
  const [totalGames, setTotalGames] = useState(1);
  const [games, setGames] = useState<Array<{playerOneScore: number; playerTwoScore: number}>>([
    { playerOneScore: 0, playerTwoScore: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
            {isAdmin ? "Admin Match Recording System" : "Record Your Casual Matches"}
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
        <CardContent className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Match Format</Label>
            <ToggleGroup type="single" value={formatType} onValueChange={(value) => value && setFormatType(value as "singles" | "doubles")}>
              <ToggleGroupItem value="singles" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Singles
              </ToggleGroupItem>
              <ToggleGroupItem value="doubles" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Doubles
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Scoring System */}
          <div className="space-y-2">
            <Label>Scoring System</Label>
            <ToggleGroup type="single" value={scoringSystem} onValueChange={(value) => value && setScoringSystem(value as "traditional" | "rally")}>
              <ToggleGroupItem value="traditional">Traditional</ToggleGroupItem>
              <ToggleGroupItem value="rally">Rally</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Points to Win */}
          <div className="space-y-2">
            <Label>Points to Win</Label>
            <ToggleGroup type="single" value={pointsToWin.toString()} onValueChange={(value) => value && setPointsToWin(parseInt(value) as 11 | 15 | 21)}>
              <ToggleGroupItem value="11">11 Points</ToggleGroupItem>
              <ToggleGroupItem value="15">15 Points</ToggleGroupItem>
              <ToggleGroupItem value="21">21 Points</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Number of Games */}
          <div className="space-y-2">
            <Label>Number of Games</Label>
            <Select value={totalGames.toString()} onValueChange={(value) => {
              const newTotal = parseInt(value);
              setTotalGames(newTotal);
              // Adjust games array
              const newGames = Array.from({ length: newTotal }, (_, i) => 
                games[i] || { playerOneScore: 0, playerTwoScore: 0 }
              );
              setGames(newGames);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Best of 1</SelectItem>
                <SelectItem value="3">Best of 3</SelectItem>
                <SelectItem value="5">Best of 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Match Type Constraint */}
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              {isAdmin ? "Admin can record tournament matches" : "Players can only record casual matches"}
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
                  <DialogPlayerSelect
                    trigger={<Button variant="ghost" size="sm">Change</Button>}
                    onPlayerSelect={(player) => setPlayerOneData(player)}
                    excludePlayerIds={[playerTwoData?.id].filter(Boolean) as number[]}
                  />
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-3 border rounded-lg">
                {isAdmin ? (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // For admin, implement player selection later
                      toast({
                        title: "Feature Coming Soon",
                        description: "Admin player selection will be available soon",
                        variant: "default",
                      });
                    }}
                  >
                    Select Player One
                  </Button>
                ) : "Loading your profile..."}
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
              <OpponentSelector 
                onSelectOpponent={setPlayerTwoData}
                recentOpponents={recentOpponents}
              />
            )}
          </div>

          {/* Doubles Partners */}
          {formatType === "doubles" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Doubles Partners</h4>
                
                {/* Player One Partner */}
                <div className="space-y-2">
                  <Label>Player One Partner</Label>
                  {playerOnePartnerData ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{playerOnePartnerData.avatarInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{playerOnePartnerData.displayName || playerOnePartnerData.username}</p>
                          <p className="text-sm text-muted-foreground">@{playerOnePartnerData.username}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setPlayerOnePartnerData(null)}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Partner selection will be available soon",
                          variant: "default",
                        });
                      }}
                    >
                      Select Partner
                    </Button>
                  )}
                </div>

                {/* Player Two Partner */}
                <div className="space-y-2">
                  <Label>Player Two Partner</Label>
                  {playerTwoPartnerData ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{playerTwoPartnerData.avatarInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{playerTwoPartnerData.displayName || playerTwoPartnerData.username}</p>
                          <p className="text-sm text-muted-foreground">@{playerTwoPartnerData.username}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setPlayerTwoPartnerData(null)}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Partner selection will be available soon",
                          variant: "default",
                        });
                      }}
                    >
                      Select Partner
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Score Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Score Entry
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
                    {gameWinner === 1 
                      ? `${playerOneData?.displayName || playerOneData?.username || 'Player 1'} wins`
                      : gameWinner === 2
                      ? `${playerTwoData?.displayName || playerTwoData?.username || 'Player 2'} wins`
                      : 'In Progress'
                    }
                  </Badge>
                </div>
                
                {/* Enhanced Score Display */}
                <div className="grid grid-cols-3 gap-6 items-center">
                  {/* Player One Score */}
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {playerOneData?.avatarInitials || 'P1'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {playerOneData?.displayName || playerOneData?.username || 'Player 1'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-full"
                        onClick={() => {
                          const newGames = [...games];
                          newGames[index] = { 
                            ...newGames[index], 
                            playerOneScore: Math.max(0, newGames[index].playerOneScore - 1) 
                          };
                          setGames(newGames);
                        }}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      
                      <div className={`text-4xl font-bold w-16 text-center py-2 px-3 rounded-lg transition-colors ${
                        gameWinner === 1 ? 'bg-green-600 text-white' : 'bg-white border-2'
                      }`}>
                        {game.playerOneScore}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-full"
                        onClick={() => {
                          const newGames = [...games];
                          newGames[index] = { 
                            ...newGames[index], 
                            playerOneScore: newGames[index].playerOneScore + 1 
                          };
                          setGames(newGames);
                        }}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* VS Separator */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-muted-foreground bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto border-2">
                      VS
                    </div>
                  </div>
                  
                  {/* Player Two Score */}
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {playerTwoData?.avatarInitials || 'P2'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {playerTwoData?.displayName || playerTwoData?.username || 'Player 2'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-full"
                        onClick={() => {
                          const newGames = [...games];
                          newGames[index] = { 
                            ...newGames[index], 
                            playerTwoScore: Math.max(0, newGames[index].playerTwoScore - 1) 
                          };
                          setGames(newGames);
                        }}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      
                      <div className={`text-4xl font-bold w-16 text-center py-2 px-3 rounded-lg transition-colors ${
                        gameWinner === 2 ? 'bg-green-600 text-white' : 'bg-white border-2'
                      }`}>
                        {game.playerTwoScore}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-12 w-12 rounded-full"
                        onClick={() => {
                          const newGames = [...games];
                          newGames[index] = { 
                            ...newGames[index], 
                            playerTwoScore: newGames[index].playerTwoScore + 1 
                          };
                          setGames(newGames);
                        }}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Quick Score Actions */}
                {!isGameComplete && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-muted-foreground mb-2 text-center">Quick Actions</p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const newGames = [...games];
                          newGames[index] = { ...newGames[index], playerOneScore: pointsToWin, playerTwoScore: 0 };
                          setGames(newGames);
                        }}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        P1 {pointsToWin}-0
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const newGames = [...games];
                          newGames[index] = { ...newGames[index], playerOneScore: pointsToWin, playerTwoScore: pointsToWin - 2 };
                          setGames(newGames);
                        }}
                      >
                        P1 {pointsToWin}-{pointsToWin - 2}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const newGames = [...games];
                          newGames[index] = { ...newGames[index], playerOneScore: pointsToWin - 2, playerTwoScore: pointsToWin };
                          setGames(newGames);
                        }}
                      >
                        P2 {pointsToWin}-{pointsToWin - 2}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const newGames = [...games];
                          newGames[index] = { ...newGames[index], playerOneScore: 0, playerTwoScore: pointsToWin };
                          setGames(newGames);
                        }}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        P2 {pointsToWin}-0
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Enhanced Match Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Match Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const winner = calculateMatchWinner();
            const playerOneWins = games.filter(game => game.playerOneScore > game.playerTwoScore).length;
            const playerTwoWins = games.filter(game => game.playerTwoScore > game.playerOneScore).length;
            const completedGames = games.filter(game => 
              game.playerOneScore >= pointsToWin || game.playerTwoScore >= pointsToWin
            ).length;
            
            return (
              <div className="space-y-4">
                {/* Game Results Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {playerOneData?.displayName || playerOneData?.username || 'Player 1'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">{playerOneWins}</p>
                    <p className="text-xs text-muted-foreground">Games Won</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">{completedGames}/{totalGames}</p>
                    <p className="text-xs text-muted-foreground">Games</p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {playerTwoData?.displayName || playerTwoData?.username || 'Player 2'}
                    </p>
                    <p className="text-2xl font-bold text-orange-600">{playerTwoWins}</p>
                    <p className="text-xs text-muted-foreground">Games Won</p>
                  </div>
                </div>

                {/* Winner Announcement */}
                {winner && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-full">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">Match Winner</p>
                        <p className="text-lg font-bold text-green-900">
                          {winner === 1 
                            ? playerOneData?.displayName || playerOneData?.username || 'Player 1'
                            : playerTwoData?.displayName || playerTwoData?.username || 'Player 2'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Match Stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Format:</span>
                    <span className="font-medium capitalize">{formatType}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Scoring:</span>
                    <span className="font-medium">{pointsToWin} Points</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>



      {/* Admin-only Competition Selection */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              Admin Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Competition Selection */}
            <div className="space-y-2">
              <Label>Link to Competition (Optional)</Label>
              <Select value={selectedCompetitionId?.toString() || "none"} onValueChange={(value) => setSelectedCompetitionId(value !== "none" ? parseInt(value) : null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a competition..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Competition (Casual Match)</SelectItem>
                  {competitions.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id.toString()}>
                      {comp.name} ({comp.type}) - {comp.pointsMultiplier}x points
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Manual Points Override */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manualPoints"
                  checked={useManualPointsOverride}
                  onChange={(e) => setUseManualPointsOverride(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="manualPoints">Manual Points Override</Label>
              </div>
              
              {useManualPointsOverride && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Winner Points</Label>
                    <Input
                      type="number"
                      value={manualPointsWinner}
                      onChange={(e) => setManualPointsWinner(parseInt(e.target.value) || 0)}
                      placeholder="Points for winner"
                    />
                  </div>
                  <div>
                    <Label>Loser Points</Label>
                    <Input
                      type="number"
                      value={manualPointsLoser}
                      onChange={(e) => setManualPointsLoser(parseInt(e.target.value) || 0)}
                      placeholder="Points for loser"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button 
          onClick={() => handleSubmit(form.getValues())}
          disabled={isSubmitting || !calculateMatchWinner() || !playerOneData || !playerTwoData}
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
    </div>
  );
}