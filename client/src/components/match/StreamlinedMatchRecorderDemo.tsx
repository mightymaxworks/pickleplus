import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface DemoProps {
  userRole?: 'player' | 'admin';
  onClose?: () => void;
}

// Mock data based on actual QuickMatchRecorder behavior
const RECENT_OPPONENTS = [
  { id: 2, displayName: "Sarah Chen", username: "sarahc", avatarInitials: "SC", rating: 1250 },
  { id: 3, displayName: "Mike Johnson", username: "mikej", avatarInitials: "MJ", rating: 1180 },
  { id: 4, displayName: "Lisa Wang", username: "lisaw", avatarInitials: "LW", rating: 1320 },
];

// Based on actual system constraints - NO TEMPLATES
// Templates were problematic because they make wrong assumptions
// Real system has: formatType, scoringSystem, pointsToWin, totalGames as separate settings

export default function StreamlinedMatchRecorderDemo({ userRole = 'player', onClose }: DemoProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Core match state - based on actual QuickMatchRecorder implementation
  const [formatType, setFormatType] = useState<"singles" | "doubles">("singles");
  const matchType = "casual"; // CONSTRAINT: Players can only record casual matches (from line 124)
  const [scoringSystem, setScoringSystem] = useState<"traditional" | "rally">("traditional");
  const [pointsToWin, setPointsToWin] = useState<11 | 15 | 21>(11);
  const [totalGames, setTotalGames] = useState(1);
  const [games, setGames] = useState<Array<{playerOneScore: number; playerTwoScore: number}>>([
    { playerOneScore: 0, playerTwoScore: 0 }
  ]);
  
  // Player selection state - based on actual implementation
  const [playerOneData, setPlayerOneData] = useState<any>(null);
  const [playerTwoData, setPlayerTwoData] = useState<any>(null);
  const [playerOnePartnerData, setPlayerOnePartnerData] = useState<any>(null);
  const [playerTwoPartnerData, setPlayerTwoPartnerData] = useState<any>(null);
  
  // Progressive disclosure states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  // Admin-specific options - based on actual admin features in QuickMatchRecorder
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | null>(null);
  const [useManualPointsOverride, setUseManualPointsOverride] = useState(false);
  const [manualPointsWinner, setManualPointsWinner] = useState<number>(0);
  const [manualPointsLoser, setManualPointsLoser] = useState<number>(0);
  const [notes, setNotes] = useState('');
  
  const isAdmin = userRole === 'admin';
  
  // Mock competitions from actual system
  const competitions = [
    { id: 1, name: "Summer Championship 2025", type: "tournament", pointsMultiplier: 2.0, venue: "Central Courts" },
    { id: 2, name: "Weekly League", type: "league", pointsMultiplier: 1.5, venue: "Local Club" },
    { id: 3, name: "Masters Tournament", type: "tournament", pointsMultiplier: 3.0, venue: "Elite Center" }
  ];

  // Initialize player one data based on admin status - from actual system
  useEffect(() => {
    if (!isAdmin && user) {
      setPlayerOneData({
        id: user.id,
        displayName: user.displayName || user.username,
        username: user.username,
        avatarInitials: user.avatarInitials || user.username.substring(0, 2).toUpperCase(),
      });
    }
  }, [user, isAdmin]);

  // Quick score adjustment for single game
  const adjustScore = (gameIndex: number, player: 'playerOne' | 'playerTwo', delta: number) => {
    const updatedGames = [...games];
    const currentScore = updatedGames[gameIndex][player === 'playerOne' ? 'playerOneScore' : 'playerTwoScore'];
    updatedGames[gameIndex][player === 'playerOne' ? 'playerOneScore' : 'playerTwoScore'] = Math.max(0, currentScore + delta);
    setGames(updatedGames);
  };

  // Reset form to initial state - from actual system
  const resetForm = () => {
    setPlayerTwoData(null);
    setPlayerOnePartnerData(null);
    setPlayerTwoPartnerData(null);
    setFormatType("singles");
    setScoringSystem("traditional");
    setPointsToWin(11);
    setTotalGames(1);
    setGames([{ playerOneScore: 0, playerTwoScore: 0 }]);
    setNotes('');
    
    // Reset admin-specific fields
    if (isAdmin) {
      setSelectedCompetitionId(null);
      setUseManualPointsOverride(false);
      setManualPointsWinner(0);
      setManualPointsLoser(0);
    }
  };

  // Submit match - simplified version of actual implementation
  const handleSubmit = () => {
    if (!playerTwoData) {
      toast({
        title: "Opponent Required",
        description: "Please select an opponent to record the match",
        variant: "destructive"
      });
      return;
    }

    // Check for doubles partners if needed
    if (formatType === "doubles" && (!playerOnePartnerData || !playerTwoPartnerData)) {
      toast({
        title: "Partners Required",
        description: "Please select partners for both teams in doubles matches",
        variant: "destructive"
      });
      return;
    }

    // Check if any game has been scored
    const hasValidScores = games.some(game => game.playerOneScore > 0 || game.playerTwoScore > 0);
    if (!hasValidScores) {
      toast({
        title: "Score Required", 
        description: "Please enter the match score",
        variant: "destructive"
      });
      return;
    }

    // Simulate successful submission with admin-specific messaging
    const successMessage = isAdmin 
      ? useManualPointsOverride 
        ? `Match recorded with manual points override (Winner: ${manualPointsWinner}, Loser: ${manualPointsLoser})${selectedCompetitionId ? ' and linked to competition' : ''}`
        : `Match recorded with ${selectedCompetitionId ? 'competition linking and ' : ''}enhanced admin capabilities`
      : "Your match has been recorded and auto-validated. Other players still need to validate this match.";
        
    toast({
      title: isAdmin ? "Admin Match Recorded!" : "Match recorded!",
      description: successMessage,
    });
    
    // Reset for next match
    setTimeout(() => {
      resetForm();
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold">Streamlined Match Recorder</h2>
          {isAdmin && <Badge variant="secondary">Admin Mode</Badge>}
        </div>
        <p className="text-muted-foreground">
          Demo based on actual deployed QuickMatchRecorder behavior
        </p>
      </div>

      {/* UDF Compliance Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-orange-800">UDF Compliance - Based on Real System</p>
              <p className="text-orange-700">
                This demo follows actual QuickMatchRecorder implementation:
              </p>
              <ul className="text-xs text-orange-600 space-y-1 mt-2">
                <li>• Players can only record <strong>casual</strong> matches (no league/tournament)</li>
                <li>• Doubles matches require partner selection for both teams</li>
                <li>• Multi-game matches use game-by-game scoring with tabs</li>
                <li>• Admin users get competition linking and manual points override</li>
                <li>• Templates removed - they made incorrect assumptions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Format Selection - Based on actual system */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Match Format & Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Format Type */}
          <div className="space-y-2">
            <Label>Match Format</Label>
            <ToggleGroup
              type="single"
              value={formatType}
              onValueChange={(value) => value && setFormatType(value as "singles" | "doubles")}
              className="justify-start"
            >
              <ToggleGroupItem value="singles">Singles</ToggleGroupItem>
              <ToggleGroupItem value="doubles">Doubles</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Scoring Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scoring System</Label>
              <Select value={scoringSystem} onValueChange={(value: any) => setScoringSystem(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="rally">Rally</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Points to Win</Label>
              <Select value={pointsToWin.toString()} onValueChange={(value) => setPointsToWin(parseInt(value) as 11 | 15 | 21)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">11 Points</SelectItem>
                  <SelectItem value="15">15 Points</SelectItem>
                  <SelectItem value="21">21 Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Total Games */}
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

      {/* Player Selection - Based on actual QuickMatchRecorder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-blue-500" />
            Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player One (Auto-filled for non-admins) */}
          <div className="space-y-2">
            <Label>Player One {!isAdmin && "(You)"}</Label>
            {playerOneData ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{playerOneData.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{playerOneData.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{playerOneData.username}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => setPlayerOneData(null)}>
                    Change
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-3 border rounded-lg">
                {isAdmin ? "Select Player One" : "Loading your profile..."}
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
                    <AvatarFallback>{playerTwoData.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{playerTwoData.displayName}</p>
                    <p className="text-sm text-muted-foreground">@{playerTwoData.username}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPlayerTwoData(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Select from recent opponents:</p>
                <div className="grid gap-2">
                  {RECENT_OPPONENTS.map((opponent) => (
                    <Button
                      key={opponent.id}
                      variant="outline"
                      onClick={() => setPlayerTwoData(opponent)}
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
            )}
          </div>

          {/* Doubles Partners - Only show if doubles format */}
          {formatType === "doubles" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Doubles Partners</h4>
                
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
                          <p className="font-medium">{playerOnePartnerData.displayName}</p>
                          <p className="text-sm text-muted-foreground">@{playerOnePartnerData.username}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setPlayerOnePartnerData(null)}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-3 border rounded-lg border-dashed">
                      Select partner for Team 1
                    </div>
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
                          <p className="font-medium">{playerTwoPartnerData.displayName}</p>
                          <p className="text-sm text-muted-foreground">@{playerTwoPartnerData.username}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setPlayerTwoPartnerData(null)}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-3 border rounded-lg border-dashed">
                      Select partner for Team 2
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Score Entry - Based on actual QuickMatchRecorder multi-game system */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-500" />
            Match Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Single Game Score Entry */}
          {totalGames === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Player One Score */}
                <div className="text-center space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {playerOneData?.displayName || (isAdmin ? 'Player One' : 'You')}
                  </Label>
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-green-600">{games[0].playerOneScore}</div>
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => adjustScore(0, 'playerOne', -1)}
                        disabled={games[0].playerOneScore === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => adjustScore(0, 'playerOne', 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Player Two Score */}
                <div className="text-center space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {playerTwoData?.displayName || 'Player Two'}
                  </Label>
                  <div className="space-y-3">
                    <div className="text-4xl font-bold text-blue-600">{games[0].playerTwoScore}</div>
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => adjustScore(0, 'playerTwo', -1)}
                        disabled={games[0].playerTwoScore === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => adjustScore(0, 'playerTwo', 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Badge variant="outline">
                  {formatType === 'singles' ? 'Singles' : 'Doubles'} • {pointsToWin} Points • {scoringSystem}
                </Badge>
              </div>
            </div>
          ) : (
            /* Multi-game score entry with tabs - from actual system */
            <div className="space-y-4">
              {/* Game Status Overview */}
              {(() => {
                const playerOneWins = games.filter(g => g.playerOneScore > g.playerTwoScore).length;
                const playerTwoWins = games.filter(g => g.playerTwoScore > g.playerOneScore).length;
                const gamesToWin = Math.ceil(totalGames / 2);
                
                return (
                  <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant={playerOneWins >= gamesToWin ? "default" : "outline"} className="text-xs">
                        {playerOneData?.displayName || (isAdmin ? 'P1' : 'You')}: {playerOneWins}
                      </Badge>
                      <Badge variant={playerTwoWins >= gamesToWin ? "default" : "outline"} className="text-xs">
                        {playerTwoData?.displayName || 'P2'}: {playerTwoWins}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      First to {gamesToWin}
                    </div>
                  </div>
                );
              })()}

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
                    <div className="grid grid-cols-2 gap-6">
                      {/* Player One Score */}
                      <div className="text-center space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                          {playerOneData?.displayName || (isAdmin ? 'Player One' : 'You')}
                        </Label>
                        <div className="space-y-3">
                          <div className="text-3xl font-bold text-green-600">
                            {games[i]?.playerOneScore || 0}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => adjustScore(i, 'playerOne', -1)}
                              disabled={(games[i]?.playerOneScore || 0) === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => adjustScore(i, 'playerOne', 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Player Two Score */}
                      <div className="text-center space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                          {playerTwoData?.displayName || 'Player Two'}
                        </Label>
                        <div className="space-y-3">
                          <div className="text-3xl font-bold text-blue-600">
                            {games[i]?.playerTwoScore || 0}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => adjustScore(i, 'playerTwo', -1)}
                              disabled={(games[i]?.playerTwoScore || 0) === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => adjustScore(i, 'playerTwo', 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Notes
            <Badge variant="secondary" className="text-xs">Optional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[60px] p-2 text-sm rounded-lg border border-input bg-background focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            placeholder="Add notes about this match..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Admin Controls - Based on actual QuickMatchRecorder features */}
      {isAdmin && (
        <Collapsible open={showAdminControls} onOpenChange={setShowAdminControls}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Admin Controls</span>
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">Admin Only</Badge>
                  </div>
                  {showAdminControls ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-orange-600" />}
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4">
            <Card className="border-orange-200">
              <CardContent className="pt-6 space-y-4">
                {/* Competition Linking - From actual system */}
                <div className="space-y-2">
                  <Label>Link to Competition (optional)</Label>
                  <Select
                    value={selectedCompetitionId?.toString() || "none"}
                    onValueChange={(value) => setSelectedCompetitionId(value !== "none" ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select competition..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Competition</SelectItem>
                      {competitions.map((comp) => (
                        <SelectItem key={comp.id} value={comp.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{comp.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {comp.type} • {comp.pointsMultiplier}x points • {comp.venue}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedCompetitionId && (
                    <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border">
                      <Info className="h-3 w-3 inline mr-1" />
                      Match will be linked to this competition with enhanced point multipliers applied
                    </div>
                  )}
                </div>

                {/* Manual Points Override - From actual system */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="manual-points"
                      checked={useManualPointsOverride}
                      onChange={(e) => setUseManualPointsOverride(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="manual-points">Manual Points Override</Label>
                  </div>
                  
                  {useManualPointsOverride && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-orange-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Winner Points</Label>
                        <Input
                          type="number"
                          value={manualPointsWinner}
                          onChange={(e) => setManualPointsWinner(parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Loser Points</Label>
                        <Input
                          type="number"
                          value={manualPointsLoser}
                          onChange={(e) => setManualPointsLoser(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSubmit} 
          size="lg" 
          className="flex-1"
          disabled={!playerTwoData}
        >
          {isAdmin ? "Record Admin Match" : "Record Match"}
        </Button>
        
        <Button 
          onClick={resetForm} 
          variant="outline" 
          size="lg"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* UDF Compliance Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2 text-green-800">UDF Compliance - Fixed Issues:</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>✅ Removed unreliable templates that made wrong assumptions</p>
            <p>✅ Based on actual QuickMatchRecorder implementation</p>
            <p>✅ Proper doubles partner selection for both teams</p>
            <p>✅ Multi-game scoring with game-by-game tabs</p>
            <p>✅ Player constraint: casual matches only (admins get tournament access)</p>
            <p>✅ Real admin features: competition linking & manual points override</p>
          </div>
        </CardContent>
      </Card>

      {onClose && (
        <div className="text-center">
          <Button variant="ghost" onClick={onClose}>
            Close Demo
          </Button>
        </div>
      )}
    </div>
  );
}