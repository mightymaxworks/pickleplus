/**
 * PKL-278651-UXPS-0003-CSV: Category Strength Visualization
 * Radar chart visualization of profile completion by category
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, Award } from "lucide-react";
import { cn } from '@/lib/utils';

interface CategoryStrengthProps {
  categoryCompletion: Record<string, number>;
  onEditRequest?: (category?: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  personal: '#FF5722',
  equipment: '#2196F3',
  playing: '#4CAF50',
  preferences: '#9C27B0',
  skills: '#FFC107',
  health: '#00BCD4',
};

// Category display names for better readability
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  personal: 'Personal',
  equipment: 'Equipment',
  playing: 'Playing Style',
  preferences: 'Preferences',
  skills: 'Skills',
  health: 'Health & Fitness',
};

export function CategoryStrengthVisualization({
  categoryCompletion,
  onEditRequest,
}: CategoryStrengthProps) {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Maximum value to use for the radar chart
  const maxValue = 100;
  
  // Get categories and their values
  const categories = Object.keys(categoryCompletion);
  const values = Object.values(categoryCompletion);

  // Skip rendering if no categories
  if (categories.length === 0) {
    return null;
  }

  // Calculate completed categories
  const completedCategories = Object.entries(categoryCompletion)
    .filter(([_, value]) => value === 100)
    .map(([category]) => category);

  // Find the weakest category
  const weakestCategory = Object.entries(categoryCompletion)
    .sort(([, a], [, b]) => a - b)[0]?.[0] || null;

  // Calculate the angles for each category
  const angleStep = (Math.PI * 2) / categories.length;
  
  // Size of the radar chart
  const chartSize = 220;
  const chartRadius = chartSize / 2 - 10; // Subtract padding
  const center = { x: chartSize / 2, y: chartSize / 2 };

  // Get the coordinates for a point at a certain angle and radius
  const getCoordinates = (angleIdx: number, radius: number) => {
    const angle = angleIdx * angleStep - Math.PI / 2; // Start from top (subtract 90 degrees)
    return {
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    };
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-[#FF5722]" />
            <span className="text-[#111]">Profile Strength</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs max-w-xs">
                  This chart shows how complete each category of your profile is.
                  Balanced players have strong completion across all areas.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Category completion strength visualization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Radar Chart */}
          <svg
            width={chartSize}
            height={chartSize}
            viewBox={`0 0 ${chartSize} ${chartSize}`}
            className="m-auto"
          >
            {/* Background grid lines - 4 levels at 25%, 50%, 75%, 100% */}
            {[0.25, 0.5, 0.75, 1].map((level) => (
              <polygon
                key={`grid-${level}`}
                points={categories
                  .map((_, i) => {
                    const { x, y } = getCoordinates(i, chartRadius * level);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#E5E5E5"
                strokeWidth="1"
                strokeDasharray={level < 1 ? "2 2" : ""}
              />
            ))}

            {/* Category axis lines */}
            {categories.map((_, i) => {
              const { x, y } = getCoordinates(i, chartRadius);
              return (
                <line
                  key={`axis-${i}`}
                  x1={center.x}
                  y1={center.y}
                  x2={x}
                  y2={y}
                  stroke="#E5E5E5"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Data polygon */}
            <motion.polygon
              points={categories
                .map((category, i) => {
                  const percentage = categoryCompletion[category] / maxValue;
                  const { x, y } = getCoordinates(i, chartRadius * percentage);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="rgba(255, 87, 34, 0.15)"
              stroke="#FF5722"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onAnimationComplete={() => setAnimationComplete(true)}
            />

            {/* Data points */}
            {categories.map((category, i) => {
              const percentage = categoryCompletion[category] / maxValue;
              const { x, y } = getCoordinates(i, chartRadius * percentage);
              const color = CATEGORY_COLORS[category] || "#FF5722";
              
              return (
                <motion.g
                  key={`point-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.3 }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={categoryCompletion[category] === 100 ? 6 : 4}
                    fill={color}
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => onEditRequest && onEditRequest(category)}
                  />
                  {categoryCompletion[category] === 100 && (
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={8}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={animationComplete ? {
                        opacity: [0.7, 0.3, 0.7],
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.g>
              );
            })}

            {/* Category labels */}
            {categories.map((category, i) => {
              const labelDistance = chartRadius + 20; // Slightly outside the chart
              const { x, y } = getCoordinates(i, labelDistance);
              const isLeft = x < center.x;
              const isTop = y < center.y;
              const isBottom = y > center.y + chartRadius / 2;
              
              // Adjust text positioning based on quadrant
              let textAnchor = "middle";
              let dy = "0.3em";
              
              if (isLeft) textAnchor = "end";
              if (!isLeft && !isTop && !isBottom) textAnchor = "start";
              if (isTop) dy = "1em";
              if (isBottom) dy = "-0.5em";
              
              return (
                <motion.g 
                  key={`label-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                >
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dy={dy}
                    className="text-xs font-medium fill-current text-slate-700"
                    onClick={() => onEditRequest && onEditRequest(category)}
                    style={{ cursor: "pointer" }}
                  >
                    {CATEGORY_DISPLAY_NAMES[category] || category}
                  </text>
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dy={isTop ? "2.2em" : isBottom ? "-1.5em" : "1.5em"}
                    className={cn(
                      "text-xs fill-current",
                      categoryCompletion[category] === 100 ? "text-green-600" : 
                      categoryCompletion[category] > 70 ? "text-blue-600" : 
                      "text-slate-500"
                    )}
                    onClick={() => onEditRequest && onEditRequest(category)}
                    style={{ cursor: "pointer" }}
                  >
                    {categoryCompletion[category]}%
                  </text>
                </motion.g>
              );
            })}
          </svg>

          {/* Summary */}
          <div className="w-full text-center mt-3 max-w-[280px] text-sm space-y-2">
            {completedCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="text-green-600 text-xs flex items-center justify-center"
              >
                <Award className="h-4 w-4 mr-1" />
                <span>
                  {completedCategories.length === 1 ? (
                    <>
                      Your <span className="font-medium">{CATEGORY_DISPLAY_NAMES[completedCategories[0]]}</span> profile is complete!
                    </>
                  ) : (
                    <>
                      {completedCategories.length} categories completed!
                    </>
                  )}
                </span>
              </motion.div>
            )}
            
            {weakestCategory && categoryCompletion[weakestCategory] < 50 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.5 }}
                className="text-amber-700 text-xs bg-amber-50 py-1 px-2 rounded-md"
              >
                Focus on your <span className="font-medium">{CATEGORY_DISPLAY_NAMES[weakestCategory]}</span> profile 
                to improve match quality
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}