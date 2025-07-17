/**
 * Enhanced Mobile Match Recorder - PKL-278651 Voice-Enabled Smart Form
 * Revolutionary match recording with voice input, smart validation, and celebration mode
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Trophy, 
  Users, 
  MapPin, 
  Clock, 
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
  Star,
  Sparkles,
  Target,
  Award,
  Volume2,
  VolumeX,
  RefreshCw,
  Save,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface EnhancedMobileMatchRecorderProps {
  onMatchRecorded?: (match: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

interface MatchForm {
  formatType: 'singles' | 'doubles' | 'mixed';
  gameType: 'casual' | 'league' | 'tournament';
  player1: string;
  player2: string;
  player3?: string;
  player4?: string;
  score: string;
  duration: string;
  location: string;
  notes: string;
  result: 'win' | 'loss' | '';
}

interface FormStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  fields: string[];
  voicePrompt?: string;
}

export default function EnhancedMobileMatchRecorder({ 
  onMatchRecorded, 
  onCancel,
  initialData 
}: EnhancedMobileMatchRecorderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [formData, setFormData] = useState<MatchForm>({
    formatType: 'doubles',
    gameType: 'casual',
    player1: '',
    player2: '',
    player3: '',
    player4: '',
    score: '',
    duration: '',
    location: '',
    notes: '',
    result: '',
    ...initialData
  });

  // Voice recognition setup
  const recognition = useRef<any>(null);
  const synthesis = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';
    }

    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis;
    }
  }, []);

  // Form steps configuration
  const formSteps: FormStep[] = [
    {
      id: 'format',
      title: 'Match Format',
      subtitle: 'What type of match did you play?',
      icon: <Users className="w-6 h-6" />,
      fields: ['formatType', 'gameType'],
      voicePrompt: 'Tell me if this was singles, doubles, or mixed doubles'
    },
    {
      id: 'players',
      title: 'Players',
      subtitle: 'Who played in this match?',
      icon: <Target className="w-6 h-6" />,
      fields: formData.formatType === 'singles' ? ['player1', 'player2'] : ['player1', 'player2', 'player3', 'player4'],
      voicePrompt: 'Tell me the names of all players'
    },
    {
      id: 'score',
      title: 'Match Result',
      subtitle: 'What was the final score?',
      icon: <Trophy className="w-6 h-6" />,
      fields: ['score', 'result'],
      voicePrompt: 'Tell me the final score, for example "11-9, 11-7"'
    },
    {
      id: 'details',
      title: 'Match Details',
      subtitle: 'Add location and duration',
      icon: <MapPin className="w-6 h-6" />,
      fields: ['location', 'duration', 'notes'],
      voicePrompt: 'Tell me where and how long you played'
    }
  ];

  // Voice recording handlers
  const startVoiceRecording = (field?: string) => {
    if (!recognition.current || !voiceEnabled) return;

    setIsRecording(true);
    
    recognition.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleVoiceInput(transcript, field);
    };

    recognition.current.onerror = () => {
      setIsRecording(false);
      toast({
        title: "Voice Error",
        description: "Couldn't process voice input. Please try again.",
        variant: "destructive"
      });
    };

    recognition.current.onend = () => {
      setIsRecording(false);
    };

    recognition.current.start();

    // Speak the prompt
    if (synthesis.current && formSteps[currentStep]?.voicePrompt) {
      const utterance = new SpeechSynthesisUtterance(formSteps[currentStep].voicePrompt);
      synthesis.current.speak(utterance);
    }
  };

  // Process voice input
  const handleVoiceInput = (transcript: string, field?: string) => {
    const lowerTranscript = transcript.toLowerCase();

    if (currentStep === 0) {
      // Format selection
      if (lowerTranscript.includes('singles')) {
        setFormData(prev => ({ ...prev, formatType: 'singles' }));
      } else if (lowerTranscript.includes('doubles')) {
        setFormData(prev => ({ ...prev, formatType: 'doubles' }));
      } else if (lowerTranscript.includes('mixed')) {
        setFormData(prev => ({ ...prev, formatType: 'mixed' }));
      }
      
      if (lowerTranscript.includes('tournament')) {
        setFormData(prev => ({ ...prev, gameType: 'tournament' }));
      } else if (lowerTranscript.includes('league')) {
        setFormData(prev => ({ ...prev, gameType: 'league' }));
      }
    } else if (currentStep === 2 && field === 'score') {
      // Score parsing
      const scorePattern = /(\d+)[\s-]+(\d+)/g;
      const matches = [...transcript.matchAll(scorePattern)];
      if (matches.length > 0) {
        const scores = matches.map(match => `${match[1]}-${match[2]}`);
        setFormData(prev => ({ ...prev, score: scores.join(', ') }));
      }
    } else if (field) {
      // Direct field update
      setFormData(prev => ({ ...prev, [field]: transcript }));
    }

    toast({
      title: "Voice Input Processed",
      description: `Updated: ${transcript}`,
    });
  };

  // Score validation
  const validateScore = (score: string): boolean => {
    const scorePattern = /^\d+[-]\d+(?:,\s*\d+[-]\d+)*$/;
    return scorePattern.test(score.trim());
  };

  // Form validation
  const isStepValid = (stepIndex: number): boolean => {
    const step = formSteps[stepIndex];
    if (!step) return false;

    return step.fields.every(field => {
      const value = formData[field as keyof MatchForm];
      if (field === 'score') {
        return value && validateScore(value);
      }
      if (field === 'player3' || field === 'player4') {
        return formData.formatType === 'singles' || !!value;
      }
      return !!value;
    });
  };

  // Navigation
  const goToNext = () => {
    if (currentStep < formSteps.length - 1 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit mutation
  const submitMatch = useMutation({
    mutationFn: async (matchData: MatchForm) => {
      const response = await apiRequest('POST', '/api/match/record', matchData);
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      
      // Show celebration if it's a win
      if (formData.result === 'win') {
        setShowCelebration(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/api/match'] });
      onMatchRecorded?.(data);

      toast({
        title: "Match Recorded!",
        description: formData.result === 'win' ? "Congratulations on your victory! 🏆" : "Match saved successfully",
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: "Recording Failed",
        description: "Failed to record match. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const handleSubmit = () => {
    if (isStepValid(formSteps.length - 1)) {
      setIsSubmitting(true);
      submitMatch.mutate(formData);
    }
  };

  // Render step content
  const renderStepContent = () => {
    const step = formSteps[currentStep];
    
    switch (step.id) {
      case 'format':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Match Format</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {['singles', 'doubles', 'mixed'].map((format) => (
                  <motion.button
                    key={format}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, formatType: format as any }))}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center capitalize transition-all",
                      formData.formatType === format 
                        ? "border-orange-500 bg-orange-50 text-orange-700" 
                        : "border-gray-200 bg-white text-gray-700"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    {format}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Game Type</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {['casual', 'league', 'tournament'].map((type) => (
                  <motion.button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gameType: type as any }))}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center capitalize transition-all",
                      formData.gameType === type 
                        ? "border-blue-500 bg-blue-50 text-blue-700" 
                        : "border-gray-200 bg-white text-gray-700"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'players':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="player1">Player 1 (You)</Label>
                <Input
                  id="player1"
                  value={formData.player1}
                  onChange={(e) => setFormData(prev => ({ ...prev, player1: e.target.value }))}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="player2">
                  {formData.formatType === 'singles' ? 'Opponent' : 'Your Partner'}
                </Label>
                <Input
                  id="player2"
                  value={formData.player2}
                  onChange={(e) => setFormData(prev => ({ ...prev, player2: e.target.value }))}
                  placeholder={formData.formatType === 'singles' ? 'Opponent name' : 'Partner name'}
                  className="mt-1"
                />
              </div>

              {formData.formatType !== 'singles' && (
                <>
                  <div>
                    <Label htmlFor="player3">Opponent 1</Label>
                    <Input
                      id="player3"
                      value={formData.player3}
                      onChange={(e) => setFormData(prev => ({ ...prev, player3: e.target.value }))}
                      placeholder="Opponent name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="player4">Opponent 2</Label>
                    <Input
                      id="player4"
                      value={formData.player4}
                      onChange={(e) => setFormData(prev => ({ ...prev, player4: e.target.value }))}
                      placeholder="Opponent name"
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'score':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="score" className="text-base font-medium">Final Score</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="score"
                  value={formData.score}
                  onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                  placeholder="11-9, 11-7"
                  className="flex-1"
                />
                {voiceEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => startVoiceRecording('score')}
                    disabled={isRecording}
                    className={cn(isRecording && "bg-red-100 border-red-300")}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              {formData.score && !validateScore(formData.score) && (
                <p className="text-sm text-red-500 mt-1">
                  Please use format: 11-9, 11-7
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-medium">Match Result</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <motion.button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: 'win' }))}
                  className={cn(
                    "p-4 rounded-lg border-2 text-center transition-all",
                    formData.result === 'win' 
                      ? "border-green-500 bg-green-50 text-green-700" 
                      : "border-gray-200 bg-white text-gray-700"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trophy className="w-6 h-6 mx-auto mb-2" />
                  Victory
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: 'loss' }))}
                  className={cn(
                    "p-4 rounded-lg border-2 text-center transition-all",
                    formData.result === 'loss' 
                      ? "border-red-500 bg-red-50 text-red-700" 
                      : "border-gray-200 bg-white text-gray-700"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Target className="w-6 h-6 mx-auto mb-2" />
                  Defeat
                </motion.button>
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Court or venue name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="60"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about the match..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 p-6"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.5, repeat: 3 }}
        >
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
        </motion.div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Victory!</h2>
          <p className="text-gray-600">Match recorded successfully</p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => setShowCelebration(false)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Award className="w-4 h-4 mr-2" />
            View Match Details
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              // Share functionality
              toast({
                title: "Share Match",
                description: "Sharing functionality coming soon!",
              });
            }}
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Victory
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Record Match</h1>
          <div className="flex items-center space-x-2">
            <Switch
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
              className="data-[state=checked]:bg-orange-500"
            />
            <Label className="text-sm text-gray-600">Voice</Label>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep + 1} of {formSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / formSteps.length) * 100)}%</span>
          </div>
          <Progress value={((currentStep + 1) / formSteps.length) * 100} className="h-2" />
        </div>
      </div>

      {/* Step Card */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              {formSteps[currentStep]?.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{formSteps[currentStep]?.title}</CardTitle>
              <p className="text-sm text-gray-600">{formSteps[currentStep]?.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Voice Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center"
          >
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="w-5 h-5 text-red-500" />
              </motion.div>
              <span className="text-red-700 font-medium">Listening...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 0 ? onCancel : goToPrevious}
          className="flex-1"
          disabled={isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          type="button"
          onClick={currentStep === formSteps.length - 1 ? handleSubmit : goToNext}
          disabled={!isStepValid(currentStep) || isSubmitting}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          {isSubmitting ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : currentStep === formSteps.length - 1 ? (
            <Save className="w-4 h-4 mr-2" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          {isSubmitting ? 'Recording...' : currentStep === formSteps.length - 1 ? 'Record Match' : 'Next'}
        </Button>
      </div>
    </div>
  );
}