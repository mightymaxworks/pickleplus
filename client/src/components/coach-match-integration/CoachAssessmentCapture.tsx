/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 3: Coach Assessment Capture
 * 
 * Real-time PCP assessment capture during match recording that generates transparent points
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Brain, 
  Activity, 
  Zap, 
  Eye, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
  Award,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CoachAssessmentCaptureProps {
  matchId?: number;
  playerId: number;
  coachId: number;
  onAssessmentComplete: (assessment: PcpAssessment) => void;
  onPointsGenerated: (points: TransparentPointsData) => void;
}

interface PcpAssessment {
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  overallImprovement: number;
  sessionNotes: string;
  keyObservations: string[];
  recommendedFocus: string[];
}

interface TransparentPointsData {
  basePoints: number;
  coachingMultiplier: number;
  improvementBonus: number;
  technicalContribution: number;
  tacticalContribution: number;
  physicalContribution: number;
  mentalContribution: number;
  totalPoints: number;
  calculationDetails: string[];
}

export const CoachAssessmentCapture: React.FC<CoachAssessmentCaptureProps> = ({
  matchId,
  playerId,
  coachId,
  onAssessmentComplete,
  onPointsGenerated
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Assessment state
  const [assessment, setAssessment] = useState<PcpAssessment>({
    technical: 50,
    tactical: 50,
    physical: 50,
    mental: 50,
    overallImprovement: 50,
    sessionNotes: '',
    keyObservations: [],
    recommendedFocus: []
  });
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturePhase, setCapturePhase] = useState<'pre' | 'live' | 'post'>('pre');
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  
  // Real-time points preview
  const [pointsPreview, setPointsPreview] = useState<TransparentPointsData | null>(null);
  
  // Calculate points in real-time based on assessment
  useEffect(() => {
    const calculateTransparentPoints = () => {
      const basePoints = 10; // Base match points
      
      // Calculate weighted average of assessments
      const technicalScore = (assessment.technical / 100) * 0.4; // 40% weight
      const tacticalScore = (assessment.tactical / 100) * 0.25; // 25% weight
      const physicalScore = (assessment.physical / 100) * 0.2; // 20% weight
      const mentalScore = (assessment.mental / 100) * 0.15; // 15% weight
      
      const overallScore = technicalScore + tacticalScore + physicalScore + mentalScore;
      
      // Calculate coaching multiplier (1.0 - 1.5x based on overall improvement)
      const coachingMultiplier = 1.0 + (assessment.overallImprovement / 100) * 0.5;
      
      // Calculate improvement bonus (0-3 points)
      const improvementBonus = (assessment.overallImprovement / 100) * 3;
      
      // Calculate dimensional contributions
      const technicalContribution = basePoints * technicalScore;
      const tacticalContribution = basePoints * tacticalScore;
      const physicalContribution = basePoints * physicalScore;
      const mentalContribution = basePoints * mentalScore;
      
      const totalPoints = (basePoints * overallScore * coachingMultiplier) + improvementBonus;
      
      const calculationDetails = [
        `Base Points: ${basePoints}`,
        `Technical (40%): ${technicalScore.toFixed(2)} → ${technicalContribution.toFixed(1)} points`,
        `Tactical (25%): ${tacticalScore.toFixed(2)} → ${tacticalContribution.toFixed(1)} points`,
        `Physical (20%): ${physicalScore.toFixed(2)} → ${physicalContribution.toFixed(1)} points`,
        `Mental (15%): ${mentalScore.toFixed(2)} → ${mentalContribution.toFixed(1)} points`,
        `Coaching Multiplier: ${coachingMultiplier.toFixed(2)}x`,
        `Improvement Bonus: +${improvementBonus.toFixed(1)} points`,
        `Total: ${totalPoints.toFixed(1)} points`
      ];
      
      setPointsPreview({
        basePoints,
        coachingMultiplier,
        improvementBonus,
        technicalContribution,
        tacticalContribution,
        physicalContribution,
        mentalContribution,
        totalPoints,
        calculationDetails
      });
    };
    
    calculateTransparentPoints();
  }, [assessment]);
  
  // Mutation to submit assessment
  const submitAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      const response = await apiRequest('POST', '/api/coach-match-integration/submit-assessment', assessmentData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assessment Submitted",
        description: "PCP assessment captured and transparent points generated",
      });
      onAssessmentComplete(assessment);
      if (pointsPreview) {
        onPointsGenerated(pointsPreview);
      }
    },
    onError: (error) => {
      toast({
        title: "Assessment Failed",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleAssessmentChange = (dimension: keyof PcpAssessment, value: number) => {
    setAssessment(prev => ({
      ...prev,
      [dimension]: value
    }));
  };
  
  const handleSubmitAssessment = () => {
    const assessmentData = {
      matchId,
      playerId,
      coachId,
      assessment,
      pointsData: pointsPreview,
      capturePhase,
      timestamp: new Date().toISOString()
    };
    
    submitAssessmentMutation.mutate(assessmentData);
  };
  
  const handleStartCapture = () => {
    setIsCapturing(true);
    setCapturePhase('live');
    toast({
      title: "Assessment Capture Started",
      description: "Begin evaluating player performance in real-time",
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            PCP Assessment Capture
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time coaching assessment that generates transparent points
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isCapturing ? "destructive" : "secondary"}>
            {isCapturing ? "Live Assessment" : "Ready"}
          </Badge>
          <Badge variant="outline">
            Phase: {capturePhase}
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment">Live Assessment</TabsTrigger>
          <TabsTrigger value="points">Points Preview</TabsTrigger>
          <TabsTrigger value="history">Assessment History</TabsTrigger>
        </TabsList>
        
        {/* Live Assessment Tab */}
        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                4-Dimensional PCP Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Technical Assessment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Technical Skills (40% weight)
                  </Label>
                  <Badge variant="outline">{assessment.technical}%</Badge>
                </div>
                <Slider
                  value={[assessment.technical]}
                  onValueChange={(value) => handleAssessmentChange('technical', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Shot technique, consistency, form quality
                </p>
              </div>
              
              {/* Tactical Assessment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Tactical Awareness (25% weight)
                  </Label>
                  <Badge variant="outline">{assessment.tactical}%</Badge>
                </div>
                <Slider
                  value={[assessment.tactical]}
                  onValueChange={(value) => handleAssessmentChange('tactical', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Strategy, positioning, decision-making
                </p>
              </div>
              
              {/* Physical Assessment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Physical Conditioning (20% weight)
                  </Label>
                  <Badge variant="outline">{assessment.physical}%</Badge>
                </div>
                <Slider
                  value={[assessment.physical]}
                  onValueChange={(value) => handleAssessmentChange('physical', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Endurance, movement, agility
                </p>
              </div>
              
              {/* Mental Assessment */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Mental Toughness (15% weight)
                  </Label>
                  <Badge variant="outline">{assessment.mental}%</Badge>
                </div>
                <Slider
                  value={[assessment.mental]}
                  onValueChange={(value) => handleAssessmentChange('mental', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Focus, composure, resilience
                </p>
              </div>
              
              {/* Overall Improvement */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Session Improvement
                  </Label>
                  <Badge variant="outline">{assessment.overallImprovement}%</Badge>
                </div>
                <Slider
                  value={[assessment.overallImprovement]}
                  onValueChange={(value) => handleAssessmentChange('overallImprovement', value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Improvement observed during this session
                </p>
              </div>
              
              {/* Session Notes */}
              <div className="space-y-2">
                <Label>Session Notes</Label>
                <Textarea
                  placeholder="Enter detailed observations about player performance..."
                  value={assessment.sessionNotes}
                  onChange={(e) => setAssessment(prev => ({ ...prev, sessionNotes: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isCapturing ? (
                  <Button onClick={handleStartCapture} className="flex-1">
                    <Activity className="h-4 w-4 mr-2" />
                    Start Assessment Capture
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmitAssessment}
                    disabled={submitAssessmentMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {submitAssessmentMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Points Preview Tab */}
        <TabsContent value="points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Transparent Points Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pointsPreview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Base Points</Label>
                      <div className="text-2xl font-bold">{pointsPreview.basePoints}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Final Points</Label>
                      <div className="text-2xl font-bold text-green-600">
                        {pointsPreview.totalPoints.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Calculation Breakdown</Label>
                    <div className="bg-muted p-3 rounded text-sm space-y-1">
                      {pointsPreview.calculationDetails.map((detail, index) => (
                        <div key={index} className="font-mono">
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This is a real-time preview. Points will be officially generated when assessment is submitted.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Adjust assessment values to see points preview
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Assessment History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Assessment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Assessment history will appear here after submissions
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};