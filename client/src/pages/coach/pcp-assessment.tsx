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
  groundstrokes: number;
  net_play: number;
  third_shot: number;
  overhead_defense: number;
  shot_creativity: number;
  court_movement: number;
  
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
    groundstrokes: 2.0,
    net_play: 2.0,
    third_shot: 2.0,
    overhead_defense: 2.0,
    shot_creativity: 2.0,
    court_movement: 2.0,
    
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

  const technicalAverage = calculateDimensionalAverage([
    assessment.serve_execution,
    assessment.return_technique,
    assessment.groundstrokes,
    assessment.net_play,
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
                <SkillSlider
                  label="Groundstrokes"
                  value={assessment.groundstrokes}
                  onChange={(value) => updateSkill('groundstrokes', value)}
                  description="Forehand and backhand fundamentals"
                />
                <SkillSlider
                  label="Net Play"
                  value={assessment.net_play}
                  onChange={(value) => updateSkill('net_play', value)}
                  description="Volleys, dinks, and net positioning"
                />
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