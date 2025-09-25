import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  BookOpen, 
  Star, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  User,
  Award,
  Calendar,
  Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MobileFirstProgressiveAssessment } from '@/components/coaching/MobileFirstProgressiveAssessment';
import { CoachStudentRequests } from '@/components/coaching/CoachStudentRequests';
import { CoachStudentScanner } from '@/components/coaching/CoachStudentScanner';
import { ProvisionalRatingManagement } from '@/components/coaching/ProvisionalRatingManagement';
import { CoachAntiAbuseManagement } from '@/components/admin/CoachAntiAbuseManagement';
import { useToast } from '@/hooks/use-toast';
import { SKILL_CATEGORIES, calculatePCPFromAssessment, getCategoryWeight, type CategoryName } from '@shared/utils/pcpCalculationSimple';

// Enhanced Mobile-Optimized Assessment Interface Component
const SkillAssessmentInterface = ({ studentId, coachId, studentName, coachLevel, onComplete, onCancel }: {
  studentId: number;
  coachId: number;
  studentName: string;
  coachLevel: number;
  onComplete: () => void;
  onCancel: () => void;
}) => {
  const [assessmentMode, setAssessmentMode] = useState<'quick' | 'full' | null>(null);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [assessmentData, setAssessmentData] = useState<Record<string, number>>({});
  const [currentPCPRating, setCurrentPCPRating] = useState<number | null>(null);
  const [studentCurrentPCP, setStudentCurrentPCP] = useState<number | undefined>(undefined);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { toast } = useToast();

  // Fetch assessment history and aggregated rating for the student
  const fetchAssessmentHistory = async () => {
    if (historyLoading) return;
    
    setHistoryLoading(true);
    try {
      // Fetch assessment history
      const historyResponse = await fetch(`/api/coach-weighted-assessment/history/${studentId}`, {
        credentials: 'include'
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setAssessmentHistory(historyData.assessments || []);
        console.log(`[ASSESSMENT HISTORY] Loaded ${historyData.assessments?.length || 0} assessments for student ${studentId}`);
      }
      
      // Fetch aggregated PCP rating for skill floor calculations
      const aggregateResponse = await fetch(`/api/coach-weighted-assessment/aggregate/${studentId}`, {
        credentials: 'include'
      });
      
      if (aggregateResponse.ok) {
        const aggregateData = await aggregateResponse.json();
        
        // Use aggregated rating for skill floor calculations
        if (aggregateData.aggregated?.finalPCPRating) {
          setStudentCurrentPCP(aggregateData.aggregated.finalPCPRating);
          console.log(`[MULTI-COACH AGGREGATION] Current aggregated PCP: ${aggregateData.aggregated.finalPCPRating} (${aggregateData.aggregated.ratingStatus})`);
          console.log(`[MULTI-COACH AGGREGATION] Confidence: ${aggregateData.aggregated.confidenceLevel}, ${aggregateData.aggregated.contributingAssessments} assessments`);
        } else if (aggregateData.latestAssessment?.pcpRating) {
          setStudentCurrentPCP(aggregateData.latestAssessment.pcpRating);
        }
      } else if (aggregateResponse.status === 404) {
        console.log(`[MULTI-COACH AGGREGATION] No assessments found for student ${studentId}`);
      }
      
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load assessment history when component mounts
  useEffect(() => {
    fetchAssessmentHistory();
  }, [studentId]);

  // Rating descriptions for tooltip guidance
  const getRatingDescription = (rating: number): string => {
    const descriptions = {
      1: "Beginner - Needs significant improvement",
      2: "Developing - Basic understanding, inconsistent execution", 
      3: "Progressing - Shows improvement, occasional success",
      4: "Competent - Reliable execution in practice",
      5: "Intermediate - Consistent performance under normal conditions",
      6: "Good - Solid skill level, performs well most of the time",
      7: "Advanced - Strong execution, reliable under pressure",
      8: "Excellent - High-level performance, few weaknesses",
      9: "Expert - Near-professional level execution",
      10: "Masterful - Exceptional skill, professional level"
    };
    return descriptions[rating as keyof typeof descriptions] || "";
  };

  // Quick 10-skill assessment (2 from each category)
  const quickCategories = [
    {
      name: "Power & Serves",
      description: "Essential power shots - 2 core skills",
      skills: [
        { name: "Serve Power", desc: "Ability to generate pace on serve consistently" },
        { name: "Forehand Drive", desc: "Aggressive forehand with pace and control" }
      ]
    },
    {
      name: "Soft Game", 
      description: "Dinking and control - 2 core skills",
      skills: [
        { name: "Forehand Dink", desc: "Soft forehand placement near the net" },
        { name: "Third Shot Drop", desc: "Neutral third shot to advance position" }
      ]
    },
    {
      name: "Net Play",
      description: "Volleys and finishing - 2 core skills", 
      skills: [
        { name: "Forehand Volley", desc: "Quick exchanges at the net" },
        { name: "Overhead Smash", desc: "Power finishing shot from above" }
      ]
    },
    {
      name: "Movement",
      description: "Court coverage and fitness - 2 core skills",
      skills: [
        { name: "Court Positioning", desc: "Optimal positioning and movement" },
        { name: "Transition Speed", desc: "Quick movement from baseline to net" }
      ]
    },
    {
      name: "Mental Game",
      description: "Psychological skills - 2 core skills",
      skills: [
        { name: "Focus & Concentration", desc: "Maintaining attention during points" },
        { name: "Pressure Handling", desc: "Performance under competitive stress" }
      ]
    }
  ];

  // Full 55-skill assessment
  const fullCategories = [
    {
      name: "Groundstrokes and Serves",
      description: "Power shots, placement accuracy, and serve mechanics - 11 skills total",
      skills: [
        { name: "Serve Power", desc: "Ability to generate pace on serve consistently" },
        { name: "Serve Placement", desc: "Accuracy in targeting specific court areas on serve" },
        { name: "Forehand Flat Drive", desc: "Clean, penetrating forehand with minimal spin" },
        { name: "Forehand Topspin Drive", desc: "Aggressive forehand with heavy topspin for control" },
        { name: "Forehand Slice", desc: "Defensive/offensive slice with backspin control" },
        { name: "Backhand Flat Drive", desc: "Solid backhand drive with pace and depth" },
        { name: "Backhand Topspin Drive", desc: "Attacking backhand with topspin for net clearance" },
        { name: "Backhand Slice", desc: "Consistent backhand slice for variety and defense" },
        { name: "Third Shot Drive", desc: "Aggressive third shot to put pressure on opponents" },
        { name: "Forehand Return of Serve", desc: "Consistent, well-placed forehand returns" },
        { name: "Backhand Return of Serve", desc: "Reliable backhand returns to start points well" }
      ]
    },
    {
      name: "Dinks and Resets",
      description: "Soft game precision, third shot drops, and court control - 16 skills total",
      skills: [
        { name: "Forehand Topspin Dink", desc: "Soft forehand with slight topspin to clear net" },
        { name: "Forehand Dead Dink", desc: "Ultra-soft forehand that barely clears the net" },
        { name: "Forehand Slice Dink", desc: "Forehand dink with backspin to stay low" },
        { name: "Backhand Topspin Dink", desc: "Controlled backhand dink with forward spin" },
        { name: "Backhand Dead Dink", desc: "Soft backhand that drops quickly after net" },
        { name: "Backhand Slice Dink", desc: "Backhand with slice to keep ball low and slow" },
        { name: "Forehand Third Shot Drop", desc: "Neutral third shot to get to the kitchen line" },
        { name: "Forehand Top Spin Third Shot Drop", desc: "Third shot with topspin for net clearance" },
        { name: "Forehand Slice Third Shot Drop", desc: "Third shot with backspin to die in kitchen" },
        { name: "Backhand Third Shot Drop", desc: "Consistent backhand third shot placement" },
        { name: "Backhand Top Spin Third Shot Drop", desc: "Backhand third with topspin control" },
        { name: "Backhand Slice Third Shot Drop", desc: "Backhand third with slice to minimize bounce" },
        { name: "Forehand Resets", desc: "Ability to absorb pace and reset point tempo" },
        { name: "Backhand Resets", desc: "Defensive backhand resets under pressure" },
        { name: "Forehand Lob", desc: "Offensive/defensive lob over opponents' heads" },
        { name: "Backhand Lob", desc: "Backhand lob for court positioning and defense" }
      ]
    },
    {
      name: "Volleys and Smashes",
      description: "Net game aggression, put-away shots, and finishing ability - 6 skills total",
      skills: [
        { name: "Forehand Punch Volley", desc: "Quick, compact forehand volley with pace" },
        { name: "Forehand Roll Volley", desc: "Attacking forehand volley with topspin roll" },
        { name: "Backhand Punch Volley", desc: "Solid backhand volley for quick exchanges" },
        { name: "Backhand Roll Volley", desc: "Backhand volley with forward roll for angle" },
        { name: "Forehand Overhead Smash", desc: "Power overhead to finish points decisively" },
        { name: "Backhand Overhead Smash", desc: "Difficult backhand overhead for coverage" }
      ]
    },
    {
      name: "Footwork & Fitness",
      description: "Court movement, athletic positioning, and physical conditioning - 10 skills total",
      skills: [
        { name: "Split Step Readiness", desc: "Proper timing of split step for quick reactions" },
        { name: "Lateral Shuffles", desc: "Side-to-side movement while maintaining balance" },
        { name: "Crossover Steps", desc: "Efficient crossover technique for court coverage" },
        { name: "Court Recovery", desc: "Quick return to optimal court position after shots" },
        { name: "First Step Speed", desc: "Explosive first step quickness in all directions" },
        { name: "Balance & Core Stability", desc: "Maintaining balance during dynamic movements" },
        { name: "Agility", desc: "Quick direction changes and reactive movements" },
        { name: "Endurance Conditioning", desc: "Stamina to maintain performance through long matches" },
        { name: "Leg Strength & Power", desc: "Lower body strength for explosive movements" },
        { name: "Transition Speed (Baseline to Kitchen)", desc: "Quick movement from back court to net" }
      ]
    },
    {
      name: "Mental Game",
      description: "Psychological skills, focus control, and competitive mindset - 10 skills total",
      skills: [
        { name: "Staying Present", desc: "Maintaining focus on current point, not past/future" },
        { name: "Resetting After Errors", desc: "Quick mental recovery from mistakes or bad shots" },
        { name: "Patience & Shot Selection", desc: "Choosing right shots at right times, not forcing" },
        { name: "Positive Self-Talk", desc: "Internal dialogue that builds confidence and focus" },
        { name: "Visualization", desc: "Mental rehearsal of shots and game situations" },
        { name: "Pressure Handling", desc: "Performance maintenance during crucial moments" },
        { name: "Focus Shifts", desc: "Adjusting attention between technical, tactical, and emotional" },
        { name: "Opponent Reading", desc: "Recognizing patterns and weaknesses in opponents" },
        { name: "Emotional Regulation", desc: "Managing frustration, excitement, and energy levels" },
        { name: "Competitive Confidence", desc: "Belief in abilities during competitive situations" }
      ]
    }
  ];

  const activeCategories = assessmentMode === 'quick' ? quickCategories : fullCategories;
  const currentSkills = activeCategories[currentCategory]?.skills || [];
  const isLastCategory = currentCategory === activeCategories.length - 1;
  const categoryProgress = (currentCategory + 1) / activeCategories.length * 100;
  const totalSkills = assessmentMode === 'quick' ? 10 : 55;

  // Enhanced skill mapping system (matches backend)
  const quickToOfficialMapping: Record<string, string> = {
    'Forehand Drive': 'Forehand Flat Drive',
    'Third Shot Drop': 'Forehand Third Shot Drop', 
    'Forehand Dink': 'Forehand Topspin Dink',
    'Forehand Volley': 'Forehand Punch Volley',
    'Overhead Smash': 'Forehand Overhead Smash',
    'Court Positioning': 'Kitchen Line Positioning',
    'Transition Speed': 'Transition Speed (Baseline to Kitchen)',
    'Focus & Concentration': 'Staying Present'
  };

  // Helper function to process assessment data with mapping
  const processAssessmentData = (data: Record<string, number>): Record<string, number> => {
    const mappedSkillData: Record<string, number> = {};
    Object.entries(data).forEach(([key, value]) => {
      // Decode HTML entities
      const decodedKey = key.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      const parts = decodedKey.split('_');
      if (parts.length >= 2) {
        let skillName = parts.slice(1).join('_');
        // Also decode HTML entities in skill name
        skillName = skillName.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        
        // Apply skill mapping for quick assessment
        const officialName = quickToOfficialMapping[skillName] || skillName;
        mappedSkillData[officialName] = value;
      }
    });
    return mappedSkillData;
  };

  // Calculate real-time PCP rating using new dynamic algorithm with coach level weighting
  const calculateCurrentPCP = (coachLevel?: number, currentStudentPCP?: number): number | null => {
    if (Object.keys(assessmentData).length === 0) return null;
    
    const mappedSkillData = processAssessmentData(assessmentData);
    const result = calculatePCPFromAssessment(mappedSkillData, {
      coachLevel: coachLevel as 1 | 2 | 3 | 4 | 5 || 2, // Default to L2
      assessmentMode: assessmentMode || 'full',
      currentPCP: currentStudentPCP,
      previousPCP: currentStudentPCP // For skill floor protection
    });
    return result.pcpRating;
  };

  const handleRatingChange = (skillName: string, rating: number) => {
    setAssessmentData(prev => {
      const updated = {
        ...prev,
        [`${activeCategories[currentCategory].name}_${skillName}`]: rating
      };
      
      // Calculate PCP rating with updated data using new dynamic algorithm
      const mappedSkillData = processAssessmentData(updated);
      const result = calculatePCPFromAssessment(mappedSkillData, {
        coachLevel: Math.max(1, Math.min(5, coachLevel)) as 1 | 2 | 3 | 4 | 5, // Ensure valid coach level 1-5
        assessmentMode: assessmentMode || 'full',
        currentPCP: studentCurrentPCP, // Current student PCP for progression context
        previousPCP: studentCurrentPCP // For skill floor protection
      });
      setCurrentPCPRating(result.pcpRating);
      
      return updated;
    });
  };

  const handleNext = () => {
    if (isLastCategory) {
      handleSubmit();
    } else {
      setCurrentCategory(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/coach/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          coachId,
          assessmentData,
          assessmentMode,
          totalSkills
        })
      });

      if (response.ok) {
        toast({
          title: `${assessmentMode === 'quick' ? '10-Skill Quick' : '55-Skill Full'} Assessment Complete`,
          description: `Successfully assessed ${studentName} across ${totalSkills} PCP skills. Final PCP Rating: ${currentPCPRating?.toFixed(1) || 'N/A'}`,
        });
        onComplete();
      } else {
        throw new Error('Failed to submit assessment');
      }
    } catch (error) {
      toast({
        title: "Assessment Failed",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Assessment mode selection screen
  if (!assessmentMode) {
    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Star className="w-6 h-6" />
            Choose Assessment Type for {studentName}
          </CardTitle>
          <CardDescription className="text-blue-600">
            Select the assessment depth that matches your coaching goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assessment History Section */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-purple-800 text-sm sm:text-base flex items-center gap-2">
                📋 Assessment History: {studentName}
                {historyLoading && <Clock className="w-4 h-4 animate-spin" />}
              </h4>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-medium underline"
              >
                {showHistory ? 'Hide' : 'Show'} History ({assessmentHistory.length})
              </button>
            </div>
            
            {/* Assessment History Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-purple-700 mb-3">
              <div>
                <strong>Total Assessments:</strong> {assessmentHistory.length}
              </div>
              <div>
                <strong>Latest PCP:</strong> {studentCurrentPCP?.toFixed(1) || 'No previous rating'}
              </div>
              <div>
                <strong>Assessment Trend:</strong> {
                  assessmentHistory.length >= 2 
                    ? assessmentHistory[0]?.pcpRating > assessmentHistory[1]?.pcpRating ? '📈 Improving' 
                    : assessmentHistory[0]?.pcpRating < assessmentHistory[1]?.pcpRating ? '📉 Declining'
                    : '➖ Stable'
                    : 'No trend data'
                }
              </div>
            </div>

            {/* Detailed History (Expandable) */}
            {showHistory && assessmentHistory.length > 0 && (
              <div className="max-h-48 overflow-y-auto border border-purple-200 rounded p-2 bg-white space-y-2">
                {assessmentHistory.map((assessment, index) => (
                  <div key={assessment.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <div className="font-medium">
                        {new Date(assessment.assessmentDate).toLocaleDateString()} - L{assessment.coachLevel} {assessment.coachName}
                      </div>
                      <div className="text-gray-600">
                        {assessment.assessmentMode === 'quick' ? '⚡ Quick' : '🎯 Full'} Assessment • 
                        PCP: {assessment.pcpRating?.toFixed(1)} • 
                        {assessment.totalSkills} skills
                      </div>
                    </div>
                    <div className="ml-2">
                      {index === 0 && <Badge className="bg-green-100 text-green-800 text-xs">Latest</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showHistory && assessmentHistory.length === 0 && (
              <div className="text-center text-purple-600 py-4">
                No previous assessments found for this student.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all p-4 bg-green-50"
              onClick={() => {
                setAssessmentMode('quick');
                setCurrentCategory(0);
              }}
            >
              <div className="text-center space-y-2">
                <div className="text-green-600 font-bold text-lg">⚡ Quick Assessment</div>
                <div className="text-sm text-green-700">
                  <strong>10 Core Skills</strong> across 5 categories<br/>
                  Perfect for: Initial evaluation, time-limited sessions
                </div>
                <Badge className="bg-green-600 text-white">~15 minutes</Badge>
              </div>
            </Card>
            
            <Card 
              className="border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all p-4 bg-purple-50"
              onClick={() => {
                setAssessmentMode('full');
                setCurrentCategory(0);
              }}
            >
              <div className="text-center space-y-2">
                <div className="text-purple-600 font-bold text-lg">🎯 Full Assessment</div>
                <div className="text-sm text-purple-700">
                  <strong>All 55 Skills</strong> comprehensive evaluation<br/>
                  Perfect for: Detailed coaching plans, competitive players
                </div>
                <Badge className="bg-purple-600 text-white">~45 minutes</Badge>
              </div>
            </Card>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-blue-800 flex items-center gap-2 text-lg sm:text-xl">
              <Star className="w-5 h-5 sm:w-6 sm:h-6" />
              {assessmentMode === 'quick' ? '⚡ Quick' : '🎯 Full'} Assessment: {studentName}
            </CardTitle>
            <CardDescription className="text-blue-600 mt-1 text-sm">
              {activeCategories[currentCategory]?.description} - Category {currentCategory + 1}/{activeCategories.length}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Badge className="bg-blue-600 text-white text-xs">
              Progress: {Math.round(categoryProgress)}%
            </Badge>
            {currentPCPRating !== null && (
              <Badge className="bg-green-600 text-white text-xs">
                PCP: {currentPCPRating.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${categoryProgress}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            {activeCategories[currentCategory]?.name} Skills Assessment
          </h4>
          
          <div className="space-y-3 sm:space-y-4">
            {currentSkills.map((skill, index) => {
              const currentRating = assessmentData[`${activeCategories[currentCategory].name}_${skill.name}`];
              return (
                <div key={skill.name} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">{skill.name}</span>
                      {currentRating && (
                        <Badge className="bg-green-100 text-green-800 text-xs w-fit">
                          {currentRating}/10 - {getRatingDescription(currentRating).split(' - ')[1]}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Mobile-optimized rating buttons - 2 rows of 5 */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-5 gap-1 sm:gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={currentRating === rating ? "default" : "outline"}
                            size="sm"
                            className={`h-8 sm:h-10 text-xs sm:text-sm ${
                              currentRating === rating 
                                ? "bg-blue-600 text-white" 
                                : "hover:bg-blue-100"
                            }`}
                            onClick={() => handleRatingChange(skill.name, rating)}
                            title={getRatingDescription(rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                      <div className="grid grid-cols-5 gap-1 sm:gap-2">
                        {[6, 7, 8, 9, 10].map((rating) => (
                          <Button
                            key={rating}
                            variant={currentRating === rating ? "default" : "outline"}
                            size="sm"
                            className={`h-8 sm:h-10 text-xs sm:text-sm ${
                              currentRating === rating 
                                ? "bg-blue-600 text-white" 
                                : "hover:bg-blue-100"
                            }`}
                            onClick={() => handleRatingChange(skill.name, rating)}
                            title={getRatingDescription(rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 italic">{skill.desc}</p>
                    
                    {/* Rating help text */}
                    {currentRating && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
                        <strong>Rating {currentRating}:</strong> {getRatingDescription(currentRating)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Enhanced Live PCP Display - Persistent & Visually Rich */}
        <div className="sticky top-4 z-10 bg-gradient-to-r from-emerald-100 via-blue-100 to-purple-100 border-2 border-emerald-300 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
                </div>
                <h4 className="font-bold text-emerald-800 text-lg sm:text-xl">
                  Live PCP Rating
                </h4>
                <div className="flex-1 border-t border-emerald-300 ml-2"></div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-emerald-700 font-medium">
                  📊 Assessment Progress: {Object.keys(assessmentData).length} of {assessmentMode === 'quick' ? 10 : 55} skills rated
                </p>
                
                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden" 
                      style={{ width: `${currentPCPRating ? ((currentPCPRating - 2.0) / 6.0) * 100 : 0}%` }}
                    >
                      <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-600 mt-2">
                    <span className="bg-white px-2 py-1 rounded shadow-sm">2.0</span>
                    <span className="bg-white px-2 py-1 rounded shadow-sm">5.0</span>
                    <span className="bg-white px-2 py-1 rounded shadow-sm">8.0</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Rating Display */}
            <div className="text-center ml-6 bg-white rounded-xl p-4 shadow-lg border border-emerald-200">
              <div className="relative">
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentPCPRating ? currentPCPRating.toFixed(1) : '-.--'}
                </div>
                {currentPCPRating && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-bounce"></div>
                )}
              </div>
              
              <div className="text-xs font-bold text-emerald-600 mt-1 tracking-wide">
                PCP RATING
              </div>
              
              <div className={`text-xs font-medium mt-1 px-2 py-1 rounded-full text-white shadow-sm ${
                !currentPCPRating ? 'bg-gray-400' :
                currentPCPRating >= 7.0 ? 'bg-purple-600' : 
                currentPCPRating >= 6.0 ? 'bg-blue-600' :
                currentPCPRating >= 5.0 ? 'bg-emerald-600' :
                currentPCPRating >= 4.0 ? 'bg-yellow-600' :
                currentPCPRating >= 3.0 ? 'bg-orange-600' : 'bg-red-600'
              }`}>
                {!currentPCPRating ? 'PENDING' :
                 currentPCPRating >= 7.0 ? 'EXPERT' : 
                 currentPCPRating >= 6.0 ? 'ADVANCED' :
                 currentPCPRating >= 5.0 ? 'INTERMEDIATE' :
                 currentPCPRating >= 4.0 ? 'DEVELOPING' :
                 currentPCPRating >= 3.0 ? 'BEGINNER+' : 'BEGINNER'}
              </div>
            </div>
          </div>
          
          {/* Skill Categories Progress Indicators */}
          {Object.keys(assessmentData).length > 0 && (
            <div className="mt-4 pt-4 border-t border-emerald-200">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {['Power & Serves', 'Soft Game', 'Net Play', 'Movement', 'Mental Game'].map((category, idx) => {
                  const categorySkills = Object.keys(assessmentData).filter(key => key.startsWith(activeCategories[idx]?.name || ''));
                  const totalInCategory = activeCategories[idx]?.skills?.length || 1;
                  const progress = (categorySkills.length / totalInCategory) * 100;
                  
                  return (
                    <div key={category} className="text-center">
                      <div className={`w-full h-1.5 rounded-full ${progress === 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                      <span className="text-emerald-700 font-medium mt-1 block">{category}</span>
                      <span className="text-emerald-600">{categorySkills.length}/{totalInCategory}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button variant="outline" onClick={onCancel} className="order-3 sm:order-1">
            Cancel Assessment
          </Button>
          {currentCategory > 0 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentCategory(prev => prev - 1)}
              className="order-2"
            >
              Previous Category
            </Button>
          )}
          <Button 
            onClick={handleNext}
            className="bg-green-600 hover:bg-green-700 order-1 sm:order-3 flex-1 sm:flex-initial"
            disabled={currentSkills.some(skill => !assessmentData[`${activeCategories[currentCategory].name}_${skill.name}`])}
          >
            {isLastCategory ? `Submit ${assessmentMode === 'quick' ? 'Quick' : 'Full'} Assessment` : "Next Category"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface CurrentUser {
  id: number;
  username: string;
  displayName?: string;
  coachLevel?: number;
}

interface AssignedStudent {
  id: number;
  displayName: string;
  currentRanking: number | null;
  lastAssessment: string | null;
}

interface RecentAssessment {
  id: number;
  studentId: number;
  studentName: string;
  pcpRating: number;
  assessmentMode: string;
  skillsAssessed: number;
  assessmentDate: string;
  daysAgo: number;
}

/**
 * Enhanced Coach Dashboard - Professional Interface
 * 
 * Major UI Enhancement Features:
 * - Modern gradient headers with visual hierarchy
 * - Enhanced loading states and empty states
 * - Professional card layouts with shadows and hover effects
 * - Improved color coding and visual feedback
 * - Streamlined workflow with better UX
 */
export default function CoachDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  
  // Debug logging
  console.log('CoachDashboard render - selectedStudent:', selectedStudent, 'showAssessment:', showAssessment);
  
  // Reference for scroll behavior
  const assessmentSectionRef = useRef<HTMLDivElement>(null);

  // Fetch coach's current user data
  const { data: currentUser } = useQuery<CurrentUser>({
    queryKey: ['/api/auth/current-user'],
    refetchInterval: 30000
  });

  // Fetch coach's assigned students
  const { data: assignedStudents = [], isLoading: studentsLoading } = useQuery<AssignedStudent[]>({
    queryKey: ['/api/coach/assigned-students'],
    enabled: !!currentUser?.id
  });

  // Fetch recent assessments using new multi-coach weighted assessment endpoint
  const { data: recentAssessments = [], isLoading: assessmentsLoading } = useQuery<RecentAssessment[]>({
    queryKey: ['/api/coach-weighted-assessment/recent-assessments'],
    enabled: !!currentUser?.id
  });

  const getCoachLevelInfo = (level: number) => {
    const info = {
      1: { name: "L1 Coach", desc: "Basic Skills", color: "bg-green-500", focus: "Fundamentals, beginner instruction" },
      2: { name: "L2 Coach", desc: "Intermediate", color: "bg-blue-500", focus: "Strategy development, technique refinement" },
      3: { name: "L3 Coach", desc: "Advanced", color: "bg-purple-500", focus: "Competitive training, advanced tactics" },
      4: { name: "L4 Coach", desc: "Elite", color: "bg-orange-500", focus: "Tournament preparation, elite performance" },
      5: { name: "L5 Coach", desc: "Master", color: "bg-red-500", focus: "Certification, mentor training, system mastery" }
    };
    return info[level as keyof typeof info] || { name: `L${level}`, desc: "Coach", color: "bg-gray-500", focus: "Coaching" };
  };

  const coachLevel = currentUser?.coachLevel || 0;
  const coachInfo = getCoachLevelInfo(coachLevel);

  if (coachLevel === 0) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert>
          <User className="w-4 h-4" />
          <AlertDescription>
            You are not currently assigned as a coach. Contact an admin to get coach credentials and student assignments.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 max-w-7xl space-y-4 md:space-y-6 overflow-hidden">
      {/* Enhanced Coach Header with Professional Design */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 md:p-6 border border-blue-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div className="space-y-2 md:space-y-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">Coach Workspace</h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 truncate">Level {coachLevel} Coaching Platform</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <Badge className={`${coachInfo.color} text-white px-2 sm:px-3 py-1 shadow-sm text-xs sm:text-sm shrink-0`}>
                {coachInfo.name}
              </Badge>
              <span className="text-xs sm:text-sm text-gray-700 font-medium truncate">{coachInfo.focus}</span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl line-clamp-2 sm:line-clamp-none">
              Welcome to your enhanced coaching dashboard. Manage student assessments and track progress using our comprehensive 55-skill PCP evaluation system.
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-2 md:gap-3 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm w-full md:w-auto">
              <div className="flex items-center gap-1 sm:gap-2 text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="font-medium whitespace-nowrap">{assignedStudents.length} Students</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="font-medium whitespace-nowrap">{recentAssessments.length} Assessments</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-gray-100 h-auto">
          <TabsTrigger value="students" className="data-[state=active]:bg-white py-2 px-1 sm:px-3 text-xs sm:text-sm">
            <span className="truncate">My Students</span>
          </TabsTrigger>
          <TabsTrigger value="connections" className="data-[state=active]:bg-white py-2 px-1 sm:px-3 text-xs sm:text-sm">
            <span className="truncate">Connections</span>
          </TabsTrigger>
          <TabsTrigger value="discover" className="data-[state=active]:bg-white py-2 px-1 sm:px-3 text-xs sm:text-sm">
            <span className="hidden sm:inline">Coach Connect</span>
            <span className="sm:hidden">Discover</span>
          </TabsTrigger>
          <TabsTrigger value="ratings" className="data-[state=active]:bg-white py-2 px-1 sm:px-3 text-xs sm:text-sm">
            <span className="hidden sm:inline">Rating Management</span>
            <span className="sm:hidden">Ratings</span>
          </TabsTrigger>
          <TabsTrigger value="assessments" className="data-[state=active]:bg-white py-2 px-1 sm:px-3 text-xs sm:text-sm">
            <span className="hidden sm:inline">Recent Assessments</span>
            <span className="sm:hidden">Assessments</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-white py-2 px-1 sm:px-3 text-xs sm:text-sm">
            <span className="hidden sm:inline">Progress Tracking</span>
            <span className="sm:hidden">Progress</span>
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Students ({assignedStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Loading students...</span>
                  </div>
                </div>
              ) : assignedStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No Students Assigned</h3>
                  <p className="text-sm mb-4">You don't have any students assigned for coaching yet.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                    <h4 className="font-medium text-blue-800 mb-2">Getting Started:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Admin assigns students to coaches through the admin panel</li>
                      <li>• Once assigned, students will appear here for assessment</li>
                      <li>• You can then conduct the 55-skill PCP assessment system</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Ready for Coaching</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Select a student below to begin their skills assessment using our comprehensive 55-skill evaluation system.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    {assignedStudents.map((student) => (
                      <Card key={student.id} className="border-2 hover:border-blue-300 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg overflow-hidden">
                        <CardContent className="p-3 sm:p-4 md:p-6">
                          <div className="flex flex-col space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md shrink-0">
                                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{student.displayName}</h3>
                                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                                    {student.currentRanking ? `Ranking: #${student.currentRanking}` : 'Unranked Player'}
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant={student.lastAssessment ? "default" : "secondary"}
                                className={`text-xs shrink-0 ${student.lastAssessment ? "bg-green-100 text-green-800" : ""}`}
                              >
                                {student.lastAssessment ? 'Assessed' : 'New'}
                              </Badge>
                            </div>
                          
                            <div className="space-y-3">
                              <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm text-xs sm:text-sm py-2 sm:py-3" 
                                onClick={() => {
                                  console.log('Start Progressive Assessment clicked for student:', student.id);
                                  setSelectedStudent(student.id);
                                  setShowAssessment(true);
                                  console.log('Selected student set to:', student.id);
                                  // Scroll to assessment section after a brief delay
                                  setTimeout(() => {
                                    assessmentSectionRef.current?.scrollIntoView({ 
                                      behavior: 'smooth', 
                                      block: 'start' 
                                    });
                                  }, 100);
                                }}
                              >
                                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Start Progressive Assessment</span>
                                <span className="sm:hidden">Start Assessment</span>
                              </Button>
                            
                              {student.lastAssessment && (
                                <div className="text-xs text-gray-500 text-center bg-gray-50 rounded p-2 break-words">
                                  Last assessed: {new Date(student.lastAssessment).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Assessment Launch Section */}
          {selectedStudent && (
            <Card 
              ref={assessmentSectionRef}
              className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
            >
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Launch Skills Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Progressive Assessment System</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Focused Training:</strong> Target specific skill categories</li>
                      <li>• <strong>Comprehensive Evaluation:</strong> Full 55-skill assessment available</li>
                      <li>• <strong>Real-time PCP Calculation:</strong> Live rating updates as skills are assessed</li>
                      <li>• <strong>Session Documentation:</strong> Notes and progress tracking</li>
                      <li>• <strong>Coach-Student Validation:</strong> Security and assignment verification</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Ready to Begin:</strong> All 55 skills across 5 categories will be assessed. 
                      Each skill is rated 1-10 for comprehensive player evaluation.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedStudent(null)}
                      className="flex-1"
                    >
                      Back to Students
                    </Button>
                    <Button 
                      onClick={() => setShowAssessment(true)}
                      className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Begin Assessment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <CoachStudentRequests />
        </TabsContent>

        {/* Coach Connect Discovery Tab */}
        <TabsContent value="discover" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Coach Connect Discovery
              </CardTitle>
              <CardDescription>
                Scan student QR codes or enter passport codes to connect for assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Connect with Students</h4>
                <p className="text-sm text-blue-700">
                  Scan a student's passport QR code or manually enter their passport code to request a coaching connection for assessments.
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <CoachStudentScanner 
                  onStudentFound={(student) => {
                    toast({
                      title: "Connection Requested!",
                      description: `Sent connection request to ${student.displayName}`,
                    });
                  }}
                  onClose={() => {}}
                />
              </div>
                
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Advanced Features Available
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                  Access the full Coach Assessment System with mobile-first progressive interface, 
                  anti-abuse controls, and comprehensive testing suite:
                </p>
                <Link href="/coach-system-test">
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                    <Target className="w-4 h-4 mr-2" />
                    Open Assessment System
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rating Management Tab */}
        <TabsContent value="ratings" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Rating Management
              </CardTitle>
              <CardDescription>
                Manage PROVISIONAL and CONFIRMED ratings with L4+ validation system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Anti-Abuse Status Indicator */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Anti-Abuse System Active</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Rate limiting, anomaly detection, and admin review queues are monitoring all assessment activities.
                  </p>
                </div>
                
                <ProvisionalRatingManagement userId={currentUser?.id || 0} userRole="coach" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Skills Assessment Interface */}
        {showAssessment && selectedStudent && (
          <div className="mt-6" ref={assessmentSectionRef}>
            <SkillAssessmentInterface
              coachId={currentUser?.id || 0}
              studentId={selectedStudent}
              studentName={assignedStudents.find(s => s.id === selectedStudent)?.displayName || ""}
              coachLevel={coachLevel}
              onComplete={() => {
                setShowAssessment(false);
                setSelectedStudent(null);
              }}
              onCancel={() => setShowAssessment(false)}
            />
          </div>
        )}

        {/* Enhanced Recent Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Recent Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assessmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Loading assessments...</span>
                  </div>
                </div>
              ) : recentAssessments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No Assessments Yet</h3>
                  <p className="text-sm mb-4">You haven't conducted any skills assessments yet.</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left max-w-md mx-auto">
                    <h4 className="font-medium text-yellow-800 mb-2">Ready to Begin:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Go to the "My Students" tab to select a student</li>
                      <li>• Click "Start Skills Assessment" to begin</li>
                      <li>• Complete the 55-skill PCP evaluation</li>
                      <li>• Assessment results will appear here</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAssessments.map((assessment) => (
                    <Card key={assessment.id} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedStudent(assessment.studentId)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{assessment.studentName}</h4>
                            <p className="text-sm text-gray-600">
                              {assessment.assessmentMode === 'full' ? '🎯 Full Assessment' : '⚡ Quick Assessment'} • {assessment.skillsAssessed} skills
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">PCP {assessment.pcpRating?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {assessment.daysAgo === 0 ? 'Today' : assessment.daysAgo === 1 ? 'Yesterday' : `${assessment.daysAgo} days ago`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Progress Tracking Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Student Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Progress Tracking Coming Soon</h3>
                <p className="text-sm mb-4">Advanced student progress analytics will be available once assessments are conducted.</p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h4 className="font-medium text-purple-800 mb-2">Future Features:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Student improvement tracking over time</li>
                    <li>• Skill progression graphs and charts</li>
                    <li>• Performance comparison metrics</li>
                    <li>• Coaching effectiveness analytics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}