/**
 * PKL-278651-COMM-0007-ICONS
 * PlayerRatingIcon Component
 * 
 * Custom SVG icon of a player rating indicator with Framework 5.1 semantic identifiers
 * for testing and debugging.
 */
import React from 'react';
import { IconProps } from './PickleballIcon';

/**
 * A custom player rating icon component
 */
export const PlayerRatingIcon: React.FC<IconProps> = ({
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
      data-testid="player-rating-icon"
      data-component="PlayerRatingIcon"
      {...props}
    >
      {/* Rating star */}
      <polygon 
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" 
        fill={fill ? color + '20' : 'none'} 
        stroke={color}
      />
      
      {/* Rating number */}
      <circle 
        cx="12" 
        cy="12" 
        r="5" 
        fill={fill ? 'white' : 'none'} 
        stroke={color}
      />
      
      {/* Rating decoration - for competitive visual */}
      <path 
        d="M12,7 L12,17 M9,10 L15,10 M9,14 L15,14" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.8}
      />
      
      {/* Rating level indicators */}
      <path 
        d="M4,12 C4,7.58 7.58,4 12,4" 
        stroke={color} 
        strokeDasharray="0.5,1.5" 
        strokeWidth={strokeWidth * 0.6}
      />
      <path 
        d="M20,12 C20,16.42 16.42,20 12,20" 
        stroke={color} 
        strokeDasharray="0.5,1.5" 
        strokeWidth={strokeWidth * 0.6}
      />
      
      {/* Level indicators at corners */}
      <circle cx="4" cy="4" r="0.7" fill={color} />
      <circle cx="20" cy="4" r="0.7" fill={color} />
      <circle cx="4" cy="20" r="0.7" fill={color} />
      <circle cx="20" cy="20" r="0.7" fill={color} />
    </svg>
  );
};

export default PlayerRatingIcon;