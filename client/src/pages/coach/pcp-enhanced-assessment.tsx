/**
 * PCP Enhanced Assessment Interface
 * Comprehensive 4-dimensional player assessment with real-time calculations
 */

import { useState } from 'react';
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
    returnTechnique: number;
    groundstrokes: number;
    netPlay: number;
    thirdShot: number;
    overheadDefense: number;
    shotCreativity: number;
    courtMovement: number;
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

  const [selectedPlayer, setSelectedPlayer] = useState<number>(1);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    playerId: 1,
    coachId: 1,
    assessmentType: 'progress',
    technicalSkills: {
      serveExecution: 5,
      returnTechnique: 5,
      groundstrokes: 5,
      netPlay: 5,
      thirdShot: 5,
      overheadDefense: 5,
      shotCreativity: 5,
      courtMovement: 5
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
      const response = await fetch('/api/pcp/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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
    <div className="min-h-screen bg-gray-50 p-6">
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
                <CardTitle>Technical Skills Assessment</CardTitle>
                <CardDescription>
                  Evaluate fundamental stroke technique and execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(assessmentData.technicalSkills).map(([skill, value]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium capitalize">
                        {skill.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Badge variant="outline">{value}/10</Badge>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => updateSkillValue('technicalSkills', skill, newValue[0])}
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