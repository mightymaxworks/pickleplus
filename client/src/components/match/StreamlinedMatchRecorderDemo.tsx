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
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface DemoProps {
  userRole?: 'player' | 'admin';
  onClose?: () => void;
}

// Mock data for demo purposes
const RECENT_OPPONENTS = [
  { id: 2, name: "Sarah Chen", username: "sarahc", avatar: "/api/placeholder/40/40", rating: 1250 },
  { id: 3, name: "Mike Johnson", username: "mikej", avatar: "/api/placeholder/40/40", rating: 1180 },
  { id: 4, name: "Lisa Wang", username: "lisaw", avatar: "/api/placeholder/40/40", rating: 1320 },
];

const MATCH_TEMPLATES = [
  { id: 'quick-11', name: '11-Point Singles', format: 'singles', points: 11, games: 1, icon: Target },
  { id: 'best-3', name: 'Best of 3 Games', format: 'singles', points: 11, games: 3, icon: Trophy },
  { id: 'doubles-15', name: '15-Point Doubles', format: 'doubles', points: 15, games: 1, icon: Users },
  { id: 'tournament', name: 'Tournament Match', format: 'singles', points: 21, games: 1, icon: Award },
];

export default function StreamlinedMatchRecorderDemo({ userRole = 'player', onClose }: DemoProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Core match state
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
  const [matchFormat, setMatchFormat] = useState<'singles' | 'doubles'>('singles');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('quick-11');
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [pointsToWin, setPointsToWin] = useState(11);
  
  // Progressive disclosure states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  
  // Advanced options
  const [location, setLocation] = useState('');
  const [matchType, setMatchType] = useState<'casual' | 'league' | 'tournament'>('casual');
  const [notes, setNotes] = useState('');
  
  // Admin-specific options
  const [linkedCompetition, setLinkedCompetition] = useState('');
  const [manualPointsOverride, setManualPointsOverride] = useState(false);
  
  const isAdmin = userRole === 'admin';

  // Smart template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = MATCH_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setMatchFormat(template.format as 'singles' | 'doubles');
      setPointsToWin(template.points);
      setPlayerScore(0);
      setOpponentScore(0);
      
      toast({
        title: "Template Applied",
        description: `Set up for ${template.name}`,
      });
    }
  };

  // Quick score adjustment
  const adjustScore = (player: 'self' | 'opponent', delta: number) => {
    if (player === 'self') {
      setPlayerScore(Math.max(0, playerScore + delta));
    } else {
      setOpponentScore(Math.max(0, opponentScore + delta));
    }
  };

  // Rematch functionality
  const handleRematch = () => {
    const currentOpponent = selectedOpponent;
    setPlayerScore(0);
    setOpponentScore(0);
    toast({
      title: "Ready for Rematch",
      description: `Same settings, scores reset`,
    });
  };

  // Submit match
  const handleSubmit = () => {
    if (!selectedOpponent) {
      toast({
        title: "Opponent Required",
        description: "Please select an opponent to record the match",
        variant: "destructive"
      });
      return;
    }

    if (playerScore === 0 && opponentScore === 0) {
      toast({
        title: "Score Required", 
        description: "Please enter the match score",
        variant: "destructive"
      });
      return;
    }

    // Simulate successful submission
    toast({
      title: "Match Recorded Successfully!",
      description: `${user?.firstName || 'You'} ${playerScore} - ${opponentScore} ${selectedOpponent.name}`,
    });
    
    // Reset for next match
    setTimeout(() => {
      setPlayerScore(0);
      setOpponentScore(0);
      setSelectedOpponent(null);
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
          Demo of enhanced UI/UX with smart defaults and progressive disclosure
        </p>
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Quick Setup Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {MATCH_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="h-auto p-4 flex-col gap-2"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{template.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {template.format} • {template.points}pt
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Opponent Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-blue-500" />
            Select Opponent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedOpponent ? (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedOpponent.avatar} />
                  <AvatarFallback>{selectedOpponent.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedOpponent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{selectedOpponent.username} • {selectedOpponent.rating} pts
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedOpponent(null)}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">Recent opponents:</p>
              <div className="grid gap-2">
                {RECENT_OPPONENTS.map((opponent) => (
                  <Button
                    key={opponent.id}
                    variant="outline"
                    onClick={() => setSelectedOpponent(opponent)}
                    className="justify-start h-auto p-3"
                  >
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={opponent.avatar} />
                      <AvatarFallback>{opponent.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{opponent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{opponent.username} • {opponent.rating} pts
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-500" />
            Match Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Player Score */}
            <div className="text-center space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                {user?.firstName || 'You'}
              </Label>
              <div className="space-y-3">
                <div className="text-4xl font-bold text-green-600">{playerScore}</div>
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => adjustScore('self', -1)}
                    disabled={playerScore === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => adjustScore('self', 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Opponent Score */}
            <div className="text-center space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                {selectedOpponent?.name || 'Opponent'}
              </Label>
              <div className="space-y-3">
                <div className="text-4xl font-bold text-blue-600">{opponentScore}</div>
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => adjustScore('opponent', -1)}
                    disabled={opponentScore === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => adjustScore('opponent', 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-4" />
          
          {/* Match format display */}
          <div className="text-center space-y-2">
            <Badge variant="outline">
              {matchFormat === 'singles' ? 'Singles' : 'Doubles'} • {pointsToWin} Points
            </Badge>
            {selectedOpponent && (playerScore > 0 || opponentScore > 0) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRematch}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Rematch
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progressive Disclosure - Advanced Options */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Advanced Options
            </span>
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-4">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Match Type</Label>
                  <Select value={matchType} onValueChange={(value: any) => setMatchType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="league">League</SelectItem>
                      {isAdmin && <SelectItem value="tournament">Tournament</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    placeholder="Court or venue"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Match Notes</Label>
                <Input 
                  placeholder="Optional notes about the match"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Admin-only Progressive Disclosure */}
      {isAdmin && (
        <Collapsible open={showAdminControls} onOpenChange={setShowAdminControls}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Admin Controls
                <Badge variant="secondary" className="ml-2">Admin</Badge>
              </span>
              {showAdminControls ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-4 border-orange-200">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Link to Competition</Label>
                  <Select value={linkedCompetition} onValueChange={setLinkedCompetition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select competition (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summer-2025">Summer Championship 2025</SelectItem>
                      <SelectItem value="weekly-league">Weekly League</SelectItem>
                      <SelectItem value="masters-2025">Masters Tournament</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="manual-points"
                    checked={manualPointsOverride}
                    onChange={(e) => setManualPointsOverride(e.target.checked)}
                  />
                  <Label htmlFor="manual-points">Override automatic point calculation</Label>
                </div>
                {manualPointsOverride && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-orange-50 rounded-lg">
                    <div className="space-y-2">
                      <Label>Winner Points</Label>
                      <Input type="number" placeholder="Points for winner" />
                    </div>
                    <div className="space-y-2">
                      <Label>Loser Points</Label>
                      <Input type="number" placeholder="Points for loser" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          size="lg"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Record Match
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose} size="lg">
            Cancel
          </Button>
        )}
      </div>

      {/* Demo Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Demo Features Showcased:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Quick setup templates with one-click configuration</p>
            <p>• Smart opponent suggestions from recent matches</p>
            <p>• Large, touch-friendly score controls</p>
            <p>• Progressive disclosure for advanced options</p>
            <p>• Role-based admin controls (when in admin mode)</p>
            <p>• Instant rematch functionality</p>
            <p>• Mobile-optimized layout and interactions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}