/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 2: Transparent Points Allocation Demo
 * 
 * Demo component showcasing the transparent PCP points allocation system
 * with detailed breakdown and coach-match correlation visualization
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Users, Target, Award, BarChart3 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PointsBreakdown {
  id: number;
  matchId: number;
  playerId: number;
  coachId?: number;
  basePoints: number;
  coachingMultiplier: number;
  improvementBonus: number;
  consistencyBonus: number;
  technicalPoints: number;
  tacticalPoints: number;
  physicalPoints: number;
  mentalPoints: number;
  totalPoints: number;
  calculationMethod: string;
  factorsConsidered: {
    matchResult: boolean;
    opponentRating: boolean;
    coachingPresence: boolean;
    skillImprovement: boolean;
    consistency: boolean;
    matchContext: boolean;
  };
  breakdown: Array<{
    category: string;
    description: string;
    value: number;
    reasoning: string;
  }>;
}

interface CoachEffectiveness {
  id: number;
  coachId: number;
  studentId: number;
  preMatchEffectiveness: number;
  liveCoachingEffectiveness: number;
  postMatchEffectiveness: number;
  immediateImprovement: number;
  sessionToSessionImprovement: number;
  pointsWithoutCoaching: number;
  pointsWithCoaching: number;
  coachingImpact: number;
  overallEffectiveness: number;
  effectivenessFactors: Array<{
    factor: string;
    score: number;
    weight: number;
    description: string;
  }>;
}

interface MatchCoachingCorrelation {
  id: number;
  coachId: number;
  studentId: number;
  matchesWithCoaching: number;
  matchesWithoutCoaching: number;
  avgPointsWithCoaching: number;
  avgPointsWithoutCoaching: number;
  improvementDifference: number;
  technicalProgression: number;
  tacticalProgression: number;
  physicalProgression: number;
  mentalProgression: number;
  correlationCoefficient: number;
  confidenceLevel: number;
  trendAnalysis: Array<{
    period: string;
    trend: string;
    strength: number;
    description: string;
  }>;
}

