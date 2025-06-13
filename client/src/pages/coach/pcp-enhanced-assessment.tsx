/**
 * PCP Enhanced Assessment Interface
 * Comprehensive 4-dimensional player assessment with real-time calculations
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  TrendingUp, 
  Target, 
  Brain, 
  Zap, 
  Heart,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface AssessmentData {
  playerId: number;
  coachId: number;
  assessmentType: 'initial' | 'progress' | 'final';
  technicalSkills: {
    serveExecution: number;
    thirdShot: number;
    shotCreativity: number;
    courtMovement: number;
    // Return Technique Breakdown
    forehandReturnCrossCourt: number;
    forehandReturnDownLine: number;
    backhandReturnCrossCourt: number;
    backhandReturnDownLine: number;
    // Groundstrokes Breakdown
    forehandTopspin: number;
    forehandSlice: number;
    backhandTopspin: number;
    backhandSlice: number;
    // Drop Shot Breakdown
    forehandEasyDropShot: number;
    forehandTopspinDropShot: number;
    forehandSliceDropShot: number;
    backhandEasyDropShot: number;
    backhandTopspinDropShot: number;
    backhandSliceDropShot: number;
    // Lob Breakdown
    forehandLob: number;
    backhandLob: number;
    // Net Play Breakdown (Dinks)
    forehandDeadDink: number;
    forehandTopspinDink: number;
    forehandSliceDink: number;
    backhandDeadDink: number;
    backhandTopspinDink: number;
    backhandSliceDink: number;
    // Net Play Breakdown (Volleys)
    forehandBlockVolley: number;
    forehandDriveVolley: number;
    forehandDinkVolley: number;
    backhandBlockVolley: number;
    backhandDriveVolley: number;
    backhandDinkVolley: number;
    // Net Play Breakdown (Smashes)
    forehandSmash: number;
    backhandSmash: number;
    [key: string]: number;
  };
  tacticalSkills: {
    shotSelection: number;
    courtPositioning: number;
    patternRecognition: number;
    riskManagement: number;
    communication: number;
  };
  physicalSkills: {
    footwork: number;
    balanceStability: number;
    reactionTime: number;
    endurance: number;
  };
  mentalSkills: {
    focusConcentration: number;
    pressurePerformance: number;
    adaptability: number;
    sportsmanship: number;
  };
  confidenceLevel: number;
  sessionNotes: string;
  improvementAreas: string[];
  strengthsNoted: string[];
  nextSessionFocus: string;
}

export default function PCPEnhancedAssessment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  const [selectedPlayer, setSelectedPlayer] = useState<number>(1);

  // Extract playerId from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('playerId');
    if (playerId) {
      setSelectedPlayer(parseInt(playerId));
      setAssessmentData(prev => ({ ...prev, playerId: parseInt(playerId) }));
    }
  }, [location]);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    playerId: 1,
    coachId: 1,
    assessmentType: 'progress',
    technicalSkills: {
      serveExecution: 5,
      thirdShot: 5,
      shotCreativity: 5,
      courtMovement: 5,
      // Return Technique Breakdown
      forehandReturnCrossCourt: 5,
      forehandReturnDownLine: 5,
      backhandReturnCrossCourt: 5,
      backhandReturnDownLine: 5,
      // Groundstrokes Breakdown
      forehandTopspin: 5,
      forehandSlice: 5,
      backhandTopspin: 5,
      backhandSlice: 5,
      // Drop Shot Breakdown
      forehandEasyDropShot: 5,
      forehandTopspinDropShot: 5,
      forehandSliceDropShot: 5,
      backhandEasyDropShot: 5,
      backhandTopspinDropShot: 5,
      backhandSliceDropShot: 5,
      // Lob Breakdown
      forehandLob: 5,
      backhandLob: 5,
      // Net Play Breakdown (Dinks)
      forehandDeadDink: 5,
      forehandTopspinDink: 5,
      forehandSliceDink: 5,
      backhandDeadDink: 5,
      backhandTopspinDink: 5,
      backhandSliceDink: 5,
      // Net Play Breakdown (Volleys)
      forehandBlockVolley: 5,
      forehandDriveVolley: 5,
      forehandDinkVolley: 5,
      backhandBlockVolley: 5,
      backhandDriveVolley: 5,
      backhandDinkVolley: 5,
      // Net Play Breakdown (Smashes)
      forehandSmash: 5,
      backhandSmash: 5
    },
    tacticalSkills: {
      shotSelection: 5,
      courtPositioning: 5,
      patternRecognition: 5,
      riskManagement: 5,
      communication: 5
    },
    physicalSkills: {
      footwork: 5,
      balanceStability: 5,
      reactionTime: 5,
      endurance: 5
    },
    mentalSkills: {
      focusConcentration: 5,
      pressurePerformance: 5,
      adaptability: 5,
      sportsmanship: 5
    },
    confidenceLevel: 5,
    sessionNotes: '',
    improvementAreas: [],
    strengthsNoted: [],
    nextSessionFocus: ''
  });

  // Calculate dimensional ratings in real-time
  const calculateDimensionalRating = (skills: Record<string, number>): number => {
    const values = Object.values(skills);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const technicalRating = calculateDimensionalRating(assessmentData.technicalSkills);
  const tacticalRating = calculateDimensionalRating(assessmentData.tacticalSkills);
  const physicalRating = calculateDimensionalRating(assessmentData.physicalSkills);
  const mentalRating = calculateDimensionalRating(assessmentData.mentalSkills);

  // PCP Overall Rating Calculation (Technical 40%, Tactical 25%, Physical 20%, Mental 15%)
  const overallRating = (technicalRating * 0.4) + (tacticalRating * 0.25) + (physicalRating * 0.2) + (mentalRating * 0.15);

  const submitAssessment = useMutation({
    mutationFn: async (data: AssessmentData) => {
      // Transform camelCase to snake_case for server
      const serverData = {
        profile_id: data.playerId,
        coach_id: data.coachId,
        assessment_type: data.assessmentType,
        serve_execution: data.technicalSkills.serveExecution,
        return_technique: data.technicalSkills.returnTechnique,
        third_shot: data.technicalSkills.thirdShot,
        overhead_defense: data.technicalSkills.overheadDefense,
        shot_creativity: data.technicalSkills.shotCreativity,
        court_movement: data.technicalSkills.courtMovement,
        // Detailed groundstrokes
        forehand_topspin: data.technicalSkills.forehandTopspin,
        forehand_slice: data.technicalSkills.forehandSlice,
        backhand_topspin: data.technicalSkills.backhandTopspin,
        backhand_slice: data.technicalSkills.backhandSlice,
        // Detailed net play
        forehand_dead_dink: data.technicalSkills.forehandDeadDink,
        forehand_topspin_dink: data.technicalSkills.forehandTopspinDink,
        forehand_slice_dink: data.technicalSkills.forehandSliceDink,
        backhand_dead_dink: data.technicalSkills.backhandDeadDink,
        backhand_topspin_dink: data.technicalSkills.backhandTopspinDink,
        backhand_slice_dink: data.technicalSkills.backhandSliceDink,
        forehand_block_volley: data.technicalSkills.forehandBlockVolley,
        forehand_drive_volley: data.technicalSkills.forehandDriveVolley,
        forehand_dink_volley: data.technicalSkills.forehandDinkVolley,
        backhand_block_volley: data.technicalSkills.backhandBlockVolley,
        backhand_drive_volley: data.technicalSkills.backhandDriveVolley,
        backhand_dink_volley: data.technicalSkills.backhandDinkVolley,
        // Tactical skills
        shot_selection: data.tacticalSkills.shotSelection,
        court_positioning: data.tacticalSkills.courtPositioning,
        pattern_recognition: data.tacticalSkills.patternRecognition,
        risk_management: data.tacticalSkills.riskManagement,
        communication: data.tacticalSkills.communication,
        // Physical skills
        footwork: data.physicalSkills.footwork,
        balance_stability: data.physicalSkills.balanceStability,
        reaction_time: data.physicalSkills.reactionTime,
        endurance: data.physicalSkills.endurance,
        // Mental skills
        focus_concentration: data.mentalSkills.focusConcentration,
        pressure_performance: data.mentalSkills.pressurePerformance,
        adaptability: data.mentalSkills.adaptability,
        sportsmanship: data.mentalSkills.sportsmanship,
        confidence_level: data.confidenceLevel,
        session_notes: data.sessionNotes
      };
      
      const response = await fetch('/api/pcp/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData)
      });
      if (!response.ok) throw new Error('Failed to submit assessment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Submitted",
        description: "Player assessment has been successfully recorded",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pcp/coach/dashboard'] });
    },
    onError: (error) => {
      toast({
        title: "Assessment Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateSkillValue = (category: keyof Omit<AssessmentData, 'playerId' | 'coachId' | 'assessmentType' | 'confidenceLevel' | 'sessionNotes' | 'improvementAreas' | 'strengthsNoted' | 'nextSessionFocus'>, skill: string, value: number) => {
    setAssessmentData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [skill]: value
      }
    }));
  };

  const handleSubmit = () => {
    submitAssessment.mutate(assessmentData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-[55px] mb-[55px]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PCP Player Assessment</h1>
            <p className="text-gray-600 mt-1">4-Dimensional Skill Evaluation System</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              Overall: {overallRating.toFixed(1)}/10.0
            </Badge>
            <Button 
              onClick={handleSubmit}
              disabled={submitAssessment.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {submitAssessment.isPending ? 'Saving...' : 'Submit Assessment'}
            </Button>
          </div>
        </div>

        {/* Real-time Rating Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Live Rating Calculation
            </CardTitle>
            <CardDescription>
              Ratings update automatically based on your skill assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Technical (40%)</Label>
                  <span className="text-sm font-bold text-blue-600">{technicalRating.toFixed(1)}</span>
                </div>
                <Progress value={technicalRating * 10} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Tactical (25%)</Label>
                  <span className="text-sm font-bold text-green-600">{tacticalRating.toFixed(1)}</span>
                </div>
                <Progress value={tacticalRating * 10} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Physical (20%)</Label>
                  <span className="text-sm font-bold text-orange-600">{physicalRating.toFixed(1)}</span>
                </div>
                <Progress value={physicalRating * 10} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Mental (15%)</Label>
                  <span className="text-sm font-bold text-purple-600">{mentalRating.toFixed(1)}</span>
                </div>
                <Progress value={mentalRating * 10} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Tabs */}
        <Tabs defaultValue="technical" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="technical" className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Technical
            </TabsTrigger>
            <TabsTrigger value="tactical" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Tactical
            </TabsTrigger>
            <TabsTrigger value="physical" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Physical
            </TabsTrigger>
            <TabsTrigger value="mental" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Mental
            </TabsTrigger>
          </TabsList>

          {/* Technical Skills */}
          <TabsContent value="technical">
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills Assessment (40% weight)</CardTitle>
                <CardDescription>
                  Comprehensive evaluation of stroke technique and execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Core Technical Skills */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">Core Technical Skills</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['serveExecution', 'returnTechnique', 'thirdShot', 'overheadDefense', 'shotCreativity', 'courtMovement'].map((skill) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium capitalize">
                            {skill.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Badge variant="outline">{assessmentData.technicalSkills[skill]}/10</Badge>
                        </div>
                        <Slider
                          value={[assessmentData.technicalSkills[skill]]}
                          onValueChange={(newValue) => updateSkillValue('technicalSkills', skill, newValue[0])}
                          max={10}
                          min={1}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Groundstrokes Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-600">Groundstrokes Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['forehandTopspin', 'forehandSlice', 'backhandTopspin', 'backhandSlice'].map((skill) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium capitalize">
                            {skill.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Badge variant="outline">{assessmentData.technicalSkills[skill]}/10</Badge>
                        </div>
                        <Slider
                          value={[assessmentData.technicalSkills[skill]]}
                          onValueChange={(newValue) => updateSkillValue('technicalSkills', skill, newValue[0])}
                          max={10}
                          min={1}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Net Play Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-purple-600">Net Play Breakdown</h3>
                  
                  {/* Dink Variations */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-3 text-gray-700">Dink Variations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['forehandDeadDink', 'forehandTopspinDink', 'forehandSliceDink', 'backhandDeadDink', 'backhandTopspinDink', 'backhandSliceDink'].map((skill) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium capitalize">
                              {skill.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <Badge variant="outline">{assessmentData.technicalSkills[skill]}/10</Badge>
                          </div>
                          <Slider
                            value={[assessmentData.technicalSkills[skill]]}
                            onValueChange={(newValue) => updateSkillValue('technicalSkills', skill, newValue[0])}
                            max={10}
                            min={1}
                            step={0.5}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Volley Variations */}
                  <div>
                    <h4 className="text-md font-medium mb-3 text-gray-700">Volley Variations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['forehandBlockVolley', 'forehandDriveVolley', 'forehandDinkVolley', 'backhandBlockVolley', 'backhandDriveVolley', 'backhandDinkVolley'].map((skill) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium capitalize">
                              {skill.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <Badge variant="outline">{assessmentData.technicalSkills[skill]}/10</Badge>
                          </div>
                          <Slider
                            value={[assessmentData.technicalSkills[skill]]}
                            onValueChange={(newValue) => updateSkillValue('technicalSkills', skill, newValue[0])}
                            max={10}
                            min={1}
                            step={0.5}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tactical Skills */}
          <TabsContent value="tactical">
            <Card>
              <CardHeader>
                <CardTitle>Tactical Skills Assessment</CardTitle>
                <CardDescription>
                  Evaluate court awareness and strategic decision making
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(assessmentData.tacticalSkills).map(([skill, value]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Badge variant="outline">{value}/10</Badge>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => updateSkillValue('tacticalSkills', skill, newValue[0])}
                      max={10}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Physical Skills */}
          <TabsContent value="physical">
            <Card>
              <CardHeader>
                <CardTitle>Physical Skills Assessment</CardTitle>
                <CardDescription>
                  Evaluate athleticism and court mobility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(assessmentData.physicalSkills).map(([skill, value]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Badge variant="outline">{value}/10</Badge>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => updateSkillValue('physicalSkills', skill, newValue[0])}
                      max={10}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mental Skills */}
          <TabsContent value="mental">
            <Card>
              <CardHeader>
                <CardTitle>Mental Skills Assessment</CardTitle>
                <CardDescription>
                  Evaluate psychological resilience and competitive mindset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(assessmentData.mentalSkills).map(([skill, value]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Badge variant="outline">{value}/10</Badge>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => updateSkillValue('mentalSkills', skill, newValue[0])}
                      max={10}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session Notes and Planning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Session Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionNotes">Detailed Observations</Label>
                <Textarea
                  id="sessionNotes"
                  value={assessmentData.sessionNotes}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, sessionNotes: e.target.value }))}
                  placeholder="Record specific observations about technique, performance, and areas for improvement..."
                  className="mt-2 min-h-[120px]"
                />
              </div>
              <div>
                <Label htmlFor="nextFocus">Next Session Focus</Label>
                <Input
                  id="nextFocus"
                  value={assessmentData.nextSessionFocus}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, nextSessionFocus: e.target.value }))}
                  placeholder="Primary focus areas for next coaching session"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Player Confidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Confidence Level</Label>
                  <Badge variant="outline">{assessmentData.confidenceLevel}/10</Badge>
                </div>
                <Slider
                  value={[assessmentData.confidenceLevel]}
                  onValueChange={(value) => setAssessmentData(prev => ({ ...prev, confidenceLevel: value[0] }))}
                  max={10}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <div className="pt-4">
                <div className="flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="text-sm text-gray-600">
                    Assessment will be saved to player's PCP profile
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}