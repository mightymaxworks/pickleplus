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
  Zap
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
    <div className="space-y-6">
      {/* Assessment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Detailed Skill Assessment - PCP Methodology
          </CardTitle>
          <div className="text-sm text-gray-600">
            Comprehensive evaluation across 35 individual skills with weighted PCP scoring
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {skillCategories.map(category => {
              const score = dimensionalScores[category.id as keyof typeof dimensionalScores];
              return (
                <div key={category.id} className="text-center">
                  <div className={`text-2xl font-bold text-${category.color}-600`}>
                    {(score / 10).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">{category.name}</div>
                  <div className="text-xs text-gray-500">({category.weight}% weight)</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Assessment by Category */}
      <div className="space-y-4">
        {skillCategories.map(category => {
          const isExpanded = expandedCategories.includes(category.id);
          const categorySkills = groupSkillsBySubcategory(category.skills);
          const categoryAvg = dimensionalScores[category.id as keyof typeof dimensionalScores];

          return (
            <Card key={category.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="text-sm text-gray-600">{category.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-xl font-bold text-${category.color}-600`}>
                        {(categoryAvg / 10).toFixed(1)}/10
                      </div>
                      <Progress value={categoryAvg} className="w-20 h-2" />
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(categorySkills).map(([subcategory, subcategorySkills]) => (
                      <div key={subcategory}>
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          {subcategory}
                          <Badge variant="outline" className="text-xs">
                            {subcategorySkills.length} skills
                          </Badge>
                        </h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {subcategorySkills.map(skill => (
                            <div key={skill.id} className="space-y-2 p-4 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <label className="font-medium text-sm">{skill.name}</label>
                                <span className="text-sm font-bold text-gray-700">
                                  {(skills[skill.id] / 10).toFixed(1)}/10
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">{skill.description}</div>
                              <Slider
                                value={[skills[skill.id]]}
                                onValueChange={(value) => handleSkillChange(skill.id, value)}
                                max={100}
                                min={0}
                                step={5}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Beginner</span>
                                <span>Advanced</span>
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

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Session Notes & Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Record key observations, improvements noted, areas of focus for next session..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Complete Assessment */}
      <div className="flex justify-center">
        <Button 
          onClick={handleCompleteAssessment}
          size="lg"
          className="px-8 py-3"
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Complete Detailed Assessment
        </Button>
      </div>
    </div>
  );
};