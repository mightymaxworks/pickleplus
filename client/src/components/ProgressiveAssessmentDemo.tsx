import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { SKILL_CATEGORIES } from '../../../shared/utils/pcpCalculation';
import { Loader2, TrendingUp, TrendingDown, Minus, CheckCircle, AlertTriangle } from 'lucide-react';

interface SkillRating {
  currentRating: number;
  lastAssessed: string;
  assessmentCount: number;
  lastCoachId?: number;
  trendDirection?: 'improving' | 'stable' | 'declining';
  monthlyChange?: number;
}

interface PlayerSkillProfile {
  [skillName: string]: SkillRating;
}

interface PCPResult {
  pcpRating: number;
  categoryAverages: {
    touch: number;
    technical: number;
    mental: number;
    athletic: number;
    power: number;
  };
  confidenceScore: number;
  totalSkillsAssessed: number;
  isComplete: boolean;
}

export default function ProgressiveAssessmentDemo() {
  const [playerId, setPlayerId] = useState<string>('1');
  const [coachId, setCoachId] = useState<string>('2');
  const [skillProfile, setSkillProfile] = useState<PlayerSkillProfile>({});
  const [pcpResult, setPcpResult] = useState<PCPResult | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<Array<{skillName: string, rating: number}>>([]);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [assessmentType, setAssessmentType] = useState<string>('focused');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [staleSkills, setStaleSkills] = useState<any[]>([]);
  
  const { toast } = useToast();

  // Load player skill profile
  const loadSkillProfile = async () => {
    if (!playerId) return;
    
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/progressive-assessment/player/${playerId}/skills`);
      const data = await response.json();
      
      if (data.success) {
        setSkillProfile(data.data.skillProfile || {});
        toast({
          title: "Skill Profile Loaded",
          description: `Found ${data.data.totalSkills} assessed skills`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load skill profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate current PCP rating
  const calculatePCP = async () => {
    if (!playerId) return;
    
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/progressive-assessment/player/${playerId}/pcp-rating`);
      const data = await response.json();
      
      if (data.success) {
        setPcpResult(data.data);
        toast({
          title: "PCP Rating Calculated",
          description: `Current PCP: ${data.data.pcpRating} (${Math.round(data.data.confidenceScore * 100)}% confidence)`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate PCP rating",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Check stale skills
  const checkStaleSkills = async () => {
    if (!playerId) return;
    
    try {
      const response = await apiRequest('GET', `/api/progressive-assessment/player/${playerId}/stale-skills?maxAge=90`);
      const data = await response.json();
      
      if (data.success) {
        setStaleSkills(data.data.staleSkills || []);
      }
    } catch (error) {
      console.error('Failed to check stale skills:', error);
    }
  };

  // Update skills from focused assessment
  const updateSkills = async () => {
    if (!playerId || !coachId || selectedSkills.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select skills and provide coach ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('POST', `/api/progressive-assessment/player/${playerId}/update-skills`, {
        skills: selectedSkills,
        coachId: parseInt(coachId),
        sessionNotes,
        assessmentType
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Skills Updated",
          description: `Updated ${data.data.updatedSkills.length} skills. New PCP: ${data.data.newPcpRating}`
        });
        
        // Reload data
        await loadSkillProfile();
        await calculatePCP();
        setSelectedSkills([]);
        setSessionNotes('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update skills",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add skill to assessment
  const addSkillToAssessment = (skillName: string) => {
    if (selectedSkills.find(s => s.skillName === skillName)) return;
    
    setSelectedSkills([...selectedSkills, { skillName, rating: 5 }]);
  };

  // Update skill rating
  const updateSkillRating = (skillName: string, rating: number) => {
    setSelectedSkills(prev => 
      prev.map(skill => 
        skill.skillName === skillName ? { ...skill, rating } : skill
      )
    );
  };

  // Remove skill from assessment
  const removeSkillFromAssessment = (skillName: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill.skillName !== skillName));
  };

  const getTrendIcon = (direction?: 'improving' | 'stable' | 'declining') => {
    if (direction === 'improving') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (direction === 'declining') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getFreshnessColor = (lastAssessed: string) => {
    const days = Math.floor((new Date().getTime() - new Date(lastAssessed).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 30) return 'bg-green-500';
    if (days <= 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    if (playerId) {
      loadSkillProfile();
      calculatePCP();
      checkStaleSkills();
    }
  }, [playerId]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Progressive Assessment Model Demo</h1>
        <p className="text-gray-600">Individual skill tracking with focused session capability</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="playerId">Player ID</Label>
              <Input
                id="playerId"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Enter player ID"
              />
            </div>
            <div>
              <Label htmlFor="coachId">Coach ID</Label>
              <Input
                id="coachId"
                value={coachId}
                onChange={(e) => setCoachId(e.target.value)}
                placeholder="Enter coach ID"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadSkillProfile} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assess">Assess Skills</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stale">Stale Skills</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current PCP Rating */}
            <Card>
              <CardHeader>
                <CardTitle>Current PCP Rating</CardTitle>
                <CardDescription>Calculated from individual skill ratings</CardDescription>
              </CardHeader>
              <CardContent>
                {pcpResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">
                        {pcpResult.pcpRating}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(pcpResult.confidenceScore * 100)}% confidence
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Touch:</span>
                        <span>{pcpResult.categoryAverages.touch.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Technical:</span>
                        <span>{pcpResult.categoryAverages.technical.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mental:</span>
                        <span>{pcpResult.categoryAverages.mental.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Athletic:</span>
                        <span>{pcpResult.categoryAverages.athletic.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Power:</span>
                        <span>{pcpResult.categoryAverages.power.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    <Badge variant={pcpResult.isComplete ? "default" : "secondary"}>
                      {pcpResult.totalSkillsAssessed}/55 Skills Assessed
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Button onClick={calculatePCP} disabled={loading}>
                      Calculate PCP Rating
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Summary</CardTitle>
                <CardDescription>Individual skill ratings and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(skillProfile).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No skills assessed yet</p>
                  ) : (
                    Object.entries(skillProfile).map(([skillName, skill]) => (
                      <div key={skillName} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{skillName}</div>
                          <div className="text-xs text-gray-500">
                            Assessed {Math.floor((new Date().getTime() - new Date(skill.lastAssessed).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{skill.currentRating.toFixed(1)}</Badge>
                          {getTrendIcon(skill.trendDirection)}
                          <div className={`w-2 h-2 rounded-full ${getFreshnessColor(skill.lastAssessed)}`} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assess">
          <Card>
            <CardHeader>
              <CardTitle>Focused Skill Assessment</CardTitle>
              <CardDescription>Assess specific skills without requiring complete evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assessment Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessmentType">Assessment Type</Label>
                  <Select value={assessmentType} onValueChange={setAssessmentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="focused">Focused Session</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="baseline">Baseline Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category Focus (Optional)</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {Object.keys(SKILL_CATEGORIES).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Session Notes */}
              <div>
                <Label htmlFor="sessionNotes">Session Notes</Label>
                <Textarea
                  id="sessionNotes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add notes about this assessment session..."
                />
              </div>

              {/* Skill Selection */}
              <div>
                <Label>Available Skills</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                  {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => 
                    (!selectedCategory || selectedCategory === category) ? 
                      [...skills].map((skillName: string) => (
                        <Button
                          key={skillName}
                          variant="outline"
                          size="sm"
                          onClick={() => addSkillToAssessment(skillName)}
                          disabled={!!selectedSkills.find(s => s.skillName === skillName)}
                        >
                          {skillName}
                        </Button>
                      )) : null
                  )}
                </div>
              </div>

              {/* Selected Skills for Assessment */}
              {selectedSkills.length > 0 && (
                <div>
                  <Label>Skills to Assess</Label>
                  <div className="space-y-3 mt-2">
                    {selectedSkills.map(skill => (
                      <div key={skill.skillName} className="flex items-center space-x-4 p-3 border rounded">
                        <div className="flex-1 font-medium">{skill.skillName}</div>
                        <div className="flex items-center space-x-2">
                          <Label>Rating:</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={skill.rating}
                            onChange={(e) => updateSkillRating(skill.skillName, parseInt(e.target.value))}
                            className="w-20"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkillFromAssessment(skill.skillName)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Assessment */}
              <Button 
                onClick={updateSkills} 
                disabled={loading || selectedSkills.length === 0}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Skills ({selectedSkills.length} skills)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>Track skill progression over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                Assessment history functionality coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stale Skills Tab */}
        <TabsContent value="stale">
          <Card>
            <CardHeader>
              <CardTitle>Skills Needing Update</CardTitle>
              <CardDescription>Skills that haven't been assessed recently (90+ days)</CardDescription>
            </CardHeader>
            <CardContent>
              {staleSkills.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">All skills are current!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {staleSkills.map(skill => (
                    <div key={skill.skillName} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{skill.skillName}</div>
                        <div className="text-sm text-gray-500">
                          Last assessed {skill.daysSinceAssessment} days ago
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{skill.currentRating}</Badge>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <Button
                          size="sm"
                          onClick={() => addSkillToAssessment(skill.skillName)}
                        >
                          Assess Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}