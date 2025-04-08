import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface RankingBadgeProps {
  tier: string;
  points: number;
  size?: 'sm' | 'md' | 'lg';
}

// Get tier colors and styles
function getTierStyles(tier: string) {
  switch(tier.toLowerCase()) {
    case 'bronze':
      return {
        bg: 'bg-gradient-to-r from-amber-700 to-amber-800',
        border: 'border-amber-600',
        text: 'text-amber-100'
      };
    case 'silver':
      return {
        bg: 'bg-gradient-to-r from-gray-300 to-gray-400',
        border: 'border-gray-300',
        text: 'text-gray-900'
      };
    case 'gold':
      return {
        bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
        border: 'border-yellow-300',
        text: 'text-yellow-900'
      };
    case 'platinum':
      return {
        bg: 'bg-gradient-to-r from-cyan-400 to-cyan-500',
        border: 'border-cyan-300',
        text: 'text-cyan-900'
      };
    case 'diamond':
      return {
        bg: 'bg-gradient-to-r from-blue-400 to-indigo-500',
        border: 'border-blue-300',
        text: 'text-white'
      };
    case 'master':
      return {
        bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
        border: 'border-purple-400',
        text: 'text-white'
      };
    case 'grandmaster':
      return {
        bg: 'bg-gradient-to-r from-red-500 to-red-600',
        border: 'border-red-400', 
        text: 'text-white'
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-700 to-gray-800',
        border: 'border-gray-600',
        text: 'text-gray-100'
      };
  }
}

export default function RankingBadge({ tier, points, size = 'md' }: RankingBadgeProps) {
  const styles = getTierStyles(tier);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-md px-3 py-1.5 font-semibold'
  };
  
  return (
    <Badge className={cn(
      "border-2 shadow-md",
      styles.bg,
      styles.border,
      styles.text,
      sizeClasses[size]
    )}>
      {tier} • {points} Points
    </Badge>
  );
}