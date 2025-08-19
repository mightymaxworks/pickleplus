import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, XCircle, Users, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

/**
 * CoachingAssessmentValidator - Phase 3 Implementation
 * 
 * This component implements mandatory coach-student relationship validation
 * before allowing any coaching assessments to proceed. It ensures:
 * 
 * 1. Coach has active L1-L5 level (not just a player)
 * 2. Active coach-student assignment exists (admin-created)
 * 3. Security validation before accessing 35-skill assessment tools
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

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="w-5 h-5" />
          Coaching Assessment Security Validation
        </CardTitle>
        <CardDescription className="text-orange-700">
          Mandatory coach-student relationship verification required before assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
                <strong>Validation Successful!</strong> Assessment authorized for this coach-student pair.
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

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Assessment Ready:</strong> You can now proceed with the comprehensive 35-skill assessment 
                tool and 4-dimensional PCP system. All coaching interactions will be logged for audit purposes.
              </p>
            </div>
          </div>
        )}

        {validationError && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Validation Failed:</strong> {validationError}
              <br />
              <span className="text-sm mt-2 block">
                Contact an admin to create a proper coach-student assignment before proceeding with assessments.
              </span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}