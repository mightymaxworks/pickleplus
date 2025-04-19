/**
 * PKL-278651-XP-0005-ACHIEVE
 * Progress Circle Component
 * 
 * A circular progress indicator component used throughout the XP and achievement system.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export function ProgressCircle({
  value,
  size = 40,
  strokeWidth = 4,
  className,
  backgroundColor = 'transparent',
  children,
  ...props
}: ProgressCircleProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Calculate radius and circumference
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  return (
    <div 
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          className="text-muted-foreground/20"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={backgroundColor}
          strokeWidth={strokeWidth}
          stroke="currentColor"
        />
        
        {/* Progress circle */}
        <circle
          className="transition-all duration-300 ease-in-out"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </svg>
      
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default ProgressCircle;