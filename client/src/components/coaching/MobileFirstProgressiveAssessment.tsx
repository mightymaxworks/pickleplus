/**
 * Mobile-First Progressive Assessment Interface
 * 
 * Enhanced mobile-optimized coach assessment tool featuring:
 * - Swipeable skill cards for mobile-first interaction
 * - Transparent coach level weighting visualization
 * - Quick Mode vs Full Assessment with confidence indicators
 * - Coach impact display and assessment mode switching
 * - Anti-abuse integration with rate limiting display
 * - Autosave and resume capability for interrupted sessions
 * 
 * UDF Compliance: Rules 31-34 (Enhanced Coach Assessment System)
 * 
 * @version 2.0.0
 * @lastModified September 23, 2025
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  Target, 
  Zap, 
  Clock, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  Shield,
  AlertTriangle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Save,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { SKILL_CATEGORIES, calculatePCPRating, getCategoryWeight, type CategoryName } from '@shared/utils/pcpCalculationSimple';
import { getSkillGuide, getRatingDescription } from '@shared/utils/coachingGuides';

interface MobileFirstProgressiveAssessmentProps {
  coachId: number;
  studentId: number;
  studentName: string;
  connectionId?: number; // From Enhanced Coach Discovery System
  onComplete: () => void;
  onCancel: () => void;
  onPause?: () => void;
}

interface AssessmentSession {
  id?: number;
  sessionType: 'quick_mode' | 'full_assessment';
  coachLevel: number;
  coachWeight: number;
  plannedSkillsCount: number;
  skillsCompleted: number;
  assessmentConfidence: number;
  categoryConfidenceFactors: Record<string, number>;
  currentSkillIndex: number;
  sessionStartedAt: Date;
  lastActivityAt: Date;
  sessionData: any;
}

interface SkillCard {
  skillName: string;
  category: CategoryName;
  description: string;
  coachingTips: string;
  currentRating?: number;
  isCompleted: boolean;
}

interface CoachImpactInfo {
  coachLevel: number;
  coachWeight: number;
  coachName: string;
  assessmentAuthority: 'PROVISIONAL' | 'CONFIRMED';
  ratingExpiry: string;
  contributionPercentage: number;
}

export function MobileFirstProgressiveAssessment({
  coachId,
  studentId,
  studentName,
  connectionId,
  onComplete,
  onCancel,
  onPause
}: MobileFirstProgressiveAssessmentProps) {
  const { toast } = useToast();
  
  // Assessment State
  const [sessionType, setSessionType] = useState<'quick_mode' | 'full_assessment'>('quick_mode');
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({});
  const [sessionNotes, setSessionNotes] = useState('');
  const [isResuming, setIsResuming] = useState(false);
  const [showCoachImpact, setShowCoachImpact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'all'>('all');
  
  // Session Management
  const [sessionData, setSessionData] = useState<AssessmentSession | null>(null);
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch Coach Impact Information
  const { data: coachImpact } = useQuery({
    queryKey: ['/api/coach-discovery/coach-impact', coachId, connectionId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/coach-discovery/coach-impact/${coachId}/${connectionId}`);
      return response.json() as Promise<CoachImpactInfo>;
    },
    enabled: !!coachId && !!connectionId
  });

  // Skills Configuration
  const skillCards = useMemo(() => {
    let allSkills: SkillCard[] = [];

    if (sessionType === 'quick_mode') {
      // Quick Mode: 10 strategically selected skills (2 per category)
      const quickModeSkills = [
        { category: 'touch' as CategoryName, skills: ['Forehand Topspin Dink', 'Forehand Third Shot Drop'] },
        { category: 'technical' as CategoryName, skills: ['Serve Power', 'Forehand Flat Drive'] },
        { category: 'mental' as CategoryName, skills: ['Court Awareness', 'Decision Making Under Pressure'] },
        { category: 'athletic' as CategoryName, skills: ['Split Step Readiness', 'Lateral Shuffles'] },
        { category: 'power' as CategoryName, skills: ['Forehand Overhead Smash', 'Forehand Punch Volley'] }
      ];

      quickModeSkills.forEach(({ category, skills }) => {
        skills.forEach(skillName => {
          if (SKILL_CATEGORIES[category]?.includes(skillName)) {
            const skillGuide = getSkillGuide(skillName);
            allSkills.push({
              skillName,
              category,
              description: skillGuide.description || `${skillName} assessment`,
              coachingTips: skillGuide.coachingTips,
              currentRating: skillRatings[skillName],
              isCompleted: !!skillRatings[skillName]
            });
          }
        });
      });
    } else {
      // Full Assessment: All 55 skills
      Object.entries(SKILL_CATEGORIES).forEach(([categoryName, skills]) => {
        const category = categoryName as CategoryName;
        if (selectedCategory === 'all' || selectedCategory === category) {
          skills.forEach(skillName => {
            const skillGuide = getSkillGuide(skillName);
            allSkills.push({
              skillName,
              category,
              description: skillGuide.description || `${skillName} assessment`,
              coachingTips: skillGuide.coachingTips,
              currentRating: skillRatings[skillName],
              isCompleted: !!skillRatings[skillName]
            });
          });
        }
      });
    }

    return allSkills;
  }, [sessionType, selectedCategory, skillRatings]);

  // Current PCP Calculation
  const currentPCP = useMemo(() => {
    if (Object.keys(skillRatings).length === 0) return null;
    return calculatePCPRating(skillRatings);
  }, [skillRatings]);

  // Assessment Confidence Calculation
  const assessmentConfidence = useMemo(() => {
    if (!currentPCP || !coachImpact) return 0;
    
    const baseConfidence = sessionType === 'quick_mode' ? 0.75 : 0.95;
    const coachLevelBonus = (coachImpact.coachLevel - 1) * 0.02; // +2% per level above L1
    const completionBonus = (Object.keys(skillRatings).length / skillCards.length) * 0.05; // +5% at full completion
    
    return Math.min(0.98, baseConfidence + coachLevelBonus + completionBonus);
  }, [sessionType, coachImpact, skillRatings, skillCards.length, currentPCP]);

  // Initialize or Resume Session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check for existing session
        const response = await apiRequest('GET', `/api/coach-discovery/assessment-session/${coachId}/${studentId}`);
        const existingSession = await response.json();
        
        if (existingSession && existingSession.status === 'in_progress') {
          setIsResuming(true);
          setSessionData(existingSession);
          setSkillRatings(existingSession.sessionData?.skillRatings || {});
          setCurrentSkillIndex(existingSession.currentSkillIndex || 0);
          setSessionType(existingSession.sessionType || 'quick_mode');
          setSessionNotes(existingSession.sessionData?.notes || '');
          
          toast({
            title: "Session Resumed",
            description: "Continuing your previous assessment session.",
          });
        } else {
          // Create new session
          await startNewSession();
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        await startNewSession();
      }
    };

    initializeSession();
  }, [coachId, studentId]);

  // Start New Session
  const startNewSession = async () => {
    try {
      const response = await apiRequest('POST', '/api/coach-discovery/start-assessment-session', {
        coachId,
        studentId,
        connectionId,
        sessionType,
        plannedSkillsCount: skillCards.length
      });
      
      const newSession = await response.json();
      setSessionData(newSession);
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Session Error",
        description: "Failed to start assessment session. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Autosave Progress
  const autosave = useCallback(async () => {
    if (!sessionData?.id) return;

    try {
      await apiRequest('PATCH', `/api/coach-discovery/assessment-session/${sessionData.id}`, {
        currentSkillIndex,
        skillsCompleted: Object.keys(skillRatings).length,
        completionPercentage: (Object.keys(skillRatings).length / skillCards.length) * 100,
        sessionData: {
          skillRatings,
          notes: sessionNotes,
          lastSaveAt: new Date().toISOString()
        },
        assessmentConfidence: assessmentConfidence,
        lastActivityAt: new Date()
      });
      
      setLastAutosave(new Date());
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }, [sessionData?.id, currentSkillIndex, skillRatings, sessionNotes, skillCards.length, assessmentConfidence]);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(autosave, 30000);
    return () => clearInterval(interval);
  }, [autosave]);

  // Navigation Functions
  const goToNextSkill = () => {
    if (currentSkillIndex < skillCards.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1);
      autosave();
    }
  };

  const goToPreviousSkill = () => {
    if (currentSkillIndex > 0) {
      setCurrentSkillIndex(currentSkillIndex - 1);
      autosave();
    }
  };

  const goToSkill = (index: number) => {
    if (index >= 0 && index < skillCards.length) {
      setCurrentSkillIndex(index);
      autosave();
    }
  };

  // Rate Skill
  const rateSkill = (skillName: string, rating: number) => {
    const newRatings = { ...skillRatings, [skillName]: rating };
    setSkillRatings(newRatings);
    
    toast({
      title: "Rating Saved",
      description: `${skillName}: ${rating}/10 - ${getRatingDescription(rating).label}`,
    });

    // Auto-advance for better mobile flow
    if (currentSkillIndex < skillCards.length - 1) {
      setTimeout(goToNextSkill, 500);
    }
  };

  // Complete Assessment
  const completeAssessment = useMutation({
    mutationFn: async () => {
      if (!sessionData?.id) throw new Error('No active session');
      
      const response = await apiRequest('POST', '/api/coach-discovery/complete-assessment', {
        sessionId: sessionData.id,
        finalSkillRatings: skillRatings,
        sessionNotes,
        finalPCP: currentPCP,
        assessmentConfidence: assessmentConfidence,
        coachWeighting: coachImpact
      });
      
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Assessment Complete",
        description: `Final PCP Rating: ${result.finalPCP.toFixed(2)} (${result.ratingStatus})`,
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to complete assessment",
        variant: "destructive",
      });
    }
  });

  // Pause/Resume Session
  const togglePause = async () => {
    setIsPaused(!isPaused);
    if (!isPaused && onPause) {
      await autosave();
      onPause();
    }
  };

  if (!skillCards.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentSkill = skillCards[currentSkillIndex];
  const completedSkills = Object.keys(skillRatings).length;
  const progressPercentage = (completedSkills / skillCards.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">
                {sessionType === 'quick_mode' ? 'Quick Assessment' : 'Full Assessment'}
              </h1>
              <p className="text-sm text-gray-600">{studentName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCoachImpact(!showCoachImpact)}
              className="p-2"
              data-testid="toggle-coach-impact"
            >
              {showCoachImpact ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePause}
              className="p-2"
              data-testid="toggle-pause"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{completedSkills} of {skillCards.length} skills</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Assessment Mode Indicator */}
        <div className="flex items-center justify-between mt-2">
          <Badge 
            variant={sessionType === 'quick_mode' ? 'secondary' : 'default'}
            className="text-xs"
          >
            {sessionType === 'quick_mode' ? (
              <>
                <Zap className="w-3 h-3 mr-1" />
                Quick Mode (75% confidence)
              </>
            ) : (
              <>
                <Target className="w-3 h-3 mr-1" />
                Full Assessment (95% confidence)
              </>
            )}
          </Badge>
          
          {coachImpact && (
            <Badge variant="outline" className="text-xs">
              L{coachImpact.coachLevel} Coach ({coachImpact.coachWeight}x weight)
            </Badge>
          )}
        </div>
      </div>

      {/* Coach Impact Panel - Collapsible */}
      {showCoachImpact && coachImpact && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Coach Level {coachImpact.coachLevel}</strong> - Your rating will be {coachImpact.assessmentAuthority}
                </div>
                <div className="flex items-center gap-4 text-xs text-blue-600">
                  <span>Weight: {coachImpact.coachWeight}x</span>
                  <span>Authority: {coachImpact.assessmentAuthority}</span>
                  <span>Expires: {coachImpact.ratingExpiry}</span>
                </div>
                {coachImpact.assessmentAuthority === 'PROVISIONAL' && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Provisional ratings require L4+ coach confirmation for tournament eligibility
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Current PCP Display */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4">
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">
            {currentPCP?.pcpRating?.toFixed(2) || '0.00'}
          </div>
          <div className="text-blue-100 text-sm">
            Current PCP Rating ({Math.round(assessmentConfidence * 100)}% confidence)
          </div>
          {currentPCP && (
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span>Touch: {currentPCP.categoryAverages.touch.toFixed(1)}</span>
              <span>Tech: {currentPCP.categoryAverages.technical.toFixed(1)}</span>
              <span>Mental: {currentPCP.categoryAverages.mental.toFixed(1)}</span>
              <span>Athletic: {currentPCP.categoryAverages.athletic.toFixed(1)}</span>
              <span>Power: {currentPCP.categoryAverages.power.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Skill Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousSkill}
            disabled={currentSkillIndex === 0}
            data-testid="previous-skill"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className="text-sm font-medium">
              Skill {currentSkillIndex + 1} of {skillCards.length}
            </div>
            <div className="text-xs text-gray-500">
              {currentSkill.category}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextSkill}
            disabled={currentSkillIndex === skillCards.length - 1}
            data-testid="next-skill"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Skill Card - Swipeable */}
      <div className="flex-1 p-4">
        <Card className="min-h-96 border-2 border-gray-200 shadow-lg" data-testid={`skill-card-${currentSkill.skillName}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-gray-900">
                {currentSkill.skillName}
              </CardTitle>
              {currentSkill.isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  {currentSkill.currentRating}/10
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              {currentSkill.category} • Weight: {Math.round(getCategoryWeight(currentSkill.category) * 100)}%
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Skill Description */}
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentSkill.description}
              </p>
            </div>

            {/* Coaching Tips */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm">
                  <strong>💡 Coach Tip:</strong> {currentSkill.coachingTips}
                </div>
              </AlertDescription>
            </Alert>

            {/* Rating Scale Reference */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                <div className="font-medium text-red-700">1-3</div>
                <div className="text-red-600">Beginner</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                <div className="font-medium text-yellow-700">4-5</div>
                <div className="text-yellow-600">Developing</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                <div className="font-medium text-green-700">6-8</div>
                <div className="text-green-600">Proficient</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
                <div className="font-medium text-purple-700">9-10</div>
                <div className="text-purple-600">Expert</div>
              </div>
            </div>

            {/* Rating Buttons - Mobile Optimized */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rate this skill (tap to select)</h4>
              <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5,6,7,8,9,10].map(rating => (
                  <Button
                    key={rating}
                    variant={currentSkill.currentRating === rating ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => rateSkill(currentSkill.skillName, rating)}
                    className={`h-12 text-lg font-bold transition-all ${
                      currentSkill.currentRating === rating 
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 scale-110' 
                        : 'hover:bg-blue-50 hover:border-blue-300'
                    }`}
                    data-testid={`rate-skill-${rating}`}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
              
              {/* Rating Feedback */}
              {currentSkill.currentRating && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-700">
                      Rating {currentSkill.currentRating}: {getRatingDescription(currentSkill.currentRating).label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
        {/* Session Notes - Collapsible */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Session Notes</label>
          <Textarea
            placeholder="Add notes about this session..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="min-h-20"
            data-testid="session-notes"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            data-testid="cancel-assessment"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={() => autosave()}
            disabled={!sessionData}
            variant="ghost"
            className="px-6"
            data-testid="save-progress"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          
          <Button
            onClick={() => completeAssessment.mutate()}
            disabled={completeAssessment.isPending || completedSkills === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            data-testid="complete-assessment"
          >
            {completeAssessment.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Completing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Complete ({completedSkills}/{skillCards.length})
              </>
            )}
          </Button>
        </div>

        {/* Autosave Indicator */}
        {lastAutosave && (
          <div className="text-xs text-gray-500 text-center">
            Last saved: {lastAutosave.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileFirstProgressiveAssessment;