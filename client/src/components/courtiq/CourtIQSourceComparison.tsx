import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { Info } from "lucide-react";
import { CourtIQDetailedAnalysis, getDimensionDisplayName } from "@/hooks/use-courtiq-detailed-analysis";
import { Badge } from "@/components/ui/badge";

export function CourtIQSourceComparison({ data }: { data: CourtIQDetailedAnalysis }) {
  // Check if we have source ratings data
  const hasSourceData = data.sourceRatings && (
    data.sourceRatings.self || 
    data.sourceRatings.opponent || 
    data.sourceRatings.coach
  );

  // If no source data is available yet
  if (!hasSourceData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Source Comparison: What Others Think</CardTitle>
          <CardDescription>
            See how your self-assessment compares to feedback from opponents and coaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
            <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-2">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No comparison data yet</h3>
            <p className="text-muted-foreground max-w-md">
              Source comparison will be available once you have ratings from multiple sources.
              Complete self-assessments and get feedback from opponents and coaches.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="flex items-center p-2 border rounded-md border-border">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6] mr-2"></div>
                <span className="text-sm">Self Assessment</span>
              </div>
              <div className="flex items-center p-2 border rounded-md border-border">
                <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></div>
                <span className="text-sm">Opponent Feedback</span>
              </div>
              <div className="flex items-center p-2 border rounded-md border-border">
                <div className="w-3 h-3 rounded-full bg-[#22c55e] mr-2"></div>
                <span className="text-sm">Coach Evaluation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the radar chart
  const radarData = [
    {
      dimension: "Technical",
      self: data.sourceRatings?.self?.technique || 0,
      opponent: data.sourceRatings?.opponent?.technique || 0,
      coach: data.sourceRatings?.coach?.technique || 0,
    },
    {
      dimension: "Tactical",
      self: data.sourceRatings?.self?.strategy || 0,
      opponent: data.sourceRatings?.opponent?.strategy || 0,
      coach: data.sourceRatings?.coach?.strategy || 0,
    },
    {
      dimension: "Consistency",
      self: data.sourceRatings?.self?.consistency || 0,
      opponent: data.sourceRatings?.opponent?.consistency || 0,
      coach: data.sourceRatings?.coach?.consistency || 0,
    },
    {
      dimension: "Mental",
      self: data.sourceRatings?.self?.focus || 0,
      opponent: data.sourceRatings?.opponent?.focus || 0,
      coach: data.sourceRatings?.coach?.focus || 0,
    },
    {
      dimension: "Power",
      self: data.sourceRatings?.self?.power || 0,
      opponent: data.sourceRatings?.opponent?.power || 0,
      coach: data.sourceRatings?.coach?.power || 0,
    },
    {
      dimension: "Speed",
      self: data.sourceRatings?.self?.speed || 0,
      opponent: data.sourceRatings?.opponent?.speed || 0,
      coach: data.sourceRatings?.coach?.speed || 0,
    },
  ];

  // Prepare data for the bar chart comparison
  const getBarData = () => {
    return [
      {
        name: "Technical",
        self: data.sourceRatings?.self?.technique || 0,
        opponent: data.sourceRatings?.opponent?.technique || 0,
        coach: data.sourceRatings?.coach?.technique || 0,
      },
      {
        name: "Tactical",
        self: data.sourceRatings?.self?.strategy || 0,
        opponent: data.sourceRatings?.opponent?.strategy || 0,
        coach: data.sourceRatings?.coach?.strategy || 0,
      },
      {
        name: "Consistency",
        self: data.sourceRatings?.self?.consistency || 0,
        opponent: data.sourceRatings?.opponent?.consistency || 0,
        coach: data.sourceRatings?.coach?.consistency || 0,
      },
      {
        name: "Mental",
        self: data.sourceRatings?.self?.focus || 0,
        opponent: data.sourceRatings?.opponent?.focus || 0,
        coach: data.sourceRatings?.coach?.focus || 0,
      },
      {
        name: "Power",
        self: data.sourceRatings?.self?.power || 0,
        opponent: data.sourceRatings?.opponent?.power || 0,
        coach: data.sourceRatings?.coach?.power || 0,
      },
      {
        name: "Speed",
        self: data.sourceRatings?.self?.speed || 0,
        opponent: data.sourceRatings?.opponent?.speed || 0,
        coach: data.sourceRatings?.coach?.speed || 0,
      },
    ];
  };

  // Get available sources for the legend
  const availableSources = [];
  if (data.sourceRatings?.self) availableSources.push("Self");
  if (data.sourceRatings?.opponent) availableSources.push("Opponent");
  if (data.sourceRatings?.coach) availableSources.push("Coach");

  // Helper to find perception gaps
  const findPerceptionGaps = () => {
    const gaps = [];
    const dimensions = ["technique", "strategy", "consistency", "focus", "power", "speed"];
    const dimensionMap = {
      technique: "Technical Skills",
      strategy: "Tactical Awareness",
      consistency: "Consistency",
      focus: "Mental Toughness",
      power: "Power",
      speed: "Speed"
    };
    
    for (const dim of dimensions) {
      const sources = [] as {source: string, value: number}[];
      
      if (data.sourceRatings?.self && data.sourceRatings.self[dim as keyof typeof data.sourceRatings.self] !== undefined) {
        sources.push({
          source: "Self",
          value: data.sourceRatings.self[dim as keyof typeof data.sourceRatings.self] as number
        });
      }
      
      if (data.sourceRatings?.opponent && data.sourceRatings.opponent[dim as keyof typeof data.sourceRatings.opponent] !== undefined) {
        sources.push({
          source: "Opponent",
          value: data.sourceRatings.opponent[dim as keyof typeof data.sourceRatings.opponent] as number
        });
      }
      
      if (data.sourceRatings?.coach && data.sourceRatings.coach[dim as keyof typeof data.sourceRatings.coach] !== undefined) {
        sources.push({
          source: "Coach",
          value: data.sourceRatings.coach[dim as keyof typeof data.sourceRatings.coach] as number
        });
      }
      
      // Need at least two sources to compare
      if (sources.length >= 2) {
        // Sort by value
        sources.sort((a, b) => b.value - a.value);
        
        // If the gap between highest and lowest is significant (>20%)
        if (sources[0].value - sources[sources.length - 1].value > 20) {
          gaps.push({
            dimension: dimensionMap[dim as keyof typeof dimensionMap],
            highest: sources[0],
            lowest: sources[sources.length - 1],
            gap: sources[0].value - sources[sources.length - 1].value
          });
        }
      }
    }
    
    // Sort gaps by size (largest first)
    return gaps.sort((a, b) => b.gap - a.gap);
  };

  const perceptionGaps = findPerceptionGaps();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Source Comparison: What Others Think</CardTitle>
          <CardDescription>
            Compare how you're rated by yourself, opponents, and coaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {availableSources.map(source => (
              <Badge key={source} variant={
                source === "Self" ? "outline" : 
                source === "Opponent" ? "secondary" :
                "default"
              }>
                {source} Assessment
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3 text-center">Radar Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart 
                  cx="50%" 
                  cy="50%" 
                  outerRadius="70%" 
                  data={radarData}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <PolarGrid gridType="circle" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ 
                      fontSize: 11,
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
                  
                  {data.sourceRatings?.self && (
                    <Radar
                      name="Self Assessment"
                      dataKey="self"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.2}
                    />
                  )}
                  
                  {data.sourceRatings?.opponent && (
                    <Radar
                      name="Opponent Assessment"
                      dataKey="opponent"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.2}
                    />
                  )}
                  
                  {data.sourceRatings?.coach && (
                    <Radar
                      name="Coach Assessment"
                      dataKey="coach"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.2}
                    />
                  )}
                  
                  <Legend 
                    iconSize={10}
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '10px'
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Rating']}
                    labelFormatter={(label) => `${label} Skills`}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3 text-center">Bar Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={getBarData()}
                  margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  layout={window.innerWidth < 640 ? "vertical" : "horizontal"}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  {window.innerWidth < 640 ? (
                    <>
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        width={50}
                        tick={{
                          fontSize: 11,
                          formatter: (value) => {
                            const shortNames: Record<string, string> = {
                              "Technical": "Tech",
                              "Tactical": "Tact",
                              "Consistency": "Cons",
                              "Mental": "Mental",
                              "Power": "Power",
                              "Speed": "Speed"
                            };
                            return shortNames[value] || value;
                          }
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                    </>
                  )}
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Rating']}
                  />
                  <Legend 
                    iconSize={10}
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '10px'
                    }}
                  />
                  
                  {data.sourceRatings?.self && (
                    <Bar dataKey="self" name="Self Assessment" fill="#8b5cf6" />
                  )}
                  
                  {data.sourceRatings?.opponent && (
                    <Bar dataKey="opponent" name="Opponent Assessment" fill="#ef4444" />
                  )}
                  
                  {data.sourceRatings?.coach && (
                    <Bar dataKey="coach" name="Coach Assessment" fill="#22c55e" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {perceptionGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Perception Gaps</CardTitle>
            <CardDescription>
              Areas where different assessors have significantly different views of your skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {perceptionGaps.map((gap, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium mb-1">{gap.dimension}</h3>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{gap.highest.source}</span> rates you{' '}
                        <span className="text-green-600 dark:text-green-400 font-medium">{gap.highest.value}%</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">{gap.lowest.source}</span> rates you{' '}
                        <span className="text-amber-600 dark:text-amber-400 font-medium">{gap.lowest.value}%</span>
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded-md text-sm">
                      <span className="font-medium">{gap.gap}%</span> perception gap
                    </div>
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