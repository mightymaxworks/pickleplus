import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, XCircle, Users, Star, Target, TrendingUp, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SKILL_CATEGORIES, calculatePCPRating, type AssessmentData, type CategoryName, getCategoryWeight } from '@shared/utils/pcpCalculationSimple';

interface CoachingAssessmentValidatorProps {
  coachId: number;
  studentId: number;
  onValidationSuccess?: (validationData: any) => void;
  onValidationError?: (error: string) => void;
}

interface ValidationResult {
  success: boolean;
  coachLevel: number;
  coachName: string;
  validatedAt: string;
  message: string;
}

interface SkillAssessment {
  skillName: string;
  rating: number;
  category: string;
}

interface ProgressiveAssessmentState {
  selectedSkills: SkillAssessment[];
  assessmentType: 'focused' | 'comprehensive' | 'baseline';
  sessionNotes: string;
  selectedCategory: string;
  currentPCPRating?: number;
}

/**
 * CoachingAssessmentValidator - Phase 3 Implementation
 * 
 * This component implements mandatory coach-student relationship validation
 * before allowing any coaching assessments to proceed. It ensures:
 * 
 * 1. Coach has active L1-L5 level (not just a player)
 * 2. Active coach-student assignment exists (admin-created)
 * 3. Security validation before accessing 55-skill assessment tools
 * 4. Preserves existing PCP 4-dimensional assessment system
 */
