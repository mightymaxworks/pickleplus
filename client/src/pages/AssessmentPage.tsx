import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { logFeatureCompletion } from '@/lib/developmentWorkflow';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  AlertTriangle,
  PlayCircle,
  RotateCcw,
  Target,
  Award,
  Brain,
  Users,
  Zap
} from 'lucide-react';

interface AssessmentTemplate {
  id: number;
  title: string;
  description: string;
  pcpLevel: number;
  assessmentType: string;
  skillCategories: string[];
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  maxAttempts: number;
  instructions: string;
}

interface AssessmentQuestion {
  id: number;
  questionType: string;
  questionText: string;
  options: string[];
  points: number;
  skillCategory: string;
  difficultyLevel: number;
  mediaUrl?: string;
  explanation?: string;
  orderIndex: number;
}

interface AssessmentAttempt {
  id: number;
  templateId: number;
  attemptNumber: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  percentageScore: number;
  passed: boolean;
  skillScores: Record<string, number>;
}

const AssessmentPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [activeAssessment, setActiveAssessment] = useState<{ template: AssessmentTemplate; questions: AssessmentQuestion[] } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Development workflow integration - commented out to allow normal usage
  // useEffect(() => {
  //   logFeatureCompletion('Coaching', 'Assessment System', 'complete');
  // }, []);

  // Fetch assessment templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: [`/api/assessment/templates/${selectedLevel}`],
    queryFn: async () => {
      const response = await fetch(`/api/assessment/templates/${selectedLevel}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Fetch user's assessment history
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['/api/assessment/attempts/history'],
    queryFn: async () => {
      const response = await fetch('/api/assessment/attempts/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    }
  });

  // Start assessment mutation
  const startAssessmentMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await fetch('/api/assessment/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });
      if (!response.ok) throw new Error('Failed to start assessment');
      return response.json();
    },
    onSuccess: async (attempt, templateId) => {
      setAttemptId(attempt.id);
      
      // Fetch assessment details
      const response = await fetch(`/api/assessment/templates/${templateId}/details`);
      const data = await response.json();
      setActiveAssessment(data);
      setTimeRemaining(data.template.timeLimit * 60); // Convert to seconds
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  });

  // Submit assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId || !activeAssessment) throw new Error('No active assessment');
      
      const submission = {
        templateId: activeAssessment.template.id,
        answers: activeAssessment.questions.map(q => ({
          questionId: q.id,
          answer: answers[q.id] || '',
          timeSpent: 0
        }))
      };

      const response = await fetch(`/api/assessment/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });
      if (!response.ok) throw new Error('Failed to submit assessment');
      return response.json();
    },
    onSuccess: (results) => {
      setActiveAssessment(null);
      setAttemptId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/assessment/attempts/history'] });
      
      // Show results modal or redirect
      console.log('Assessment completed:', results);
    }
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && activeAssessment) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && activeAssessment) {
      // Auto-submit when time runs out
      submitAssessmentMutation.mutate();
    }
  }, [timeRemaining, activeAssessment]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSkillIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical': return <Target className="w-4 h-4" />;
      case 'tactical': return <Brain className="w-4 h-4" />;
      case 'physical': return <Zap className="w-4 h-4" />;
      case 'mental': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getAttemptStatus = (attempt: AssessmentAttempt) => {
    if (attempt.status === 'completed') {
      return attempt.passed ? 
        <Badge className="bg-green-100 text-green-800">Passed ({attempt.percentageScore}%)</Badge> :
        <Badge className="bg-red-100 text-red-800">Failed ({attempt.percentageScore}%)</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
  };

  if (activeAssessment) {
    const currentQuestion = activeAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100;

    return (
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Assessment Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{activeAssessment.template.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className="w-5 h-5" />
                {formatTime(timeRemaining)}
              </div>
              <Badge>Level {activeAssessment.template.pcpLevel}</Badge>
            </div>
          </div>
          
          <Progress value={progress} className="mb-4" />
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
          </p>
        </div>

        {/* Current Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {currentQuestion.questionText}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getSkillIcon(currentQuestion.skillCategory)}
                <Badge variant="outline">{currentQuestion.skillCategory}</Badge>
                <Badge variant="outline">{currentQuestion.points} pts</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestion.mediaUrl && (
              <div className="mb-4">
                <img 
                  src={currentQuestion.mediaUrl} 
                  alt="Question media"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {currentQuestion.questionType === 'multiple_choice' ? (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                placeholder="Enter your answer..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                className="min-h-32"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentQuestionIndex === activeAssessment.questions.length - 1 ? (
              <Button 
                onClick={() => submitAssessmentMutation.mutate()}
                disabled={submitAssessmentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(activeAssessment.questions.length - 1, prev + 1))}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PCP Assessment Center</h1>
        <p className="text-gray-600">
          Take assessments to validate your pickleball coaching knowledge and skills
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Assessments</TabsTrigger>
          <TabsTrigger value="history">My Results</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {/* Level Selection */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(level => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                onClick={() => setSelectedLevel(level)}
              >
                Level {level}
              </Button>
            ))}
          </div>

          {/* Available Assessments */}
          <div className="grid gap-6">
            {templatesLoading ? (
              <div>Loading assessments...</div>
            ) : templates.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No assessments available for Level {selectedLevel}
                </AlertDescription>
              </Alert>
            ) : (
              templates.map((template: AssessmentTemplate) => {
                const userAttempts = history.filter((h: AssessmentAttempt) => h.templateId === template.id);
                const canTakeAssessment = userAttempts.length < template.maxAttempts;
                const bestScore = Math.max(...userAttempts.map((a: AssessmentAttempt) => a.percentageScore), 0);

                return (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            {template.title}
                          </CardTitle>
                          <p className="text-gray-600 mt-1">{template.description}</p>
                        </div>
                        <Badge>Level {template.pcpLevel}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{template.totalQuestions}</div>
                          <div className="text-sm text-gray-600">Questions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{template.passingScore}%</div>
                          <div className="text-sm text-gray-600">Pass Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{template.timeLimit}</div>
                          <div className="text-sm text-gray-600">Minutes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{userAttempts.length}/{template.maxAttempts}</div>
                          <div className="text-sm text-gray-600">Attempts</div>
                        </div>
                      </div>

                      {/* Skill Categories */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.skillCategories.map(category => (
                          <Badge key={category} variant="outline" className="flex items-center gap-1">
                            {getSkillIcon(category)}
                            {category}
                          </Badge>
                        ))}
                      </div>

                      {bestScore > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Best Score</p>
                          <div className="flex items-center gap-2">
                            <Progress value={bestScore} className="flex-1" />
                            <span className="text-sm font-medium">{bestScore}%</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => startAssessmentMutation.mutate(template.id)}
                          disabled={!canTakeAssessment || startAssessmentMutation.isPending}
                          className="flex-1"
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          {userAttempts.length === 0 ? 'Start Assessment' : 'Retake Assessment'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {historyLoading ? (
            <div>Loading assessment history...</div>
          ) : history.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No assessment attempts found. Take your first assessment to see results here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {history.map((attempt: AssessmentAttempt) => (
                <Card key={attempt.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{(attempt as any).templateTitle}</CardTitle>
                        <p className="text-gray-600">
                          Level {(attempt as any).pcpLevel} • Attempt {attempt.attemptNumber} • 
                          {new Date(attempt.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getAttemptStatus(attempt)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {attempt.status === 'completed' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Progress value={attempt.percentageScore} className="flex-1" />
                          <span className="text-sm font-medium">{attempt.percentageScore}%</span>
                        </div>
                        
                        {attempt.skillScores && Object.keys(attempt.skillScores).length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Skill Breakdown</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(attempt.skillScores).map(([skill, score]) => (
                                <div key={skill} className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    {getSkillIcon(skill)}
                                    <span className="text-sm font-medium">{skill}</span>
                                  </div>
                                  <div className="text-lg font-bold">{score}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentPage;