import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Skill {
  name: string;
  value: number;
  color: string;
}

interface AnimatedRadarChartProps {
  skills: Skill[];
  size?: number;
  strokeWidth?: number;
  background?: string;
  showLabels?: boolean;
  showLegend?: boolean;
  className?: string;
  delay?: number;
}

export function AnimatedRadarChart({
  skills,
  size = 300,
  strokeWidth = 2,
  background = 'rgba(255, 255, 255, 0.1)',
  showLabels = true,
  showLegend = false,
  className = '',
  delay = 0.5,
}: AnimatedRadarChartProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4; // Leave room for labels
  const skillCount = skills.length;
  
  // Calculate points for each skill
  const getSkillPoints = (animatedValue = 1) => {
    return skills.map((skill, i) => {
      const angle = (Math.PI * 2 * i) / skillCount - Math.PI / 2;
      const value = skill.value * animatedValue / 100; // Normalize to 0-1
      const x = centerX + radius * value * Math.cos(angle);
      const y = centerY + radius * value * Math.sin(angle);
      return { x, y, angle, skill };
    });
  };
  
  const getSkillAxis = () => {
    return skills.map((_, i) => {
      const angle = (Math.PI * 2 * i) / skillCount - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y };
    });
  };
  
  const getPolygonPoints = (points: { x: number; y: number }[]) => {
    return points.map(point => `${point.x},${point.y}`).join(' ');
  };
  
  // Trigger animation after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const axisPoints = getSkillAxis();
  const skillPoints = getSkillPoints(isLoaded ? 1 : 0);
  
  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={radius} 
          fill={background} 
          stroke="#ddd" 
          strokeWidth="1" 
          strokeDasharray="4,4" 
        />
        
        {/* Axis lines */}
        {axisPoints.map((point, i) => (
          <line 
            key={`axis-${i}`}
            x1={centerX}
            y1={centerY}
            x2={point.x}
            y2={point.y}
            stroke="#ddd"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}
        
        {/* Skill labels */}
        {showLabels && axisPoints.map((point, i) => {
          const skill = skills[i];
          const labelOffsetX = 10 * Math.cos(skillPoints[i].angle);
          const labelOffsetY = 10 * Math.sin(skillPoints[i].angle);
          
          return (
            <motion.text 
              key={`label-${i}`}
              x={point.x + labelOffsetX}
              y={point.y + labelOffsetY}
              fontSize="10"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={skill.color}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + i * 0.1, duration: 0.5 }}
            >
              {skill.name}
            </motion.text>
          );
        })}
        
        {/* Skill polygon */}
        <motion.polygon
          points={getPolygonPoints(skillPoints)}
          fill="url(#radarGradient)"
          fillOpacity="0.3"
          stroke="url(#radarGradient)"
          strokeWidth={strokeWidth}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0 }}
          transition={{ delay: delay, duration: 0.8 }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#673AB7" />
            <stop offset="100%" stopColor="#9C27B0" />
          </linearGradient>
        </defs>
        
        {/* Skill points */}
        {skillPoints.map((point, i) => (
          <motion.circle 
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={skills[i].color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0 }}
            transition={{ delay: delay + 0.3 + i * 0.1, duration: 0.5 }}
          />
        ))}
        
        {/* Center point */}
        <motion.circle 
          cx={centerX}
          cy={centerY}
          r={5}
          fill="url(#radarGradient)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0 }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
        />
      </svg>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {skills.map((skill, i) => (
            <motion.div 
              key={`legend-${i}`}
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.5 + i * 0.1, duration: 0.5 }}
            >
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: skill.color }}
              />
              <span className="text-xs">{skill.name}: {skill.value}%</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}