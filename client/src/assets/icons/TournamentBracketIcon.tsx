/**
 * PKL-278651-COMM-0007-ICONS
 * TournamentBracketIcon Component
 * 
 * Custom SVG icon of a tournament bracket with Framework 5.1 semantic identifiers
 * for testing and debugging.
 */
import React from 'react';
import { IconProps } from './index';

/**
 * A custom tournament bracket icon component
 */
export const TournamentBracketIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 1.5,
  fill = false,
  ...props
}) => {
  // Fill style based on fill prop
  const fillStyle = fill ? color : 'none';
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fillStyle}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      data-testid="tournament-bracket-icon"
      data-component="TournamentBracketIcon"
      {...props}
    >
      {/* Bracket levels */}
      {/* First round - left side */}
      <line x1="2" y1="6" x2="6" y2="6" stroke={color} />
      <line x1="2" y1="10" x2="6" y2="10" stroke={color} />
      <line x1="2" y1="14" x2="6" y2="14" stroke={color} />
      <line x1="2" y1="18" x2="6" y2="18" stroke={color} />
      
      {/* First round - right side */}
      <line x1="18" y1="6" x2="22" y2="6" stroke={color} />
      <line x1="18" y1="10" x2="22" y2="10" stroke={color} />
      <line x1="18" y1="14" x2="22" y2="14" stroke={color} />
      <line x1="18" y1="18" x2="22" y2="18" stroke={color} />
      
      {/* Second round - left side */}
      <line x1="6" y1="6" x2="6" y2="10" stroke={color} />
      <line x1="6" y1="10" x2="10" y2="10" stroke={color} />
      <line x1="6" y1="14" x2="6" y2="18" stroke={color} />
      <line x1="6" y1="14" x2="10" y2="14" stroke={color} />
      
      {/* Second round - right side */}
      <line x1="18" y1="6" x2="18" y2="10" stroke={color} />
      <line x1="18" y1="10" x2="14" y2="10" stroke={color} />
      <line x1="18" y1="14" x2="18" y2="18" stroke={color} />
      <line x1="18" y1="14" x2="14" y2="14" stroke={color} />
      
      {/* Final round */}
      <line x1="10" y1="10" x2="10" y2="14" stroke={color} />
      <line x1="10" y1="12" x2="12" y2="12" stroke={color} />
      <line x1="14" y1="10" x2="14" y2="14" stroke={color} />
      <line x1="14" y1="12" x2="12" y2="12" stroke={color} />
      
      {/* Winner circle */}
      <circle cx="12" cy="12" r="1.5" fill={fill ? color : 'none'} stroke={color} />
      
      {/* Seed indicators */}
      <circle cx="3" cy="6" r="0.8" fill={color} />
      <circle cx="3" cy="10" r="0.8" fill={color} />
      <circle cx="3" cy="14" r="0.8" fill={color} />
      <circle cx="3" cy="18" r="0.8" fill={color} />
      <circle cx="21" cy="6" r="0.8" fill={color} />
      <circle cx="21" cy="10" r="0.8" fill={color} />
      <circle cx="21" cy="14" r="0.8" fill={color} />
      <circle cx="21" cy="18" r="0.8" fill={color} />
    </svg>
  );
};

export default TournamentBracketIcon;