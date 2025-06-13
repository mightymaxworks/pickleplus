import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Target, Brain, Zap, Heart, Save, User } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SkillRating {
  value: number;
  label: string;
}

interface AssessmentData {
  profile_id: number | null;
  coach_id: number;
  assessment_type: string;
  
  // Technical Skills (40% weight)
  serve_execution: number;
  return_technique: number;
  third_shot: number;
  overhead_defense: number;
  shot_creativity: number;
  court_movement: number;
  
  // Groundstrokes Breakdown
  forehand_topspin: number;
  forehand_slice: number;
  backhand_topspin: number;
  backhand_slice: number;
  
  // Net Play Breakdown
  forehand_dead_dink: number;
  forehand_topspin_dink: number;
  forehand_slice_dink: number;
  backhand_dead_dink: number;
  backhand_topspin_dink: number;
  backhand_slice_dink: number;
  forehand_block_volley: number;
  forehand_drive_volley: number;
  forehand_dink_volley: number;
  backhand_block_volley: number;
  backhand_drive_volley: number;
  backhand_dink_volley: number;
  
  // Tactical Awareness (25% weight)
  shot_selection: number;
  court_positioning: number;
  pattern_recognition: number;
  risk_management: number;
  communication: number;
  
  // Physical Attributes (20% weight)
  footwork: number;
  balance_stability: number;
  reaction_time: number;
  endurance: number;
  
  // Mental Game (15% weight)
  focus_concentration: number;
  pressure_performance: number;
  adaptability: number;
  sportsmanship: number;
  
  session_notes: string;
  confidence_level: number;
}

const ratingScale = [
  { value: 1.0, label: "1.0 - Beginner" },
  { value: 1.5, label: "1.5 - Learning" },
  { value: 2.0, label: "2.0 - Developing" },
  { value: 2.5, label: "2.5 - Improving" },
  { value: 3.0, label: "3.0 - Competent" },
  { value: 3.5, label: "3.5 - Proficient" },
  { value: 4.0, label: "4.0 - Advanced" },
  { value: 4.5, label: "4.5 - Expert" },
  { value: 5.0, label: "5.0 - Elite" }
];

const SkillSlider: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}> = ({ label, value, onChange, description }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <Label className="text-sm font-medium">{label}</Label>
      <Badge variant="outline">{value.toFixed(1)}</Badge>
    </div>
    {description && (
      <p className="text-xs text-muted-foreground">{description}</p>
    )}
    <Slider
      value={[value]}
      onValueChange={(values) => onChange(values[0])}
      max={5.0}
      min={1.0}
      step={0.1}
      className="w-full"
    />
  </div>
);

