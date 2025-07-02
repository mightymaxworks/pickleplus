/**
 * PKL-278651-COACH-GOALS-002 - Assessment-Goal Integration Component
 * 
 * Sprint 2: Connects 4-dimensional PCP assessments with goal recommendations
 * Displays assessment scores and suggests targeted goals for improvement
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp, Brain, Zap, Heart, Trophy, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

// Simple Progress component since it might not exist
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

interface AssessmentData {
  id: number;
  calculated_technical: number;
  calculated_tactical: number;
  calculated_physical: number;
  calculated_mental: number;
  calculated_overall: number;
  assessment_date: string;
  improvement_areas?: string;
  strengths_noted?: string;
}

interface GoalRecommendation {
  category: 'technical' | 'tactical' | 'physical' | 'mental';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetImprovement: number;
  icon: typeof Target;
  color: string;
}

export default function AssessmentGoalIntegration() {
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);

  // Fetch latest PCP assessment data
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ["/api/pcp/assessments"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/pcp/assessments");
        return response.json();
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
        return [];
      }
    }
  });

  const latestAssessment: AssessmentData | null = assessments[0] || null;

  // Generate goal recommendations based on assessment scores
  useEffect(() => {
    if (!latestAssessment) return;

    const dimensionScores = [
      { 
        dimension: 'technical' as const, 
        score: latestAssessment.calculated_technical, 
        icon: Target,
        color: 'bg-blue-500'
      },
      { 
        dimension: 'tactical' as const, 
        score: latestAssessment.calculated_tactical, 
        icon: Brain,
        color: 'bg-purple-500'
      },
      { 
        dimension: 'physical' as const, 
        score: latestAssessment.calculated_physical, 
        icon: Zap,
        color: 'bg-green-500'
      },
      { 
        dimension: 'mental' as const, 
        score: latestAssessment.calculated_mental, 
        icon: Heart,
        color: 'bg-red-500'
      }
    ];

    // Sort by lowest scores (areas needing improvement)
    const sortedDimensions = dimensionScores.sort((a, b) => a.score - b.score);

    const goalSuggestions: Record<string, GoalRecommendation[]> = {
      technical: [
        {
          category: 'technical',
          title: 'Master Third Shot Drop',
          description: 'Improve consistency and placement of third shot drops from baseline',
          priority: 'high',
          targetImprovement: 1.5,
          icon: Target,
          color: 'bg-blue-500'
        },
        {
          category: 'technical',
          title: 'Enhanced Net Play',
          description: 'Develop dinking precision and volley control at the net',
          priority: 'medium',
          targetImprovement: 1.2,
          icon: Target,
          color: 'bg-blue-500'
        }
      ],
      tactical: [
        {
          category: 'tactical',
          title: 'Court Positioning Mastery',
          description: 'Improve positioning and movement patterns during rallies',
          priority: 'high',
          targetImprovement: 1.3,
          icon: Brain,
          color: 'bg-purple-500'
        },
        {
          category: 'tactical',
          title: 'Pattern Recognition',
          description: 'Enhance ability to read opponent strategies and adapt gameplay',
          priority: 'medium',
          targetImprovement: 1.1,
          icon: Brain,
          color: 'bg-purple-500'
        }
      ],
      physical: [
        {
          category: 'physical',
          title: 'Footwork Fundamentals',
          description: 'Improve lateral movement and court coverage efficiency',
          priority: 'high',
          targetImprovement: 1.4,
          icon: Zap,
          color: 'bg-green-500'
        },
        {
          category: 'physical',
          title: 'Endurance Building',
          description: 'Increase stamina for longer matches and tournaments',
          priority: 'medium',
          targetImprovement: 1.2,
          icon: Zap,
          color: 'bg-green-500'
        }
      ],
      mental: [
        {
          category: 'mental',
          title: 'Pressure Performance',
          description: 'Develop composure and consistency under competitive pressure',
          priority: 'high',
          targetImprovement: 1.6,
          icon: Heart,
          color: 'bg-red-500'
        },
        {
          category: 'mental',
          title: 'Focus & Concentration',
          description: 'Enhance mental stamina and point-to-point focus',
          priority: 'medium',
          targetImprovement: 1.3,
          icon: Heart,
          color: 'bg-red-500'
        }
      ]
    };

    // Select top recommendations based on lowest scores
    const newRecommendations: GoalRecommendation[] = [];
    
    sortedDimensions.slice(0, 2).forEach(dim => {
      if (dim.score < 7.0) { // Only recommend if score is below 7.0
        const suggestions = goalSuggestions[dim.dimension] || [];
        newRecommendations.push(...suggestions.slice(0, 1)); // Take top suggestion per dimension
      }
    });

    setRecommendations(newRecommendations);
  }, [latestAssessment]);

  const createGoalFromRecommendation = async (recommendation: GoalRecommendation) => {
    try {
      const goalData = {
        title: recommendation.title,
        description: recommendation.description,
        category: recommendation.category,
        priority: recommendation.priority,
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      };

      await apiRequest("POST", "/api/goals", goalData);
      
      // Refresh goals page
      window.location.reload();
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Assessment-Based Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestAssessment) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Assessment-Based Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Complete a PCP assessment to receive personalized goal recommendations.
          </p>
          <Button className="mt-4" variant="outline">
            Take Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Assessment Overview */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Latest Assessment Results
          </CardTitle>
          <p className="text-sm text-gray-600">
            Assessed on {new Date(latestAssessment.assessment_date).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium">Technical</p>
              <p className="text-2xl font-bold text-blue-600">
                {latestAssessment.calculated_technical.toFixed(1)}
              </p>
              <Progress 
                value={latestAssessment.calculated_technical * 10} 
                className="mt-2 h-2"
              />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-sm font-medium">Tactical</p>
              <p className="text-2xl font-bold text-purple-600">
                {latestAssessment.calculated_tactical.toFixed(1)}
              </p>
              <Progress 
                value={latestAssessment.calculated_tactical * 10} 
                className="mt-2 h-2"
              />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium">Physical</p>
              <p className="text-2xl font-bold text-green-600">
                {latestAssessment.calculated_physical.toFixed(1)}
              </p>
              <Progress 
                value={latestAssessment.calculated_physical * 10} 
                className="mt-2 h-2"
              />
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm font-medium">Mental</p>
              <p className="text-2xl font-bold text-red-600">
                {latestAssessment.calculated_mental.toFixed(1)}
              </p>
              <Progress 
                value={latestAssessment.calculated_mental * 10} 
                className="mt-2 h-2"
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-center">
              Overall PCP Rating: <span className="text-blue-600">{latestAssessment.calculated_overall.toFixed(1)}/10</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Goal Recommendations */}
      {recommendations.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommended Goals
            </CardTitle>
            <p className="text-sm text-gray-600">
              Based on your assessment results, here are targeted goals to improve your weakest areas
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${rec.color} text-white`}>
                        <rec.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{rec.title}</h3>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <p className="text-xs text-gray-500">
                          Target improvement: +{rec.targetImprovement} points
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => createGoalFromRecommendation(rec)}
                      className="ml-4"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Goal
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}