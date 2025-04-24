import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Slider
} from "@/components/ui/slider";
import { Loader2, Save, User, Plus, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlayerData {
  playStyle: string;
  preferredShots: string[];
  improvementAreas: string[];
  playFrequency: string;
  experienceLevel: string;
  preferredPosition: string;
  matchNotes: string;
  skillSelfRating: Record<string, number>;
}

interface PlayerDataCollectorProps {
  onSubmit: (data: PlayerData) => void;
  isLoading?: boolean;
}

const PlayerDataCollector: React.FC<PlayerDataCollectorProps> = ({ 
  onSubmit,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [playerData, setPlayerData] = useState<PlayerData>({
    playStyle: '',
    preferredShots: [],
    improvementAreas: [],
    playFrequency: '',
    experienceLevel: '',
    preferredPosition: '',
    matchNotes: '',
    skillSelfRating: {
      technical: 3,
      tactical: 3,
      physical: 3,
      mental: 3,
      consistency: 3
    }
  });

  const handleChange = (field: keyof PlayerData, value: any) => {
    setPlayerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddPreferredShot = (shot: string) => {
    if (!playerData.preferredShots.includes(shot)) {
      setPlayerData(prev => ({
        ...prev,
        preferredShots: [...prev.preferredShots, shot]
      }));
    }
  };

  const handleAddImprovementArea = (area: string) => {
    if (!playerData.improvementAreas.includes(area)) {
      setPlayerData(prev => ({
        ...prev,
        improvementAreas: [...prev.improvementAreas, area]
      }));
    }
  };

  const handleRatingChange = (dimension: string, value: number[]) => {
    setPlayerData(prev => ({
      ...prev,
      skillSelfRating: {
        ...prev.skillSelfRating,
        [dimension]: value[0]
      }
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!playerData.playStyle || !playerData.experienceLevel || !playerData.playFrequency) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields (play style, experience level, and play frequency).",
        variant: "destructive",
      });
      return;
    }

    onSubmit(playerData);
    
    toast({
      title: "Player Data Saved",
      description: "Your information has been saved and will be used to enhance your CourtIQ Pro coaching.",
    });
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Player Data Input
        </CardTitle>
        <CardDescription>
          Help CourtIQ Pro understand your game better by providing more information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {!isExpanded ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setIsExpanded(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Provide More Information For Better Coaching
          </Button>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="playStyle">Your Play Style <span className="text-red-500">*</span></Label>
                <Select 
                  value={playerData.playStyle} 
                  onValueChange={(value) => handleChange('playStyle', value)}
                >
                  <SelectTrigger id="playStyle">
                    <SelectValue placeholder="Select your play style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aggressive">Aggressive - Power Player</SelectItem>
                    <SelectItem value="defensive">Defensive - Consistent Player</SelectItem>
                    <SelectItem value="allCourt">All-Court - Balanced Player</SelectItem>
                    <SelectItem value="strategic">Strategic - Smart Placement</SelectItem>
                    <SelectItem value="netPlayer">Net Player - Volley Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Experience Level <span className="text-red-500">*</span></Label>
                <Select 
                  value={playerData.experienceLevel} 
                  onValueChange={(value) => handleChange('experienceLevel', value)}
                >
                  <SelectTrigger id="experienceLevel">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (less than 1 year)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                    <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    <SelectItem value="competitive">Competitive Tournament Player</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="playFrequency">How Often You Play <span className="text-red-500">*</span></Label>
                <Select 
                  value={playerData.playFrequency} 
                  onValueChange={(value) => handleChange('playFrequency', value)}
                >
                  <SelectTrigger id="playFrequency">
                    <SelectValue placeholder="Select play frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="occasionally">Occasionally (few times a month)</SelectItem>
                    <SelectItem value="weekly">Weekly (1-2 times per week)</SelectItem>
                    <SelectItem value="regular">Regular (2-3 times per week)</SelectItem>
                    <SelectItem value="frequent">Frequent (4+ times per week)</SelectItem>
                    <SelectItem value="competitive">Competitive Training Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredPosition">Preferred Court Position</Label>
                <Select 
                  value={playerData.preferredPosition} 
                  onValueChange={(value) => handleChange('preferredPosition', value)}
                >
                  <SelectTrigger id="preferredPosition">
                    <SelectValue placeholder="Select preferred position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baseline">Baseline Player</SelectItem>
                    <SelectItem value="kitchenLine">Kitchen Line Player</SelectItem>
                    <SelectItem value="allCourt">All-Court Player</SelectItem>
                    <SelectItem value="leftSide">Left Side Specialist</SelectItem>
                    <SelectItem value="rightSide">Right Side Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Self-Assessment (1-5 scale)</Label>
              <div className="space-y-6 p-4 border rounded-md">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Technical Skills</Label>
                    <span className="font-medium">{playerData.skillSelfRating.technical}</span>
                  </div>
                  <Slider 
                    value={[playerData.skillSelfRating.technical]} 
                    min={1} 
                    max={5}
                    step={1}
                    onValueChange={(value) => handleRatingChange('technical', value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Tactical Awareness</Label>
                    <span className="font-medium">{playerData.skillSelfRating.tactical}</span>
                  </div>
                  <Slider 
                    value={[playerData.skillSelfRating.tactical]} 
                    min={1} 
                    max={5}
                    step={1}
                    onValueChange={(value) => handleRatingChange('tactical', value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Physical Fitness</Label>
                    <span className="font-medium">{playerData.skillSelfRating.physical}</span>
                  </div>
                  <Slider 
                    value={[playerData.skillSelfRating.physical]} 
                    min={1} 
                    max={5}
                    step={1}
                    onValueChange={(value) => handleRatingChange('physical', value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Mental Toughness</Label>
                    <span className="font-medium">{playerData.skillSelfRating.mental}</span>
                  </div>
                  <Slider 
                    value={[playerData.skillSelfRating.mental]} 
                    min={1} 
                    max={5}
                    step={1}
                    onValueChange={(value) => handleRatingChange('mental', value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Consistency</Label>
                    <span className="font-medium">{playerData.skillSelfRating.consistency}</span>
                  </div>
                  <Slider 
                    value={[playerData.skillSelfRating.consistency]} 
                    min={1} 
                    max={5}
                    step={1}
                    onValueChange={(value) => handleRatingChange('consistency', value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matchNotes">Recent Match Notes</Label>
              <Textarea
                id="matchNotes"
                placeholder="Describe recent matches, challenges you faced, or specific patterns you noticed..."
                className="min-h-[100px]"
                value={playerData.matchNotes}
                onChange={(e) => handleChange('matchNotes', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Shots (select multiple)</Label>
                <div className="flex flex-wrap gap-2">
                  {['Third Shot Drop', 'Dink', 'Drive', 'Volley', 'Lob', 'Serve'].map(shot => (
                    <Button
                      key={shot}
                      type="button"
                      size="sm"
                      variant={playerData.preferredShots.includes(shot) ? "default" : "outline"}
                      onClick={() => handleAddPreferredShot(shot)}
                      className="text-xs"
                    >
                      {shot}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Areas to Improve (select multiple)</Label>
                <div className="flex flex-wrap gap-2">
                  {['Serve', 'Return', 'Third Shot', 'Net Game', 'Court Coverage', 'Strategy'].map(area => (
                    <Button
                      key={area}
                      type="button"
                      size="sm"
                      variant={playerData.improvementAreas.includes(area) ? "default" : "outline"}
                      onClick={() => handleAddImprovementArea(area)}
                      className="text-xs"
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      {isExpanded && (
        <CardFooter className="flex justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Player Data
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PlayerDataCollector;