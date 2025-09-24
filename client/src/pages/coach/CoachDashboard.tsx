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
import { ProvisionalRatingManagement } from '@/components/coaching/ProvisionalRatingManagement';
import { CoachAntiAbuseManagement } from '@/components/admin/CoachAntiAbuseManagement';
import { useToast } from '@/hooks/use-toast';

// Enhanced Mobile-Optimized Assessment Interface Component
const SkillAssessmentInterface = ({ studentId, coachId, studentName, onComplete, onCancel }: {
  studentId: number;
  coachId: number;
  studentName: string;
  onComplete: () => void;
  onCancel: () => void;
}) => {
  const [assessmentMode, setAssessmentMode] = useState<'quick' | 'full'>('quick');
  const [currentCategory, setCurrentCategory] = useState(0);
  const [assessmentData, setAssessmentData] = useState<Record<string, number>>({});
  const [currentPCPRating, setCurrentPCPRating] = useState(0);
  const { toast } = useToast();

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

  // Calculate real-time PCP rating based on current assessments
  const calculateCurrentPCP = () => {
    const ratings = Object.values(assessmentData);
    if (ratings.length === 0) return 0;
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    const scaledRating = (average / 10) * 1000; // Scale to 0-1000 PCP points
    return Math.round(scaledRating);
  };

  const handleRatingChange = (skillName: string, rating: number) => {
    setAssessmentData(prev => {
      const updated = {
        ...prev,
        [`${activeCategories[currentCategory].name}_${skillName}`]: rating
      };
      // Update PCP rating in real-time
      const newRating = calculateCurrentPCP();
      setCurrentPCPRating(newRating);
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
          description: `Successfully assessed ${studentName} across ${totalSkills} PCP skills. Final PCP Rating: ${calculateCurrentPCP()}`,
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
  if (!assessmentMode || currentCategory === -1) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all p-4 bg-green-50"
              onClick={() => setAssessmentMode('quick')}
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
              onClick={() => setAssessmentMode('full')}
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
            <Badge className="bg-green-600 text-white text-xs">
              PCP: {calculateCurrentPCP()}
            </Badge>
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
        
        {/* Real-time PCP Display */}
        {Object.keys(assessmentData).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800 text-sm sm:text-base">Real-time PCP Rating</h4>
                <p className="text-xs sm:text-sm text-green-600">
                  Based on {Object.keys(assessmentData).length} skills assessed so far
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-2xl font-bold text-green-700">{calculateCurrentPCP()}</div>
                <div className="text-xs text-green-600">PCP Points</div>
              </div>
            </div>
          </div>
        )}
        
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
  studentName: string;
  overallRating: number;
  assessmentType: string;
  createdAt: string;
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

  // Fetch recent assessments
  const { data: recentAssessments = [], isLoading: assessmentsLoading } = useQuery<RecentAssessment[]>({
    queryKey: ['/api/coach/recent-assessments'],
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
                Discover and connect with players using QR codes or invite codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">New Enhanced Discovery System</h4>
                <p className="text-sm text-blue-700">
                  Use our mobile-first coach discovery system with secure authentication, 
                  anti-abuse controls, and mutual consent protocols.
                </p>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2 hover:border-blue-300 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold">QR Code Discovery</h4>
                        <p className="text-sm text-gray-600">Generate QR codes for players to connect with you instantly</p>
                        <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                          Generate QR Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 hover:border-purple-300 transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold">Invite Codes</h4>
                        <p className="text-sm text-gray-600">Create unique invite codes for private coaching connections</p>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
                          Create Invite Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
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
                      Full System Dashboard
                    </Button>
                  </Link>
                </div>
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
                
                <ProvisionalRatingManagement />
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
                    <Card key={assessment.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{assessment.studentName}</h4>
                            <p className="text-sm text-gray-600">{assessment.assessmentType}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">{assessment.overallRating}/10</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(assessment.createdAt).toLocaleDateString()}
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