/**
 * Weighted Assessment Dashboard Component
 * 
 * Displays the sophisticated coach-weighted assessment system with
 * real-time weighting visualization and quality metrics.
 */

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Target,
  Brain,
  Zap
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface WeightedPCPResult {
  finalPCPRating: number;
  categoryBreakdown: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
  };
  contributingAssessments: {
    coachId: number;
    coachLevel: number;
    weight: number;
    confidence: number;
    recency: number;
  }[];
  qualityMetrics: {
    totalWeight: number;
    assessmentCount: number;
    averageCoachLevel: number;
    consensusScore: number;
  };
}

interface ValidationStatus {
  isValid: boolean;
  reason?: string;
  requiresHigherLevelValidation?: boolean;
}

interface CoachInfo {
  coachLevel: number;
  assessmentCapabilities: {
    baseWeight: number;
    confidenceFactors: {
      technical: number;
      tactical: number;
      physical: number;
      mental: number;
    };
    validationAuthority: {
      canValidateL1L2: boolean;
      canProvideFinalAssessment: boolean;
      requiresValidation: boolean;
      assessmentValidityDays: number;
    };
  };
  specializations: string[];
}

interface WeightedAssessmentDashboardProps {
  studentId: number;
  studentName: string;
}

export function WeightedAssessmentDashboard({ 
  studentId, 
  studentName 
}: WeightedAssessmentDashboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch weighted PCP data
  const { data: weightedPCP, isLoading: loadingPCP } = useQuery<WeightedPCPResult>({
    queryKey: ['/api/coach-weighted-assessment/calculate', studentId],
    retry: false
  });

  // Fetch validation status
  const { data: validationStatus, isLoading: loadingValidation } = useQuery({
    queryKey: ['/api/coach-weighted-assessment/validation-status', studentId],
    retry: false
  });

  // Fetch coach info
  const { data: coachInfo } = useQuery<{ coachInfo: CoachInfo }>({
    queryKey: ['/api/coach-weighted-assessment/coach-info'],
    retry: false
  });

  const getCoachLevelColor = (level: number): string => {
    switch (level) {
      case 1: return 'bg-slate-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-green-500';
      case 4: return 'bg-purple-500';
      case 5: return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getCoachLevelName = (level: number): string => {
    switch (level) {
      case 1: return 'Foundational';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      case 4: return 'Expert';
      case 5: return 'Master';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Target className="h-4 w-4" />;
      case 'tactical': return <Brain className="h-4 w-4" />;
      case 'physical': return <Zap className="h-4 w-4" />;
      case 'mental': return <Star className="h-4 w-4" />;
      default: return <Scale className="h-4 w-4" />;
    }
  };

  if (loadingPCP || loadingValidation) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading weighted assessment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weighted Assessment Dashboard</h1>
          <p className="text-muted-foreground">
            Student: {studentName} • Coach-Level Weighted PCP System
          </p>
        </div>
        {coachInfo && (
          <Badge className={`${getCoachLevelColor(coachInfo.coachInfo.coachLevel)} text-white`}>
            L{coachInfo.coachInfo.coachLevel} {getCoachLevelName(coachInfo.coachInfo.coachLevel)}
          </Badge>
        )}
      </div>

      {/* Validation Alerts */}
      {validationStatus && !validationStatus.validation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {validationStatus.validation.reason}
            {validationStatus.validation.requiresHigherLevelValidation && (
              <span className="block mt-2 text-sm">
                L3+ coach validation required for accurate rating.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
          <TabsTrigger value="contributors">Contributing Coaches</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main PCP Rating */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Weighted PCP Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weightedPCP ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {weightedPCP.finalPCPRating.toFixed(2)}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Based on {weightedPCP.qualityMetrics.assessmentCount} coach assessments
                    </p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      {Object.entries(weightedPCP.categoryBreakdown).map(([category, score]) => (
                        <div key={category} className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            {getCategoryIcon(category)}
                          </div>
                          <div className="font-semibold">{score.toFixed(1)}</div>
                          <div className="text-muted-foreground capitalize">{category}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No weighted assessment data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assessment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Assessment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validationStatus?.validation.isValid ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Valid Assessment</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Requires Validation</span>
                  </div>
                )}

                {validationStatus?.nextAssessment && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Next Assessment</div>
                    <div className="text-xs text-muted-foreground">
                      Recommended: L{validationStatus.nextAssessment.recommendedCoachLevel}+ coach
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {validationStatus.nextAssessment.reason}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Category Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          {weightedPCP && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(weightedPCP.categoryBreakdown).map(([category, score]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {getCategoryIcon(category)}
                      {category} Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{score.toFixed(2)}</span>
                        <Badge variant="outline">{((score / 10) * 100).toFixed(0)}%</Badge>
                      </div>
                      <Progress value={(score / 10) * 100} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        Weight in final PCP: {
                          category === 'technical' ? '40%' :
                          category === 'tactical' ? '25%' :
                          category === 'physical' ? '20%' : '15%'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Contributing Coaches Tab */}
        <TabsContent value="contributors" className="space-y-6">
          {weightedPCP && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contributing Coach Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weightedPCP.contributingAssessments.map((assessment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getCoachLevelColor(assessment.coachLevel)} text-white`}>
                          L{assessment.coachLevel}
                        </Badge>
                        <div>
                          <div className="font-medium">Coach #{assessment.coachId}</div>
                          <div className="text-sm text-muted-foreground">
                            {getCoachLevelName(assessment.coachLevel)} Level
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          Weight: <span className="font-medium">{assessment.weight.toFixed(1)}x</span>
                        </div>
                        <div className="text-sm">
                          Confidence: <span className="font-medium">{(assessment.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="text-sm">
                          Recency: <span className="font-medium">{(assessment.recency * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="space-y-6">
          {weightedPCP && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Assessment Quality
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Consensus Score</span>
                      <span className="font-medium">
                        {(weightedPCP.qualityMetrics.consensusScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={weightedPCP.qualityMetrics.consensusScore * 100} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Weight</span>
                      <span className="font-medium">
                        {weightedPCP.qualityMetrics.totalWeight.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Coach Level</span>
                      <span className="font-medium">
                        L{weightedPCP.qualityMetrics.averageCoachLevel.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Assessment Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Assessment history and validation requirements help ensure rating accuracy over time.
                  </div>
                  
                  {validationStatus?.assessmentsRequiringValidation && 
                   validationStatus.assessmentsRequiringValidation.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {validationStatus.assessmentsRequiringValidation.length} assessment(s) 
                        require higher-level validation
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}