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
import { Star, Target, BookOpen, User, ArrowLeft, Info, HelpCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SKILL_CATEGORIES, calculatePCPRating, getCategoryWeight, type AssessmentData, type CategoryName } from '@shared/utils/pcpCalculationSimple';
import { getSkillGuide, getRatingDescription } from '@shared/utils/coachingGuides';

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
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4">
      {/* Main Assessment Content */}
      <div className="flex-1 order-2 lg:order-1">
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
                  <div className="grid gap-4">
                    {categorySkills.map(skill => {
                      const skillGuide = getSkillGuide(skill);
                      const currentRating = skillRatings[skill];
                      
                      return (
                        <div key={skill} className="bg-white border border-gray-200 rounded-lg p-4">
                          {/* Skill Header */}
                          <div className="flex items-start gap-2 mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900">{skill}</h4>
                              <p className="text-xs text-gray-600 mt-1">{skillGuide.description}</p>
                            </div>
                            <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          </div>
                          
                          {/* Rating Buttons */}
                          <div className="flex flex-wrap gap-1 mb-3">
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
                          
                          {/* Smart Indicators */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="bg-red-50 border border-red-200 rounded p-2">
                              <div className="font-medium text-red-700 mb-1">Beginner (1-3)</div>
                              <div className="text-red-600">{skillGuide.indicators[1] || skillGuide.indicators[3] || "Basic skill development needed"}</div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                              <div className="font-medium text-yellow-700 mb-1">Competent (4-5)</div>
                              <div className="text-yellow-600">{skillGuide.indicators[5] || "Adequate execution, room for improvement"}</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded p-2">
                              <div className="font-medium text-green-700 mb-1">Advanced (6-8)</div>
                              <div className="text-green-600">{skillGuide.indicators[7] || "Strong, consistent performance"}</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded p-2">
                              <div className="font-medium text-purple-700 mb-1">Expert (9-10)</div>
                              <div className="text-purple-600">{skillGuide.indicators[9] || "Exceptional, tournament-level skill"}</div>
                            </div>
                          </div>
                          
                          {/* Current Rating Feedback */}
                          {currentRating && (
                            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                              <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-600" />
                                <div>
                                  <span className="font-medium text-blue-700">Rating {currentRating}: </span>
                                  <span className="text-blue-600 text-sm">{getRatingDescription(currentRating).label}</span>
                                </div>
                              </div>
                              <div className="text-xs text-blue-600 mt-1 font-medium">
                                Coach Tip: {skillGuide.coachingTips}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
              <div className="grid gap-4">
                {SKILL_CATEGORIES[selectedCategory as CategoryName].map(skill => {
                  const skillGuide = getSkillGuide(skill);
                  const currentRating = skillRatings[skill];
                  
                  return (
                    <div key={skill} className="bg-white border border-gray-200 rounded-lg p-4">
                      {/* Skill Header */}
                      <div className="flex items-start gap-2 mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">{skill}</h4>
                          <p className="text-xs text-gray-600 mt-1">{skillGuide.description}</p>
                        </div>
                        <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </div>
                      
                      {/* Rating Buttons */}
                      <div className="flex flex-wrap gap-1 mb-3">
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
                      
                      {/* Smart Indicators */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="font-medium text-red-700 mb-1">Beginner (1-3)</div>
                          <div className="text-red-600">{skillGuide.indicators[1] || skillGuide.indicators[3] || "Basic skill development needed"}</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <div className="font-medium text-yellow-700 mb-1">Competent (4-5)</div>
                          <div className="text-yellow-600">{skillGuide.indicators[5] || "Adequate execution, room for improvement"}</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <div className="font-medium text-green-700 mb-1">Advanced (6-8)</div>
                          <div className="text-green-600">{skillGuide.indicators[7] || "Strong, consistent performance"}</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded p-2">
                          <div className="font-medium text-purple-700 mb-1">Expert (9-10)</div>
                          <div className="text-purple-600">{skillGuide.indicators[9] || "Exceptional, tournament-level skill"}</div>
                        </div>
                      </div>
                      
                      {/* Current Rating Feedback */}
                      {currentRating && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-600" />
                            <div>
                              <span className="font-medium text-blue-700">Rating {currentRating}: </span>
                              <span className="text-blue-600 text-sm">{getRatingDescription(currentRating).label}</span>
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 mt-1 font-medium">
                            Coach Tip: {skillGuide.coachingTips}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
    </div>

    {/* Sticky PCP Sidebar */}
    <div className="w-full lg:w-72 flex-shrink-0 order-1 lg:order-2">
      <div className="lg:sticky lg:top-24">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-blue-800 text-lg">Live PCP Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main PCP Display */}
            <div className="text-center bg-white rounded-lg p-4 border border-blue-100">
              <div className="text-4xl font-bold text-blue-600 mb-1">
                {currentPCP?.pcpRating?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">
                {completedSkills} of {totalSkills} skills rated
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Category Breakdown */}
            {currentPCP && currentPCP.categoryAverages && (
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-700 text-sm">Category Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white rounded px-3 py-2 border border-blue-100">
                    <span className="text-xs font-medium text-gray-700">Touch (30%)</span>
                    <span className="font-bold text-blue-600">{currentPCP.categoryAverages.touch?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded px-3 py-2 border border-green-100">
                    <span className="text-xs font-medium text-gray-700">Technical (25%)</span>
                    <span className="font-bold text-green-600">{currentPCP.categoryAverages.technical?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded px-3 py-2 border border-purple-100">
                    <span className="text-xs font-medium text-gray-700">Mental (20%)</span>
                    <span className="font-bold text-purple-600">{currentPCP.categoryAverages.mental?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded px-3 py-2 border border-orange-100">
                    <span className="text-xs font-medium text-gray-700">Athletic (15%)</span>
                    <span className="font-bold text-orange-600">{currentPCP.categoryAverages.athletic?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded px-3 py-2 border border-red-100">
                    <span className="text-xs font-medium text-gray-700">Power (10%)</span>
                    <span className="font-bold text-red-600">{currentPCP.categoryAverages.power?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Progress */}
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <h3 className="font-semibold text-blue-700 text-sm mb-2">Assessment Progress</h3>
              <div className="text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Completion:</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Skills Remaining:</span>
                  <span className="font-medium">{totalSkills - completedSkills}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}