const TransparentPointsAllocationDemo: React.FC = () => {
  const [selectedCoach, setSelectedCoach] = useState<number>(1);
  const [selectedStudent, setSelectedStudent] = useState<number>(2);
  const [selectedMatch, setSelectedMatch] = useState<number>(123);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample data for demonstration
  const samplePointsBreakdown: PointsBreakdown = {
    id: 1,
    matchId: 123,
    playerId: 2,
    coachId: 1,
    basePoints: 10,
    coachingMultiplier: 1.25,
    improvementBonus: 2,
    consistencyBonus: 1.5,
    technicalPoints: 4.2,
    tacticalPoints: 3.8,
    physicalPoints: 3.1,
    mentalPoints: 2.4,
    totalPoints: 16.9,
    calculationMethod: 'enhanced_coaching',
    factorsConsidered: {
      matchResult: true,
      opponentRating: true,
      coachingPresence: true,
      skillImprovement: true,
      consistency: true,
      matchContext: true
    },
    breakdown: [
      { category: 'Match Result', description: 'Won 6-4, 6-3 against higher-rated opponent', value: 10, reasoning: 'Solid performance against challenging opponent' },
      { category: 'Coaching Presence', description: 'Live coaching from certified coach', value: 2.5, reasoning: 'Coaching multiplier applied (1.25x)' },
      { category: 'Technical Improvement', description: 'Significant forehand consistency gains', value: 2, reasoning: 'Immediate technical improvement observed' },
      { category: 'Tactical Awareness', description: 'Better court positioning and shot selection', value: 1.5, reasoning: 'Improved decision-making during match' },
      { category: 'Mental Resilience', description: 'Maintained composure under pressure', value: 0.9, reasoning: 'Strong mental game demonstrated' }
    ]
  };

  const sampleCoachEffectiveness: CoachEffectiveness = {
    id: 1,
    coachId: 1,
    studentId: 2,
    preMatchEffectiveness: 78.5,
    liveCoachingEffectiveness: 85.2,
    postMatchEffectiveness: 82.1,
    immediateImprovement: 12.7,
    sessionToSessionImprovement: 8.4,
    pointsWithoutCoaching: 12.3,
    pointsWithCoaching: 16.9,
    coachingImpact: 4.6,
    overallEffectiveness: 82.6,
    effectivenessFactors: [
      { factor: 'Technical Guidance', score: 8.7, weight: 0.3, description: 'Excellent stroke mechanics instruction' },
      { factor: 'Tactical Insight', score: 8.2, weight: 0.25, description: 'Strong strategic game planning' },
      { factor: 'Mental Coaching', score: 7.9, weight: 0.2, description: 'Good confidence building' },
      { factor: 'Communication', score: 9.1, weight: 0.15, description: 'Clear, actionable feedback' },
      { factor: 'Motivation', score: 8.5, weight: 0.1, description: 'Positive encouragement' }
    ]
  };

  const sampleCorrelation: MatchCoachingCorrelation = {
    id: 1,
    coachId: 1,
    studentId: 2,
    matchesWithCoaching: 8,
    matchesWithoutCoaching: 12,
    avgPointsWithCoaching: 16.4,
    avgPointsWithoutCoaching: 11.8,
    improvementDifference: 4.6,
    technicalProgression: 15.3,
    tacticalProgression: 12.7,
    physicalProgression: 8.9,
    mentalProgression: 11.2,
    correlationCoefficient: 0.78,
    confidenceLevel: 0.92,
    trendAnalysis: [
      { period: 'Last 30 days', trend: 'Positive', strength: 0.78, description: 'Strong upward trend in performance' },
      { period: 'Last 7 days', trend: 'Accelerating', strength: 0.85, description: 'Improvement rate increasing' },
      { period: 'Match consistency', trend: 'Stabilizing', strength: 0.71, description: 'More consistent performance levels' }
    ]
  };

  const createPointsAllocation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/transparent-points/allocation', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Points allocation breakdown created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transparent-points/allocation'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create points allocation breakdown",
        variant: "destructive",
      });
    }
  });

  const PointsBreakdownCard = ({ breakdown }: { breakdown: PointsBreakdown }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Points Allocation Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Points Display */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{breakdown.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total PCP Points Earned</div>
          </div>

          {/* 4-Dimensional Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Technical</span>
                <span className="font-medium">{breakdown.technicalPoints}</span>
              </div>
              <Progress value={(breakdown.technicalPoints / breakdown.totalPoints) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Tactical</span>
                <span className="font-medium">{breakdown.tacticalPoints}</span>
              </div>
              <Progress value={(breakdown.tacticalPoints / breakdown.totalPoints) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Physical</span>
                <span className="font-medium">{breakdown.physicalPoints}</span>
              </div>
              <Progress value={(breakdown.physicalPoints / breakdown.totalPoints) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Mental</span>
                <span className="font-medium">{breakdown.mentalPoints}</span>
              </div>
              <Progress value={(breakdown.mentalPoints / breakdown.totalPoints) * 100} className="h-2" />
            </div>
          </div>

          {/* Factors Considered */}
          <div>
            <h4 className="font-medium mb-2">Factors Considered</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(breakdown.factorsConsidered).map(([factor, considered]) => (
                <Badge key={factor} variant={considered ? "default" : "secondary"}>
                  {factor.replace(/([A-Z])/g, ' $1').trim()}
                </Badge>
              ))}
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div>
            <h4 className="font-medium mb-2">Detailed Breakdown</h4>
            <div className="space-y-2">
              {breakdown.breakdown.map((item, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">+{item.value}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                  <div className="text-sm mt-2 italic">{item.reasoning}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CoachEffectivenessCard = ({ effectiveness }: { effectiveness: CoachEffectiveness }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Coach Effectiveness Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Effectiveness */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{effectiveness.overallEffectiveness}%</div>
            <div className="text-sm text-muted-foreground">Overall Coach Effectiveness</div>
          </div>

          {/* Effectiveness Phases */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{effectiveness.preMatchEffectiveness}%</div>
              <div className="text-sm text-muted-foreground">Pre-Match</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{effectiveness.liveCoachingEffectiveness}%</div>
              <div className="text-sm text-muted-foreground">Live Coaching</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{effectiveness.postMatchEffectiveness}%</div>
              <div className="text-sm text-muted-foreground">Post-Match</div>
            </div>
          </div>

          {/* Coaching Impact */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Coaching Impact</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Without Coaching</div>
                <div className="text-lg font-semibold">{effectiveness.pointsWithoutCoaching} pts</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">With Coaching</div>
                <div className="text-lg font-semibold">{effectiveness.pointsWithCoaching} pts</div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-xl font-bold text-green-600">+{effectiveness.coachingImpact} pts</div>
              <div className="text-sm text-muted-foreground">Improvement from coaching</div>
            </div>
          </div>

          {/* Effectiveness Factors */}
          <div>
            <h4 className="font-medium mb-2">Effectiveness Factors</h4>
            <div className="space-y-2">
              {effectiveness.effectivenessFactors.map((factor, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">{factor.factor}</span>
                    <span className="font-medium">{factor.score}/10</span>
                  </div>
                  <Progress value={(factor.score / 10) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">{factor.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CorrelationCard = ({ correlation }: { correlation: MatchCoachingCorrelation }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Coach-Match Correlation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Correlation Coefficient */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{correlation.correlationCoefficient}</div>
            <div className="text-sm text-muted-foreground">Correlation Coefficient</div>
            <div className="text-xs text-muted-foreground mt-1">
              Confidence Level: {(correlation.confidenceLevel * 100).toFixed(1)}%
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-muted-foreground">With Coaching</div>
              <div className="text-lg font-semibold">{correlation.avgPointsWithCoaching} pts</div>
              <div className="text-xs text-muted-foreground">{correlation.matchesWithCoaching} matches</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Without Coaching</div>
              <div className="text-lg font-semibold">{correlation.avgPointsWithoutCoaching} pts</div>
              <div className="text-xs text-muted-foreground">{correlation.matchesWithoutCoaching} matches</div>
            </div>
          </div>

          {/* Improvement Difference */}
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">+{correlation.improvementDifference} pts</div>
            <div className="text-sm text-muted-foreground">Average improvement with coaching</div>
          </div>

          {/* Skill Progression */}
          <div>
            <h4 className="font-medium mb-2">Skill Progression (%)</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Technical</span>
                <span className="font-medium">+{correlation.technicalProgression}%</span>
              </div>
              <Progress value={correlation.technicalProgression} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Tactical</span>
                <span className="font-medium">+{correlation.tacticalProgression}%</span>
              </div>
              <Progress value={correlation.tacticalProgression} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Physical</span>
                <span className="font-medium">+{correlation.physicalProgression}%</span>
              </div>
              <Progress value={correlation.physicalProgression} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Mental</span>
                <span className="font-medium">+{correlation.mentalProgression}%</span>
              </div>
              <Progress value={correlation.mentalProgression} className="h-2" />
            </div>
          </div>

          {/* Trend Analysis */}
          <div>
            <h4 className="font-medium mb-2">Trend Analysis</h4>
            <div className="space-y-2">
              {correlation.trendAnalysis.map((trend, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{trend.period}</div>
                      <div className="text-sm text-muted-foreground">{trend.description}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={trend.trend === 'Positive' ? 'default' : 'secondary'}>
                        {trend.trend}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        Strength: {(trend.strength * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Transparent Points Allocation System</h1>
        <p className="text-muted-foreground">
          Phase 2: Detailed PCP points breakdown with coach-match correlation analysis
        </p>
      </div>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakdown">Points Breakdown</TabsTrigger>
          <TabsTrigger value="effectiveness">Coach Effectiveness</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <PointsBreakdownCard breakdown={samplePointsBreakdown} />
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-4">
          <CoachEffectivenessCard effectiveness={sampleCoachEffectiveness} />
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <CorrelationCard correlation={sampleCorrelation} />
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <Button
          onClick={() => createPointsAllocation.mutate(samplePointsBreakdown)}
          disabled={createPointsAllocation.isPending}
          className="w-full sm:w-auto"
        >
          {createPointsAllocation.isPending ? 'Creating...' : 'Create Sample Allocation'}
        </Button>
      </div>
    </div>
  );
};

export default TransparentPointsAllocationDemo;