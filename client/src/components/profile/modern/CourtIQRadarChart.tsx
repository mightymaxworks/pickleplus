/**
 * PKL-278651-PROF-0015-COMP - CourtIQ Radar Chart
 * 
 * A radar chart visualization for CourtIQ dimensions.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
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
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Info } from "lucide-react";
import { type CourtIQMetrics } from "@/services/DataCalculationService";

interface CourtIQRadarChartProps {
  dimensions: CourtIQMetrics;
  className?: string;
}

export default function CourtIQRadarChart({ 
  dimensions,
  className = "" 
}: CourtIQRadarChartProps) {
  const [radarData, setRadarData] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Transform dimension data to radar format
  useEffect(() => {
    const newData = [
      { dimension: 'Technical Skills', value: dimensions.technical, fullMark: 5 },
      { dimension: 'Tactical Awareness', value: dimensions.tactical, fullMark: 5 },
      { dimension: 'Physical Fitness', value: dimensions.physical, fullMark: 5 },
      { dimension: 'Mental Toughness', value: dimensions.mental, fullMark: 5 },
      { dimension: 'Consistency', value: dimensions.consistency, fullMark: 5 },
    ];
    
    setRadarData(newData);
    setIsAnimating(true);
    
    // Reset animation after delay
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [dimensions]);
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">CourtIQ™ Dimensions</CardTitle>
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute right-0 w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
              This chart shows your rating on the five CourtIQ™ dimensions on a scale of 1-5.
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
                formatter={(value: number) => [`${value.toFixed(1)}/5`, 'Rating']}
              />
              <Radar
                name="CourtIQ Rating"
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.4}
                isAnimationActive={isAnimating}
                animationDuration={1000}
                animationBegin={0}
                animationEasing="ease-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {Object.entries(dimensions).map(([key, value]) => {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <motion.div 
                key={key}
                className="flex justify-between text-sm p-2 rounded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: ['technical', 'tactical', 'physical', 'mental', 'consistency'].indexOf(key) * 0.1 }}
              >
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-medium">{value.toFixed(1)}</span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}