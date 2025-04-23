import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CourtIQDetailedAnalysis, getDimensionDescription, getDimensionDisplayName } from "@/hooks/use-courtiq-detailed-analysis";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper to render a tooltip with the dimension info
function DimensionInfo({ dimension }: { dimension: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 ml-1 inline cursor-help opacity-50 hover:opacity-100 transition-opacity" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{getDimensionDescription(dimension)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Dimension Card Component
function DimensionCard({ 
  dimension, 
  displayName, 
  score, 
  color
}: { 
  dimension: string; 
  displayName: string; 
  score: number; 
  color: string;
}) {
  // Convert score to percentage (1-5 scale to 0-100%)
  const percentage = ((score || 0) / 5) * 100;
  
  // Get description for this dimension
  const description = getDimensionDescription(dimension);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          {displayName}
          <DimensionInfo dimension={dimension} />
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{score.toFixed(1)}/5.0</span>
            <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CourtIQDimensionBreakdown({ data }: { data: CourtIQDetailedAnalysis }) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  
  // Convert dimension data to format needed for radar chart
  const radarData = [
    {
      dimension: "Technical",
      value: Math.min(100, Math.round((data.dimensions.technique.score / 5) * 100)),
      fullMark: 100,
    },
    {
      dimension: "Tactical",
      value: Math.min(100, Math.round((data.dimensions.strategy.score / 5) * 100)),
      fullMark: 100,
    },
    {
      dimension: "Consistency",
      value: Math.min(100, Math.round((data.dimensions.consistency.score / 5) * 100)),
      fullMark: 100,
    },
    {
      dimension: "Mental",
      value: Math.min(100, Math.round((data.dimensions.focus.score / 5) * 100)),
      fullMark: 100,
    },
    {
      dimension: "Power",
      value: Math.min(100, Math.round((data.dimensions.power.score / 5) * 100)),
      fullMark: 100,
    },
    {
      dimension: "Speed",
      value: Math.min(100, Math.round((data.dimensions.speed.score / 5) * 100)),
      fullMark: 100,
    },
  ];

  // Set up source colors for the radar chart
  const radarColor = data.tierColorCode || "#8B5CF6";
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill Dimensions Analysis</CardTitle>
          <CardDescription>
            Breakdown of your performance across the six core dimensions of pickleball play.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="flex justify-center items-center bg-muted/40 p-2 sm:p-4 rounded-lg min-h-[350px]">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="70%" 
                  data={radarData}
                  margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                >
                  <PolarGrid gridType="circle" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ 
                      fontSize: 12,
                      fill: 'currentColor',
                      // Use shorter dimension names on small screens
                      formatter: (value) => {
                        if (window.innerWidth < 768) {
                          const shortNames: Record<string, string> = {
                            "Technical": "Tech",
                            "Tactical": "Tact",
                            "Consistency": "Cons",
                            "Mental": "Ment",
                            "Power": "Pwr",
                            "Speed": "Spd"
                          };
                          return shortNames[value] || value;
                        }
                        return value;
                      } 
                    }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke={radarColor}
                    fill={radarColor}
                    fillOpacity={0.3}
                  />
                  <RechartsTooltip 
                    formatter={(value) => [`${value}%`, 'Rating']}
                    labelFormatter={(label) => `${label} Skills`}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Dimension Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DimensionCard 
                dimension="technique" 
                displayName="Technical Skills" 
                score={data.dimensions.technique.score}
                color="primary"
              />
              <DimensionCard 
                dimension="strategy" 
                displayName="Tactical Awareness" 
                score={data.dimensions.strategy.score}
                color="primary"
              />
              <DimensionCard 
                dimension="consistency" 
                displayName="Consistency" 
                score={data.dimensions.consistency.score}
                color="primary"
              />
              <DimensionCard 
                dimension="focus" 
                displayName="Mental Toughness" 
                score={data.dimensions.focus.score}
                color="primary"
              />
              <DimensionCard 
                dimension="power" 
                displayName="Power" 
                score={data.dimensions.power.score}
                color="primary"
              />
              <DimensionCard 
                dimension="speed" 
                displayName="Speed" 
                score={data.dimensions.speed.score}
                color="primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Skill Strengths & Weaknesses</CardTitle>
          <CardDescription>
            Analysis of your strongest and weakest playing attributes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-green-700 dark:text-green-400">
                  Strongest Area: {getDimensionDisplayName(data.strongestArea)}
                </CardTitle>
                <CardDescription>
                  This is your best developed skill, giving you an edge against opponents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {getDimensionDescription(data.strongestArea)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-amber-700 dark:text-amber-400">
                  Area for Improvement: {getDimensionDisplayName(data.weakestArea)}
                </CardTitle>
                <CardDescription>
                  Focus on developing this area to become a more well-rounded player.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {getDimensionDescription(data.weakestArea)}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}