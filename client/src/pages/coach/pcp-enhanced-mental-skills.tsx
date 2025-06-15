/**
 * Enhanced Mental Skills Assessment Tab
 * 24 micro-components across 6 main categories for comprehensive psychological evaluation
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp,
  Timer,
  Target,
  Brain,
  Heart,
  Users,
  Eye,
  Trophy,
  Lightbulb
} from 'lucide-react';

interface MentalSkillsData {
  // Focus & Concentration (4 components)
  sustainedAttention: number;
  selectiveAttention: number;
  dividedAttention: number;
  attentionRecovery: number;
  // Emotional Regulation (4 components)
  frustrationManagement: number;
  anxietyControl: number;
  excitementRegulation: number;
  emotionalStability: number;
  // Competitive Mindset (4 components)
  confidenceBuilding: number;
  resilience: number;
  competitiveness: number;
  mentalToughness: number;
  // Strategic Thinking (4 components)
  problemSolving: number;
  patternRecognition: number;
  decisionMaking: number;
  gamePlanning: number;
  // Communication & Teamwork (4 components)
  partnerCommunication: number;
  positiveSelfTalk: number;
  bodyLanguage: number;
  sportsmanship: number;
  // Performance Psychology (4 components)
  preShotRoutine: number;
  visualization: number;
  flowState: number;
  postErrorRecovery: number;
}

interface MentalSkillsAssessmentProps {
  mentalSkills: MentalSkillsData;
  onUpdate: (skills: MentalSkillsData) => void;
}

const MentalSkillsCategories = {
  focusConcentration: {
    title: "Focus & Concentration",
    icon: Target,
    color: "bg-blue-500",
    description: "Attention control and concentration abilities",
    components: [
      { key: 'sustainedAttention', label: 'Sustained Attention', description: 'Maintaining focus throughout long matches' },
      { key: 'selectiveAttention', label: 'Selective Attention', description: 'Filtering distractions during play' },
      { key: 'dividedAttention', label: 'Divided Attention', description: 'Managing multiple game elements simultaneously' },
      { key: 'attentionRecovery', label: 'Attention Recovery', description: 'Quickly refocusing after disruptions' }
    ]
  },
  emotionalRegulation: {
    title: "Emotional Regulation",
    icon: Heart,
    color: "bg-red-500",
    description: "Managing emotions and maintaining composure",
    components: [
      { key: 'frustrationManagement', label: 'Frustration Management', description: 'Controlling anger after errors' },
      { key: 'anxietyControl', label: 'Anxiety Control', description: 'Managing pre-match and in-game nerves' },
      { key: 'excitementRegulation', label: 'Excitement Regulation', description: 'Channeling positive energy effectively' },
      { key: 'emotionalStability', label: 'Emotional Stability', description: 'Maintaining composure under pressure' }
    ]
  },
  competitiveMindset: {
    title: "Competitive Mindset",
    icon: Trophy,
    color: "bg-yellow-500",
    description: "Mental toughness and competitive drive",
    components: [
      { key: 'confidenceBuilding', label: 'Confidence Building', description: 'Self-belief in abilities and decisions' },
      { key: 'resilience', label: 'Resilience', description: 'Bouncing back from setbacks and losses' },
      { key: 'competitiveness', label: 'Competitiveness', description: 'Drive to win and perform at highest level' },
      { key: 'mentalToughness', label: 'Mental Toughness', description: 'Perseverance through difficult situations' }
    ]
  },
  strategicThinking: {
    title: "Strategic Thinking",
    icon: Lightbulb,
    color: "bg-green-500",
    description: "Tactical analysis and decision-making",
    components: [
      { key: 'problemSolving', label: 'Problem Solving', description: 'Finding solutions during challenging rallies' },
      { key: 'patternRecognition', label: 'Pattern Recognition', description: 'Identifying opponent weaknesses and opportunities' },
      { key: 'decisionMaking', label: 'Decision Making', description: 'Quick tactical choices under time pressure' },
      { key: 'gamePlanning', label: 'Game Planning', description: 'Strategic approach and adjustments' }
    ]
  },
  communicationTeamwork: {
    title: "Communication & Teamwork",
    icon: Users,
    color: "bg-purple-500",
    description: "Social skills and team dynamics",
    components: [
      { key: 'partnerCommunication', label: 'Partner Communication', description: 'Effective doubles communication' },
      { key: 'positiveSelfTalk', label: 'Positive Self-Talk', description: 'Internal dialogue and motivation' },
      { key: 'bodyLanguage', label: 'Body Language', description: 'Non-verbal communication and presence' },
      { key: 'sportsmanship', label: 'Sportsmanship', description: 'Respect for opponents, officials, and game' }
    ]
  },
  performancePsychology: {
    title: "Performance Psychology",
    icon: Brain,
    color: "bg-indigo-500",
    description: "Optimal performance states and routines",
    components: [
      { key: 'preShotRoutine', label: 'Pre-Shot Routine', description: 'Consistent mental preparation' },
      { key: 'visualization', label: 'Visualization', description: 'Mental rehearsal and imagery skills' },
      { key: 'flowState', label: 'Flow State', description: 'Achieving optimal performance zone' },
      { key: 'postErrorRecovery', label: 'Post-Error Recovery', description: 'Mental reset after mistakes' }
    ]
  }
};

export default function EnhancedMentalSkillsAssessment({ 
  mentalSkills, 
  onUpdate 
}: MentalSkillsAssessmentProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    focusConcentration: true,
    emotionalRegulation: false,
    competitiveMindset: false,
    strategicThinking: false,
    communicationTeamwork: false,
    performancePsychology: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateSkill = (skillKey: keyof MentalSkillsData, value: number) => {
    onUpdate({
      ...mentalSkills,
      [skillKey]: value
    });
  };

  const calculateCategoryAverage = (components: any[]) => {
    const values = components.map(comp => mentalSkills[comp.key as keyof MentalSkillsData]);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const overallMentalRating = Object.values(mentalSkills).reduce((sum, val) => sum + val, 0) / 24;

  const renderMentalTestingPanel = (categoryKey: string) => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Timer className="h-4 w-4" />
        Mental Assessment Protocols
      </h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {categoryKey === 'focusConcentration' && (
          <>
            <Button variant="outline" size="sm">Sustained Attention Test</Button>
            <Button variant="outline" size="sm">Distraction Filter Test</Button>
          </>
        )}
        {categoryKey === 'emotionalRegulation' && (
          <>
            <Button variant="outline" size="sm">Stress Response Assessment</Button>
            <Button variant="outline" size="sm">Pressure Simulation</Button>
          </>
        )}
        {categoryKey === 'competitiveMindset' && (
          <>
            <Button variant="outline" size="sm">Confidence Questionnaire</Button>
            <Button variant="outline" size="sm">Resilience Evaluation</Button>
          </>
        )}
        {categoryKey === 'strategicThinking' && (
          <>
            <Button variant="outline" size="sm">Problem Solving Scenarios</Button>
            <Button variant="outline" size="sm">Pattern Recognition Test</Button>
          </>
        )}
        {categoryKey === 'communicationTeamwork' && (
          <>
            <Button variant="outline" size="sm">Communication Analysis</Button>
            <Button variant="outline" size="sm">Teamwork Observation</Button>
          </>
        )}
        {categoryKey === 'performancePsychology' && (
          <>
            <Button variant="outline" size="sm">Routine Consistency Test</Button>
            <Button variant="outline" size="sm">Flow State Assessment</Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mental Skills Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced Mental Skills Assessment
          </CardTitle>
          <CardDescription>
            Comprehensive 24-component psychological evaluation across 6 main categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {Object.entries(MentalSkillsCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              const average = calculateCategoryAverage(category.components);
              
              return (
                <div key={key} className="text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-sm font-medium">{category.title}</div>
                  <div className="text-lg font-bold text-purple-600">{average.toFixed(1)}</div>
                  <Progress value={average * 10} className="h-2 mt-1" />
                </div>
              );
            })}
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">Overall Mental Skills Rating</div>
            <div className="text-3xl font-bold text-purple-600">{overallMentalRating.toFixed(1)}/10</div>
            <Progress value={overallMentalRating * 10} className="h-3 mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Category Assessments */}
      {Object.entries(MentalSkillsCategories).map(([categoryKey, category]) => {
        const IconComponent = category.icon;
        const isOpen = openSections[categoryKey];
        const categoryAverage = calculateCategoryAverage(category.components);

        return (
          <Card key={categoryKey}>
            <Collapsible open={isOpen} onOpenChange={() => toggleSection(categoryKey)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {categoryAverage.toFixed(1)}/10
                      </Badge>
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    {category.components.map((component) => {
                      const value = mentalSkills[component.key as keyof MentalSkillsData];
                      
                      return (
                        <div key={component.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="font-medium">{component.label}</Label>
                              <p className="text-sm text-gray-600">{component.description}</p>
                            </div>
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {value}/10
                            </Badge>
                          </div>
                          
                          <Slider
                            value={[value]}
                            onValueChange={(values) => updateSkill(component.key as keyof MentalSkillsData, values[0])}
                            max={10}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 - Needs Development</span>
                            <span>5 - Average</span>
                            <span>10 - Excellent</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {renderMentalTestingPanel(categoryKey)}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}