export default function PCPAssessment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [assessment, setAssessment] = useState<AssessmentData>({
    profile_id: null,
    coach_id: 1, // TODO: Get from auth context
    assessment_type: 'comprehensive',
    
    // Technical Skills
    serve_execution: 2.0,
    return_technique: 2.0,
    third_shot: 2.0,
    overhead_defense: 2.0,
    shot_creativity: 2.0,
    court_movement: 2.0,
    
    // Groundstrokes Breakdown
    forehand_topspin: 2.0,
    forehand_slice: 2.0,
    backhand_topspin: 2.0,
    backhand_slice: 2.0,
    
    // Net Play Breakdown
    forehand_dead_dink: 2.0,
    forehand_topspin_dink: 2.0,
    forehand_slice_dink: 2.0,
    backhand_dead_dink: 2.0,
    backhand_topspin_dink: 2.0,
    backhand_slice_dink: 2.0,
    forehand_block_volley: 2.0,
    forehand_drive_volley: 2.0,
    forehand_dink_volley: 2.0,
    backhand_block_volley: 2.0,
    backhand_drive_volley: 2.0,
    backhand_dink_volley: 2.0,
    
    // Tactical Awareness
    shot_selection: 2.0,
    court_positioning: 2.0,
    pattern_recognition: 2.0,
    risk_management: 2.0,
    communication: 2.0,
    
    // Physical Attributes
    footwork: 2.0,
    balance_stability: 2.0,
    reaction_time: 2.0,
    endurance: 2.0,
    
    // Mental Game
    focus_concentration: 2.0,
    pressure_performance: 2.0,
    adaptability: 2.0,
    sportsmanship: 2.0,
    
    session_notes: '',
    confidence_level: 0.8
  });

  const submitAssessment = useMutation({
    mutationFn: async (data: AssessmentData) => {
      const response = await apiRequest('POST', '/api/pcp/assessment', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assessment Submitted",
        description: `Player ratings updated successfully. Overall PCP Rating: ${data.data.updatedRatings.overall}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pcp/profile'] });
      
      // Reset form
      setAssessment(prev => ({
        ...prev,
        session_notes: '',
        // Keep ratings for reference but could reset if needed
      }));
    },
    onError: (error) => {
      toast({
        title: "Assessment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSkill = (skill: keyof AssessmentData, value: number) => {
    setAssessment(prev => ({
      ...prev,
      [skill]: value
    }));
  };

  const calculateDimensionalAverage = (skills: number[]): number => {
    return skills.reduce((sum, skill) => sum + skill, 0) / skills.length;
  };

  // Calculate groundstrokes average from detailed breakdown
  const groundstrokesAverage = calculateDimensionalAverage([
    assessment.forehand_topspin,
    assessment.forehand_slice,
    assessment.backhand_topspin,
    assessment.backhand_slice
  ]);

  // Calculate net play average from detailed breakdown
  const netPlayAverage = calculateDimensionalAverage([
    assessment.forehand_dead_dink,
    assessment.forehand_topspin_dink,
    assessment.forehand_slice_dink,
    assessment.backhand_dead_dink,
    assessment.backhand_topspin_dink,
    assessment.backhand_slice_dink,
    assessment.forehand_block_volley,
    assessment.forehand_drive_volley,
    assessment.forehand_dink_volley,
    assessment.backhand_block_volley,
    assessment.backhand_drive_volley,
    assessment.backhand_dink_volley
  ]);

  const technicalAverage = calculateDimensionalAverage([
    assessment.serve_execution,
    assessment.return_technique,
    groundstrokesAverage,
    netPlayAverage,
    assessment.third_shot,
    assessment.overhead_defense,
    assessment.shot_creativity,
    assessment.court_movement
  ]);

  const tacticalAverage = calculateDimensionalAverage([
    assessment.shot_selection,
    assessment.court_positioning,
    assessment.pattern_recognition,
    assessment.risk_management,
    assessment.communication
  ]);

  const physicalAverage = calculateDimensionalAverage([
    assessment.footwork,
    assessment.balance_stability,
    assessment.reaction_time,
    assessment.endurance
  ]);

  const mentalAverage = calculateDimensionalAverage([
    assessment.focus_concentration,
    assessment.pressure_performance,
    assessment.adaptability,
    assessment.sportsmanship
  ]);

  const overallRating = (
    technicalAverage * 0.40 +
    tacticalAverage * 0.25 +
    physicalAverage * 0.20 +
    mentalAverage * 0.15
  );

  const handleSubmit = () => {
    if (!selectedPlayer) {
      toast({
        title: "Player Required",
        description: "Please select a player to assess",
        variant: "destructive",
      });
      return;
    }
    
    const assessmentData = {
      ...assessment,
      profile_id: parseInt(selectedPlayer)
    };
    
    submitAssessment.mutate(assessmentData);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">PCP Player Assessment</h1>
      </div>

      {/* Player Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="player-select">Select Player</Label>
              <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a player to assess" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Player 1 (Demo)</SelectItem>
                  <SelectItem value="2">Player 2 (Demo)</SelectItem>
                  <SelectItem value="3">Player 3 (Demo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assessment-type">Assessment Type</Label>
              <Select 
                value={assessment.assessment_type} 
                onValueChange={(value) => updateSkill('assessment_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Assessment</SelectItem>
                  <SelectItem value="quick">Quick Assessment</SelectItem>
                  <SelectItem value="drill_specific">Drill-Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>PCP Rating Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Technical</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{technicalAverage.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">40% weight</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Brain className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Tactical</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{tacticalAverage.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">25% weight</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Physical</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{physicalAverage.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">20% weight</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Mental</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{mentalAverage.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">15% weight</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium mb-1">Overall PCP</div>
              <div className="text-3xl font-bold text-primary">{overallRating.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Weighted Average</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Assessment Tabs */}
      <Tabs defaultValue="technical" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="tactical" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Tactical
          </TabsTrigger>
          <TabsTrigger value="physical" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Physical
          </TabsTrigger>
          <TabsTrigger value="mental" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Mental
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Technical Skills Assessment (40% weight)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillSlider
                  label="Serve Execution"
                  value={assessment.serve_execution}
                  onChange={(value) => updateSkill('serve_execution', value)}
                  description="Consistency, placement, and power of serves"
                />
                <SkillSlider
                  label="Return Technique"
                  value={assessment.return_technique}
                  onChange={(value) => updateSkill('return_technique', value)}
                  description="Ability to return serves effectively"
                />
              </div>
              
              {/* Groundstrokes Breakdown Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Groundstrokes Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkillSlider
                    label="Forehand Topspin"
                    value={assessment.forehand_topspin}
                    onChange={(value) => updateSkill('forehand_topspin', value)}
                    description="Power and consistency of forehand topspin shots"
                  />
                  <SkillSlider
                    label="Forehand Slice"
                    value={assessment.forehand_slice}
                    onChange={(value) => updateSkill('forehand_slice', value)}
                    description="Control and placement of forehand slice shots"
                  />
                  <SkillSlider
                    label="Backhand Topspin"
                    value={assessment.backhand_topspin}
                    onChange={(value) => updateSkill('backhand_topspin', value)}
                    description="Power and consistency of backhand topspin shots"
                  />
                  <SkillSlider
                    label="Backhand Slice"
                    value={assessment.backhand_slice}
                    onChange={(value) => updateSkill('backhand_slice', value)}
                    description="Control and placement of backhand slice shots"
                  />
                </div>
              </div>

              {/* Net Play Breakdown Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Net Play Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkillSlider
                    label="Forehand Dead Dink"
                    value={assessment.forehand_dead_dink}
                    onChange={(value) => updateSkill('forehand_dead_dink', value)}
                    description="Soft, controlled forehand dinks"
                  />
                  <SkillSlider
                    label="Forehand Topspin Dink"
                    value={assessment.forehand_topspin_dink}
                    onChange={(value) => updateSkill('forehand_topspin_dink', value)}
                    description="Aggressive forehand dinks with topspin"
                  />
                  <SkillSlider
                    label="Forehand Slice Dink"
                    value={assessment.forehand_slice_dink}
                    onChange={(value) => updateSkill('forehand_slice_dink', value)}
                    description="Defensive forehand dinks with slice"
                  />
                  <SkillSlider
                    label="Backhand Dead Dink"
                    value={assessment.backhand_dead_dink}
                    onChange={(value) => updateSkill('backhand_dead_dink', value)}
                    description="Soft, controlled backhand dinks"
                  />
                  <SkillSlider
                    label="Backhand Topspin Dink"
                    value={assessment.backhand_topspin_dink}
                    onChange={(value) => updateSkill('backhand_topspin_dink', value)}
                    description="Aggressive backhand dinks with topspin"
                  />
                  <SkillSlider
                    label="Backhand Slice Dink"
                    value={assessment.backhand_slice_dink}
                    onChange={(value) => updateSkill('backhand_slice_dink', value)}
                    description="Defensive backhand dinks with slice"
                  />
                  <SkillSlider
                    label="Forehand Block Volley"
                    value={assessment.forehand_block_volley}
                    onChange={(value) => updateSkill('forehand_block_volley', value)}
                    description="Defensive forehand volleys at the net"
                  />
                  <SkillSlider
                    label="Forehand Drive Volley"
                    value={assessment.forehand_drive_volley}
                    onChange={(value) => updateSkill('forehand_drive_volley', value)}
                    description="Aggressive forehand volleys with pace"
                  />
                  <SkillSlider
                    label="Forehand Dink Volley"
                    value={assessment.forehand_dink_volley}
                    onChange={(value) => updateSkill('forehand_dink_volley', value)}
                    description="Soft forehand volleys from transition zone"
                  />
                  <SkillSlider
                    label="Backhand Block Volley"
                    value={assessment.backhand_block_volley}
                    onChange={(value) => updateSkill('backhand_block_volley', value)}
                    description="Defensive backhand volleys at the net"
                  />
                  <SkillSlider
                    label="Backhand Drive Volley"
                    value={assessment.backhand_drive_volley}
                    onChange={(value) => updateSkill('backhand_drive_volley', value)}
                    description="Aggressive backhand volleys with pace"
                  />
                  <SkillSlider
                    label="Backhand Dink Volley"
                    value={assessment.backhand_dink_volley}
                    onChange={(value) => updateSkill('backhand_dink_volley', value)}
                    description="Soft backhand volleys from transition zone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillSlider
                  label="Third Shot"
                  value={assessment.third_shot}
                  onChange={(value) => updateSkill('third_shot', value)}
                  description="Drop shots and drive options"
                />
                <SkillSlider
                  label="Overhead Defense"
                  value={assessment.overhead_defense}
                  onChange={(value) => updateSkill('overhead_defense', value)}
                  description="Handling lobs and overhead attacks"
                />
                <SkillSlider
                  label="Shot Creativity"
                  value={assessment.shot_creativity}
                  onChange={(value) => updateSkill('shot_creativity', value)}
                  description="Variety and innovation in shot selection"
                />
                <SkillSlider
                  label="Court Movement"
                  value={assessment.court_movement}
                  onChange={(value) => updateSkill('court_movement', value)}
                  description="Efficiency of movement and positioning"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tactical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-green-600" />
                Tactical Awareness Assessment (25% weight)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillSlider
                  label="Shot Selection"
                  value={assessment.shot_selection}
                  onChange={(value) => updateSkill('shot_selection', value)}
                  description="Choosing appropriate shots for situations"
                />
                <SkillSlider
                  label="Court Positioning"
                  value={assessment.court_positioning}
                  onChange={(value) => updateSkill('court_positioning', value)}
                  description="Strategic positioning on court"
                />
                <SkillSlider
                  label="Pattern Recognition"
                  value={assessment.pattern_recognition}
                  onChange={(value) => updateSkill('pattern_recognition', value)}
                  description="Reading opponent patterns and tendencies"
                />
                <SkillSlider
                  label="Risk Management"
                  value={assessment.risk_management}
                  onChange={(value) => updateSkill('risk_management', value)}
                  description="Balancing aggressive and safe play"
                />
                <SkillSlider
                  label="Communication"
                  value={assessment.communication}
                  onChange={(value) => updateSkill('communication', value)}
                  description="Partner communication in doubles"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Physical Attributes Assessment (20% weight)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillSlider
                  label="Footwork"
                  value={assessment.footwork}
                  onChange={(value) => updateSkill('footwork', value)}
                  description="Speed and efficiency of movement"
                />
                <SkillSlider
                  label="Balance & Stability"
                  value={assessment.balance_stability}
                  onChange={(value) => updateSkill('balance_stability', value)}
                  description="Maintaining balance during play"
                />
                <SkillSlider
                  label="Reaction Time"
                  value={assessment.reaction_time}
                  onChange={(value) => updateSkill('reaction_time', value)}
                  description="Quick responses to opponent shots"
                />
                <SkillSlider
                  label="Endurance"
                  value={assessment.endurance}
                  onChange={(value) => updateSkill('endurance', value)}
                  description="Stamina throughout matches"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mental">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Mental Game Assessment (15% weight)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillSlider
                  label="Focus & Concentration"
                  value={assessment.focus_concentration}
                  onChange={(value) => updateSkill('focus_concentration', value)}
                  description="Maintaining focus during points"
                />
                <SkillSlider
                  label="Pressure Performance"
                  value={assessment.pressure_performance}
                  onChange={(value) => updateSkill('pressure_performance', value)}
                  description="Playing well in high-pressure situations"
                />
                <SkillSlider
                  label="Adaptability"
                  value={assessment.adaptability}
                  onChange={(value) => updateSkill('adaptability', value)}
                  description="Adjusting to different opponents and conditions"
                />
                <SkillSlider
                  label="Sportsmanship"
                  value={assessment.sportsmanship}
                  onChange={(value) => updateSkill('sportsmanship', value)}
                  description="Attitude, respect, and competitive spirit"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Notes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Session Notes & Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Record specific observations, breakthrough moments, areas for improvement, and recommendations for next session..."
            value={assessment.session_notes}
            onChange={(e) => updateSkill('session_notes', e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Assessment */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          onClick={handleSubmit}
          disabled={submitAssessment.isPending || !selectedPlayer}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {submitAssessment.isPending ? 'Submitting...' : 'Submit Assessment'}
        </Button>
      </div>
    </div>
  );
}