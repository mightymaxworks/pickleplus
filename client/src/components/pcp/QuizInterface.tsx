/**
 * PCP Quiz Interface
 * Interactive assessment component for knowledge testing
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: number;
  type: 'multiple_choice' | 'multiple_select' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer?: number | boolean;
  correctAnswers?: number[];
  explanation: string;
}

interface Assessment {
  id: number;
  assessmentName: string;
  assessmentType: string;
  description: string;
  instructions: string;
  questions: Question[];
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  attemptsRemaining: number;
  previousSubmissions?: Array<{
    id: number;
    score: number;
    status: string;
    submittedAt: string;
    attemptNumber: number;
  }>;
}

interface QuizInterfaceProps {
  assessment: Assessment;
  onComplete: () => void;
}

export default function QuizInterface({ assessment, onComplete }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>(new Array(assessment.questions.length).fill(null));
  const [timeRemaining, setTimeRemaining] = useState(assessment.timeLimit ? assessment.timeLimit * 60 : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  const allQuestionsAnswered = responses.every(response => response !== null);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const submitAssessment = useMutation({
    mutationFn: async (submissionData: any) => {
      const response = await fetch(`/api/pcp-learning/assessment/${assessment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) throw new Error('Failed to submit assessment');
      return response.json();
    },
    onSuccess: (data) => {
      setSubmissionResult(data.submission);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ['/api/pcp-learning/assessments'] });
      toast({
        title: data.submission.passed ? "Assessment Passed!" : "Assessment Failed",
        description: `Score: ${data.submission.score}% (${data.submission.passingScore}% needed to pass)`,
        variant: data.submission.passed ? "default" : "destructive"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleResponseChange = (value: any) => {
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!allQuestionsAnswered) {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const timeSpent = assessment.timeLimit ? (assessment.timeLimit * 60) - (timeRemaining || 0) : 0;
    
    submitAssessment.mutate({
      responses,
      timeSpent: Math.floor(timeSpent / 60) // Convert to minutes
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showResults && submissionResult) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {submissionResult.passed ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {submissionResult.passed ? "Assessment Passed!" : "Assessment Failed"}
          </CardTitle>
          <CardDescription>
            You scored {submissionResult.score}% ({submissionResult.passingScore}% needed to pass)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Progress value={submissionResult.score} className="mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Your Score: {submissionResult.score}%</span>
              <span>Passing Score: {submissionResult.passingScore}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{submissionResult.attemptNumber}</div>
              <div className="text-sm text-gray-600">Attempt Number</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{submissionResult.attemptsRemaining}</div>
              <div className="text-sm text-gray-600">Attempts Remaining</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={onComplete}>
              Return to Dashboard
            </Button>
            {!submissionResult.passed && submissionResult.attemptsRemaining > 0 && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{assessment.assessmentName}</CardTitle>
              <CardDescription>{assessment.description}</CardDescription>
            </div>
            <div className="text-right space-y-2">
              {timeRemaining && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className={timeRemaining < 300 ? "text-red-500 font-semibold" : ""}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </Badge>
            </div>
          </div>
          <Progress 
            value={(currentQuestionIndex + 1) / assessment.questions.length * 100} 
            className="mt-4"
          />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Question {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">
            {currentQuestion.question}
          </div>

          {/* Multiple Choice */}
          {currentQuestion.type === 'multiple_choice' && (
            <RadioGroup 
              value={responses[currentQuestionIndex]?.toString()} 
              onValueChange={(value) => handleResponseChange(parseInt(value))}
            >
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Multiple Select */}
          {currentQuestion.type === 'multiple_select' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`option-${index}`}
                    checked={responses[currentQuestionIndex]?.includes(index) || false}
                    onCheckedChange={(checked) => {
                      const currentResponse = responses[currentQuestionIndex] || [];
                      let newResponse;
                      if (checked) {
                        newResponse = [...currentResponse, index];
                      } else {
                        newResponse = currentResponse.filter((i: number) => i !== index);
                      }
                      handleResponseChange(newResponse);
                    }}
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* True/False */}
          {currentQuestion.type === 'true_false' && (
            <RadioGroup 
              value={responses[currentQuestionIndex]?.toString()} 
              onValueChange={(value) => handleResponseChange(value === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="text-sm text-gray-600">
          {responses.filter(r => r !== null).length} of {assessment.questions.length} answered
        </div>

        {isLastQuestion ? (
          <Button 
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            disabled={responses[currentQuestionIndex] === null}
          >
            Next
          </Button>
        )}
      </div>

      {/* Warning for incomplete answers */}
      {!allQuestionsAnswered && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Please answer all questions before submitting the assessment.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}