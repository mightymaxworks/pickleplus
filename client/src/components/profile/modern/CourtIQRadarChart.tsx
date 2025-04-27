/**
 * PKL-278651-PROF-0015-COMP - CourtIQ Radar Chart
 * 
 * A radar chart visualization for CourtIQ dimensions.
 * Enhanced for Sprint 4 with improved visualization and support for
 * the DimensionRatings interface.
 * 
 * @framework Framework5.3
 * @version 1.1.0
 * @lastUpdated 2025-04-27
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { 
  type DimensionRatings,
  type CourtIQDimension 
} from "@/services/DataCalculationService";

// Map of dimension codes to full display names
const DIMENSION_DISPLAY_NAMES: Record<CourtIQDimension, string> = {
  'TECH': 'Technical Skills',
  'TACT': 'Tactical Awareness',
  'PHYS': 'Physical Fitness',
  'MENT': 'Mental Toughness',
  'CONS': 'Consistency'
};

// Map of dimension codes to descriptions for tooltips
const DIMENSION_DESCRIPTIONS: Record<CourtIQDimension, string> = {
  'TECH': 'Stroke mechanics, footwork, positioning, and technical execution',
  'TACT': 'Court awareness, shot selection, strategy, and game management',
  'PHYS': 'Agility, speed, endurance, and overall athletic capability',
  'MENT': 'Focus, resilience, competitive mindset, and pressure handling',
  'CONS': 'Reliable performance, minimizing errors, and maintaining level across matches'
};

interface CourtIQRadarChartProps {
  dimensions: DimensionRatings;
  previousDimensions?: DimensionRatings;
  className?: string;
}

export default function CourtIQRadarChart({ 
  dimensions,
  previousDimensions,
  className = "" 
}: CourtIQRadarChartProps) {
  const [radarData, setRadarData] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  
  // Transform dimension data to radar format
  useEffect(() => {
    // Check if we have previous dimensions to enable comparison mode
    const hasPrevious = previousDimensions && Object.keys(previousDimensions).length > 0;
    setComparisonMode(hasPrevious);
    
    // Create data array transforming our dimension codes to display names
    const newData = [
      { 
        dimension: DIMENSION_DISPLAY_NAMES.TECH, 
        value: dimensions.TECH, 
        fullMark: 5,
        previous: hasPrevious ? previousDimensions?.TECH : undefined,
        code: 'TECH' as CourtIQDimension
      },
      { 
        dimension: DIMENSION_DISPLAY_NAMES.TACT, 
        value: dimensions.TACT, 
        fullMark: 5,
        previous: hasPrevious ? previousDimensions?.TACT : undefined,
        code: 'TACT' as CourtIQDimension
      },
      { 
        dimension: DIMENSION_DISPLAY_NAMES.PHYS, 
        value: dimensions.PHYS, 
        fullMark: 5,
        previous: hasPrevious ? previousDimensions?.PHYS : undefined,
        code: 'PHYS' as CourtIQDimension
      },
      { 
        dimension: DIMENSION_DISPLAY_NAMES.MENT, 
        value: dimensions.MENT, 
        fullMark: 5,
        previous: hasPrevious ? previousDimensions?.MENT : undefined,
        code: 'MENT' as CourtIQDimension
      },
      { 
        dimension: DIMENSION_DISPLAY_NAMES.CONS, 
        value: dimensions.CONS, 
        fullMark: 5,
        previous: hasPrevious ? previousDimensions?.CONS : undefined,
        code: 'CONS' as CourtIQDimension
      },
    ];
    
    setRadarData(newData);
    setIsAnimating(true);
    
    // Reset animation after delay
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [dimensions, previousDimensions]);
  
  // Get change indicator icon based on current vs previous values
  const getChangeIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    
    const diff = current - previous;
    const threshold = 0.1; // Minimum difference to show change
    
    if (diff > threshold) {
      return <ChevronUp className="h-4 w-4 text-green-500" />;
    } else if (diff < -threshold) {
      return <ChevronDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Custom tooltip formatter
  const customTooltipFormatter = (value: number, name: string, props: any) => {
    if (name === 'value') {
      return [`${value.toFixed(1)}/5`, 'Current Rating'];
    } else if (name === 'previous') {
      return [`${value.toFixed(1)}/5`, 'Previous Rating'];
    }
    return [value, name];
  };
  
  // Function to get the player's strongest dimension
  const getStrongestDimension = (): CourtIQDimension => {
    const entries = Object.entries(dimensions).filter(([key]) => key !== 'overall') as [CourtIQDimension, number][];
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };
  
  // Function to get the player's improvement area (lowest dimension)
  const getImprovementArea = (): CourtIQDimension => {
    const entries = Object.entries(dimensions).filter(([key]) => key !== 'overall') as [CourtIQDimension, number][];
    return entries.sort((a, b) => a[1] - b[1])[0][0];
  };
  
  const strongestDimension = getStrongestDimension();
  const improvementArea = getImprovementArea();
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">CourtIQ™ Dimensions</CardTitle>
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute right-0 w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
              This chart shows your rating on the five CourtIQ™ dimensions on a scale of 1-5.
              Your overall CourtIQ rating is {dimensions.overall}.
            </div>
          </div>
        </div>
        <CardDescription>5-dimension performance analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 5]} 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px', 
                  color: 'var(--foreground)'
                }}
                formatter={customTooltipFormatter}
              />
              {comparisonMode && (
                <Radar
                  name="previous"
                  dataKey="previous"
                  stroke="var(--muted-foreground)"
                  fill="var(--muted-foreground)"
                  fillOpacity={0.2}
                  isAnimationActive={isAnimating}
                  animationDuration={1000}
                  animationBegin={0}
                  animationEasing="ease-out"
                  strokeDasharray="5 5"
                />
              )}
              <Radar
                name="value"
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.4}
                isAnimationActive={isAnimating}
                animationDuration={1000}
                animationBegin={0}
                animationEasing="ease-out"
              />
              {comparisonMode && (
                <Legend 
                  formatter={(value) => value === 'value' ? 'Current' : 'Previous'}
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {radarData.map((item) => {
            const dimCode = item.code as CourtIQDimension;
            return (
              <motion.div 
                key={dimCode}
                className="flex justify-between items-center text-sm p-2 rounded hover:bg-muted/50 group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'].indexOf(dimCode) * 0.1 }}
              >
                <div className="flex flex-col">
                  <span className="text-muted-foreground">{item.dimension}:</span>
                  <span className="text-xs text-muted-foreground hidden group-hover:block">
                    {DIMENSION_DESCRIPTIONS[dimCode]}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-1">{item.value.toFixed(1)}</span>
                  {getChangeIndicator(item.value, item.previous)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pt-2 border-t">
        <div className="w-full">
          <h4 className="text-sm font-medium mb-1">Performance Insights:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="font-medium">Strongest:</span> {DIMENSION_DISPLAY_NAMES[strongestDimension]}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <span className="font-medium">Improve:</span> {DIMENSION_DISPLAY_NAMES[improvementArea]}
            </Badge>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Overall Rating: <span className="font-semibold">{dimensions.overall}</span>
        </div>
      </CardFooter>
    </Card>
  );
}