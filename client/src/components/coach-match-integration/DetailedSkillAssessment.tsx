/**
 * Detailed Skill Assessment Component
 * Comprehensive micro-skills breakdown for PCP Assessment
 * Features 22 individual technical skills for granular evaluation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Brain, 
  Activity, 
  Heart,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Zap,
  Pencil
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Detailed skill breakdown structure based on test-assessment-analysis.ts
interface DetailedSkills {
  // Technical Skills (22 micro-skills)
  serve_execution: number;
  return_technique: number;
  third_shot: number;
  overhead_defense: number;
  shot_creativity: number;
  court_movement: number;
  forehand_topspin: number;
  forehand_slice: number;
  backhand_topspin: number;
  backhand_slice: number;
  forehand_dead_dink: number;
  forehand_topspin_dink: number;
  forehand_slice_dink: number;
  backhand_dead_dink: number;
  backhand_topspin_dink: number;
  backhand_slice_dink: number;
  forehand_block_volley: number;
  forehand_drive_volley: number;
  forehand_dink_volley: number;
  backhand_block_volley: number;
  backhand_drive_volley: number;
  backhand_dink_volley: number;

  // Tactical Skills (5 skills)
  shot_selection: number;
  court_positioning: number;
  pattern_recognition: number;
  risk_management: number;
  communication: number;

  // Physical Skills (4 skills)
  footwork: number;
  balance_stability: number;
  reaction_time: number;
  endurance: number;

  // Mental Skills (4 skills)
  focus_concentration: number;
  pressure_performance: number;
  adaptability: number;
  sportsmanship: number;
}

interface SkillCategory {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  weight: number;
  description: string;
  skills: SkillDefinition[];
}

interface SkillDefinition {
  id: keyof DetailedSkills;
  name: string;
  description: string;
  category: string;
}

interface DetailedSkillAssessmentProps {
  onAssessmentComplete: (skills: DetailedSkills) => void;
  onDimensionalScores: (scores: { technical: number; tactical: number; physical: number; mental: number }) => void;
  playerId?: number;
  coachId?: number;
}

export const DetailedSkillAssessment: React.FC<DetailedSkillAssessmentProps> = ({
  onAssessmentComplete,
  onDimensionalScores,
  playerId,
  coachId
}) => {
  // Initialize all skills at 50 (5.0/10.0 scale)
  const [skills, setSkills] = useState<DetailedSkills>({
    // Technical Skills
    serve_execution: 50, return_technique: 50, third_shot: 50, overhead_defense: 50,
    shot_creativity: 50, court_movement: 50, forehand_topspin: 50, forehand_slice: 50,
    backhand_topspin: 50, backhand_slice: 50, forehand_dead_dink: 50, forehand_topspin_dink: 50,
    forehand_slice_dink: 50, backhand_dead_dink: 50, backhand_topspin_dink: 50, backhand_slice_dink: 50,
    forehand_block_volley: 50, forehand_drive_volley: 50, forehand_dink_volley: 50,
    backhand_block_volley: 50, backhand_drive_volley: 50, backhand_dink_volley: 50,
    
    // Tactical Skills
    shot_selection: 50, court_positioning: 50, pattern_recognition: 50, risk_management: 50, communication: 50,
    
    // Physical Skills
    footwork: 50, balance_stability: 50, reaction_time: 50, endurance: 50,
    
    // Mental Skills
    focus_concentration: 50, pressure_performance: 50, adaptability: 50, sportsmanship: 50
  });

  const [expandedCategories, setExpandedCategories] = useState<string[]>(['technical']);
  const [sessionNotes, setSessionNotes] = useState('');

  // Skill categories with detailed breakdown
  const skillCategories: SkillCategory[] = [
    {
      id: 'technical',
      name: 'Technical Skills',
      icon: <Target className="h-5 w-5" />,
      color: 'blue',
      weight: 40,
      description: '22 detailed stroke mechanics and technical execution skills',
      skills: [
        // Core Strokes (6)
        { id: 'serve_execution', name: 'Serve Execution', description: 'Power, placement, and consistency of serves', category: 'Core Strokes' },
        { id: 'return_technique', name: 'Return Technique', description: 'Quality of return of serve shots', category: 'Core Strokes' },
        { id: 'third_shot', name: 'Third Shot', description: 'Drop shot, drive, and strategic third shots', category: 'Core Strokes' },
        { id: 'overhead_defense', name: 'Overhead & Defense', description: 'Overhead smashes and defensive positioning', category: 'Core Strokes' },
        { id: 'shot_creativity', name: 'Shot Creativity', description: 'Variety and innovation in shot selection', category: 'Core Strokes' },
        { id: 'court_movement', name: 'Court Movement', description: 'Footwork, positioning, and court coverage', category: 'Core Strokes' },
        
        // Groundstrokes (4)
        { id: 'forehand_topspin', name: 'Forehand Topspin', description: 'Power and control on forehand drives', category: 'Groundstrokes' },
        { id: 'forehand_slice', name: 'Forehand Slice', description: 'Forehand slice technique and placement', category: 'Groundstrokes' },
        { id: 'backhand_topspin', name: 'Backhand Topspin', description: 'Backhand drive power and accuracy', category: 'Groundstrokes' },
        { id: 'backhand_slice', name: 'Backhand Slice', description: 'Backhand slice control and variety', category: 'Groundstrokes' },
        
        // Dinking (6)
        { id: 'forehand_dead_dink', name: 'Forehand Dead Dink', description: 'Soft forehand dinks with minimal spin', category: 'Dinking' },
        { id: 'forehand_topspin_dink', name: 'Forehand Topspin Dink', description: 'Aggressive forehand dinks with topspin', category: 'Dinking' },
        { id: 'forehand_slice_dink', name: 'Forehand Slice Dink', description: 'Forehand slice dinks and drops', category: 'Dinking' },
        { id: 'backhand_dead_dink', name: 'Backhand Dead Dink', description: 'Soft backhand dinks and placement', category: 'Dinking' },
        { id: 'backhand_topspin_dink', name: 'Backhand Topspin Dink', description: 'Aggressive backhand dink attacks', category: 'Dinking' },
        { id: 'backhand_slice_dink', name: 'Backhand Slice Dink', description: 'Backhand slice dinks and variety', category: 'Dinking' },
        
        // Volleys (6)
        { id: 'forehand_block_volley', name: 'Forehand Block Volley', description: 'Defensive forehand volley blocks', category: 'Volleys' },
        { id: 'forehand_drive_volley', name: 'Forehand Drive Volley', description: 'Attacking forehand volleys', category: 'Volleys' },
        { id: 'forehand_dink_volley', name: 'Forehand Dink Volley', description: 'Soft forehand volley placement', category: 'Volleys' },
        { id: 'backhand_block_volley', name: 'Backhand Block Volley', description: 'Defensive backhand volley blocks', category: 'Volleys' },
        { id: 'backhand_drive_volley', name: 'Backhand Drive Volley', description: 'Attacking backhand volleys', category: 'Volleys' },
        { id: 'backhand_dink_volley', name: 'Backhand Dink Volley', description: 'Soft backhand volley control', category: 'Volleys' }
      ]
    },
    {
      id: 'tactical',
      name: 'Tactical Awareness',
      icon: <Brain className="h-5 w-5" />,
      color: 'purple',
      weight: 25,
      description: '5 strategic thinking and game management skills',
      skills: [
        { id: 'shot_selection', name: 'Shot Selection', description: 'Choosing the right shot for each situation', category: 'Strategy' },
        { id: 'court_positioning', name: 'Court Positioning', description: 'Optimal positioning during rallies', category: 'Strategy' },
        { id: 'pattern_recognition', name: 'Pattern Recognition', description: 'Reading opponent patterns and tendencies', category: 'Strategy' },
        { id: 'risk_management', name: 'Risk Management', description: 'Balancing aggressive and conservative play', category: 'Strategy' },
        { id: 'communication', name: 'Communication', description: 'Doubles communication and teamwork', category: 'Strategy' }
      ]
    },
    {
      id: 'physical',
      name: 'Physical Fitness',
      icon: <Activity className="h-5 w-5" />,
      color: 'green',
      weight: 20,
      description: '4 athletic ability and physical conditioning skills',
      skills: [
        { id: 'footwork', name: 'Footwork', description: 'Movement efficiency and court coverage', category: 'Athleticism' },
        { id: 'balance_stability', name: 'Balance & Stability', description: 'Body control during shots', category: 'Athleticism' },
        { id: 'reaction_time', name: 'Reaction Time', description: 'Quick response to opponent shots', category: 'Athleticism' },
        { id: 'endurance', name: 'Endurance', description: 'Stamina throughout long matches', category: 'Athleticism' }
      ]
    },
    {
      id: 'mental',
      name: 'Mental Game',
      icon: <Heart className="h-5 w-5" />,
      color: 'orange',
      weight: 15,
      description: '4 mental toughness and competitive mindset skills',
      skills: [
        { id: 'focus_concentration', name: 'Focus & Concentration', description: 'Maintaining attention throughout matches', category: 'Mindset' },
        { id: 'pressure_performance', name: 'Pressure Performance', description: 'Playing well in high-stakes situations', category: 'Mindset' },
        { id: 'adaptability', name: 'Adaptability', description: 'Adjusting strategy based on conditions', category: 'Mindset' },
        { id: 'sportsmanship', name: 'Sportsmanship', description: 'Fair play and respect for opponents', category: 'Mindset' }
      ]
    }
  ];

  // Calculate dimensional averages
  const calculateDimensionalScores = () => {
    const technicalSkills = skillCategories[0].skills;
    const tacticalSkills = skillCategories[1].skills;
    const physicalSkills = skillCategories[2].skills;
    const mentalSkills = skillCategories[3].skills;

    const technicalAvg = technicalSkills.reduce((sum, skill) => sum + skills[skill.id], 0) / technicalSkills.length;
    const tacticalAvg = tacticalSkills.reduce((sum, skill) => sum + skills[skill.id], 0) / tacticalSkills.length;
    const physicalAvg = physicalSkills.reduce((sum, skill) => sum + skills[skill.id], 0) / physicalSkills.length;
    const mentalAvg = mentalSkills.reduce((sum, skill) => sum + skills[skill.id], 0) / mentalSkills.length;

    return {
      technical: technicalAvg,
      tactical: tacticalAvg,
      physical: physicalAvg,
      mental: mentalAvg
    };
  };

  // Update dimensional scores when skills change
  useEffect(() => {
    const dimensionalScores = calculateDimensionalScores();
    onDimensionalScores(dimensionalScores);
  }, [skills]);

  const handleSkillChange = (skillId: keyof DetailedSkills, value: number[]) => {
    setSkills(prev => ({
      ...prev,
      [skillId]: value[0]
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCompleteAssessment = () => {
    onAssessmentComplete(skills);
  };

  // Group skills by subcategory
  const groupSkillsBySubcategory = (skills: SkillDefinition[]) => {
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, SkillDefinition[]>);
  };

  const dimensionalScores = calculateDimensionalScores();

  return (
    <div className="space-y-4 md:space-y-6 mobile-overflow-safe overflow-hidden">
      {/* Mobile-First Assessment Overview */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <div className="p-2 rounded-lg bg-primary/20">
              <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            PCP Assessment
          </CardTitle>
          <div className="text-xs md:text-sm text-muted-foreground">
            55 individual skills • Weighted scoring system
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {skillCategories.map(category => {
              const score = dimensionalScores[category.id as keyof typeof dimensionalScores];
              const colorClasses = {
                blue: 'text-blue-600 bg-blue-50 border-blue-200',
                purple: 'text-purple-600 bg-purple-50 border-purple-200',
                green: 'text-green-600 bg-green-50 border-green-200',
                orange: 'text-orange-600 bg-orange-50 border-orange-200'
              };
              return (
                <div key={category.id} className={`p-2 sm:p-3 rounded-lg border min-w-0 overflow-hidden ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <div className="shrink-0">{category.icon}</div>
                    <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">
                      {(score / 10).toFixed(1)}
                    </div>
                  </div>
                  <div className="text-xs font-medium truncate">{category.name}</div>
                  <div className="text-xs opacity-70">{category.weight}% weight</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modern Mobile-First Category Assessment */}
      <div className="space-y-3 md:space-y-4">
        {skillCategories.map(category => {
          const isExpanded = expandedCategories.includes(category.id);
          const categorySkills = groupSkillsBySubcategory(category.skills);
          const categoryAvg = dimensionalScores[category.id as keyof typeof dimensionalScores];
          
          const colorClasses = {
            blue: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
            purple: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50',
            green: 'border-green-200 bg-green-50/50 hover:bg-green-50',
            orange: 'border-orange-200 bg-orange-50/50 hover:bg-orange-50'
          };
          
          const categoryIconClasses = {
            blue: 'bg-blue-100 text-blue-600',
            purple: 'bg-purple-100 text-purple-600', 
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600'
          };
          
          const categoryScoreClasses = {
            blue: 'text-blue-600',
            purple: 'text-purple-600',
            green: 'text-green-600', 
            orange: 'text-orange-600'
          };

          return (
            <Card key={category.id} className={`border ${colorClasses[category.color as keyof typeof colorClasses]} transition-colors overflow-hidden`}>
              <CardHeader 
                className="cursor-pointer pb-3 active:scale-[0.98] transition-transform" 
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
                    <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${categoryIconClasses[category.color as keyof typeof categoryIconClasses]}`}>
                      {category.icon}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <CardTitle className="text-sm sm:text-base md:text-lg mb-1 truncate">{category.name}</CardTitle>
                      <div className="text-xs md:text-sm text-muted-foreground truncate">
                        {category.skills.length} skills • {category.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                    <div className="text-right hidden sm:block">
                      <div className={`text-lg font-bold ${categoryScoreClasses[category.color as keyof typeof categoryScoreClasses]}`}>
                        {(categoryAvg / 10).toFixed(1)}
                      </div>
                      <Progress value={categoryAvg} className="w-12 sm:w-16 h-2" />
                    </div>
                    <div className="sm:hidden text-center">
                      <div className={`text-sm font-bold ${categoryScoreClasses[category.color as keyof typeof categoryScoreClasses]}`}>
                        {(categoryAvg / 10).toFixed(1)}
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4 md:space-y-6">
                    {Object.entries(categorySkills).map(([subcategory, subcategorySkills]) => (
                      <div key={subcategory}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-sm md:text-base text-foreground">
                            {subcategory}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {subcategorySkills.length} skills
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {subcategorySkills.map(skill => (
                            <div key={skill.id} className="p-3 md:p-4 bg-background/50 border rounded-lg hover:shadow-sm transition-shadow overflow-hidden">
                              <div className="flex flex-col space-y-2 mb-3">
                                <div className="flex items-start justify-between gap-2 min-w-0">
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <label className="font-medium text-sm md:text-base block truncate">
                                      {skill.name}
                                    </label>
                                    <div className="text-xs md:text-sm text-muted-foreground mt-1 break-words">
                                      {skill.description}
                                    </div>
                                  </div>
                                  <div className="shrink-0 ml-2">
                                    <div className="text-sm sm:text-base font-bold text-primary bg-primary/10 px-2 py-1 rounded min-w-[3rem] text-center">
                                      {(skills[skill.id] / 10).toFixed(1)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <Slider
                                  value={[skills[skill.id]]}
                                  onValueChange={(value) => handleSkillChange(skill.id, value)}
                                  max={100}
                                  min={0}
                                  step={5}
                                  className="w-full touch-manipulation slider-mobile"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                                  <span>1.0</span>
                                  <span className="hidden sm:inline">5.0</span>
                                  <span>10.0</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Mobile-Optimized Session Notes */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted">
              <Pencil className="h-4 w-4" />
            </div>
            Session Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Key observations, improvements, focus areas..."
            className="min-h-[80px] md:min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Mobile-First Action Button */}
      <div className="sticky bottom-4 md:static md:bottom-auto">
        <div className="flex justify-center px-4 md:px-0">
          <Button 
            onClick={handleCompleteAssessment}
            size="lg"
            className="w-full max-w-md md:w-auto md:px-8 py-3 text-base font-semibold shadow-lg"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Complete Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};