/**
 * Enhanced Physical Fitness Assessment Tab
 * 24 micro-components across 4 main categories for comprehensive pickleball fitness evaluation
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
  Zap,
  Heart,
  Activity,
  Brain
} from 'lucide-react';

interface PhysicalFitnessData {
  // Footwork & Agility (6 components)
  lateralMovement: number;
  forwardBackwardTransitions: number;
  splitStepTiming: number;
  multidirectionalChanges: number;
  crossoverSteps: number;
  recoverySteps: number;
  // Balance & Stability (6 components)
  dynamicBalance: number;
  staticBalance: number;
  coreStability: number;
  singleLegBalance: number;
  balanceRecovery: number;
  weightTransfer: number;
  // Reaction & Response (6 components)
  visualReaction: number;
  auditoryReaction: number;
  decisionSpeed: number;
  handEyeCoordination: number;
  anticipationSkills: number;
  recoveryReaction: number;
  // Endurance & Conditioning (6 components)
  aerobicCapacity: number;
  anaerobicPower: number;
  muscularEndurance: number;
  mentalStamina: number;
  heatTolerance: number;
  recoveryBetweenPoints: number;
}

interface PhysicalFitnessAssessmentProps {
  physicalSkills: PhysicalFitnessData;
  onUpdate: (skills: PhysicalFitnessData) => void;
}

const PhysicalFitnessCategories = {
  footworkAgility: {
    title: "Footwork & Agility",
    icon: Activity,
    color: "bg-blue-500",
    description: "Court movement efficiency and agility",
    components: [
      { key: 'lateralMovement', label: 'Lateral Movement', description: 'Side-to-side court coverage speed' },
      { key: 'forwardBackwardTransitions', label: 'Forward/Backward Transitions', description: 'Approach and retreat efficiency' },
      { key: 'splitStepTiming', label: 'Split-Step Timing', description: 'Preparation positioning before opponent contact' },
      { key: 'multidirectionalChanges', label: 'Multi-directional Changes', description: 'Quick direction changes during rallies' },
      { key: 'crossoverSteps', label: 'Cross-over Steps', description: 'Efficient court coverage technique' },
      { key: 'recoverySteps', label: 'Recovery Steps', description: 'Getting back to ready position after shots' }
    ]
  },
  balanceStability: {
    title: "Balance & Stability",
    icon: Target,
    color: "bg-green-500",
    description: "Body control and stability during play",
    components: [
      { key: 'dynamicBalance', label: 'Dynamic Balance', description: 'Maintaining control while moving and hitting' },
      { key: 'staticBalance', label: 'Static Balance', description: 'Stability during setup and follow-through' },
      { key: 'coreStability', label: 'Core Stability', description: 'Trunk control during rotation and reaching' },
      { key: 'singleLegBalance', label: 'Single-leg Balance', description: 'Stability when reaching for wide shots' },
      { key: 'balanceRecovery', label: 'Balance Recovery', description: 'Regaining position after off-balance shots' },
      { key: 'weightTransfer', label: 'Weight Transfer', description: 'Smooth transition between feet during strokes' }
    ]
  },
  reactionResponse: {
    title: "Reaction & Response",
    icon: Zap,
    color: "bg-yellow-500",
    description: "Quick reactions and decision-making",
    components: [
      { key: 'visualReaction', label: 'Visual Reaction', description: 'Response to opponent\'s paddle contact' },
      { key: 'auditoryReaction', label: 'Auditory Reaction', description: 'Response to ball contact sounds' },
      { key: 'decisionSpeed', label: 'Decision Speed', description: 'Quick tactical choices under pressure' },
      { key: 'handEyeCoordination', label: 'Hand-Eye Coordination', description: 'Tracking and contact precision' },
      { key: 'anticipationSkills', label: 'Anticipation Skills', description: 'Reading opponent\'s intentions' },
      { key: 'recoveryReaction', label: 'Recovery Reaction', description: 'Quick response after defensive shots' }
    ]
  },
  enduranceConditioning: {
    title: "Endurance & Conditioning",
    icon: Heart,
    color: "bg-red-500",
    description: "Sustained performance and conditioning",
    components: [
      { key: 'aerobicCapacity', label: 'Aerobic Capacity', description: 'Sustained performance over long matches' },
      { key: 'anaerobicPower', label: 'Anaerobic Power', description: 'High-intensity rally performance' },
      { key: 'muscularEndurance', label: 'Muscular Endurance', description: 'Repeated shot execution without fatigue' },
      { key: 'mentalStamina', label: 'Mental Stamina', description: 'Focus maintenance throughout matches' },
      { key: 'heatTolerance', label: 'Heat Tolerance', description: 'Performance in various weather conditions' },
      { key: 'recoveryBetweenPoints', label: 'Recovery Between Points', description: 'Quick physiological recovery' }
    ]
  }
};

export default function EnhancedPhysicalFitnessAssessment({ 
  physicalSkills, 
  onUpdate 
}: PhysicalFitnessAssessmentProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    footworkAgility: true,
    balanceStability: false,
    reactionResponse: false,
    enduranceConditioning: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateSkill = (skillKey: keyof PhysicalFitnessData, value: number) => {
    onUpdate({
      ...physicalSkills,
      [skillKey]: value
    });
  };

  const calculateCategoryAverage = (components: any[]) => {
    const values = components.map(comp => physicalSkills[comp.key as keyof PhysicalFitnessData]);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const overallPhysicalRating = Object.values(physicalSkills).reduce((sum, val) => sum + val, 0) / 24;

  const renderFitnessTestingPanel = (categoryKey: string) => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Timer className="h-4 w-4" />
        Fitness Testing Protocols
      </h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {categoryKey === 'footworkAgility' && (
          <>
            <Button variant="outline" size="sm">Lateral Shuffle Test</Button>
            <Button variant="outline" size="sm">4-Corner Touch Test</Button>
          </>
        )}
        {categoryKey === 'balanceStability' && (
          <>
            <Button variant="outline" size="sm">Single-Leg Stand</Button>
            <Button variant="outline" size="sm">Dynamic Balance Board</Button>
          </>
        )}
        {categoryKey === 'reactionResponse' && (
          <>
            <Button variant="outline" size="sm">Random Ball Feed</Button>
            <Button variant="outline" size="sm">Light Response Drill</Button>
          </>
        )}
        {categoryKey === 'enduranceConditioning' && (
          <>
            <Button variant="outline" size="sm">Match Simulation</Button>
            <Button variant="outline" size="sm">High-Intensity Intervals</Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Physical Fitness Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Enhanced Physical Fitness Assessment
          </CardTitle>
          <CardDescription>
            Comprehensive 24-component physical evaluation across 4 main categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {Object.entries(PhysicalFitnessCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              const average = calculateCategoryAverage(category.components);
              
              return (
                <div key={key} className="text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-sm font-medium">{category.title}</div>
                  <div className="text-lg font-bold text-blue-600">{average.toFixed(1)}</div>
                  <Progress value={average * 10} className="h-2 mt-1" />
                </div>
              );
            })}
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">Overall Physical Fitness Rating</div>
            <div className="text-3xl font-bold text-blue-600">{overallPhysicalRating.toFixed(1)}/10</div>
            <Progress value={overallPhysicalRating * 10} className="h-3 mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Category Assessments */}
      {Object.entries(PhysicalFitnessCategories).map(([categoryKey, category]) => {
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
                      const value = physicalSkills[component.key as keyof PhysicalFitnessData];
                      
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
                            onValueChange={(values) => updateSkill(component.key as keyof PhysicalFitnessData, values[0])}
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
                  
                  {renderFitnessTestingPanel(categoryKey)}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}