import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Star, Target, BookOpen, User, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SKILL_CATEGORIES, calculatePCPRating, getCategoryWeight, type AssessmentData, type CategoryName } from '@shared/utils/pcpCalculationSimple';

interface SimpleProgressiveAssessmentProps {
  coachId: number;
  studentId: number;
  studentName: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface SkillRating {
  skillName: string;
  rating: number;
  category: string;
}

export function SimpleProgressiveAssessment({
  coachId,
  studentId, 
  studentName,
  onComplete,
  onCancel
}: SimpleProgressiveAssessmentProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | 'all'>('all');
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>({});
  const [sessionNotes, setSessionNotes] = useState('');
  const [currentPCP, setCurrentPCP] = useState<number | null>(null);

  // Get skills to display based on selected category
  const getSkillsToDisplay = () => {
    if (selectedCategory === 'all') {
      return Object.entries(SKILL_CATEGORIES).flatMap(([categoryName, skills]) =>
        skills.map(skill => ({ skill, category: categoryName }))
      );
    }
    return SKILL_CATEGORIES[selectedCategory].map(skill => ({ skill, category: selectedCategory }));
  };

  // Update skill rating and recalculate PCP
  const updateSkillRating = (skillName: string, rating: number) => {
    const newRatings = { ...skillRatings, [skillName]: rating };
    setSkillRatings(newRatings);
    
    // Calculate PCP if we have any ratings
    if (Object.keys(newRatings).length > 0) {
      const result = calculatePCPRating(newRatings);
      setCurrentPCP(result.pcpRating);
    }
  };

  // Save assessment
  const saveAssessment = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/coaching/progressive-assessment", {
        coachId,
        studentId,
        assessmentType: selectedCategory === 'all' ? 'comprehensive' : 'focused',
        selectedCategory: selectedCategory === 'all' ? null : selectedCategory,
        skills: Object.entries(skillRatings).map(([skillName, rating]) => ({
          skillName,
          rating,
          category: getSkillsToDisplay().find(s => s.skill === skillName)?.category || ''
        })),
        sessionNotes,
        pcpRating: currentPCP
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Saved",
        description: "Progressive assessment completed successfully.",
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const skillsToDisplay = getSkillsToDisplay();
  const completedSkills = Object.keys(skillRatings).length;
  const totalSkills = skillsToDisplay.length;
  const progressPercentage = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Star className="w-5 h-5" />
            Progressive Skills Assessment
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-700">Student: {studentName}</span>
          </div>
          {currentPCP && (
            <Badge className="bg-green-500 text-white">
              Current PCP Rating: {currentPCP.toFixed(2)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div>
          <Label htmlFor="category-select">Assessment Focus</Label>
          <Select value={selectedCategory} onValueChange={(value: CategoryName | 'all') => setSelectedCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category to assess" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories (Comprehensive)</SelectItem>
              {Object.keys(SKILL_CATEGORIES).map(categoryName => (
                <SelectItem key={categoryName} value={categoryName}>
                  {categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {completedSkills} of {totalSkills} skills</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Skills Assessment - Touch-Friendly Interface */}
        <div className="space-y-6">
          {selectedCategory === 'all' ? (
            // Comprehensive Assessment - Show all categories with sections
            Object.keys(SKILL_CATEGORIES).map(categoryName => {
              const categorySkills = SKILL_CATEGORIES[categoryName as CategoryName];
              const categoryProgress = categorySkills.filter(skill => skillRatings[skill] > 0).length;
              const categoryWeight = getCategoryWeight(categoryName as CategoryName);
              
              return (
                <div key={categoryName} className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {categoryName} ({categorySkills.length} skills)
                    </h3>
                    <Badge variant="outline" className="text-sm">
                      {Math.round(categoryWeight * 100)}% weight
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Progress: {categoryProgress}/{categorySkills.length} skills assessed
                  </div>
                  <div className="grid gap-3">
                    {categorySkills.map(skill => (
                      <div key={skill} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium text-sm flex-1">{skill}</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <button
                              key={num}
                              onClick={() => updateSkillRating(skill, num)}
                              className={`w-8 h-8 rounded text-xs font-medium border transition-colors ${
                                skillRatings[skill] === num 
                                  ? 'bg-blue-500 text-white border-blue-500' 
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Focused Assessment - Single category
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-lg mb-4">
                {selectedCategory} Skills Assessment
              </h3>
              <div className="grid gap-3">
                {SKILL_CATEGORIES[selectedCategory as CategoryName].map(skill => (
                  <div key={skill} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium text-sm flex-1">{skill}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button
                          key={num}
                          onClick={() => updateSkillRating(skill, num)}
                          className={`w-8 h-8 rounded text-xs font-medium border transition-colors ${
                            skillRatings[skill] === num 
                              ? 'bg-blue-500 text-white border-blue-500' 
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Session Notes */}
        <div className="space-y-2">
          <Label htmlFor="session-notes">Session Notes (Optional)</Label>
          <Textarea
            id="session-notes"
            placeholder="Add notes about this training session..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="min-h-20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => saveAssessment.mutate()}
            disabled={saveAssessment.isPending || completedSkills === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {saveAssessment.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Saving...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                Save Assessment
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}