import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Medal, Target, Trophy, TrendingUp } from "lucide-react";
import { CourtIQDetailedAnalysis, getDimensionDisplayName, getDimensionDescription, getDimensionRecommendations } from "@/hooks/use-courtiq-detailed-analysis";

// Highlight component for recommended drills
function RecommendedDrill({ title, description }: { title: string, description?: string }) {
  return (
    <div className="flex p-3 bg-muted/40 rounded-lg mb-2">
      <Target className="h-5 w-5 mr-3 mt-0.5 text-primary/70" />
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}

// Exercise component for improvement suggestions
function ImprovementExercise({ text }: { text: string }) {
  return (
    <div className="flex items-start mb-2.5">
      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

// Growth area component
function GrowthAreaCard({ dimension, score, recommendations }: { 
  dimension: string;
  score: number;
  recommendations: string[];
}) {
  const displayName = getDimensionDisplayName(dimension);
  const description = getDimensionDescription(dimension);
  
  // Calculate progress percentage
  const progress = Math.round((score / 5) * 100);
  
  // Get the dimension's specific color
  const colors = {
    technique: "blue",
    strategy: "indigo",
    consistency: "violet",
    focus: "purple",
    power: "pink",
    speed: "orange"
  };
  
  const color = colors[dimension as keyof typeof colors] || "primary";
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{displayName}</CardTitle>
          <div className="text-md font-semibold">{score.toFixed(1)}/5.0</div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Current Level</span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <h4 className="text-sm font-medium mb-3">Recommended Focus Areas:</h4>
        <div className="space-y-1 mb-4">
          {recommendations.slice(0, 3).map((rec, i) => (
            <ImprovementExercise key={i} text={rec} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CourtIQSkillRecommendations({ data }: { data: CourtIQDetailedAnalysis }) {
  // Get weakest dimensions for focused improvement
  const getDimensionsToImprove = () => {
    const dimensions = [
      { id: "technique", score: data.dimensions.technique.score },
      { id: "strategy", score: data.dimensions.strategy.score },
      { id: "consistency", score: data.dimensions.consistency.score },
      { id: "focus", score: data.dimensions.focus.score },
      { id: "power", score: data.dimensions.power.score },
      { id: "speed", score: data.dimensions.speed.score },
    ];
    
    // Sort by score (ascending)
    return dimensions.sort((a, b) => a.score - b.score);
  };

  const dimensionsToImprove = getDimensionsToImprove();
  const weakestDimension = dimensionsToImprove[0];
  const secondWeakestDimension = dimensionsToImprove[1];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill Development Plan</CardTitle>
          <CardDescription>
            Personalized recommendations to improve your game based on your CourtIQ analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-4">
              <Trophy className="h-6 w-6 mr-3 text-amber-500" />
              <h3 className="text-lg font-medium">Your Improvement Pathway</h3>
            </div>
            
            <p className="text-sm mb-4">
              Based on your CourtIQ analysis, we've identified the most effective ways to improve your overall performance. 
              Focus on developing these areas to see the biggest gains in your game.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary h-7 w-7 rounded-full flex items-center justify-center mr-3">
                  <span className="font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Prioritize {getDimensionDisplayName(weakestDimension.id)}</h4>
                  <p className="text-xs text-muted-foreground">Your biggest opportunity for improvement</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary h-7 w-7 rounded-full flex items-center justify-center mr-3">
                  <span className="font-medium">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Develop {getDimensionDisplayName(secondWeakestDimension.id)}</h4>
                  <p className="text-xs text-muted-foreground">Another area that will significantly impact your game</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary h-7 w-7 rounded-full flex items-center justify-center mr-3">
                  <span className="font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Maintain Your Strengths</h4>
                  <p className="text-xs text-muted-foreground">Keep utilizing your {getDimensionDisplayName(data.strongestArea)} advantage</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Recommended Training Focus</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RecommendedDrill 
                title="Targeted Skills Sessions" 
                description={`Work with a coach on ${getDimensionDisplayName(weakestDimension.id).toLowerCase()} development using focused drills.`} 
              />
              <RecommendedDrill 
                title="Competitive Scenario Practice" 
                description="Practice applying your skills in game-like situations with gradually increasing pressure." 
              />
              <RecommendedDrill 
                title="Video Analysis" 
                description="Record your matches and analyze specific aspects of your game with a coach or teammate." 
              />
              <RecommendedDrill 
                title="Structured Progression" 
                description="Follow a structured improvement plan with measurable goals for each dimension." 
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              <h3 className="text-lg font-medium">Next Level Milestone</h3>
            </div>
            
            {data.nextTier ? (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Medal className="h-5 w-5 mr-2" style={{ color: data.nextTier.colorCode }} />
                  <h4 className="font-medium" style={{ color: data.nextTier.colorCode }}>
                    {data.nextTier.name} Tier
                  </h4>
                </div>
                <p className="text-sm mb-2">
                  You're only <span className="font-medium">{data.nextTier.pointsNeeded.toFixed(1)} points</span> away 
                  from reaching the {data.nextTier.name} tier!
                </p>
                <div className="text-xs text-muted-foreground">
                  Focus on your improvement plan to reach this milestone faster.
                </div>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Medal className="h-5 w-5 mr-2 text-purple-500" />
                  <h4 className="font-medium">Elite Performance</h4>
                </div>
                <p className="text-sm">
                  You've reached the highest tier! Continue to refine your skills and maintain your elite performance.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Focus on two weakest dimensions */}
        <GrowthAreaCard 
          dimension={weakestDimension.id} 
          score={weakestDimension.score} 
          recommendations={getDimensionRecommendations(weakestDimension.id)}
        />
        <GrowthAreaCard 
          dimension={secondWeakestDimension.id} 
          score={secondWeakestDimension.score}
          recommendations={getDimensionRecommendations(secondWeakestDimension.id)} 
        />
      </div>
    </div>
  );
}