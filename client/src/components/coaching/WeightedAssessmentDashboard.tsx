import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Star,
  TrendingUp,
  Calendar,
  TestTube,
  Play
} from 'lucide-react';

interface CoachInfo {
  coachId: number;
  coachLevel: number;
  assessmentCapabilities: {
    baseWeight: number;
    confidenceFactors: {
      technical: number;
      tactical: number;
      physical: number;
      mental: number;
    };
    canConfirmRatings: boolean;
    assessmentAuthority: string;
  };
}

interface WeightedPCPResult {
  finalPCPRating: number;
  ratingStatus: 'PROVISIONAL' | 'CONFIRMED';
  statusReason: string;
  daysUntilExpiration?: number;
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
    hasL4PlusValidation: boolean;
    highestCoachLevel: number;
  };
}

interface AssessmentSubmission {
  studentId: number;
  skillRatings: Record<string, number>;
  sessionNotes?: string;
}

export function WeightedAssessmentDashboard() {
  const [coachInfo, setCoachInfo] = useState<CoachInfo | null>(null);
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentSubmission>({
    studentId: 0,
    skillRatings: {
      technical: 5.0,
      tactical: 5.0,
      physical: 5.0,
      mental: 5.0
    },
    sessionNotes: ''
  });
  const [submissionResult, setSubmissionResult] = useState<WeightedPCPResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Testing functionality
  const [testScenarios, setTestScenarios] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [showTesting, setShowTesting] = useState(false);

  // Fetch coach information and test scenarios on component mount
  useEffect(() => {
    fetchCoachInfo();
    fetchTestScenarios();
  }, []);

  const fetchCoachInfo = async () => {
    try {
      const response = await fetch('/api/coach-weighted-assessment/coach-info', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch coach information');
      }
      
      const data = await response.json();
      setCoachInfo(data.coachInfo);
    } catch (error) {
      console.error('Coach info fetch error:', error);
      setError('Failed to load coach information. Please ensure you are logged in as a coach.');
    }
  };

  const handleSkillRatingChange = (skill: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCurrentAssessment(prev => ({
      ...prev,
      skillRatings: {
        ...prev.skillRatings,
        [skill]: Math.max(0, Math.min(10, numValue))
      }
    }));
  };

  const submitAssessment = async () => {
    if (!currentAssessment.studentId || currentAssessment.studentId <= 0) {
      setError('Please enter a valid student ID');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/coach-weighted-assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(currentAssessment)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Assessment submission failed');
      }

      const result = await response.json();
      setSubmissionResult(result.weightedPCP);
      
      // Reset form
      setCurrentAssessment({
        studentId: 0,
        skillRatings: {
          technical: 5.0,
          tactical: 5.0,
          physical: 5.0,
          mental: 5.0
        },
        sessionNotes: ''
      });

    } catch (error) {
      console.error('Assessment submission error:', error);
      setError(error instanceof Error ? error.message : 'Assessment submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingStatusIcon = (status: string) => {
    return status === 'CONFIRMED' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-amber-600" />
    );
  };

  const getRatingStatusColor = (status: string) => {
    return status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';
  };

  const fetchTestScenarios = async () => {
    try {
      const response = await fetch('/api/test/coach-weighted-assessment/scenarios');
      if (response.ok) {
        const data = await response.json();
        setTestScenarios(data.scenarios);
      }
    } catch (error) {
      console.error('Failed to fetch test scenarios:', error);
    }
  };

  const runTestScenario = async (scenario: any) => {
    setIsRunningTest(true);
    setTestResults(null);
    setSelectedScenario(scenario);

    try {
      const response = await fetch('/api/test/coach-weighted-assessment/run-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioName: scenario.name,
          assessments: scenario.assessments
        })
      });

      if (response.ok) {
        const results = await response.json();
        setTestResults(results.testResults);
      } else {
        throw new Error('Test scenario failed');
      }
    } catch (error) {
      console.error('Test scenario error:', error);
      setError('Failed to run test scenario');
    } finally {
      setIsRunningTest(false);
    }
  };

  if (error && !coachInfo) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Coach Weighted Assessment System</h1>
        <p className="text-muted-foreground">
          Advanced PCP rating system with provisional/confirmed validation
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant={!showTesting ? "default" : "outline"}
            onClick={() => setShowTesting(false)}
          >
            Assessment Interface
          </Button>
          <Button
            variant={showTesting ? "default" : "outline"}
            onClick={() => setShowTesting(true)}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Algorithm Testing
          </Button>
        </div>
      </div>

      {/* Testing Interface */}
      {showTesting && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Algorithm Test Scenarios
              </CardTitle>
              <CardDescription>
                Test the coach weighted assessment algorithm with predefined scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {testScenarios.map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{scenario.name}</h4>
                      <Button
                        size="sm"
                        onClick={() => runTestScenario(scenario)}
                        disabled={isRunningTest}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Run Test
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Assessments: {scenario.assessments.length} | 
                      Coach Levels: {scenario.assessments.map((a: any) => `L${a.coachLevel}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Test Results: {selectedScenario?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testResults.calculationError ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Calculation Error: {testResults.calculationError}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold">Validation Status</h4>
                        <div className="flex items-center gap-2">
                          {getRatingStatusIcon(testResults.validation.ratingStatus)}
                          <Badge className={getRatingStatusColor(testResults.validation.ratingStatus)}>
                            {testResults.validation.ratingStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {testResults.validation.statusReason}
                        </p>
                      </div>
                      
                      {testResults.weightedResult && (
                        <div>
                          <h4 className="font-semibold">Final PCP Rating</h4>
                          <div className="text-2xl font-bold text-primary">
                            {testResults.weightedResult.finalPCPRating}
                          </div>
                          {testResults.weightedResult.daysUntilExpiration && (
                            <p className="text-sm text-muted-foreground">
                              Expires in {testResults.weightedResult.daysUntilExpiration} days
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Weight Distribution Analysis</h4>
                      <div className="space-y-2">
                        {testResults.algorithmAnalysis.weightDistribution.map((coach: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>Coach {coach.coachId} (L{coach.coachLevel})</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{coach.baseWeight}x</span>
                              <Badge variant="outline" className="text-xs">
                                {coach.influence}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {testResults.weightedResult && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Quality Metrics</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>Assessment Count: {testResults.weightedResult.qualityMetrics.assessmentCount}</div>
                            <div>Avg Coach Level: L{testResults.weightedResult.qualityMetrics.averageCoachLevel.toFixed(1)}</div>
                            <div>Total Weight: {testResults.weightedResult.qualityMetrics.totalWeight.toFixed(2)}</div>
                            <div>Consensus: {(testResults.weightedResult.qualityMetrics.consensusScore * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Assessment Interface */}
      {!showTesting && (
        <>
          {/* Coach Authority Information */}
          {coachInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Coach Level L{coachInfo.coachLevel} Authority
            </CardTitle>
            <CardDescription>
              Your assessment capabilities and weighting influence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {coachInfo.assessmentCapabilities.baseWeight}x
                </div>
                <div className="text-sm text-muted-foreground">Base Weight</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {(coachInfo.assessmentCapabilities.confidenceFactors.technical * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Technical Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {(coachInfo.assessmentCapabilities.confidenceFactors.tactical * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Tactical Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {(coachInfo.assessmentCapabilities.confidenceFactors.mental * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Mental Confidence</div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-medium">Rating Authority:</span>
              <Badge variant={coachInfo.assessmentCapabilities.canConfirmRatings ? "default" : "secondary"}>
                {coachInfo.assessmentCapabilities.canConfirmRatings ? "Can Confirm Ratings" : "Provisional Only"}
              </Badge>
            </div>

            <Alert>
              <Star className="h-4 w-4" />
              <AlertDescription>
                {coachInfo.assessmentCapabilities.assessmentAuthority}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Assessment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Assessment</CardTitle>
          <CardDescription>
            Provide skill ratings for a student (1-10 scale)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              type="number"
              value={currentAssessment.studentId || ''}
              onChange={(e) => setCurrentAssessment(prev => ({
                ...prev,
                studentId: parseInt(e.target.value) || 0
              }))}
              placeholder="Enter student ID"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(currentAssessment.skillRatings).map(([skill, rating]) => (
              <div key={skill}>
                <Label htmlFor={skill} className="capitalize">{skill} Skills</Label>
                <Input
                  id={skill}
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={rating}
                  onChange={(e) => handleSkillRatingChange(skill, e.target.value)}
                  placeholder="0-10"
                />
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="sessionNotes">Session Notes (Optional)</Label>
            <Textarea
              id="sessionNotes"
              value={currentAssessment.sessionNotes}
              onChange={(e) => setCurrentAssessment(prev => ({
                ...prev,
                sessionNotes: e.target.value
              }))}
              placeholder="Additional notes about this assessment session..."
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={submitAssessment}
            disabled={isSubmitting || !currentAssessment.studentId}
            className="w-full"
          >
            {isSubmitting ? 'Submitting Assessment...' : 'Submit Assessment'}
          </Button>
        </CardContent>
      </Card>

      {/* Assessment Result */}
      {submissionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Assessment Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Final PCP Rating:</span>
              <span className="text-2xl font-bold text-primary">
                {submissionResult.finalPCPRating}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Rating Status:</span>
              <div className="flex items-center gap-2">
                {getRatingStatusIcon(submissionResult.ratingStatus)}
                <Badge className={getRatingStatusColor(submissionResult.ratingStatus)}>
                  {submissionResult.ratingStatus}
                </Badge>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {submissionResult.statusReason}
            </div>

            {submissionResult.daysUntilExpiration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Expires in {submissionResult.daysUntilExpiration} days
                </span>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Category Breakdown:</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(submissionResult.categoryBreakdown).map(([category, score]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <span>{score.toFixed(2)}</span>
                    </div>
                    <Progress value={score * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Quality Metrics:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Assessment Count: {submissionResult.qualityMetrics.assessmentCount}</div>
                <div>Average Coach Level: L{submissionResult.qualityMetrics.averageCoachLevel.toFixed(1)}</div>
                <div>Total Weight: {submissionResult.qualityMetrics.totalWeight.toFixed(2)}</div>
                <div>Consensus Score: {(submissionResult.qualityMetrics.consensusScore * 100).toFixed(0)}%</div>
              </div>
            </div>

            {submissionResult.ratingStatus === 'PROVISIONAL' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This rating requires confirmation from an L4+ coach for official use.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  );
}