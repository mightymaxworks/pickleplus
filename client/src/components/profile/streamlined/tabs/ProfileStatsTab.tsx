/**
 * PKL-278651-CIQP-0001: CourtIQ™ Skill Profiling System
 * Enhanced profile stats tab with radar chart visualization and skill editing
 */
import React, { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  Activity, Award, TrendingUp, BarChart, ArrowUpRight, 
  ArrowRight, Target, Zap, Info, Edit2, Save, X, HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartTooltip
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { ExternalRatingsSection } from '@/components/profile/ExternalRatingsSection';

interface ProfileStatsTabProps {
  user: any;
  isEditMode: boolean;
}

// Helper function to get a color based on rating value
const getRatingColor = (value: number | null): string => {
  if (!value) return 'bg-gray-200';
  if (value >= 8) return 'bg-green-500';
  if (value >= 6) return 'bg-blue-500';
  if (value >= 4) return 'bg-yellow-500';
  if (value >= 2) return 'bg-orange-500';
  return 'bg-red-500';
};

// Skill descriptions for tooltips
const skillDescriptions = {
  forehandStrength: "Power and control of your forehand shots",
  backhandStrength: "Technique and consistency of your backhand shots",
  servePower: "Speed and placement of your serves",
  dinkAccuracy: "Precision of soft shots near the net",
  thirdShotConsistency: "Accuracy of third shot drops and drives",
  courtCoverage: "Mobility and court positioning"
};

const ProfileStatsTab: FC<ProfileStatsTabProps> = ({ user, isEditMode }) => {
  const { toast } = useToast();
  
  // State for skill editing - automatically enable when isEditMode is true
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillValues, setSkillValues] = useState({
    forehandStrength: user.forehandStrength || 0,
    backhandStrength: user.backhandStrength || 0,
    servePower: user.servePower || 0,
    dinkAccuracy: user.dinkAccuracy || 0,
    thirdShotConsistency: user.thirdShotConsistency || 0,
    courtCoverage: user.courtCoverage || 0
  });
  
  // Automatically enable editing skills when in edit mode
  useEffect(() => {
    if (isEditMode) {
      setEditingSkills(true);
    } else {
      setEditingSkills(false);
    }
  }, [isEditMode]);

  // Format data for radar chart
  const formatSkillsForRadar = () => {
    return [
      {
        subject: 'Forehand',
        A: skillValues.forehandStrength || 0,
        fullMark: 10,
      },
      {
        subject: 'Backhand',
        A: skillValues.backhandStrength || 0,
        fullMark: 10,
      },
      {
        subject: 'Serve',
        A: skillValues.servePower || 0,
        fullMark: 10,
      },
      {
        subject: 'Dink',
        A: skillValues.dinkAccuracy || 0,
        fullMark: 10,
      },
      {
        subject: '3rd Shot',
        A: skillValues.thirdShotConsistency || 0,
        fullMark: 10,
      },
      {
        subject: 'Coverage',
        A: skillValues.courtCoverage || 0,
        fullMark: 10,
      },
    ];
  };
  
  // CourtIQ™ System Data
  const courtIQData = {
    overall: user.rankingPoints || 0,
    forehand: user.forehandStrength || 0,
    backhand: user.backhandStrength || 0,
    serve: user.servePower || 0,
    dink: user.dinkAccuracy || 0,
    thirdShot: user.thirdShotConsistency || 0,
    courtCoverage: user.courtCoverage || 0
  };
  
  // Recent Progress (placeholder)
  const recentProgress = {
    lastMonth: 25,
    lastThreeMonths: 120,
    trend: 'up' // 'up', 'down', or 'stable'
  };
  
  // Match Performance Stats
  const matchStats = {
    totalMatches: user.totalMatches || 0,
    wins: user.matchesWon || 0,
    losses: (user.totalMatches || 0) - (user.matchesWon || 0),
    winRate: user.totalMatches ? Math.round((user.matchesWon / user.totalMatches) * 100) : 0,
    averagePPM: 8.3, // Points Per Match (placeholder)
    streakType: 'win', // 'win' or 'loss'
    streakCount: 3 // Current streak
  };
  
  // Calculate skill level value as percentage (for progress bar)
  const skillLevelValue = parseFloat(user.skillLevel || '0');
  const skillLevelPercentage = (skillLevelValue / 7) * 100; // Assuming max skill level is 7.0
  
  // Calculate average skill rating
  const calculateAverageSkill = () => {
    const values = Object.values(skillValues).filter(val => val !== 0 && val !== null);
    if (values.length === 0) return 0;
    return Math.round((values.reduce((a, b) => (a as number) + (b as number), 0) as number) / values.length * 10) / 10;
  };
  
  // Debounce function to avoid too many API calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };
  
  // Track if we've shown success toast recently to avoid too many toasts
  const [showedSuccessToast, setShowedSuccessToast] = useState(false);

  // Save skill values - we'll call this automatically after slider changes
  const saveSkills = async (newValues?: any) => {
    try {
      const valuesToSave = newValues || skillValues;
      
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(valuesToSave),
      });
      
      if (!response.ok) throw new Error('Failed to update skills');
      
      // Invalidate the user query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      // Show a subtle success toast the first time only
      if (!showedSuccessToast) {
        toast({
          title: 'Changes saved',
          description: 'Your skills are automatically saved as you adjust them',
          duration: 3000,
        });
        
        setShowedSuccessToast(true);
        
        // Reset the flag after 20 seconds so it can show again if they come back later
        setTimeout(() => {
          setShowedSuccessToast(false);
        }, 20000);
      }
    } catch (error) {
      console.error('Error updating skills:', error);
      toast({
        title: 'Error saving changes',
        description: 'Your changes couldn\'t be saved. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Create a debounced version of saveSkills that waits 800ms after slider stops moving
  const debouncedSaveSkills = debounce(saveSkills, 800);
  
  // Handle slider changes - now with auto-save
  const handleSkillChange = (skill: string, value: number[]) => {
    const newValues = {
      ...skillValues,
      [skill]: value[0]
    };
    
    // Update local state immediately
    setSkillValues(newValues);
    
    // Save changes automatically after short delay
    if (isEditMode) {
      debouncedSaveSkills(newValues);
    }
  };
  
  return (
    <div className="space-y-6">
      
      {/* External Ratings Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Rating Systems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* External Ratings Section */}
            <ExternalRatingsSection 
              user={user} 
              isEditMode={isEditMode}
              isCurrentUser={true}
              isEditable={true}
              onSaveSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
                toast({
                  title: 'External ratings updated',
                  description: 'Your external ratings have been updated successfully.'
                });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* CourtIQ™ Skill Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              CourtIQ™ Skill Profile
            </CardTitle>
            
            {/* Auto-saving is enabled, no need for a save button */}
            {isEditMode && (
              <div className="text-xs text-muted-foreground flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <span>Auto-saving</span>
                        <Save className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-[200px]">
                        Changes are saved automatically as you adjust the sliders
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          <CardDescription>
            Track and visualize your pickleball skills on a scale of 1-10
            {isEditMode && (
              <div className="mt-2 p-2 bg-muted/30 rounded-md border border-muted text-xs">
                <span className="font-semibold">Editing Mode:</span> Move the sliders below to adjust your skill ratings from 1-10
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Only show radar chart if some skills have values */}
            {Object.values(skillValues).some(v => v > 0) && (
              <div className="md:w-1/2 mx-auto mb-6 md:mb-0">
                {/* Radar Chart with simpler structure */}
                <div className="h-64 w-full" style={{ maxWidth: '100%' }}>
                  <RadarChart 
                    width={300} 
                    height={250} 
                    cx={150} 
                    cy={125} 
                    outerRadius={100} 
                    data={formatSkillsForRadar()}
                    style={{ margin: '0 auto' }}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 10]} tickCount={6} />
                    <Radar
                      name="Skills"
                      dataKey="A"
                      stroke="#FF5722"
                      fill="#FF5722"
                      fillOpacity={0.6}
                    />
                    <RechartTooltip />
                  </RadarChart>
                </div>
              </div>
            )}
            
            {/* Show placeholder if no skill values */}
            {!Object.values(skillValues).some(v => v > 0) && (
              <div className="md:w-1/2 mx-auto mb-6 md:mb-0 flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                <HelpCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-center text-muted-foreground max-w-[200px]">
                  {isEditMode ? 
                    "Adjust your skill ratings to see your radar chart visualization" : 
                    "No skill ratings available yet"
                  }
                </p>
              </div>
            )}
            
            <div className="md:w-1/2">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">Average Skill Rating</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-[200px]">
                            Average of all your skill ratings on a scale of 1-10
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-xl font-bold">{calculateAverageSkill()}</span>
                </div>
                <Progress 
                  value={calculateAverageSkill() * 10} 
                  className="h-2 mt-2" 
                />
              </div>
              
              {/* Attribute Ratings with Sliders in Edit Mode */}
              <div className="space-y-4">
                {Object.entries(skillValues).map(([skill, value]) => {
                  const displayName = {
                    forehandStrength: 'Forehand',
                    backhandStrength: 'Backhand',
                    servePower: 'Serve Power',
                    dinkAccuracy: 'Dink Accuracy',
                    thirdShotConsistency: 'Third Shot',
                    courtCoverage: 'Court Coverage'
                  }[skill];
                  
                  const description = skillDescriptions[skill as keyof typeof skillDescriptions];
                  
                  return (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1">
                          <span>{displayName}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs max-w-[200px]">{description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="font-medium">{value || 'Not rated'}</span>
                      </div>
                      
                      {editingSkills ? (
                        <div className="relative pt-6 pb-2">
                          <div className="flex justify-between text-xs text-muted-foreground absolute top-0 left-0 right-0 px-1">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                            <span>6</span>
                            <span>7</span>
                            <span>8</span>
                            <span>9</span>
                            <span>10</span>
                          </div>
                          <Slider
                            value={[value as number]}
                            min={0}
                            max={10}
                            step={1}
                            className="py-4"
                            onValueChange={(value) => handleSkillChange(skill, value)}
                          />
                          <div className="text-center text-xs text-muted-foreground mt-1">
                            {editingSkills && <span>← Slide to adjust rating →</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getRatingColor(value as number)}`}
                            style={{ width: `${(value as number) * 10}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Match Performance Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Match Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-3xl font-bold">{matchStats.totalMatches}</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600">{matchStats.wins}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-red-500">{matchStats.losses}</div>
              <div className="text-sm text-muted-foreground">Losses</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2 p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Win Rate</span>
                <Badge variant={matchStats.winRate >= 50 ? "success" : "default"} className="px-2 py-0">
                  {matchStats.winRate}%
                </Badge>
              </div>
              <Progress value={matchStats.winRate} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <div className="text-sm font-medium">Current Streak</div>
                <div className="flex items-center mt-1">
                  <Badge 
                    variant={matchStats.streakType === 'win' ? "outline" : "destructive"} 
                    className={`px-2 py-0 ${matchStats.streakType === 'win' ? 'bg-green-100 text-green-800' : ''}`}
                  >
                    {matchStats.streakType === 'win' ? 'W' : 'L'}
                  </Badge>
                  <span className="mx-1 text-sm font-bold">{matchStats.streakCount}</span>
                </div>
              </div>
              <Zap className={`h-5 w-5 ${matchStats.streakType === 'win' ? 'text-yellow-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStatsTab;