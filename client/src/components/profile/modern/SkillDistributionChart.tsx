/**
 * PKL-278651-PROF-0019-COMP - Skill Distribution Chart
 * 
 * An animated bar chart showing skill distribution across different aspects.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-26
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import { EnhancedUser } from "@/types/enhanced-user";

interface SkillDistributionChartProps {
  user: EnhancedUser;
  className?: string;
}

interface SkillData {
  name: string;
  value: number;
  color: string;
  description: string;
}

export default function SkillDistributionChart({
  user,
  className = ""
}: SkillDistributionChartProps) {
  const [chartData, setChartData] = useState<SkillData[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Generate chart data from user skills
  useEffect(() => {
    // Define colors for different skill categories
    const colors = {
      offensive: "var(--primary)",
      defensive: "var(--cyan-600)",
      technical: "var(--amber-500)",
      strategic: "var(--violet-500)",
      physical: "var(--emerald-500)"
    };
    
    // Create skill data array with user values or defaults
    const skills: SkillData[] = [
      {
        name: "Forehand",
        value: user.forehandStrength || 3,
        color: colors.offensive,
        description: "Power and accuracy of forehand shots"
      },
      {
        name: "Backhand",
        value: user.backhandStrength || 3,
        color: colors.offensive,
        description: "Control and consistency of backhand shots"
      },
      {
        name: "Serve",
        value: user.servePower || 3,
        color: colors.technical,
        description: "Speed and placement of serves"
      },
      {
        name: "Dink",
        value: user.dinkAccuracy || 3,
        color: colors.technical,
        description: "Soft game control at the kitchen line"
      },
      {
        name: "3rd Shot",
        value: user.thirdShotConsistency || 3,
        color: colors.strategic,
        description: "Effectiveness of third shot strategy"
      },
      {
        name: "Coverage",
        value: user.courtCoverage || 3,
        color: colors.physical,
        description: "Court movement and positioning"
      }
    ];
    
    setChartData(skills);
    setIsAnimating(true);
    
    // Reset animation after delay
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [user]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">{data.description}</p>
          <p className="text-sm font-bold">Rating: {data.value}/5</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Skill Distribution</CardTitle>
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute right-0 w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
              This chart shows your rating across different skill categories on a scale of 1-5.
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
              barSize={36}
              layout="vertical"
            >
              <XAxis 
                type="number" 
                domain={[0, 5]} 
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                isAnimationActive={isAnimating}
                animationDuration={1500}
                animationBegin={0}
                animationEasing="ease-out"
                onMouseEnter={(data) => setSelectedSkill(data as SkillData)}
                onMouseLeave={() => setSelectedSkill(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    opacity={selectedSkill && selectedSkill.name !== entry.name ? 0.5 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-3 gap-2">
          {chartData.map((skill, index) => (
            <motion.div 
              key={index}
              className="flex items-center gap-2 text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onMouseEnter={() => setSelectedSkill(skill)}
              onMouseLeave={() => setSelectedSkill(null)}
            >
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: skill.color }}
              />
              <span 
                className={selectedSkill?.name === skill.name ? 
                  "font-medium" : "text-muted-foreground"}
              >
                {skill.name}
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}