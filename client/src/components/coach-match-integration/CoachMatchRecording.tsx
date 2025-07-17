/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 1: Coach-Match Recording Component
 * 
 * Enhanced match recording with real-time coaching integration
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Timer, 
  Trophy, 
  Target, 
  Brain, 
  Zap,
  Eye,
  BarChart3,
  Star,
  AlertCircle,
  CheckCircle,
  Plus,
  Send,
  Activity
} from 'lucide-react';

interface CoachMatchRecordingProps {
  matchId?: number;
  onMatchRecorded?: (matchData: any) => void;
  coachMode?: boolean;
  playerId?: number;
}

export const CoachMatchRecording: React.FC<CoachMatchRecordingProps> = ({
  matchId,
  onMatchRecorded,
  coachMode = false,
  playerId
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for match recording
  const [isRecording, setIsRecording] = useState(false);
  const [matchData, setMatchData] = useState({
    player1: '',
    player2: '',
    player3: '',
    player4: '',
    formatType: 'doubles',
    score: '',
    gameType: 'casual',
    duration: '',
    location: '',
    notes: ''
  });
  
  // State for coaching integration
  const [coachingSession, setCoachingSession] = useState<any>(null);
  const [coachInputs, setCoachInputs] = useState<any[]>([]);
  const [currentCoachInput, setCurrentCoachInput] = useState({
    type: 'observation',
    content: '',
    timestamp: new Date()
  });
  
  // State for PCP assessment
  const [pcpAssessment, setPcpAssessment] = useState({
    technicalRating: 0,
    tacticalRating: 0,
    physicalRating: 0,
    mentalRating: 0,
    overallPerformance: 0,
    improvementAreas: '',
    strengths: '',
    nextSteps: ''
  });
  
  // Fetch coaching session data if match exists
  const { data: sessionData } = useQuery({
    queryKey: [`/api/coach-match/sessions/${matchId}`],
    enabled: !!matchId,
    refetchInterval: 5000 // Real-time updates
  });
  
  // Fetch coach inputs for current match
  const { data: inputsData } = useQuery({
    queryKey: [`/api/coach-match/inputs/${matchId}`],
    enabled: !!matchId,
    refetchInterval: 3000 // Frequent updates for live coaching
  });
  
  // Fetch coach-match configuration
  const { data: configData } = useQuery({
    queryKey: ['/api/coach-match/config']
  });
  
  // Mutation for adding coach input
  const addCoachInputMutation = useMutation({
    mutationFn: async (inputData: any) => {
      const response = await apiRequest('POST', '/api/coach-match/input', inputData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/coach-match/inputs/${matchId}`] });
      setCurrentCoachInput({
        type: 'observation',
        content: '',
        timestamp: new Date()
      });
      toast({
        title: "Coach Input Added",
        description: "Real-time coaching input recorded successfully"
      });
    }
  });
  
  // Mutation for creating PCP assessment
  const createPcpAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      const response = await apiRequest('POST', '/api/coach-match/pcp-assessment', assessmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/coach-match/pcp-assessment/${matchId}/${playerId}`] });
      toast({
        title: "PCP Assessment Complete",
        description: "Player assessment saved successfully"
      });
    }
  });
  
  // Mutation for recording match
  const recordMatchMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/matches/record', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (onMatchRecorded) {
        onMatchRecorded(data);
      }
      toast({
        title: "Match Recorded",
        description: "Match has been recorded with coaching integration"
      });
    }
  });
  
  // Handle coach input submission
  const handleCoachInputSubmit = () => {
    if (!currentCoachInput.content.trim()) return;
    
    addCoachInputMutation.mutate({
      matchId,
      playerId,
      inputType: currentCoachInput.type,
      content: currentCoachInput.content,
      skillCategory: 'technical', // This would be determined by input type
      timestamp: new Date()
    });
  };
  
  // Handle PCP assessment submission
  const handlePcpAssessmentSubmit = () => {
    if (!matchId || !playerId) return;
    
    createPcpAssessmentMutation.mutate({
      matchId,
      playerId,
      ...pcpAssessment
    });
  };
  
  // Handle match recording
  const handleRecordMatch = () => {
    recordMatchMutation.mutate({
      ...matchData,
      hasCoachingIntegration: coachMode,
      coachingSessionId: coachingSession?.id
    });
  };
  
  // Update coach inputs when data changes
  useEffect(() => {
    if (inputsData?.inputs) {
      setCoachInputs(inputsData.inputs);
    }
  }, [inputsData]);
  
  // Update coaching session when data changes
  useEffect(() => {
    if (sessionData?.sessions?.length > 0) {
      setCoachingSession(sessionData.sessions[0]);
    }
  }, [sessionData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Match Recording</h2>
          <p className="text-muted-foreground">
            {coachMode ? 'Coach-integrated match recording with real-time assessment' : 'Standard match recording'}
          </p>
        </div>
        
        {isRecording && (
          <Badge variant="destructive" className="animate-pulse">
            <Activity className="w-4 h-4 mr-1" />
            Recording Live
          </Badge>
        )}
      </div>
      
      <Tabs defaultValue="recording" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recording">Match Recording</TabsTrigger>
          <TabsTrigger value="coaching" disabled={!coachMode}>Live Coaching</TabsTrigger>
          <TabsTrigger value="assessment" disabled={!coachMode}>PCP Assessment</TabsTrigger>
          <TabsTrigger value="insights" disabled={!coachMode}>Match Insights</TabsTrigger>
        </TabsList>
        
        {/* Match Recording Tab */}
        <TabsContent value="recording">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Match Details
              </CardTitle>
              <CardDescription>
                Record match results with optional coaching integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="player1">Player 1</Label>
                  <Input
                    id="player1"
                    placeholder="Enter player name"
                    value={matchData.player1}
                    onChange={(e) => setMatchData(prev => ({ ...prev, player1: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="player2">Player 2</Label>
                  <Input
                    id="player2"
                    placeholder="Enter player name"
                    value={matchData.player2}
                    onChange={(e) => setMatchData(prev => ({ ...prev, player2: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formatType">Format</Label>
                  <Select value={matchData.formatType} onValueChange={(value) => setMatchData(prev => ({ ...prev, formatType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singles">Singles</SelectItem>
                      <SelectItem value="doubles">Doubles</SelectItem>
                      <SelectItem value="mixed">Mixed Doubles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gameType">Game Type</Label>
                  <Select value={matchData.gameType} onValueChange={(value) => setMatchData(prev => ({ ...prev, gameType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                      <SelectItem value="lesson">Lesson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="score">Final Score</Label>
                <Input
                  id="score"
                  placeholder="e.g., 11-7, 11-9"
                  value={matchData.score}
                  onChange={(e) => setMatchData(prev => ({ ...prev, score: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Match Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about the match..."
                  value={matchData.notes}
                  onChange={(e) => setMatchData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleRecordMatch}
                  disabled={recordMatchMutation.isPending}
                  className="flex-1"
                >
                  {recordMatchMutation.isPending ? 'Recording...' : 'Record Match'}
                </Button>
                
                {coachMode && (
                  <Button 
                    onClick={() => setIsRecording(!isRecording)}
                    variant={isRecording ? "destructive" : "secondary"}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Live Recording'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Live Coaching Tab */}
        <TabsContent value="coaching">
          <div className="space-y-4">
            {/* Real-time Coach Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Real-time Coaching Input
                </CardTitle>
                <CardDescription>
                  Provide live coaching observations and guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inputType">Input Type</Label>
                    <Select 
                      value={currentCoachInput.type} 
                      onValueChange={(value) => setCurrentCoachInput(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {configData?.config?.coachInputTypes?.map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Badge variant="outline" className="mb-2">
                      <Timer className="w-4 h-4 mr-1" />
                      Live
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="coachContent">Coaching Input</Label>
                  <Textarea
                    id="coachContent"
                    placeholder="Enter your coaching observation, correction, or guidance..."
                    value={currentCoachInput.content}
                    onChange={(e) => setCurrentCoachInput(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <Button 
                  onClick={handleCoachInputSubmit}
                  disabled={addCoachInputMutation.isPending || !currentCoachInput.content.trim()}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {addCoachInputMutation.isPending ? 'Sending...' : 'Send Coaching Input'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Coach Input History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Coaching History
                </CardTitle>
                <CardDescription>
                  Review all coaching inputs for this match
                </CardDescription>
              </CardHeader>
              <CardContent>
                {coachInputs.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {coachInputs.map((input, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{input.inputType}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(input.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{input.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No coaching inputs recorded yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* PCP Assessment Tab */}
        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                PCP Performance Assessment
              </CardTitle>
              <CardDescription>
                Evaluate player performance across 4 key dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Technical Rating */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Technical Skills (40%)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={pcpAssessment.technicalRating}
                    onChange={(e) => setPcpAssessment(prev => ({ ...prev, technicalRating: parseInt(e.target.value) || 0 }))}
                    className="w-20"
                  />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(pcpAssessment.technicalRating / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pcpAssessment.technicalRating}/10
                  </span>
                </div>
              </div>
              
              {/* Tactical Rating */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Tactical Awareness (25%)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={pcpAssessment.tacticalRating}
                    onChange={(e) => setPcpAssessment(prev => ({ ...prev, tacticalRating: parseInt(e.target.value) || 0 }))}
                    className="w-20"
                  />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(pcpAssessment.tacticalRating / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pcpAssessment.tacticalRating}/10
                  </span>
                </div>
              </div>
              
              {/* Physical Rating */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Physical Conditioning (20%)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={pcpAssessment.physicalRating}
                    onChange={(e) => setPcpAssessment(prev => ({ ...prev, physicalRating: parseInt(e.target.value) || 0 }))}
                    className="w-20"
                  />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(pcpAssessment.physicalRating / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pcpAssessment.physicalRating}/10
                  </span>
                </div>
              </div>
              
              {/* Mental Rating */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Mental Toughness (15%)
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={pcpAssessment.mentalRating}
                    onChange={(e) => setPcpAssessment(prev => ({ ...prev, mentalRating: parseInt(e.target.value) || 0 }))}
                    className="w-20"
                  />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${(pcpAssessment.mentalRating / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {pcpAssessment.mentalRating}/10
                  </span>
                </div>
              </div>
              
              {/* Assessment Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="strengths">Key Strengths</Label>
                  <Textarea
                    id="strengths"
                    placeholder="What did the player do well?"
                    value={pcpAssessment.strengths}
                    onChange={(e) => setPcpAssessment(prev => ({ ...prev, strengths: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="improvements">Areas for Improvement</Label>
                  <Textarea
                    id="improvements"
                    placeholder="What needs work?"
                    value={pcpAssessment.improvementAreas}
                    onChange={(e) => setPcpAssessment(prev => ({ ...prev, improvementAreas: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="nextSteps">Recommended Next Steps</Label>
                <Textarea
                  id="nextSteps"
                  placeholder="What should the player focus on next?"
                  value={pcpAssessment.nextSteps}
                  onChange={(e) => setPcpAssessment(prev => ({ ...prev, nextSteps: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <Button 
                onClick={handlePcpAssessmentSubmit}
                disabled={createPcpAssessmentMutation.isPending}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {createPcpAssessmentMutation.isPending ? 'Saving Assessment...' : 'Complete PCP Assessment'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Match Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Match Insights & Analytics
              </CardTitle>
              <CardDescription>
                AI-powered insights from coaching data and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Coaching Effectiveness */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Coaching Effectiveness
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {coachInputs.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Coaching Inputs
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {coachInputs.filter(input => input.inputType === 'correction').length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Corrections Made
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {coachInputs.filter(input => input.inputType === 'encouragement').length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Encouragements
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Player Progression */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Player Development Insights
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Match Context Understanding</span>
                      <Badge variant="outline">Improving</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Response to Coaching</span>
                      <Badge variant="outline">Excellent</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Technical Execution</span>
                      <Badge variant="outline">Needs Work</Badge>
                    </div>
                  </div>
                </div>
                
                {/* Next Session Recommendations */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Next Session Focus
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Work on consistent third shot drops</li>
                    <li>• Practice court positioning in doubles</li>
                    <li>• Improve serve placement accuracy</li>
                    <li>• Develop mental resilience under pressure</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};