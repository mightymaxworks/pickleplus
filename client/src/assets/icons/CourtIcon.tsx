/**
 * PKL-278651-COMM-0007-ICONS
 * CourtIcon Component
 * 
 * Custom SVG icon of a pickleball court with Framework 5.1 semantic identifiers
 * for testing and debugging.
 */
import React from 'react';
import { IconProps } from './PickleballIcon';

/**
 * A custom pickleball court icon component
 */
export const CourtIcon: React.FC<IconProps> = ({
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
      data-testid="court-icon"
      data-component="CourtIcon"
      {...props}
    >
      {/* Court outline */}
      <rect 
        x="2" 
        y="3" 
        width="20" 
        height="18" 
        fill={fill ? color + '10' : 'none'} 
        stroke={color}
      />
      
      {/* Center line */}
      <line 
        x1="12" 
        y1="3" 
        x2="12" 
        y2="21" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.8}
      />
      
      {/* Non-volley zone (kitchen) - left */}
      <rect 
        x="2" 
        y="9" 
        width="10" 
        height="6" 
        fill={fill ? color + '05' : 'none'} 
        stroke={color} 
        strokeDasharray={fill ? '' : '2,1'} 
        strokeWidth={strokeWidth * 0.8}
      />
      
      {/* Non-volley zone (kitchen) - right */}
      <rect 
        x="12" 
        y="9" 
        width="10" 
        height="6" 
        fill={fill ? color + '05' : 'none'} 
        stroke={color} 
        strokeDasharray={fill ? '' : '2,1'} 
        strokeWidth={strokeWidth * 0.8}
      />
      
      {/* Service lines - left side */}
      <line 
        x1="2" 
        y1="7" 
        x2="12" 
        y2="7" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      <line 
        x1="2" 
        y1="17" 
        x2="12" 
        y2="17" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      
      {/* Service lines - right side */}
      <line 
        x1="12" 
        y1="7" 
        x2="22" 
        y2="7" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      <line 
        x1="12" 
        y1="17" 
        x2="22" 
        y2="17" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      
      {/* Center service line - left */}
      <line 
        x1="7" 
        y1="7" 
        x2="7" 
        y2="9" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      <line 
        x1="7" 
        y1="15" 
        x2="7" 
        y2="17" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      
      {/* Center service line - right */}
      <line 
        x1="17" 
        y1="7" 
        x2="17" 
        y2="9" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      <line 
        x1="17" 
        y1="15" 
        x2="17" 
        y2="17" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.6}
      />
      
      {/* Net */}
      <line 
        x1="12" 
        y1="2" 
        x2="12" 
        y2="22" 
        stroke={color} 
        strokeWidth={strokeWidth * 0.8}
        strokeDasharray="0.5,0.5"
      />
    </svg>
  );
};

export default CourtIcon;