export function CoachingAssessmentValidator({
  coachId,
  studentId,
  onValidationSuccess,
  onValidationError
}: CoachingAssessmentValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [progressiveState, setProgressiveState] = useState<ProgressiveAssessmentState>({
    selectedSkills: [],
    assessmentType: 'focused',
    sessionNotes: '',
    selectedCategory: ''
  });
  const { toast } = useToast();

  const validateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/validate-coaching-assessment", {
        coachId,
        studentId
      });
      return response.json();
    },
    onSuccess: (data: ValidationResult) => {
      setValidationResult(data);
      setValidationError(null);
      toast({
        title: "Validation Successful",
        description: "Coach-student relationship verified. Assessment authorized.",
      });
      onValidationSuccess?.(data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Validation failed";
      setValidationError(errorMessage);
      setValidationResult(null);
      toast({
        title: "Validation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onValidationError?.(errorMessage);
    },
  });

  const getCoachLevelDescription = (level: number) => {
    const descriptions = {
      1: "L1 Coach (Basic Skills)",
      2: "L2 Coach (Intermediate & Strategy)",
      3: "L3 Coach (Advanced & Competitive)",
      4: "L4 Coach (Elite & Tournament)",
      5: "L5 Coach (Master & Certification)"
    };
    return descriptions[level as keyof typeof descriptions] || `L${level} Coach`;
  };

  const handleSkillAssessment = (skillName: string, rating: number, category: string) => {
    setProgressiveState(prev => {
      const updatedSkills = prev.selectedSkills.filter(s => s.skillName !== skillName);
      const newSkill: SkillAssessment = { skillName, rating, category };
      const skills = [...updatedSkills, newSkill];
      
      // Calculate PCP rating with updated skills
      const assessmentData: Partial<AssessmentData> = {};
      skills.forEach(skill => {
        const categoryKey = skill.category.toLowerCase().replace(' ', '') as keyof AssessmentData;
        if (!assessmentData[categoryKey]) {
          assessmentData[categoryKey] = {};
        }
        assessmentData[categoryKey]![skill.skillName] = skill.rating;
      });
      
      const currentPCP = Object.keys(assessmentData).length > 0 ? calculatePCPRating(assessmentData as AssessmentData) : undefined;
      
      return {
        ...prev,
        selectedSkills: skills,
        currentPCPRating: currentPCP
      };
    });
  };

  const saveProgressiveAssessment = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/coaching/progressive-assessment", {
        coachId,
        studentId,
        assessmentType: progressiveState.assessmentType,
        skills: progressiveState.selectedSkills,
        sessionNotes: progressiveState.sessionNotes,
        pcpRating: progressiveState.currentPCPRating
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Saved",
        description: "Progressive assessment completed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="w-5 h-5" />
          Progressive Coaching Assessment System
        </CardTitle>
        <CardDescription className="text-orange-700">
          Enhanced 55-skill assessment with focused session capability and real-time PCP calculation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="validation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="assessment" disabled={!validationResult}>Progressive Assessment</TabsTrigger>
            <TabsTrigger value="results" disabled={!validationResult}>Results & PCP</TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="space-y-4">
            {!validationResult && !validationError && (
              <div className="space-y-4">
                <Alert>
                  <Users className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Security Notice:</strong> Assessment requires active coach-student assignment created by an admin. 
                    Only authorized coaches (L1-L5) can perform student assessments.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={() => validateMutation.mutate()}
                  disabled={validateMutation.isPending}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {validateMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Validating Relationship...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Validate Coach-Student Relationship
                    </>
                  )}
                </Button>
              </div>
            )}

            {validationResult && (
              <div className="space-y-3">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Validation Successful!</strong> Progressive assessment system ready.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-sm">Coach Level</span>
                    </div>
                    <Badge className="bg-orange-500">
                      {getCoachLevelDescription(validationResult.coachLevel)}
                    </Badge>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-sm">Coach Name</span>
                    </div>
                    <span className="text-sm text-gray-700">{validationResult.coachName}</span>
                  </div>
                </div>
              </div>
            )}

            {validationError && (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Validation Failed:</strong> {validationError}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessment-type">Assessment Type</Label>
                  <Select
                    value={progressiveState.assessmentType}
                    onValueChange={(value: 'focused' | 'comprehensive' | 'baseline') =>
                      setProgressiveState(prev => ({ ...prev, assessmentType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="focused">Focused Session (Specific Skills)</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive (All 55 Skills)</SelectItem>
                      <SelectItem value="baseline">Baseline Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="skill-category">Focus Category</Label>
                  <Select
                    value={progressiveState.selectedCategory}
                    onValueChange={(value) =>
                      setProgressiveState(prev => ({ ...prev, selectedCategory: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category to focus on" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SKILL_CATEGORIES).map(categoryName => (
                        <SelectItem key={categoryName} value={categoryName}>
                          {categoryName} ({Math.round(getCategoryWeight(categoryName as CategoryName) * 100)}% weight)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {progressiveState.selectedCategory && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Target className="w-5 h-5" />
                      {progressiveState.selectedCategory} Skills Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {SKILL_CATEGORIES[progressiveState.selectedCategory as CategoryName]?.map(skill => {
                          const currentAssessment = progressiveState.selectedSkills.find(s => s.skillName === skill);
                          return (
                            <div key={skill} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <span className="font-medium text-sm">{skill}</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={currentAssessment?.rating || ''}
                                  onChange={(e) => {
                                    const rating = parseInt(e.target.value);
                                    if (rating >= 1 && rating <= 10) {
                                      handleSkillAssessment(skill, rating, progressiveState.selectedCategory);
                                    }
                                  }}
                                  className="w-20"
                                  placeholder="1-10"
                                />
                                <span className="text-xs text-gray-500">/ 10</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="session-notes">Session Notes</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Add notes about this assessment session, areas of focus, observations..."
                  value={progressiveState.sessionNotes}
                  onChange={(e) => setProgressiveState(prev => ({ ...prev, sessionNotes: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="w-5 h-5" />
                    Current PCP Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {progressiveState.currentPCPRating?.toFixed(2) || 'Calculating...'}
                  </div>
                  <p className="text-sm text-green-600">
                    Based on {progressiveState.selectedSkills.length} assessed skills
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <BookOpen className="w-5 h-5" />
                    Assessment Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Skills Assessed</span>
                      <span>{progressiveState.selectedSkills.length}/55</span>
                    </div>
                    <Progress 
                      value={(progressiveState.selectedSkills.length / 55) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {progressiveState.selectedSkills.map(skill => (
                <div key={skill.skillName} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <span className="font-medium">{skill.skillName}</span>
                    <Badge variant="outline" className="ml-2">{skill.category}</Badge>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {skill.rating}/10
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => saveProgressiveAssessment.mutate()}
              disabled={saveProgressiveAssessment.isPending || progressiveState.selectedSkills.length === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {saveProgressiveAssessment.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Saving Assessment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Progressive Assessment
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}